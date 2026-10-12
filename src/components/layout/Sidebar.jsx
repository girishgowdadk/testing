import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Settings,
  LogOut,
  ChevronRight,
  Server,
  ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isExpanded, setIsExpanded }) => {

  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role?.includes('admin');
  const isIT = user?.role?.includes('it');
  
  const navItems = [
    { 
      name: 'Analyser', 
      path: '/', 
      icon: <Search size={22} />,
      show: true 
    },
    {
      name: 'Admin Dashboard',
      path: '/admin',
      icon: <LayoutDashboard size={22} />,
      show: isAdmin
    },
    {
      name: 'Rule Review',
      path: '/admin/rules',
      icon: <ClipboardCheck size={22} />,
      show: isAdmin
    },
    {
      name: 'IT Dashboard',
      path: '/it', 
      icon: <Server size={22} />,
      show: isAdmin || isIT 
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <Settings size={22} />,
      show: true 
    },
  ];

  return (
    <motion.aside
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      initial={false}
      animate={{ width: isExpanded ? 210 : 64 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white border-r border-slate-100 z-40 flex flex-col shadow-xl shadow-slate-200/50 max-sm:hidden will-change-[width]"
    >
      

      {/* Navigation */}
      <nav className="flex-grow py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.filter(item => item.show).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center h-12 rounded-xl transition-all relative group ${
              location.pathname === item.path 
                ? 'bg-brand-light/10 text-brand-dark' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <div className="w-[40px] min-w-[40px] flex items-center justify-center">
              {item.icon}
            </div>
            <motion.span
              animate={{ 
                opacity: isExpanded ? 1 : 0, 
                x: isExpanded ? 0 : -10,
                display: isExpanded ? 'block' : 'none'
              }}
              className="font-bold text-sm whitespace-nowrap absolute left-12"
            >
              {item.name}
            </motion.span>
            
            {location.pathname === item.path && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute right-0 w-1 h-6 bg-brand-dark rounded-l-full"
              />
            )}
          </Link>
        ))}
      </nav>

      {/* User & Logout */}
       <div className="p-2 border-t border-slate-50 space-y-1">
        <div className="flex items-center h-12 px-2 rounded-xl bg-slate-50/50 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center text-white font-bold text-xs shrink-0 border border-white shadow-sm">
            {user?.first_name?.[0] || 'G'}
          </div>
          <motion.div 
            animate={{ 
              opacity: isExpanded ? 1 : 0, 
              x: isExpanded ? 0 : -10,
              display: isExpanded ? 'block' : 'none'
            }}
            className="ml-3 overflow-hidden"
          >
            <p className="font-bold text-xs text-slate-900 truncate">{user?.first_name || 'User'}</p>
            <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">
              {user?.role?.join(', ') || 'Member'}
            </p>
          </motion.div>
        </div>

        <button 
          onClick={logout}
          className="flex items-center w-full h-10 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all group overflow-hidden"
        >
                    <div className="w-[40px] min-w-[40px] flex items-center justify-center">
            <LogOut size={18} />
          </div>
          <motion.span
            animate={{ 
              opacity: isExpanded ? 1 : 0, 
              x: isExpanded ? 0 : -10,
              display: isExpanded ? 'block' : 'none'
            }}
            className="font-bold text-sm whitespace-nowrap absolute left-12"
          >
            Sign Out
          </motion.span>
        </button>
      </div>

      {/* Toggle Hint */}
      <div className="h-10 flex items-center justify-center text-slate-200 pointer-events-none">
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
        >
          <ChevronRight size={16} />
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
