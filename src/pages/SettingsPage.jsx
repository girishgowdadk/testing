import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Plus, Save, History, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { toast } from 'sonner';
import Layout from '../components/layout/Layout';
import Navbar from '../components/layout/Navbar';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('prompt');
  const { user } = useAuth();
  const { customPrompt, setCustomPrompt, prompts, saveSettings } = useSettings();
  const isAdmin = user?.role?.includes('admin');
  const handleSave = async () => {
    toast.promise(saveSettings(), {
      loading: 'Saving configuration...',
      success: 'Settings updated and deployed successfully',
      error: 'Failed to save settings',
    });
  };

  return (
    <Layout>
      <div className="flex flex-col w-full min-h-screen">
        <Navbar />
        
        <main className="max-w-[1400px] mx-auto w-full p-8 pt-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="p-3 bg-brand-dark text-white rounded-2xl shadow-lg shadow-brand-600/20">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight">System Control</h1>
              <p className="text-slate-400 font-medium">Manage Application Settings and User Profile.</p>
            </div>
          </motion.div>

          <div className="flex gap-8 max-lg:flex-col">
            {/* Nav Tabs */}
            <div className="w-64 max-lg:w-full space-y-2 shrink-0">
              <button 
                onClick={() => setActiveTab('prompt')}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[13px] font-bold transition-all ${
                  activeTab === 'prompt' 
                    ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20'
                    : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100 hover:border-slate-200'
                }`}
              >
                <MessageSquare size={18} /> Prompt
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[13px] font-bold transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20' 
                    : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100 hover:border-slate-200'
                }`}
              >
                <User size={18} /> Profile
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow">
              {activeTab === 'profile' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="glass-card p-10 space-y-8">
                    <div className="flex items-center gap-8">
                      <div className="w-24 h-24 bg-brand-light/10 rounded-[2.5rem] flex items-center justify-center text-brand-dark border-4 border-white shadow-sm ring-1 ring-slate-100">
                        <User size={48} />
                      </div>
                      <div>
                        <h4 className="font-display text-3xl font-black text-slate-900">{user?.name}</h4>
                        <p className="text-slate-400 text-lg font-medium">{user?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Security Role</p>
                        <p className="text-sm font-bold text-slate-700">
                          {isAdmin ? 'Admin' : 'Analyst'}
                        </p>
                      </div>
                      <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Session Integrity</p>
                        <p className="text-sm font-bold text-slate-700">Online • Active since {new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'prompt' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 xl:grid-cols-5 gap-8"
                >
                  <div className="xl:col-span-3 space-y-6">
                    <div className="glass-card p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-brand-dark">
                          <Plus size={18} />
                          <h3 className="font-display font-black uppercase text-[10px] tracking-widest">
                            {isAdmin ? 'Command Injection' : 'Instruction Preview'}
                          </h3>
                        </div>
                        {isAdmin && (
                          <span className="text-[10px] font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full uppercase">Editable</span>
                        )}
                      </div>
                      
                      <textarea 
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="Define AI audit logic..."
                        className={`w-full h-[450px] p-6 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-brand-dark/5 focus:bg-white focus:border-brand-dark/20 outline-none resize-none transition-all leading-relaxed ${user?.role !== 'admin' ? 'cursor-default opacity-70' : ''}`}
                      />
                      
                      {isAdmin && (
                        <button 
                          onClick={handleSave}
                          className="btn-primary-modern w-full justify-center py-5 rounded-2xl font-bold shadow-xl shadow-brand-dark/20"
                        >
                          <Save size={20} /> Deploy Configuration
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="xl:col-span-2 space-y-6">
                    <div className="glass-card p-8 space-y-6">
                      <div className="flex items-center gap-3 text-slate-400">
                        <History size={18} />
                        <h3 className="font-display font-black uppercase text-[10px] tracking-widest">Version Repository</h3>
                      </div>

                      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                        {prompts.map((p, idx) => (
                          <motion.div 
                            key={p.id || idx} 
                            whileHover={{ x: 4 }}
                            onClick={() => {
                              if (user?.role === 'admin') {
                                const newPromptText = p.content || p.text || '';
                                setCustomPrompt(newPromptText);
                                toast.info(`Loaded ${p.version || 'Version'}`);
                              }
                            }}
                            className={`p-5 rounded-2xl border transition-all ${
                              isAdmin
                                ? 'cursor-pointer hover:border-brand-dark hover:bg-brand-dark/20 border-slate-50' 
                                : 'border-slate-50'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black px-3 py-1 bg-slate-900 text-white rounded-full uppercase tracking-tighter">
                                {p.version || `v${prompts.length - idx}`}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">
                                {(p.created_at || p.date) ? new Date(p.created_at || p.date).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed break-words">
                              {p.content || p.text}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default SettingsPage;
