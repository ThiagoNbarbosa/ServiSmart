import ExcelJS from 'exceljs';
import { db } from './db';
import { workOrders, technicians, contracts } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface ExcelRow {
  responsavel?: string;
  dataLevantamento?: Date;
  contrato?: string;
  os?: string;
  pref?: string;
  agencia?: string;
  valor?: string;
  vencimento?: Date;
  situacao?: string;
  tecnico?: string;
  agendamento?: Date;
  dificuldade?: string;
  status?: string;
}

async function importPreventivas() {
  console.log('🔄 Iniciando importação da planilha PREVENTIVAS...');
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('../attached_assets/PREVENTIVAS_1753452081318.xlsx');
  
  const worksheet = workbook.getWorksheet(1);
  console.log(`📊 Planilha carregada: ${worksheet.rowCount} linhas`);
  
  // Mapear técnicos únicos
  const techniciansSet = new Set<string>();
  const contractsSet = new Set<string>();
  const workOrdersData: any[] = [];
  
  let processedRows = 0;
  let importedCount = 0;
  
  // Processar apenas OSs com STATUS ABERTA e dados recentes (últimos 6 meses)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  for (let rowNumber = 2; rowNumber <= Math.min(worksheet.rowCount, 10000); rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    
    try {
      const data: ExcelRow = {
        responsavel: row.getCell(1).value?.toString(),
        dataLevantamento: row.getCell(2).value as Date,
        contrato: row.getCell(3).value?.toString(),
        os: row.getCell(4).value?.toString(),
        pref: row.getCell(5).value?.toString(),
        agencia: row.getCell(6).value?.toString(),
        valor: row.getCell(7).value?.toString(),
        vencimento: row.getCell(8).value as Date,
        situacao: row.getCell(9).value?.toString(),
        tecnico: row.getCell(10).value?.toString(),
        agendamento: row.getCell(11).value as Date,
        dificuldade: row.getCell(12).value?.toString(),
        status: row.getCell(13).value?.toString()
      };
      
      // Filtrar apenas OSs ativas e com dados relevantes
      if (!data.os || !data.agencia || !data.status) {
        continue;
      }
      
      // Normalizar status
      let normalizedStatus = 'PENDENTE';
      if (data.status === 'ABERTA') normalizedStatus = 'PENDENTE';
      else if (data.status === 'FECHADA' || data.situacao?.includes('Concluí')) normalizedStatus = 'CONCLUIDA';
      else if (data.status === 'AGENDADA' || data.agendamento) normalizedStatus = 'AGENDADA';
      
      // Adicionar técnico se não existe
      if (data.tecnico && data.tecnico.trim()) {
        techniciansSet.add(data.tecnico.trim().toUpperCase());
      }
      
      // Adicionar contrato se não existe
      if (data.contrato && data.contrato.trim()) {
        contractsSet.add(data.contrato.trim());
      }
      
      // Criar título da OS baseado nos dados da planilha
      const title = `${data.situacao || 'OS'} - ${data.agencia} - ${data.pref || ''}`.slice(0, 255);
      
      // Preparar dados da OS
      const workOrderData = {
        osNumber: data.os,
        title: title,
        description: `${data.situacao || ''}\nContrato: ${data.contrato || ''}\nDificuldade: ${data.dificuldade || ''}`.slice(0, 1000),
        status: normalizedStatus,
        priority: data.dificuldade?.includes('ALTA') ? 'ALTA' : 
                 data.dificuldade?.includes('MÉDIA') ? 'MEDIA' : 'BAIXA',
        location: data.agencia,
        equipmentName: data.pref || '',
        scheduledDate: data.vencimento || data.agendamento,
        technicianName: data.tecnico?.trim().toUpperCase(),
        contractName: data.contrato,
        createdAt: data.dataLevantamento || new Date(),
        updatedAt: new Date()
      };
      
      workOrdersData.push(workOrderData);
      processedRows++;
      
      if (processedRows % 1000 === 0) {
        console.log(`⏳ Processadas ${processedRows} linhas...`);
      }
      
    } catch (error) {
      console.warn(`⚠️ Erro na linha ${rowNumber}:`, error);
      continue;
    }
  }
  
  console.log(`✅ Processamento concluído: ${processedRows} OSs válidas encontradas`);
  
  // Inserir técnicos únicos
  console.log('👥 Inserindo técnicos...');
  for (const technicianName of techniciansSet) {
    try {
      await db.insert(technicians).values({
        name: technicianName,
        active: true
      }).onConflictDoNothing();
    } catch (error) {
      console.warn(`⚠️ Erro ao inserir técnico ${technicianName}:`, error);
    }
  }
  
  // Inserir contratos únicos
  console.log('📋 Inserindo contratos...');
  for (const contractName of contractsSet) {
    try {
      await db.insert(contracts).values({
        name: contractName,
        company: contractName.split(' - ')[0] || contractName,
        active: true
      }).onConflictDoNothing();
    } catch (error) {
      console.warn(`⚠️ Erro ao inserir contrato ${contractName}:`, error);
    }
  }
  
  // Buscar IDs dos técnicos e contratos
  const allTechnicians = await db.select().from(technicians);
  const allContracts = await db.select().from(contracts);
  
  const technicianMap = new Map(allTechnicians.map(t => [t.name, t.id]));
  const contractMap = new Map(allContracts.map(c => [c.name, c.id]));
  
  // Inserir OSs
  console.log('📝 Inserindo Ordens de Serviço...');
  for (const woData of workOrdersData) {
    try {
      const technicianId = woData.technicianName ? technicianMap.get(woData.technicianName) : null;
      const contractId = woData.contractName ? contractMap.get(woData.contractName) : null;
      
      await db.insert(workOrders).values({
        osNumber: woData.osNumber,
        title: woData.title,
        description: woData.description,
        status: woData.status,
        priority: woData.priority,
        location: woData.location,
        equipmentName: woData.equipmentName,
        scheduledDate: woData.scheduledDate,
        technicianId: technicianId,
        contractId: contractId,
        createdAt: woData.createdAt,
        updatedAt: woData.updatedAt
      }).onConflictDoUpdate({
        target: workOrders.osNumber,
        set: {
          title: woData.title,
          description: woData.description,
          status: woData.status,
          priority: woData.priority,
          location: woData.location,
          equipmentName: woData.equipmentName,
          scheduledDate: woData.scheduledDate,
          technicianId: technicianId,
          contractId: contractId,
          updatedAt: new Date()
        }
      });
      
      importedCount++;
      
      if (importedCount % 500 === 0) {
        console.log(`💾 Importadas ${importedCount} OSs...`);
      }
      
    } catch (error) {
      console.warn(`⚠️ Erro ao inserir OS ${woData.osNumber}:`, error);
    }
  }
  
  console.log(`🎉 Importação concluída! ${importedCount} OSs importadas com sucesso`);
  
  // Estatísticas finais
  const stats = await db.select().from(workOrders);
  console.log(`📊 Total de OSs no sistema: ${stats.length}`);
  
  return {
    processedRows,
    importedCount,
    techniciansCount: techniciansSet.size,
    contractsCount: contractsSet.size
  };
}

export { importPreventivas };

// Executar importação
importPreventivas()
  .then((result) => {
    console.log('✅ Importação concluída:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  });