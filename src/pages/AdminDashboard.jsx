import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  FileText, 
  UserCheck,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  X
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import Layout from '../components/layout/Layout';
import Navbar from '../components/layout/Navbar';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('All');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const outcomeData = [
    { name: 'Fully Matched', value: 740, color: '#10B981' },
    { name: 'Mismatched', value: 285, color: '#F43F5E' },
    { name: 'Manual Review', value: 215, color: '#f7a600' },
  ];

  const stats = [
    { label: 'Total Invoices', value: '1,240', icon: <FileText size={20} />, color: 'brand-dark', trend: '+12.5%', isUp: true },
    { label: 'Manual Reviews', value: '12', icon: <UserCheck size={20} />, color: 'brand-yellow', trend: '-2.4%', isUp: false },
    { label: 'Audit Velocity', value: '3.2/min', icon: <TrendingUp size={20} />, color: 'brand-light', trend: '+1.2%', isUp: true },
  ];

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    if (customRange.start && customRange.end) {
      setTimeRange(`${customRange.start} - ${customRange.end}`);
      setShowCustomPicker(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col w-full min-h-screen">
        <Navbar />
        
        <main className="max-w-[1600px] mx-auto w-full p-8 pt-4 space-y-8 pb-16">
          {/* Header & Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col xl:flex-row xl:items-end justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="heading-modern text-brand-dark">Administrative Command</div>
              <h2 className="display-heading text-4xl">Platform <span className="text-gradient">Governance</span></h2>
              <p className="text-slate-400 font-medium italic">Oversee business logic validation, invoice auditing, and platform security events.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 relative">
              <div className="flex bg-white rounded-2xl border border-slate-100 p-1 shadow-sm">
                {['24h', '7d', '30d', '90d', 'All'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setTimeRange(range);
                      setShowCustomPicker(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      timeRange === range 
                        ? 'bg-brand-dark text-white shadow-lg shadow-brand-dark/20' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowCustomPicker(!showCustomPicker)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-2xl text-[11px] font-bold transition-all shadow-sm ${
                    showCustomPicker || timeRange.includes('-')
                      ? 'bg-brand-light/10 border-brand-light/20 text-brand-dark'
                      : 'bg-white border-slate-100 text-slate-600 hover:border-brand-dark/20'
                  }`}
                >
                  <Calendar size={14} />
                  {timeRange.includes('-') ? timeRange : 'Custom Range'}
                  <ChevronDown size={14} className={`transition-transform ${showCustomPicker ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showCustomPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Select Range</span>
                        <button onClick={() => setShowCustomPicker(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={16} />
                        </button>
                      </div>
                      <form onSubmit={handleCustomRangeSubmit} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Start Date</label>
                          <input 
                            type="date" 
                            required
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand-dark transition-colors"
                            value={customRange.start}
                            onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">End Date</label>
                          <input 
                            type="date" 
                            required
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand-dark transition-colors"
                            value={customRange.end}
                            onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                          />
                        </div>
                        <button 
                          type="submit"
                          className="w-full py-3 bg-brand-dark text-white rounded-xl text-xs font-black shadow-lg shadow-brand-dark/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          APPLY RANGE
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 group hover:border-brand-light/10 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform`} style={{ color: stat.color === 'brand-dark' ? '#004f91' : stat.color === 'brand-yellow' ? '#f7a600' : '#009edc', backgroundColor: stat.color === 'brand-dark' ? '#004f9110' : stat.color === 'brand-yellow' ? '#f7a60010' : '#009edc10' }}>
                    {stat.icon}
                  </div>
                  <div className={`flex items-center gap-0.5 text-[10px] font-black ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.trend}
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <div className="text-2xl font-display font-black text-slate-900 mb-1">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Audit Verification Outcomes (Relevant Pie Chart) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8 min-h-[400px] flex flex-col"
            >
              <h3 className="font-display font-black text-lg text-slate-900 mb-1">Audit Verification Outcomes</h3>
              <p className="text-xs text-slate-400 font-medium mb-6">Distribution of automated validation results across all entities.</p>
              
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 items-center gap-8">
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {outcomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  {outcomeData.map((item) => (
                    <div key={item.name} className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{Math.round((item.value / 1240) * 100)}%</span>
                      </div>
                      <div className="text-lg font-display font-black text-slate-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Platform Insights / Admin Logs */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-8"
            >
              <h3 className="font-display font-black text-lg text-slate-900 mb-6 flex items-center gap-3">
                <UserCheck size={20} className="text-brand-dark" />
                Administrative Logs
              </h3>
              <div className="space-y-4">
                {[
                  { user: 'Admin_Girish', action: 'Direct System Override', time: '12m ago', severity: 'high' },
                  { user: 'Security_Bot', action: 'Auth Token Refreshed', time: '45m ago', severity: 'low' },
                  { user: 'System', action: 'Daily Ledger Rotated', time: '2h ago', severity: 'medium' },
                  { user: 'Admin_Sarah', action: 'Prompt Engineering V2.4', time: '5h ago', severity: 'medium' },
                  { user: 'System', action: 'API Spike Detected', time: '12h ago', severity: 'high' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-50 hover:bg-white transition-all cursor-default">
                    <div className={`w-2 h-10 rounded-full ${
                      log.severity === 'high' ? 'bg-brand-orange' :
                      log.severity === 'medium' ? 'bg-brand-yellow' : 'bg-brand-light'
                    }`} />
                    <div className="flex-grow">
                      <p className="text-xs font-black text-slate-900">{log.action}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">By {log.user}</p>
                        <span className="text-[10px] text-slate-400 font-medium italic">{log.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all">
                View All Security Events
              </button>
            </motion.div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
