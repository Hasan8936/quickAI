import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileUp, Plus, Trash2, Search, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

const KnowledgeBaseManager = () => {
  const { getToken } = useAuth();
  const [kbs, setKbs] = useState([]);
  const [newKbName, setNewKbName] = useState("");
  const [newKbDesc, setNewKbDesc] = useState("");
  const [selectedKb, setSelectedKb] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Load knowledge bases on mount
  useEffect(() => {
    fetchKnowledgeBases();
  }, [getToken]);

  const fetchKnowledgeBases = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${API_BASE_URL}/api/rag/kb`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setKbs(response.data.knowledge_bases);
      }
    } catch (error) {
      toast.error("Failed to load knowledge bases");
      console.error("KB fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createKnowledgeBase = async (e) => {
    e.preventDefault();
    if (!newKbName.trim()) {
      toast.error("Knowledge base name is required");
      return;
    }

    try {
      const token = await getToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/rag/kb`,
        {
          name: newKbName,
          description: newKbDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Knowledge base created!");
        setNewKbName("");
        setNewKbDesc("");
        fetchKnowledgeBases();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create KB");
    }
  };

  const selectKnowledgeBase = async (kb) => {
    setSelectedKb(kb);
    // TODO: Fetch documents for this KB
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }

    if (!selectedKb) {
      toast.error("Please select a knowledge base first");
      return;
    }

    try {
      setUploading(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append("document", uploadFile);
      formData.append("kb_id", selectedKb.id);

      const response = await axios.post(
        `${API_BASE_URL}/api/rag/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(
          `Document uploaded! Created ${response.data.chunks_created} chunks`
        );
        setUploadFile(null);
        // Reset file input
        document.getElementById("doc-upload").value = "";
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    if (!selectedKb) {
      toast.error("Please select a knowledge base first");
      return;
    }

    try {
      setSearching(true);
      const token = await getToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/rag/search`,
        {
          kb_id: selectedKb.id,
          query: searchQuery,
          top_k: 5,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSearchResults(response.data.results);
        if (response.data.results.length === 0) {
          toast.success("No results found");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - KB List & Creation */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Create Knowledge Base</h3>
            <form onSubmit={createKnowledgeBase} className="space-y-3">
              <input
                type="text"
                placeholder="KB Name"
                value={newKbName}
                onChange={(e) => setNewKbName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={newKbDesc}
                onChange={(e) => setNewKbDesc(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Create KB
              </button>
            </form>
          </div>

          {/* KB List */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Your Knowledge Bases</h3>
            {loading ? (
              <div className="flex justify-center">
                <Loader size={24} className="animate-spin" />
              </div>
            ) : kbs.length === 0 ? (
              <p className="text-gray-500 text-sm">No knowledge bases yet</p>
            ) : (
              <div className="space-y-2">
                {kbs.map((kb) => (
                  <button
                    key={kb.id}
                    onClick={() => selectKnowledgeBase(kb)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedKb?.id === kb.id
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "bg-gray-100 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    <p className="font-medium text-sm">{kb.name}</p>
                    <p className="text-xs text-gray-600">{kb.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Document Management & Search */}
        <div className="lg:col-span-2 space-y-4">
          {selectedKb && (
            <>
              {/* Upload Section */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
                <form onSubmit={handleFileUpload} className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      id="doc-upload"
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="doc-upload" className="cursor-pointer">
                      <FileUp size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploadFile
                          ? uploadFile.name
                          : "Drag or click to upload PDF/TXT"}
                      </p>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                  >
                    {uploading ? "Uploading..." : "Upload Document"}
                  </button>
                </form>
              </div>

              {/* Search Section */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">Search Documents</h3>
                <form onSubmit={handleSearch} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search knowledge base..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    <Search size={18} />
                    {searching ? "Searching..." : "Search"}
                  </button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">
                      Found {searchResults.length} results:
                    </p>
                    {searchResults.map((result, idx) => (
                      <div
                        key={result.id}
                        className="bg-gray-50 p-3 rounded-lg text-sm border-l-4 border-purple-500"
                      >
                        <p className="font-medium">Result {idx + 1}</p>
                        <p className="text-gray-700 line-clamp-3">
                          {result.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Score: {(result.score * 100).toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {!selectedKb && (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600">
                Select a knowledge base to manage documents and search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;
