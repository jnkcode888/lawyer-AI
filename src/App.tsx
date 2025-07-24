import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DraftDocuments } from './components/sections/DraftDocuments';
import { SummarizeBriefs } from './components/sections/SummarizeBriefs';
import { LegalResearch } from './components/sections/LegalResearch';
import { CourtSchedule } from './components/sections/CourtSchedule';
import { ChatbotManager } from './components/sections/ChatbotManager';
import { ClientGrowthMarketing } from './components/sections/ClientGrowthMarketing';
import { CaseManagement } from './components/sections/CaseManagement';
import { CalendarManagement } from './components/sections/CalendarManagement';
import { WorkflowAutomation } from './components/sections/WorkflowAutomation';
import { DocumentManagement } from './components/sections/DocumentManagement';
import { useSession } from '@supabase/auth-helpers-react';
import { Login } from './components/Login';
import { ClientManagement } from './components/sections/ClientManagement';
import { AnalyticsDashboard } from './components/sections/AnalyticsDashboard';
// Add hamburger icon
import { MenuIcon } from 'lucide-react';

export function App() {
  const session = useSession();
  const [activeSection, setActiveSection] = useState('draft');
  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session) {
    return <Login />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'draft':
        return <DraftDocuments />;
      case 'summarize':
        return <SummarizeBriefs />;
      case 'research':
        return <LegalResearch />;
      case 'schedule':
        return <CourtSchedule />;
      case 'chatbot':
        return <ChatbotManager />;
      case 'growth':
        return <ClientGrowthMarketing />;
      case 'cases':
        return <CaseManagement />;
      case 'calendar':
        return <CalendarManagement />;
      case 'automation':
        return <WorkflowAutomation />;
      case 'documents':
        return <DocumentManagement />;
      case 'clients':
        return <ClientManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <DraftDocuments />;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between bg-navy-700 text-white px-4 py-3 md:hidden shadow-sm">
        <span className="font-bold text-lg">Smith & Partners</span>
        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <MenuIcon size={28} />
        </button>
      </nav>
      <div className="flex flex-1 flex-col md:flex-row w-full">
        {/* Sidebar: overlay on mobile, static on desktop */}
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 md:p-8 overflow-auto">{renderSection()}</main>
      </div>
    </div>
  );
}