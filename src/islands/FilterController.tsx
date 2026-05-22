import { useEffect, useCallback } from 'preact/hooks';

export default function FilterController() {
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const cards = document.querySelectorAll<HTMLElement>('[data-evidence]');

    // Collect active filters
    const filters: Record<string, string[]> = {};
    const checkboxes = document.querySelectorAll<HTMLInputElement>('.filter-checkbox:checked');
    checkboxes.forEach((cb) => {
      const group = cb.dataset.filterGroup;
      const value = cb.value;
      if (group) {
        if (!filters[group]) filters[group] = [];
        filters[group].push(value);
      }
    });

    // Update URL
    const newParams = new URLSearchParams();
    for (const [group, values] of Object.entries(filters)) {
      if (values.length) newParams.set(group, values.join(','));
    }
    const qs = newParams.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    history.replaceState(null, '', newUrl);

    // Show/hide cards
    const hasFilters = Object.keys(filters).length > 0;
    cards.forEach((card) => {
      if (!hasFilters) {
        card.style.display = '';
        return;
      }

      let visible = true;
      for (const [group, values] of Object.entries(filters)) {
        const attr = card.dataset[group] || '';
        const cardValues = attr.split(',').map((v) => v.trim()).filter(Boolean);
        const matches = values.some((v) => cardValues.includes(v));
        if (!matches) {
          visible = false;
          break;
        }
      }
      card.style.display = visible ? '' : 'none';
    });

    // Update visible count
    const visibleCount = document.querySelectorAll<HTMLElement>('[data-evidence]:not([style*="display: none"])').length;
    const counter = document.querySelector('.filter-count');
    if (counter) counter.textContent = `${visibleCount} result${visibleCount !== 1 ? 's' : ''}`;
  }, []);

  useEffect(() => {
    // Restore filters from URL on mount
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
      const values = value.split(',');
      values.forEach((v) => {
        const cb = document.querySelector<HTMLInputElement>(
          `.filter-checkbox[data-filter-group="${key}"][value="${v}"]`
        );
        if (cb) cb.checked = true;
      });
    });

    applyFilters();

    // Listen for checkbox changes
    const handler = (e: Event) => {
      if ((e.target as HTMLElement).classList.contains('filter-checkbox')) {
        applyFilters();
      }
    };
    document.addEventListener('change', handler);
    return () => document.removeEventListener('change', handler);
  }, [applyFilters]);

  return null; // This island is invisible — it just manages state
}
