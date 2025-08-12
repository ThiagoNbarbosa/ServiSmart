import ExcelJS from "exceljs";

interface ExcelAnalysis {
  headers: string[];
  sampleRows: any[][];
  totalRows: number;
  suggestedMapping: { [key: string]: number };
}

export class FlexibleExcelReader {
  
  // Analyze Excel structure and suggest column mapping
  static async analyzeExcel(buffer: Buffer): Promise<ExcelAnalysis> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
      throw new Error('Planilha não encontrada');
    }

    // Find header row (usually first non-empty row)
    let headerRow = 1;
    let headers: string[] = [];
    
    for (let rowNumber = 1; rowNumber <= Math.min(5, worksheet.rowCount); rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      if (row.hasValues) {
        const rowValues = [];
        for (let col = 1; col <= 20; col++) {
          const cell = row.getCell(col);
          const value = cell.value?.toString().trim() || '';
          rowValues.push(value);
        }
        
        // Check if this looks like a header row
        if (this.looksLikeHeaders(rowValues)) {
          headerRow = rowNumber;
          headers = rowValues.filter(h => h.length > 0);
          break;
        }
      }
    }

    // Get sample data rows
    const sampleRows: any[][] = [];
    const startRow = headerRow + 1;
    const maxSampleRows = Math.min(5, worksheet.rowCount - headerRow);
    
    for (let i = 0; i < maxSampleRows; i++) {
      const row = worksheet.getRow(startRow + i);
      if (row.hasValues) {
        const rowData = [];
        for (let col = 1; col <= headers.length; col++) {
          const cell = row.getCell(col);
          rowData.push(cell.value?.toString() || '');
        }
        sampleRows.push(rowData);
      }
    }

    // Suggest column mapping based on header names
    const suggestedMapping = this.suggestColumnMapping(headers);

    return {
      headers,
      sampleRows,
      totalRows: worksheet.rowCount - headerRow,
      suggestedMapping
    };
  }

  // Check if row contains header-like values
  private static looksLikeHeaders(values: string[]): boolean {
    const headerPatterns = [
      /elaborador|relatório/i,
      /data|levantamento/i,
      /contrato/i,
      /^os$/i,
      /prefixo/i,
      /agência|agencia/i,
      /valor|orçamento|orcamento/i,
      /vencimento|portal/i,
      /situação|situacao/i,
      /técnico|tecnico|preventiva/i,
      /agendamento/i,
      /dificuldades/i,
      /status/i
    ];

    const nonEmptyValues = values.filter(v => v.length > 0);
    if (nonEmptyValues.length < 3) return false;

    // Check if at least 30% of values match header patterns
    const matchCount = nonEmptyValues.filter(value => 
      headerPatterns.some(pattern => pattern.test(value))
    ).length;

    return matchCount >= Math.max(3, nonEmptyValues.length * 0.3);
  }

  // Suggest mapping based on column headers
  private static suggestColumnMapping(headers: string[]): { [key: string]: number } {
    const mapping: { [key: string]: number } = {};
    
    const fieldMappings = {
      reportCreator: /elaborador|relatório|criador/i,
      surveyDate: /data.*levantamento|levantamento.*data/i,
      contractNumber: /contrato|contract/i,
      workOrderNumber: /^os$|ordem.*serviço|work.*order/i,
      equipmentPrefix: /prefixo|equipment/i,
      agencyName: /agência|agencia|agency/i,
      preventiveBudgetValue: /valor.*preventiva|orçamento|orcamento|budget/i,
      portalDeadline: /vencimento.*portal|portal.*vencimento|deadline/i,
      situationStatus: /situação|situacao|situation/i,
      preventiveTechnician: /técnico.*preventiva|tecnico.*preventiva|technician/i,
      scheduledDate: /data.*agendamento|agendamento.*data|scheduled/i,
      difficultiesNotes: /dificuldades|difficulties|notes/i,
      executionStatus: /status.*execução|execucao.*status|execution.*status|^status$/i
    };

    headers.forEach((header, index) => {
      Object.entries(fieldMappings).forEach(([field, pattern]) => {
        if (pattern.test(header) && !mapping[field]) {
          mapping[field] = index;
        }
      });
    });

    return mapping;
  }

  // Read data with flexible mapping
  static async readWithMapping(
    buffer: Buffer, 
    columnMapping: { [key: string]: number },
    headerRow: number = 1
  ): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
      throw new Error('Planilha não encontrada');
    }

    const data: any[] = [];
    const startRow = headerRow + 1;

    for (let rowNumber = startRow; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      if (!row.hasValues) continue;

      const rowData: any = {};
      
      // Map each field based on column mapping
      Object.entries(columnMapping).forEach(([field, columnIndex]) => {
        if (columnIndex >= 0) {
          const cell = row.getCell(columnIndex + 1); // Excel is 1-indexed
          let value = cell.value;
          
          // Handle different cell types
          if (value instanceof Date) {
            rowData[field] = value;
          } else if (typeof value === 'number') {
            // Check if it's an Excel date serial number
            if (field.includes('Date') || field.includes('Deadline')) {
              rowData[field] = this.parseExcelDate(value);
            } else {
              rowData[field] = value;
            }
          } else {
            const stringValue = value?.toString().trim() || '';
            
            if (field.includes('Date') || field.includes('Deadline')) {
              rowData[field] = this.parseExcelDate(stringValue);
            } else if (field === 'preventiveBudgetValue') {
              rowData[field] = this.parseNumber(stringValue);
            } else {
              rowData[field] = stringValue;
            }
          }
        }
      });

      // Only add rows with essential data
      if (rowData.workOrderNumber || rowData.agencyName) {
        data.push(rowData);
      }
    }

    return data;
  }

  private static parseExcelDate(value: any): Date | null {
    if (!value) return null;
    
    if (value instanceof Date) return value;
    
    if (typeof value === 'string') {
      // Try different date formats
      const dateFormats = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
        /(\d{4})-(\d{1,2})-(\d{1,2})/,
        /(\d{1,2})-(\d{1,2})-(\d{4})/
      ];
      
      for (const format of dateFormats) {
        const match = value.match(format);
        if (match) {
          const [, day, month, year] = match;
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return isNaN(date.getTime()) ? null : date;
        }
      }
    }
    
    // Excel serial number
    if (typeof value === 'number' && value > 25569) { // Excel epoch
      return new Date((value - 25569) * 86400 * 1000);
    }
    
    return null;
  }

  private static parseNumber(value: string): number {
    if (!value) return 0;
    
    // Remove currency symbols and clean up
    const cleaned = value.replace(/[R$\s.,]/g, '').replace(/,/g, '.');
    const parsed = parseFloat(cleaned);
    
    return isNaN(parsed) ? 0 : parsed;
  }

  // Normalize status values to database enums
  static normalizeStatus(value: string, type: 'situation' | 'execution'): string {
    if (!value) return '';
    
    const normalized = value.toUpperCase().trim();
    
    if (type === 'situation') {
      const situationMap: { [key: string]: string } = {
        'ENVIADA PARA ORCAMENTO': 'ENVIADA_ORCAMENTO',
        'ENVIADA P/ ORCAMENTO': 'ENVIADA_ORCAMENTO',
        'FORNECEDOR ACIONADO': 'FORNECEDOR_ACIONADO',
        'LEVANTAMENTO OK': 'LEVANTAMENTO_OK',
        'ORCAMENTO APROVADO': 'ORCAMENTO_APROVADO_RETORNO_FORNECEDOR',
        'RETORNO AO FORNECEDOR': 'RETORNO_FORNECEDOR',
        'RETORNO FORNECEDOR': 'RETORNO_FORNECEDOR',
        'SERVICO CONCLUIDO': 'SERVICO_CONCLUIDO',
        'SERVIÇO CONCLUÍDO': 'SERVICO_CONCLUIDO',
        'PENDENTE RELATORIO': 'SERVICO_CONCLUIDO_PENDENTE_RELATORIO'
      };
      
      return situationMap[normalized] || normalized;
    }
    
    if (type === 'execution') {
      const executionMap: { [key: string]: string } = {
        'ABERTA': 'ABERTA',
        'CONCLUIDA': 'CONCLUIDA',
        'CONCLUÍDO': 'CONCLUIDA',
        'CONCLUÍDA': 'CONCLUIDA',
        'PARCIAL': 'PARCIAL',
        'EM ANDAMENTO': 'PARCIAL'
      };
      
      return executionMap[normalized] || 'ABERTA';
    }
    
    return normalized;
  }
}