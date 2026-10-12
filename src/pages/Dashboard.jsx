

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import { motion, AnimatePresence } from 'motion/react';

import { Toaster, toast } from 'sonner';

// Layout Components
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Layout from '../components/layout/Layout';

// Dashboard Components
import StatsGrid from '../components/dashboard/StatsGrid';
import ChartsSection from '../components/dashboard/ChartsSection';
import AuditResultsTable from '../components/dashboard/AuditResultsTable';

// Modal Components
import UploadModal from '../components/modals/UploadModal';
// import SettingsModal from '../components/modals/SettingsModal';
import api from '../components/services/api'
import { submitForReview } from '../components/services/feedbackApi';
import { FileText, Loader2, FileSpreadsheet, ShieldCheck, Database, Tag, CircleDollarSign, Send } from 'lucide-react';

import { useSettings } from '../context/SettingsContext';

// // Constants
// import { MOCK_RESULTS } from '../constants';


const formattedValue = (totalIvlValue) => {
    let formattedIvlValue = '$0.00';
    if (totalIvlValue > 0) {
      if (totalIvlValue >= 1000000) {
        const val = totalIvlValue / 1000000;
        formattedIvlValue = `$${val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}M`;
      } else if (totalIvlValue >= 1000) {
        const val = totalIvlValue / 1000;
        formattedIvlValue = `$${val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}k`;
      } else {
        formattedIvlValue = `$${totalIvlValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }
    return formattedIvlValue;
}


export default function Dashboard() {
  const [invoiceFile, setInvoiceFile] = useState([]);
  const [poFile, setPoFile] = useState(null);
  const [lynxFile, setLynxFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [tokenUsage, setTokenUsage] = useState({ input: 0, output: 0, total: 0 });
  const [dashboarddata, setDashboardData] = useState({
    total_invoices: 0,
    overdue_items: 0,
    total_pos: 0,
    price_mismatches: 0,
    payment_match: '0', 
    total_ivl_value: '0'
  });
  const { customPrompt } = useSettings();

  const [processingTime, setProcessingTime] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [categories, setCategories] = useState(['Quantity Mismatch', 'Price Mismatch', 'GR Pending', 'Perfect Match']);

  const [results, setResults] = useState([]);
  const { user, logout } = useAuth();
   const [totalProcessedInvoices, setTotalProcessedInvoices] = useState(0);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
  const [isSubmittingForReview, setIsSubmittingForReview] = useState(false);

  const stats = useMemo(() => {
    return [
      { label: 'TOTAL INVOICES', sub: 'Processed', value: dashboarddata?.total_invoices ?? 0, icon: <FileText size={20} />, color: 'brand-dark' },
      { label: 'OVERDUE ITEMS', sub: 'Total Found', value: dashboarddata?.overdue_items ?? 0, icon: <Loader2 size={20} />, color: 'brand-orange' },
      { label: 'TOTAL POs', sub: 'Considered', value: dashboarddata?.total_pos ?? 0, icon: <FileSpreadsheet size={20} />, color: 'emerald' },
      { label: 'PAYMENT MATCH', sub: 'Payment Match %', value: `${dashboarddata?.payment_match ?? 0}%`, icon: <ShieldCheck size={20} />, color: 'brand-yellow' },
      { label: 'PRICE MISMATCHES', sub: 'Unit Price Issues', value: dashboarddata?.price_mismatches ?? 0, icon: <Tag size={24} />, color: 'brand-light' },
      { label: 'TOTAL IVL VALUE', sub: 'IVL Value', value: formattedValue(dashboarddata?.total_ivl_value), icon: <CircleDollarSign size={24} />, color: 'brand-light' },
    ];
  }, [dashboarddata]);

  const chartData = useMemo(() => {

  const normalizeCategory = (cat) => {
  if (!cat) return "Other";

  const c = cat.toLowerCase();

  if (c.includes("price mismatch"))    return "Price Mismatch";
  if (c.includes("quantity mismatch")) return "Quantity Mismatch";
  if (c.includes("quantity"))          return "Quantity Mismatch";
  if (c.includes("gr pending"))        return "GR Pending";
  if (c.includes("pending goods receipt")) return "GR Pending";
  if (c.includes("partial goods receipt")) return "GR Pending";
  if (c.includes("perfect match"))     return "Perfect Match";
  if (c.includes("data integrity"))    return "Data Integrity Issue";

  return "Other";
};

  const categoryMap = {};

  categoryData?.forEach(item => {
    const key = normalizeCategory(item.category);

    if (!categoryMap[key]) {
      categoryMap[key] = 0;
    }

    categoryMap[key] += item.count;
  });

  const categoryChart = Object.entries(categoryMap).map(([key, value]) => ({
    name: key.toUpperCase(),
    value
  }));


  const vendorChart = vendorData?.length > 0
    ? vendorData.map(v => ({
        name: v.vend_name?.toUpperCase() || "UNKNOWN",
        value: v.mismatch_count
      }))
    : [];

  return { categoryChart, vendorChart };

}, [categoryData, vendorData]);

  const po_invoice_prompt = `
You are a strict JSON generator.

You will receive:
- multiple invoice documents (PDF files)
- one purchase order dataset (CSV file)

Each invoice PDF may contain a different PO number.

Your task is to analyze EVERY invoice separately and compare it against the PO records in the CSV dataset.

IMPORTANT RULES

1. Return ONLY valid JSON.
2. Do NOT include explanations, markdown, or text outside JSON.
3. The output must be a JSON array.
4. If multiple mismatches exist across invoices, return multiple objects.
5. If no mismatches exist, return an empty array [].
6. Every invoice must be evaluated independently.
7. Do NOT ignore any invoice file.

PROCESSING LOGIC

For EACH invoice PDF:

1. Extract these fields from the invoice:
   - PO number
   - invoice number
   - quantity
   - unit price
   - total amount
   - currency

2. Find the matching record in the CSV dataset using the PO number.

3. If the PO number does NOT exist in the CSV:
   return a mismatch with type "PO Mismatch".

4. If the PO number exists, compare the following fields with the CSV record:
   - quantity
   - unit price
   - total amount
   - currency

5. Only include fields that have mismatches.

OUTPUT FORMAT


SEVERITY RULES

high:
- PO mismatch
- currency mismatch
- total amount mismatch

medium:
- quantity mismatch

low:
- minor unit price differences

IMPORTANT

Process ALL invoice PDFs before generating the final JSON output.
Combine mismatches from all invoices into a single JSON array.
`;

const [prompts, setPrompts] = useState([
  {
    id: 1,
    text: po_invoice_prompt,
    version: "v1.1.0",
    date: new Date().toISOString().split("T")[0],
  },
]);

const invoice_prompt = `
You are a strict JSON generator.

You will receive a dataset containing purchase order (PO), invoice (IVL), and goods receipt (GR) information from an SAP system.

Your task is to analyze each record and detect mismatches between PO, Invoice, and GR values.

IMPORTANT RULES

1. Return ONLY valid JSON.
2. Do NOT include explanations or text outside JSON.
3. Output must be a JSON array.
4. Each mismatch must be returned as a separate object.
5. If no mismatches exist return [].

DATA FIELDS

Each row contains:

- PO Number
- IVL ID (Invoice ID)
- PO qty
- Invoice Qty
- GR qty
- PO total
- Invoice Total
- PO unit price
- Invoice unit price
- PO currency
- IVL Currency

MISMATCH RULES

For each row check:

1. Quantity mismatch
   If Invoice Qty ≠ PO qty

2. GR mismatch
   If GR qty ≠ PO qty OR GR qty ≠ Invoice Qty

3. Unit price mismatch
   If PO unit price ≠ Invoice unit price

4. Total amount mismatch
   If PO total ≠ Invoice Total

5. Currency mismatch
   If PO currency ≠ IVL Currency

6. Missing GR
   If GR qty = 0 but invoice exists



SEVERITY RULES

high
- currency mismatch
- total amount mismatch
- missing GR

medium
- quantity mismatch
- GR mismatch

low
- minor unit price differences

IMPORTANT

Evaluate each row independently.
Return mismatches for every PO-Invoice pair found in the dataset.

`

let OUTPUT_FORMAT = `
[
  {
    "IVL ID": "",
    "Purch.Doc..1": "",
    "Engine Category": "",
    "AI Reasoning": "",
    "AI Suggested Action": ""
  }
]
`;

  const filteredResults = useMemo(() => {
  return results.filter(item => {
    const matchesSearch =
      (item["Purch.Doc..1"] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item["IVL ID"] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item["AI Reasoning"] || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === 'All' ||
      (item["Engine Category"] || "")
        .toLowerCase()
        .includes(filterCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });
}, [results, searchTerm, filterCategory]);



  const handleRunDetection = async () => {
        if (isProcessing) return;

    if( !poFile)
    {
      if (invoiceFile &&invoiceFile.length === 0 ) {
        toast.error('Missing Documents', {
          description: 'Please upload at least one Invoice and the PO file to begin.'
        });
        return;
      }
    }

    
    let prompt;
    if (invoiceFile && poFile) {
       prompt =
        prompts?.length > 0
          ? prompts[0].text
          : po_invoice_prompt;
      // prompt = po_invoice_prompt;
    } else {
      prompt = invoice_prompt;
    }

    prompt += `\n\nOUTPUT FORMAT:\n${OUTPUT_FORMAT}`;

    setIsProcessing(true);
    setIsUploadModalOpen(false);
    const startTime = Date.now();

    toast.info('Analysis Started', {
      id: 'audit-start',
      description: 'Cross-referencing your documents...'
    });

    
    const formData = new FormData();
    formData.append('prompt', prompt);
    if(invoiceFile){
      for (let i=0; i<invoiceFile.length; i++) {
        formData.append('invoice_files', invoiceFile[i]);
      }
    }
    formData.append('po_files', poFile);
    // if (lynxFile) formData.append('files', lynxFile);
    //  formData.append('model', '""');
    try {

      const response = await api.post('/api/v1/llm/', formData,{
          headers: {
          // let axios set boundary automatically
          'Content-Type': undefined
        }
      })
      
      let data;
      if(response.data.success){
          data = response.data.data.content
      }
      if (data.dashboard_data.categories && Array.isArray(data.dashboard_data.categories)) {
        setCategories(data.dashboard_data.categories);
      }
      let raw =data.data
      // raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      // Simulated results for demonstration
      const mockResults = raw
      setProcessingTime(((Date.now() - startTime) / 1000).toFixed(1));
      setInvoiceFile(null);
      setPoFile(null);
      setLynxFile(null);
      // setTotalProcessedInvoices(prev => prev + invoiceFiles.length);
      setDashboardData(data.dashboard_data.metrics);
      setCategoryData(data.dashboard_data.category_distribution);
      setVendorData(data.dashboard_data.vendor_mismatches);
      setResults(mockResults);
      setCurrentAnalysisId(data.analysis_id || null);
      setIsProcessing(false);

    //   setTokenUsage({
    //   input: data.usage.input_tokens,
    //   output: data.usage.output_tokens,
    //   total: data.usage.total_tokens
    // });
      toast.success('Analysis Complete', {
        id: 'audit-success',
        description:  `Detected ${mockResults.length} rows across your documents. Review the results below.`
      });
    } catch (error) {
      console.error('Analysis Error:', error);
      setIsProcessing(false);
      toast.error('Analysis Failed', {
        id: 'audit-error',
        description: 'An error occurred while processing your documents. Please try again.'
      });
    }
  };

  const handleSubmitForReview = async () => {
    if (!currentAnalysisId || isSubmittingForReview) return;

    setIsSubmittingForReview(true);
    try {
      const result = await submitForReview(currentAnalysisId);
      if (result.already_notified) {
        toast.info('Already Submitted', {
          description: `This file's rules were already submitted for review on ${new Date(result.submitted_at).toLocaleString()}.`,
        });
      } else {
        toast.success('Submitted for Review', {
          description: `${result.pending_count} rule(s) sent to admins for review.`,
        });
      }
    } catch (error) {
      console.error('Submit for review error:', error);
      toast.error('Submit Failed', {
        description: error?.response?.data?.detail || 'Could not submit rules for review. Please try again.',
      });
    } finally {
      setIsSubmittingForReview(false);
    }
  };


 useEffect(() => {
  const checkAuth = async () => {
    console.log("triggered now");

    const token = localStorage.getItem("access_token");

    if (!token) {
      logout();
      return;
    }

    try {
      const res = await api.get("/api/v1/users/me");

      // setUser(res.data);

    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        localStorage.removeItem("access_token");
      } else {
        console.error("API error:", err);
      }
    }
  };

  checkAuth();
}, []);

