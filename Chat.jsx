import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

function Chat() {
  const { meetingId } = useParams();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // ASK QUESTION
  // =========================================================

  const handleAskQuestion = async (event) => {
    event.preventDefault();

    if (!meetingId) {
      setError("Meeting ID is missing.");
      return;
    }

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");
      setSources([]);

      const response = await fetch(
        `http://127.0.0.1:8000/meetings/${meetingId}/chat`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to get an answer."
        );
      }

      setAnswer(data.answer || "No answer was returned.");

      setSources(
        Array.isArray(data.sources)
          ? data.sources
          : []
      );
    } catch (err) {
      console.error("Chat error:", err);

      setError(
        err.message || "Unable to get an answer."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CLEAR CHAT
  // =========================================================

  const handleClear = () => {
    setQuestion("");
    setAnswer("");
    setSources([]);
    setError("");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-black text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">

              <Sparkles size={20} />

            </div>

            <div>

              <h1 className="font-semibold">
                MeetMind AI
              </h1>

              <p className="text-xs text-gray-500">
                Chat With Meeting
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ===================================================
            BACK
        =================================================== */}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
        >
          <ArrowLeft size={18} />

          Back to Dashboard
        </Link>

        {/* ===================================================
            TITLE
        =================================================== */}

        <div className="mb-8">

          <p className="text-purple-400 text-sm mb-2">
            AI MEETING INTELLIGENCE
          </p>

          <h1 className="text-4xl md:text-5xl font-bold">
            Chat With Meeting
          </h1>

          <p className="text-gray-400 mt-3 max-w-2xl">
            Ask questions about this meeting and get
            answers using only the meeting transcript.
          </p>

        </div>

        {/* ===================================================
            MEETING ID
        =================================================== */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-6">

          <p className="text-xs text-gray-500 mb-1">
            MEETING ID
          </p>

          <p className="text-sm text-gray-300 break-all">
            {meetingId || "Not available"}
          </p>

        </div>

        {/* ===================================================
            QUESTION FORM
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 mb-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">

              <MessageSquare size={22} />

            </div>

            <div>

              <h2 className="text-xl font-semibold">
                Ask a question
              </h2>

              <p className="text-sm text-gray-500">
                Ask anything about the meeting.
              </p>

            </div>

          </div>

          <form onSubmit={handleAskQuestion}>

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="What were the main decisions discussed?"
              rows={5}
              disabled={loading}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white placeholder:text-gray-600 outline-none focus:border-purple-500/50 resize-none disabled:opacity-50"
            />

            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">

              <button
                type="button"
                onClick={handleClear}
                disabled={
                  loading ||
                  (!question &&
                    !answer &&
                    sources.length === 0 &&
                    !error)
                }
                className="px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.07] hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={
                  loading ||
                  !question.trim() ||
                  !meetingId
                }
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Thinking...
                  </>
                ) : (
                  <>
                    <Send size={18} />

                    Ask Meeting
                  </>
                )}

              </button>

            </div>

          </form>

        </section>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 mb-6 flex items-start gap-3 text-red-300">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>

              <p className="font-medium">
                Unable to answer
              </p>

              <p className="text-sm mt-1">
                {error}
              </p>

            </div>

          </div>

        )}

        {/* ===================================================
            ANSWER
        =================================================== */}

        {answer && (

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 mb-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">

                <Sparkles size={22} />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Answer
                </h2>

                <p className="text-sm text-gray-500">
                  Based on your meeting transcript
                </p>

              </div>

            </div>

            <div className="rounded-2xl bg-black/20 border border-white/5 p-6">

              <p className="text-gray-300 leading-8 whitespace-pre-line">
                {answer}
              </p>

            </div>

          </section>

        )}

        {/* ===================================================
            SOURCES
        =================================================== */}

        {sources.length > 0 && (

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 mb-10">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">

                <MessageSquare size={22} />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Sources
                </h2>

                <p className="text-sm text-gray-500">
                  Relevant parts of the meeting transcript
                </p>

              </div>

            </div>

            <div className="space-y-3">

              {sources.map((source, index) => (

                <div
                  key={index}
                  className="rounded-xl border border-white/5 bg-black/20 p-4"
                >

                  <div className="flex gap-3">

                    <div className="w-7 h-7 shrink-0 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>

                    <p className="text-sm text-gray-400 leading-7">
                      {source}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </section>

        )}

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {!answer &&
          !loading &&
          !error && (

            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">

                <MessageSquare size={26} />

              </div>

              <h3 className="text-xl font-semibold">
                Ask your meeting anything
              </h3>

              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Try questions about decisions, action items,
                people, deadlines, ideas, or topics discussed
                during the meeting.
              </p>

            </div>

          )}

      </main>

    </div>
  );
}

export default Chat;