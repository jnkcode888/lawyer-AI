import React, { useState, useEffect } from 'react';
import { ZapIcon, MailIcon, FileTextIcon, BellIcon, ClipboardIcon, PlusIcon, PlayIcon, PauseIcon, CheckCircleIcon, SettingsIcon, EditIcon, Trash2Icon, XIcon, SparklesIcon, Loader2Icon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';
import { draftLegalDocument } from '../../api/openai';

export const WorkflowAutomation = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({ name: '', description: '', type: 'email', status: 'active', config: '{}', last_run: '', });
  const [editId, setEditId] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWorkflows();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchWorkflows = async () => {
    setLoading(true);
    setError('');
    let query = supabase.from('workflows').select('*');
    if (activeTab === 'active') {
      query = query.eq('status', 'active');
    } else if (activeTab === 'inactive') {
      query = query.eq('status', 'inactive');
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      setError('Failed to fetch workflows.');
      setWorkflows([]);
    } else {
      setWorkflows(data || []);
    }
    setLoading(false);
  };

  // CRUD Handlers
  const openAddModal = () => {
    setForm({ name: '', description: '', type: 'email', status: 'active', config: '{}', last_run: '' });
    setModalMode('add');
    setEditId(null);
    setShowModal(true);
    setAiError('');
    setSuccess('');
  };

  const openEditModal = (workflow: any) => {
    setForm({ ...workflow });
    setModalMode('edit');
    setEditId(workflow.id);
    setShowModal(true);
    setAiError('');
    setSuccess('');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification('');
    if (modalMode === 'add') {
      const { error } = await supabase.from('workflows').insert([{ ...form }]);
      if (error) {
        setNotification('Failed to add workflow.');
      } else {
        setNotification('Workflow added successfully!');
        setShowModal(false);
        fetchWorkflows();
      }
    } else if (modalMode === 'edit' && editId) {
      const { error } = await supabase.from('workflows').update({ ...form }).eq('id', editId);
      if (error) {
        setNotification('Failed to update workflow.');
      } else {
        setNotification('Workflow updated successfully!');
        setShowModal(false);
        fetchWorkflows();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setNotification('');
    const { error } = await supabase.from('workflows').delete().eq('id', id);
    if (error) {
      setNotification('Failed to delete workflow.');
    } else {
      setNotification('Workflow deleted successfully!');
      setShowDeleteId(null);
      fetchWorkflows();
    }
    setLoading(false);
  };

  const handleAISuggest = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const prompt = `You are a legal operations expert. Suggest a detailed workflow for the following law firm process or goal.\n\nWorkflow Name/Goal: ${form.name}`;
      const result = await draftLegalDocument(prompt);
      setForm({ ...form, description: result });
    } catch (e: any) {
      setAiError(e.message || 'Failed to generate AI workflow.');
    }
    setAiLoading(false);
  };

  // Mock data for templates (could be fetched from Supabase if needed)
  const templates = [
    {
    id: 1,
    name: 'New Client Welcome',
    description: 'Send welcome email with intake forms and next steps',
    type: 'email',
      complexity: 'Simple',
    },
    {
    id: 2,
    name: 'Monthly Billing Update',
    description: 'Notify clients of hours worked and current billing status',
    type: 'email',
      complexity: 'Medium',
    },
    {
    id: 3,
    name: 'Case Status Report',
    description: 'Generate comprehensive status report for active cases',
    type: 'document',
      complexity: 'Complex',
    },
    {
    id: 4,
    name: 'Deadline Alert System',
    description: 'Multi-step notification system for approaching deadlines',
    type: 'notification',
      complexity: 'Complex',
    },
  ];

  // Get workflow type icon
  const getWorkflowTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <MailIcon size={18} className="text-blue-500" />;
      case 'document':
        return <FileTextIcon size={18} className="text-green-500" />;
      case 'notification':
        return <BellIcon size={18} className="text-purple-500" />;
      case 'task':
        return <ClipboardIcon size={18} className="text-orange-500" />;
      default:
        return <ZapIcon size={18} className="text-gray-500" />;
    }
  };
  // Get workflow status button
  const getWorkflowStatusButton = (status: string) => {
    if (status === 'active') {
      return (
        <button className="flex items-center text-sm font-medium text-red-600 hover:text-red-700">
          <PauseIcon size={14} className="mr-1" />Pause
        </button>
      );
    }
    return (
      <button className="flex items-center text-sm font-medium text-green-600 hover:text-green-700">
        <PlayIcon size={14} className="mr-1" />Activate
      </button>
    );
  };
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Workflow Automation</h1>
        <p className="text-gray-600 mt-2">Create and manage automated workflows to save time and reduce repetitive tasks</p>
      </header>
      <div className="bg-navy-700 text-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-xl font-medium mb-2">Automation Dashboard</h2>
            <p className="text-gray-300">Your automated workflows saved you approximately 10.5 hours this week</p>
          </div>
          <button className="mt-4 md:mt-0 bg-white text-navy-700 px-4 py-2 rounded-lg font-medium flex items-center hover:bg-gray-100" onClick={openAddModal}>
            <PlusIcon size={18} className="mr-2" />Add Workflow
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex mb-6 border-b">
          <button className={`px-4 py-3 font-medium ${activeTab === 'active' ? 'text-navy-700 border-b-2 border-navy-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('active')}>Active Workflows</button>
          <button className={`px-4 py-3 font-medium ${activeTab === 'inactive' ? 'text-navy-700 border-b-2 border-navy-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('inactive')}>Inactive</button>
          <button className={`px-4 py-3 font-medium ${activeTab === 'all' ? 'text-navy-700 border-b-2 border-navy-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('all')}>All Workflows</button>
        </div>
        <div className="space-y-4">
          {notification && <div className="text-green-600 mb-2">{notification}</div>}
          {loading && <div className="text-gray-500">Loading workflows...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && workflows.length === 0 && <div className="text-gray-500">No workflows found.</div>}
          {workflows.map((workflow) => (
            <div key={workflow.id} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 relative">
              <div className="absolute top-2 right-2 flex gap-2">
                <button className="text-blue-600 hover:text-blue-800" onClick={() => openEditModal(workflow)} title="Edit"><EditIcon size={16} /></button>
                <button className="text-red-600 hover:text-red-800" onClick={() => setShowDeleteId(workflow.id)} title="Delete"><Trash2Icon size={16} /></button>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">{getWorkflowTypeIcon(workflow.type)}</div>
                  <div>
                    <h3 className="font-medium text-gray-800">{workflow.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{workflow.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getWorkflowStatusButton(workflow.status)}
                  <button className="ml-3 text-gray-400 hover:text-gray-600"><SettingsIcon size={16} /></button>
                </div>
              </div>
              <div className="flex items-center mt-4 pt-3 border-t border-gray-100 text-sm text-gray-600">
                <div className="mr-6"><span className="text-gray-500">Last run:</span> {workflow.last_run ? new Date(workflow.last_run).toLocaleDateString() : '-'}</div>
                <div><span className="text-gray-500">Time saved:</span> {workflow.time_saved || '-'}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Delete confirmation modal */}
        {showDeleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4">Delete Workflow?</h3>
              <p className="mb-4">Are you sure you want to delete this workflow?</p>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowDeleteId(null)}>Cancel</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => handleDelete(showDeleteId)}>Delete</button>
              </div>
            </div>
          </div>
        )}
        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)}><XIcon size={20} /></button>
              <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Workflow' : 'Edit Workflow'}</h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Name</label>
                  <input name="name" value={form.name} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" required />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Type</label>
                  <select name="type" value={form.type} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2">
                    <option value="email">Email</option>
                    <option value="document">Document</option>
                    <option value="notification">Notification</option>
                    <option value="task">Task</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Config (JSON)</label>
                  <input name="config" value={form.config} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Last Run</label>
                  <input name="last_run" type="date" value={form.last_run ? form.last_run.slice(0, 10) : ''} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-700 disabled:opacity-50" onClick={handleAISuggest} type="button" disabled={aiLoading || !form.name}>
                    <SparklesIcon size={18} className="mr-2" />{aiLoading ? <Loader2Icon className="animate-spin" size={18} /> : 'AI Suggest Workflow'}
                  </button>
                  {aiError && <span className="text-red-600 text-sm ml-2">{aiError}</span>}
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-navy-700 text-white rounded hover:bg-navy-800" disabled={loading}>{modalMode === 'add' ? 'Add' : 'Update'}</button>
                </div>
              </form>
              {success && <div className="text-green-600 mt-3">{success}</div>}
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-gray-800">Workflow Templates</h2>
          <button className="text-navy-700 text-sm font-medium hover:text-navy-800">View All Templates</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getWorkflowTypeIcon(template.type)}
                  <h3 className="font-medium text-gray-800 ml-2">{template.name}</h3>
                </div>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{template.complexity}</span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{template.description}</p>
              <button className="text-navy-700 text-sm font-medium hover:text-navy-800">Use Template</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};