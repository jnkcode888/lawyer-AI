import React, { useState } from 'react';
import { FileUpIcon, FileTextIcon, RefreshCwIcon, SparklesIcon, ClipboardIcon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';
import { draftLegalDocument } from '../../api/openai';

export const SummarizeBriefs = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    // Upload file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage.from('briefs').upload(`briefs/${Date.now()}_${file.name}`, file);
    if (uploadError) {
      setError('Failed to upload file.');
      setLoading(false);
      return;
    }
    // Store file reference in summaries table
    const { error: dbError } = await supabase.from('summaries').insert([
      {
        file_url: data?.path,
        summary: '', // To be filled after AI summary
      },
    ]);
    if (dbError) {
      setError('Failed to save file reference.');
    } else {
      setSuccess('File uploaded successfully!');
      setFile(null);
    }
    setLoading(false);
  };

  const handleSummarize = async () => {
    if (!text) {
      setError('Please paste some text to summarize.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    // Here you would call your AI summary API. For now, just mock it.
    const aiSummary = text.slice(0, 100) + (text.length > 100 ? '...' : '');
    setSummary(aiSummary);
    // Store summary in Supabase
    const { error: dbError } = await supabase.from('summaries').insert([
      {
        file_url: null,
        summary: aiSummary,
      },
    ]);
    if (dbError) {
      setError('Failed to save summary.');
    } else {
      setSuccess('Summary generated and saved!');
      setText('');
    }
    setLoading(false);
  };

  const handleAISummarize = async () => {
    setAiLoading(true);
    setAiError('');
    setAiSummary('');
    try {
      const prompt = `Summarize the following legal brief in clear, concise language for a CEO.\n\n${text}`;
      const result = await draftLegalDocument(prompt);
      setAiSummary(result);
    } catch (e: any) {
      setAiError(e.message || 'Failed to generate summary.');
    }
    setAiLoading(false);
  };

  const handleCopyAISummary = () => {
    setSummary(aiSummary);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Summarize Client Briefs</h1>
        <p className="text-gray-600 mt-2">Upload a document or paste text to get an AI-generated summary</p>
      </header>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row mb-4 md:mb-6 border-b">
          <button className={`px-4 py-3 font-medium ${activeTab === 'upload' ? 'text-navy-700 border-b-2 border-navy-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('upload')}>Upload Document</button>
          <button className={`px-4 py-3 font-medium ${activeTab === 'paste' ? 'text-navy-700 border-b-2 border-navy-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('paste')}>Paste Text</button>
        </div>
        {activeTab === 'upload' ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center">
            <FileUpIcon size={36} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">Drag and drop your file here, or click to browse</p>
            <input type="file" className="hidden" id="brief-upload" onChange={handleFileChange} />
            <label htmlFor="brief-upload" className="bg-navy-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-800 cursor-pointer inline-block">{file ? file.name : 'Select File'}</label>
            <button className="ml-0 sm:ml-4 mt-4 sm:mt-0 bg-navy-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-800" onClick={handleUpload} type="button" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
            <p className="text-xs text-gray-500 mt-2">Supported formats: PDF, DOCX, TXT (Max 10MB)</p>
          </div>
        ) : (
          <div>
            <textarea className="w-full border border-gray-300 rounded-lg p-3 md:p-4 h-48 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Paste the text you'd like to summarize here..." value={text} onChange={(e) => setText(e.target.value)}></textarea>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <button className="bg-navy-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-navy-800 disabled:opacity-50" onClick={handleSummarize} type="button" disabled={loading}>
                <FileTextIcon size={18} className="mr-2" />{loading ? 'Summarizing...' : 'Generate Summary'}
              </button>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-blue-700 disabled:opacity-50" onClick={handleAISummarize} type="button" disabled={aiLoading || !text}>
                <SparklesIcon size={18} className="mr-2" />{aiLoading ? 'AI Summarizing...' : 'AI Summarize'}
              </button>
            </div>
          </div>
        )}
        {error && <div className="mt-4 text-red-600">{error}</div>}
        {success && <div className="mt-4 text-green-600">{success}</div>}
      </div>
      {/* AI Summary Output */}
      {aiSummary && (
        <div className="bg-gray-50 rounded-xl shadow-sm border border-blue-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-blue-700 flex items-center"><SparklesIcon size={20} className="mr-2" />AI Summary</h2>
            <button className="flex items-center text-sm text-blue-700 hover:text-blue-900" onClick={handleCopyAISummary}><ClipboardIcon size={16} className="mr-1" />Copy to Summary</button>
          </div>
          <pre className="whitespace-pre-wrap text-gray-800 text-sm bg-white rounded p-4 border border-blue-100 overflow-x-auto">{aiSummary}</pre>
        </div>
      )}
      {aiError && <div className="text-red-600 mb-4">{aiError}</div>}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Summary</h3>
          <button className="text-gray-500 flex items-center text-sm hover:text-navy-700" onClick={() => setSummary('')} type="button">
            <RefreshCwIcon size={14} className="mr-1" />Clear
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 h-48 flex items-center justify-center border border-gray-200">
          <p className="text-gray-500 text-center">{summary ? summary : 'Upload a document or paste text to generate a summary'}</p>
        </div>
      </div>
    </div>
  );
};