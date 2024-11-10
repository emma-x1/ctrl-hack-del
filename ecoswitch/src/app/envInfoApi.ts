import Papa from 'papaparse';

// Define the response structure for filtered data
interface FilteredCompanyData {
  companyName: string;
  environmentalIntensity: string;
}

// Desired columns to extract from CSV data
const desiredColumns = ['Company Name', 'Total Environmental Intensity (Revenue)'];

// Stream search function
export function getEnvInfo(csvFilePath: string, companyName: string): Promise<{ success: boolean; answer: string | FilteredCompanyData; failedReason?: string }> {
  return new Promise((resolve, reject) => {
    let found = false;
    const regex = new RegExp(companyName.trim(), 'i'); // Case-insensitive search

    Papa.parse<FilteredCompanyData>(csvFilePath, {
      download: true,
      header: true,
      step: (row) => {
        if (found) return; // Stop if we've already found a match

        // Check if this row matches the desired company
        const companyData = {
          companyName: row.data['Company Name'],
          environmentalIntensity: row.data['Total Environmental Intensity (Revenue)']
        };

        if (regex.test(companyData.companyName)) {
          found = true;
          resolve({
            success: true,
            answer: companyData,
          });
        }
      },
      complete: () => {
        // If no match is found after parsing all rows
        if (!found) {
          resolve({
            success: false,
            answer: 'Company not found',
          });
        }
      },
      error: (error) => {
        reject({
          success: false,
          failedReason: error.message,
          answer: '',
        });
      }
    });
  });
}
