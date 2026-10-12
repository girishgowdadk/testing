export const MOCK_RESULTS = [
  {
    po: "4500357692",
    inv: "54166421",
    totalAmt: "1,200.00",
    qty: "10",
    category: "Quantity Mismatch",
    reason: "Invoice quantity (10) does not match PO quantity (12)",
    action: "Review with Vendor",
    severity: "high",
  },
  {
    po: "4500357693",
    inv: "54166422",
    totalAmt: "850.50",
    qty: "5",
    category: "Price Mismatch",
    reason: "Unit price on invoice (150.00 EUR) exceeds PO price (145.00 EUR)",
    action: "Adjust Price",
    severity: "medium",
  },
  {
    po: "4500357694",
    inv: "54166423",
    totalAmt: "2,400.00",
    qty: "24",
    category: "GR Pending",
    reason: "Goods Receipt not found in SAP for this PO line item",
    action: "Check Warehouse",
    severity: "low",
  }
];

export const categoryData = [
  { name: 'QUANTITY MISMATCH', value: 400 },
  { name: 'PRICE MISMATCH', value: 300 },
  { name: 'GR PENDING', value: 350 },
];

export const vendorData = [
  { name: 'VENDOR A', value: 500 },
  { name: 'VENDOR B', value: 300 },
  { name: 'VENDOR C', value: 450 },
];

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};