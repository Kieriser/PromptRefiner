'use client';

import { useState, useEffect } from 'react';
import ApiKeySetup from './ApiKeySetup';
import PromptRefiner from './PromptRefiner';

export default function PromptRefinerApp() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if API key and model exist in sessionStorage
    const storedApiKey = sessionStorage.getItem('openai-api-key');
    const storedModel = sessionStorage.getItem('openai-model');
    
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    if (storedModel) {
      setSelectedModel(storedModel);
    }
    setIsLoading(false);
  }, []);

  const handleApiKeySet = (key: string, model: string) => {
    sessionStorage.setItem('openai-api-key', key);
    sessionStorage.setItem('openai-model', model);
    setApiKey(key);
    setSelectedModel(model);
  };

  const handleApiKeyReset = () => {
    sessionStorage.removeItem('openai-api-key');
    sessionStorage.removeItem('openai-model');
    setApiKey(null);
    setSelectedModel('gpt-4o-mini');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-500/20 border-t-cyan-500"></div>
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return <ApiKeySetup onApiKeySet={handleApiKeySet} />;
  }

  return <PromptRefiner apiKey={apiKey} selectedModel={selectedModel} onApiKeyReset={handleApiKeyReset} />;
}