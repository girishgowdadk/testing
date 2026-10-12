import { ShieldCheck, Loader2, Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onOpenUpload, isProcessing }) => {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 fixed top-0 left-0 w-full z-50 h-14 flex items-center">
      <div className="max-w-[1600px] mx-auto px-4 w-full flex justify-between items-center">
        <div className="flex items-center gap-3 py-1">
          <img 
            src="/images/gvw_logo.png" 
            alt="AuditFlow Logo" 
            className="h-8 w-auto object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://ui-avatars.com/api/?name=Audit+Flow&background=004f91&color=fff&size=64&bold=true";
            }}
          />
          <h1 className="font-display font-black text-lg tracking-tighter text-slate-900">
            Intelligent <span className="text-brand-dark">Mismatch </span> Analyser
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-6 h-6 bg-brand-light rounded-lg flex items-center justify-center text-brand-dark">
              <User size={14} />
            </div>
            <span className="text-xs font-bold text-slate-600">{user?.first_name}</span>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1" />
          {onOpenUpload && (
          <button 
            onClick={onOpenUpload}
            disabled={isProcessing}
            className="btn-primary-modern"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            {isProcessing ? 'Analyzing...' : 'Upload File'}
          </button>
          )}
          

          <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;