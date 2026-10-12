import { motion } from 'motion/react';
import Sidebar from './Sidebar';
import { useSettings } from '../../context/SettingsContext';

const Layout = ({ children }) => {
  const { isSidebarExpanded, setIsSidebarExpanded } = useSettings();

  return (
    <div className="flex min-h-screen bg-[#FBFBFE] pt-14 selection:bg-brand-light/20 selection:text-brand-dark">
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      
      <motion.div 
        animate={{ 
          marginLeft: isSidebarExpanded ? 210 : 64,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-grow w-full max-sm:!ml-0 will-change-[margin-left]"
      >
        <div className="w-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default Layout;
