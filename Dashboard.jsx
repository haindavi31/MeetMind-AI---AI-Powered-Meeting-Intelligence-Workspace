import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  CalendarDays,
  FileText,
  Mic,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  Sparkles,
  Loader2,
  AlertCircle,
  Eye,
  Trash2,
  Search,
  ListChecks,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [meetingsError, setMeetingsError] = useState("");
  const [deletingMeetingId, setDeletingMeetingId] = useState("");

  // Selected meeting for Meeting Intelligence
  const [selectedMeetingId, setSelectedMeetingId] = useState("");

  // =========================================================
  // UPLOAD MEETING
  // =========================================================

  const handleUploadMeeting = () => {
    navigate("/upload-meeting");
  };

  // =========================================================
  // LOAD MEETINGS
  // =========================================================

  const loadMeetings = async () => {
    try {
      setLoadingMeetings(true);
      setMeetingsError("");

      const response = await fetch(
        "http://127.0.0.1:8000/meetings/"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load meetings."
        );
      }

      setMeetings(data);

      // -------------------------------------------------------
      // Automatically select the first analyzed meeting ONLY
      // when there is no current selection.
      // -------------------------------------------------------

      const analyzedMeetings = data.filter(
        (meeting) => meeting.status === "analyzed"
      );

      if (
        analyzedMeetings.length > 0 &&
        !selectedMeetingId
      ) {
        setSelectedMeetingId(
          analyzedMeetings[0].meeting_id
        );
      }
    } catch (error) {
      console.error(
        "Load meetings error:",
        error
      );

      setMeetingsError(
        error.message ||
          "Unable to load meetings."
      );
    } finally {
      setLoadingMeetings(false);
    }
  };

  // =========================================================
  // DELETE MEETING
  // =========================================================

  const handleDeleteMeeting = async (meeting) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${meeting.filename}"?\n\nThis will permanently delete the uploaded file, transcript, summary, key points, and action items.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingMeetingId(
        meeting.meeting_id
      );

      setMeetingsError("");

      const response = await fetch(
        `http://127.0.0.1:8000/meetings/${meeting.meeting_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to delete meeting."
        );
      }

      // Remove meeting from frontend
      setMeetings((currentMeetings) =>
        currentMeetings.filter(
          (item) =>
            item.meeting_id !==
            meeting.meeting_id
        )
      );

      // If deleted meeting was selected,
      // select another analyzed meeting.
      if (
        selectedMeetingId ===
        meeting.meeting_id
      ) {
        const remainingAnalyzedMeetings =
          meetings.filter(
            (item) =>
              item.meeting_id !==
                meeting.meeting_id &&
              item.status === "analyzed"
          );

        if (
          remainingAnalyzedMeetings.length > 0
        ) {
          setSelectedMeetingId(
            remainingAnalyzedMeetings[0]
              .meeting_id
          );
        } else {
          setSelectedMeetingId("");
        }
      }
    } catch (error) {
      console.error(
        "Delete meeting error:",
        error
      );

      setMeetingsError(
        error.message ||
          "Unable to delete meeting."
      );
    } finally {
      setDeletingMeetingId("");
    }
  };

  // =========================================================
  // GET SELECTED MEETING
  // =========================================================

  const selectedMeeting = meetings.find(
    (meeting) =>
      meeting.meeting_id ===
      selectedMeetingId
  );

  // =========================================================
  // FEATURE CLICK HANDLER
  // =========================================================

  const handleFeatureClick = (feature) => {
    // -------------------------------------------------------
    // No meeting selected
    // -------------------------------------------------------

    if (!selectedMeetingId) {
      window.alert(
        "Please select an analyzed meeting first."
      );

      return;
    }

    // -------------------------------------------------------
    // Selected meeting must be analyzed
    // -------------------------------------------------------

    if (
      !selectedMeeting ||
      selectedMeeting.status !==
        "analyzed"
    ) {
      window.alert(
        "Please select an analyzed meeting."
      );

      return;
    }

    const meetingId =
      selectedMeeting.meeting_id;

    // -------------------------------------------------------
    // AI MEETING SUMMARY
    // -------------------------------------------------------

    if (feature === "summary") {
      navigate(
        `/summary/${meetingId}`
      );

      return;
    }

    // -------------------------------------------------------
    // ACTION ITEMS
    // -------------------------------------------------------

    if (feature === "actions") {
      navigate(
        `/action-items/${meetingId}`
      );

      return;
    }

    // -------------------------------------------------------
    // CHAT WITH MEETING
    // -------------------------------------------------------

    if (feature === "chat") {
      navigate(
        `/chat/${meetingId}`
      );

      return;
    }

    // -------------------------------------------------------
    // MEETING ANALYTICS
    // -------------------------------------------------------

    if (feature === "analytics") {
      navigate(
        `/analytics/${meetingId}`
      );

      return;
    }

    // -------------------------------------------------------
    // SMART NOTES
    // -------------------------------------------------------

    if (feature === "notes") {
      navigate(
        `/notes/${meetingId}`
      );

      return;
    }

    // -------------------------------------------------------
    // KNOWLEDGE SEARCH
    // -------------------------------------------------------

    if (feature === "search") {
      navigate(
        `/knowledge-search`
      );

      return;
    }
  };

  // =========================================================
  // LOAD MEETINGS ON PAGE LOAD
  // =========================================================

  useEffect(() => {
    loadMeetings();
  }, []);

  // =========================================================
  // MEETING COUNTS
  // =========================================================

  const analyzedMeetings =
    meetings.filter(
      (meeting) =>
        meeting.status ===
        "analyzed"
    );

  const pendingMeetings =
    meetings.filter(
      (meeting) =>
        meeting.status !==
        "analyzed"
    );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-black text-white">

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles size={20} />
            </div>

            <div>
              <h1 className="font-semibold">
                MeetMind AI
              </h1>

              <p className="text-xs text-gray-500">
                Meeting Intelligence
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right">

              <p className="text-sm font-medium">
                Haindavi
              </p>

              <p className="text-xs text-gray-500">
                AI Workspace
              </p>

            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-semibold">
              H
            </div>

          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ===================================================
            WELCOME
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-10"
        >

          <p className="text-purple-400 text-sm mb-2">
            AI MEETING WORKSPACE
          </p>

          <h2 className="text-4xl md:text-5xl font-bold">
            Welcome back, Haindavi 👋
          </h2>

          <p className="text-gray-400 mt-3 max-w-2xl">
            Turn your conversations into
            structured knowledge, decisions,
            and actionable insights.
          </p>

        </motion.div>

        {/* ===================================================
            UPLOAD MEETING
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          className="rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-transparent backdrop-blur-xl mb-10"
        >

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 mb-3">

                <Mic
                  size={20}
                  className="text-purple-400"
                />

                <span className="text-sm text-purple-300">
                  AI TRANSCRIPTION
                </span>

              </div>

              <h3 className="text-2xl font-semibold">
                Analyze your next meeting
              </h3>

              <p className="text-gray-400 mt-2">
                Upload an audio recording and
                let MeetMind AI extract the
                knowledge automatically.
              </p>

            </div>

            <button
              type="button"
              onClick={
                handleUploadMeeting
              }
              className="shrink-0 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:scale-105 transition flex items-center gap-2"
            >
              <Mic size={18} />
              Upload Meeting
            </button>

          </div>

        </motion.div>

        {/* ===================================================
            STATS
        =================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

          <StatCard
            icon={
              <CalendarDays size={20} />
            }
            title="Meetings"
            value={meetings.length}
            subtitle={
              loadingMeetings
                ? "Loading..."
                : `${meetings.length} stored`
            }
          />

          <StatCard
            icon={
              <FileText size={20} />
            }
            title="Summaries"
            value={
              analyzedMeetings.length
            }
            subtitle="Generated by AI"
          />

          <StatCard
            icon={
              <CheckCircle2
                size={20}
              />
            }
            title="Analyzed"
            value={
              analyzedMeetings.length
            }
            subtitle={
              pendingMeetings.length >
              0
                ? `${pendingMeetings.length} processing`
                : "All meetings analyzed"
            }
          />

          <StatCard
            icon={
              <Clock3 size={20} />
            }
            title="Time Saved"
            value={`${(
              analyzedMeetings.length *
              0.75
            ).toFixed(1)}h`}
            subtitle="Estimated by AI"
          />

        </div>

        {/* ===================================================
            MEETINGS
        =================================================== */}

        <section className="mb-12">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h3 className="text-2xl font-semibold">
                Your Meetings
              </h3>

              <p className="text-gray-500 mt-1">
                Meetings analyzed by
                MeetMind AI.
              </p>

            </div>

          </div>

          {/* LOADING */}

          {loadingMeetings && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 flex items-center justify-center gap-3 text-gray-400">

              <Loader2
                size={20}
                className="animate-spin"
              />

              Loading your meetings...

            </div>
          )}

          {/* ERROR */}

          {!loadingMeetings &&
            meetingsError && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 flex items-center gap-3 text-red-300">

                <AlertCircle size={20} />

                <span>
                  {meetingsError}
                </span>

              </div>
            )}

          {/* EMPTY */}

          {!loadingMeetings &&
            !meetingsError &&
            meetings.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">

                <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">

                  <Mic size={24} />

                </div>

                <h4 className="text-xl font-semibold">
                  No meetings yet
                </h4>

                <p className="text-gray-500 mt-2">
                  Upload your first meeting
                  to start building your AI
                  knowledge workspace.
                </p>

                <button
                  type="button"
                  onClick={
                    handleUploadMeeting
                  }
                  className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 font-semibold hover:scale-105 transition"
                >
                  Upload Your First Meeting
                </button>

              </div>
            )}

          {/* MEETING LIST */}

          {!loadingMeetings &&
            !meetingsError &&
            meetings.length > 0 && (
              <div className="space-y-4">

                {meetings.map(
                  (meeting) => (
                    <motion.div
                      key={
                        meeting.meeting_id
                      }
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className={`rounded-2xl border p-5 transition ${
                        selectedMeetingId ===
                        meeting.meeting_id
                          ? "border-purple-500/50 bg-purple-500/[0.06]"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                      }`}
                    >

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                        <div className="flex items-center gap-4 min-w-0">

                          <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">

                            <FileText
                              size={22}
                            />

                          </div>

                          <div className="min-w-0">

                            <h4 className="font-semibold truncate">
                              {
                                meeting.filename
                              }
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                              {meeting.language
                                ? `Language: ${meeting.language.toUpperCase()}`
                                : "Language not detected"}
                            </p>

                            <p className="text-xs text-gray-600 mt-1">
                              {meeting.created_at
                                ? new Date(
                                    meeting.created_at
                                  ).toLocaleString()
                                : "Date unavailable"}
                            </p>

                            <p className="text-xs text-gray-600 mt-1 break-all">
                              ID:{" "}
                              {
                                meeting.meeting_id
                              }
                            </p>

                          </div>

                        </div>

                        <div className="flex items-center gap-3 flex-wrap">

                          {/* STATUS */}

                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                              meeting.status ===
                              "analyzed"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            }`}
                          >
                            {meeting.status ===
                            "analyzed"
                              ? "Analyzed"
                              : meeting.status}
                          </span>

                          {/* SELECT */}

                          {meeting.status ===
                            "analyzed" && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedMeetingId(
                                  meeting.meeting_id
                                )
                              }
                              disabled={
                                deletingMeetingId ===
                                meeting.meeting_id
                              }
                              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                                selectedMeetingId ===
                                meeting.meeting_id
                                  ? "bg-purple-500 text-white"
                                  : "border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                              }`}
                            >

                              <CheckCircle2
                                size={16}
                              />

                              {selectedMeetingId ===
                              meeting.meeting_id
                                ? "Selected"
                                : "Select"}

                            </button>
                          )}

                          {/* VIEW */}

                          {meeting.status ===
                            "analyzed" && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/summary/${meeting.meeting_id}`
                                )
                              }
                              disabled={
                                deletingMeetingId ===
                                meeting.meeting_id
                              }
                              className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:scale-105 transition flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                            >

                              <Eye
                                size={16}
                              />

                              View

                            </button>
                          )}

                          {/* CHAT */}

                          {meeting.status ===
                            "analyzed" && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/chat/${meeting.meeting_id}`
                                )
                              }
                              disabled={
                                deletingMeetingId ===
                                meeting.meeting_id
                              }
                              className="px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-semibold hover:bg-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
                            >

                              <MessageSquare
                                size={16}
                              />

                              Chat

                            </button>
                          )}

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteMeeting(
                                meeting
                              )
                            }
                            disabled={
                              deletingMeetingId ===
                              meeting.meeting_id
                            }
                            className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 hover:border-red-500/50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >

                            {deletingMeetingId ===
                            meeting.meeting_id ? (
                              <>
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />

                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2
                                  size={16}
                                />

                                Delete
                              </>
                            )}

                          </button>

                        </div>

                      </div>

                    </motion.div>
                  )
                )}

              </div>
            )}

        </section>

        {/* ===================================================
            MEETING INTELLIGENCE
        =================================================== */}

        <section>

          <div className="flex items-center justify-between mb-5">

            <div>

              <h3 className="text-2xl font-semibold">
                Meeting Intelligence
              </h3>

              <p className="text-gray-500 mt-1">
                Everything you need after every
                conversation.
              </p>

            </div>

          </div>

          {/* =================================================
              MEETING SELECTOR
          ================================================= */}

          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.05] p-5 mb-6">

            <div className="flex flex-col md:flex-row md:items-center gap-4">

              <div className="flex items-center gap-3 shrink-0">

                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">

                  <ListChecks
                    size={20}
                  />

                </div>

                <div>

                  <p className="font-semibold">
                    Select a meeting
                  </p>

                  <p className="text-xs text-gray-500">
                    Choose which meeting the
                    intelligence tools should use.
                  </p>

                </div>

              </div>

              <select
                value={selectedMeetingId}
                onChange={(event) =>
                  setSelectedMeetingId(
                    event.target.value
                  )
                }
                disabled={
                  analyzedMeetings.length ===
                  0
                }
                className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-purple-500 transition"
              >

                {analyzedMeetings.length ===
                0 ? (
                  <option value="">
                    No analyzed meetings available
                  </option>
                ) : (
                  <>
                    <option value="">
                      -- Select a meeting --
                    </option>

                    {analyzedMeetings.map(
                      (meeting) => (
                        <option
                          key={
                            meeting.meeting_id
                          }
                          value={
                            meeting.meeting_id
                          }
                        >
                          {meeting.filename} —{" "}
                          {meeting.meeting_id}
                        </option>
                      )
                    )}
                  </>
                )}

              </select>

            </div>

            {/* SELECTED MEETING INFO */}

            {selectedMeeting && (
              <div className="mt-4 pt-4 border-t border-white/10">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

                  <div>

                    <p className="text-sm text-gray-400">
                      Selected meeting
                    </p>

                    <p className="font-semibold mt-1">
                      {
                        selectedMeeting.filename
                      }
                    </p>

                  </div>

                  <div className="text-left md:text-right">

                    <p className="text-xs text-gray-500">
                      Meeting ID
                    </p>

                    <p className="text-xs text-purple-300 break-all mt-1">
                      {
                        selectedMeeting.meeting_id
                      }
                    </p>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              FEATURE CARDS
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* AI SUMMARY */}

            <FeatureCard
              icon={
                <FileText />
              }
              title="AI Meeting Summary"
              description="Turn lengthy conversations into clear, structured summaries."
              onClick={() =>
                handleFeatureClick(
                  "summary"
                )
              }
              disabled={
                !selectedMeetingId
              }
            />

            {/* ACTION ITEMS */}

            <FeatureCard
              icon={
                <CheckCircle2 />
              }
              title="Action Items"
              description="Automatically identify tasks, owners, and deadlines."
              onClick={() =>
                handleFeatureClick(
                  "actions"
                )
              }
              disabled={
                !selectedMeetingId
              }
            />

            {/* CHAT */}

            <FeatureCard
              icon={
                <MessageSquare />
              }
              title="Chat With Meeting"
              description="Ask questions and get answers from your meeting."
              onClick={() =>
                handleFeatureClick(
                  "chat"
                )
              }
              disabled={
                !selectedMeetingId
              }
            />

            {/* ANALYTICS */}

            <FeatureCard
              icon={
                <BarChart3 />
              }
              title="Meeting Analytics"
              description="Understand speaker activity, productivity, and trends."
              onClick={() =>
                handleFeatureClick(
                  "analytics"
                )
              }
              disabled={
                !selectedMeetingId
              }
            />

            {/* SMART NOTES */}

            <FeatureCard
              icon={
                <Sparkles />
              }
              title="Smart Notes"
              description="Generate organized notes from important moments."
              onClick={() =>
                handleFeatureClick(
                  "notes"
                )
              }
              disabled={
                !selectedMeetingId
              }
            />

            {/* KNOWLEDGE SEARCH */}

            <FeatureCard
              icon={
                <Search />
              }
              title="Knowledge Search"
              description="Search across your previous meetings instantly."
              onClick={() =>
                handleFeatureClick(
                  "search"
                )
              }
              disabled={
                !selectedMeetingId
              }
            />

          </div>

        </section>

      </main>

    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon,
  title,
  value,
  subtitle,
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
    >

      <div className="text-purple-400 mb-3">
        {icon}
      </div>

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p className="text-3xl font-bold mt-1">
        {value}
      </p>

      <p className="text-xs text-gray-500 mt-2">
        {subtitle}
      </p>

    </motion.div>
  );
}

// =========================================================
// FEATURE CARD
// =========================================================

function FeatureCard({
  icon,
  title,
  description,
  onClick,
  disabled,
}) {
  return (
    <motion.button
      type="button"
      whileHover={
        disabled
          ? {}
          : {
              y: -5,
            }
      }
      whileTap={
        disabled
          ? {}
          : {
              scale: 0.98,
            }
      }
      onClick={onClick}
      disabled={disabled}
      className={`group w-full text-left rounded-2xl border p-6 transition ${
        disabled
          ? "border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer"
      }`}
    >

      <div className="text-purple-400 mb-4">
        {icon}
      </div>

      <h4 className="text-lg font-semibold">
        {title}
      </h4>

      <p className="text-gray-500 text-sm mt-2 leading-6">
        {description}
      </p>

      <div className="mt-5 text-sm text-purple-400 flex items-center gap-1">

        {disabled
          ? "Select a meeting first"
          : "Explore →"}

      </div>

    </motion.button>
  );
}

export default Dashboard;