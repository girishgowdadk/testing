import { motion } from 'motion/react';
import { FileText, Loader2, FileSpreadsheet, ShieldCheck, Database, Info, ArrowUpRight,Tag, CircleDollarSign } from 'lucide-react';
import Tooltip from '../common/Tooltip';
import { containerVariants, itemVariants } from '../../constants';

const StatsGrid = ({ stats }) => {
  const defaultStats = [
    { label: 'TOTAL INVOICEs', sub: 'Processed', value: '0', icon: <FileText size={20} />, color: 'brand-dark' },
    { label: 'OVERDUE ITEMs', sub: 'Total Found', value: '0', icon: <Loader2 size={20} />, color: 'brand-orange' },
    { label: 'TOTAL POs', sub: 'Considered', value: '0', icon: <FileSpreadsheet size={20} />, color: 'brand-light' },
    { label: 'PAYMENT MATCH', sub: 'Payment Match %', value: '0%', icon: <ShieldCheck size={20} />, color: 'brand-yellow' },
    { label: 'PRICE MISMATCHEs', sub: 'Info Records', value: '0', icon: <Tag size={24} />, color: 'brand-orange' },
    { label: 'Total IVL value', sub: 'IVL Value', value: '0', icon: <CircleDollarSign size={24} />, color: 'brand-dark'},
  ];


  const displayStats = stats || defaultStats;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {displayStats.map((stat, idx) => (
        <motion.div 
          key={idx}
          variants={itemVariants}
          className="stat-card-modern group"
        >
          <div className="glow-effect" />
          <div className={`relative z-10 w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
            {stat.icon}
          </div>
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black text-slate-400 tracking-widest">{stat.label}</p>
              <Tooltip text={stat.sub}>
                <Info size={12} className="text-slate-300 cursor-help" />
              </Tooltip>
            </div>
            <h3 className="font-display text-2xl font-black text-slate-900">{stat.value}</h3>
          </div>
          <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0 relative z-10">
            <ArrowUpRight size={16} className="text-slate-300" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsGrid;