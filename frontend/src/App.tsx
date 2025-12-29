import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { ResearchInput } from './components/ResearchInput';
import { StatusTerminal } from './components/StatusTerminal';
import { ReportViewer } from './components/ReportViewer';
import { ReportChat } from './components/ReportChat';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface JobStatus {
  id: string;
  status: 'queued' | 'planning' | 'researching' | 'reporting' | 'completed' | 'failed';
  logs: string[];
  report?: string;
  sources?: string[];
}

interface HistoryItem {
  id: string;
  topic: string;
  status: string;
  created_at: string;
}

const API_Base = 'http://localhost:8000/api';

function App() {
  const [topic, setTopic] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'deep' | 'quick'>('deep');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_Base}/research`);
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  // Polling Effect
  useEffect(() => {
    if (!jobId || status?.status === 'completed' || status?.status === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_Base}/research/${jobId}`);
        const data = await res.json();

        setStatus(data);

        // Refresh list on completion to show status update if needed
        if (data.status === 'completed') {
          fetchHistory();
        }

      } catch (e) {
        console.error("Polling error", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, status?.status]);

  const startResearch = async () => {
    if (!topic) return;
    setIsLoading(true);
    setStatus(null); // Clear previous status view
    try {
      const res = await fetch(`${API_Base}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, mode })
      });
      const data = await res.json();

      const newId = data.job_id;
      setJobId(newId);

      // Initialize Status locally for immediate feedback
      setStatus({
        id: newId,
        status: 'queued',
        logs: [`Starting ${mode} research...`],
        report: undefined,
        sources: []
      });

      // Refresh history list
      fetchHistory();

      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const loadHistoryItem = async (id: string) => {
    setJobId(id);
    // Find item to set topic immediately
    const item = history.find(h => h.id === id);
    if (item) setTopic(item.topic);

    setIsLoading(true);

    try {
      const res = await fetch(`${API_Base}/research/${id}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this research?')) return;
    try {
      await fetch(`${API_Base}/research/${id}`, { method: 'DELETE' });
      if (jobId === id) {
        setJobId(null);
        setStatus(null);
        setTopic('');
      }
      fetchHistory();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleUpdateTitle = async (id: string, newTitle: string) => {
    try {
      await fetch(`${API_Base}/research/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: newTitle })
      });
      fetchHistory();
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  const handleNewResearch = () => {
    setTopic('');
    setJobId(null);
    setStatus(null);
    setIsLoading(false);
  };

  const handleStop = async () => {
    if (!jobId) return;
    try {
      await fetch(`${API_Base}/research/${jobId}/stop`, { method: 'POST' });
      // Status update will be caught by polling
    } catch (e) {
      console.error("Stop failed", e);
    }
  };

  return (
    <Layout
      isOpen={true}
      sidebar={
        <Sidebar
          history={history}
          currentId={jobId}
          onSelect={loadHistoryItem}
          onNew={handleNewResearch}
          onDelete={handleDelete}
          onUpdate={handleUpdateTitle}
        />
      }
    >

      {/* Search Section */}
      <AnimatePresence>
        {(!status || status.status === 'queued') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
          >
            <ResearchInput
              topic={topic}
              setTopic={setTopic}
              onSearch={startResearch}
              isLoading={isLoading}
              mode={mode}
              setMode={setMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Status View */}
      <AnimatePresence mode="wait">
        {status && (
          <motion.div
            key="status-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl space-y-8"
          >
            {status.status !== 'completed' && (
              <StatusTerminal status={status} onStop={handleStop} />
            )}

            {/* Completed Report */}
            {status.status === 'completed' && status.report && (
              <>
                <ReportViewer report={status.report} sources={status.sources || []} />
                <ReportChat jobId={status.id} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </Layout>
  );
}

export default App;


