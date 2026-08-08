import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  FileText,
  Sparkles,
} from "lucide-react";

function KnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/meetings/"
      );

      const meetings = await response.json();

      const matches = meetings.filter((meeting) => {
        const text = `
          ${meeting.filename || ""}
          ${meeting.summary || ""}
          ${(meeting.key_points || []).join(" ")}
          ${(meeting.action_items || []).join(" ")}
        `.toLowerCase();

        return text.includes(query.toLowerCase());
      });

      setResults(matches);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto px-6 py-10">

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="mb-10">
          <p className="text-purple-400 text-sm mb-2">
            KNOWLEDGE SEARCH
          </p>

          <h1 className="text-4xl font-bold mb-3">
            Search Across Meetings
          </h1>

          <p className="text-gray-400">
            Find information from all your meetings instantly.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 mb-8">

          <div className="flex gap-3">

            <input
              type="text"
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search meetings..."
              className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none"
            />

            <button
              onClick={handleSearch}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>

          </div>

        </div>

        {loading && (
          <div className="text-center text-gray-400">
            Searching...
          </div>
        )}

        {!loading &&
          results.length > 0 && (
            <div className="space-y-4">

              {results.map((meeting) => (
                <div
                  key={meeting.meeting_id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FileText
                      size={20}
                      className="text-purple-400"
                    />

                    <h3 className="font-semibold">
                      {meeting.filename}
                    </h3>
                  </div>

                  <p className="text-gray-400 mb-4 line-clamp-3">
                    {meeting.summary}
                  </p>

                  <Link
                    to={`/summary/${meeting.meeting_id}`}
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
                  >
                    <Sparkles size={16} />
                    View Meeting
                  </Link>
                </div>
              ))}
            </div>
          )}

        {!loading &&
          query &&
          results.length === 0 && (
            <div className="text-center text-gray-500">
              No matching meetings found.
            </div>
          )}

      </main>
    </div>
  );
}

export default KnowledgeSearch;