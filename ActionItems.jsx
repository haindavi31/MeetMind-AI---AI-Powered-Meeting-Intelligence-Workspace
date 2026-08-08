import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ListChecks,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";

function ActionItems() {
  const { meetingId } = useParams();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD MEETING
  // =========================================================

  useEffect(() => {
    const loadMeeting = async () => {
      if (!meetingId) {
        setError("Meeting ID is missing.");
        setLoading(false);
        return;
      }

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

        setMeeting(data);
      } catch (err) {
        console.error("Failed to load action items:", err);

        setError(
          err.message || "Unable to load meeting."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [meetingId]);

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

          <span>Loading action items...</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-lg text-center">

          <AlertCircle
            size={44}
            className="text-red-400 mx-auto mb-5"
          />

          <h1 className="text-2xl font-semibold mb-3">
            Unable to load action items
          </h1>

          <p className="text-red-300 mb-7">
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
  // ACTION ITEMS
  // =========================================================

  const actionItems = Array.isArray(meeting.action_items)
    ? meeting.action_items
    : [];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-5">

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ===================================================
            TITLE
        =================================================== */}

        <section className="mb-10">

          <p className="text-purple-400 text-sm mb-2">
            MEETING INTELLIGENCE
          </p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <h1 className="text-4xl md:text-5xl font-bold">
                Action Items
              </h1>

              <p className="text-gray-400 mt-3 max-w-2xl">
                Tasks and follow-ups identified from this
                meeting.
              </p>

              <p className="text-sm text-gray-500 mt-3 break-all">
                {meeting.filename}
              </p>

            </div>

            <div className="w-14 h-14 shrink-0 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center">
              <ListChecks size={28} />
            </div>

          </div>

        </section>

        {/* ===================================================
            MEETING INFO
        =================================================== */}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <InfoCard
            icon={<FileText size={19} />}
            label="Meeting"
            value={meeting.filename || "Unknown"}
          />

          <InfoCard
            icon={<CheckCircle2 size={19} />}
            label="Status"
            value={meeting.status || "Unknown"}
          />

          <InfoCard
            icon={<ListChecks size={19} />}
            label="Action Items"
            value={actionItems.length}
          />

        </section>

        {/* ===================================================
            ACTION ITEMS CARD
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">

          <div className="flex items-center gap-3 mb-7">

            <div className="w-11 h-11 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
              <ListChecks size={22} />
            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                Tasks From This Meeting
              </h2>

              <p className="text-sm text-gray-500">
                Actionable tasks extracted from the transcript
              </p>

            </div>

          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {actionItems.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-10 text-center">

              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-500/10 text-gray-400 flex items-center justify-center mb-4">
                <ListChecks size={25} />
              </div>

              <h3 className="text-xl font-semibold">
                No action items found
              </h3>

              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                No actionable tasks were identified in this
                meeting.
              </p>

            </div>
          )}

          {/* =================================================
              ACTION ITEM LIST
          ================================================= */}

          {actionItems.length > 0 && (
            <div className="space-y-4">

              {actionItems.map((item, index) => {

                const text =
                  typeof item === "string"
                    ? item
                    : item?.task ||
                      item?.action ||
                      item?.description ||
                      JSON.stringify(item);

                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition"
                  >

                    <div className="flex items-start gap-4">

                      <div className="w-10 h-10 shrink-0 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex items-start gap-3">

                          <CheckCircle2
                            size={20}
                            className="text-green-400 mt-1 shrink-0"
                          />

                          <p className="text-gray-200 leading-7">
                            {text}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

        {/* ===================================================
            BOTTOM NAVIGATION
        =================================================== */}

        <div className="flex flex-col sm:flex-row justify-center gap-4 py-10">

          <Link
            to={`/summary/${meetingId}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 font-semibold hover:bg-white/[0.07] transition"
          >
            <FileText size={18} />
            View Meeting Summary
          </Link>

          <Link
            to={`/chat/${meetingId}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:scale-105 transition"
          >
            Chat With Meeting
          </Link>

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

      <div className="flex items-center gap-3 text-purple-400 mb-3">
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

export default ActionItems;