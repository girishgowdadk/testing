import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../components/services/api';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [customPrompt, setCustomPrompt] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const fetchPrompts = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !user) return; 

    try {
      setIsLoading(true);
      const response = await api.get('/api/v1/prompts/');
      const updatedHistory = response.data.data;
      
      if (updatedHistory && updatedHistory.length > 0) {
        setPrompts(updatedHistory);
        // Set the most recent prompt as customPrompt if not already set or specifically requested
        setCustomPrompt(updatedHistory[0].content || updatedHistory[0].text || '');
      }
    } catch (error) {
      console.error('Failed to fetch prompt versions:', error);
        if (error.response?.status !== 401) {
        toast.error('Sync Error', { description: 'Could not fetch prompt versions from server.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPrompts();
    } else {
      // Clear settings state on logout to prevent stale data
      setPrompts([]);
      setCustomPrompt('');
    }
  }, [fetchPrompts, user]);

  const saveSettings = async (newPromptValue) => {
    const promptToSave = newPromptValue !== undefined ? newPromptValue : customPrompt;
    
    try {
      const response = await api.post('/api/v1/prompts/', { prompt: promptToSave });
      
      if (response.data.success) {
        toast.success('Configuration saved to server');
        await fetchPrompts(); // Refresh history
        return true;
      }
      return false;
    } catch (error) {
      console.error('Backend Sync Error:', error);
      toast.error('Sync Error', { description: 'Could not reach the configuration server.' });
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      customPrompt, 
      setCustomPrompt, 
      prompts, 
      setPrompts, 
      saveSettings, 
      fetchPrompts,
      isLoading,
      isSidebarExpanded,
      setIsSidebarExpanded 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);