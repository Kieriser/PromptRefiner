'use client';

import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';

interface RefinedPrompt {
  id: string;
  refined: string;
  clarity: number;
  explanation: string;
}

interface ApiResponse {
  suggestions: RefinedPrompt[];
}

interface PromptRefinerProps {
  apiKey: string;
  onApiKeyReset: () => void;
}

export default function PromptRefiner({ apiKey, onApiKeyReset }: PromptRefinerProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<RefinedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refinePrompt = async (prompt: string) => {
    if (!prompt.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<ApiResponse>('/api/refine', { 
        prompt,
        apiKey 
      });
      setSuggestions(response.data.suggestions);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to refine prompt');
      } else {
        setError('An unexpected error occurred');
      }
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedRefine = useCallback(
    debounce(refinePrompt, 500),
    []
  );

  useEffect(() => {
    debouncedRefine(input);
  }, [input, debouncedRefine]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      {/* Stars */}
      <div className="absolute inset-0 bg-[radial-gradient(2px_2px_at_20px_30px,_white,_transparent),_radial-gradient(2px_2px_at_40px_70px,_white,_transparent),_radial-gradient(1px_1px_at_90px_40px,_white,_transparent),_radial-gradient(1px_1px_at_130px_80px,_white,_transparent),_radial-gradient(2px_2px_at_160px_30px,_white,_transparent)] bg-repeat opacity-20"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <h1 className="text-7xl lg:text-8xl font-black mb-4 relative">
                {/* Glow effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent blur-sm opacity-50">
                  PromptRefiner
                </span>
                {/* Main text */}
                <span className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Prompt
                </span>
                <span className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                  Refiner
                </span>
              </h1>
              
              {/* Animated background accent */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl animate-pulse-slow"></div>
            </div>
            
            <p className="text-white/70 text-lg font-light tracking-wide mt-6">
              Craft stellar AI prompts with real-time intelligence
            </p>
          </div>

          {/* Main input section */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl mb-8">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Begin typing your prompt..."
                className="w-full h-40 p-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none backdrop-blur-sm font-light text-lg leading-relaxed transition-all duration-300"
                aria-label="Prompt input"
              />
              {isLoading && (
                <div className="absolute top-4 right-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500/20 border-t-cyan-500"></div>
                    <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-300 font-light">{error}</p>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light text-white/90 text-center mb-8">
                Refined Suggestions
              </h2>
              
              <div className="grid gap-6">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
                  >
                    {/* Header with clarity score and copy button */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-light text-white/60">
                          Clarity
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${(suggestion.clarity / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-light text-white/90 min-w-[2.5rem]">
                            {suggestion.clarity}/10
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => copyToClipboard(suggestion.refined)}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group-hover:scale-105"
                        aria-label="Copy to clipboard"
                      >
                        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Refined prompt */}
                    <div className="mb-4">
                      <p className="text-white/90 leading-relaxed font-light text-lg">
                        {suggestion.refined}
                      </p>
                    </div>
                    
                    {/* Explanation */}
                    <div className="flex items-start space-x-3 text-white/60">
                      <svg className="w-5 h-5 mt-0.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="font-light text-sm leading-relaxed">
                        {suggestion.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {input && suggestions.length === 0 && !isLoading && !error && (
            <div className="text-center py-12">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 inline-block">
                <svg className="w-12 h-12 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-white/60 font-light">
                  Analyzing your prompt...
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center mt-16 space-y-4">
            <button
              onClick={onApiKeyReset}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white/60 hover:text-white/90 text-sm font-light"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>Change API Key</span>
            </button>
            
            <div className="space-y-2">
              <p className="text-white/40 font-light text-sm">
                Built with precision for stellar AI conversations
              </p>
              <p className="text-white/30 font-light text-xs">
                Privacy-first • No data stored • Powered by OpenAI
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}