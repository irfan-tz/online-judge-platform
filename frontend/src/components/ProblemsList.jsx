import { useState, useCallback, useEffect } from "react";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";
import "./ProblemsList.css";

// Get problems with filters + pagination
const GET_PROBLEMS = gql`
  query GetProblems($first: Int, $after: String, $tags: [String!], $difficulty: String, $search: String) {
    problems(first: $first, after: $after, tags: $tags, difficulty: $difficulty, search: $search) {
      edges {
        node {
          id
          title
          description
          difficulty
          tags
          timeLimit
          memoryLimit
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// Get suggested tags dynamically
const SUGGEST_TAGS = gql`
  query SuggestTags($search: String!) {
    suggestTags(search: $search)
  }
`;

const ProblemsList = () => {
  const [pageSize] = useState(10);
  const [cursors, setCursors] = useState([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    tags: [],
    difficulty: "",
    search: ""
  });

  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [suggestedTags, setSuggestedTags] = useState([]);

  // Fetch problems
  const { loading, error, data } = useQuery(GET_PROBLEMS, {
    variables: {
      first: pageSize,
      after: cursors[currentPageIndex],
      tags: appliedFilters.tags.length > 0 ? appliedFilters.tags : null,
      difficulty: appliedFilters.difficulty || null,
      search: appliedFilters.search || null
    },
    fetchPolicy: "cache-and-network"
  });

  // Lazy query for tag suggestions
  const [fetchSuggestedTags] = useLazyQuery(SUGGEST_TAGS, {
    fetchPolicy: "cache-first",
    onCompleted: (data) => {
      if (data?.suggestTags) {
        setSuggestedTags(data.suggestTags);
      }
    }
  });

  // Debounced tag suggestion fetch
  const debouncedFetchTags = useCallback(
    debounce((value) => {
      if (value.trim()) {
        fetchSuggestedTags({ variables: { search: value } });
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (tagSearchTerm) {
      debouncedFetchTags(tagSearchTerm);
    } else {
      setSuggestedTags([]);
    }

    return debouncedFetchTags.cancel;
  }, [tagSearchTerm]);

  const applyFilters = useCallback(() => {
    setAppliedFilters({
      tags: selectedTags,
      difficulty: selectedDifficulty,
      search: searchTerm
    });
    setCursors([null]);
    setCurrentPageIndex(0);
  }, [selectedTags, selectedDifficulty, searchTerm]);

  const clearFilters = useCallback(() => {
    setSelectedTags([]);
    setSelectedDifficulty("");
    setSearchTerm("");
    setTagSearchTerm("");
    setAppliedFilters({
      tags: [],
      difficulty: "",
      search: ""
    });
    setCursors([null]);
    setCurrentPageIndex(0);
  }, []);

  const connection = data?.problems;
  const problems = connection?.edges?.map(edge => edge.node) || [];
  const pageInfo = connection?.pageInfo;
  const totalCount = connection?.totalCount || 0;

  const canGoPrev = currentPageIndex > 0;
  const canGoNext = pageInfo?.hasNextPage || false;

  const handlePrev = () => canGoPrev && setCurrentPageIndex(i => i - 1);
  const handleNext = () => {
    if (canGoNext) {
      if (currentPageIndex === cursors.length - 1) {
        setCursors(prev => [...prev, pageInfo.endCursor]);
      }
      setCurrentPageIndex(i => i + 1);
    }
  };
  const handleFirst = () => {
    setCursors([null]);
    setCurrentPageIndex(0);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const difficulties = ["Easy", "Medium", "Hard"];
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "#10b981";
      case "medium": return "#f59e0b";
      case "hard": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getDifficultyBgColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "rgba(16, 185, 129, 0.1)";
      case "medium": return "rgba(245, 158, 11, 0.1)";
      case "hard": return "rgba(239, 68, 68, 0.1)";
      default: return "rgba(107, 114, 128, 0.1)";
    }
  };

  if (loading) return <div className="loading">Loading problems...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="problems-container">
      <header>
        <h2>Problems ({totalCount} total)</h2>
      </header>

      {/* Filters */}
      <section className="filters-section" aria-label="Problem filters">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems..."
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
        </div>

        <div className="filter-group">
          <label>Difficulty:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="">All Difficulties</option>
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tags:</label>
          <input
            type="text"
            value={tagSearchTerm}
            onChange={(e) => setTagSearchTerm(e.target.value)}
            placeholder="Type to search tags..."
          />
          <div className="tags-suggestions">
            {suggestedTags.map(tag => (
              <button
                key={tag}
                className={`tag-suggestion ${selectedTags.includes(tag) ? "selected" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {selectedTags.length > 0 && (
          <div className="tags-selected">
            {selectedTags.map(tag => (
              <span key={tag} className="tag-filter selected">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="filter-actions">
          <button onClick={applyFilters} className="apply-filters" aria-label="Apply selected filters">
            Apply Filters
          </button>
          <button onClick={clearFilters} className="clear-filters" aria-label="Clear all filters">
            Clear All
          </button>
        </div>
      </section>

      {/* Applied Filters Summary */}
      {(appliedFilters.tags.length || appliedFilters.difficulty || appliedFilters.search) > 0 && (
        <section className="applied-filters" aria-label="Active filters">
          <span>Active filters:</span>
          {appliedFilters.search && <span className="filter-badge">Search: "{appliedFilters.search}"</span>}
          {appliedFilters.difficulty && <span className="filter-badge">Difficulty: {appliedFilters.difficulty}</span>}
          {appliedFilters.tags.map(tag => <span key={tag} className="filter-badge">Tag: {tag}</span>)}
        </section>
      )}

      {/* Pagination */}
      <nav className="navigation" aria-label="Problem pagination">
        <button 
          onClick={handleFirst} 
          disabled={!canGoPrev}
          aria-label="Go to first page"
        >
          <span className="hide-mobile">⏪ First</span>
          <span className="show-mobile">⏪</span>
        </button>
        <button 
          onClick={handlePrev} 
          disabled={!canGoPrev}
          aria-label="Go to previous page"
        >
          <span className="hide-mobile">◀ Prev</span>
          <span className="show-mobile">◀</span>
        </button>
        <div className="page-info" aria-live="polite">
          <span className="hide-mobile">Page {currentPageIndex + 1} • Showing {problems.length} of {totalCount}</span>
          <span className="show-mobile">{currentPageIndex + 1} / {Math.ceil(totalCount / pageSize)}</span>
        </div>
        <button 
          onClick={handleNext} 
          disabled={!canGoNext}
          aria-label="Go to next page"
        >
          <span className="hide-mobile">Next ▶</span>
          <span className="show-mobile">▶</span>
        </button>
      </nav>

      {/* Problem List */}
      {problems.length === 0 ? (
        <div className="no-results" role="status" aria-live="polite">
          <p>No problems found matching your criteria.</p>
        </div>
      ) : (
        <main className="problems-list scroll-panel" role="main" aria-label="Problems list">
          {problems.map(problem => (
            <Link to={`/problem/${problem.id}`} key={problem.id} className="problem-link">
              <article className="problem-card" tabIndex="0" role="article">
                <header className="problem-header">
                  <h3 className="problem-title">{problem.id}. {problem.title}</h3>
                  <div 
                    className="problem-difficulty" 
                    style={{ 
                      color: getDifficultyColor(problem.difficulty),
                      backgroundColor: getDifficultyBgColor(problem.difficulty)
                    }}
                  >
                    {problem.difficulty}
                  </div>
                </header>
                {problem.tags?.length > 0 && (
                  <div className="problem-tags" role="list" aria-label="Problem tags">
                    {problem.tags.map(tag => (
                      <span key={tag} className="problem-tag" role="listitem">{tag}</span>
                    ))}
                  </div>
                )}
              </article>
            </Link>
          ))}
        </main>
      )}
    </div>
  );
};

export default ProblemsList;
