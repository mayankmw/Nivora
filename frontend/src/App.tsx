import { useEffect, useState } from 'react';

type ApiStatus = 'checking' | 'online' | 'offline';

const STATUS_LABEL: Record<ApiStatus, string> = {
  checking: 'Checking API…',
  online: 'API online',
  offline: 'API unreachable',
};

// Placeholder landing page for the project scaffold. It only proves that the
// frontend runs and can reach the backend through the dev proxy.
function App() {
  const [status, setStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/v1/health', { signal: controller.signal })
      .then((response) => setStatus(response.ok ? 'online' : 'offline'))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Health check failed', error);
          setStatus('offline');
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="scaffold">
      <h1>Nivora</h1>
      <p>Student hostel management platform</p>
      <p className="status" data-status={status} role="status">
        {STATUS_LABEL[status]}
      </p>
    </main>
  );
}

export default App;
