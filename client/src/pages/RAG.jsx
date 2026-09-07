import { useState } from "react";
import { Database, Sparkles } from "lucide-react";
import KnowledgeBaseManager from "../components/KnowledgeBaseManager";
import RAGGenerator from "../components/RAGGenerator";

const RAG = () => {
  const [tab, setTab] = useState("generate");

  return (
    <div className="h-full overflow-y-scroll p-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab("generate")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === "generate"
              ? "bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Sparkles size={16} />
          Generate
        </button>
        <button
          onClick={() => setTab("manage")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === "manage"
              ? "bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Database size={16} />
          Knowledge Bases
        </button>
      </div>

      {tab === "generate" ? <RAGGenerator /> : <KnowledgeBaseManager />}
    </div>
  );
};

export default RAG;
