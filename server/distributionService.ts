import { db } from "./db";
import { 
  workOrders, 
  technicians, 
  reportElaborators, 
  supervisors, 
  contractManagers,
  workDistribution,
  assignmentRules,
  type WorkOrder,
  type Technician,
  type User,
  type ContractManager,
  type ReportElaborator,
  type Supervisor
} from "@shared/schema";
import { eq, and, count, avg, desc, asc } from "drizzle-orm";

interface AssignmentResult {
  technicianId?: number;
  reportElaboratorId?: string;
  supervisorId?: string;
  contractManagerId?: string;
  strategy: string;
  reason: string;
}

interface WorkloadStats {
  userId: string;
  assignedCount: number;
  completedCount: number;
  avgCompletionTime: number;
  lastAssignment: Date | null;
}

export class IntelligentDistributionService {
  
  /**
   * Sistema de distribuição inteligente baseado em seleção do supervisor
   * Garante distribuição equilibrada entre técnicos e contratos
   */
  async distributeWorkOrder(
    workOrderId: number, 
    contractId: number, 
    supervisorId: string,
    assignmentStrategy: 'AUTO' | 'MANUAL' | 'BALANCED' = 'BALANCED'
  ): Promise<AssignmentResult> {
    
    const workOrder = await this.getWorkOrder(workOrderId);
    if (!workOrder) {
      throw new Error("Ordem de serviço não encontrada");
    }

    switch (assignmentStrategy) {
      case 'BALANCED':
        return await this.balancedAssignment(contractId, supervisorId);
      case 'AUTO':
        return await this.autoAssignment(contractId, supervisorId);
      case 'MANUAL':
        return await this.manualAssignment(supervisorId);
      default:
        return await this.balancedAssignment(contractId, supervisorId);
    }
  }

  /**
   * Distribuição balanceada - prioridade principal
   * Evita sobrecarga em um técnico ou contrato específico
   */
  private async balancedAssignment(contractId: number, supervisorId: string): Promise<AssignmentResult> {
    // 1. Buscar técnicos disponíveis
    const availableTechnicians = await this.getAvailableTechnicians();
    
    // 2. Calcular carga de trabalho atual por técnico
    const technicianWorkloads = await this.getTechnicianWorkloads();
    
    // 3. Buscar elaboradores de relatório disponíveis
    const availableElaborators = await this.getAvailableReportElaborators();
    
    // 4. Calcular carga de trabalho por elaborador
    const elaboratorWorkloads = await this.getElaboratorWorkloads();
    
    // 5. Buscar gestor do contrato
    const contractManager = await this.getContractManager(contractId);
    
    // 6. Selecionar técnico com menor carga
    const selectedTechnician = this.selectLeastLoadedTechnician(
      availableTechnicians, 
      technicianWorkloads
    );
    
    // 7. Selecionar elaborador com menor carga
    const selectedElaborator = this.selectLeastLoadedElaborator(
      availableElaborators,
      elaboratorWorkloads
    );

    // 8. Atualizar estatísticas de distribuição
    await this.updateDistributionStats(
      contractId, 
      selectedTechnician?.id, 
      selectedElaborator?.userId, 
      supervisorId
    );

    return {
      technicianId: selectedTechnician?.id,
      reportElaboratorId: selectedElaborator?.userId,
      supervisorId: supervisorId,
      contractManagerId: contractManager?.userId,
      strategy: 'BALANCED',
      reason: `Distribuição balanceada: Técnico ${selectedTechnician?.name} (${technicianWorkloads.find(w => w.userId === selectedTechnician?.userId?.toString())?.assignedCount || 0} tarefas), Elaborador (${elaboratorWorkloads.find(w => w.userId === selectedElaborator?.userId)?.assignedCount || 0} relatórios)`
    };
  }

