import React, { useState, useEffect } from 'react';
import { BarChart3Icon, TrendingUpIcon, UsersIcon, SendIcon, MailIcon, EyeIcon, RefreshCwIcon, PlusIcon, EditIcon, Trash2Icon, XIcon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';

export const ClientGrowthMarketing = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [audienceSegments, setAudienceSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({ name: '', status: 'active', reach: 0, engagement: 0, leads: 0, last_run: '', });
  const [editId, setEditId] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    if (activeTab === 'campaigns') {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        setError('Failed to fetch campaigns.');
        setCampaigns([]);
      } else {
        setCampaigns(data || []);
      }
    } else {
      setAudienceSegments([
        { id: 1, name: 'Corporate Executives', count: 350 },
        { id: 2, name: 'Family Offices', count: 125 },
        { id: 3, name: 'Real Estate Investors', count: 280 },
        { id: 4, name: 'Tech Entrepreneurs', count: 210 },
      ]);
    }
    setLoading(false);
  };

  // CRUD Handlers
  const openAddModal = () => {
    setForm({ name: '', status: 'active', reach: 0, engagement: 0, leads: 0, last_run: '' });
    setModalMode('add');
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (campaign: any) => {
    setForm({ ...campaign });
    setModalMode('edit');
    setEditId(campaign.id);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification('');
    if (modalMode === 'add') {
      const { error } = await supabase.from('campaigns').insert([{ ...form }]);
      if (error) {
        setNotification('Failed to add campaign.');
      } else {
        setNotification('Campaign added successfully!');
        setShowModal(false);
        fetchData();
      }
    } else if (modalMode === 'edit' && editId) {
      const { error } = await supabase.from('campaigns').update({ ...form }).eq('id', editId);
      if (error) {
        setNotification('Failed to update campaign.');
      } else {
        setNotification('Campaign updated successfully!');
        setShowModal(false);
        fetchData();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setNotification('');
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) {
      setNotification('Failed to delete campaign.');
    } else {
      setNotification('Campaign deleted successfully!');
      setShowDeleteId(null);
      fetchData();
    }
    setLoading(false);
  };

  // Calculate totals for dashboard
  const totalReach = campaigns.reduce((sum, c) => sum + (c.reach || 0), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.leads || 0), 0);
  const avgEngagement = campaigns.length ? (campaigns.reduce((sum, c) => sum + (c.engagement || 0), 0) / campaigns.length).toFixed(1) : '0';
  const avgConversion = campaigns.length ? (campaigns.reduce((sum, c) => sum + ((c.leads || 0) / (c.reach || 1)), 0) / campaigns.length * 100).toFixed(1) : '0';

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Client Growth & Marketing</h1>
        <p className="text-gray-600 mt-2">Target high-net-worth clients with strategic marketing campaigns</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Total Reach</h3>
            <EyeIcon size={18} className="text-blue-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-800">{totalReach.toLocaleString()}</span>
            <span className="ml-2 text-green-500 text-sm flex items-center">
              <TrendingUpIcon size={14} className="mr-1" />12%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">New Leads</h3>
            <UsersIcon size={18} className="text-purple-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-800">{totalLeads}</span>
            <span className="ml-2 text-green-500 text-sm flex items-center">
              <TrendingUpIcon size={14} className="mr-1" />8%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Conversion Rate</h3>
            <BarChart3Icon size={18} className="text-green-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-800">{avgConversion}%</span>
            <span className="ml-2 text-green-500 text-sm flex items-center">
              <TrendingUpIcon size={14} className="mr-1" />3%
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex mb-6 border-b">
          <button className={`px-4 py-3 font-medium ${activeTab === 'campaigns' ? 'text-navy-700 border-b-2 border-navy-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('campaigns')}>Campaigns</button>
          <button className={`px-4 py-3 font-medium ${activeTab === 'audience' ? 'text-navy-700 border-b-2 border-navy-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('audience')}>Audience Segments</button>
        </div>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {activeTab === 'campaigns' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Marketing Campaigns</h3>
              <button className="bg-navy-700 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-navy-800" onClick={openAddModal}>
                <PlusIcon size={16} className="mr-2" />
                Add Campaign
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Campaign Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Reach</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Engagement</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Leads</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Last Run</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4"><div className="font-medium text-gray-800">{campaign.name}</div></td>
                      <td className="py-3 px-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>{campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}</span></td>
                      <td className="py-3 px-4 text-gray-700">{campaign.reach?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-700">{campaign.engagement}%</td>
                      <td className="py-3 px-4 text-gray-700">{campaign.leads}</td>
                      <td className="py-3 px-4 text-gray-700">{campaign.last_run ? new Date(campaign.last_run).toLocaleDateString() : '-'}</td>
                      <td className="py-3 px-4 text-gray-700">
                        <button className="text-blue-600 hover:text-blue-800 mr-2" onClick={() => openEditModal(campaign)} title="Edit"><EditIcon size={16} /></button>
                        <button className="text-red-600 hover:text-red-800" onClick={() => setShowDeleteId(campaign.id)} title="Delete"><Trash2Icon size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Delete confirmation modal */}
            {showDeleteId && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                  <h3 className="text-lg font-bold mb-4">Delete Campaign?</h3>
                  <p className="mb-4">Are you sure you want to delete this campaign?</p>
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
                  <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Campaign' : 'Edit Campaign'}</h2>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Name</label>
                      <input name="name" value={form.name} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" required />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Status</label>
                      <select name="status" value={form.status} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2">
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Reach</label>
                      <input name="reach" type="number" value={form.reach} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Engagement (%)</label>
                      <input name="engagement" type="number" value={form.engagement} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Leads</label>
                      <input name="leads" type="number" value={form.leads} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Last Run</label>
                      <input name="last_run" type="date" value={form.last_run ? form.last_run.slice(0, 10) : ''} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowModal(false)}>Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-navy-700 text-white rounded hover:bg-navy-800" disabled={loading}>{modalMode === 'add' ? 'Add' : 'Update'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {notification && <div className="text-green-600 mt-4">{notification}</div>}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Client Segments</h3>
              <button className="text-navy-700 flex items-center text-sm hover:text-navy-800" onClick={fetchData}>
                <RefreshCwIcon size={14} className="mr-1" />Refresh Data
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {audienceSegments.map((segment) => (
                <div key={segment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800">{segment.name}</h4>
                    <span className="text-gray-600">{segment.count} contacts</span>
                  </div>
                  <div className="mt-3 flex items-center">
                    <button className="text-navy-700 text-sm flex items-center mr-4 hover:text-navy-800">
                      <MailIcon size={14} className="mr-1" />Send Email
                    </button>
                    <button className="text-gray-600 text-sm hover:text-gray-800">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};