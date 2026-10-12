import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AnimatePresence } from 'motion/react';import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Toaster } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const success =  await login(email, password);

    if (success) {
      toast.success('Welcome back!', {
        description: 'You have successfully logged in.'
      });
      navigate(from, { replace: true });
    } else {
            setError('Invalid email or password. Please try again.');

    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFE] p-6">
      <Toaster 
        position="top-right"
        richColors
        closeButton   
        visibleToasts={1}
      />
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 border border-slate-100 p-10 relative overflow-hidden"
        >
          <div className="glow-effect opacity-10" />
          
          <div className="relative z-10 flex flex-col items-center text-center mb-10">
            <div className="mb-10">
              <img 
                src="/images/gvw_logo.png" 
                alt="AuditFlow Logo" 
                className="w-40 h-auto object-contain drop-shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://ui-avatars.com/api/?name=Audit+Flow&background=004f91&color=fff&size=200&bold=true";
                }}
              />
            </div>
            <h1 className="font-display font-black text-3xl tracking-tighter text-slate-900 mb-2">
              Intelligent <span className="text-brand-dark">Mismatch</span> Analyser
            </h1>
            {/* <p className="text-slate-400 font-medium">Intelligent Mismatch Analyser</p> */}
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  className={`input-modern w-full pl-14 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              <div className="relative group/pass">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/pass:text-brand-dark transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}  
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  className={`input-modern w-full pl-14 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={showPassword ? 'eye' : 'eye-off'}
                      initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 20 }}
                      transition={{ duration: 0.15 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-semibold px-2"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-modern w-full py-4 justify-center rounded-2xl text-[13px] group"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative z-10 mt-10 pt-8 border-t border-slate-50 text-center">
            {/* <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
              Secure Enterprise Access
            </p> */}
          </div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-slate-400 text-xs font-medium"
        >
          Intelligent Mismatch Analyser v1.0
        </motion.p>
      </div>
    </div>
  );
};

export default LoginPage;