  /**
   * Distribuição automática baseada em regras e histórico
   */
  private async autoAssignment(contractId: number, supervisorId: string): Promise<AssignmentResult> {
    // Buscar regras de atribuição ativas para o contrato
    const rules = await db
      .select()
      .from(assignmentRules)
      .where(and(
        eq(assignmentRules.contractId, contractId),
        eq(assignmentRules.active, true)
      ))
      .orderBy(desc(assignmentRules.priority));

    // Aplicar regras de distribuição
    for (const rule of rules) {
      const result = await this.applyAssignmentRule(rule, supervisorId);
      if (result) {
        return {
          ...result,
          strategy: 'AUTO',
          reason: `Regra automática aplicada: ${rule.ruleType}`
        };
      }
    }

    // Fallback para distribuição balanceada
    return await this.balancedAssignment(contractId, supervisorId);
  }

  /**
   * Atribuição manual - supervisor escolhe
   */
  private async manualAssignment(supervisorId: string): Promise<AssignmentResult> {
    return {
      supervisorId: supervisorId,
      strategy: 'MANUAL',
      reason: 'Atribuição manual pelo supervisor - aguardando seleção'
    };
  }

  /**
   * Buscar técnicos disponíveis e ativos
   */
  private async getAvailableTechnicians(): Promise<Technician[]> {
    return await db
      .select()
      .from(technicians)
      .where(eq(technicians.active, true));
  }

  /**
   * Buscar elaboradores de relatório disponíveis
   */
  private async getAvailableReportElaborators(): Promise<ReportElaborator[]> {
    return await db
      .select()
      .from(reportElaborators)
      .where(eq(reportElaborators.active, true));
  }

  /**
   * Calcular carga de trabalho atual dos técnicos
   */
  private async getTechnicianWorkloads(): Promise<WorkloadStats[]> {
    const workloads = await db
      .select({
        technicianId: workOrders.technicianId,
        assignedCount: count(workOrders.id),
        avgCompletionTime: avg(workOrders.actualHours)
      })
      .from(workOrders)
      .where(eq(workOrders.status, 'PENDENTE'))
      .groupBy(workOrders.technicianId);

    return workloads.map(w => ({
      userId: w.technicianId?.toString() || '',
      assignedCount: Number(w.assignedCount),
      completedCount: 0,
      avgCompletionTime: Number(w.avgCompletionTime) || 0,
      lastAssignment: null
    }));
  }

  /**
   * Calcular carga de trabalho dos elaboradores
   */
  private async getElaboratorWorkloads(): Promise<WorkloadStats[]> {
    const workloads = await db
      .select({
        reportElaboratorId: workOrders.reportElaboratorId,
        assignedCount: count(workOrders.id)
      })
      .from(workOrders)
      .where(eq(workOrders.status, 'PENDENTE'))
      .groupBy(workOrders.reportElaboratorId);

    return workloads.map(w => ({
      userId: w.reportElaboratorId || '',
      assignedCount: Number(w.assignedCount),
      completedCount: 0,
      avgCompletionTime: 0,
      lastAssignment: null
    }));
  }

  /**
   * Selecionar técnico com menor carga de trabalho
   */
  private selectLeastLoadedTechnician(
    technicians: Technician[], 
    workloads: WorkloadStats[]
  ): Technician | undefined {
    if (technicians.length === 0) return undefined;

    return technicians.reduce((selected, current) => {
      const currentLoad = workloads.find(w => w.userId === current.userId?.toString())?.assignedCount || 0;
      const selectedLoad = workloads.find(w => w.userId === selected.userId?.toString())?.assignedCount || 0;
      
      return currentLoad < selectedLoad ? current : selected;
    });
  }

  /**
   * Selecionar elaborador com menor carga de trabalho
   */
  private selectLeastLoadedElaborator(
    elaborators: ReportElaborator[], 
    workloads: WorkloadStats[]
  ): ReportElaborator | undefined {
    if (elaborators.length === 0) return undefined;

    return elaborators.reduce((selected, current) => {
      const currentLoad = workloads.find(w => w.userId === current.userId)?.assignedCount || 0;
      const selectedLoad = workloads.find(w => w.userId === selected.userId)?.assignedCount || 0;
      
      return currentLoad < selectedLoad ? current : selected;
    });
  }

