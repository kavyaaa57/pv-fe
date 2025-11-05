import { Link } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Quote, 
  Shield, 
  Edit3, 
  FileDown, 
  Layers,
  BookOpen,
  Brain,
  Zap,
  Target
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: Search,
      title: 'Find Research Papers',
      description: 'Discover relevant papers using our three-tiered access system for open-access, preprint, and locked papers.',
      color: 'bg-blue-50 text-blue-600',
      href: '/search'
    },
    {
      icon: FileText,
      title: 'Interactive Analysis',
      description: 'AI-powered RAG chatbot provides instant answers about paper content and methodology.',
      color: 'bg-green-50 text-green-600',
      href: '/analysis'
    },
    {
      icon: Quote,
      title: 'Citation Generator',
      description: 'Automatically format citations in multiple academic styles (APA, MLA, Chicago, IEEE).',
      color: 'bg-purple-50 text-purple-600',
      href: '/citations'
    },
    {
      icon: Shield,
      title: 'Plagiarism Check',
      description: 'Ensure originality and academic integrity with comprehensive plagiarism detection.',
      color: 'bg-red-50 text-red-600',
      href: '/plagiarism'
    },
    {
      icon: Edit3,
      title: 'Grammar Check',
      description: 'Context-aware editor that corrects spelling and grammatical errors in real-time.',
      color: 'bg-yellow-50 text-yellow-600',
      href: '/grammar'
    },
    {
      icon: Layers,
      title: 'Paper Synthesis',
      description: 'Combine selected papers into a coherent research framework and methodology.',
      color: 'bg-indigo-50 text-indigo-600',
      href: '/synthesis'
    },
    {
      icon: FileDown,
      title: 'Report Generation',
      description: 'Export your research data, citations, and analysis in clean Markdown format.',
      color: 'bg-gray-50 text-gray-600',
      href: '/reports'
    }
  ];

  const stats = [
    { label: 'Papers Analyzed', value: '10,000+', icon: BookOpen },
    { label: 'AI-Powered', value: '100%', icon: Brain },
    { label: 'Time Saved', value: '80%', icon: Zap },
    { label: 'Accuracy', value: '95%', icon: Target }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-primary-600">PaperVista</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          The AI-powered research assistant that helps students and researchers find, read, 
          and use research papers quickly and effectively. Simplify your research workflow 
          and accelerate your academic success.
        </p>
        
        {/* Research Project Prompts */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ready-to-Use Research Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="card text-left">
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-gray-600 mb-3">Find, analyze, and report on literature with AI assistance</p>
              <Link to="/search" className="text-primary-600 text-sm font-medium">Start Project →</Link>
            </div>
            <div className="card text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Paper Deep Dive</h3>
              <p className="text-sm text-gray-600 mb-3">Upload and analyze complex academic papers</p>
              <Link to="/analysis" className="text-primary-600 text-sm font-medium">Start Analysis →</Link>
            </div>
            <div className="card text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Literature Review</h3>
              <p className="text-sm text-gray-600 mb-3">Multi-tiered source management and citation</p>
              <Link to="/templates" className="text-primary-600 text-sm font-medium">View Templates →</Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Link to="/search" className="btn-primary text-lg px-8 py-3">
            Start Researching
          </Link>
          <Link to="/templates" className="btn-secondary text-lg px-8 py-3">
            View All Templates
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="card text-center">
            <stat.icon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Powerful Research Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.href}
              className="card hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Three-Tier System Section */}
      <div className="card mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Three-Tiered Access System
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlocked Papers</h3>
            <p className="text-gray-600">
              Open-access papers with full summaries and direct PDF access
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Preprint Access</h3>
            <p className="text-gray-600">
              Locked papers with available preprint versions and summaries
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Abstract Only</h3>
            <p className="text-gray-600">
              Recent locked papers with abstracts and web search integration
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-12 bg-primary-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Transform Your Research?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Join thousands of researchers who have streamlined their workflow with PaperVista
        </p>
        <Link to="/search" className="btn-primary text-lg px-8 py-3">
          Get Started Now
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
