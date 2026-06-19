import Papa from 'papaparse';
import type { TransactionRow } from '../types';

export function parseCSV(file: File): Promise<TransactionRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        resolve(results.data as TransactionRow[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function downloadCleanedCSV(validData: TransactionRow[], filename: string = 'cleaned_data.csv') {
  if (validData.length === 0) {
    alert("No valid data to download.");
    return;
  }
  const csv = Papa.unparse(validData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSplitChunks(data: TransactionRow[], chunkSize: number = 5000, baseFilename: string = 'chunk') {
  if (data.length === 0) {
    alert("No valid data to split and download.");
    return;
  }
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const csv = Papa.unparse(chunk);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const partNumber = Math.floor(i / chunkSize) + 1;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${baseFilename}_part${partNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
