import { storage } from './storage';
import * as fs from 'fs';
import * as path from 'path';

interface PatternData {
  name: string;
  category: string;
}

export async function importPatternData(filePath: string): Promise<{
  technicians: number;
  elaborators: number;
  contracts: number;
}> {
  const csvContent = fs.readFileSync(filePath, 'latin1');
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

  return { technicians: techniciansCount, elaborators: elaboratorsCount, contracts: contractsCount };
}