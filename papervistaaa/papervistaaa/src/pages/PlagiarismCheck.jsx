import { useState } from 'react';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  RefreshCw,
  Eye,
  Shield
} from 'lucide-react';

const PlagiarismCheck = () => {
  const [text, setText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const mockResults = {
    overallScore: 15,
    status: 'low',
    totalWords: 1250,
    checkedWords: 1250,
    matches: [
      {
        id: 1,
        text: 'Machine learning algorithms have revolutionized the field of artificial intelligence',
        similarity: 85,
        source: 'Smith, J. (2023). "Advances in Machine Learning". Journal of AI Research.',
        url: 'https://example.com/paper1',
        startPos: 45,
        endPos: 120
      },
      {
        id: 2,
        text: 'The transformer architecture has become the standard for natural language processing tasks',
        similarity: 72,
        source: 'Brown, A. (2024). "Transformers in NLP". IEEE Transactions.',
        url: 'https://example.com/paper2',
        startPos: 340,
        endPos: 420
      },
      {
        id: 3,
        text: 'Deep learning models require large amounts of training data to achieve optimal performance',
        similarity: 68,
        source: 'Wilson, M. (2023). "Data Requirements in Deep Learning". ACM Computing Surveys.',
        url: 'https://example.com/paper3',
        startPos: 780,
        endPos: 860
      }
    ],
    suggestions: [
      'Consider paraphrasing the highlighted text to reduce similarity',
      'Add proper citations for the referenced concepts',
      'Use more original language to express the same ideas',
      'Consider combining multiple sources to create unique content'
    ]
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleCheck = async () => {
    if (!text.trim()) return;
    
    setIsChecking(true);
    
    // Simulate API call
    setTimeout(() => {
      setResults(mockResults);
      setIsChecking(false);
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'low':
        return <CheckCircle className="h-5 w-5" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      case 'high':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'low':
        return 'Low Risk - Original Content';
      case 'medium':
        return 'Medium Risk - Some Similarities';
      case 'high':
        return 'High Risk - Significant Similarities';
      default:
        return 'Unknown Status';
    }
  };

  const downloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plagiarism_report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    if (!results) return '';
    
    let report = `PLAGIARISM CHECK REPORT\n`;
    report += `========================\n\n`;
    report += `Overall Similarity Score: ${results.overallScore}%\n`;
    report += `Status: ${getStatusText(results.status)}\n`;
    report += `Total Words: ${results.totalWords}\n`;
    report += `Checked Words: ${results.checkedWords}\n\n`;
    
    if (results.matches.length > 0) {
      report += `DETECTED MATCHES:\n`;
      report += `================\n\n`;
      
      results.matches.forEach((match, index) => {
        report += `${index + 1}. Similarity: ${match.similarity}%\n`;
        report += `   Text: "${match.text}"\n`;
        report += `   Source: ${match.source}\n`;
        report += `   URL: ${match.url}\n\n`;
      });
    }
    
    if (results.suggestions.length > 0) {
      report += `SUGGESTIONS:\n`;
      report += `============\n\n`;
      results.suggestions.forEach((suggestion, index) => {
        report += `${index + 1}. ${suggestion}\n`;
      });
    }
    
    return report;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plagiarism Check</h1>
        <p className="text-gray-600">
          Ensure the originality of your research paper with our comprehensive plagiarism detection system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload or Paste Text</h3>
            
            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports TXT, DOC, DOCX, PDF
                    </p>
                  </div>
                </label>
              </div>
              {uploadedFile && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>{uploadedFile.name}</span>
                </div>
              )}
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or paste your text directly
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your research paper text here..."
                className="input-field h-64 resize-none"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {text.length} characters
              </div>
              <button
                onClick={handleCheck}
                disabled={!text.trim() || isChecking}
                className="btn-primary disabled:opacity-50"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Check Plagiarism
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {results ? (
            <>
              {/* Overall Results */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Results</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{results.overallScore}%</div>
                    <div className="text-sm text-gray-600">Similarity Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{results.totalWords}</div>
                    <div className="text-sm text-gray-600">Total Words</div>
                  </div>
                </div>

                <div className={`flex items-center justify-center p-4 rounded-lg ${getStatusColor(results.status)}`}>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(results.status)}
                    <span className="font-medium">{getStatusText(results.status)}</span>
                  </div>
                </div>
              </div>

              {/* Matches */}
              {results.matches.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Matches</h3>
                  <div className="space-y-4">
                    {results.matches.map((match) => (
                      <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {match.similarity}% similarity
                          </span>
                          <a
                            href={match.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Source
                          </a>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 bg-yellow-50 p-2 rounded">
                          "{match.text}"
                        </p>
                        <p className="text-xs text-gray-500">{match.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {results.suggestions.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestions</h3>
                  <ul className="space-y-2">
                    {results.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Report Actions</h3>
                  <button
                    onClick={downloadReport}
                    className="btn-primary flex items-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Report</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
              <p className="text-gray-600">
                Upload or paste your text and click "Check Plagiarism" to see the results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlagiarismCheck;
