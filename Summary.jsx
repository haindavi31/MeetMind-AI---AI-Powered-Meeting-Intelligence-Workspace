import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  FileText,
  ListChecks,
  Lightbulb,
  MessageSquare,
  Languages,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Trash2,
  MessageCircle,
} from "lucide-react";

function Summary() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // =========================================================
  // LOAD MEETING
  // =========================================================

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:8000/meetings/${meetingId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load meeting."
          );
        }
        console.log("MEETING DATA:", data);
        setMeeting(data);
      } catch (err) {
        console.error("Failed to load meeting:", err);

        setError(
          err.message || "Unable to load meeting."
        );
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      loadMeeting();
    } else {
      setError("Meeting ID is missing.");
      setLoading(false);
    }
  }, [meetingId]);

  // =========================================================
  // DELETE MEETING
  // =========================================================

  const handleDeleteMeeting = async () => {
    if (!meetingId || deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this meeting?\n\n" +
        "This will permanently delete the uploaded file, " +
        "transcript, summary, key points, and action items."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/meetings/${meetingId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to delete meeting."
        );
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Failed to delete meeting:",
        err
      );

      setError(
        err.message || "Unable to delete meeting."
      );

      setDeleting(false);
    }
  };

  // =========================================================
  // CHAT WITH MEETING
  // =========================================================

  const handleChat = () => {
    if (!meetingId) {
      return;
    }

    navigate(`/chat/${meetingId}`);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span>
            Loading meeting analysis...
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !meeting) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">

          <AlertCircle
            size={40}
            className="text-red-400 mx-auto mb-4"
          />

          <h1 className="text-2xl font-semibold mb-3">
            Unable to load meeting
          </h1>

          <p className="text-red-300 mb-6">
            {error || "Meeting data was not found."}
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold hover:scale-105 transition"
          >
            <ArrowLeft size={18} />

            Back to Dashboard
          </Link>

        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================
   const summaryText =
     typeof meeting?.summary === "object"
       ? meeting?.summary?.summary || ""
       : meeting?.summary || "";

    const keyPoints =
      meeting?.summary?.key_points ||
      meeting?.key_points ||
      [];

    const actionItems =
      meeting?.summary?.action_items ||
      meeting?.action_items ||
      [];
    return (
    <div className="min-h-screen bg-black text-white">

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">

          <div className="flex items-center justify-between gap-4">

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft size={18} />

              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={handleChat}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition"
              >
                <MessageCircle size={17} />

                Chat With Meeting
              </button>

              <button
                type="button"
                onClick={handleDeleteMeeting}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />

                    Delete
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && meeting && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3 text-red-300">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>

          </div>
        )}

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-10">

          <p className="text-purple-400 text-sm mb-2">
            AI MEETING INTELLIGENCE
          </p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="min-w-0">

              <h1 className="text-4xl md:text-5xl font-bold">
                Meeting Summary
              </h1>

              <p className="text-gray-400 mt-3">
                Your meeting has been analyzed successfully
                by MeetMind AI.
              </p>

              <p className="text-sm text-gray-500 mt-2 break-all">
                {meeting?.filename || "Meeting"}
              </p>

            </div>

            <div className="flex items-center gap-2 text-green-400 text-sm shrink-0">

              <CheckCircle2 size={18} />

              Analysis completed

            </div>

          </div>

        </div>

        {/* ===================================================
            MEETING INFO
        =================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <InfoCard
            icon={<Languages size={20} />}
            label="Language"
            value={
              meeting?.language
                ? meeting.language.toUpperCase()
                : "Unknown"
            }
          />

          <InfoCard
            icon={<CheckCircle2 size={20} />}
            label="Status"
            value={
              meeting?.status || "Analyzed"
            }
          />

          <InfoCard
            icon={<FileText size={20} />}
            label="Meeting ID"
            value={
              meeting?.meeting_id || "N/A"
            }
          />

        </div>

        {/* ===================================================
            AI SUMMARY
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FileText size={22} />
            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                AI Summary
              </h2>

              <p className="text-sm text-gray-500">
                Generated from your meeting
              </p>

            </div>

          </div>
          <p className="text-gray-300 leading-8 whitespace-pre-line">
            {summaryText || "No summary was generated."}
          </p>
          
           
          

        </section>

        {/* ===================================================
            KEY POINTS
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 mb-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Lightbulb size={22} />
            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                Key Points
              </h2>

              <p className="text-sm text-gray-500">
                Important information identified by AI
              </p>

            </div>

          </div>

          {Array.isArray(keyPoints) &&
          keyPoints.length > 0 ? (

            <div className="space-y-4">

              {keyPoints.map(
                (point, index) => (

                  <div
                    key={index}
                    className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5"
                  >

                    <div className="w-8 h-8 shrink-0 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>

                    <p className="text-gray-300 leading-7">
                      {typeof point === "string"
                        ? point
                        : JSON.stringify(point)}
                    </p>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="text-gray-500">
              No key points were identified.
            </p>

          )}

        </section>

        {/* ===================================================
            ACTION ITEMS
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 mb-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
              <ListChecks size={22} />
            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                Action Items
              </h2>

              <p className="text-sm text-gray-500">
                Tasks extracted from the meeting
              </p>

            </div>

          </div>

          {Array.isArray(actionItems) &&
          actionItems.length > 0 ? (

            <div className="space-y-3">

              {actionItems.map(
                (item, index) => (

                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5"
                  >

                    <CheckCircle2
                      size={20}
                      className="text-green-400 mt-0.5 shrink-0"
                    />

                    <p className="text-gray-300">
                      {typeof item === "string"
                        ? item
                        : JSON.stringify(item)}
                    </p>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="text-gray-500">
              No action items were identified in this meeting.
            </p>

          )}

        </section>

        {/* ===================================================
            FULL TRANSCRIPT
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 mb-10">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <MessageSquare size={22} />
            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                Full Transcript
              </h2>

              <p className="text-sm text-gray-500">
                Complete transcription of the meeting
              </p>

            </div>

          </div>

          <div className="max-h-[600px] overflow-y-auto rounded-2xl bg-black/20 border border-white/5 p-6">

            <p className="text-gray-300 leading-8 whitespace-pre-line">
              {meeting?.transcript ||
                "No transcript available."}
            </p>

          </div>

        </section>

        {/* ===================================================
            BOTTOM ACTIONS
        =================================================== */}

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pb-12">

          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 font-semibold hover:bg-white/[0.07] transition inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />

            Back to Workspace
          </Link>

          <button
            type="button"
            onClick={handleChat}
            className="px-6 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-400 transition inline-flex items-center gap-2"
          >
            <MessageCircle size={18} />

            Chat With Meeting
          </button>

          <button
            type="button"
            onClick={handleDeleteMeeting}
            disabled={deleting}
            className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />

                Delete Meeting
              </>
            )}
          </button>

        </div>

      </main>

    </div>
  );
}

// =========================================================
// INFO CARD
// =========================================================

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex items-center gap-3 mb-3 text-purple-400">

        {icon}

        <span className="text-sm text-gray-500">
          {label}
        </span>

      </div>

      <p className="font-semibold break-all">
        {value}
      </p>

    </div>
  );
}

export default Summary;