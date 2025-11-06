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

// --- API Configuration (Matches FastAPI default port 8000) ---
const API_BASE_URL = 'http://localhost:8000';
const GRAMMAR_ENDPOINT = '/check-grammar'; // Assuming you added this endpoint

// --- Utility Classes (Assumed Tailwind CSS is in use) ---
const utilityClasses = {
    'card': 'bg-white p-6 rounded-xl shadow-lg border border-gray-100',
    'input-field': 'w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500',
    'btn-primary': 'flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    'bg-primary-600': 'bg-blue-600',
};

const GrammarCheck = () => {
    const [text, setText] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    // Renamed result structure for clarity: issues/total_errors match the Python backend
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

    // --- Core Function: Connect to Backend (FIXED API CONFIGURATION) ---
    const handleCheck = async () => {
        if (!text.trim()) return;
        
        setIsChecking(true);
        setResults(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}${GRAMMAR_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // CRITICAL FIX: Sending the correct key 'raw_text' to the FastAPI endpoint
                body: JSON.stringify({ raw_text: text }), 
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status}. Detail: ${errorBody.detail}`);
            }

            const data = await response.json();
            
            // Data structure expected: {status: str, total_errors: int, errors: Array}
            setResults(data); 

        } catch (error) {
            console.error("Grammar Check Failed:", error);
            setResults({ 
                status: 'ERROR',
                total_errors: 1,
                errors: [{
                    context_message: `API Error: ${error.message}. Ensure uvicorn main_app:app is running on port 8000.`,
                    error_text: 'CONNECTION FAILED',
                    suggestions: [],
                    category: 'SYSTEM'
                }],
                // Required for display, even on error:
                overallScore: 0,
                totalIssues: 1,
            });
        } finally {
            setIsChecking(false);
        }
    };
    
    // --- Interactive Correction Logic (FIXED to use offset) ---
    const applyCorrection = (issueIndex) => {
        setResults(prevResults => {
            if (!prevResults || !prevResults.errors || issueIndex >= prevResults.errors.length) return prevResults;

            const issueToFix = prevResults.errors[issueIndex];
            if (!issueToFix.suggestions || issueToFix.suggestions.length === 0) return prevResults;

            const bestSuggestion = issueToFix.suggestions[0];
            const originalErrorText = issueToFix.error_text;
            const startOffset = issueToFix.offset;

            // CRITICAL FIX: Use the character offset to replace the exact instance of the error.
            // This is the implementation of the correction logic based on backend output.
            const textBefore = text.slice(0, startOffset);
            const textAfter = text.slice(startOffset + originalErrorText.length);
            const newText = textBefore + bestSuggestion + textAfter;

            // 1. Update the main text state with the correction
            setText(newText);
            
            // 2. Remove the corrected issue from the results display immediately
            const updatedErrors = prevResults.errors.filter((_, i) => i !== issueIndex);
            
            return {
                ...prevResults,
                errors: updatedErrors,
                total_errors: updatedErrors.length,
                totalIssues: updatedErrors.length,
            };
        });
    };

    // --- Helper Functions (Updated to match Python output keys) ---

    const getSeverityColor = (status) => {
        switch (status) {
            case 'MAJOR ISSUES':
                return 'text-red-600 bg-red-100 border-red-200';
            case 'MINOR ISSUES':
                return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'SUCCESS':
                return 'text-green-600 bg-green-100 border-green-200';
            case 'ERROR':
            case 'SYSTEM':
                return 'text-gray-900 bg-red-200 border-red-300';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getSeverityIcon = (status) => {
        switch (status) {
            case 'MAJOR ISSUES':
            case 'ERROR':
            case 'SYSTEM':
                return <XCircle className="h-4 w-4" />;
            case 'MINOR ISSUES':
                return <AlertTriangle className="h-4 w-4" />;
            case 'SUCCESS':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Edit3 className="h-4 w-4" />;
        }
    };

    const getTypeIcon = (category) => {
        switch (category) {
            case 'GRAMMAR':
                return <BookOpen className="h-4 w-4" />;
            case 'TYPOS':
            case 'CASING':
                return <Type className="h-4 w-4" />;
            case 'STYLE':
                return <Edit3 className="h-4 w-4" />;
            case 'PUNCTUATION':
            case 'COMMA':
            case 'SYSTEM':
                return <FileText className="h-4 w-4" />;
            default:
                return <Edit3 className="h-4 w-4" />;
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
        report += `Status: ${results.status}\n`;
        report += `Total Issues Found: ${results.total_errors}\n\n`; // Use total_errors
        
        if (results.errors && results.errors.length > 0) { // Use errors array
            report += `ISSUES DETECTED:\n`;
            report += `================\n\n`;
            
            results.errors.forEach((issue, index) => {
                report += `${index + 1}. Category: ${issue.category}\n`;
                report += `   Message: ${issue.context_message}\n`;
                report += `   Original Error Text: "${issue.error_text}"\n`;
                report += `   Suggestion: ${issue.suggestions ? issue.suggestions[0] : 'N/A'}\n\n`;
            });
        }
        
        return report;
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Grammar & Style Check</h1>
                <p className="text-gray-600">
                    Improve your writing with AI-powered grammar, spelling, and style checking.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className={utilityClasses.card}>
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
                                className={`${utilityClasses['input-field']} h-64 resize-none`}
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {text.length} characters
                            </div>
                            <button
                                onClick={handleCheck}
                                disabled={!text.trim() || isChecking}
                                className={`${utilityClasses['btn-primary']} disabled:opacity-50`}
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
                    {isChecking ? (
                        <div className={`${utilityClasses.card} text-center py-12`}>
                            <RefreshCw className="h-10 w-10 text-blue-500 mx-auto mb-4 animate-spin" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Running Linguistic Engine...</h3>
                            <p className="text-gray-600">
                                Applying LanguageTool rules and checking custom temporal logic.
                            </p>
                        </div>
                    ) : results ? (
                        <>
                            {/* Overall Results */}
                            <div className={utilityClasses.card}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Results</h3>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{results.total_errors}</div>
                                        <div className="text-sm text-gray-600">Issues Found</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{text.split(/\s+/).filter(w => w.length > 0).length}</div>
                                        <div className="text-sm text-gray-600">Word Count</div>
                                    </div>
                                </div>

                                <div className={`flex items-center justify-center p-4 rounded-lg ${getSeverityColor(results.status)}`}>
                                    <div className="flex items-center space-x-2">
                                        {getSeverityIcon(results.status)}
                                        <span className="font-medium">
                                            {results.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Issues (Interactive) */}
                            {results.errors && results.errors.length > 0 && (
                                <div className={utilityClasses.card}>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues Found ({results.errors.length})</h3>
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {results.errors.map((issue, index) => (
                                            // The key here is the index in the current results.errors array
                                            <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(issue.category)}`}> 
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        {getTypeIcon(issue.category)}
                                                        <span className="font-medium text-sm">{issue.category || 'Issue'}</span>
                                                    </div>
                                                    {issue.suggestions && issue.suggestions.length > 0 && (
                                                        <button
                                                            onClick={() => applyCorrection(index)}
                                                            className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                        >
                                                            Accept: "{issue.suggestions[0]}"
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-sm mb-2 font-medium">Rule: {issue.context_message || 'Issue detected'}</p>
                                                
                                                {issue.error_text && (
                                                    <div className="text-sm">
                                                        <span className="font-medium">Error Text:</span> 
                                                        <span className="bg-red-100 text-red-800 px-1 rounded mx-1">"{issue.error_text}"</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className={utilityClasses.card}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Report Actions</h3>
                                    <button
                                        onClick={downloadReport}
                                        className={`${utilityClasses['btn-primary']} flex items-center space-x-1`}
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Download Report</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={`${utilityClasses.card} text-center py-12`}>
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