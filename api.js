
const API_BASE_URL = "http://127.0.0.1:8000";

// =========================================================
// AUTHENTICATION - LOGIN
// =========================================================

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Login failed. Please check your credentials."
    );
  }

  return data;
}

// =========================================================
// AUTHENTICATION - REGISTER
// =========================================================

export async function registerUser({ name, email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Registration failed. Please try again."
    );
  }

  return data;
}

// =========================================================
// MEETING UPLOAD
// =========================================================

export async function uploadMeeting(file) {
  if (!file) {
    throw new Error("Please select a meeting file.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/meetings/upload`, {
    method: "POST",
    body: formData,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to upload meeting."
    );
  }

  // Make sure backend actually returned a meeting ID
  if (!data.meeting_id) {
    console.error("Upload response:", data);

    throw new Error(
      "Meeting uploaded, but the server did not return a meeting ID."
    );
  }

  console.log("Meeting uploaded successfully:", data);

  return data;
}

// =========================================================
// MEETING ANALYSIS
// =========================================================

export async function analyzeMeeting(meetingId) {
  if (!meetingId) {
    throw new Error(
      "Meeting ID is missing. Cannot start analysis."
    );
  }

  console.log("Starting analysis for meeting:", meetingId);

  const response = await fetch(
    `${API_BASE_URL}/meetings/${meetingId}/analyze`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Server returned an invalid analysis response.");
  }

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to analyze meeting."
    );
  }

  console.log("Meeting analysis completed:", data);

  return data;
}

// =========================================================
// TRANSCRIPTION
// =========================================================

export async function transcribeMeeting(meetingId) {
  if (!meetingId) {
    throw new Error(
      "Meeting ID is missing. Cannot start transcription."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/meetings/${meetingId}/transcribe`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Server returned an invalid transcription response."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to transcribe meeting."
    );
  }

  return data;
}

// =========================================================
// GET SINGLE MEETING
// =========================================================

export async function getMeeting(meetingId) {
  if (!meetingId) {
    throw new Error("Meeting ID is missing.");
  }

  const response = await fetch(
    `${API_BASE_URL}/meetings/${meetingId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to get meeting."
    );
  }

  return data;
}

// =========================================================
// GET ALL MEETINGS
// =========================================================

export async function getAllMeetings() {
  const response = await fetch(
    `${API_BASE_URL}/meetings/`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to load meetings."
    );
  }

  return data;
}