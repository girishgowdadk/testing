import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Zap, Info, FileText, ChevronRight, Download, ChevronLeft, Clock, Send, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';import Tooltip from '../common/Tooltip';
import { useState } from "react";
import AuditDetailsModal from '../modals/AuditDetailsModal';
import { formatSeconds } from '../lib/formatters';
import FeedbackCell from './FeedbackCell';
import { useAuth } from '../../context/AuthContext';

const AuditResultsTable = ({
  results,
  filteredResults,
  categories = [],
  tokenUsage = { input: 0, output: 0, total: 0 },
  processingTime,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  currentAnalysisId,
  onSubmitForReview,
  isSubmittingForReview,
}) => {

  const [excelVersion, setExcelVersion] = useState(1);  
  const [selectedResult, setSelectedResult] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { user } = useAuth();
  const isAdmin = user?.role?.includes('admin');

  const handleOpenDetails = (result) => {
    setSelectedResult(result);
    setIsDetailsOpen(true);
  };

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  const formatPONumber = (value) => {
    if (value === undefined || value === null || value === '') return 'N/A';
    const str = String(value);
    // Remove trailing ".0", ".00", etc. — e.g. "4500001234.0" -> "4500001234"
    return str.replace(/\.0+$/, '');
  };

   const formatCategory = (category) => {
    if (!category) return null;

    // Split by | to handle multiple categories
    const parts = category.includes('|')
      ? category.split('|').map(s => s.trim())
      : [category];

    if (parts.length === 0) return null;

    return (
      <div className="flex flex-col gap-1.5 py-1">
        {parts.map((p, i) => {
          const key = p.trim().toLowerCase();

          const isPerfect  = key === 'perfect match';
          const isPrice    = key === 'price mismatch'    || key.includes('price');
          const isQty      = key === 'quantity mismatch' || key.includes('quantity');
          const isGR       = key === 'gr pending'        || key.includes('gr');

          const colorClass = isPerfect ? 'text-emerald-700 border-emerald-200 bg-emerald-50' :
                             isPrice   ? 'text-amber-700   border-amber-200   bg-amber-50'   :
                             isQty     ? 'text-indigo-700  border-indigo-200  bg-indigo-50'  :
                             isGR      ? 'text-rose-700    border-rose-200    bg-rose-50'    :
                                         'text-slate-700   border-slate-200   bg-slate-50';

          return (
            <span
              key={i}
              className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border w-fit whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] ${colorClass}`}
              title={p.trim()}
            >
              {p.trim()}
            </span>
          );
        })}
      </div>
    );
  };

  const handleDownloadExcel = () => {
  if (!results || results.length === 0) return;

  // Directly convert full backend data
  const worksheet = XLSX.utils.json_to_sheet(results);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Full Data");

  XLSX.writeFile(workbook, `Final_Mismatches_v${excelVersion}.xlsx`);

  setExcelVersion(prev => prev + 1); // important fix
};

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-2xl font-black text-slate-900">Analysis Results</h3>
            {processingTime && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full"
              >
                <Clock size={12} className="text-blue-600" />
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                  {formatSeconds(processingTime)}
                </span>
              </motion.div>
            )}

            {tokenUsage.total > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full"
              >
                <Zap size={12} className="text-amber-600 fill-amber-600" />
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">
                  {tokenUsage.total.toLocaleString()} Tokens Used
                </span>
                <Tooltip text={`Input: ${tokenUsage.input} | Output: ${tokenUsage.output}`}>
                  <Info size={12} className="text-amber-400 cursor-help" />
                </Tooltip>
              </motion.div>
            )}
          </div>
          <p className="text-slate-400 text-sm font-medium">Review and action identified discrepancies.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern w-full pl-14"
            />
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
            <Filter size={18} className="ml-3 text-slate-400" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 outline-none pr-8 py-2"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleDownloadExcel}
            disabled={filteredResults.length === 0}
            className={`btn-secondary-modern !py-3 !px-4 ${filteredResults.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Download Excel"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>

          {!isAdmin && currentAnalysisId && (
            <button
              onClick={onSubmitForReview}
              disabled={isSubmittingForReview}
              className="btn-primary-modern !py-3 !px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Submit generated rules on this file for admin review"
            >
              {isSubmittingForReview
                ? <Loader2 size={18} className="animate-spin" />
                : <Send size={18} />
              }
              <span className="hidden sm:inline">Submit for Review</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="table-modern w-full">
          <thead>
            <tr>
              <th className="text-left">
                <Tooltip text="The Purchase Order number associated with this invoice">
                  <span className="cursor-help">PO Number</span>
                </Tooltip>
              </th>
              <th className="text-left">
                <Tooltip text="The unique identifier for the invoice document">
                  <span className="cursor-help">Invoice #</span>
                </Tooltip>
              </th>
              {/* <th className="text-left">
                <Tooltip text="The total monetary value of the invoice">
                  <span className="cursor-help">Total GR Qty</span>
                </Tooltip>
              </th>
              <th className="text-left">
                <Tooltip text="The quantity of items billed in the invoice">
                  <span className="cursor-help">Total IR Qty</span>
                </Tooltip>
              </th>
              <th className="text-left">
                <Tooltip text="The quantity of items billed in the invoice">
                  <span className="cursor-help">Vendor Unit Price</span>
                </Tooltip>
              </th>
              <th className="text-left">
                <Tooltip text="The quantity of items billed in the invoice">
                  <span className="cursor-help">SAP Unitprice</span>
                </Tooltip>
              </th> */}
              <th className="text-left">
                <Tooltip text="The type of discrepancy detected by the system">
                  <span className="cursor-help">Category</span>
                </Tooltip>
              </th>
              <th className="text-left min-w-[300px] flex-grow">
                <Tooltip text="The AI-generated explanation for the mismatch">
                  <span className="cursor-help">Reasoning</span>
                </Tooltip>
              </th>
              <th className="text-left min-w-[100px]">
                <Tooltip text="The recommended action to resolve the mismatch">
                  <span className="cursor-help">Action</span>
                </Tooltip>
              </th>
              <th className="text-left w-16">
                <Tooltip text="Detailed breakdown and history">
                  <span className="cursor-help">View More</span>
                </Tooltip>
              </th>
              <th className="text-left min-w-[220px]">
                <Tooltip text="The actual engine business rule that triggered this categorization">
                  <span className="cursor-help">Business Logic</span>
                </Tooltip>
              </th>
              <th className="text-left min-w-[240px]">
                <Tooltip text={isAdmin ? "Review AI-generated rules from analysts" : "AI-suggested corrective logic and rule submission for admin review"}>
                  <span className="cursor-help">Feedback</span>
                </Tooltip>
              </th>
              <th className="text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {paginatedResults.length > 0 ? (
                paginatedResults.map((result, idx) => (
                  <motion.tr 
                    key={result["Purch.Doc..1"]}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td>
                      <Tooltip text={`Full PO: ${formatPONumber(result["Purch.Doc..1"])}`}>
                        <span className="font-black text-slate-900 cursor-help">{formatPONumber(result["Purch.Doc..1"])}</span>
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip text={`Invoice Document ID: ${result["IVL ID"] || "N/A"}`}>
                        <span className="font-medium text-slate-600 cursor-help">{result["IVL ID"] || "N/A"}</span>
                      </Tooltip>
                    </td>
                    {/* <td>
                      <Tooltip text="Total Goods Receipt Quantity">
                        <span className="font-medium text-slate-600 cursor-help">{result["Total GR Qty"]}</span>
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip text="Total Invoice Value">
                        <span className="font-medium text-slate-600 cursor-help">{result["Total IR Qty"]}</span>
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip text="Billed Quantity">
                        <span className="font-medium text-slate-600 cursor-help">{result["Vendor Unit Price"]}</span>
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip text="Expected Quantity from SAP">
                        <span className="font-medium text-slate-600 cursor-help">{result["SAP Unit Price"]}</span>
                      </Tooltip>
                    </td> */}
                    <td>
                      {formatCategory(result["Engine Category"])}
                    </td>
                    <td className="min-w-[300px] flex-grow">
                      <Tooltip text={result["AI Reasoning"] || "No reasoning available"}>
                        <p className="font-medium text-slate-500 cursor-help">{result["AI Reasoning"] || "No reasoning available"}</p>
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip text={result["AI Suggested Action"] || "No action available"}>
                        <span className="font-bold text-slate-900 cursor-help">{result["AI Suggested Action"] || "No action available"}</span>
                      </Tooltip>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenDetails(result)}
                        className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-600 transition-all"
                      >
                        Details
                      </button>
                    </td>
                    <td className="min-w-[220px]">
                      {result["Business Logic"] ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 max-w-[280px]">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Engine Rule</p>
                          <p className="text-[10px] text-slate-600 font-medium whitespace-pre-line leading-relaxed">
                            {result["Business Logic"]}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-300 italic">No rule matched</span>
                      )}
                    </td>
                    <td className="py-3 align-top">
                      <FeedbackCell
                        isAdmin={isAdmin}
                        analysisResultId={`${result["Purch.Doc..1"] || "unknown"}_${result["IVL ID"] || idx}`}
                        fileId={currentAnalysisId}
                        rowNumber={startIndex + idx + 1}
                        engineCategory={result["Engine Category"] || ""}
                        aiSuggestedAction={result["AI Suggested Action"] || ""}
                      />
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => handleOpenDetails(result)}
                        className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <FileText size={40} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-600 font-black text-lg">No Analysis results yet.</p>
                        <p className="text-slate-400 font-medium">Upload documents and execute analysis to begin.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {filteredResults.length > itemsPerPage && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="font-black text-slate-900">{startIndex + 1}</span> to <span className="font-black text-slate-900">{Math.min(startIndex + itemsPerPage, filteredResults.length)}</span> of <span className="font-black text-slate-900">{filteredResults.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl border border-slate-100 transition-all ${currentPage === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50 hover:border-slate-200'}`}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show first, last, and pages around current
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 || 
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="px-1 text-slate-300">...</span>;
                }
                return null;
              })}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-xl border border-slate-100 transition-all ${currentPage === totalPages ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50 hover:border-slate-200'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
           <AuditDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        data={selectedResult}
      />
    </div>
  );
};

export default AuditResultsTable;