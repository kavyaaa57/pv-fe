import { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Download,
  RefreshCw,
  Edit3,
  Type,
  BookOpen
} from 'lucide-react';

const GrammarCheck = () => {
  const [text, setText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const mockResults = {
    overallScore: 85,
    totalIssues: 12,
    issues: [
      {
        id: 1,
        type: 'grammar',
        severity: 'error',
        message: 'Subject-verb disagreement',
        suggestion: 'Change "are" to "is"',
        original: 'The results are shows',
        corrected: 'The results show',
        startPos: 45,
        endPos: 60
      },
      {
        id: 2,
        type: 'spelling',
        severity: 'error',
        message: 'Spelling error',
        suggestion: 'Correct spelling',
        original: 'algoritm',
        corrected: 'algorithm',
        startPos: 120,
        endPos: 130
      },
      {
        id: 3,
        type: 'style',
        severity: 'warning',
        message: 'Passive voice detected',
        suggestion: 'Consider using active voice',
        original: 'The data was analyzed by the researchers',
        corrected: 'The researchers analyzed the data',
        startPos: 200,
        endPos: 240
      },
      {
        id: 4,
        type: 'punctuation',
        severity: 'warning',
        message: 'Missing comma',
        suggestion: 'Add comma after introductory phrase',
        original: 'However the results show',
        corrected: 'However, the results show',
        startPos: 300,
        endPos: 320
      }
    ],
    suggestions: [
      'Consider using more active voice constructions',
      'Review sentence structure for clarity',
      'Check for consistent tense usage',
      'Ensure proper academic tone throughout'
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
    }, 2000);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Edit3 className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'grammar':
        return <BookOpen className="h-4 w-4" />;
      case 'spelling':
        return <Type className="h-4 w-4" />;
      case 'style':
        return <Edit3 className="h-4 w-4" />;
      case 'punctuation':
        return <FileText className="h-4 w-4" />;
      default:
        return <Edit3 className="h-4 w-4" />;
    }
  };

  const applyCorrection = (issueId) => {
    if (!results || !results.issues) return;
    
    const issue = results.issues.find(i => i.id === issueId);
    if (issue && issue.original && issue.corrected) {
      // Use the position-based replacement for more accuracy
      let newText = text;
      if (issue.startPos !== undefined && issue.endPos !== undefined) {
        const before = text.substring(0, issue.startPos);
        const after = text.substring(issue.endPos);
        newText = before + issue.corrected + after;
      } else {
        // Fallback to simple replace
        newText = text.replace(issue.original, issue.corrected);
      }
      
      setText(newText);
      // Remove the issue from results
      setResults(prev => {
        if (!prev) return prev;
        const updatedIssues = prev.issues.filter(i => i.id !== issueId);
        return {
          ...prev,
          issues: updatedIssues,
          totalIssues: updatedIssues.length
        };
      });
    }
  };

  const downloadReport = () => {
    if (!results) return;
    
    const report = generateReport();
    if (!report) return;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grammar_check_report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    if (!results) return '';
    
    let report = `GRAMMAR CHECK REPORT\n`;
    report += `===================\n\n`;
    report += `Overall Score: ${results.overallScore}/100\n`;
    report += `Total Issues Found: ${results.totalIssues}\n\n`;
    
    if (results.issues.length > 0) {
      report += `ISSUES DETECTED:\n`;
      report += `================\n\n`;
      
      results.issues.forEach((issue, index) => {
        report += `${index + 1}. ${issue.type.toUpperCase()} - ${issue.severity.toUpperCase()}\n`;
        report += `   Message: ${issue.message}\n`;
        report += `   Original: "${issue.original}"\n`;
        report += `   Suggestion: ${issue.suggestion}\n`;
        report += `   Corrected: "${issue.corrected}"\n\n`;
      });
    }
    
    if (results.suggestions.length > 0) {
      report += `GENERAL SUGGESTIONS:\n`;
      report += `===================\n\n`;
      results.suggestions.forEach((suggestion, index) => {
        report += `${index + 1}. ${suggestion}\n`;
      });
    }
    
    return report;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grammar & Style Check</h1>
        <p className="text-gray-600">
          Improve your writing with AI-powered grammar, spelling, and style checking.
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
                placeholder="Paste your research paper text here for grammar and style checking..."
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
                    <Edit3 className="h-4 w-4 mr-2" />
                    Check Grammar
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
                    <div className="text-2xl font-bold text-gray-900">{results.overallScore}/100</div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{results.totalIssues}</div>
                    <div className="text-sm text-gray-600">Issues Found</div>
                  </div>
                </div>

                <div className={`flex items-center justify-center p-4 rounded-lg ${
                  results.overallScore >= 90 ? 'text-green-600 bg-green-50' :
                  results.overallScore >= 70 ? 'text-yellow-600 bg-yellow-50' :
                  'text-red-600 bg-red-50'
                }`}>
                  <div className="flex items-center space-x-2">
                    {results.overallScore >= 90 ? <CheckCircle className="h-5 w-5" /> :
                     results.overallScore >= 70 ? <AlertTriangle className="h-5 w-5" /> :
                     <XCircle className="h-5 w-5" />}
                    <span className="font-medium">
                      {results.overallScore >= 90 ? 'Excellent Writing' :
                       results.overallScore >= 70 ? 'Good with Minor Issues' :
                       'Needs Improvement'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Issues */}
              {results && results.issues && results.issues.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues Found</h3>
                  <div className="space-y-4">
                    {results.issues.map((issue) => (
                      <div key={issue.id} className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getSeverityIcon(issue.severity)}
                            <span className="font-medium text-sm">{issue.type ? issue.type.charAt(0).toUpperCase() + issue.type.slice(1) : 'Issue'}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                              {issue.severity || 'unknown'}
                            </span>
                          </div>
                          <button
                            onClick={() => applyCorrection(issue.id)}
                            className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75"
                          >
                            Apply Fix
                          </button>
                        </div>
                        <p className="text-sm mb-2">{issue.message || 'Issue detected'}</p>
                        {issue.original && (
                          <div className="text-sm">
                            <span className="font-medium">Original:</span> 
                            <span className="bg-red-100 px-1 rounded mx-1">"{issue.original}"</span>
                          </div>
                        )}
                        {issue.corrected && (
                          <div className="text-sm">
                            <span className="font-medium">Suggestion:</span> 
                            <span className="bg-green-100 px-1 rounded mx-1">"{issue.corrected}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {results && results.suggestions && results.suggestions.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Suggestions</h3>
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
              <Edit3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
              <p className="text-gray-600">
                Upload or paste your text and click "Check Grammar" to see the results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrammarCheck;

