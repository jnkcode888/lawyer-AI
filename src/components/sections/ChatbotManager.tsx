import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, TrashIcon, SparklesIcon, Loader2Icon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';
import { draftLegalDocument } from '../../api/openai';

export const ChatbotManager = () => {
  const [qas, setQAs] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQA, setEditingQA] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQAs();
  }, []);

  const fetchQAs = async () => {
    const { data, error } = await supabase.from('chatbot_qas').select('*').order('created_at', { ascending: false });
    if (!error) setQAs(data || []);
  };

  const openModal = (qa: any = null) => {
    setEditingQA(qa);
    setQuestion(qa ? qa.question : '');
    setAnswer(qa ? qa.answer : '');
    setModalOpen(true);
    setAiError('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingQA(null);
    setQuestion('');
    setAnswer('');
    setAiError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    if (!question || !answer) {
      setError('Both question and answer are required.');
      setLoading(false);
      return;
    }
    if (editingQA) {
      // Update
      const { error: updateError } = await supabase.from('chatbot_qas').update({ question, answer }).eq('id', editingQA.id);
      if (updateError) setError('Failed to update Q&A.');
      else setSuccess('Q&A updated!');
    } else {
      // Insert
      const { error: insertError } = await supabase.from('chatbot_qas').insert([{ question, answer }]);
      if (insertError) setError('Failed to add Q&A.');
      else setSuccess('Q&A added!');
    }
    setLoading(false);
    fetchQAs();
    closeModal();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this Q&A?')) return;
    await supabase.from('chatbot_qas').delete().eq('id', id);
    fetchQAs();
  };

  const handleAISuggest = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const prompt = `You are a legal chatbot. Provide a clear, concise answer to the following question for a law firm client.\n\nQuestion: ${question}`;
      const result = await draftLegalDocument(prompt);
      setAnswer(result);
    } catch (e: any) {
      setAiError(e.message || 'Failed to generate AI answer.');
    }
    setAiLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Chatbot Q&A Manager</h1>
        <p className="text-gray-600 mt-2">Manage the questions and answers your chatbot can use</p>
      </header>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <button className="bg-navy-700 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-navy-800 mb-4" onClick={() => openModal()}>
          <PlusIcon size={18} className="mr-2" />Add Q&A
          </button>
        <div className="divide-y">
          {qas.map((qa) => (
            <div key={qa.id} className="py-4 flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-800">Q: {qa.question}</div>
                <div className="text-gray-600 text-sm mt-1">A: {qa.answer}</div>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800" onClick={() => openModal(qa)}><EditIcon size={16} /></button>
                <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(qa.id)}><TrashIcon size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={closeModal}>&times;</button>
            <h2 className="text-xl font-bold mb-4">{editingQA ? 'Edit Q&A' : 'Add Q&A'}</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Question</label>
              <input className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Enter the question..." />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Answer</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Enter the answer..." />
        </div>
            <div className="flex items-center gap-3 mb-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-700 disabled:opacity-50" onClick={handleAISuggest} type="button" disabled={aiLoading || !question}>
                <SparklesIcon size={18} className="mr-2" />{aiLoading ? <Loader2Icon className="animate-spin" size={18} /> : 'AI Suggest Answer'}
              </button>
              {aiError && <span className="text-red-600 text-sm ml-2">{aiError}</span>}
          </div>
            <div className="flex gap-3">
              <button className="bg-navy-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-navy-800" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300" onClick={closeModal} type="button">Cancel</button>
          </div>
            {error && <div className="text-red-600 mt-3">{error}</div>}
            {success && <div className="text-green-600 mt-3">{success}</div>}
          </div>
        </div>
      )}
      </div>
  );
};