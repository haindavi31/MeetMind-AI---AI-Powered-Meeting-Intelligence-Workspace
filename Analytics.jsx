
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  FileText,
  CheckCircle2,
  ListChecks,
} from "lucide-react";

function Analytics() {
  const { meetingId } = useParams();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            data?.detail || "Unable to load meeting."
          );
        }

        console.log("ANALYTICS MEETING DATA:", data);

        setMeeting(data);
      } catch (err) {
        console.error("Failed to load meeting:", err);

        setError(
          err?.message || "Unable to load meeting."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [meetingId]);

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-300">
            Loading Analytics...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (!meeting) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <FileText
              size={26}
              className="text-red-400"
            />
          </div>

          <h1 className="text-2xl font-semibold mb-3">
            Meeting not found
          </h1>

          <p className="text-red-300 mb-6">
            {error || "Unable to load meeting data."}
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // SAFE DATA NORMALIZATION
  //
  // Backend may return:
  //
  // summary: "text"
  //
  // OR:
  //
  // summary: {
  //   summary: "text",
  //   key_points: [],
  //   action_items: []
  // }
  //
  // We normalize both formats here.
  // ---------------------------------------------------------

  const transcript =
    typeof meeting.transcript === "string"
      ? meeting.transcript
      : "";

  let summary = "";

  if (typeof meeting.summary === "string") {
    summary = meeting.summary;
  } else if (
    meeting.summary &&
    typeof meeting.summary === "object" &&
    typeof meeting.summary.summary === "string"
  ) {
    summary = meeting.summary.summary;
  }

  let keyPoints = [];

  if (Array.isArray(meeting.key_points)) {
    keyPoints = meeting.key_points;
  } else if (
    meeting.summary &&
    typeof meeting.summary === "object" &&
    Array.isArray(meeting.summary.key_points)
  ) {
    keyPoints = meeting.summary.key_points;
  }

  let actionItems = [];

  if (Array.isArray(meeting.action_items)) {
    actionItems = meeting.action_items;
  } else if (
    meeting.summary &&
    typeof meeting.summary === "object" &&
    Array.isArray(meeting.summary.action_items)
  ) {
    actionItems = meeting.summary.action_items;
  }

  // ---------------------------------------------------------
  // TEXT METRICS
  // ---------------------------------------------------------

  const transcriptWords = transcript
    .split(/\s+/)
    .filter(Boolean).length;

  const transcriptCharacters = transcript.length;

  const transcriptSentences = transcript
    .split(/[.!?]+/)
    .filter((sentence) => sentence.trim().length > 0)
    .length;

  const estimatedMinutes =
    transcriptWords > 0
      ? Math.max(1, Math.round(transcriptWords / 130))
      : 0;

  const summaryWords = summary
    .split(/\s+/)
    .filter(Boolean).length;

  const keyPointsCount = keyPoints.length;

  const actionItemsCount = actionItems.length;

  const analysisScore = Math.min(
    100,
    50 +
      keyPointsCount * 5 +
      actionItemsCount * 5
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* -------------------------------------------------
            BACK BUTTON
        ------------------------------------------------- */}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft size={18} />

          Back to Dashboard
        </Link>

        {/* -------------------------------------------------
            HEADER
        ------------------------------------------------- */}

        <div className="mb-10">
          <p className="text-purple-400 text-sm mb-2">
            MEETING ANALYTICS
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Analytics Dashboard
          </h1>

          <p className="text-gray-400">
            Insights generated from this meeting.
          </p>

          <p className="text-gray-500 mt-2 break-all">
            {meeting.filename || "Meeting"}
          </p>
        </div>

        {/* -------------------------------------------------
            TOP STATS
        ------------------------------------------------- */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

          <Card
            icon={<FileText size={20} />}
            title="Transcript Words"
            value={transcriptWords}
          />

          <Card
            icon={<BarChart3 size={20} />}
            title="Summary Words"
            value={summaryWords}
          />

          <Card
            icon={<ListChecks size={20} />}
            title="Action Items"
            value={actionItemsCount}
          />

          <Card
            icon={<CheckCircle2 size={20} />}
            title="Key Points"
            value={keyPointsCount}
          />

        </div>

        {/* -------------------------------------------------
            TRANSCRIPT METRICS + MEETING INSIGHTS
        ------------------------------------------------- */}

        <div className="grid lg:grid-cols-2 gap-6 mb-8">

          {/* Transcript Metrics */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

            <h2 className="text-2xl font-semibold mb-6">
              Transcript Metrics
            </h2>

            <div className="space-y-4">

              <Metric
                label="Words"
                value={transcriptWords}
              />

              <Metric
                label="Sentences"
                value={transcriptSentences}
              />

              <Metric
                label="Characters"
                value={transcriptCharacters}
              />

              <Metric
                label="Estimated Minutes"
                value={estimatedMinutes}
              />

            </div>
          </div>

          {/* Meeting Insights */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

            <h2 className="text-2xl font-semibold mb-6">
              Meeting Insights
            </h2>

            <div className="space-y-4">

              <Metric
                label="Analysis Score"
                value={`${analysisScore}%`}
              />

              <Metric
                label="Language"
                value={
                  meeting.language
                    ? String(meeting.language).toUpperCase()
                    : "Unknown"
                }
              />

              <Metric
                label="Status"
                value={
                  meeting.status
                    ? String(meeting.status)
                    : "Analyzed"
                }
              />

              <Metric
                label="Meeting ID"
                value={
                  meeting.meeting_id || meetingId
                }
              />

            </div>
          </div>

        </div>

        {/* -------------------------------------------------
            SUMMARY INSIGHT
        ------------------------------------------------- */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 mb-8">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FileText size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold">
                Summary Insight
              </h2>

              <p className="text-sm text-gray-500">
                AI-generated meeting summary
              </p>
            </div>

          </div>

          <p className="text-gray-300 leading-8 whitespace-pre-line">
            {summary || "No summary available."}
          </p>

        </div>

        {/* -------------------------------------------------
            KEY POINTS
        ------------------------------------------------- */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 mb-8">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-11 h-11 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
              <BarChart3 size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold">
                Key Points
              </h2>

              <p className="text-sm text-gray-500">
                Important information from the meeting
              </p>
            </div>

          </div>

          {keyPoints.length > 0 ? (
            <div className="space-y-3">

              {keyPoints.map((point, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.03] flex gap-3"
                >

                  <span className="text-purple-400 font-bold shrink-0">
                    {index + 1}.
                  </span>

                  <p className="text-gray-300 leading-7">
                    {formatValue(point)}
                  </p>

                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-500">
              No key points found.
            </p>
          )}

        </div>

        {/* -------------------------------------------------
            ACTION ITEMS
        ------------------------------------------------- */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 mb-8">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-11 h-11 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
              <ListChecks size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold">
                Action Items Overview
              </h2>

              <p className="text-sm text-gray-500">
                Tasks extracted from the meeting
              </p>
            </div>

          </div>

          {actionItems.length > 0 ? (
            <div className="space-y-3">

              {actionItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.03] flex items-start gap-3"
                >

                  <CheckCircle2
                    size={20}
                    className="text-green-400 mt-0.5 shrink-0"
                  />

                  <p className="text-gray-300 leading-7">
                    <span className="font-semibold mr-2">
                      {index + 1}.
                    </span>

                    {formatValue(item)}
                  </p>

                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-500">
              No action items found.
            </p>
          )}

        </div>

        {/* -------------------------------------------------
            TRANSCRIPT
        ------------------------------------------------- */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 mb-10">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FileText size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold">
                Transcript
              </h2>

              <p className="text-sm text-gray-500">
                Complete meeting transcription
              </p>
            </div>

          </div>

          <div className="max-h-[500px] overflow-y-auto rounded-2xl bg-black/20 border border-white/5 p-6">

            <p className="text-gray-300 leading-8 whitespace-pre-line">
              {transcript || "No transcript available."}
            </p>

          </div>

        </div>

        {/* -------------------------------------------------
            BOTTOM BUTTON
        ------------------------------------------------- */}

        <div className="flex justify-center pb-10">

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition"
          >
            <ArrowLeft size={18} />

            Back to Dashboard
          </Link>

        </div>

      </main>
    </div>
  );
}

// =========================================================
// CARD COMPONENT
// =========================================================

function Card({ icon, title, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

      <div className="text-purple-400 mb-3">
        {icon}
      </div>

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}

// =========================================================
// METRIC COMPONENT
// =========================================================

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-b-0">

      <span className="text-gray-400">
        {label}
      </span>

      <span className="font-semibold text-right break-all">
        {value}
      </span>

    </div>
  );
}

// =========================================================
// SAFE VALUE FORMATTER
// =========================================================

function formatValue(value) {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (value === null || value === undefined) {
    return "";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default Analytics;
