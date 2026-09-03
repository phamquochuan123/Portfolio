console.log('BASE =', import.meta.env.VITE_API_URL);
import { useEffect, useState } from 'react';
import { getProjects } from './api/projects';
import type { ProjectSummary } from './types';

export default function App() {
  const [data, setData] = useState<ProjectSummary[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getProjects().then(setData).catch(e => setErr(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      {err && <p className="text-red-400">Lỗi: {err}</p>}
      <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}