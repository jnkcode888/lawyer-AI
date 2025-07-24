import React from 'react';
import { FileTextIcon, FileDigitIcon, SearchIcon, CalendarIcon, MessagesSquareIcon, BarChart3Icon, FolderIcon, ClockIcon, ZapIcon, UserIcon, XIcon } from 'lucide-react';
interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}
export const Sidebar = ({
  activeSection,
  setActiveSection,
  mobileOpen = false,
  onMobileClose
}: SidebarProps) => {
  const navItems = [
    { id: 'draft', label: 'Draft Documents', icon: <FileTextIcon size={20} /> },
    { id: 'summarize', label: 'Summarize Briefs', icon: <FileDigitIcon size={20} /> },
    { id: 'research', label: 'Legal Research', icon: <SearchIcon size={20} /> },
    { id: 'schedule', label: 'Court Schedule', icon: <CalendarIcon size={20} /> },
    { id: 'chatbot', label: 'Client Chatbot', icon: <MessagesSquareIcon size={20} /> },
    { id: 'growth', label: 'Client Growth', icon: <BarChart3Icon size={20} /> },
    { id: 'cases', label: 'Case Management', icon: <FolderIcon size={20} /> },
    { id: 'calendar', label: 'Calendar', icon: <ClockIcon size={20} /> },
    { id: 'automation', label: 'Workflow Automation', icon: <ZapIcon size={20} /> },
    { id: 'clients', label: 'Client Management', icon: <UserIcon size={20} /> },
    { id: 'documents', label: 'Document Management', icon: <FileTextIcon size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3Icon size={20} /> },
  ];

  // Mobile overlay sidebar
  if (mobileOpen) {
    return (
      <aside className="fixed inset-0 z-40 flex md:hidden">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onMobileClose}></div>
        {/* Sidebar panel */}
        <div className="relative bg-navy-700 text-white w-56 max-h-screen min-h-0 p-4 flex flex-col shadow-xl animate-slide-in-left overflow-y-auto">
          <button className="absolute top-3 right-3 text-white" onClick={onMobileClose} aria-label="Close menu">
            <XIcon size={28} />
          </button>
          <div className="mb-8 mt-2">
            <h1 className="text-xl font-bold">LawAssist AI</h1>
            <p className="text-gray-300 text-sm">Smart legal assistance</p>
          </div>
          <nav className="flex-grow mt-4">
            <ul className="space-y-2">
              {navItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveSection(item.id);
                      if (onMobileClose) onMobileClose();
                    }}
                    className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${activeSection === item.id ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-navy-700 text-white w-full md:w-64 md:min-h-screen p-4 flex flex-col">
      <div className="mb-8 mt-2">
        <h1 className="text-xl font-bold">LawAssist AI</h1>
        <p className="text-gray-300 text-sm">Smart legal assistance</p>
      </div>
      {/* Mobile horizontal scroll nav - removed for mobile clean navbar */}
      {/* Desktop vertical nav */}
      <nav className="hidden md:block flex-grow mt-4">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${activeSection === item.id ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="hidden md:block pt-4 mt-auto border-t border-white/10">
        <div className="flex items-center px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 mr-3"></div>
          <div>
            <p className="font-medium">Jane Smith</p>
            <p className="text-xs text-gray-300">Smith & Partners</p>
          </div>
        </div>
      </div>
    </aside>
  );
};