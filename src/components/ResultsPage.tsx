import { useState } from 'react';
import { Download, ShieldCheck, AlertTriangle, Database } from 'lucide-react';
import type { ValidationResult } from '../types';

interface ResultsPageProps {
  result: ValidationResult;
  onDownloadCleaned: () => void;
  onDownloadErrors: () => void;
  onReset: () => void;
}

export default function ResultsPage({ result, onDownloadCleaned, onDownloadErrors, onReset }: ResultsPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(result.errors.length / itemsPerPage);
  const paginatedErrors = result.errors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex-grow pt-32 pb-20 px-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-[#e5e2e3] mb-2 drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]">
            Validation Analysis Complete
          </h1>
          <p className="text-lg text-[#bbc9cf]">
            Review anomalies and extract cleansed datasets.
          </p>
        </div>
        <button onClick={onReset} className="text-[#a4e6ff] hover:underline text-sm font-semibold">Upload New File</button>
      </div>

      {/* Summary Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="rounded-xl p-6 border border-[#00d1ff]/20 bg-[#131314]/40 backdrop-blur-md shadow-[0_0_30px_-10px_rgba(0,209,255,0.2)]">
          <div className="flex items-center gap-3 mb-2">
            <Database className="text-[#00d1ff] w-6 h-6" />
            <h3 className="text-sm font-bold text-[#bbc9cf] uppercase tracking-widest">Total Rows Processed</h3>
          </div>
          <p className="text-4xl font-black text-[#00d1ff] font-mono">{result.summary.totalRows.toLocaleString()}</p>
        </div>

        <div className="rounded-xl p-6 border border-[#39fb88]/20 bg-[#131314]/40 backdrop-blur-md shadow-[0_0_30px_-10px_rgba(57,251,136,0.2)]">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-[#39fb88] w-6 h-6" />
            <h3 className="text-sm font-bold text-[#bbc9cf] uppercase tracking-widest">Valid Transactions</h3>
          </div>
          <p className="text-4xl font-black text-[#39fb88] font-mono">{result.summary.validRows.toLocaleString()}</p>
        </div>

        <div className="rounded-xl p-6 border border-[#ffb4ab]/20 bg-[#131314]/40 backdrop-blur-md shadow-[0_0_30px_-10px_rgba(255,180,171,0.2)]">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-[#ffb4ab] w-6 h-6" />
            <h3 className="text-sm font-bold text-[#bbc9cf] uppercase tracking-widest">Validation Errors</h3>
          </div>
          <p className="text-4xl font-black text-[#ffb4ab] font-mono">{result.summary.invalidRows.toLocaleString()}</p>
        </div>
      </section>

      {/* Main Section: Error Log Table */}
      {result.errors.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#e5e2e3]">Error Log</h2>
            <span className="px-3 py-1 bg-[#ffb4ab]/10 text-[#ffb4ab] text-xs font-bold rounded-full">
              {result.errors.length} Issues Detected
            </span>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#131314]/40 backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#2a2a2b]/80 border-b border-white/10">
                    <th className="py-4 px-6 text-xs font-bold text-[#bbc9cf] uppercase tracking-widest">Row #</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#bbc9cf] uppercase tracking-widest">Field</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#bbc9cf] uppercase tracking-widest">Issue Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedErrors.map((error, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-sm font-mono text-[#e5e2e3]">{error.row}</td>
                      <td className="py-4 px-6 text-sm font-mono text-[#a4e6ff]">{error.field}</td>
                      <td className="py-4 px-6 text-sm text-[#e5e2e3]">{error.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#1c1b1c]/80">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/5 rounded text-sm text-[#bbc9cf] hover:text-[#e5e2e3] disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-[#bbc9cf]">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/5 rounded text-sm text-[#bbc9cf] hover:text-[#e5e2e3] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Action Area */}
      <section className="flex flex-wrap gap-6 justify-center">
        <button 
          onClick={onDownloadCleaned}
          className="group relative px-8 py-4 bg-[#00d1ff]/10 border border-[#00d1ff]/50 text-[#a4e6ff] font-bold text-lg rounded-xl hover:bg-[#00d1ff]/20 transition-all duration-300 flex items-center gap-3 shadow-[0_0_20px_-5px_rgba(0,209,255,0.3)] hover:shadow-[0_0_30px_0_rgba(0,209,255,0.5)]"
        >
          <Download className="group-hover:translate-y-1 transition-transform" />
          Download Cleaned Data
        </button>

        <button 
          onClick={onDownloadErrors}
          className="group relative px-8 py-4 bg-[#bd00ff]/10 border border-[#bd00ff]/50 text-[#ecb2ff] font-bold text-lg rounded-xl hover:bg-[#bd00ff]/20 transition-all duration-300 flex items-center gap-3 shadow-[0_0_20px_-5px_rgba(189,0,255,0.3)] hover:shadow-[0_0_30px_0_rgba(189,0,255,0.5)]"
        >
          <AlertTriangle className="group-hover:scale-110 transition-transform" />
          Download Error Report
        </button>
      </section>
    </div>
  );
}
