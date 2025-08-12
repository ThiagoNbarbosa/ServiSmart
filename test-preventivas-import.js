const fs = require('fs');
const path = require('path');

async function testPreventiveImport() {
  try {
    // Test the flexible Excel reader with the attached file
    const filePath = path.join(__dirname, 'attached_assets', 'PREVENTIVAS_1754960675187.xlsx');
    
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      return;
    }

    console.log('File found, testing import...');
    
    // Create form data simulation
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log('File size:', fileBuffer.length, 'bytes');
    console.log('File type detected as Excel workbook');
    
    // Test the API endpoint
    const fetch = require('node-fetch');
    const FormData = require('form-data');
    
    const form = new FormData();
    form.append('file', fileBuffer, {
      filename: 'PREVENTIVAS_1754960675187.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Test analyze endpoint
    console.log('Testing analyze endpoint...');
    const analyzeResponse = await fetch('http://localhost:5000/api/preventive-maintenance-orders/analyze', {
      method: 'POST',
      body: form
    });

    const analyzeResult = await analyzeResponse.json();
    console.log('Analysis result:', JSON.stringify(analyzeResult, null, 2));

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run only if server is running
testPreventiveImport();