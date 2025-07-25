import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import ExcelJS from "exceljs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWorkOrderSchema, insertChatMessageSchema, insertNotificationSchema } from "@shared/schema";

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

  app.get('/api/dashboard/monthly-trends', isAuthenticated, async (req: any, res) => {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const trends = await storage.getMonthlyTrends(months);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching monthly trends:", error);
      res.status(500).json({ message: "Failed to fetch monthly trends" });
    }
  });

  // Work Orders routes
  app.get('/api/work-orders', isAuthenticated, async (req: any, res) => {
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
          
          // Skip empty rows
          if (!values || values.length < 3 || !values[1]) return;
          
          // Extract data from Excel columns
          const osNumber = values[1]?.toString()?.trim() || `PREV-${Date.now()}-${rowNumber}`;
          const description = values[2]?.toString()?.trim() || '';
          const equipmentName = values[3]?.toString()?.trim() || '';
          const location = values[4]?.toString()?.trim() || '';
          let scheduledDate: Date | null = null;
          if (values[5]) {
            try {
              scheduledDate = new Date(values[5]);
              // Validate date
              if (isNaN(scheduledDate.getTime())) {
                scheduledDate = null;
              }
            } catch {
              scheduledDate = null;
            }
          }
          const priority = values[6]?.toString()?.toUpperCase()?.trim() || 'NORMAL';
          const technicianName = values[7]?.toString()?.trim() || '';
          
          // Map priority to valid values
          const validPriorities = ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'];
          const mappedPriority = validPriorities.includes(priority) ? priority : 'NORMAL';
          
          // Generate title from description or equipment
          const title = description || `Manutenção Preventiva - ${equipmentName}` || `OS ${osNumber}`;
          
          const workOrder = {
            osNumber: osNumber,
            title: title.substring(0, 255), // Limit title length
            description: description,
            equipmentName: equipmentName,
            location: location,
            priority: mappedPriority,
            status: 'PENDENTE',
            scheduledDate: scheduledDate,
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

  // Technicians routes
  app.get('/api/technicians', isAuthenticated, async (req: any, res) => {
    try {
      const technicians = await storage.getTechnicians();
      res.json(technicians);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      res.status(500).json({ message: "Failed to fetch technicians" });
    }
  });

  // Contracts routes
  app.get('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
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
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
