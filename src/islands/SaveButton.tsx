/** @jsxImportSource preact */
import { useState, useCallback, useEffect } from 'preact/hooks';
import { isSaved, saveExperiment, removeExperiment, isLocalStorageAvailable } from '../lib/saved';

interface Props {
  experimentId: string;
  title: string;
}

export default function SaveButton({ experimentId, title }: Props) {
  const [saved, setSaved] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    setAvailable(isLocalStorageAvailable());
    setSaved(isSaved(experimentId));
  }, [experimentId]);

  const toggle = useCallback(() => {
    if (!available) return;
    if (saved) {
      removeExperiment(experimentId);
      setSaved(false);
    } else {
      saveExperiment(experimentId);
      setSaved(true);
    }
  }, [experimentId, saved, available]);

  if (!available) {
    return (
      <button class="save-btn save-btn--disabled" disabled title="Saving requires localStorage">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
        Save
      </button>
    );
  }

  return (
    <button
      class={`save-btn ${saved ? 'save-btn--saved' : ''}`}
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
