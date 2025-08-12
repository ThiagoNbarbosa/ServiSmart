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
  date,
  pgEnum
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
  userLevel: varchar("user_level").notNull().default("TECHNICIAN"), // DEV, CONTRACT_MANAGER, REPORT_ELABORATOR, SUPERVISOR, ADMIN, TECHNICIAN, AUXILIAR
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

// Auxiliares table
export const auxiliares = pgTable("auxiliares", {
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
  auxiliarId: integer("auxiliar_id").references(() => auxiliares.id), // Assigned auxiliar
  reportElaboratorId: varchar("report_elaborator_id").references(() => users.id), // Assigned report elaborator
  supervisorId: varchar("supervisor_id").references(() => users.id), // Assigned supervisor
  contractManagerId: varchar("contract_manager_id").references(() => users.id), // Assigned contract manager
  status: varchar("status").notNull().default("PENDENTE"), // PENDENTE, AGENDADA, CONCLUIDA, VENCIDA
  priority: varchar("priority").default("NORMAL"), // BAIXA, NORMAL, ALTA, URGENTE
  assignmentStrategy: varchar("assignment_strategy").default("AUTO"), // AUTO, MANUAL, BALANCED
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  dueDate: timestamp("due_date"),
  estimatedHours: decimal("estimated_hours", { precision: 4, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 4, scale: 2 }),
  createdBy: varchar("created_by").references(() => users.id),
  assignedBy: varchar("assigned_by").references(() => users.id), // Supervisor who assigned
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

// Team member schema for API validation
export const insertTeamMemberSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  isDev: true 
}).extend({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"), 
  email: z.string().email("Email inválido").optional(),
  position: z.string().min(1, "Posição é obrigatória"),
  phone: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
  profileImageUrl: z.string().url("URL da imagem inválida").optional(),
  userLevel: z.enum(["DEV", "CONTRACT_MANAGER", "REPORT_ELABORATOR", "SUPERVISOR", "ADMIN", "TECHNICIAN"]).default("TECHNICIAN")
});

// Login Data Schema
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  accessLevel: z.enum(["DIRETOR", "SUPERVISOR", "USUARIO"]).default("USUARIO")
});

export type LoginData = z.infer<typeof loginSchema>;