  /**
   * Buscar gestor responsável pelo contrato
   */
  private async getContractManager(contractId: number): Promise<ContractManager | undefined> {
    const [manager] = await db
      .select()
      .from(contractManagers)
      .where(and(
        eq(contractManagers.contractId, contractId),
        eq(contractManagers.active, true)
      ))
      .limit(1);

    return manager;
  }

  /**
   * Atualizar estatísticas de distribuição
   */
  private async updateDistributionStats(
    contractId: number,
    technicianId?: number,
    reportElaboratorId?: string,
    supervisorId?: string
  ): Promise<void> {
    // Verificar se já existe registro
    const [existing] = await db
      .select()
      .from(workDistribution)
      .where(and(
        eq(workDistribution.contractId, contractId),
        technicianId ? eq(workDistribution.technicianId, technicianId) : undefined,
        reportElaboratorId ? eq(workDistribution.reportElaboratorId, reportElaboratorId) : undefined
      ))
      .limit(1);

    if (existing) {
      // Atualizar registro existente
      await db
        .update(workDistribution)
        .set({
          assignedCount: existing.assignedCount + 1,
          lastAssignment: new Date(),
          updatedAt: new Date()
        })
        .where(eq(workDistribution.id, existing.id));
    } else {
      // Criar novo registro
      await db
        .insert(workDistribution)
        .values({
          contractId,
          technicianId,
          reportElaboratorId,
          supervisorId,
          assignedCount: 1,
          completedCount: 0,
          lastAssignment: new Date()
        });
    }
  }

  /**
   * Buscar ordem de serviço
   */
  private async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    const [workOrder] = await db
      .select()
      .from(workOrders)
      .where(eq(workOrders.id, id))
      .limit(1);

    return workOrder;
  }

  /**
   * Aplicar regra específica de atribuição
   */
  private async applyAssignmentRule(rule: any, supervisorId: string): Promise<Partial<AssignmentResult> | null> {
    // Implementação das regras específicas
    switch (rule.ruleType) {
      case 'LOAD_BALANCE':
        return await this.applyLoadBalanceRule(rule.configuration);
      case 'SKILL_MATCH':
        return await this.applySkillMatchRule(rule.configuration);
      case 'REGION_MATCH':
        return await this.applyRegionMatchRule(rule.configuration, supervisorId);
      default:
        return null;
    }
  }

  private async applyLoadBalanceRule(config: any): Promise<Partial<AssignmentResult> | null> {
    // Implementar lógica de balanceamento de carga
    return null;
  }

  private async applySkillMatchRule(config: any): Promise<Partial<AssignmentResult> | null> {
    // Implementar lógica de correspondência de habilidades
    return null;
  }

  private async applyRegionMatchRule(config: any, supervisorId: string): Promise<Partial<AssignmentResult> | null> {
    // Implementar lógica de correspondência regional
    return null;
  }

  /**
   * Obter estatísticas de distribuição de trabalho
   */
  async getDistributionStats(contractId?: number): Promise<any[]> {
    const query = db
      .select({
        contractId: workDistribution.contractId,
        technicianId: workDistribution.technicianId,
        reportElaboratorId: workDistribution.reportElaboratorId,
        assignedCount: workDistribution.assignedCount,
        completedCount: workDistribution.completedCount,
        avgCompletionTime: workDistribution.avgCompletionTime,
        lastAssignment: workDistribution.lastAssignment
      })
      .from(workDistribution);

    if (contractId) {
      query.where(eq(workDistribution.contractId, contractId));
    }

    return await query;
  }
}

export const distributionService = new IntelligentDistributionService();