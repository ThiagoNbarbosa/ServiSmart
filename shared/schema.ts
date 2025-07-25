import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  uuid,
  date
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userLevel: varchar("user_level").notNull().default("USER"), // DEV, ADMIN, SUPER, USER
  position: varchar("position"), // Job title/position
  location: varchar("location"), // Work location
  department: varchar("department"), // Department/team
  phone: varchar("phone"), // Contact phone
  bio: text("bio"), // Biography/description
  isActive: boolean("is_active").default(true),
  showInTeam: boolean("show_in_team").default(true), // Controls if user appears in team page
  isDev: boolean("is_dev").default(false), // Special flag for DEV features
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Technicians table
export const technicians = pgTable("technicians", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contracts table
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  company: varchar("company").notNull(),
  description: text("description"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Work Orders table
export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  osNumber: varchar("os_number").unique().notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  equipmentId: varchar("equipment_id"),
  equipmentName: varchar("equipment_name"),
  location: varchar("location"),
  contractId: integer("contract_id").references(() => contracts.id),
  technicianId: integer("technician_id").references(() => technicians.id),
  status: varchar("status").notNull().default("PENDENTE"), // PENDENTE, AGENDADA, CONCLUIDA, VENCIDA
  priority: varchar("priority").default("NORMAL"), // BAIXA, NORMAL, ALTA, URGENTE
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  dueDate: timestamp("due_date"),
  estimatedHours: decimal("estimated_hours", { precision: 4, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 4, scale: 2 }),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work Order Checklist items
export const workOrderChecklist = pgTable("work_order_checklist", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => workOrders.id),
  item: text("item").notNull(),
  completed: boolean("completed").default(false),
  notes: text("notes"),
  order: integer("order").default(0),
});

// Chat messages for work orders
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => workOrders.id),
  userId: varchar("user_id").references(() => users.id),
  message: text("message").notNull(),
  attachments: jsonb("attachments"), // Array of file URLs
  createdAt: timestamp("created_at").defaultNow(),
});

// System notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // INFO, WARNING, ERROR, SUCCESS
  read: boolean("read").default(false),
  relatedEntity: varchar("related_entity"), // work_order, technician, etc
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dashboard filters saved by users
export const dashboardFilters = pgTable("dashboard_filters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  filters: jsonb("filters").notNull(), // JSON object with filter values
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team task progress tracking
export const teamTasks = pgTable("team_tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  taskName: varchar("task_name").notNull(),
  progress: integer("progress").default(0), // 0-100
  color: varchar("color").default("#3B82F6"), // Progress bar color
  teamMembers: jsonb("team_members"), // Array of user IDs working on this task
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Environment configuration for DEV/PROD control
export const environmentConfig = pgTable("environment_config", {
  id: serial("id").primaryKey(),
  key: varchar("key").unique().notNull(),
  value: text("value"),
  environment: varchar("environment").notNull(), // DEV, STAGING, PROD
  description: text("description"),
  isActive: boolean("is_active").default(true),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workOrders: many(workOrders),
  chatMessages: many(chatMessages),
  notifications: many(notifications),
  dashboardFilters: many(dashboardFilters),
}));

export const techniciansRelations = relations(technicians, ({ one, many }) => ({
  user: one(users, {
    fields: [technicians.userId],
    references: [users.id],
  }),
  workOrders: many(workOrders),
}));

export const contractsRelations = relations(contracts, ({ many }) => ({
  workOrders: many(workOrders),
}));

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  contract: one(contracts, {
    fields: [workOrders.contractId],
    references: [contracts.id],
  }),
  technician: one(technicians, {
    fields: [workOrders.technicianId],
    references: [technicians.id],
  }),
  createdByUser: one(users, {
    fields: [workOrders.createdBy],
    references: [users.id],
  }),
  checklist: many(workOrderChecklist),
  chatMessages: many(chatMessages),
}));

export const workOrderChecklistRelations = relations(workOrderChecklist, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderChecklist.workOrderId],
    references: [workOrders.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [chatMessages.workOrderId],
    references: [workOrders.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const dashboardFiltersRelations = relations(dashboardFilters, ({ one }) => ({
  user: one(users, {
    fields: [dashboardFilters.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertTechnicianSchema = createInsertSchema(technicians).omit({ id: true, createdAt: true });
export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true });
export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkOrderChecklistSchema = createInsertSchema(workOrderChecklist).omit({ id: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertDashboardFilterSchema = createInsertSchema(dashboardFilters).omit({ id: true, createdAt: true });
export const insertTeamTaskSchema = createInsertSchema(teamTasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEnvironmentConfigSchema = createInsertSchema(environmentConfig).omit({ id: true, updatedAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertTeamTask = z.infer<typeof insertTeamTaskSchema>;
export type TeamTask = typeof teamTasks.$inferSelect;
export type InsertEnvironmentConfig = z.infer<typeof insertEnvironmentConfigSchema>;
export type EnvironmentConfig = typeof environmentConfig.$inferSelect;
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type Technician = typeof technicians.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrderChecklist = z.infer<typeof insertWorkOrderChecklistSchema>;
export type WorkOrderChecklist = typeof workOrderChecklist.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertDashboardFilter = z.infer<typeof insertDashboardFilterSchema>;
export type DashboardFilter = typeof dashboardFilters.$inferSelect;

// Dashboard data types
export type DashboardMetrics = {
  totalOS: number;
  pendingOS: number;
  completionRate: number;
  averageTime: number;
  overdueOS: number;
  scheduledOS: number;
  completedOS: number;
};

export type StatusDistribution = {
  PENDENTE: number;
  AGENDADA: number;
  CONCLUIDA: number;
  VENCIDA: number;
};

export type TechnicianStats = {
  id: number;
  name: string;
  profileImageUrl?: string;
  completedOS: number;
  successRate: number;
  averageTime: number;
};

export type ActivityItem = {
  id: number;
  type: 'OS_COMPLETED' | 'OS_CREATED' | 'COMMENT_ADDED' | 'OS_OVERDUE' | 'IMPORT_COMPLETED';
  description: string;
  userId?: string;
  userName?: string;
  workOrderId?: number;
  createdAt: Date;
};

export type MonthlyTrend = {
  month: string;
  completed: number;
  created: number;
};
