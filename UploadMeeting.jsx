
import { useState } from "react";
import {
  Upload,
  FileAudio,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  uploadMeeting,
  analyzeMeeting,
} from "../../services/api";

function UploadMeeting() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [meetingId, setMeetingId] = useState("");

  // =========================================================
  // FILE SELECTION
  // =========================================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setFile(selectedFile || null);
    setStatus("");
    setError("");
    setMeetingId("");
  };

  // =========================================================
  // UPLOAD + ANALYZE
  // =========================================================

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a meeting file first.");
      return;
    }

    setLoading(true);
    setStatus("Uploading meeting...");
    setError("");
    setMeetingId("");

    try {
      // -----------------------------------------------------
      // STEP 1: Upload the meeting
      // -----------------------------------------------------

      const uploadData = await uploadMeeting(file);

      const id = uploadData.meeting_id;

      if (!id) {
        throw new Error(
          "Meeting was uploaded, but no meeting ID was returned."
        );
      }

      setMeetingId(id);

      // -----------------------------------------------------
      // STEP 2: Start AI analysis
      // -----------------------------------------------------

      setStatus("Analyzing Meeting...");

      const analysisData = await analyzeMeeting(id);

      console.log("Meeting analysis completed:", analysisData);

      // -----------------------------------------------------
      // STEP 3: Analysis completed
      // -----------------------------------------------------

      setStatus("Meeting analysis completed!");

      // -----------------------------------------------------
      // STEP 4: Open Summary using the meeting ID
      // -----------------------------------------------------

      setTimeout(() => {
        navigate(`/summary/${id}`);
      }, 700);

    } catch (err) {
      console.error("Meeting processing error:", err);

      setError(
        err.message ||
          "Unable to process the meeting. Please try again."
      );

      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-black text-white">

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* =====================================================
            BACK
        ===================================================== */}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* =====================================================
            HEADING
        ===================================================== */}

        <div className="mb-8">

          <p className="text-purple-400 text-sm mb-2">
            AI TRANSCRIPTION
          </p>

          <h1 className="text-4xl font-bold">
            Upload Meeting
          </h1>

          <p className="text-gray-400 mt-3">
            Upload your meeting recording and let MeetMind AI
            turn it into useful knowledge.
          </p>

        </div>

        {/* =====================================================
            UPLOAD BOX
        ===================================================== */}

        <div className="border border-dashed border-white/20 rounded-3xl p-12 text-center bg-white/[0.03]">

          {/* ===================================================
              ICON
          =================================================== */}

          <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">

            {loading ? (
              <Loader2
                size={30}
                className="animate-spin"
              />
            ) : (
              <Upload size={30} />
            )}

          </div>

          {/* ===================================================
              TITLE
          =================================================== */}

          <h2 className="text-2xl font-semibold">
            Upload your meeting recording
          </h2>

          <p className="text-gray-500 mt-3">
            Supported formats: MP3, WAV, M4A, MP4
          </p>

          {/* ===================================================
              CHOOSE FILE
          =================================================== */}

          <label
            className={`inline-flex items-center gap-2 mt-7 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 font-semibold transition ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:scale-105"
            }`}
          >

            <Upload size={18} />

            Choose File

            <input
              type="file"
              accept=".mp3,.wav,.m4a,.mp4,audio/*,video/*"
              onChange={handleFileChange}
              disabled={loading}
              className="hidden"
            />

          </label>

          {/* ===================================================
              SELECTED FILE
          =================================================== */}

          {file && (
            <div className="mt-8">

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 text-left">

                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">

                  <FileAudio size={20} />

                </div>

                <div className="flex-1 min-w-0">

                  <p className="font-medium truncate">
                    {file.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                </div>

              </div>

              {/* =================================================
                  UPLOAD / ANALYZE BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="mt-5 px-7 py-3 rounded-xl bg-white text-black font-semibold hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100 inline-flex items-center gap-2"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Analyzing Meeting...
                  </>
                ) : (
                  <>
                    <Upload size={18} />

                    Upload & Analyze Meeting
                  </>
                )}

              </button>

            </div>
          )}

          {/* ===================================================
              PROCESSING STATUS
          =================================================== */}

          {status && (
            <div className="mt-6 flex flex-col items-center justify-center gap-2 text-purple-300">

              {loading ? (
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle2
                  size={20}
                  className="text-green-400"
                />
              )}

              <span>{status}</span>

            </div>
          )}

          {/* ===================================================
              MEETING ID
          =================================================== */}

          {meetingId && (
            <div className="mt-3 text-sm text-gray-500 break-all">
              Meeting ID: {meetingId}
            </div>
          )}

          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (
            <div className="mt-6 flex items-start justify-center gap-2 text-red-400">

              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default UploadMeeting;
