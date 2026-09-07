import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

const RAGGenerator = () => {
  const { getToken } = useAuth();
  const [kbs, setKbs] = useState([]);
  const [selectedKb, setSelectedKb] = useState("");
  const [prompt, setPrompt] = useState("");
  const [useRAG, setUseRAG] = useState(true);
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState([]);
  const [copied, setCopied] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    fetchKnowledgeBases();
  }, [getToken]);

  const fetchKnowledgeBases = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_BASE_URL}/api/rag/kb`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        setKbs(res.data.knowledge_bases);
        if (res.data.knowledge_bases.length > 0) {
          setSelectedKb(res.data.knowledge_bases[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load knowledge bases:", error);
      toast.error("Failed to load knowledge bases");
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (useRAG && !selectedKb) {
      toast.error("Please select a knowledge base for RAG");
      return;
    }

    try {
      setLoading(true);
      setResponse("");
      setSources([]);

      const token = await getToken();
      const res = await axios.post(
        `${API_BASE_URL}/api/rag/generate`,
        {
          kb_id: useRAG ? selectedKb : null,
          prompt,
          use_rag: useRAG,
          temperature,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setResponse(res.data.response);
        if (res.data.sources) {
          setSources(res.data.sources);
        }
        toast.success("Response generated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate response");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-indigo-600" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">RAG Content Generator</h2>
        </div>

        {/* RAG Toggle */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useRAG}
              onChange={(e) => setUseRAG(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
            <span className="font-medium text-gray-700">
              Use RAG (Retrieve content from knowledge base)
            </span>
          </label>
          <p className="text-xs text-gray-600 mt-2">
            When enabled, your prompt will be answered using relevant documents
            from the selected knowledge base.
          </p>
        </div>

        {/* KB Selection */}
        {useRAG && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Knowledge Base
            </label>
            <select
              value={selectedKb}
              onChange={(e) => setSelectedKb(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose a knowledge base...</option>
              {kbs.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Your Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question or request content generation..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows="5"
          />
        </div>

        {/* Temperature Control */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperature: {temperature.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-600 mt-1">
            Lower = more focused, Higher = more creative
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition font-medium flex items-center justify-center gap-2"
        >
          <Sparkles size={20} />
          {loading ? "Generating..." : "Generate Response"}
        </button>

        {/* Response Display */}
        {response && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Generated Response</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
              >
                {copied ? (
                  <>
                    <Check size={16} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {response}
              </p>
            </div>

            {/* Sources */}
            {sources && sources.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">📚 Sources Used:</h4>
                <div className="space-y-2">
                  {sources.map((source, idx) => (
                    <div
                      key={idx}
                      className="bg-green-50 p-3 rounded border border-green-200 text-sm"
                    >
                      <p className="text-green-700">
                        Source {idx + 1} (Score: {(source.score * 100).toFixed(1)}%)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RAGGenerator;
