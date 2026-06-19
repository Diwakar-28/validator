import { useRef, useState } from 'react';
import { UploadCloud, FileText, Shield, Rocket } from 'lucide-react';

interface UploadPageProps {
  onProcess: (file: File) => void;
  isProcessing: boolean;
}

export default function UploadPage({ onProcess, isProcessing }: UploadPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcessClick = () => {
    if (selectedFile) {
      onProcess(selectedFile);
    }
  };

  return (
    <div className="flex-grow pt-32 pb-20 px-6 w-full max-w-7xl mx-auto">
      {/* Hero Section: Upload Zone */}
      <section className="mb-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-[#a4e6ff] mb-4 drop-shadow-[0_0_12px_rgba(164,230,255,0.5)]">
            Upload Transaction Flux
          </h1>
          <p className="text-lg text-[#bbc9cf] max-w-2xl mx-auto">
            Seamlessly inject high-stakes financial datasets into our validation engine for real-time compliance auditing.
          </p>
        </div>

        <div 
          className="upload-zone cursor-pointer relative max-w-4xl mx-auto h-[400px] flex flex-col items-center justify-center rounded-xl p-8 transition-all duration-500 hover:bg-[#131314]/60"
          style={{ background: 'rgba(19, 19, 20, 0.4)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Dashed Border */}
          <div className="absolute inset-2 border-2 border-dashed border-[#a4e6ff] rounded-xl opacity-50 hover:opacity-100 transition-opacity"></div>
          
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 bg-[#a4e6ff]/10 p-6 rounded-full border border-[#a4e6ff]/20">
              <FileText className="w-16 h-16 text-[#a4e6ff]" />
            </div>
            
            <h3 className="text-2xl font-bold text-[#e5e2e3] mb-2">
              {selectedFile ? selectedFile.name : 'Drag & Drop Dataset'}
            </h3>
            
            <p className="text-base text-[#bbc9cf] mb-8">
              Support for high-density .CSV formats (Up to 2GB)
            </p>
            
            <button className="px-8 py-4 bg-[#a4e6ff] text-[#003543] font-semibold text-lg rounded-lg shadow-[0_0_30px_-10px_rgba(164,230,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2">
              <UploadCloud />
              Browse Files
            </button>
          </div>
        </div>
      </section>

      {/* Validation Standards Section */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-[#39fb88] w-6 h-6" />
          <h2 className="text-2xl font-bold text-[#e5e2e3]">Validation Standards</h2>
        </div>
        
        <div className="rounded-xl p-6" style={{ background: 'rgba(19, 19, 20, 0.4)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-[#bbc9cf] tracking-widest uppercase">PHONE FORMATS</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-[#1c1b1c] p-2 rounded">
                  <span className="text-sm font-mono text-[#39fb88]">India</span>
                  <span className="text-sm font-mono text-[#e5e2e3]">10 Digits</span>
                </div>
                <div className="flex justify-between items-center bg-[#1c1b1c] p-2 rounded">
                  <span className="text-sm font-mono text-[#39fb88]">Singapore</span>
                  <span className="text-sm font-mono text-[#e5e2e3]">8 Digits</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-[#bbc9cf] tracking-widest uppercase">TEMPORAL MAPPING</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-[#1c1b1c] p-2 rounded">
                  <span className="text-sm font-mono text-[#39fb88]">Date</span>
                  <span className="text-sm font-mono text-[#e5e2e3]">YYYY-MM-DD</span>
                </div>
                <div className="flex justify-between items-center bg-[#1c1b1c] p-2 rounded">
                  <span className="text-sm font-mono text-[#39fb88]">Time</span>
                  <span className="text-sm font-mono text-[#e5e2e3]">HH:mm:ss</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/5 lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-[#bbc9cf] tracking-widest uppercase">AUTHORIZED PAYMENT MODES</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['UPI', 'CARD', 'NETBANKING', 'COD', 'WALLET'].map((mode) => (
                  <span key={mode} className="px-3 py-1 bg-[#2a2a2b] rounded-full border border-white/10 text-sm font-mono text-[#e5e2e3]">
                    {mode}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-[#bbc9cf]/60 italic">*Case-insensitive matching enabled</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action */}
      <div className="flex flex-col items-center justify-center mt-12 gap-4">
        <button 
          onClick={handleProcessClick}
          disabled={!selectedFile || isProcessing}
          className={`relative overflow-hidden group px-12 py-5 bg-[#a4e6ff] text-[#003543] font-bold text-xl rounded-xl shadow-[0_0_30px_-10px_rgba(164,230,255,0.5)] transition-all duration-300 ${!selectedFile || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
        >
          <span className="relative z-10 flex items-center gap-3">
            {isProcessing ? 'Processing Data...' : 'Process Transaction Data'}
            <Rocket className={isProcessing ? "animate-pulse" : ""} />
          </span>
        </button>
        
        <div className="flex items-center gap-2 text-xs text-[#39fb88]">
          <Shield className="w-4 h-4" />
          End-to-End Encrypted Verification Active
        </div>
      </div>
    </div>
  );
}
