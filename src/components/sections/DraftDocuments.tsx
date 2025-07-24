import React, { useState } from 'react';
import { FileTextIcon, ChevronDownIcon, SendIcon, SparklesIcon, ClipboardIcon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';
import { draftLegalDocument } from '../../api/openai';

export const DraftDocuments = () => {
  const [documentType, setDocumentType] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [caseName, setCaseName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documentTypes, setDocumentTypes] = useState([
    'Contract Agreement',
    'Legal Opinion',
    'Cease and Desist',
    'Settlement Proposal',
    'Non-disclosure Agreement',
    'Employment Contract',
  ]);
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Optionally, fetch document types from Supabase if you have a table for them
  // useEffect(() => {
  //   const fetchTypes = async () => {
  //     const { data, error } = await supabase.from('document_types').select();
  //     if (data) setDocumentTypes(data.map(d => d.name));
  //   };
  //   fetchTypes();
  // }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!documentType || !caseName || !clientName || !details) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('documents').insert([
      {
        title: `${documentType} for ${caseName}`,
        type: documentType,
        summary: details,
        // Add more fields as needed
      },
    ]);
    if (error) {
      setError('Failed to save draft.');
    } else {
      setSuccess('Draft saved successfully!');
      setCaseName('');
      setClientName('');
      setClientEmail('');
      setDetails('');
      setDocumentType('');
    }
    setLoading(false);
  };

  const handleAIDraft = async () => {
    setAiLoading(true);
    setAiError('');
    setAiDraft('');
    try {
      const prompt = `Draft a ${documentType} for the case "${caseName}". Client: ${clientName} (${clientEmail}). Details: ${details}`;
      const result = await draftLegalDocument(prompt);
      setAiDraft(result);
    } catch (e: any) {
      setAiError(e.message || 'Failed to generate draft.');
    }
    setAiLoading(false);
  };

  const handleCopyAIDraft = () => {
    setDetails(aiDraft);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Draft Legal Documents</h1>
        <p className="text-gray-600 mt-2">Select document type and input case details to generate a draft</p>
      </header>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
        <div className="mb-4 md:mb-6 relative">
          <label className="block text-gray-700 font-medium mb-2">Document Type <span className="text-red-500">*</span></label>
          <div className="flex items-center justify-between border border-gray-300 rounded-lg p-3 cursor-pointer hover:border-gray-400" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="flex items-center">
              <FileTextIcon className="mr-2 text-gray-500" size={18} />
              <span>{documentType || 'Select document type'}</span>
            </div>
            <ChevronDownIcon size={18} className="text-gray-500" />
          </div>
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
              {documentTypes.map((type) => (
                <div key={type} className="px-4 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => { setDocumentType(type); setShowDropdown(false); }}>
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mb-4 md:mb-6">
          <label className="block text-gray-700 font-medium mb-2">Case Name <span className="text-red-500">*</span></label>
          <input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter case name" value={caseName} onChange={(e) => setCaseName(e.target.value)} />
        </div>
        <div className="mb-4 md:mb-6">
          <label className="block text-gray-700 font-medium mb-2">Client Information</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Client email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
        </div>
        <div className="mb-4 md:mb-6">
          <label className="block text-gray-700 font-medium mb-2">Document Details <span className="text-red-500">*</span></label>
          <textarea className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter specific requirements, clauses, or details to include in the document..." value={details} onChange={(e) => setDetails(e.target.value)}></textarea>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <button type="submit" className="bg-navy-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-navy-800 disabled:opacity-50" disabled={loading}>
            <SendIcon size={18} className="mr-2" />{loading ? 'Saving...' : 'Generate Document'}
          </button>
          <button type="button" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-blue-700 disabled:opacity-50" disabled={aiLoading || !documentType || !caseName} onClick={handleAIDraft}>
            <SparklesIcon size={18} className="mr-2" />{aiLoading ? 'Drafting...' : 'AI Draft'}
          </button>
        </div>
      </form>
      {/* AI Draft Output */}
      {aiDraft && (
        <div className="bg-gray-50 rounded-xl shadow-sm border border-blue-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-blue-700 flex items-center"><SparklesIcon size={20} className="mr-2" />AI Draft</h2>
            <button className="flex items-center text-sm text-blue-700 hover:text-blue-900" onClick={handleCopyAIDraft}><ClipboardIcon size={16} className="mr-1" />Copy to Details</button>
          </div>
          <pre className="whitespace-pre-wrap text-gray-800 text-sm bg-white rounded p-4 border border-blue-100 overflow-x-auto">{aiDraft}</pre>
        </div>
      )}
      {aiError && <div className="text-red-600 mb-4">{aiError}</div>}
    </div>
  );
};