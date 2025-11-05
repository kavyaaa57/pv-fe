import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  MessageCircle, 
  Send,
  FileText,
  Brain,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PaperAnalysis = () => {
  const { paperId } = useParams();
  const [paper, setPaper] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  // Mock paper data
  const mockPaper = {
    id: paperId,
    title: 'Deep Learning Approaches for Natural Language Processing in Academic Research',
    authors: ['John Smith', 'Jane Doe', 'Michael Johnson'],
    journal: 'Journal of AI Research',
    year: 2024,
    abstract: 'This paper presents novel deep learning methodologies for processing academic texts, focusing on transformer architectures and their applications in research paper analysis. We introduce a new attention mechanism that significantly improves performance on academic text understanding tasks.',
    pdfUrl: 'https://example.com/paper1.pdf',
    doi: '10.1000/182',
    citations: 45,
    summary: 'A comprehensive study on applying transformer architectures to academic text analysis with 95% accuracy improvement over baseline methods.',
    keyFindings: [
      'Novel attention mechanism improves academic text understanding by 40%',
      'Transformer architecture shows 95% accuracy in research paper classification',
      'New methodology reduces processing time by 60% compared to traditional methods',
      'Cross-domain transfer learning achieves 85% accuracy on unseen academic domains'
    ],
    methodology: 'The study employs a multi-layered transformer architecture with custom attention mechanisms, trained on a dataset of 100,000 academic papers across multiple disciplines.',
    implications: 'This research opens new possibilities for automated academic text analysis and could revolutionize how researchers discover and understand scientific literature.'
  };

  useEffect(() => {
    // Simulate loading paper data
    setTimeout(() => {
      setPaper(mockPaper);
      // Initialize with a welcome message
      setChatMessages([
        {
          id: 1,
          type: 'ai',
          content: `Hello! I'm your AI research assistant. I've analyzed "${mockPaper.title}" and I'm ready to answer any questions you have about this paper. What would you like to know?`,
          timestamp: new Date()
        }
      ]);
    }, 1000);
  }, [paperId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (question) => {
    const responses = {
      'methodology': 'The paper uses a multi-layered transformer architecture with custom attention mechanisms. The model was trained on 100,000 academic papers and employs cross-domain transfer learning techniques.',
      'results': 'The key results show a 95% accuracy in research paper classification, 40% improvement in text understanding, and 60% reduction in processing time compared to baseline methods.',
      'limitations': 'The main limitations include the need for large computational resources and the model\'s performance dependency on the quality of training data. Future work should address scalability concerns.',
      'applications': 'This research can be applied to automated literature reviews, research paper recommendation systems, and academic text summarization tools.',
      'citations': 'The paper has been cited 45 times and has influenced several follow-up studies in the field of academic text processing.'
    };

    const lowerQuestion = question.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        return response;
      }
    }

    return 'Based on my analysis of this paper, I can provide insights on methodology, results, limitations, applications, or citations. Could you be more specific about what aspect you\'d like to explore?';
  };

  const suggestedQuestions = [
    'What is the main methodology used?',
    'What are the key results?',
    'What are the limitations of this study?',
    'How can this research be applied?',
    'What are the main contributions?'
  ];

  if (!paper) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading paper analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link 
              to="/search" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Search
            </Link>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{paper.title}</h1>
            
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span className="mr-4">By {paper.authors.join(', ')}</span>
              <span className="mr-4">{paper.journal} • {paper.year}</span>
              <span>DOI: {paper.doi}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => window.open(paper.pdfUrl, '_blank')}
              className="btn-primary flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => window.open(paper.pdfUrl, '_blank')}
              className="btn-secondary flex items-center space-x-1"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View Online</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'chat', label: 'AI Chat', icon: MessageCircle },
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'insights', label: 'Key Insights', icon: Brain }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'chat' && (
            <div className="card h-96 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask a question about this paper..."
                    className="flex-1 input-field"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="btn-primary px-4 py-2 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Abstract</h3>
                <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Methodology</h3>
                <p className="text-gray-700 leading-relaxed">{paper.methodology}</p>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Implications</h3>
                <p className="text-gray-700 leading-relaxed">{paper.implications}</p>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary-600" />
                  Key Findings
                </h3>
                <ul className="space-y-3">
                  {paper.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Questions</h3>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="w-full text-left p-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Paper Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Paper Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Citations</span>
                <span className="font-medium">{paper.citations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year</span>
                <span className="font-medium">{paper.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Authors</span>
                <span className="font-medium">{paper.authors.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperAnalysis;
