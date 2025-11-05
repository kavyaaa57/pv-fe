import { useState } from 'react';
import { Filter, Calendar, Tag, Lock } from 'lucide-react';

const SearchFilters = ({ filters, onFiltersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    'Computer Science',
    'Machine Learning',
    'Natural Language Processing',
    'Artificial Intelligence',
    'Data Science',
    'Information Retrieval',
    'Digital Libraries',
    'Academic Publishing',
    'Research Methods',
    'Text Mining'
  ];

  const accessTypes = [
    { value: 'all', label: 'All Papers', icon: '📄' },
    { value: 'unlocked', label: 'Open Access', icon: '🔓' },
    { value: 'preprint', label: 'Preprints', icon: '📝' },
    { value: 'locked', label: 'Abstract Only', icon: '🔒' }
  ];

  const handleCategoryToggle = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleYearRangeChange = (index, value) => {
    const newRange = [...filters.yearRange];
    newRange[index] = parseInt(value);
    onFiltersChange({
      ...filters,
      yearRange: newRange
    });
  };

  const handleAccessTypeChange = (accessType) => {
    onFiltersChange({
      ...filters,
      accessType
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      yearRange: [2020, 2024],
      categories: [],
      accessType: 'all'
    });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Year Range Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Publication Year
          </h4>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1990"
              max="2024"
              value={filters.yearRange[0]}
              onChange={(e) => handleYearRangeChange(0, e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              min="1990"
              max="2024"
              value={filters.yearRange[1]}
              onChange={(e) => handleYearRangeChange(1, e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Access Type Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Lock className="h-4 w-4 mr-1" />
            Access Type
          </h4>
          <div className="space-y-2">
            {accessTypes.map((type) => (
              <label key={type.value} className="flex items-center">
                <input
                  type="radio"
                  name="accessType"
                  value={type.value}
                  checked={filters.accessType === type.value}
                  onChange={(e) => handleAccessTypeChange(e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 flex items-center">
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            Categories
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={clearFilters}
            className="w-full text-sm text-gray-600 hover:text-gray-800 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
