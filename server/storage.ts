import {
  users,
  technicians,
  contracts,
  workOrders,
  workOrderChecklist,
  chatMessages,
  notifications,
  dashboardFilters,
  teamTasks,
  assets,
  maintenancePlans,
  inventoryItems,
  inventoryTransactions,
  systemConfig,
  auxiliares,
  preventiveMaintenanceOrders,
  orderAssignments,
  type User,
  type UpsertUser,
  type InsertTechnician,
  type Technician,
  type InsertContract,
  type Contract,
  type InsertWorkOrder,
  type WorkOrder,
  type InsertWorkOrderChecklist,
  type WorkOrderChecklist,
  type InsertChatMessage,
  type ChatMessage,
  type InsertNotification,
  type Notification,
  type InsertDashboardFilter,
  type DashboardFilter,
  type TeamTask,
  type DashboardMetrics,
  type StatusDistribution,
  type TechnicianStats,
  type ActivityItem,
  type MonthlyTrend,
  type Asset,
  type InsertAsset,
  type MaintenancePlan,
  type InsertMaintenancePlan,
  type InventoryItem,
  type InsertInventoryItem,
  type InventoryTransaction,
  type InsertInventoryTransaction,
  type SystemConfig,
  type InsertSystemConfig,
  type Auxiliar,
  type InsertAuxiliar,
  type PreventiveMaintenanceOrder,
  type InsertPreventiveMaintenanceOrder,
  type OrderAssignment,
  type InsertOrderAssignment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count, avg, sum } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Technician operations
  getTechnicians(): Promise<Technician[]>;
  getTechnician(id: number): Promise<Technician | undefined>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: number, technician: Partial<InsertTechnician>): Promise<Technician>;

  // Auxiliar operations
  getAuxiliares(): Promise<Auxiliar[]>;
  getAuxiliar(id: number): Promise<Auxiliar | undefined>;
  createAuxiliar(auxiliar: InsertAuxiliar): Promise<Auxiliar>;
  updateAuxiliar(id: number, auxiliar: Partial<InsertAuxiliar>): Promise<Auxiliar>;

  // Contract operations
  getContracts(): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract>;

  // Work Order operations
  getWorkOrders(filters?: any): Promise<WorkOrder[]>;
  getWorkOrder(id: number): Promise<WorkOrder | undefined>;
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder>;
  importWorkOrders(workOrders: InsertWorkOrder[]): Promise<WorkOrder[]>;

  // Checklist operations
  getWorkOrderChecklist(workOrderId: number): Promise<WorkOrderChecklist[]>;
  updateChecklistItem(id: number, item: Partial<InsertWorkOrderChecklist>): Promise<WorkOrderChecklist>;

  // Chat operations
  getWorkOrderMessages(workOrderId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;

  // Dashboard Filter operations
  getUserDashboardFilters(userId: string): Promise<DashboardFilter[]>;
  saveDashboardFilter(filter: InsertDashboardFilter): Promise<DashboardFilter>;

  // Dashboard Data operations
  getDashboardMetrics(filters?: any): Promise<DashboardMetrics>;
  getStatusDistribution(filters?: any): Promise<StatusDistribution>;
  getTechnicianStats(filters?: any): Promise<TechnicianStats[]>;
  getRecentActivity(limit?: number): Promise<ActivityItem[]>;
  getMonthlyTrends(months?: number): Promise<MonthlyTrend[]>;
  getPriorityDistribution(filters?: any): Promise<Record<string, number>>;

  // Team Member operations
  getTeamMembers(tipo?: string, status?: string): Promise<User[]>;
  getTeamMember(id: string): Promise<User | undefined>;
  createTeamMember(userData: UpsertUser): Promise<User>;
  updateTeamMember(id: string, userData: Partial<UpsertUser>): Promise<User>;
  deleteTeamMember(id: string): Promise<void>;
  getTeamMemberStats(): Promise<any>;

  // Order Assignment operations
  assignElaborador(orderNumber: string, elaboradorId: string, observacoes?: string): Promise<any>;
  assignTecnicoCampo(orderNumber: string, tecnicoCampoId: string, observacoes?: string): Promise<any>;
  getOrderAssignment(orderNumber: string): Promise<any>;

  // Asset operations
  getAssets(): Promise<Asset[]>;
  getAsset(id: number): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: Partial<InsertAsset>): Promise<Asset>;
  deleteAsset(id: number): Promise<void>;

  // Maintenance Plan operations
  getMaintenancePlans(): Promise<MaintenancePlan[]>;
  getMaintenancePlan(id: number): Promise<MaintenancePlan | undefined>;
  createMaintenancePlan(plan: InsertMaintenancePlan): Promise<MaintenancePlan>;
  updateMaintenancePlan(id: number, plan: Partial<InsertMaintenancePlan>): Promise<MaintenancePlan>;
  deleteMaintenancePlan(id: number): Promise<void>;

  // Inventory operations
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem>;
  deleteInventoryItem(id: number): Promise<void>;
  
  // Inventory Transaction operations
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  getInventoryTransactions(itemId?: number): Promise<InventoryTransaction[]>;

  // System Config operations
  getSystemConfig(key?: string): Promise<SystemConfig[]>;
  updateSystemConfig(configs: InsertSystemConfig[]): Promise<SystemConfig[]>;

  // User operations for management
  getAllUsers(): Promise<User[]>;
  createUser(userData: UpsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Additional technician operations
  deleteTechnician(id: number): Promise<void>;

  // Additional contract operations
  deleteContract(id: number): Promise<void>;

  // Report Elaborators operations
  getReportElaborators(): Promise<any[]>;

  // System Data Reset operation
  clearAllData(): Promise<{ success: boolean; message: string; cleared: string[] }>;

  // Preventive Maintenance Orders operations
  getPreventiveMaintenanceOrders(): Promise<PreventiveMaintenanceOrder[]>;
  getPreventiveMaintenanceOrder(id: number): Promise<PreventiveMaintenanceOrder | undefined>;
  createPreventiveMaintenanceOrder(order: InsertPreventiveMaintenanceOrder): Promise<PreventiveMaintenanceOrder>;
  updatePreventiveMaintenanceOrder(id: number, order: Partial<InsertPreventiveMaintenanceOrder>): Promise<PreventiveMaintenanceOrder>;
  importPreventiveMaintenanceOrders(orders: any[]): Promise<PreventiveMaintenanceOrder[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Technician operations
  async getTechnicians(): Promise<Technician[]> {
    // Exclude collaborators from technicians list
    const collaboratorNames = [
      'Paulo', 'Danilo', 'Tairita', 'Talitta', 'Flávia', 'Lucas', 'Gustavo', 'Thiago'
    ];
    
    const allTechnicians = await db.select().from(technicians).where(eq(technicians.active, true));
    
    return allTechnicians.filter(tech => 
      !collaboratorNames.some(name => 
        tech.name.toLowerCase().includes(name.toLowerCase())
      )
    );
  }

  async getTechnician(id: number): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.id, id));
    return technician;
  }

  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const [newTechnician] = await db.insert(technicians).values(technician).returning();
    return newTechnician;
  }

  async updateTechnician(id: number, technician: Partial<InsertTechnician>): Promise<Technician> {
    const [updatedTechnician] = await db
      .update(technicians)
      .set(technician)
      .where(eq(technicians.id, id))
      .returning();
    return updatedTechnician;
  }

  // Contract operations
  async getContracts(): Promise<Contract[]> {
    return await db.select().from(contracts).where(eq(contracts.active, true));
  }



  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    return newContract;
  }

  async updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract> {
    const [updatedContract] = await db
      .update(contracts)
      .set(contract)
      .where(eq(contracts.id, id))
      .returning();
    return updatedContract;
  }

  // Work Order operations
  async getWorkOrders(filters?: any): Promise<WorkOrder[]> {
    let query = db.select().from(workOrders);
    
    if (filters) {
      const conditions = [];
      if (filters.status) conditions.push(eq(workOrders.status, filters.status));
      if (filters.technicianId) conditions.push(eq(workOrders.technicianId, filters.technicianId));
      if (filters.contractId) conditions.push(eq(workOrders.contractId, filters.contractId));
      if (filters.collaboratorId) conditions.push(eq(workOrders.reportElaboratorId, filters.collaboratorId));
      if (filters.startDate) conditions.push(gte(workOrders.createdAt, new Date(filters.startDate)));
      if (filters.endDate) conditions.push(lte(workOrders.createdAt, new Date(filters.endDate)));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(workOrders.createdAt));
  }

  async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    const [workOrder] = await db.select().from(workOrders).where(eq(workOrders.id, id));
    return workOrder;
  }

  async createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder> {
    const [newWorkOrder] = await db.insert(workOrders).values(workOrder).returning();
    return newWorkOrder;
  }

  async updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder> {
    const [updatedWorkOrder] = await db
      .update(workOrders)
      .set({ ...workOrder, updatedAt: new Date() })
      .where(eq(workOrders.id, id))
      .returning();
    return updatedWorkOrder;
  }

  async importWorkOrders(workOrdersList: InsertWorkOrder[]): Promise<WorkOrder[]> {
    const importedWorkOrders = [];
    for (const workOrder of workOrdersList) {
      try {
        const [newWorkOrder] = await db
          .insert(workOrders)
          .values(workOrder)
          .onConflictDoUpdate({
            target: workOrders.osNumber,
            set: {
              title: workOrder.title,
              description: workOrder.description,
              equipmentName: workOrder.equipmentName,
              location: workOrder.location,
              priority: workOrder.priority,
              scheduledDate: workOrder.scheduledDate,
              updatedAt: new Date()
            }
          })
          .returning();
        importedWorkOrders.push(newWorkOrder);
      } catch (error) {
        console.error(`Error importing work order ${workOrder.osNumber}:`, error);
        // Continue with next work order
      }
    }
    return importedWorkOrders;
  }

  // Checklist operations
  async getWorkOrderChecklist(workOrderId: number): Promise<WorkOrderChecklist[]> {
    return await db
      .select()
      .from(workOrderChecklist)
      .where(eq(workOrderChecklist.workOrderId, workOrderId))
      .orderBy(workOrderChecklist.order);
  }

  async updateChecklistItem(id: number, item: Partial<InsertWorkOrderChecklist>): Promise<WorkOrderChecklist> {
    const [updatedItem] = await db
      .update(workOrderChecklist)
      .set(item)
      .where(eq(workOrderChecklist.id, id))
      .returning();
    return updatedItem;
  }

  // Chat operations
  async getWorkOrderMessages(workOrderId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.workOrderId, workOrderId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  // Dashboard Filter operations
  async getUserDashboardFilters(userId: string): Promise<DashboardFilter[]> {
    return await db
      .select()
      .from(dashboardFilters)
      .where(eq(dashboardFilters.userId, userId))
      .orderBy(desc(dashboardFilters.createdAt));
  }

  async saveDashboardFilter(filter: InsertDashboardFilter): Promise<DashboardFilter> {
    const [newFilter] = await db.insert(dashboardFilters).values(filter).returning();
    return newFilter;
  }

  // Dashboard Data operations
  async getDashboardMetrics(filters?: any): Promise<DashboardMetrics> {
    // Build conditions for filtering
    const conditions = [];
    if (filters) {
      if (filters.startDate) conditions.push(gte(workOrders.createdAt, new Date(filters.startDate)));
      if (filters.endDate) conditions.push(lte(workOrders.createdAt, new Date(filters.endDate)));
      if (filters.technicianId) conditions.push(eq(workOrders.technicianId, parseInt(filters.technicianId)));
      if (filters.contractId) conditions.push(eq(workOrders.contractId, parseInt(filters.contractId)));
      if (filters.collaboratorId) conditions.push(eq(workOrders.reportElaboratorId, filters.collaboratorId));
    }

    const baseCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(workOrders)
      .where(baseCondition);

    // Get count by status
    const [pendingResult] = await db
      .select({ count: count() })
      .from(workOrders)
      .where(baseCondition ? and(baseCondition, eq(workOrders.status, 'PENDENTE')) : eq(workOrders.status, 'PENDENTE'));

    const [completedResult] = await db
      .select({ count: count() })
      .from(workOrders)
      .where(baseCondition ? and(baseCondition, eq(workOrders.status, 'CONCLUIDA')) : eq(workOrders.status, 'CONCLUIDA'));

    const [scheduledResult] = await db
      .select({ count: count() })
      .from(workOrders)
      .where(baseCondition ? and(baseCondition, eq(workOrders.status, 'AGENDADA')) : eq(workOrders.status, 'AGENDADA'));

    // Get overdue count (items with due date in the past that are not completed)
    const [overdueResult] = await db
      .select({ count: count() })
      .from(workOrders)
      .where(
        baseCondition 
          ? and(
              baseCondition,
              sql`${workOrders.dueDate} < NOW()`,
              sql`${workOrders.status} != 'CONCLUIDA'`
            )
          : and(
              sql`${workOrders.dueDate} < NOW()`,
              sql`${workOrders.status} != 'CONCLUIDA'`
            )
      );

    // Calculate average completion time for completed orders
    const [avgTimeResult] = await db
      .select({ 
        avgTime: avg(sql`EXTRACT(EPOCH FROM (${workOrders.completedDate} - ${workOrders.createdAt}))/3600`)
      })
      .from(workOrders)
      .where(
        baseCondition 
          ? and(baseCondition, eq(workOrders.status, 'CONCLUIDA'), sql`${workOrders.completedDate} IS NOT NULL`)
          : and(eq(workOrders.status, 'CONCLUIDA'), sql`${workOrders.completedDate} IS NOT NULL`)
      );

    const totalOS = totalResult.count;
    const completedOS = completedResult.count;
    const completionRate = totalOS > 0 ? Math.round((completedOS / totalOS) * 100) : 0;

    return {
      totalOS,
      pendingOS: pendingResult.count,
      completionRate,
      averageTime: Number(avgTimeResult.avgTime) || 0,
      overdueOS: overdueResult.count,
      scheduledOS: scheduledResult.count,
      completedOS,
    };
  }

  async getStatusDistribution(filters?: any): Promise<StatusDistribution> {
    // Build conditions for filtering
    const conditions = [];
    if (filters) {
      if (filters.startDate) conditions.push(gte(workOrders.createdAt, new Date(filters.startDate)));
      if (filters.endDate) conditions.push(lte(workOrders.createdAt, new Date(filters.endDate)));
      if (filters.technicianId) conditions.push(eq(workOrders.technicianId, parseInt(filters.technicianId)));
      if (filters.contractId) conditions.push(eq(workOrders.contractId, parseInt(filters.contractId)));
      if (filters.collaboratorId) conditions.push(eq(workOrders.reportElaboratorId, filters.collaboratorId));
    }

    const baseCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Get status distribution - remove WHERE clause if no conditions to ensure all data is fetched
    const query = db
      .select({
        status: workOrders.status,
        count: count()
      })
      .from(workOrders)
      .groupBy(workOrders.status);
    
    const results = baseCondition ? await query.where(baseCondition) : await query;

    const distribution: StatusDistribution = {
      PENDENTE: 0,
      AGENDADA: 0,
      CONCLUIDA: 0,
      VENCIDA: 0,
    };

    // Map results to distribution object
    results.forEach(result => {
      if (result.status in distribution) {
        distribution[result.status as keyof StatusDistribution] = result.count;
      }
    });

    return distribution;
  }

  async getTechnicianStats(filters?: any): Promise<TechnicianStats[]> {
    // Build conditions for filtering work orders
    const conditions = [];
    if (filters) {
      if (filters.startDate) conditions.push(gte(workOrders.createdAt, new Date(filters.startDate)));
      if (filters.endDate) conditions.push(lte(workOrders.createdAt, new Date(filters.endDate)));
      if (filters.contractId) conditions.push(eq(workOrders.contractId, parseInt(filters.contractId)));
    }

    // Get technician stats with completed work orders
    const stats = await db
      .select({
        id: technicians.id,
        name: technicians.name,
        email: technicians.email,
        completedOS: count(sql`CASE WHEN ${workOrders.status} = 'CONCLUIDA' THEN 1 END`),
        totalOS: count(workOrders.id),
        avgCompletionTime: avg(sql`CASE WHEN ${workOrders.status} = 'CONCLUIDA' AND ${workOrders.completedDate} IS NOT NULL THEN EXTRACT(EPOCH FROM (${workOrders.completedDate} - ${workOrders.createdAt}))/3600 END`)
      })
      .from(technicians)
      .leftJoin(workOrders, and(
        eq(technicians.id, workOrders.technicianId),
        ...(conditions.length > 0 ? conditions : [])
      ))
      .where(eq(technicians.active, true))
      .groupBy(technicians.id, technicians.name, technicians.email);

    return stats.map(stat => ({
      id: stat.id,
      name: stat.name,
      completedOS: stat.completedOS,
      successRate: stat.totalOS > 0 ? Math.round((stat.completedOS / stat.totalOS) * 100) : 0,
      averageTime: Number(stat.avgCompletionTime) || 0,
    }));
  }

  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    // Get recent work order activities from the database
    const recentWorkOrders = await db
      .select({
        id: workOrders.id,
        osNumber: workOrders.osNumber,
        title: workOrders.title,
        status: workOrders.status,
        createdAt: workOrders.createdAt,
        completedDate: workOrders.completedDate,
        updatedAt: workOrders.updatedAt,
        technicianName: technicians.name,
        createdByUser: users.firstName,
      })
      .from(workOrders)
      .leftJoin(technicians, eq(workOrders.technicianId, technicians.id))
      .leftJoin(users, eq(workOrders.createdBy, users.id))
      .orderBy(desc(workOrders.updatedAt))
      .limit(limit * 2); // Get more to filter and format

    const activities: ActivityItem[] = [];

    for (const wo of recentWorkOrders) {
      if (activities.length >= limit) break;

      // Create activity based on work order status and dates
      if (wo.status === 'CONCLUIDA' && wo.completedDate) {
        activities.push({
          id: wo.id,
          type: 'OS_COMPLETED',
          description: `OS ${wo.osNumber} foi concluída por ${wo.technicianName || 'Técnico'}`,
          workOrderId: wo.id,
          userName: wo.technicianName || undefined,
          createdAt: wo.completedDate,
        });
      } else if (wo.status === 'PENDENTE' && wo.createdAt) {
        activities.push({
          id: wo.id + 1000, // Offset to avoid conflicts
          type: 'OS_CREATED',
          description: `OS ${wo.osNumber} foi criada: ${wo.title}`,
          workOrderId: wo.id,
          userName: wo.createdByUser || undefined,
          createdAt: wo.createdAt,
        });
      }
    }

    // Sort by date descending and return limited results
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getMonthlyTrends(months: number = 6): Promise<MonthlyTrend[]> {
    // Get monthly aggregated data for work orders
    const trendsData = await db
      .select({
        month: sql<string>`TO_CHAR(${workOrders.createdAt}, 'YYYY-MM')`,
        created: count(workOrders.id),
        completed: count(sql`CASE WHEN ${workOrders.status} = 'CONCLUIDA' THEN 1 END`)
      })
      .from(workOrders)
      .where(gte(workOrders.createdAt, sql`NOW() - INTERVAL '${sql.raw(months.toString())} months'`))
      .groupBy(sql`TO_CHAR(${workOrders.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${workOrders.createdAt}, 'YYYY-MM')`);

    // Format data for chart consumption
    const trends: MonthlyTrend[] = trendsData.map(trend => ({
      month: trend.month,
      created: trend.created,
      completed: trend.completed,
    }));

    // Fill in missing months with zeros if needed
    const currentDate = new Date();
    const allMonths: MonthlyTrend[] = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const existingTrend = trends.find(t => t.month === monthKey);
      allMonths.push(existingTrend || {
        month: monthKey,
        created: 0,
        completed: 0,
      });
    }

    return allMonths;
  }

  async getPriorityDistribution(filters?: any): Promise<Record<string, number>> {
    // Build conditions for filtering
    const conditions = [];
    if (filters) {
      if (filters.startDate) conditions.push(gte(workOrders.createdAt, new Date(filters.startDate)));
      if (filters.endDate) conditions.push(lte(workOrders.createdAt, new Date(filters.endDate)));
      if (filters.contractId) conditions.push(eq(workOrders.contractId, parseInt(filters.contractId)));
      if (filters.technicianId) conditions.push(eq(workOrders.technicianId, parseInt(filters.technicianId)));
    }

    const baseCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Get distribution of work orders by priority
    const query = db
      .select({
        priority: workOrders.priority,
        count: count(workOrders.id),
      })
      .from(workOrders)
      .groupBy(workOrders.priority);
    
    const results = baseCondition ? await query.where(baseCondition) : await query;

    const distribution: Record<string, number> = {
      BAIXA: 0,
      MEDIA: 0,
      ALTA: 0,
      URGENTE: 0,
    };

    // Map results to distribution object
    results.forEach(result => {
      if (result.priority && result.priority in distribution) {
        distribution[result.priority] = result.count;
      }
    });

    return distribution;
  }

  // Team management operations
  async getTeamMembers(tipo?: string, status?: string): Promise<User[]> {
    let query = db.select().from(users).where(eq(users.showInTeam, true));
    
    if (tipo && tipo !== 'TODOS') {
      query = query.where(and(eq(users.showInTeam, true), eq(users.userLevel, tipo)));
    }
    
    if (status) {
      query = query.where(and(eq(users.showInTeam, true), eq(users.isActive, status === 'ATIVO')));
    }
    
    return await query;
  }

  async getTeamMember(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getTeamMemberStats(): Promise<any> {
    const members = await db.select().from(users).where(eq(users.showInTeam, true));
    
    const stats = {
      tecnicos: members.filter(m => m.userLevel === 'TECHNICIAN').length,
      auxiliares: members.filter(m => m.userLevel === 'AUXILIAR').length,
      elaboradores: members.filter(m => m.userLevel === 'ELABORADOR').length,
      campo: members.filter(m => m.userLevel === 'CAMPO').length,
      total: members.length
    };
    
    return stats;
  }

  // Order assignment operations
  async assignElaborador(orderNumber: string, elaboradorId: string, observacoes?: string): Promise<OrderAssignment> {
    // Check if assignment already exists
    const [existingAssignment] = await db
      .select()
      .from(orderAssignments)
      .where(eq(orderAssignments.workOrderNumber, orderNumber));

    if (existingAssignment) {
      // Update existing assignment
      const [updated] = await db
        .update(orderAssignments)
        .set({ 
          elaboradorId, 
          observacoes, 
          dataAtribuicao: new Date(),
          updatedAt: new Date() 
        })
        .where(eq(orderAssignments.workOrderNumber, orderNumber))
        .returning();
      return updated;
    } else {
      // Create new assignment
      const [newAssignment] = await db
        .insert(orderAssignments)
        .values({
          workOrderNumber: orderNumber,
          elaboradorId,
          observacoes,
        })
        .returning();
      return newAssignment;
    }
  }

  async assignTecnicoCampo(orderNumber: string, tecnicoCampoId: string, observacoes?: string): Promise<OrderAssignment> {
    // Check if assignment already exists
    const [existingAssignment] = await db
      .select()
      .from(orderAssignments)
      .where(eq(orderAssignments.workOrderNumber, orderNumber));

    if (existingAssignment) {
      // Update existing assignment
      const [updated] = await db
        .update(orderAssignments)
        .set({ 
          tecnicoCampoId, 
          observacoes, 
          dataAtribuicao: new Date(),
          updatedAt: new Date() 
        })
        .where(eq(orderAssignments.workOrderNumber, orderNumber))
        .returning();
      return updated;
    } else {
      // Create new assignment
      const [newAssignment] = await db
        .insert(orderAssignments)
        .values({
          workOrderNumber: orderNumber,
          tecnicoCampoId,
          observacoes,
        })
        .returning();
      return newAssignment;
    }
  }

  async getOrderAssignment(orderNumber: string): Promise<OrderAssignment | null> {
    const [assignment] = await db
      .select()
      .from(orderAssignments)
      .where(eq(orderAssignments.workOrderNumber, orderNumber));
    
    return assignment || null;
  }

  async createTeamMember(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        showInTeam: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateTeamMember(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteTeamMember(id: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        showInTeam: false,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async getTeamTasks(): Promise<TeamTask[]> {
    return await db.select().from(teamTasks);
  }

  // User management by level
  async getUsersByLevel(userLevel?: string): Promise<User[]> {
    if (userLevel) {
      return await db.select().from(users).where(eq(users.userLevel, userLevel));
    }
    return await db.select().from(users);
  }

  // Asset operations
  async getAssets(): Promise<Asset[]> {
    return await db.select().from(assets).orderBy(desc(assets.createdAt));
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [newAsset] = await db.insert(assets).values(asset).returning();
    return newAsset;
  }

  async updateAsset(id: number, asset: Partial<InsertAsset>): Promise<Asset> {
    const [updatedAsset] = await db
      .update(assets)
      .set({ ...asset, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();
    return updatedAsset;
  }

  async deleteAsset(id: number): Promise<void> {
    await db.delete(assets).where(eq(assets.id, id));
  }

  // Maintenance Plan operations
  async getMaintenancePlans(): Promise<MaintenancePlan[]> {
    return await db.select().from(maintenancePlans).where(eq(maintenancePlans.isActive, true));
  }

  async getMaintenancePlan(id: number): Promise<MaintenancePlan | undefined> {
    const [plan] = await db.select().from(maintenancePlans).where(eq(maintenancePlans.id, id));
    return plan;
  }

  async createMaintenancePlan(plan: InsertMaintenancePlan): Promise<MaintenancePlan> {
    const [newPlan] = await db.insert(maintenancePlans).values(plan).returning();
    return newPlan;
  }

  async updateMaintenancePlan(id: number, plan: Partial<InsertMaintenancePlan>): Promise<MaintenancePlan> {
    const [updatedPlan] = await db
      .update(maintenancePlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(maintenancePlans.id, id))
      .returning();
    return updatedPlan;
  }

  async deleteMaintenancePlan(id: number): Promise<void> {
    await db.update(maintenancePlans).set({ isActive: false }).where(eq(maintenancePlans.id, id));
  }

  // Inventory operations
  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).orderBy(inventoryItems.name);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item;
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
  }

  // Inventory Transaction operations
  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const [newTransaction] = await db.insert(inventoryTransactions).values(transaction).returning();
    
    // Update inventory stock based on transaction type
    if (transaction.inventoryItemId) {
      const item = await this.getInventoryItem(transaction.inventoryItemId);
      if (item) {
        let newStock = parseFloat(item.currentStock || '0');
        const quantity = parseFloat(transaction.quantity);
        
        if (transaction.transactionType === 'IN') {
          newStock += quantity;
        } else if (transaction.transactionType === 'OUT') {
          newStock -= quantity;
        } else if (transaction.transactionType === 'ADJUSTMENT') {
          newStock = quantity;
        }
        
        await this.updateInventoryItem(transaction.inventoryItemId, {
          currentStock: newStock.toString()
        });
      }
    }
    
    return newTransaction;
  }

  async getInventoryTransactions(itemId?: number): Promise<InventoryTransaction[]> {
    const query = db.select().from(inventoryTransactions);
    if (itemId) {
      return await query.where(eq(inventoryTransactions.inventoryItemId, itemId)).orderBy(desc(inventoryTransactions.createdAt));
    }
    return await query.orderBy(desc(inventoryTransactions.createdAt));
  }

  // System Config operations
  async getSystemConfig(key?: string): Promise<SystemConfig[]> {
    if (key) {
      return await db.select().from(systemConfig).where(eq(systemConfig.key, key));
    }
    return await db.select().from(systemConfig);
  }

  async updateSystemConfig(configs: InsertSystemConfig[]): Promise<SystemConfig[]> {
    const results: SystemConfig[] = [];
    for (const config of configs) {
      const [updatedConfig] = await db
        .insert(systemConfig)
        .values(config)
        .onConflictDoUpdate({
          target: systemConfig.key,
          set: {
            value: config.value,
            updatedAt: new Date(),
            updatedBy: config.updatedBy,
          },
        })
        .returning();
      results.push(updatedConfig);
    }
    return results;
  }

  // User management operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.update(users).set({ isActive: false }).where(eq(users.id, id));
  }

  // Additional technician operations
  async deleteTechnician(id: number): Promise<void> {
    await db.update(technicians).set({ active: false }).where(eq(technicians.id, id));
  }

  // Auxiliar operations
  async getAuxiliares(): Promise<Auxiliar[]> {
    return await db.select().from(auxiliares).where(eq(auxiliares.active, true)).orderBy(auxiliares.name);
  }

  async getAuxiliar(id: number): Promise<Auxiliar | undefined> {
    const [auxiliar] = await db.select().from(auxiliares).where(and(eq(auxiliares.id, id), eq(auxiliares.active, true)));
    return auxiliar;
  }

  async createAuxiliar(auxiliarData: InsertAuxiliar): Promise<Auxiliar> {
    const [newAuxiliar] = await db.insert(auxiliares).values(auxiliarData).returning();
    return newAuxiliar;
  }

  async updateAuxiliar(id: number, auxiliarData: Partial<InsertAuxiliar>): Promise<Auxiliar> {
    const [updatedAuxiliar] = await db
      .update(auxiliares)
      .set(auxiliarData)
      .where(eq(auxiliares.id, id))
      .returning();
    return updatedAuxiliar;
  }

  async deleteAuxiliar(id: number): Promise<void> {
    await db.update(auxiliares).set({ active: false }).where(eq(auxiliares.id, id));
  }

  // Additional contract operations
  async deleteContract(id: number): Promise<void> {
    await db.update(contracts).set({ active: false }).where(eq(contracts.id, id));
  }

  // Report Elaborators operations
  async getReportElaborators(): Promise<any[]> {
    return await db.select({
      id: users.id,
      name: sql`${users.firstName} || ' ' || ${users.lastName}`,
      email: users.email,
      position: users.position,
      department: users.department
    })
    .from(users)
    .where(and(
      eq(users.isActive, true),
      sql`${users.userLevel} IN ('ENGINEER', 'SUPERVISOR', 'ADMIN')`
    ));
  }

  // Preventive Maintenance Orders operations
  async getPreventiveMaintenanceOrders(): Promise<PreventiveMaintenanceOrder[]> {
    return await db.select().from(preventiveMaintenanceOrders).orderBy(desc(preventiveMaintenanceOrders.createdAt));
  }

  async getPreventiveMaintenanceOrder(id: number): Promise<PreventiveMaintenanceOrder | undefined> {
    const [order] = await db.select().from(preventiveMaintenanceOrders).where(eq(preventiveMaintenanceOrders.id, id));
    return order;
  }

  async createPreventiveMaintenanceOrder(order: InsertPreventiveMaintenanceOrder): Promise<PreventiveMaintenanceOrder> {
    const [newOrder] = await db.insert(preventiveMaintenanceOrders).values(order).returning();
    return newOrder;
  }

  async updatePreventiveMaintenanceOrder(id: number, order: Partial<InsertPreventiveMaintenanceOrder>): Promise<PreventiveMaintenanceOrder> {
    const [updatedOrder] = await db
      .update(preventiveMaintenanceOrders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(preventiveMaintenanceOrders.id, id))
      .returning();
    return updatedOrder;
  }

  async importPreventiveMaintenanceOrders(orders: any[]): Promise<PreventiveMaintenanceOrder[]> {
    const importedOrders: PreventiveMaintenanceOrder[] = [];
    
    for (const orderData of orders) {
      try {
        // Map Excel data to database format
        const mappedOrder: InsertPreventiveMaintenanceOrder = {
          reportCreatorId: orderData.reportCreatorId || null,
          surveyDate: orderData.surveyDate || null,
          contractNumber: orderData.contractNumber || null,
          workOrderNumber: orderData.workOrderNumber,
          equipmentPrefix: orderData.equipmentPrefix || null,
          agencyName: orderData.agencyName,
          preventiveBudgetValue: orderData.preventiveBudgetValue || '0',
          portalDeadline: orderData.portalDeadline || null,
          situationStatus: orderData.situationStatus,
          preventiveTechnicianId: orderData.preventiveTechnicianId || null,
          scheduledDate: orderData.scheduledDate || null,
          scheduledStatus: orderData.scheduledStatus || 'AGENDADO',
          difficultiesNotes: orderData.difficultiesNotes || null,
          executionStatus: orderData.executionStatus
        };

        const [newOrder] = await db.insert(preventiveMaintenanceOrders).values(mappedOrder).returning();
        importedOrders.push(newOrder);
      } catch (error) {
        console.error(`Error importing preventive maintenance order ${orderData.workOrderNumber}:`, error);
        // Continue with next order
      }
    }
    return importedOrders;
  }

  // System Data Reset operation
  async clearAllData(): Promise<{ success: boolean; message: string; cleared: string[] }> {
    try {
      const clearedTables: string[] = [];

      // Clear all data tables but preserve user accounts for auth
      await db.delete(inventoryTransactions);
      clearedTables.push('Transações de Inventário');

      await db.delete(inventoryItems);
      clearedTables.push('Itens de Inventário');

      await db.delete(maintenancePlans);
      clearedTables.push('Planos de Manutenção');

      await db.delete(assets);
      clearedTables.push('Ativos');

      await db.delete(teamTasks);
      clearedTables.push('Tarefas da Equipe');

      await db.delete(dashboardFilters);
      clearedTables.push('Filtros do Dashboard');

      await db.delete(notifications);
      clearedTables.push('Notificações');

      await db.delete(chatMessages);
      clearedTables.push('Mensagens de Chat');

      await db.delete(workOrderChecklist);
      clearedTables.push('Checklist de OS');

      await db.delete(workOrders);
      clearedTables.push('Ordens de Serviço');

      await db.delete(contracts);
      clearedTables.push('Contratos');

      await db.delete(technicians);
      clearedTables.push('Técnicos');

      await db.delete(auxiliares);
      clearedTables.push('Auxiliares');

      // Clear system configurations except essential ones
      await db.delete(systemConfig).where(sql`category != 'ESSENTIAL'`);
      clearedTables.push('Configurações do Sistema (não essenciais)');

      return {
        success: true,
        message: `Dados do sistema foram zerados com sucesso! ${clearedTables.length} tabelas limpas.`,
        cleared: clearedTables
      };
    } catch (error) {
      console.error('Erro ao zerar dados do sistema:', error);
      return {
        success: false,
        message: 'Erro ao zerar dados do sistema. Verifique os logs para mais detalhes.',
        cleared: []
      };
    }
  }
}

export const storage = new DatabaseStorage();
