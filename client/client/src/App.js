import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Users from "./pages/Users";
import CreateUsers from "./pages/CreateUser";
import EditUsers from "./pages/EditUser";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/create" element={<CreateUsers />} />
          <Route path="/users/edit/:id" element={<EditUsers />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
