import { useState } from 'react';
import SearchFilters from '../components/SearchFilters';

const SearchPage = () => {
  const [filters, setFilters] = useState({
    yearRange: [2020, 2024],
    categories: [],
    accessType: 'all'
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="lg:w-96">
        <SearchFilters filters={filters} onFiltersChange={setFilters} />
      </div>
    </div>
  );
};

export default SearchPage;
