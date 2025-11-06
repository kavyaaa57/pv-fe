import { useState } from 'react';
import {
  Bell,
  Search,
  Home,
  FileSearch,
  FileText as FileTextIcon,
  Clipboard,
  CheckSquare,
  FileOutput,
  Settings,
  LogOut,
  FileText
} from 'lucide-react';

const CitationGenerator = () => {
  const [selectedFormat, setSelectedFormat] = useState('apa');

  const citationFormats = [
    { id: 'apa', name: 'APA' },
    { id: 'mla', name: 'MLA' },
    { id: 'ieee', name: 'IEEE' }
  ];

  const menuItemsTop = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: FileSearch, label: 'Find Papers', path: '/find-papers' },
    { icon: FileTextIcon, label: 'Analyze Paper', path: '/analyze' },
    { icon: Clipboard, label: 'Citations', path: '/citations', active: true },
    { icon: CheckSquare, label: 'Grammar & Plagiarism', path: '/grammar' },
    { icon: FileOutput, label: 'Report Generator', path: '/report' }
  ];

  const menuItemsBottom = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: LogOut, label: 'Logout', path: '/logout' }
  ];

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-sm text-[#333333]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-6">
          <h2 className="text-lg font-semibold">PaperVista</h2>
        </div>

        <nav className="flex-1 px-2">
          {menuItemsTop.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md mx-2 my-1 ${
                item.active
                  ? 'bg-[#e8f2ff] text-[#127CFE] font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`h-5 w-5 ${item.active ? 'text-[#127CFE]' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="space-y-1">
            {menuItemsBottom.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50"
              >
                <item.icon className="h-4 w-4 text-gray-400" />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center">
          <div className="flex-1 flex justify-center">
            <div className="relative w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#127CFE] focus:border-[#127CFE]"
                placeholder="Search research topics..."
              />
            </div>
          </div>

          <div className="pr-6 flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#127CFE] text-white rounded-lg hover:bg-[#0f6fe0]">
              <span className="w-2 h-2 bg-white rounded-full block" />
              <span>Research Workspace</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">Citation Generator</h1>
              <p className="text-gray-600 mt-2">Generate formatted citations for your research papers.</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-end">
                <div className="ml-auto">
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#127CFE] focus:border-[#127CFE]"
                  >
                    {citationFormats.map((fmt) => (
                      <option key={fmt.id} value={fmt.id}>{fmt.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 min-h-[240px] flex items-center justify-center border border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No papers added yet. Add papers from the Find Papers section.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};


export default CitationGenerator;


