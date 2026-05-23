/** @jsxImportSource preact */
import { useEffect, useRef, useState, useCallback } from 'preact/hooks';

interface SearchResult {
  url: string;
  meta: { title: string; type?: string };
  excerpt: string;
}

const typeLabels: Record<string, string> = {
  talk: 'Talk',
  experiment: 'Experiment',
  cluster: 'Cluster',
};

interface Props {
  basePath?: string;
}

export default function SearchWidget({ basePath = '/' }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const pagefindRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  const loadPagefind = useCallback(async () => {
    if (pagefindRef.current) return pagefindRef.current;
    try {
      const pf = await import(/* @vite-ignore */ `${basePath}/pagefind/pagefind.js`);
      await pf.init();
      pagefindRef.current = pf;
      return pf;
    } catch {
      return null;
    }
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    const pf = await loadPagefind();
    if (!pf) {
      setLoading(false);
      setSearched(true);
      return;
    }

    const search = await pf.search(q);
    const data = await Promise.all(
      search.results.slice(0, 20).map((r: any) => r.data())
    );
    setResults(data);
    setSearched(true);
    setLoading(false);
  }, [loadPagefind]);

  const handleInput = useCallback((e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => doSearch(val), 200);
  }, [doSearch]);

  // Load pagefind on focus
  const handleFocus = useCallback(() => {
    loadPagefind();
  }, [loadPagefind]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div class="search-widget">
      <div class="search-input-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          aria-label="Search experiments and talks"
          placeholder="Search experiments and talks..."
          value={query}
          onInput={handleInput}
          onFocus={handleFocus}
          class="search-input"
        />
        {loading && <span class="search-spinner" aria-label="Searching" />}
      </div>

      {searched && results.length === 0 && (
        <div class="search-empty">
          <p class="search-empty-title">No results for &ldquo;{query}&rdquo;</p>
          <p class="search-empty-hint">Try different keywords, check your spelling, or browse by topic:</p>
          <div class="search-empty-links">
            <a href={`${basePath}/clusters/`}>Browse Clusters</a>
            <a href={`${basePath}/experiments/`}>All Experiments</a>
            <a href={`${basePath}/talks/`}>All Talks</a>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <ul class="search-results" role="list">
          {results.map((r) => (
            <li class="search-result">
              <a href={r.url} class="result-link">
                <div class="result-header">
                  <span class="result-title">{r.meta.title}</span>
                  {r.meta.type && (
                    <span class={`result-type result-type--${r.meta.type}`}>
                      {typeLabels[r.meta.type] || r.meta.type}
                    </span>
                  )}
                </div>
                <p class="result-excerpt" dangerouslySetInnerHTML={{ __html: r.excerpt }} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
