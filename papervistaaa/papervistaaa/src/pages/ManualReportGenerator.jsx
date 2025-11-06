import { useEffect, useRef, useState } from 'react';
import { FileText, Upload, X, ZoomIn, ZoomOut, Maximize2, Minimize2, Bold, Italic, Image as ImageIcon, Type, Download, BookOpen, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';

// --- API Configuration ---
const API_BASE_URL = 'http://localhost:8000';
const GRAMMAR_ENDPOINT = '/check-grammar';
const PLAGIARISM_ENDPOINT = '/check-plagiarism';

// Utility to apply CSS classes (assumed to be defined in your global styles)
const UTILS = {
    CARD: 'card p-6 rounded-xl shadow-lg border border-gray-100',
    BTN_PRIMARY: 'btn-primary flex-1 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600',
    LOADING: 'animate-spin h-5 w-5 mr-2',
};

const ManualReportGenerator = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fontSize, setFontSize] = useState(16);
    
    // API Results States
    const [grammarResults, setGrammarResults] = useState(null);
    const [plagiarismResults, setPlagiarismResults] = useState(null);
    const [citationResults, setCitationResults] = useState(null);
    
    const [activeAnalysis, setActiveAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const fileInputRef = useRef(null);
    const editorRef = useRef(null);

    // Placeholder text is defined here
    const PLACEHOLDER_TEXT = 'Start typing your report here...';

    // --- Cursor Fix Utility ---

    const setCursorToEnd = () => {
        if (!editorRef.current) return;
        const range = document.createRange();
        const sel = window.getSelection();
        
        // Use the last child node or the editor itself if empty
        const lastChild = editorRef.current.lastChild;
        
        if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
            range.setStart(lastChild, lastChild.length);
        } else if (editorRef.current.childNodes.length === 0) {
            range.setStart(editorRef.current, 0);
        } else {
            range.selectNodeContents(editorRef.current);
            range.collapse(false); // collapse to the end
        }

        sel.removeAllRanges();
        sel.addRange(range);
        editorRef.current.focus();
    };
    
    // --- Core UI Functions ---

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadedFile(file);

        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (evt) => setFilePreview(evt.target.result);
            reader.readAsDataURL(file);
        } else {
            alert('Please upload a PDF file.');
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 10, 200));
    const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 10, 50));
    const toggleFullscreen = () => setIsFullscreen((f) => !f);

    const exec = (command, value = null) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, value);
    };

    const insertImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                exec('insertImage', evt.target.result);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    const downloadAsMarkdown = () => {
        const text = editorRef.current ? editorRef.current.innerText : '';
        const md = `# Manual Report\n\n${text}`;
        
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manual_report_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    // --- Highlighting and Utility Functions ---

    const getContentForAnalysis = () => {
        const text = editorRef.current?.innerText || '';
        return text.trim() === PLACEHOLDER_TEXT ? '' : text;
    };

    const removeHighlights = () => {
        if (editorRef.current) {
            // Replaces the temporary highlight span tag with its content
            editorRef.current.innerHTML = editorRef.current.innerHTML.replace(/<span style="background-color: rgb\(255, 250, 101\); cursor: pointer;" title="[^>]*">([^<]+)<\/span>/g, '$1');
        }
    };

    const highlightText = (errors) => {
        removeHighlights();

        if (editorRef.current && errors.length > 0) {
            let innerHTML = editorRef.current.innerHTML;
            
            errors.forEach(issue => {
                const errorText = issue.error_text;
                const replacementSpan = `<span style="background-color: rgb(255, 250, 101); cursor: pointer;" title="${issue.context_message}">` + errorText + '</span>';
                
                const regex = new RegExp(errorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                innerHTML = innerHTML.replace(regex, replacementSpan);
            });

            editorRef.current.innerHTML = innerHTML;
        }
    };

    const analyzeCitationsClient = (content) => {
        const citationPatterns = [
            /\(([^)]+),\s*(19|20)\d{2}\)/g, /\(([^)]+et al\.),\s*(19|20)\d{2}\)/g,
            /([A-Z][a-z]+)\s*\((19|20)\d{2}\)/g,
        ];
        let citations = [];
        citationPatterns.forEach(pattern => {
            citations = [...citations, ...Array.from(content.matchAll(pattern)).map(m => m[0])];
        });
        return [...new Set(citations)];
    };


    // --- API Integration Functions ---

    const runGrammarCheck = async () => {
        const rawText = getContentForAnalysis(); 
        if (!rawText || isAnalyzing) return;

        setActiveAnalysis('grammar');
        setIsAnalyzing(true);
        setGrammarResults(null);
        removeHighlights();

        try {
            const response = await fetch(`${API_BASE_URL}${GRAMMAR_ENDPOINT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ raw_text: rawText }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || `HTTP Error ${response.status}`);
            }

            setGrammarResults(data);
            if (data.errors && data.errors.length > 0) {
                highlightText(data.errors);
            }

        } catch (error) {
            console.error("Grammar Check API Failed:", error);
            setGrammarResults({ 
                status: "ERROR", total_errors: 1, 
                errors: [{ context_message: `API Error: ${error.message}`, category: 'SYSTEM', error_text: 'Check Failed', offset: 0 }] 
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const runPlagiarismCheck = async () => {
        const suspectText = getContentForAnalysis();
        if (!suspectText || isAnalyzing) return;

        setActiveAnalysis('plagiarism');
        setIsAnalyzing(true);
        setPlagiarismResults(null);
        removeHighlights();

        try {
            const response = await fetch(`${API_BASE_URL}${PLAGIARISM_ENDPOINT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ suspect_text: suspectText }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || `HTTP Error ${response.status}`);
            }

            setPlagiarismResults(data);

        } catch (error) {
            console.error("Plagiarism Check API Failed:", error);
            setPlagiarismResults({ 
                status: "ERROR", overallScore: 0, 
                suggestions: [`API Error: ${error.message}`] 
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const runCitationCheck = () => {
        const content = getContentForAnalysis();
        if (!content || isAnalyzing) return;
        
        setActiveAnalysis('citations');
        removeHighlights();
        
        const citations = analyzeCitationsClient(content);
        setCitationResults(citations);
    };

    // --- UI Logic (Apply Correction and Renderers) ---
    
    const applyCorrection = (issueIndex) => {
        setGrammarResults(prevResults => {
            if (!prevResults || !prevResults.errors || issueIndex >= prevResults.errors.length) return prevResults;

            const issueToFix = prevResults.errors[issueIndex];
            if (!issueToFix.suggestions || issueToFix.suggestions.length === 0) return prevResults;

            const bestSuggestion = issueToFix.suggestions[0];
            const originalErrorText = issueToFix.error_text;
            const startOffset = issueToFix.offset;

            // 1. Apply the correction to the main editor text
            const currentText = editorRef.current?.innerText || '';
            const textBefore = currentText.slice(0, startOffset);
            const textAfter = currentText.slice(startOffset + originalErrorText.length);
            const newText = textBefore + bestSuggestion + textAfter;
            
            if (editorRef.current) {
                 editorRef.current.innerText = newText;
            }
            
            // 2. Remove the corrected issue from the results display
            const updatedErrors = prevResults.errors.filter((_, i) => i !== issueIndex);
            
            // Re-highlight remaining errors after correction
            if (updatedErrors.length > 0) {
                 highlightText(updatedErrors);
            } else {
                 removeHighlights();
            }
            
            // CRITICAL FIX: Restore cursor position after innerText update
            setCursorToEnd();

            return {
                ...prevResults,
                errors: updatedErrors,
                total_errors: updatedErrors.length,
                status: updatedErrors.length === 0 ? 'SUCCESS' : prevResults.status,
            };
        });
    };
    
    const renderGrammarAnalysis = () => {
        const results = grammarResults;
        if (!results) return null;
        
        const isError = results.status === 'ERROR' || results.status === 'SYSTEM';

        return (
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-2">Grammar Analysis</h4>
                
                <div className={`p-3 rounded-lg flex items-center space-x-3 ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {isError ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                    <span className="font-medium">{results.status}</span>
                </div>

                {isError ? (
                    <p className="text-sm text-red-600">Failed to analyze: {results.errors[0]?.context_message}</p>
                ) : (
                    <>
                        <p className="text-sm text-gray-700">Found **{results.total_errors}** potential issues. Issues are highlighted in yellow in the editor.</p>
                        
                        <div className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-white">
                            {results.errors.length > 0 ? (
                                <ul className="list-none space-y-3">
                                    {results.errors.map((issue, index) => (
                                        <li key={index} className="border-b border-gray-100 pb-2">
                                            <p className="text-xs font-medium text-blue-600 mb-1">Rule: {issue.context_message}</p>
                                            
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-red-700">Error: "{issue.error_text}"</span>
                                                
                                                {issue.suggestions && issue.suggestions.length > 0 && (
                                                    <button
                                                        onClick={() => applyCorrection(index)}
                                                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                        title={`Accept: ${issue.suggestions[0]}`}
                                                    >
                                                        Accept Fix
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-green-600">No grammar or spelling issues detected!</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const renderPlagiarismAnalysis = () => {
        const results = plagiarismResults;
        if (!results) return null;
        
        const score = results.overallScore || 0;
        const color = score > 50 ? 'bg-red-500' : score > 10 ? 'bg-yellow-500' : 'bg-green-500';

        return (
             <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-2">Plagiarism Analysis</h4>
                
                <p className="text-sm text-gray-700 mb-2">Content Similarity: <span className="font-semibold">{score}%</span></p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${score}%` }}></div>
                </div>

                <div className="mt-4 p-3 rounded bg-gray-50">
                    <p className="text-sm text-gray-700">
                        {score > 50 ? (
                             <span className="text-red-600">High risk detected. Review matches and paraphrase heavily.</span>
                        ) : score > 10 ? (
                             <span className="text-yellow-600">Moderate similarity detected. Review and cite sources.</span>
                        ) : (
                             <span className="text-green-600">Content appears to be original.</span>
                        )}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Status: {results.status || 'Complete'}</p>
                    {results.suggestions && results.suggestions.length > 0 && (
                        <p className="text-xs text-red-500 mt-2">**Error/Warning:** {results.suggestions[0]}</p>
                    )}
                </div>
            </div>
        );
    };
    
    const renderCitationAnalysis = () => {
        const citations = citationResults;
        if (!citations) return null;
        
        return (
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-2">Citations Analysis (Local Regex)</h4>
                {citations.length > 0 ? (
                    <>
                        <p className="text-sm text-gray-700 mb-2">Found {citations.length} unique citations:</p>
                        <div className="max-h-60 overflow-y-auto bg-gray-50 p-4 rounded">
                            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                                {citations.map((citation, index) => (
                                    <li key={index} className="border-b border-gray-200 pb-2">
                                        <span className="font-medium text-blue-600">{citation}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    <div className="p-4 bg-yellow-50 rounded">
                        <p className="text-sm text-yellow-700">No common citation formats found.</p>
                    </div>
                )}
            </div>
        );
    };

    // --- Initialization (Runs once) ---
    useEffect(() => {
        // Initialize content editable div with placeholder if it's empty
        if (editorRef.current && editorRef.current.innerText.trim() === '') {
             editorRef.current.innerText = PLACEHOLDER_TEXT;
        }
    }, []);


    return (
        <div className="max-w-full mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Manual Report Generator</h1>
                <p className="text-gray-600">Upload a PDF for reference on the left and type/analyze your report on the right.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: PDF Viewer */}
                <div className={`space-y-4 ${isFullscreen ? 'lg:col-span-2' : ''}`}>
                    <div className={`${UTILS.CARD} flex flex-col`} style={{ minHeight: '600px' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">PDF Viewer</h3>
                            <div className="flex items-center space-x-2">
                                {uploadedFile && (
                                    <>
                                        <span className="text-sm text-gray-600">{zoomLevel}%</span>
                                        <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded" title="Zoom Out"><ZoomOut className="h-4 w-4" /></button>
                                        <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded" title="Zoom In"><ZoomIn className="h-4 w-4" /></button>
                                        <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 rounded" title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
                                        <button onClick={removeFile} className="p-2 hover:bg-red-50 rounded text-red-600" title="Remove File"><X className="h-4 w-4" /></button>
                                    </>
                                )}
                            </div>
                        </div>

                        {!uploadedFile ? (
                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center p-8">
                                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-600 mb-4">Upload a research paper (PDF)</p>
                                    <label className="btn-primary inline-flex items-center space-x-2 cursor-pointer">
                                        <Upload className="h-4 w-4" />
                                        <span>Upload PDF</span>
                                        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        ) : (
                             <div className="flex-1 overflow-auto bg-gray-100 rounded-lg p-4" style={{ minHeight: '500px' }}>
                                {filePreview && (
                                    <div className="flex justify-center items-start">
                                        <iframe
                                            src={filePreview}
                                            className="border border-gray-300 shadow-lg bg-white"
                                            style={{ width: `${zoomLevel}%`, minHeight: '600px', maxWidth: '100%' }}
                                            title="PDF Viewer"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Editor + Analysis */}
                {!isFullscreen && (
                    <div className="space-y-4">
                        <div className={`${UTILS.CARD} flex flex-col`} style={{ minHeight: '600px', padding: '10px' }}>
                            <div className="flex items-center justify-between mb-3 p-2">
                                <h3 className="text-lg font-semibold text-gray-900">Editor</h3>
                                <button onClick={downloadAsMarkdown} className="btn-primary flex items-center space-x-1 bg-green-600 hover:bg-green-700">
                                    <Download className="h-4 w-4" />
                                    <span>Download Report</span>
                                </button>
                            </div>

                            {/* Toolbar */}
                            <div className="mb-3 flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                <button onClick={() => exec('bold')} className="p-2 hover:bg-gray-200 rounded" title="Bold"><Bold className="h-4 w-4" /></button>
                                <button onClick={() => exec('italic')} className="p-2 hover:bg-gray-200 rounded" title="Italic"><Italic className="h-4 w-4" /></button>
                                <div className="flex items-center space-x-1 ml-2">
                                    <Type className="h-4 w-4 text-gray-600" />
                                    <select
                                        value={fontSize}
                                        onChange={(e) => {
                                            const size = Number(e.target.value);
                                            setFontSize(size);
                                        }}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    >
                                        <option value={14}>14</option>
                                        <option value={16}>16</option>
                                        <option value={18}>18</option>
                                        <option value={20}>20</option>
                                        <option value={24}>24</option>
                                    </select>
                                </div>
                                <button onClick={insertImage} className="p-2 hover:bg-gray-200 rounded ml-2" title="Insert Image"><ImageIcon className="h-4 w-4" /></button>
                                <div className="flex-1"></div>
                            </div>

                            {/* Editable Area (FIXED: Stabilized for cursor position) */}
                            <div
                                ref={editorRef}
                                className="flex-1 border border-gray-300 rounded-lg p-4 bg-white prose max-w-none"
                                contentEditable
                                suppressContentEditableWarning
                                onInput={removeHighlights} 
                                onFocus={(e) => {
                                    // Clear placeholder on focus
                                    if (e.target.innerText.trim() === PLACEHOLDER_TEXT) {
                                        e.target.innerText = '';
                                    }
                                }}
                                onBlur={(e) => {
                                    // Re-add placeholder on blur if empty
                                    if (e.target.innerText.trim() === '') {
                                        e.target.innerText = PLACEHOLDER_TEXT;
                                    }
                                }}
                                style={{ minHeight: '460px', fontSize: `${fontSize}px` }}
                            >
                                {PLACEHOLDER_TEXT}
                            </div>
                        </div>

                        {/* Analysis Buttons (Call API functions) */}
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={runGrammarCheck}
                                disabled={isAnalyzing}
                                className={`${UTILS.BTN_PRIMARY} ${activeAnalysis === 'grammar' ? 'bg-blue-600' : 'bg-blue-500'}`}
                            >
                                {isAnalyzing && activeAnalysis === 'grammar' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
                                Check Grammar
                            </button>
                            <button
                                onClick={runPlagiarismCheck}
                                disabled={isAnalyzing}
                                className={`${UTILS.BTN_PRIMARY} ${activeAnalysis === 'plagiarism' ? 'bg-blue-600' : 'bg-blue-500'}`}
                            >
                                {isAnalyzing && activeAnalysis === 'plagiarism' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                                Check Plagiarism
                            </button>
                            <button
                                onClick={runCitationCheck}
                                disabled={isAnalyzing}
                                className={`${UTILS.BTN_PRIMARY} ${activeAnalysis === 'citations' ? 'bg-blue-600' : 'bg-blue-500'}`}
                            >
                                {isAnalyzing && activeAnalysis === 'citations' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                                Check Citations
                            </button>
                        </div>

                        {/* Analysis Results (Render based on API response state) */}
                        <div className={`${UTILS.CARD} p-4`}>
                            {isAnalyzing && (
                                <div className="text-center text-gray-600 flex items-center justify-center p-4">
                                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Running {activeAnalysis}...
                                </div>
                            )}
                            {!isAnalyzing && activeAnalysis === 'grammar' && renderGrammarAnalysis()}
                            {!isAnalyzing && activeAnalysis === 'plagiarism' && renderPlagiarismAnalysis()}
                            {!isAnalyzing && activeAnalysis === 'citations' && renderCitationAnalysis()}
                            
                            {!isAnalyzing && !activeAnalysis && (
                                <div className="text-center text-gray-500 p-4">Click an analysis button above to begin.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManualReportGenerator;