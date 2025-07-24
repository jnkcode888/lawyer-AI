import { useEffect, useState } from 'react';
import { BarChart3Icon, UsersIcon, FileTextIcon, CalendarIcon, FolderIcon, ZapIcon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2563eb', '#22c55e', '#a21caf', '#f59e42', '#e11d48', '#eab308', '#6366f1'];

interface Metrics {
  cases: number;
  clients: number;
  documents: number;
  events: number;
  campaigns: number;
  workflows: number;
}

interface Case {
  id: string;
  created_at?: string;
  type?: string;
}

interface ChartData {
  month: string;
  count: number;
}

interface PieData {
  name: string;
  value: number;
}

export const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    cases: 0,
    clients: 0,
    documents: 0,
    events: 0,
    campaigns: 0,
    workflows: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [casesPerMonth, setCasesPerMonth] = useState<ChartData[]>([]);
  const [caseTypeDist, setCaseTypeDist] = useState<PieData[]>([]);

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const [cases, clients, documents, events, campaigns, workflows] = await Promise.all([
        supabase.from('cases').select('id, created_at, type'),
        supabase.from('clients').select('id'),
        supabase.from('documents').select('id'),
        supabase.from('events').select('id'),
        supabase.from('campaigns').select('id'),
        supabase.from('workflows').select('id'),
      ]);
      setMetrics({
        cases: cases.data?.length || 0,
        clients: clients.data?.length || 0,
        documents: documents.data?.length || 0,
        events: events.data?.length || 0,
        campaigns: campaigns.data?.length || 0,
        workflows: workflows.data?.length || 0,
      });
      // Cases per month (bar chart)
      const monthMap: Record<string, number> = {};
      (cases.data as Case[] || []).forEach((c) => {
        if (!c.created_at) return;
        const d = new Date(c.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = (monthMap[key] || 0) + 1;
      });
      const monthData: ChartData[] = Object.entries(monthMap).map(([month, count]) => ({ month, count }));
      setCasesPerMonth(monthData);
      // Case type distribution (pie chart)
      const typeMap: Record<string, number> = {};
      (cases.data as Case[] || []).forEach((c) => {
        if (!c.type) return;
        typeMap[c.type] = (typeMap[c.type] || 0) + 1;
      });
      const typeData: PieData[] = Object.entries(typeMap).map(([type, value]) => ({ name: type, value }));
      setCaseTypeDist(typeData);
    } catch (e) {
      setError('Failed to fetch analytics.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Visualize your law firm’s key metrics and performance</p>
      </header>
      {loading ? (
        <div className="text-gray-500">Loading analytics...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
              <FolderIcon size={32} className="text-blue-500 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{metrics.cases}</div>
                <div className="text-gray-500">Cases</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
              <UsersIcon size={32} className="text-green-500 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{metrics.clients}</div>
                <div className="text-gray-500">Clients</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
              <FileTextIcon size={32} className="text-purple-500 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{metrics.documents}</div>
                <div className="text-gray-500">Documents</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
              <CalendarIcon size={32} className="text-orange-500 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{metrics.events}</div>
                <div className="text-gray-500">Events</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
              <BarChart3Icon size={32} className="text-pink-500 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{metrics.campaigns}</div>
                <div className="text-gray-500">Campaigns</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
              <ZapIcon size={32} className="text-yellow-500 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{metrics.workflows}</div>
                <div className="text-gray-500">Workflows</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Cases Per Month</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={casesPerMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Case Type Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={caseTypeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {caseTypeDist.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 