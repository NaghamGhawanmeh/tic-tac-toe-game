import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../src/components/LoginPage";
import UsersPage from "./components/UsersPage";
import RequestsPage from "./components/RequestsPage";
import GamePage from "./components/GamePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/game/:id" element={<GamePage />} />
      </Routes>
    </Router>
  );
}

export default App;
