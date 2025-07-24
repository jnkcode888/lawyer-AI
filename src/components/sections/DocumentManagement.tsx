import React, { useState, useEffect, useRef } from 'react';
import { FileTextIcon, PlusIcon, EditIcon, Trash2Icon, XIcon, UploadIcon, LinkIcon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';

export const DocumentManagement = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({ title: '', type: '', url: '', summary: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line
  }, [searchQuery]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    let query = supabase.from('documents').select('*');
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      setError('Failed to fetch documents.');
      setDocuments([]);
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setForm({ title: '', type: '', url: '', summary: '' });
    setModalMode('add');
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (doc: any) => {
    setForm({ ...doc });
    setModalMode('edit');
    setEditId(doc.id);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setNotification('');
    const filePath = `documents/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('documents').upload(filePath, file);
    if (error) {
      setNotification('Failed to upload file.');
    } else {
      const publicUrl = supabase.storage.from('documents').getPublicUrl(filePath).data.publicUrl;
      setForm((prev: any) => ({ ...prev, url: publicUrl }));
      setNotification('File uploaded successfully!');
    }
    setUploading(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification('');
    if (modalMode === 'add') {
      const { error } = await supabase.from('documents').insert([{ ...form }]);
      if (error) {
        setNotification('Failed to add document.');
      } else {
        setNotification('Document added successfully!');
        setShowModal(false);
        fetchDocuments();
      }
    } else if (modalMode === 'edit' && editId) {
      const { error } = await supabase.from('documents').update({ ...form }).eq('id', editId);
      if (error) {
        setNotification('Failed to update document.');
      } else {
        setNotification('Document updated successfully!');
        setShowModal(false);
        fetchDocuments();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setNotification('');
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) {
      setNotification('Failed to delete document.');
    } else {
      setNotification('Document deleted successfully!');
      setShowDeleteId(null);
      fetchDocuments();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Document Management</h1>
        <p className="text-gray-600 mt-2">Manage your documents and upload files</p>
      </header>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center">
            <input type="text" placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="ml-2 bg-navy-700 text-white p-2 rounded-lg hover:bg-navy-800" onClick={openAddModal} title="Add Document">
            <PlusIcon size={18} />
          </button>
        </div>
        <div className="space-y-4">
          {notification && <div className="text-green-600 mb-2">{notification}</div>}
          {loading && <div className="text-gray-500">Loading documents...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && documents.length === 0 && <div className="text-gray-500">No documents found.</div>}
          {documents.map(doc => (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 relative">
              <div className="absolute top-2 right-2 flex gap-2">
                <button className="text-blue-600 hover:text-blue-800" onClick={() => openEditModal(doc)} title="Edit"><EditIcon size={16} /></button>
                <button className="text-red-600 hover:text-red-800" onClick={() => setShowDeleteId(doc.id)} title="Delete"><Trash2Icon size={16} /></button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-500 mr-2">{doc.id}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"><FileTextIcon size={14} className="mr-1" />Document</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mt-1">{doc.title}</h3>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  <span className="text-gray-500 text-sm flex items-center mr-4"><LinkIcon size={14} className="mr-1" />{doc.url ? <a href={doc.url} target="_blank" rel="noopener noreferrer" className="underline">View File</a> : 'No file'}</span>
                  <span className="text-gray-500 text-sm flex items-center">{doc.type}</span>
                </div>
              </div>
              <div className="mt-2 text-gray-600 text-sm">{doc.summary}</div>
              {/* Delete confirmation modal */}
              {showDeleteId === doc.id && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                    <h3 className="text-lg font-bold mb-4">Delete Document?</h3>
                    <p className="mb-4">Are you sure you want to delete this document?</p>
                    <div className="flex justify-end gap-2">
                      <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowDeleteId(null)}>Cancel</button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => handleDelete(doc.id)}>Delete</button>
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
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Document' : 'Edit Document'}</h2>
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
                <label className="block text-gray-700 font-medium mb-1">Summary</label>
                <textarea name="summary" value={form.summary} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">File</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <UploadIcon size={16} className="mr-2" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                  {form.url && (
                    <a href={form.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">View File</a>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-navy-700 text-white rounded hover:bg-navy-800" disabled={loading || uploading}>{modalMode === 'add' ? 'Add' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 