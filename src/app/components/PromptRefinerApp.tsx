'use client';

import { useState, useEffect } from 'react';
import ApiKeySetup from './ApiKeySetup';
import PromptRefiner from './PromptRefiner';

export default function PromptRefinerApp() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if API key exists in sessionStorage
    const storedApiKey = sessionStorage.getItem('openai-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    setIsLoading(false);
  }, []);

  const handleApiKeySet = (key: string) => {
    sessionStorage.setItem('openai-api-key', key);
    setApiKey(key);
  };

  const handleApiKeyReset = () => {
    sessionStorage.removeItem('openai-api-key');
    setApiKey(null);
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

  return <PromptRefiner apiKey={apiKey} onApiKeyReset={handleApiKeyReset} />;
}