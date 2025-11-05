import { useState } from 'react';
import { 
  ExternalLink, 
  Download, 
  Lock, 
  Unlock, 
  FileText, 
  Calendar, 
  Users, 
  Quote,
  Check,
  Plus,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PaperCard = ({ paper, isSelected, onSelect }) => {
  const [showFullAbstract, setShowFullAbstract] = useState(false);

  const getAccessIcon = (accessType) => {
    switch (accessType) {
      case 'unlocked':
        return <Unlock className="h-4 w-4 text-green-600" />;
      case 'preprint':
        return <FileText className="h-4 w-4 text-yellow-600" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-red-600" />;
      default:
        return <Lock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAccessLabel = (accessType) => {
    switch (accessType) {
      case 'unlocked':
        return 'Full Access';
      case 'preprint':
        return 'Preprint Available';
      case 'locked':
        return 'Abstract Only';
      default:
        return 'Unknown';
    }
  };

  const getAccessColor = (accessType) => {
    switch (accessType) {
      case 'unlocked':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'preprint':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'locked':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleAccessClick = () => {
    if (paper.accessType === 'unlocked' && paper.pdfUrl) {
      window.open(paper.pdfUrl, '_blank');
    } else if (paper.accessType === 'preprint' && paper.preprintUrl) {
      window.open(paper.preprintUrl, '_blank');
    } else if (paper.accessType === 'locked') {
      // For locked papers, we could trigger a web search or show more info
      console.log('Searching for related content for:', paper.title);
    }
  };

  return (
    <div className={`card transition-all duration-200 ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getAccessIcon(paper.accessType)}
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getAccessColor(paper.accessType)}`}>
              {getAccessLabel(paper.accessType)}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {paper.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Users className="h-4 w-4 mr-1" />
            <span>{paper.authors.join(', ')}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{paper.journal} • {paper.year}</span>
            {paper.citations && (
              <span className="ml-4 flex items-center">
                <Quote className="h-4 w-4 mr-1" />
                {paper.citations} citations
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onSelect}
            className={`p-2 rounded-lg transition-colors ${
              isSelected 
                ? 'bg-primary-100 text-primary-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isSelected ? 'Deselect paper' : 'Select for synthesis'}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Summary */}
      {paper.summary && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">AI Summary:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {paper.summary}
          </p>
        </div>
      )}

      {/* Justification for Research Project */}
      {paper.justification && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Research Justification:</h4>
          <p className="text-sm text-blue-700">
            {paper.justification}
          </p>
        </div>
      )}

      {/* Abstract */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Abstract:</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          {showFullAbstract ? paper.abstract : `${paper.abstract.substring(0, 200)}...`}
          {paper.abstract.length > 200 && (
            <button
              onClick={() => setShowFullAbstract(!showFullAbstract)}
              className="ml-1 text-primary-600 hover:text-primary-700 font-medium"
            >
              {showFullAbstract ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAccessClick}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              paper.accessType === 'unlocked' || paper.accessType === 'preprint'
                ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {paper.accessType === 'unlocked' ? (
              <>
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </>
            ) : paper.accessType === 'preprint' ? (
              <>
                <ExternalLink className="h-4 w-4" />
                <span>View Preprint</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Search Related</span>
              </>
            )}
          </button>
          
          <Link
            to={`/analysis/${paper.id}`}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Analyze</span>
          </Link>
        </div>
        
        {paper.doi && (
          <span className="text-xs text-gray-500">
            DOI: {paper.doi}
          </span>
        )}
      </div>
    </div>
  );
};

export default PaperCard;
