import { useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Upload, FileText, Share2, Loader2 } from 'lucide-react';
import './App.css';

// Types
interface GraphNode {
  id: string;
  label: string;
  type?: string;
}

interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface ExtractionResult {
  graph_data: GraphData;
  extraction_text: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("Extract key entities and their relationships.");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'text'>('graph');

  const graphRef = useRef<any>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);
    if (apiKey) formData.append('openai_api_key', apiKey);

    // Determine Backend URL (Dev vs Prod)
    // In local dev, use http://localhost:10000
    // In Render, the frontend and backend are usually separate services.
    // We'll default to localhost for now, user might need to change for PROD.
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:10000";

    try {
      const response = await fetch(`${BACKEND_URL}/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Extraction failed", error);
      alert("Failed to extract data. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1><Share2 /> LangExtract</h1>
        <p>PDF Knowledge Graph & Data Extractor</p>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <form onSubmit={handleSubmit} className="control-panel">
            <div className="input-group">
              <label>OpenAI API Key (Optional if set on server)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Upload PDF</label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  id="file-upload"
                  hidden
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <Upload size={16} /> {file ? file.name : "Choose File"}
                </label>
              </div>
            </div>

            <div className="input-group">
              <label>Extraction Instruction</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading || !file}>
              {isLoading ? <><Loader2 className="spin" /> Processing...</> : "Extract Information"}
            </button>
          </form>
        </aside>

        <section className="display-area">
          {result ? (
            <div className="results-container">
              <div className="tabs">
                <button
                  className={activeTab === 'graph' ? 'active' : ''}
                  onClick={() => setActiveTab('graph')}
                >
                  <Share2 size={16} /> Knowledge Graph
                </button>
                <button
                  className={activeTab === 'text' ? 'active' : ''}
                  onClick={() => setActiveTab('text')}
                >
                  <FileText size={16} /> Extracted Text
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'graph' && (
                  <div className="graph-wrapper">
                    <ForceGraph2D
                      ref={graphRef}
                      graphData={result.graph_data}
                      nodeLabel="id"
                      nodeAutoColorBy="type"
                      linkDirectionalArrowLength={3.5}
                      linkDirectionalArrowRelPos={1}
                      linkLabel="label"
                      backgroundColor="#1a1a1a"
                    />
                  </div>
                )}
                {activeTab === 'text' && (
                  <div className="text-wrapper">
                    <pre>{result.extraction_text}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="placeholder-state">
              <Share2 size={48} opacity={0.2} />
              <p>Upload a PDF and submit to generate a Knowledge Graph.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
