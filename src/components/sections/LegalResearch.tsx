import React, { useState } from 'react';
import { SearchIcon, SparklesIcon, ClipboardIcon, RefreshCwIcon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';
import { draftLegalDocument } from '../../api/openai';

export const LegalResearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setResults('');
    // Store query in Supabase and retrieve any previous results
    const { data, error: dbError } = await supabase.from('legal_research').select('result').eq('query', query).single();
    if (dbError) {
      setError('No previous research found. Try AI Research.');
    } else {
      setResults(data?.result || '');
    }
    setLoading(false);
  };

  const handleAIResearch = async () => {
    setAiLoading(true);
    setAiError('');
    setAiResult('');
    try {
      const prompt = `You are a legal research assistant. Provide a concise, accurate summary for the following legal research query, citing relevant statutes or cases if possible.\n\nQuery: ${query}`;
      const result = await draftLegalDocument(prompt);
      setAiResult(result);
    } catch (e: any) {
      setAiError(e.message || 'Failed to generate AI research result.');
    }
    setAiLoading(false);
  };

  const handleCopyAIResult = () => {
    setResults(aiResult);
  };

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Legal Research</h1>
        <p className="text-gray-600 mt-2">Search previous research or use AI to get instant legal insights</p>
      </header>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Enter your legal research query..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            className="bg-navy-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center hover:bg-navy-800 w-full sm:w-auto"
            onClick={handleSearch}
            type="button"
            disabled={loading || !query}
          >
            <SearchIcon size={18} className="mr-2" />{loading ? 'Searching...' : 'Search'}
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
            onClick={handleAIResearch}
            type="button"
            disabled={aiLoading || !query}
          >
            <SparklesIcon size={18} className="mr-2" />{aiLoading ? 'AI Researching...' : 'AI Research'}
          </button>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {aiError && <div className="text-red-600 mb-2">{aiError}</div>}
        {/* AI Result Output */}
        {aiResult && (
          <div className="bg-gray-50 rounded-xl shadow-sm border border-blue-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-blue-700 flex items-center"><SparklesIcon size={20} className="mr-2" />AI Legal Insight</h2>
              <button className="flex items-center text-sm text-blue-700 hover:text-blue-900" onClick={handleCopyAIResult}><ClipboardIcon size={16} className="mr-1" />Copy to Results</button>
            </div>
            <pre className="whitespace-pre-wrap text-gray-800 text-sm bg-white rounded p-4 border border-blue-100 overflow-x-auto">{aiResult}</pre>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Results</h3>
            <button className="text-gray-500 flex items-center text-sm hover:text-navy-700" onClick={() => setResults('')} type="button">
              <RefreshCwIcon size={14} className="mr-1" />Clear
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 h-48 flex items-center justify-center border border-gray-200">
            <p className="text-gray-500 text-center">{results ? results : 'Search for a query or use AI to generate legal research results.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};