import React, { useState } from 'react';
import './FilterBar.css';

const FilterBar = ({ onFilterChange, filters, type }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const getCategories = () => {
    switch (type) {
      case 'courses':
        return ['Web Development', 'Digital Marketing', 'Business', 'Design', 'Technology', 'General'];
      case 'events':
        return ['Networking', 'Workshop', 'Conference', 'Meetup', 'Webinar', 'General'];
      case 'marketplace':
        return ['Electronics', 'Books', 'Services', 'Digital Products', 'Physical Products', 'General'];
      default:
        return ['General'];
    }
  };

  const getSortOptions = () => {
    switch (type) {
      case 'courses':
      case 'marketplace':
        return [
          { value: 'newest', label: 'Newest' },
          { value: 'price_asc', label: 'Price: Low to High' },
          { value: 'price_desc', label: 'Price: High to Low' },
          { value: 'rating_desc', label: 'Highest Rated' }
        ];
      case 'events':
        return [
          { value: 'newest', label: 'Newest' },
          { value: 'soonest', label: 'Coming Soon' },
          { value: 'rating_desc', label: 'Highest Rated' }
        ];
      default:
        return [{ value: 'newest', label: 'Newest' }];
    }
  };

  return (
    <div className="filter-bar">
      <div className="filter-header">
        <button 
          className="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'Show'} Filters
        </button>
        <button className="clear-filters" onClick={clearFilters}>
          Clear All
        </button>
      </div>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search..."
              value={filters.q || ''}
              onChange={(e) => handleFilterChange('q', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {getCategories().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {(type === 'courses' || type === 'marketplace') && (
            <div className="filter-group">
              <label>Price Range:</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>
          )}

          {type === 'events' && (
            <div className="filter-group">
              <label>Date Range:</label>
              <div className="date-range">
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
                <span>to</span>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="filter-group">
            <label>Minimum Rating:</label>
            <select
              value={filters.minRating || ''}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              {getSortOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
