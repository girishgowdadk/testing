import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const ChartsSection = ({ categoryData, vendorData }) => {
  // Colour palettes for category and vendor bars
  const CATEGORY_COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626'];
  const VENDOR_COLORS   = ['#059669', '#d97706', '#dc2626', '#7c3aed', '#2563eb', '#4f46e5', '#0891b2', '#db2777', '#65a30d', '#ea580c'];

  const defaultCategoryData = [
    { name: 'QUANTITY MISMATCH', value: 0 },
    { name: 'PRICE MISMATCH',    value: 0 },
    { name: 'GR PENDING',        value: 0 },
  ];

  const defaultVendorData = [
    { name: 'VENDOR A', value: 0 },
    { name: 'VENDOR B', value: 0 },
    { name: 'VENDOR C', value: 0 },
  ];

  // Fix: empty array [] is truthy, so "|| default" never fires — use explicit length check
  const displayCategoryData = (Array.isArray(categoryData) && categoryData.length > 0)
    ? categoryData
    : defaultCategoryData;
  const displayVendorData = (Array.isArray(vendorData) && vendorData.length > 0)
    ? vendorData
    : defaultVendorData;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6"
      >
        <div className="heading-modern">Category Distribution</div>
        <h3 className="font-display text-xl font-bold mb-4">Mismatch Count & Value</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayCategoryData}
              margin={{ top: 20, right: 10, left: 0, bottom: 10 }} 
            >
              {/* X Axis */}
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} 
              />

              {/* Y Axis FIX */}
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}        
                domain={[0, 'dataMax']}      
                tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
              />

              <RechartsTooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              />

              {/* Bar */}
              <Bar dataKey="value" barSize={40} radius={[8, 8, 0, 0]}>
                {displayCategoryData.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="heading-modern">Vendor Distribution</div>
        <h3 className="font-display text-xl font-bold mb-4">Top 10 Mismatches</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayVendorData}
              margin={{ top: 20, right: 10, left: 0, bottom: 10 }} 
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}   
                tickCount={5}          
                domain={[0, 'dataMax']}  
                tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
              />

              <RechartsTooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              />

              <Bar dataKey="value" barSize={40} radius={[8, 8, 0, 0]}>
                {displayVendorData.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={VENDOR_COLORS[index % VENDOR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default ChartsSection;