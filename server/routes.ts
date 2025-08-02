import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import ExcelJS from "exceljs";
import * as fs from 'fs';
import { storage } from "./storage";
import { distributionService } from "./distributionService";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { importPatternData } from './patternImporter';
import { analyzeExcelStructure, suggestColumnMapping } from './excelAnalyzer';
import { insertWorkOrderSchema, insertChatMessageSchema, insertNotificationSchema, insertTeamMemberSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Development middleware to bypass auth
const devAuthMiddleware = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    req.user = {
      claims: {
        sub: 'dev-user-1',
        email: 'dev@maffeng.com'
      }
    };
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  try {
    await setupAuth(app);
  } catch (error) {
    console.warn("Auth setup failed, using development mode:", error instanceof Error ? error.message : 'Unknown error');
  }

  // Auth routes with fallback for development
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Development fallback user when auth is not working
      if (process.env.NODE_ENV === 'development') {
        const devUser = {
          id: 'dev-user-1',
          email: 'dev@maffeng.com',
          firstName: 'Developer',
          lastName: 'User',
          profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80',
          userLevel: 'DEV',
          position: 'Lead Developer',
          location: 'Development Environment',
          department: 'Engineering',
          phone: '+55 (11) 99999-9999',
          bio: 'Development user for testing purposes',
          isActive: true,
          showInTeam: true,
          isDev: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return res.json(devUser);
      }

      if (!req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', devAuthMiddleware, async (req: any, res) => {
    try {
      const filters = req.query;
      const metrics = await storage.getDashboardMetrics(filters);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get('/api/dashboard/status-distribution', devAuthMiddleware, async (req: any, res) => {
    try {
      const filters = req.query;
      const distribution = await storage.getStatusDistribution(filters);
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching status distribution:", error);
      res.status(500).json({ message: "Failed to fetch status distribution" });
    }
  });

  app.get('/api/dashboard/technician-stats', devAuthMiddleware, async (req: any, res) => {
    try {
      const filters = req.query;
      const stats = await storage.getTechnicianStats(filters);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching technician stats:", error);
      res.status(500).json({ message: "Failed to fetch technician stats" });
    }
  });

  app.get('/api/dashboard/recent-activity', devAuthMiddleware, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  app.get('/api/dashboard/monthly-trends', devAuthMiddleware, async (req: any, res) => {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const trends = await storage.getMonthlyTrends(months);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching monthly trends:", error);
      res.status(500).json({ message: "Failed to fetch monthly trends" });
    }
  });

  app.get('/api/dashboard/priority-distribution', devAuthMiddleware, async (req: any, res) => {
    try {
      const filters = req.query;
      const distribution = await storage.getPriorityDistribution(filters);
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching priority distribution:", error);
      res.status(500).json({ message: "Failed to fetch priority distribution" });
    }
  });

  // Work Orders routes
  app.get('/api/work-orders', devAuthMiddleware, async (req: any, res) => {
    try {
      const filters = req.query;
      const workOrders = await storage.getWorkOrders(filters);
      res.json(workOrders);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      res.status(500).json({ message: "Failed to fetch work orders" });
    }
  });

  app.get('/api/work-orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const workOrder = await storage.getWorkOrder(id);
      if (!workOrder) {
        return res.status(404).json({ message: "Work order not found" });
      }
      res.json(workOrder);
    } catch (error) {
      console.error("Error fetching work order:", error);
      res.status(500).json({ message: "Failed to fetch work order" });
    }
  });

  app.post('/api/work-orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workOrderData = insertWorkOrderSchema.parse({
        ...req.body,
        createdBy: userId
      });
      const workOrder = await storage.createWorkOrder(workOrderData);
      res.status(201).json(workOrder);
    } catch (error) {
      console.error("Error creating work order:", error);
      res.status(500).json({ message: "Failed to create work order" });
    }
  });

  app.patch('/api/work-orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const workOrder = await storage.updateWorkOrder(id, req.body);
      res.json(workOrder);
    } catch (error) {
      console.error("Error updating work order:", error);
      res.status(500).json({ message: "Failed to update work order" });
    }
  });

  // Excel Import route - PREVENTIVAS Template
  app.post('/api/work-orders/import', devAuthMiddleware, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo foi enviado" });
      }

      const userId = req.user?.claims?.sub || 'dev-user-1';
      const fileName = req.file.originalname.toLowerCase();
      
      let worksheet: any;
      
      if (fileName.endsWith('.csv')) {
        // Handle CSV files
        const csvContent = req.file.buffer.toString('utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        // Create a mock worksheet object for CSV
        worksheet = {
          eachRow: (callback: (row: any, rowNumber: number) => void) => {
            lines.forEach((line, index) => {
              const values = ['', ...line.split(',').map(cell => cell.replace(/"/g, '').trim())];
              callback({ values }, index + 1);
            });
          }
        };
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Handle Excel files
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        
        worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
          return res.status(400).json({ message: "Planilha não encontrada no arquivo" });
        }
      } else {
        return res.status(400).json({ 
          message: "Formato de arquivo não suportado. Use .xlsx, .xls ou .csv" 
        });
      }

      const workOrders: any[] = [];
      const errors: string[] = [];
      let processedRows = 0;

      // Standard PREVENTIVAS Excel template mapping
      // Expected columns: OS, Descrição, Equipamento, Local, Data Agendada, Prioridade, Técnico, etc.
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        
        try {
          const values = row.values as any[];
          
          // Skip empty rows - check for actual OS number  
          if (!values || values.length < 4 || !values[3]) return;
          
          // Extract data from new PREVENTIVAS format
          // Column mapping based on actual file structure:
          // 1-Responsável, 2-DATA LEVANT RELATÓRIO, 3-CONTRATO, 4-OS, 5-PREF, 6-AGÊNCIA, 7-VALOR, 8-VENCIMENTO, 9-SITUAÇÃO, 10-TÉCNICO, 11-AGENDAMENTO, 12-DIFICULDADE, 13-STATUS
          
          const responsible = values[0]?.toString()?.trim() || '';
          const reportDate = values[1]; // DATA LEVANT RELATÓRIO
          const contract = values[2]?.toString()?.trim() || '';
          let osNumber = values[3]?.toString()?.trim();
          const pref = values[4]?.toString()?.trim() || '';
          const agency = values[5]?.toString()?.trim() || ''; // AGÊNCIA
          const value = values[6]?.toString()?.trim() || '';
          const dueDate = values[7]; // VENCIMENTO
          const situation = values[8]?.toString()?.trim() || ''; // SITUAÇÃO
          const technician = values[9]?.toString()?.trim() || ''; // TÉCNICO
          const scheduling = values[10]?.toString()?.trim() || ''; // AGENDAMENTO
          const difficulty = values[11]?.toString()?.trim() || ''; // DIFICULDADE
          const status = values[12]?.toString()?.trim() || 'PENDENTE'; // STATUS
          
          // Generate OS number if missing
          if (!osNumber || osNumber === '' || osNumber === 'OS') {
            osNumber = `PREV-${Date.now()}-${rowNumber}`;
          }
          
          // Create description combining available info
          const description = `${situation} - ${agency} - ${pref}`.replace(/^[\s-]+|[\s-]+$/g, '');
          const equipmentName = agency || `Equipamento ${osNumber}`;
          const location = contract || 'Local não especificado';
          let scheduledDate: Date | null = null;
          
          // Parse due date from VENCIMENTO column (index 7)
          if (dueDate && dueDate instanceof Date) {
            scheduledDate = dueDate;
          } else if (dueDate) {
            const dateStr = dueDate.toString();
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              scheduledDate = parsedDate;
            }
          }
          
          // Parse priority based on STATUS and DIFICULDADE
          let priority = 'MEDIA';
          if (status && status.toLowerCase().includes('urgente') || 
              difficulty && difficulty.toLowerCase().includes('alta')) {
            priority = 'ALTA';
          } else if (status && status.toLowerCase().includes('baixa') ||
                     difficulty && difficulty.toLowerCase().includes('baixa')) {
            priority = 'BAIXA';
          }
          
          // Map STATUS to our system status
          let mappedStatus = 'PENDENTE';
          if (status) {
            const statusLower = status.toLowerCase();
            if (statusLower.includes('concluida') || statusLower.includes('finalizada')) {
              mappedStatus = 'CONCLUIDA';
            } else if (statusLower.includes('agendada') || statusLower.includes('agendamento')) {
              mappedStatus = 'AGENDADA';
            } else if (statusLower.includes('vencida') || statusLower.includes('atrasada')) {
              mappedStatus = 'VENCIDA';
            }
          }

          // Find technician by name for assignment
          let technicianId: number | null = null;
          
          // Generate title from situation and agency
          const title = description || `${situation} - ${agency}` || `OS ${osNumber}`;
          
          const workOrder = {
            osNumber: osNumber,
            title: title.substring(0, 255), // Limit title length
            description: description,
            equipmentName: equipmentName,
            location: location,
            priority: priority,
            status: mappedStatus,
            scheduledDate: scheduledDate,
            technicianId: technicianId,
            createdBy: userId
          };
          
          workOrders.push(workOrder);
          processedRows++;
          
        } catch (rowError) {
          const errorMessage = rowError instanceof Error ? rowError.message : 'Erro desconhecido';
          errors.push(`Linha ${rowNumber}: ${errorMessage}`);
          console.error(`Error processing row ${rowNumber}:`, rowError);
        }
      });

      if (workOrders.length === 0) {
        return res.status(400).json({ 
          message: "Nenhuma OS válida encontrada na planilha",
          errors: errors 
        });
      }

      // Import work orders to database
      const importedWorkOrders = await storage.importWorkOrders(workOrders);
      
      // Create success notification
      await storage.createNotification({
        userId,
        title: 'Importação de OS Concluída',
        message: `${importedWorkOrders.length} Ordens de Serviço foram importadas com sucesso`,
        type: 'SUCCESS'
      });

      res.json({ 
        message: "Importação concluída com sucesso", 
        count: importedWorkOrders.length,
        processedRows: processedRows,
        errors: errors.length > 0 ? errors : undefined,
        workOrders: importedWorkOrders.map(wo => ({
          id: wo.id,
          osNumber: wo.osNumber,
          title: wo.title,
          status: wo.status
        }))
      });
      
    } catch (error) {
      console.error("Error importing work orders:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Create error notification
      try {
        await storage.createNotification({
          userId: req.user?.claims?.sub || 'dev-user-1',
          title: 'Erro na Importação',
          message: `Falha ao importar planilha: ${errorMessage}`,
          type: 'ERROR'
        });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
      
      res.status(500).json({ 
        message: "Falha ao importar planilha", 
        error: errorMessage 
      });
    }
  });

  // Import pattern data route
  app.post('/api/import-patterns', devAuthMiddleware, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo fornecido" });
      }

      // Process CSV data directly from buffer
      const csvContent = req.file.buffer.toString('latin1');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      let techniciansCount = 0;
      let elaboratorsCount = 0;
      let contractsCount = 0;

      for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (!line) continue;
        
        const [name, category] = line.split(';').map(s => s.trim());
        
        if (!name || !category) continue;

        try {
          if (category.toLowerCase().includes('técnico') || category.toLowerCase().includes('tcnico')) {
            // Check if technician already exists
            const existingTechnicians = await storage.getTechnicians();
            const exists = existingTechnicians.some(t => t.name.toLowerCase() === name.toLowerCase());
            
            if (!exists) {
              await storage.createTechnician({
                name: name,
                active: true,
                maxConcurrentTasks: 5
              });
              techniciansCount++;
            }
          } 
          else if (category.toLowerCase().includes('elaborador') || category.toLowerCase().includes('responsável')) {
            // Check if elaborator already exists
            const existingTechnicians = await storage.getTechnicians();
            const exists = existingTechnicians.some(t => t.name.toLowerCase() === name.toLowerCase());
            
            if (!exists) {
              await storage.createTechnician({
                name: name,
                active: true,
                maxConcurrentTasks: 3
              });
              elaboratorsCount++;
            }
          }
          else if (category.toLowerCase().includes('contrato')) {
            // Check if contract already exists
            const existingContracts = await storage.getContracts();
            const exists = existingContracts.some(c => c.name.toLowerCase() === name.toLowerCase());
            
            if (!exists) {
              await storage.createContract({
                name: name,
                description: 'Contrato de Manutenção Preventiva',
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                active: true
              });
              contractsCount++;
            }
          }
        } catch (error) {
          console.error(`Error importing ${name} (${category}):`, error);
        }
      }

      res.json({
        message: "Padrões importados com sucesso",
        imported: { technicians: techniciansCount, elaborators: elaboratorsCount, contracts: contractsCount }
      });

    } catch (error) {
      console.error("Error importing patterns:", error);
      res.status(500).json({ 
        message: "Falha ao importar padrões", 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });

  // Excel structure analysis route
  app.post('/api/analyze-excel', devAuthMiddleware, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo fornecido" });
      }

      // Save uploaded file temporarily for analysis
      const tempPath = `/tmp/excel_analysis_${Date.now()}.xlsx`;
      fs.writeFileSync(tempPath, req.file.buffer);

      // Analyze Excel structure
      const analysis = await analyzeExcelStructure(tempPath);
      const suggestedMapping = suggestColumnMapping(analysis.columns);

      // Clean up temp file
      fs.unlinkSync(tempPath);

      res.json({
        message: "Análise concluída",
        analysis: {
          ...analysis,
          suggestedMapping
        }
      });

    } catch (error) {
      console.error("Error analyzing Excel:", error);
      res.status(500).json({ 
        message: "Falha ao analisar planilha", 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });

  // Technicians routes
  app.get('/api/technicians', devAuthMiddleware, async (req: any, res) => {
    try {
      const technicians = await storage.getTechnicians();
      res.json(technicians);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      res.status(500).json({ message: "Failed to fetch technicians" });
    }
  });

  // Contracts routes
  app.get('/api/contracts', devAuthMiddleware, async (req: any, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  // Report Elaborators routes
  app.get('/api/report-elaborators', devAuthMiddleware, async (req: any, res) => {
    try {
      const elaborators = await storage.getReportElaborators();
      res.json(elaborators);
    } catch (error) {
      console.error("Error fetching report elaborators:", error);
      res.status(500).json({ message: "Failed to fetch report elaborators" });
    }
  });

  // Chat routes
  app.get('/api/work-orders/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const messages = await storage.getWorkOrderMessages(workOrderId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/work-orders/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        workOrderId,
        userId
      });
      
      const message = await storage.createChatMessage(messageData);
      
      // Broadcast message via WebSocket
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'NEW_MESSAGE',
            workOrderId,
            message
          }));
        }
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', devAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'dev-user-1';
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Dashboard Filters routes
  app.get('/api/dashboard/filters', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const filters = await storage.getUserDashboardFilters(userId);
      res.json(filters);
    } catch (error) {
      console.error("Error fetching dashboard filters:", error);
      res.status(500).json({ message: "Failed to fetch dashboard filters" });
    }
  });

  app.post('/api/dashboard/filters', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const filterData = {
        ...req.body,
        userId
      };
      const filter = await storage.saveDashboardFilter(filterData);
      res.status(201).json(filter);
    } catch (error) {
      console.error("Error saving dashboard filter:", error);
      res.status(500).json({ message: "Failed to save dashboard filter" });
    }
  });

  // Team management endpoints
  app.get("/api/team/members", devAuthMiddleware, async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/team/tasks", devAuthMiddleware, async (req, res) => {
    try {
      const tasks = await storage.getTeamTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching team tasks:", error);
      res.status(500).json({ message: "Failed to fetch team tasks" });
    }
  });

  // Team member CRUD operations
  app.get("/api/team/members/:id", devAuthMiddleware, async (req, res) => {
    try {
      const member = await storage.getTeamMember(req.params.id);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Error fetching team member:", error);
      res.status(500).json({ message: "Failed to fetch team member" });
    }
  });

  app.post("/api/team/members", devAuthMiddleware, async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertTeamMemberSchema.parse(req.body);
      
      const memberData = {
        ...validatedData,
        id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        showInTeam: true,
        isActive: true,
      };
      
      const member = await storage.createTeamMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados inválidos", details: error.message });
      }
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  app.put("/api/team/members/:id", devAuthMiddleware, async (req, res) => {
    try {
      // Validate request body (partial update)
      const validatedData = insertTeamMemberSchema.partial().parse(req.body);
      
      const member = await storage.updateTeamMember(req.params.id, validatedData);
      res.json(member);
    } catch (error) {
      console.error("Error updating team member:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados inválidos", details: error.message });
      }
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  app.delete("/api/team/members/:id", devAuthMiddleware, async (req, res) => {
    try {
      await storage.deleteTeamMember(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });

  // Distribution and assignment routes
  app.post("/api/work-orders/:id/assign", isAuthenticated, async (req, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const { contractId, assignmentStrategy = 'BALANCED' } = req.body;
      const supervisorId = req.user?.claims?.sub || 'dev-user-1';

      const result = await distributionService.distributeWorkOrder(
        workOrderId,
        contractId,
        supervisorId,
        assignmentStrategy
      );

      res.json({ 
        message: "Distribuição realizada com sucesso", 
        assignment: result 
      });
    } catch (error) {
      console.error("Error assigning work order:", error);
      res.status(500).json({ message: "Falha na distribuição", error: error.message });
    }
  });

  // Distribution statistics
  app.get("/api/distribution/stats", isAuthenticated, async (req, res) => {
    try {
      const { contractId } = req.query;
      const stats = await distributionService.getDistributionStats(
        contractId ? parseInt(contractId as string) : undefined
      );
      res.json(stats);
    } catch (error) {
      console.error("Error getting distribution stats:", error);
      res.status(500).json({ message: "Falha ao buscar estatísticas" });
    }
  });

  // User management routes based on levels
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const { userLevel } = req.query;
      const users = await storage.getUsersByLevel(userLevel as string);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Falha ao buscar usuários" });
    }
  });

  app.post("/api/users", isAuthenticated, async (req, res) => {
    try {
      const userData = {
        id: `user-${Date.now()}`,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userLevel: req.body.userLevel || 'TECHNICIAN',
        active: true
      };
      const user = await storage.upsertUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Falha ao criar usuário" });
    }
  });

  app.put("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.upsertUser({ id: userId, ...req.body });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Falha ao atualizar usuário" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'DASHBOARD_REFRESH':
            // Broadcast dashboard refresh to all clients
            wss.clients.forEach(client => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'DASHBOARD_UPDATE',
                  timestamp: new Date().toISOString()
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
