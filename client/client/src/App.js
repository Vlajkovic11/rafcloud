import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateUsers from "./pages/CreateUser";
import EditUsers from "./pages/EditUser";
import Users from "./pages/Users";
import Machines from "./pages/Machines";
import CreateMachine from "./pages/CreateMachine";
import MachineDetails from "./pages/MachineDetails";
import ScheduledErrors from "./pages/ScheduledErrors";

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
          <Route path="/users" element={<Users />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/users/create" element={<CreateUsers />} />
          <Route path="/users/edit/:id" element={<EditUsers />} />
          <Route path="/machines" element={<Machines />} />
          <Route path="/machines/create" element={<CreateMachine />} />
          <Route path="/machines/:id" element={<MachineDetails />} />
          <Route path="/errors/scheduled" element={<ScheduledErrors />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
