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
    return await db.select().from(technicians).where(eq(technicians.active, true));
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
    let baseQuery = db.select().from(workOrders);
    
    if (filters) {
      const conditions = [];
      if (filters.startDate) conditions.push(gte(workOrders.createdAt, new Date(filters.startDate)));
      if (filters.endDate) conditions.push(lte(workOrders.createdAt, new Date(filters.endDate)));
      if (filters.technicianId) conditions.push(eq(workOrders.technicianId, filters.technicianId));
      if (filters.contractId) conditions.push(eq(workOrders.contractId, filters.contractId));
      
      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(workOrders);

    const [pendingResult] = await db
      .select({ count: count() })
      .from(workOrders)
      .where(eq(workOrders.status, 'PENDENTE'));

    const [completedResult] = await db
      .select({ count: count() })
      .from(workOrders)
      .where(eq(workOrders.status, 'CONCLUIDA'));

    const [overdueResult] = await db
      .select({ count: count() })
      .from(workOrders)
      .where(and(
        eq(workOrders.status, 'VENCIDA'),
        sql`${workOrders.dueDate} < NOW()`
      ));

    const [scheduledResult] = await db
      .select({ count: count() })
      .from(workOrders)
      .where(eq(workOrders.status, 'AGENDADA'));

    const [avgTimeResult] = await db
      .select({ 
        avgTime: avg(sql`EXTRACT(EPOCH FROM (${workOrders.completedDate} - ${workOrders.createdAt}))/3600`)
      })
      .from(workOrders)
      .where(eq(workOrders.status, 'CONCLUIDA'));

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
    const [result] = await db
      .select({
        status: workOrders.status,
        count: count()
      })
      .from(workOrders)
      .groupBy(workOrders.status);

    const distribution = {
      PENDENTE: 0,
      AGENDADA: 0,
      CONCLUIDA: 0,
      VENCIDA: 0,
    };

    // This would normally aggregate the results properly
    // For now, returning sample structure
    return distribution;
  }

  async getTechnicianStats(filters?: any): Promise<TechnicianStats[]> {
    const stats = await db
      .select({
        id: technicians.id,
        name: technicians.name,
        completedOS: count(workOrders.id),
      })
      .from(technicians)
      .leftJoin(workOrders, and(
        eq(technicians.id, workOrders.technicianId),
        eq(workOrders.status, 'CONCLUIDA')
      ))
      .groupBy(technicians.id, technicians.name);

    return stats.map(stat => ({
      ...stat,
      successRate: Math.random() * 20 + 80, // This would be calculated properly
      averageTime: Math.random() * 2 + 1,
    }));
  }

  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    // This would be implemented with proper activity tracking
    return [];
  }

  async getMonthlyTrends(months: number = 6): Promise<MonthlyTrend[]> {
    // This would be implemented with proper date aggregation
    return [];
  }

  // Team management operations
  async getTeamMembers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.showInTeam, true));
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
}

export const storage = new DatabaseStorage();
