import { useState } from "react";
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, FileSpreadsheet, Database, ShieldCheck, Loader2 } from 'lucide-react';

const UploadModal = ({ 
  isOpen, 
  onClose, 
  invoiceFile, 
  setInvoiceFile, 
  poFile, 
  setPoFile, 
  lynxFile, 
  setLynxFile, 
  onRunDetection, 
  isProcessing 
}) => {

  const [error, setError] = useState("");

  const items = [
    { id: 'invoice', label: 'Invoice PDF', icon: <FileText size={20} />, file: invoiceFile, set: setInvoiceFile, color: 'indigo',accept: ".pdf" },
    { id: 'po', label: 'PO (SAP Export)', icon: <FileSpreadsheet size={20} />, file: poFile, set: setPoFile, color: 'emerald',accept: ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" },
    { id: 'lynx', label: 'LYNX Master Data', icon: <Database size={20} />, file: lynxFile, set: setLynxFile, color: 'violet', disabled: true,accept: ".csv, .xlsx, .xls" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay-modern">
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="modal-content-modern"
          >
            {/* Close */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="heading-modern !mb-2">Document Intake</div>
            <h2 className="font-display text-2xl font-black text-slate-900 mb-6">
              Upload File
            </h2>

            {/* Upload Section */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {items.map((item) => {

                const hasFile = item.id === 'invoice'
                  ? (item.file?.length > 0)
                  : !!item.file;

                return (
                  <div key={item.id} className="relative">

                    {/* Input */}
                    <input 
                      type="file"
                      id={`${item.id}-upload`}
                      className="hidden"
                      disabled={item.disabled}
                      multiple={item.id === 'invoice'} 
                       accept={item.accept}
                      onChange={(e) => {
                        if (item.disabled) return;

                        if (item.id === 'invoice') {
                          item.set(Array.from(e.target.files || []));
                        } else {
                          item.set(e.target.files?.[0] || null);
                        }
                      }}
                    />

                    {/* Label */}
                    <label 
                      htmlFor={`${item.id}-upload`}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all ${
                        item.disabled
                          ? 'opacity-40 cursor-not-allowed bg-slate-50'
                          : 'cursor-pointer'
                      } ${
                        hasFile
                          ? `border-${item.color}-500 bg-${item.color}-50/30`
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                      onClick={(e) => item.disabled && e.preventDefault()}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        hasFile
                          ? `bg-${item.color}-500 text-white shadow-lg shadow-${item.color}-500/20`
                          : 'bg-slate-50 text-slate-400'
                      }`}>
                        {item.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-grow">
                        <span className="block text-[12px] font-black text-slate-900">
                          {item.label}
                        </span>

                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.id === 'invoice'
                            ? (item.file?.length > 0
                                ? `${item.file.length} files selected`
                                : 'Click to select files')
                            : (item.file
                                ? item.file.name
                                : 'Click to select file')}
                        </span>
                      </div>

                      {/* Check Icon */}
                      {hasFile && (
                        <ShieldCheck size={18} className={`text-${item.color}-500`} />
                      )}
                    </label>

                  </div>
                );
              })}
            </div>

            {/* Submit */}
            <button 
              onClick={() => {
                if(!poFile || poFile.length === 0){
                  setError("Please upload all required files");
                  return;
                }
                
                setError("");
                onRunDetection();
              }}
              disabled={isProcessing}
              className="btn-primary-modern w-full py-3 justify-center rounded-xl text-[13px]"
            >
              {isProcessing
                ? <Loader2 className="animate-spin" size={18} />
                : 'Execute'}
            </button>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-xs mt-2 text-center">
                {error}
              </p>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