// Types
// Contract Managers table (specialized user roles)
export const contractManagers = pgTable("contract_managers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  contractId: integer("contract_id").references(() => contracts.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Report Elaborators table  
export const reportElaborators = pgTable("report_elaborators", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  specialization: varchar("specialization"), // Photo, Technical, Analysis
  maxConcurrentReports: integer("max_concurrent_reports").default(10),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Supervisors table
export const supervisors = pgTable("supervisors", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  region: varchar("region"), // Geographic region
  specialization: varchar("specialization"), // Technical area
  maxTeamSize: integer("max_team_size").default(15),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Work distribution tracking
export const workDistribution = pgTable("work_distribution", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").references(() => contracts.id).notNull(),
  technicianId: integer("technician_id").references(() => technicians.id),
  reportElaboratorId: varchar("report_elaborator_id").references(() => users.id),
  supervisorId: varchar("supervisor_id").references(() => users.id),
  assignedCount: integer("assigned_count").default(0),
  completedCount: integer("completed_count").default(0),
  avgCompletionTime: decimal("avg_completion_time", { precision: 6, scale: 2 }),
  lastAssignment: timestamp("last_assignment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assignment rules for intelligent distribution
export const assignmentRules = pgTable("assignment_rules", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").references(() => contracts.id),
  ruleType: varchar("rule_type").notNull(), // LOAD_BALANCE, SKILL_MATCH, REGION_MATCH
  priority: integer("priority").default(1),
  configuration: jsonb("configuration"), // JSON configuration for the rule
  active: boolean("active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ContractManager = typeof contractManagers.$inferSelect;
export type ReportElaborator = typeof reportElaborators.$inferSelect;
export type Supervisor = typeof supervisors.$inferSelect;
export type WorkDistribution = typeof workDistribution.$inferSelect;
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
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

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

// Assets/Equipment table for CMMS functionality
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assetCode: varchar("asset_code").unique().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category"), // HVAC, Electrical, Plumbing, etc.
  manufacturer: varchar("manufacturer"),
  model: varchar("model"),
  serialNumber: varchar("serial_number"),
  location: varchar("location"),
  status: varchar("status").default("OPERATIONAL"), // OPERATIONAL, UNDER_MAINTENANCE, OUT_OF_SERVICE
  purchaseDate: date("purchase_date"),
  warrantyExpiry: date("warranty_expiry"),
  lastMaintenanceDate: date("last_maintenance_date"),
  nextMaintenanceDate: date("next_maintenance_date"),
  qrCode: varchar("qr_code"),
  documentationUrl: varchar("documentation_url"),
  imageUrl: varchar("image_url"),
  contractId: integer("contract_id").references(() => contracts.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Preventive Maintenance Plans
export const maintenancePlans = pgTable("maintenance_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  assetId: integer("asset_id").references(() => assets.id),
  frequency: varchar("frequency").notNull(), // DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
  frequencyValue: integer("frequency_value").default(1), // Every X days/weeks/months
  triggerType: varchar("trigger_type").default("TIME"), // TIME, METER, CONDITION
  lastExecuted: timestamp("last_executed"),
  nextDue: timestamp("next_due"),
  isActive: boolean("is_active").default(true),
  checklistTemplate: jsonb("checklist_template"), // JSON array of checklist items
  estimatedDuration: integer("estimated_duration"), // in minutes
  priority: varchar("priority").default("MEDIA"), // BAIXA, MEDIA, ALTA, URGENTE
  technicianId: integer("technician_id").references(() => technicians.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory/Parts Management
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  partNumber: varchar("part_number").unique().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category"),
  unit: varchar("unit").default("UN"), // UN, KG, M, L
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).default("0"),
  minimumStock: decimal("minimum_stock", { precision: 10, scale: 2 }).default("0"),
  maximumStock: decimal("maximum_stock", { precision: 10, scale: 2 }),
  location: varchar("location"),
  supplier: varchar("supplier"),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory Transactions
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id),
  workOrderId: integer("work_order_id").references(() => workOrders.id),
  transactionType: varchar("transaction_type").notNull(), // IN, OUT, ADJUSTMENT
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  performedBy: varchar("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Configuration
export const systemConfig = pgTable("system_config", {
  id: serial("id").primaryKey(),
  key: varchar("key").unique().notNull(),
  value: jsonb("value").notNull(),
  category: varchar("category"), // GENERAL, EMAIL, NOTIFICATIONS, INTEGRATIONS
  description: text("description"),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new tables
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMaintenancePlanSchema = createInsertSchema(maintenancePlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({ id: true, createdAt: true });
export const insertSystemConfigSchema = createInsertSchema(systemConfig).omit({ id: true, updatedAt: true });

// Types for new tables
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type MaintenancePlan = typeof maintenancePlans.$inferSelect;
export type InsertMaintenancePlan = z.infer<typeof insertMaintenancePlanSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;

export type MonthlyTrend = {
  month: string;
  completed: number;
  created: number;
};

// Insert schema and types for auxiliares
export const insertAuxiliarSchema = createInsertSchema(auxiliares).omit({ id: true, createdAt: true });
export type Auxiliar = typeof auxiliares.$inferSelect;
export type InsertAuxiliar = z.infer<typeof insertAuxiliarSchema>;

// Enums for Preventivas
export const situationStatusEnum = pgEnum('situation_status', [
  'ENVIADA_ORCAMENTO',
  'FORNECEDOR_ACIONADO',
  'LEVANTAMENTO_OK',
  'ORCAMENTO_APROVADO_RETORNO_FORNECEDOR',
  'RETORNO_FORNECEDOR',
  'SERVICO_CONCLUIDO',
  'SERVICO_CONCLUIDO_PENDENTE_RELATORIO'
]);

export const executionStatusEnum = pgEnum('execution_status', [
  'ABERTA',
  'CONCLUIDA',
  'PARCIAL'
]);

export const schedulingStatusEnum = pgEnum('scheduling_status', [
  'AGENDADO',
  'EXECUTANDO'
]);

// Preventive Maintenance Orders table (RAT)
export const preventiveMaintenanceOrders = pgTable("preventive_maintenance_orders", {
  id: serial("id").primaryKey(),
  reportCreatorId: integer("report_creator_id").references(() => technicians.id),
  surveyDate: date("survey_date"),
  contractNumber: varchar("contract_number", { length: 50 }),
  workOrderNumber: varchar("work_order_number", { length: 50 }).unique(),
  equipmentPrefix: varchar("equipment_prefix", { length: 20 }),
  agencyName: varchar("agency_name", { length: 100 }),
  preventiveBudgetValue: decimal("preventive_budget_value", { precision: 10, scale: 2 }),
  portalDeadline: date("portal_deadline"),
  situationStatus: situationStatusEnum("situation_status"),
  preventiveTechnicianId: integer("preventive_technician_id").references(() => technicians.id),
  scheduledDate: date("scheduled_date"),
  scheduledStatus: schedulingStatusEnum("scheduled_status").default('AGENDADO'),
  difficultiesNotes: text("difficulties_notes"),
  executionStatus: executionStatusEnum("execution_status"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Preventivas insert schema
export const insertPreventiveMaintenanceOrderSchema = createInsertSchema(preventiveMaintenanceOrders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPreventiveMaintenanceOrder = z.infer<typeof insertPreventiveMaintenanceOrderSchema>;
export type PreventiveMaintenanceOrder = typeof preventiveMaintenanceOrders.$inferSelect;
