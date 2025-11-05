import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PaperAnalysis from './pages/PaperAnalysis';
import CitationGenerator from './pages/CitationGenerator';
import PlagiarismCheck from './pages/PlagiarismCheck';
import GrammarCheck from './pages/GrammarCheck';
import ManualReportGenerator from './pages/ManualReportGenerator.jsx';
import ProjectTemplates from './pages/ProjectTemplates';
import LoginPage from './pages/LoginPage.jsx';
import LogoutPage from './pages/LogoutPage.jsx';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
            <div className="p-6">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/analysis/:paperId" element={<PaperAnalysis />} />
                <Route path="/analysis" element={<PaperAnalysis />} />
                <Route path="/citations" element={<CitationGenerator />} />
                <Route path="/plagiarism" element={<PlagiarismCheck />} />
                <Route path="/grammar" element={<GrammarCheck />} />
                <Route path="/manual-report" element={<ManualReportGenerator />} />
                <Route path="/templates" element={<ProjectTemplates />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/logout" element={<LogoutPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;