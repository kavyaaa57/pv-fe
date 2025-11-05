import { useEffect, useRef, useState } from 'react';
import { FileText, Upload, X, ZoomIn, ZoomOut, Maximize2, Minimize2, Bold, Italic, Image as ImageIcon, Type, Download } from 'lucide-react';

const ManualReportGenerator = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [analysis, setAnalysis] = useState({ grammarIssues: 0, similarity: 0, citations: [] });
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

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
    const html = editorRef.current ? editorRef.current.innerHTML : '';
    const text = editorRef.current ? editorRef.current.innerText : '';
    // Simple export: save plain text with basic info
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

  const analyze = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerText || '';
    // Mock grammar: count naive patterns
    const grammarIssues = (content.match(/\bis\s+are\b|\bwas\s+were\b/gi) || []).length;
    // Mock plagiarism: pseudo similarity vs fixed phrases
    const commonPhrases = ['in this paper', 'the results show', 'conclusion'];
    const hits = commonPhrases.reduce((acc, p) => acc + (content.toLowerCase().includes(p) ? 1 : 0), 0);
    const similarity = Math.min(10 * hits, 100);
    // Mock citations: detect year patterns
    const citations = Array.from(content.matchAll(/\(([^)]+),\s*(19|20)\d{2}\)/g)).map((m) => m[0]);
    setAnalysis({ grammarIssues, similarity, citations });
  };

  useEffect(() => {
    const handler = setTimeout(analyze, 400);
    return () => clearTimeout(handler);
  });

  return (
    <div className="max-w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manual Report Generator</h1>
        <p className="text-gray-600">Upload a PDF on the left and type your report on the right.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: PDF Viewer */}
        <div className={`space-y-4 ${isFullscreen ? 'lg:col-span-2' : ''}`}>
          <div className="card flex flex-col" style={{ minHeight: '600px' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">PDF Viewer</h3>
              <div className="flex items-center space-x-2">
                {uploadedFile && (
                  <>
                    <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded" title="Zoom Out">
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-600">{zoomLevel}%</span>
                    <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded" title="Zoom In">
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 rounded" title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                    <button onClick={removeFile} className="p-2 hover:bg-red-50 rounded text-red-600" title="Remove File">
                      <X className="h-4 w-4" />
                    </button>
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
            <div className="card flex flex-col" style={{ minHeight: '600px' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Editor</h3>
                <button onClick={downloadAsMarkdown} className="btn-primary flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>

              {/* Toolbar */}
              <div className="mb-3 flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <button onClick={() => exec('bold')} className="p-2 hover:bg-gray-200 rounded" title="Bold">
                  <Bold className="h-4 w-4" />
                </button>
                <button onClick={() => exec('italic')} className="p-2 hover:bg-gray-200 rounded" title="Italic">
                  <Italic className="h-4 w-4" />
                </button>
                <div className="flex items-center space-x-1 ml-2">
                  <Type className="h-4 w-4 text-gray-600" />
                  <select
                    value={fontSize}
                    onChange={(e) => {
                      const size = Number(e.target.value);
                      setFontSize(size);
                      // execCommand fontSize uses 1-7; use inline style instead
                      if (editorRef.current) {
                        document.execCommand('fontSize', false, '4');
                        // replace the last font tag with inline size
                        const fonts = editorRef.current.querySelectorAll('font[size="4"]');
                        fonts.forEach((el) => {
                          el.removeAttribute('size');
                          el.style.fontSize = `${size}px`;
                        });
                      }
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
                <button onClick={insertImage} className="p-2 hover:bg-gray-200 rounded ml-2" title="Insert Image">
                  <ImageIcon className="h-4 w-4" />
                </button>
                <div className="flex-1"></div>
                <div className="text-xs text-gray-500">Auto: Grammar, Plagiarism, Citations</div>
              </div>

              {/* Editable Area */}
              <div
                ref={editorRef}
                className="flex-1 border border-gray-300 rounded-lg p-4 bg-white prose max-w-none"
                contentEditable
                suppressContentEditableWarning
                style={{ minHeight: '460px' }}
              >
                <p className="text-gray-500">Start typing your report here...</p>
              </div>
            </div>

            {/* Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <h4 className="font-semibold text-gray-900 mb-2">Grammar</h4>
                <p className="text-sm text-gray-700">Issues detected: <span className="font-semibold">{analysis.grammarIssues}</span></p>
                <p className="text-xs text-gray-500 mt-1">(Mocked auto-check while typing)</p>
              </div>
              <div className="card">
                <h4 className="font-semibold text-gray-900 mb-2">Plagiarism</h4>
                <p className="text-sm text-gray-700">Similarity: <span className="font-semibold">{analysis.similarity}%</span></p>
                <p className="text-xs text-gray-500 mt-1">(Mock estimation)</p>
              </div>
              <div className="card">
                <h4 className="font-semibold text-gray-900 mb-2">Citations</h4>
                {analysis.citations.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {analysis.citations.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Add references like (Smith, 2023) to detect.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualReportGenerator;


