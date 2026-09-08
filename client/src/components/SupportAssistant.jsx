import React, { useState } from "react";
import axios from "axios";
import { Sparkles, Copy, Check, File, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

const SupportAssistant = () => {
  const { getToken } = useAuth();
  const [question, setQuestion] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [copied, setCopied] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [sourceCount, setSourceCount] = useState(0);
  const [usedRag, setUsedRag] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf" || file.type === "text/plain") {
        setUploadedFile(file);
        toast.success(`File selected: ${file.name}`);
      } else {
        toast.error("Only PDF and TXT files are supported");
      }
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      setLoading(true);
      setResponse("");

      const token = await getToken();
      const formData = new FormData();

      if (uploadedFile) {
        formData.append("document", uploadedFile);
      }
      formData.append("question", question);
      formData.append("temperature", temperature);

      const res = await axios.post(
        `${API_BASE_URL}/api/support/ask`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setResponse(res.data.response);
        setUsedRag(Boolean(res.data.used_rag));
        setSourceCount(res.data.sources?.length || 0);

        if (res.data.document_indexed) {
          toast.success(
            `Document indexed (${res.data.document_indexed} chunks) — future questions will search it automatically`
          );
          // No need to keep resending the same file; it now lives in the
          // knowledge base and will be retrieved for future questions.
          setUploadedFile(null);
        } else if (res.data.document_already_indexed) {
          toast.success("This document is already indexed");
          setUploadedFile(null);
        } else {
          toast.success("Response generated successfully!");
        }
      } else {
        toast.error(res.data.message || "Failed to get response");
      }
    } catch (error) {
      console.error("Support assistant error:", error);
      toast.error(error.response?.data?.message || "Failed to process question");
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

  const clearFile = () => {
    setUploadedFile(null);
    toast.success("File cleared");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-indigo-600" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">Support Assistant</h2>
        </div>

        {/* Document Upload Section */}
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <File size={20} className="text-orange-600" />
            <span className="font-medium text-gray-700">
              Upload Document (PDF or TXT) - Optional
            </span>
          </label>
          <div className="space-y-3">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              className="block w-full text-sm border border-gray-300 rounded-lg p-2"
            />
            {uploadedFile && (
              <div className="flex items-center justify-between bg-orange-100 p-3 rounded-lg">
                <span className="text-sm font-medium text-orange-800">
                  📄 {uploadedFile.name}
                </span>
                <button
                  onClick={clearFile}
                  className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                >
                  Clear
                </button>
              </div>
            )}
            <p className="text-xs text-gray-600">
              Upload a PDF or text file — it's chunked, embedded, and indexed into your
              personal knowledge base, so you can keep asking follow-up questions about
              it (or any previously uploaded document) without re-uploading.
            </p>
          </div>
        </div>

        {/* Question Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ask a Question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything... (e.g., 'What are the main topics?' or 'Summarize the document')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows="5"
          />
        </div>

        {/* Temperature Control */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Response Style: {temperature.toFixed(1)}
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
            Lower = precise & focused | Higher = creative & detailed
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAsk}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition font-medium flex items-center justify-center gap-2"
        >
          <Sparkles size={20} />
          {loading ? "Thinking..." : "Get Answer"}
        </button>

        {/* Response Display */}
        {response && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Response</h3>
                {usedRag && (
                  <p className="text-xs text-indigo-600 mt-1">
                    Grounded in {sourceCount} matching excerpt{sourceCount === 1 ? "" : "s"}{" "}
                    from your knowledge base
                  </p>
                )}
              </div>
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

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {response}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportAssistant;
