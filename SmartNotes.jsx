import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

function SmartNotes() {
  const { meetingId } = useParams();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeeting();
  }, [meetingId]);

  const loadMeeting = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/meetings/${meetingId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail);
      }

      setMeeting(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Smart Notes...
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Meeting not found
      </div>
    );
  }

  // ============================================
  // HANDLE BOTH OLD + NEW BACKEND STRUCTURES
  // ============================================

  const summaryText =
    typeof meeting?.summary === "object"
      ? meeting.summary?.summary || ""
      : meeting?.summary || "";

  const keyPoints =
    meeting?.summary?.key_points ||
    meeting?.key_points ||
    [];

  const actionItems =
    meeting?.summary?.action_items ||
    meeting?.action_items ||
    [];

  const summaryWordCount =
    summaryText
      .split(" ")
      .filter(Boolean).length;

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
            SMART NOTES
          </p>

          <h1 className="text-4xl font-bold mb-3">
            AI Meeting Notes
          </h1>

          <p className="text-gray-400">
            Organized notes automatically generated from
            your meeting.
          </p>
        </div>

        {/* Meeting */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Meeting
          </h2>

          <p className="text-gray-300">
            {meeting.filename}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="text-purple-400" />

            <h2 className="text-2xl font-semibold">
              Executive Summary
            </h2>
          </div>

          <p className="text-gray-300 leading-8 whitespace-pre-line">
            {summaryText || "No summary available."}
          </p>
        </div>

        {/* Key Points */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <Lightbulb className="text-yellow-400" />

            <h2 className="text-2xl font-semibold">
              Key Takeaways
            </h2>
          </div>

          {Array.isArray(keyPoints) &&
          keyPoints.length > 0 ? (
            <div className="space-y-3">
              {keyPoints.map(
                (point, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-4 rounded-xl bg-white/[0.03]"
                  >
                    <div className="text-purple-400 font-bold">
                      {index + 1}.
                    </div>

                    <p className="text-gray-300">
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
              No key points available.
            </p>
          )}
        </div>

        {/* Action Items */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <CheckCircle2 className="text-green-400" />

            <h2 className="text-2xl font-semibold">
              Tasks & Follow-ups
            </h2>
          </div>

          {Array.isArray(actionItems) &&
          actionItems.length > 0 ? (
            <div className="space-y-3">
              {actionItems.map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-4 rounded-xl bg-white/[0.03]"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-green-400 mt-1"
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
              No action items found.
            </p>
          )}
        </div>

        {/* Notes Overview */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div className="flex items-center gap-3 mb-5">
            <FileText className="text-blue-400" />

            <h2 className="text-2xl font-semibold">
              Notes Overview
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.03]">
              <p className="text-gray-500 text-sm">
                Summary Length
              </p>

              <p className="text-3xl font-bold mt-2">
                {summaryWordCount}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03]">
              <p className="text-gray-500 text-sm">
                Key Points
              </p>

              <p className="text-3xl font-bold mt-2">
                {keyPoints.length}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03]">
              <p className="text-gray-500 text-sm">
                Action Items
              </p>

              <p className="text-3xl font-bold mt-2">
                {actionItems.length}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SmartNotes;