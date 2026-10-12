import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Info, BarChart3, Package, DollarSign, Truck, Tag, Hash } from 'lucide-react';

const safeValue = (value) => {
  if (value === undefined || value === null || value === '' || value === 'undefined' || value === 'nan' || value === 'None') {
    return 'N/A';
  }
  return value;
};

const formatPONumber = (value) => {
  if (value === undefined || value === null || value === '' || value === 'undefined' || value === 'nan' || value === 'None') {
    return 'N/A';
  }
  // Remove trailing ".0", ".00", etc. — e.g. "4500001234.0" -> "4500001234"
  return String(value).replace(/\.0+$/, '');
};

const AuditDetailsModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;
  const detailItems = [
    { label: 'PO Qty', value: safeValue(data["PO Quantity"]), icon: <Hash  size={16} />, color: 'text-brand-dark' },
    { label: 'Total GR Qty', value: safeValue(data["Total GR Qty"]), icon: <Package size={16} />, color: 'text-emerald-600' },
    { label: 'Total IR Qty', value: safeValue(data["Total IR Qty"]), icon: <FileText size={16} />, color: 'text-brand-yellow' },
    { label: 'Freight Amount', value: safeValue(data["Freight Amount"]), icon: <Truck size={16} />, color: 'text-brand-light' },
    { label: 'Vendor Unit Price', value: `${data["Vendor Unit Price"] ?  `${(Number(data["Vendor Unit Price"]) || 0).toFixed(1)}` : 'N/A'}`, icon: <Tag size={16} />, color: 'text-slate-600' },
    { label: 'SAP Unit Price', value: `${data["SAP Unit Price"]? `${(Number(data["SAP Unit Price"]) || 0).toFixed(1)}` : 'N/A'}`, icon: <BarChart3 size={16} />, color: 'text-brand-orange' },
  ];

    const formatCategory = (category) => {
    if (!category) return null;

    // Split by | to handle multiple categories
    const parts = category.includes('|')
      ? category.split('|').map(s => s.trim())
      : [category];

    // Rows with no issues shouldn't show a "Perfect Match" badge at all
    const visibleParts = parts.filter(p => p.trim().toLowerCase() !== 'perfect match');
    if (visibleParts.length === 0) return null;

    return (
      <div className="flex flex-col gap-1.5 py-1">
        {visibleParts.map((p, i) => {
          // Sentence case: First letter caps, rest lowercase
          const formattedP = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
          
          const isPrice = p.toLowerCase().includes('price');
          const isQty = p.toLowerCase().includes('quantity') || p.toLowerCase().includes('qty');
          const isMatched = p.toLowerCase().includes('matched') && !p.toLowerCase().includes('mis');

          return (
            <span 
              key={i} 
              className={`px-2 py-1 text-[9px] rounded-lg font-black uppercase tracking-widest border w-fit whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] bg-transparent ${
                isPrice ? 'text-brand-yellow border-brand-yellow/30' :
                isQty ? 'text-brand-dark border-brand-light/30' :
                isMatched ? 'text-emerald-700 border-emerald-200' :
                'text-brand-orange border-brand-orange/30'
              }`}
              title={formattedP}
            >
              {formattedP}
            </span>
          );
        })}
      </div>
    );
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay-modern">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 relative"
          >
            {/* Header */}
            <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                  <Info size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-black text-slate-900 tracking-tight">Analysis Deep-Dive</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">PO: {formatPONumber(data["Scrubbed PO"])} • INV: {safeValue(data["IVL ID"])}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Summary Card */}
              <div className="border border-slate-100 rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  {formatCategory(data["Engine Category"]) && (
                    <div className={`mt-1 px-2 py-0.5 rounded-lg  text-[10px] font-black uppercase tracking-wider `}>
                      {formatCategory(data["Engine Category"])}
                    </div>
                  )}
                  <p className="text-slate-700 font-medium leading-relaxed">{data["AI Reasoning"] || "No reasoning available"}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {detailItems.map((item, idx) => (
                  <motion.div 
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`flex items-center gap-2 mb-2 ${item.color}`}>
                      {item.icon}
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{item.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Action Footer */}
              {/* <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Recommended Action</p>
                  <p className="text-sm font-bold text-indigo-600">{data.action}</p>
                </div>
                <button 
                  onClick={onClose}
                  className="btn-primary-modern !py-3 !px-8 rounded-2xl text-xs"
                >
                  Close Analysis
                </button>
              </div> */}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuditDetailsModal;
