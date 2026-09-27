import { useCallback, useEffect, useRef, useState } from 'react';
import { safeCopyToClipboard } from '../utils/security';

export type CopyStatus = 'idle' | 'copied' | 'failed';

/** How long the "copied" / "failed" confirmation stays visible. */
const FEEDBACK_MS = 2_500;

/**
 * Copies text to the clipboard and exposes short-lived feedback for the button that
 * triggered it. `key` distinguishes several copy buttons sharing one hook (e.g. one per
 * clause). The reset timer is cleared on unmount so no state update outlives the component.
 */
export function useCopyFeedback() {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const copy = useCallback(async (text: string, key = 'default') => {
    const ok = await safeCopyToClipboard(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveKey(key);
    setStatus(ok ? 'copied' : 'failed');
    timerRef.current = setTimeout(() => {
      setStatus('idle');
      setActiveKey(null);
    }, FEEDBACK_MS);
  }, []);

  /** Feedback state for a specific button; buttons that did not trigger the copy stay idle. */
  const statusFor = useCallback(
    (key = 'default'): CopyStatus => (activeKey === key ? status : 'idle'),
    [activeKey, status]
  );

  return { copy, statusFor };
}

/** User-facing message when the browser refuses clipboard access (e.g. insecure origin or denied permission). */
export const COPY_FAILED_LABEL = 'Copy blocked: select the text and press Ctrl+C';
