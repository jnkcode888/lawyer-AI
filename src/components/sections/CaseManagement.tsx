import React, { useState, useEffect } from 'react';
import { FolderIcon, UserIcon, CalendarIcon, CheckSquareIcon, ClockIcon, AlertCircleIcon, PlusIcon, SearchIcon, FilterIcon, EditIcon, Trash2Icon, XIcon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';

export const CaseManagement = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({ title: '', type: '', status: 'active', priority: 'medium', due_date: '', notes: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line
  }, [activeFilter, searchQuery]);

  const fetchCases = async () => {
    setLoading(true);
    setError('');
    let query = supabase.from('cases').select('*');
    if (activeFilter !== 'all') {
      query = query.eq('status', activeFilter);
    }
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      setError('Failed to fetch cases.');
      setCases([]);
    } else {
      setCases(data || []);
    }
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const openAddModal = () => {
    setForm({ title: '', type: '', status: 'active', priority: 'medium', due_date: '', notes: '' });
    setModalMode('add');
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (caseItem: any) => {
    setForm({ ...caseItem });
    setModalMode('edit');
    setEditId(caseItem.id);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification('');
    if (modalMode === 'add') {
      const { error } = await supabase.from('cases').insert([{ ...form }]);
      if (error) {
        setNotification('Failed to add case.');
      } else {
        setNotification('Case added successfully!');
        setShowModal(false);
        fetchCases();
      }
    } else if (modalMode === 'edit' && editId) {
      const { error } = await supabase.from('cases').update({ ...form }).eq('id', editId);
      if (error) {
        setNotification('Failed to update case.');
      } else {
        setNotification('Case updated successfully!');
        setShowModal(false);
        fetchCases();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setNotification('');
    const { error } = await supabase.from('cases').delete().eq('id', id);
    if (error) {
      setNotification('Failed to delete case.');
    } else {
      setNotification('Case deleted successfully!');
      setShowDeleteId(null);
      fetchCases();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Case Management</h1>
        <p className="text-gray-600 mt-2">Organize and track all your active legal cases</p>
      </header>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4 md:gap-0">
          <div className="flex flex-col sm:flex-row gap-2 mb-2 md:mb-0">
            <button onClick={() => setActiveFilter('all')} className={`px-3 py-2 rounded-md text-sm ${activeFilter === 'all' ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All Cases</button>
            <button onClick={() => setActiveFilter('active')} className={`px-3 py-2 rounded-md text-sm ${activeFilter === 'active' ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Active</button>
            <button onClick={() => setActiveFilter('pending')} className={`px-3 py-2 rounded-md text-sm ${activeFilter === 'pending' ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Pending</button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" placeholder="Search cases..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto" />
            <button className="bg-navy-700 text-white p-2 rounded-lg hover:bg-navy-800 w-full sm:w-auto" onClick={openAddModal} title="Add Case">
              <PlusIcon size={18} />
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {notification && <div className="text-green-600 mb-2">{notification}</div>}
          {loading && <div className="text-gray-500">Loading cases...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && cases.length === 0 && <div className="text-gray-500">No cases found.</div>}
          {cases.map(caseItem => (
            <div key={caseItem.id} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 relative">
              <div className="absolute top-2 right-2 flex gap-2">
                <button className="text-blue-600 hover:text-blue-800" onClick={() => openEditModal(caseItem)} title="Edit"><EditIcon size={16} /></button>
                <button className="text-red-600 hover:text-red-800" onClick={() => setShowDeleteId(caseItem.id)} title="Delete"><Trash2Icon size={16} /></button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-500 mr-2">{caseItem.id}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(caseItem.priority)}`}>{caseItem.priority?.charAt(0).toUpperCase() + caseItem.priority?.slice(1) || 'N/A'} Priority</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mt-1">{caseItem.title}</h3>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  <button className="text-navy-700 text-sm mr-3 hover:text-navy-800">View Details</button>
                  <button className="text-gray-500 text-sm hover:text-gray-700">Assign Task</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-y-2">
                <div className="flex items-center mr-6"><UserIcon size={16} className="text-gray-400 mr-1" /><span className="text-sm text-gray-700">{caseItem.client || 'N/A'}</span></div>
                <div className="flex items-center mr-6"><FolderIcon size={16} className="text-gray-400 mr-1" /><span className="text-sm text-gray-700">{caseItem.type || 'N/A'}</span></div>
                <div className="flex items-center mr-6"><CalendarIcon size={16} className="text-gray-400 mr-1" /><span className="text-sm text-gray-700">{caseItem.due_date ? new Date(caseItem.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span></div>
                <div className="flex items-center"><CheckSquareIcon size={16} className="text-gray-400 mr-1" /><span className="text-sm text-gray-700">-</span></div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">PROGRESS</div>
                  <div className="text-xs text-gray-500">-</div>
                </div>
                <div className="mt-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-navy-700 rounded-full" style={{ width: `0%` }}></div>
                </div>
              </div>
              {/* Delete confirmation modal */}
              {showDeleteId === caseItem.id && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                    <h3 className="text-lg font-bold mb-4">Delete Case?</h3>
                    <p className="mb-4">Are you sure you want to delete this case?</p>
                    <div className="flex justify-end gap-2">
                      <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowDeleteId(null)}>Cancel</button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => handleDelete(caseItem.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)}><XIcon size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Case' : 'Edit Case'}</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Title</label>
                <input name="title" value={form.title} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Type</label>
                <input name="type" value={form.type} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Priority</label>
                <select name="priority" value={form.priority} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Due Date</label>
                <input name="due_date" type="date" value={form.due_date} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-navy-700 text-white rounded hover:bg-navy-800" disabled={loading}>{modalMode === 'add' ? 'Add' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};