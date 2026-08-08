import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import Dashboard from "./pages/Dashboard/Dashboard";
import UploadMeeting from "./pages/UploadMeeting/UploadMeeting";
import Summary from "./pages/Summary/Summary";
import Chat from "./pages/Chat/Chat";
import ActionItems from "./pages/ActionItems/ActionItems";
import Analytics from "./pages/Analytics/Analytics";
import SmartNotes from "./pages/SmartNotes/SmartNotes";
import KnowledgeSearch from "./pages/KnowledgeSearch/KnowledgeSearch";

import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* PROTECTED ROUTES */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/upload-meeting"
            element={<UploadMeeting />}
          />

          <Route
            path="/summary/:meetingId"
            element={<Summary />}
          />

          <Route
            path="/chat/:meetingId"
            element={<Chat />}
          />

          <Route
            path="/action-items/:meetingId"
            element={<ActionItems />}
          />

          <Route
            path="/analytics/:meetingId"
            element={<Analytics />}
          />

          <Route
            path="/notes/:meetingId"
            element={<SmartNotes />}
          />

          <Route
            path="/knowledge-search"
            element={<KnowledgeSearch />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;