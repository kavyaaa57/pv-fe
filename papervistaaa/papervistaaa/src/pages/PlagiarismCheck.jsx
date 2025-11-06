// PlagiarismCheck.jsx - FINAL VERSION (Connected to FastAPI on port 8000)

import { useState } from 'react';

import { Upload, FileText, AlertTriangle, CheckCircle, XCircle, Download, RefreshCw, Eye, Shield } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const utilityClasses = {

    'card': 'bg-white p-6 rounded-xl shadow-lg border border-gray-100',

    'input-field': 'w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500',

    'btn-primary': 'flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',

    'text-primary-600': 'text-blue-600',

    'hover:text-primary-700': 'hover:text-blue-700',

};

const PlagiarismCheck = () => {

  const [text, setText] = useState('');

  const [isChecking, setIsChecking] = useState(false);

  const [results, setResults] = useState(null); 

  const [uploadedFile, setUploadedFile] = useState(null);

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

  const getStatusColor = (score) => {

    if (score > 50) {

      return 'text-red-600 bg-red-100 border border-red-300';

    } else if (score > 10) {

      return 'text-yellow-700 bg-yellow-100 border border-yellow-300';

    } else {

      return 'text-green-600 bg-green-100 border border-green-300';

    }

  };

  const getStatusIcon = (score) => {

    if (score > 50) {

      return <XCircle className="h-5 w-5" />;

    } else if (score > 10) {

      return <AlertTriangle className="h-5 w-5" />;

    } else {

      return <CheckCircle className="h-5 w-5" />;

    }

  };

  const getStatusText = (score) => {

    if (score > 50) {

      return 'High Risk - Significant Similarities (PLAGIARISM LIKELY)';

    } else if (score > 10) {

      return 'Medium Risk - Review Required';

    } else if (score === 0) {

      return 'No Plagiarism Detected';

    } else {

      return 'Low Risk - Original Content';

    }

  };

  const generateReport = () => {

    if (!results) return '';

    let report = `PLAGIARISM CHECK REPORT\n`;

    report += `========================\n\n`;

    report += `Overall Similarity Score: ${results.overallScore}%\n`;

    report += `Status: ${getStatusText(results.overallScore)}\n`;

    report += `Total Words: ${results.totalWords || 'N/A'}\n\n`;

    if (results.matches && results.matches.length > 0) {

      report += `DETECTED MATCHES:\n`;

      report += `================\n\n`;

      results.matches.forEach((match, index) => {

        report += `${index + 1}. Score: ${match.similarity}% (${match.type})\n`;

        report += `   Suspect Text: "${match.text}"\n`;

        report += `   Source Snippet: "${match.source}"\n`;

        report += `   URL: ${match.url || 'N/A'}\n\n`;

      });

    }

    if (results.suggestions && results.suggestions.length > 0) {

      report += `SUGGESTIONS:\n`;

      report += `============\n\n`;

      results.suggestions.forEach((suggestion, index) => {

        report += `${index + 1}. ${suggestion}\n`;

      });

    }

    return report;

  };

  const downloadReport = () => {

    const report = generateReport();

    if (!report) return;

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

  const handleCheck = async () => {

    if (!text.trim()) return;

    setIsChecking(true);

    setResults(null); 

    try {

      const response = await fetch(`${API_BASE_URL}/check-plagiarism`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ suspect_text: text }),

      });

      if (!response.ok) { 

        const errorBody = await response.json().catch(() => ({}));

        throw new Error(`HTTP error! status: ${response.status}. ${errorBody.detail || 'Check server logs for error details.'}`); 

      }

      const data = await response.json();

      setResults(data); 

    } catch (error) {

      console.error("Plagiarism Check Failed:", error);

      const errorMessage = error.message.includes('Failed to fetch') 

        ? `Could not connect to the FastAPI backend. Ensure 'uvicorn main_app:app --reload --port 8000' is running.`

        : `API failed: ${error.message}`;

      setResults({ 

        overallScore: 0, 

        status: 'error', 

        totalWords: text.split(/\s+/).filter(w => w.length > 0).length,

        matches: [],

        suggestions: [errorMessage],

        imageCheckStatus: "Skipped due to API failure."

      });

    } finally {

      setIsChecking(false);

    }

  };

  const renderDetailedReport = () => {

    if (!results || results.status === 'error') {

      return (

        <div className={`${utilityClasses.card} bg-red-50 border-red-300`}>

          <h3 className="text-xl font-semibold text-red-700 mb-2">Check Failed!</h3>

          <p className="text-sm text-red-600">

            {results?.suggestions.join('. ') || 'An unknown error occurred during the check.'}

          </p>

        </div>

      );

    }

    const scoreForDisplay = results.overallScore;

    return (

      <>

        <div className={utilityClasses.card}>

          <h3 className="text-xl font-bold text-gray-900 mb-4">

            {scoreForDisplay > 50 ? '🚨 Plagiarism Analysis Report' : '✅ Content Originality Report'}

          </h3>

          <div className={`p-4 rounded-lg text-center ${getStatusColor(scoreForDisplay)}`}>

            <div className="flex items-center justify-center space-x-3">

              {getStatusIcon(scoreForDisplay)}

              <span className="text-lg font-extrabold">

                **{getStatusText(scoreForDisplay)}** ({results.flaggedChunks} chunks flagged)

              </span>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 text-center">

            <div className="p-3 bg-gray-50 rounded-lg border">

              <div className="text-2xl font-bold text-gray-900">{scoreForDisplay.toFixed(2)}%</div>

              <div className="text-sm text-gray-600">Similarity Score</div>

            </div>

            <div className="p-3 bg-gray-50 rounded-lg border">

              <div className="text-2xl font-bold text-gray-900">{results.coverageRatio || 'N/A'}</div>

              <div className="text-sm text-gray-600">Coverage Ratio</div>

            </div>

          </div>

        </div>

        {results.matches && results.matches.length > 0 && (

          <div className={utilityClasses.card}>

            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">

              --- Detailed Matches (Top {results.matches.length} by Score) ---

            </h3>

            <div className="space-y-5">

              {results.matches.map((match, index) => (

                <div key={match.id || index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">

                  <div className="flex items-center justify-between mb-3 border-b pb-2">

                    <span className="text-sm font-bold text-blue-700">

                      Score: {match.similarity}% 

                      <span className="ml-2 font-normal text-gray-600">({match.type})</span>

                    </span>

                    <a

                      href={match.url}

                      target="_blank"

                      rel="noopener noreferrer"

                      className={`${utilityClasses['text-primary-600']} hover:underline text-sm flex items-center`}

                    >

                      <Eye className="h-4 w-4 mr-1" />

                      View Source

                    </a>

                  </div>

                  <div className="space-y-2">

                    <div className="bg-yellow-50 p-2 rounded border-l-4 border-yellow-500">

                        <p className="text-xs font-semibold text-gray-800 mb-1">Suspect:</p>

                        <p className="text-sm text-gray-600 italic">"{match.text}"</p>

                    </div>

                    <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-500">

                        <p className="text-xs font-semibold text-gray-800 mb-1">Source Snippet:</p>

                        <p className="text-sm text-gray-600">"{match.source}"</p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

        <div className={utilityClasses.card}>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">--- Visual Plagiarism Check ---</h3>

            <p className="text-sm text-gray-600">

                {results.imageCheckStatus || 'N/A'}

            </p>

        </div>

        {results.suggestions && results.suggestions.length > 0 && (

            <div className={utilityClasses.card}>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestions</h3>

                <ul className="space-y-2 list-disc list-inside">

                    {results.suggestions.map((suggestion, index) => (

                        <li key={index} className="text-sm text-gray-700">{suggestion}</li>

                    ))}

                </ul>

            </div>

        )}

        <div className={utilityClasses.card}>

          <div className="flex items-center justify-between">

            <h3 className="text-lg font-semibold text-gray-900">Report Actions</h3>

            <button

              onClick={downloadReport}

              className={`${utilityClasses['btn-primary']} flex items-center space-x-1 bg-green-600 hover:bg-green-700`}

            >

              <Download className="h-4 w-4" />

              <span>Download Report</span>

            </button>

          </div>

        </div>

      </>

    );

  };

  return (

    <div className="max-w-7xl mx-auto p-4">

      <div className="mb-8">

        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Plagiarism Checker</h1>

        <p className="text-gray-600">

          Upload or paste your text to perform a deep semantic and lexical plagiarism analysis.

        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="space-y-6">

          <div className={utilityClasses.card}>

            <h3 className="text-xl font-semibold text-gray-900 mb-5">Input Suspect Document</h3>

            <div className="mb-6">

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

                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-blue-50">

                    <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />

                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>

                    <p className="text-xs text-gray-500 mt-1">Supports TXT, DOC, DOCX, PDF</p>

                  </div>

                </label>

              </div>

              {uploadedFile && (

                <div className="mt-2 flex items-center text-sm text-gray-600">

                  <FileText className="h-4 w-4 mr-2 text-blue-500" />

                  <span className="font-medium">{uploadedFile.name}</span>

                </div>

              )}

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">

                Or paste your text directly

              </label>

              <textarea

                value={text}

                onChange={(e) => setText(e.target.value)}

                placeholder="Paste your research paper text here..."

                className={`${utilityClasses['input-field']} h-64 resize-none`}

              />

            </div>

            <div className="mt-6 flex items-center justify-between">

              <div className="text-sm text-gray-600 font-medium">

                Word Count: {text.split(/\s+/).filter(w => w.length > 0).length}

              </div>

              <button

                onClick={handleCheck}

                disabled={!text.trim() || isChecking}

                className={`${utilityClasses['btn-primary']} disabled:opacity-50`}

              >

                {isChecking ? (

                  <>

                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />

                    Running Analysis...

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

        <div className="space-y-6">

          {isChecking ? (

            <div className={`${utilityClasses.card} text-center py-12`}>

              <RefreshCw className="h-10 w-10 text-blue-500 mx-auto mb-4 animate-spin" />

              <h3 className="text-lg font-semibold text-gray-900 mb-2">--- Starting Hybrid Plagiarism Detection System ---</h3>

              <p className="text-gray-600">

                Processing: Loading S-BERT Model, Running Web Search, Scraping Sources...

              </p>

            </div>

          ) : results ? (

            renderDetailedReport()

          ) : (

            <div className={`${utilityClasses.card} text-center py-12`}>

              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />

              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Generated</h3>

              <p className="text-gray-600">

                Click **"Check Plagiarism"** to see the detailed report here.

              </p>

            </div>

          )}

        </div>

        </div>

    </div>

  );

};

export default PlagiarismCheck;