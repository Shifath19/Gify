import React from "react";
import {Link} from "react-router-dom";

const TrendingSearches = ({terms}) => {
  if (!terms || terms.length === 0) {
    return null; // Don't render anything if there are no terms
  }

  return (
    <div className="my-4">
      <h3 className="text-lg font-semibold text-gray-400 mb-2">
        Trending Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {terms.map((term) => (
          <Link
            key={term}
            to={`/search/${encodeURIComponent(term)}`}
            className="px-4 py-1 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition ease-in-out text-sm"
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingSearches;
