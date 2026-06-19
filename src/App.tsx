import { useState } from 'react';
import UploadPage from './components/UploadPage';
import ResultsPage from './components/ResultsPage';
import type { ValidationResult } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';


function App() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'results'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to process file on the server.');
      }

      const result: ValidationResult = await response.json();
      setValidationResult(result);
      setCurrentStep('results');
      
    } catch (error: any) {
      console.error('Failed to parse file:', error);
      alert(error.message || 'Failed to parse the uploaded file. Please make sure it is a valid CSV.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCleaned = () => {
    if (validationResult) {
       window.location.href = `${API_BASE}/api/download/cleaned/${validationResult.session_id}`;
    }
  };

  const handleDownloadErrors = () => {
    if (validationResult) {
       window.location.href = `${API_BASE}/api/download/errors/${validationResult.session_id}`;
    }
  };

  const handleReset = () => {
    setValidationResult(null);
    setCurrentStep('upload');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e5e2e3] font-sans overflow-x-hidden selection:bg-[#a4e6ff]/30">
      {/* Top Navbar */}
      <header className="fixed top-0 w-full z-50 bg-[#131314]/40 backdrop-blur-3xl border-b border-white/10">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold text-[#a4e6ff] tracking-tight">AuraValidator</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-[#a4e6ff] font-bold border-b-2 border-[#a4e6ff] pb-1 text-sm tracking-widest uppercase cursor-pointer">Workspace</span>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      {currentStep === 'upload' && (
        <UploadPage onProcess={handleProcessFile} isProcessing={isProcessing} />
      )}

      {currentStep === 'results' && validationResult && (
        <ResultsPage 
          result={validationResult} 
          onDownloadCleaned={handleDownloadCleaned}
          onDownloadErrors={handleDownloadErrors}
          onReset={handleReset}
        />
      )}

      {/* Footer */}
      <footer className="w-full mt-auto bg-[#0e0e0f] border-t border-white/5 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-7xl mx-auto">
          <span className="text-sm font-medium text-[#bbc9cf]">© 2024 AuraValidator. High-Stakes Fintech Security.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
