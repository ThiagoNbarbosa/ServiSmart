import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

interface ExcelColumnInfo {
  index: number;
  header: string;
  sampleData: string[];
}

export async function analyzeExcelStructure(filePath: string): Promise<{
  sheets: string[];
  columns: ExcelColumnInfo[];
  totalRows: number;
  sampleRows: any[];
}> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const sheets = workbook.worksheets.map(ws => ws.name);
  const worksheet = workbook.worksheets[0]; // Use first sheet
  
  const columns: ExcelColumnInfo[] = [];
  const sampleRows: any[] = [];
  let totalRows = 0;
  
  // Get header row (first row)
  const headerRow = worksheet.getRow(1);
  const maxColumns = headerRow.cellCount;
  
  // Extract column headers
  for (let col = 1; col <= maxColumns; col++) {
    const cell = headerRow.getCell(col);
    const header = cell.value?.toString() || `Column ${col}`;
    
    columns.push({
      index: col,
      header: header,
      sampleData: []
    });
  }
  
  // Extract sample data from first 10 rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    if (rowNumber > 11) return; // Limit to 10 sample rows
    
    const rowData: any = {};
    row.eachCell((cell, colNumber) => {
      const header = columns[colNumber - 1]?.header || `Column ${colNumber}`;
      const value = cell.value?.toString() || '';
      
      rowData[header] = value;
      
      // Add to sample data for column analysis
      if (columns[colNumber - 1] && columns[colNumber - 1].sampleData.length < 5) {
        columns[colNumber - 1].sampleData.push(value);
      }
    });
    
    sampleRows.push(rowData);
    totalRows = rowNumber - 1; // Subtract header row
  });
  
  return {
    sheets,
    columns,
    totalRows,
    sampleRows
  };
}

// Function to suggest column mappings based on content
export function suggestColumnMapping(columns: ExcelColumnInfo[]): {
  osNumber?: number;
  description?: number;
  equipment?: number;
  location?: number;
  scheduledDate?: number;
  priority?: number;
  technician?: number;
} {
  const mapping: any = {};
  
  columns.forEach((col, index) => {
    const header = col.header.toLowerCase();
    const samples = col.sampleData.join(' ').toLowerCase();
    
    // OS Number detection
    if (header.includes('os') || header.includes('ordem') || header.includes('número')) {
      mapping.osNumber = index + 1;
    }
    
    // Description detection
    if (header.includes('descrição') || header.includes('descricao') || header.includes('título') || header.includes('titulo')) {
      mapping.description = index + 1;
    }
    
    // Equipment detection
    if (header.includes('equipamento') || header.includes('máquina') || header.includes('maquina')) {
      mapping.equipment = index + 1;
    }
    
    // Location detection  
    if (header.includes('local') || header.includes('localização') || header.includes('localizacao') || header.includes('setor')) {
      mapping.location = index + 1;
    }
    
    // Date detection
    if (header.includes('data') || header.includes('prazo') || header.includes('vencimento')) {
      mapping.scheduledDate = index + 1;
    }
    
    // Priority detection
    if (header.includes('prioridade') || header.includes('urgência') || header.includes('urgencia')) {
      mapping.priority = index + 1;
    }
    
    // Technician detection
    if (header.includes('técnico') || header.includes('tecnico') || header.includes('responsável') || header.includes('responsavel')) {
      mapping.technician = index + 1;
    }
  });
  
  return mapping;
}