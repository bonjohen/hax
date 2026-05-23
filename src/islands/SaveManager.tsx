/** @jsxImportSource preact */
import { useState, useEffect, useCallback } from 'preact/hooks';
import { getSaved, removeExperiment, clearAll, isLocalStorageAvailable } from '../lib/saved';

interface SavedItem {
  experimentId: string;
  savedAt: string;
}

interface Props {
  basePath?: string;
}

export default function SaveManager({ basePath = '' }: Props) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    setAvailable(isLocalStorageAvailable());
    setItems(getSaved());
  }, []);

  const handleRemove = useCallback((id: string) => {
    removeExperiment(id);
    setItems(getSaved());
  }, []);

  const handleClearAll = useCallback(() => {
    clearAll();
    setItems([]);
  }, []);

  if (!available) {
    return (
      <div class="save-manager save-manager--unavailable">
        <p>Saving experiments requires localStorage, which is not available in your browser. Try disabling private browsing mode.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div class="save-manager save-manager--empty">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <h2>No saved experiments yet</h2>
          <p>Browse experiments and click the Save button to build your list.</p>
          <a href={`${basePath}/experiments/`} class="browse-link">Browse Experiments</a>
        </div>
      </div>
    );
  }

  return (
    <div class="save-manager">
      <div class="save-header">
        <p class="save-count">{items.length} saved experiment{items.length !== 1 ? 's' : ''}</p>
        <button class="clear-btn" onClick={handleClearAll}>Clear all</button>
      </div>
      <ul class="save-list" role="list">
        {items.map((item) => (
          <li class="save-item" key={item.experimentId}>
            <a href={`${basePath}/experiments/${item.experimentId}/`} class="save-item-link">
              {item.experimentId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </a>
            <button
              class="remove-btn"
              onClick={() => handleRemove(item.experimentId)}
              aria-label={`Remove ${item.experimentId}`}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
