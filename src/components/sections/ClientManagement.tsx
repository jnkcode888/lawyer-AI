import React, { useState, useEffect } from 'react';
import { UserIcon, MailIcon, PhoneIcon, PlusIcon, EditIcon, Trash2Icon, XIcon, Building2Icon, FileTextIcon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';

export const ClientManagement = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({ name: '', email: '', phone: '', company: '', notes: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line
  }, [searchQuery]);

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    let query = supabase.from('clients').select('*');
    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      setError('Failed to fetch clients.');
      setClients([]);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setForm({ name: '', email: '', phone: '', company: '', notes: '' });
    setModalMode('add');
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (client: any) => {
    setForm({ ...client });
    setModalMode('edit');
    setEditId(client.id);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification('');
    if (modalMode === 'add') {
      const { error } = await supabase.from('clients').insert([{ ...form }]);
      if (error) {
        setNotification('Failed to add client.');
      } else {
        setNotification('Client added successfully!');
        setShowModal(false);
        fetchClients();
      }
    } else if (modalMode === 'edit' && editId) {
      const { error } = await supabase.from('clients').update({ ...form }).eq('id', editId);
      if (error) {
        setNotification('Failed to update client.');
      } else {
        setNotification('Client updated successfully!');
        setShowModal(false);
        fetchClients();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setNotification('');
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      setNotification('Failed to delete client.');
    } else {
      setNotification('Client deleted successfully!');
      setShowDeleteId(null);
      fetchClients();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Client Management</h1>
        <p className="text-gray-600 mt-2">Manage your clients and their information</p>
      </header>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4 md:gap-0">
          <div className="flex items-center w-full md:w-auto">
            <input type="text" placeholder="Search clients..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
          </div>
          <button className="bg-navy-700 text-white p-2 rounded-lg hover:bg-navy-800 w-full md:w-auto" onClick={openAddModal} title="Add Client">
            <PlusIcon size={18} />
          </button>
        </div>
        <div className="space-y-4">
          {notification && <div className="text-green-600 mb-2">{notification}</div>}
          {loading && <div className="text-gray-500">Loading clients...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && clients.length === 0 && <div className="text-gray-500">No clients found.</div>}
          {clients.map(client => (
            <div key={client.id} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 relative">
              <div className="absolute top-2 right-2 flex gap-2">
                <button className="text-blue-600 hover:text-blue-800" onClick={() => openEditModal(client)} title="Edit"><EditIcon size={16} /></button>
                <button className="text-red-600 hover:text-red-800" onClick={() => setShowDeleteId(client.id)} title="Delete"><Trash2Icon size={16} /></button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-500 mr-2">{client.id}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><UserIcon size={14} className="mr-1" />Client</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mt-1">{client.name}</h3>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  <span className="text-gray-500 text-sm flex items-center mr-4"><MailIcon size={14} className="mr-1" />{client.email}</span>
                  <span className="text-gray-500 text-sm flex items-center mr-4"><PhoneIcon size={14} className="mr-1" />{client.phone}</span>
                  <span className="text-gray-500 text-sm flex items-center"><Building2Icon size={14} className="mr-1" />{client.company}</span>
                </div>
              </div>
              <div className="mt-2 text-gray-600 text-sm"><FileTextIcon size={14} className="mr-1 inline" />{client.notes}</div>
              {/* Delete confirmation modal */}
              {showDeleteId === client.id && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                    <h3 className="text-lg font-bold mb-4">Delete Client?</h3>
                    <p className="mb-4">Are you sure you want to delete this client?</p>
                    <div className="flex justify-end gap-2">
                      <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowDeleteId(null)}>Cancel</button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => handleDelete(client.id)}>Delete</button>
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
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Client' : 'Edit Client'}</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Name</label>
                <input name="name" value={form.name} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Company</label>
                <input name="company" value={form.company} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
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