// Restore the most recent analysis so the dashboard isn't blank on open/reload
useEffect(() => {
  const loadLastAnalysis = async () => {
    try {
      const response = await api.get('/api/v1/llm/latest');
      const content = response?.data?.data?.content;

      if (!content || !content.has_previous_analysis) return;

      const lastDashboardData = content.dashboard_data || {};

      if (Array.isArray(lastDashboardData.categories) && lastDashboardData.categories.length > 0) {
        setCategories(lastDashboardData.categories);
      }
      setDashboardData(lastDashboardData.metrics || {});
      setCategoryData(lastDashboardData.category_distribution || []);
      setVendorData(lastDashboardData.vendor_mismatches || []);
      setResults(Array.isArray(content.data) ? content.data : []);
      setCurrentAnalysisId(content.analysis_id || null);

      if (content.processing_time) {
        setProcessingTime(content.processing_time);
      }

      if (content.last_file_name) {
        toast.info('Last Analysis Restored', {
          description: `Showing results from your last uploaded file: ${content.last_file_name}`,
        });
      }
    } catch (err) {
      console.error('Failed to load last analysis:', err);
    }
  };

  loadLastAnalysis();
}, []);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col w-full">
      {/* <Toaster position="top-right" richColors closeButton visibleToasts={1}  /> */}
      
      {/* Minimal Navbar */}
      <Navbar 
        onOpenUpload={() => setIsUploadModalOpen(true)}
        isProcessing={isProcessing}
      />

        <main className="flex-grow max-w-[1600px] mx-auto w-full p-8 pt-4 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="heading-modern">Intelligent Mismatch Analyser</div>
            <h2 className="display-heading">
              Mismatch Insights & <span className="text-gradient">Analytics.</span>
            </h2>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="pb-2"
          >
            <p className="text-slate-500 max-w-xl text-xl font-medium leading-relaxed border-l-4 border-indigo-600/20 pl-8">
              Automated cross-referencing for Invoices, Purchase Orders, and Mismatch data using advanced processing logic.
            </p>
          </motion.div>
        </div>
        <StatsGrid stats={stats} />
        <ChartsSection categoryData={chartData.categoryChart} vendorData={chartData.vendorChart} />

        <AuditResultsTable
          results={results}
          categories={categories}
          filteredResults={filteredResults}
          tokenUsage={tokenUsage}
          processingTime={processingTime}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          currentAnalysisId={currentAnalysisId}
          onSubmitForReview={handleSubmitForReview}
          isSubmittingForReview={isSubmittingForReview}
        />

      </main>

      {/* Modern Modals */}
      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        invoiceFile={invoiceFile}
        setInvoiceFile={setInvoiceFile}
        poFile={poFile}
        setPoFile={setPoFile}
        lynxFile={lynxFile}
        setLynxFile={setLynxFile}
        onRunDetection={handleRunDetection}
        isProcessing={isProcessing}
      />


      <Footer />

    </div>
  </Layout>

  );
}
