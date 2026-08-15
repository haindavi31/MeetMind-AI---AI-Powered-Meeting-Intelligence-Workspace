# MeetMind AI — AI-Powered Meeting Intelligence Workspace

MeetMind AI is an AI-powered meeting intelligence platform designed to transform recorded meetings into structured, useful knowledge. It allows users to upload meeting audio or video and automatically generate transcripts, summaries, key points, action items, smart notes, analytics, and an interactive chat experience based on the meeting.

## ✨ Features

* 🎙️ **AI Transcription** — Convert recorded meeting audio/video into text.
* 📝 **AI Meeting Summaries** — Generate concise summaries from meeting transcripts.
* 💡 **Key Points** — Extract important information and decisions from conversations.
* ✅ **Action Items** — Identify tasks and follow-ups discussed during meetings.
* 💬 **Chat With Meeting** — Ask questions about a specific meeting using AI.
* 📊 **Meeting Analytics** — View transcript statistics, summary metrics, action items, key points, and meeting insights.
* 📒 **Smart Notes** — Organize important information from meetings into structured notes.
* 🔎 **Knowledge Search** — Search through previously analyzed meeting information.
* 🌐 **Language Detection** — Display the detected meeting language.
* 🗂️ **Meeting Workspace** — Manage and view previously uploaded meetings from one dashboard.
* 🗑️ **Meeting Management** — View and delete stored meetings.

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* React Router
* Lucide React
* Axios / Fetch API

### Backend

* Python
* FastAPI
* REST APIs
* AI-powered processing services
* Speech-to-text processing
* Meeting summarization
* Key-point extraction
* Action-item extraction
* Meeting chat / retrieval functionality
* Analytics services
* Smart Notes services

### Database & Storage

* Local database during development
* Uploaded meeting media storage
* Environment-based configuration

## 🏗️ Project Structure

```text
MeetMind-AI/
│
├── backend/
│   ├── ai/
│   ├── analysis/
│   ├── api/
│   ├── chat/
│   ├── services/
│   ├── transcription/
│   ├── utils/
│   ├── generated/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## 🚀 Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/haindavi31/MeetMind-AI---AI-Powered-Meeting-Intelligence-Workspace.git
cd MeetMind-AI---AI-Powered-Meeting-Intelligence-Workspace
```

### 2. Start the Backend

Open a terminal and navigate to the backend:

```bash
cd backend
```

Create and activate a Python virtual environment:

```bash
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation can be accessed at:

```text
http://127.0.0.1:8000/docs
```

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🔐 Environment Variables

Sensitive configuration should be stored in environment variables rather than committed to GitHub.

Create a `.env` file where required by the backend configuration.

Example:

```env
# Add your required AI/API configuration here
# Never commit real API keys or secrets
```

The `.env` file is excluded from Git through `.gitignore`.


## 📊 Meeting Intelligence

After a meeting is analyzed, MeetMind AI provides a dedicated workspace where users can:

* Read the complete transcript
* Review the AI-generated summary
* Explore key points
* Review extracted action items
* View analytics
* Generate smart notes
* Chat with the meeting
* Search meeting knowledge
* Manage stored meetings

## 🧠 AI-Powered Processing

MeetMind AI separates meeting intelligence into multiple processing capabilities, including:

* Speech-to-text transcription
* Summarization
* Key-point extraction
* Action-item extraction
* Retrieval-based meeting chat
* Smart note generation
* Meeting analytics

This modular structure makes it easier to extend the platform with additional AI capabilities in the future.

## 🔒 Security & Git

The repository uses `.gitignore` to prevent development-only and sensitive files from being committed.

Examples include:

```text
node_modules/
venv/
__pycache__/
*.pyc
*.db
uploads/
.env
dist/
.vite/
```

API keys, local databases, uploaded meeting files, Python environments, and generated build/cache files should not be committed to the repository.

## 🌐 Deployment

MeetMind AI is structured as a separate frontend and backend application and can be deployed using services that support:

* React/Vite static applications
* Python/FastAPI web services
* Production databases
* Persistent file or object storage

For production deployment, local development storage should be replaced with appropriate persistent database and file-storage solutions.

## 🔮 Future Improvements

Possible future enhancements include:

* User authentication and accounts
* Multi-user workspaces
* Persistent cloud storage
* Advanced speaker identification
* Meeting sharing
* Calendar integration
* Email notifications
* Advanced knowledge search
* Improved analytics and visualizations
* Real-time meeting transcription
* Additional AI models and providers

## 👩‍💻 Author

**Haindavi**

MeetMind AI was developed as an AI-powered workspace for turning meeting conversations into structured knowledge and actionable insights.

## 📄 License

This project does not currently specify an open-source license.

If you intend to make the project open source, add an appropriate license such as MIT before presenting it as an open-source project.
