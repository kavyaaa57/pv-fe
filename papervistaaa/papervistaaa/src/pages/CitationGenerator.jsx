import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  FileText, 
  Book, 
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CitationGenerator = () => {
  const [papers, setPapers] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('apa');
  const [generatedCitations, setGeneratedCitations] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const citationFormats = [
    { id: 'apa', name: 'APA (7th Edition)', description: 'American Psychological Association' },
    { id: 'mla', name: 'MLA (9th Edition)', description: 'Modern Language Association' },
    { id: 'chicago', name: 'Chicago (17th Edition)', description: 'Chicago Manual of Style' },
    { id: 'ieee', name: 'IEEE', description: 'Institute of Electrical and Electronics Engineers' },
    { id: 'harvard', name: 'Harvard', description: 'Harvard Referencing Style' },
    { id: 'vancouver', name: 'Vancouver', description: 'Vancouver Style' }
  ];

  const addPaper = () => {
    const newPaper = {
      id: Date.now(),
      title: '',
      authors: '',
      journal: '',
      year: '',
      volume: '',
      issue: '',
      pages: '',
      doi: '',
      url: '',
      publisher: '',
      place: '',
      type: 'journal'
    };
    setPapers([...papers, newPaper]);
  };

  const updatePaper = (id, field, value) => {
    setPapers(papers.map(paper => 
      paper.id === id ? { ...paper, [field]: value } : paper
    ));
  };

  const removePaper = (id) => {
    setPapers(papers.filter(paper => paper.id !== id));
  };

  const generateCitations = async () => {
    if (papers.length === 0) return;
    
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const citations = papers.map(paper => formatCitation(paper, selectedFormat)).join('\n\n');
      setGeneratedCitations(citations);
      setIsGenerating(false);
    }, 1500);
  };

  const formatCitation = (paper, format) => {
    const { title, authors, journal, year, volume, issue, pages, doi, url, publisher, place } = paper;
    
    switch (format) {
      case 'apa':
        return `${authors} (${year}). ${title}. *${journal}*, ${volume}${issue ? `(${issue})` : ''}, ${pages}. https://doi.org/${doi}`;
      
      case 'mla':
        return `${authors}. "${title}." *${journal}*, vol. ${volume}${issue ? `, no. ${issue}` : ''}, ${year}, pp. ${pages}.`;
      
      case 'chicago':
        return `${authors}. "${title}." *${journal}* ${volume}, no. ${issue} (${year}): ${pages}.`;
      
      case 'ieee':
        return `${authors}, "${title}," *${journal}*, vol. ${volume}, no. ${issue}, pp. ${pages}, ${year}.`;
      
      case 'harvard':
        return `${authors} ${year}, '${title}', *${journal}*, vol. ${volume}, no. ${issue}, pp. ${pages}.`;
      
      case 'vancouver':
        return `${authors}. ${title}. ${journal}. ${year};${volume}${issue ? `(${issue})` : ''}:${pages}.`;
      
      default:
        return `${authors} (${year}). ${title}. ${journal}`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCitations);
  };

  const downloadCitations = () => {
    const blob = new Blob([generatedCitations], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citations_${selectedFormat}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isPaperComplete = (paper) => {
    return paper.title && paper.authors && paper.journal && paper.year;
  };

  const completedPapers = papers.filter(isPaperComplete).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Citation Generator</h1>
        <p className="text-gray-600">
          Generate properly formatted citations in multiple academic styles. Add your papers and select a citation format.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Citation Format</h3>
            <div className="grid grid-cols-2 gap-3">
              {citationFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedFormat === format.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{format.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Papers List */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Papers</h3>
              <button
                onClick={addPaper}
                className="btn-primary flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Paper</span>
              </button>
            </div>

            {papers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No papers added yet. Click "Add Paper" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {papers.map((paper, index) => (
                  <div key={paper.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Paper {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        {isPaperComplete(paper) ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                        <button
                          onClick={() => removePaper(paper.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={paper.title}
                          onChange={(e) => updatePaper(paper.id, 'title', e.target.value)}
                          className="input-field"
                          placeholder="Paper title"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Authors *
                          </label>
                          <input
                            type="text"
                            value={paper.authors}
                            onChange={(e) => updatePaper(paper.id, 'authors', e.target.value)}
                            className="input-field"
                            placeholder="Author names"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year *
                          </label>
                          <input
                            type="number"
                            value={paper.year}
                            onChange={(e) => updatePaper(paper.id, 'year', e.target.value)}
                            className="input-field"
                            placeholder="2024"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Journal/Publication *
                        </label>
                        <input
                          type="text"
                          value={paper.journal}
                          onChange={(e) => updatePaper(paper.id, 'journal', e.target.value)}
                          className="input-field"
                          placeholder="Journal name"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Volume
                          </label>
                          <input
                            type="text"
                            value={paper.volume}
                            onChange={(e) => updatePaper(paper.id, 'volume', e.target.value)}
                            className="input-field"
                            placeholder="Vol. 1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issue
                          </label>
                          <input
                            type="text"
                            value={paper.issue}
                            onChange={(e) => updatePaper(paper.id, 'issue', e.target.value)}
                            className="input-field"
                            placeholder="No. 1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pages
                          </label>
                          <input
                            type="text"
                            value={paper.pages}
                            onChange={(e) => updatePaper(paper.id, 'pages', e.target.value)}
                            className="input-field"
                            placeholder="1-10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          DOI
                        </label>
                        <input
                          type="text"
                          value={paper.doi}
                          onChange={(e) => updatePaper(paper.id, 'doi', e.target.value)}
                          className="input-field"
                          placeholder="10.1000/182"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {papers.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {completedPapers} of {papers.length} papers complete
                  </span>
                  <button
                    onClick={generateCitations}
                    disabled={completedPapers === 0 || isGenerating}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Citations'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generated Citations</h3>
              {generatedCitations && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="btn-secondary flex items-center space-x-1"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={downloadCitations}
                    className="btn-primary flex items-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            {generatedCitations ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {generatedCitations}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Generated citations will appear here</p>
              </div>
            )}
          </div>

          {/* Format Preview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Format Preview</h3>
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>{citationFormats.find(f => f.id === selectedFormat)?.name}</strong>
              </p>
              <p className="text-xs">
                {citationFormats.find(f => f.id === selectedFormat)?.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitationGenerator;
