import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import api from '../components/services/api'
import { 
  Users, 
  Cpu, 
  Box, 
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  X,
  Activity
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';
import Layout from '../components/layout/Layout';
import Navbar from '../components/layout/Navbar';

const ITDashboard = () => {
  const [timeRange, setTimeRange] = useState('All');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    registered_users: '0',
    input_tokens: '0',
    output_tokens: '0',
    raw_registered_users: 0,
    raw_input_tokens: 0,
    raw_output_tokens: 0,
    monthly_data: [],
    user_usage: [],
    model_usage: []

  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const params = { range: timeRange };
        if (timeRange.includes(' - ')) {
          params.start = customRange.start;
          params.end = customRange.end;
        }


        const response = await api.get('/api/v1/it-dashboard/', { params });
        const data = response.data;
        // Format numbers for display
        setDashboardData({
          registered_users: data.registered_users.toLocaleString(),
          input_tokens: data.input_tokens >= 1000000 
            ? (data.input_tokens / 1000000).toFixed(1) + 'M' 
            : (data.input_tokens / 1000).toFixed(0) + 'k',
          output_tokens: data.output_tokens >= 1000000 
            ? (data.output_tokens / 1000000).toFixed(1) + 'M' 
            : (data.output_tokens / 1000).toFixed(0) + 'k',
          raw_registered_users: data.registered_users,
          raw_input_tokens: data.input_tokens,
          raw_output_tokens: data.output_tokens,
          monthly_data: data.data_processing_trends || [],
          user_usage: data.user_usage || [],
          model_usage: data.model_usage || []
        });
      } catch (error) {
        console.error('Error fetching IT dashboard data:', error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchData();
  }, [timeRange]);

  // Mock data for monthly token usage
  const monthlyTokenData = dashboardData.monthly_data && dashboardData.monthly_data.length > 0 
    ? dashboardData.monthly_data 
    : [
        { name: 'Jan', input: 0, output: 0 },
        { name: 'Feb', input: 0, output: 0 },
        { name: 'Mar', input: 0, output: 0 },
        { name: 'Apr', input: 0, output: 0 },
        { name: 'May', input: 0, output: 0 },
        { name: 'Jun', input: 0, output: 0 },
      ];

   const userUsageData = dashboardData.user_usage && dashboardData.user_usage.length > 0
    ? dashboardData.user_usage
    : [];


  const itStats = [
    { label: 'Registered Users', rawValue: dashboardData.raw_registered_users, value: dashboardData.registered_users, icon: <Users size={20} />, color: 'emerald', trend: '+4.2%', isUp: true },
    { label: 'Input Tokens', rawValue: dashboardData.raw_input_tokens, value: dashboardData.input_tokens, icon: <Cpu size={20} />, color: 'brand-yellow', trend: '+18.1%', isUp: true },
    { label: 'Output Tokens', rawValue: dashboardData.raw_output_tokens, value: dashboardData.output_tokens, icon: <Box size={20} />, color: 'brand-light', trend: '+14.3%', isUp: true },
  ];

 const ModelSkeleton = () => (
    <div className="animate-pulse flex flex-col gap-6 w-full h-[380px]">
      <div className="space-y-3">
        <div className="w-56 h-6 bg-slate-100 rounded-lg" />
        <div className="w-72 h-3 bg-slate-50 rounded" />
      </div>
      <div className="flex-grow space-y-7 mt-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="w-32 h-4 bg-slate-100 rounded" />
              <div className="w-16 h-3 bg-slate-50 rounded" />
            </div>
            <div className="w-full h-8 bg-slate-50 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );

    const StatSkeleton = () => (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100" />
        <div className="w-12 h-4 bg-slate-50 rounded" />
      </div>
      <div className="space-y-2">
        <div className="w-20 h-3 bg-slate-100 rounded" />
        <div className="w-24 h-8 bg-slate-100 rounded" />
      </div>
    </div>
  );
    const GraphSkeleton = () => (
    <div className="w-full h-[280px] animate-pulse flex flex-col justify-between">
      <div className="flex items-end justify-between h-[200px] px-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-[12%] bg-slate-100 rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }} />
        ))}
      </div>
      <div className="flex justify-between px-4 mt-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-12 h-3 bg-slate-50 rounded" />
        ))}
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="w-full animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-8 border-b border-slate-50">
          <div className="flex items-center gap-3 w-1/4">
            <div className="w-8 h-8 rounded-full bg-slate-100" />
            <div className="space-y-2">
              <div className="w-24 h-4 bg-slate-100 rounded" />
              <div className="w-32 h-2 bg-slate-50 rounded" />
            </div>
          </div>
          <div className="w-1/6 h-4 bg-slate-100 rounded" />
          <div className="w-1/6 h-4 bg-slate-100 rounded" />
          <div className="w-1/6 h-4 bg-slate-100 rounded self-end" />
        </div>
      ))}
    </div>
  );

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    if (customRange.start && customRange.end) {
      setTimeRange(`${customRange.start} - ${customRange.end}`);
      setShowCustomPicker(false);
    }
  };

  const customBrand = (
    <h1 className="font-display font-black text-lg tracking-tighter text-slate-900">
      IT<span className="text-brand-dark">Operations</span>
    </h1>
  );

  return (
    <Layout>
      <div className="flex flex-col w-full min-h-screen">
        <Navbar customBrand={customBrand} />
        
        <main className="max-w-[1600px] mx-auto w-full p-8 pt-4 space-y-8 pb-16">
          {/* Header & Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col xl:flex-row xl:items-end justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="heading-modern text-brand-dark">Infrastructure Monitoring</div>
              <h2 className="display-heading text-4xl">System <span className="text-gradient">Resources</span></h2>
              <p className="text-slate-400 font-medium italic">Real-time insights into performance, stability, and system operations.</p>
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
                      ? 'bg-brand-light/1 border-brand-dark/20 text-brand-dark'
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

          {/* IT Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
            itStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 group hover:border-indigo-100 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform`} style={{ color: stat.color === 'emerald' ? '#10B981' : stat.color === 'brand-yellow' ? '#f7a600' : '#009edc', backgroundColor: stat.color === 'emerald' ? '#10B98110' : stat.color === 'brand-yellow' ? '#f7a60010' : '#009edc10' }}>
                    {stat.icon}
                  </div>
                  {/* <div className={`flex items-center gap-0.5 text-[10px] font-black ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.trend}
                  </div> */}
                </div>
                <div className="relative">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <div className="text-2xl font-display font-black text-slate-900 mb-1">{stat.value}</div>
                  {/* Hover Tooltip - Exact Value */}
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                      <div className="bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                        Exact: {stat.rawValue.toLocaleString()}
                      </div>
                      <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
                    </div>
                </div>
              </motion.div>
            ))
          )}
          </div>

         
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 min-h-[400px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display font-black text-lg text-slate-900">Data Processing Trends</h3>
                <p className="text-xs text-slate-400 font-medium">Monthly input and output distribution.</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-light/100" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Input Tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Output Tokens</span>
                </div>
              </div>
            </div>
            
            <div className="flex-grow">
              {loading ? (
                <GraphSkeleton />
              ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyTokenData}>
                  <defs>
                    <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#004f91" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#004f91" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="input" stroke="#004f91" strokeWidth={3} fillOpacity={1} fill="url(#colorInput)" />
                  <Area type="monotone" dataKey="output" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorOutput)" />
                </AreaChart>
              </ResponsiveContainer>
                )}
            </div>
          </motion.div>
          <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8 min-h-[400px] flex flex-col"
            >
              {loading ? (
                <ModelSkeleton />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-display font-black text-lg text-slate-900">Token Usage by Model</h3>
                      <p className="text-xs text-slate-400 font-medium">Tracks input and output tokens per model.</p>
                    </div>
                    {/* <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Resource Allocation</span>
                      </div>
                    </div> */}
                  </div>

                  <div className="flex-grow space-y-6 overflow-y-auto max-h-[300px] pr-2">
                    {dashboardData.model_usage.map((model, idx) => {
                      const total = model.input + model.output;
                      const inputPerc = (model.input / total) * 100;
                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-brand-dark" />
                              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{model.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-400">{(total / 1000).toFixed(0)}k TOKENS</span>
                          </div>
                          <div className="h-8 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex relative group/bar">
                            <div 
                              className="h-full bg-brand-light/100/80 transition-all duration-1000" 
                              style={{ width: `${inputPerc}%` }}
                            />
                            <div 
                              className="h-full bg-emerald-500/80 transition-all duration-1000" 
                              style={{ width: `${100 - inputPerc}%` }}
                            />
                            
                            {/* Detailed Popover on Hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900/10 backdrop-blur-[2px]">
                              <span className="text-[9px] font-black text-slate-900 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                                IN: {model.input.toLocaleString()} | OUT: {model.output.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-light/100" /> Input
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" /> Output
                    </div>
                    <span>Cluster A-12</span>
                  </div>
                </>
              )}
            </motion.div>
          </div>
          {/* User Usage Directory (Moved from Admin) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-0 flex flex-col overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-lg text-slate-900">Resource Consumption Directory</h3>
                <p className="text-xs text-slate-400 font-medium">Detailed tracking of user sessions and associated neural costs.</p>
              </div>
              <button className="p-2 text-slate-400 hover:text-brand-dark transition-colors">
                <Filter size={18} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <TableSkeleton />
              ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Entity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Input Tokens</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Output Tokens</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">System State</th>
                  </tr>
                </thead>
                <tbody>
                  {userUsageData.map((user) => (
                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-black border border-slate-200">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Cpu size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">{user.input}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Box size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">{user.output}</span>
                        </div>
                      </td>
                      {/* <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 text-xs font-bold">
                          <Activity size={12} className={user.status === 'active' ? 'text-emerald-500' : 'text-slate-300'} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            user.status === 'active' ? 'text-emerald-600' : 
                            user.status === 'idle' ? 'text-amber-500' : 'text-slate-400'
                          }`}>{user.status}</span>
                        </div>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </Layout>
  );
};

export default ITDashboard;
