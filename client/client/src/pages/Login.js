import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        fetch("http://localhost:4000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    setUser(data.user);
                    navigate("/");
                } else {
                    alert("Pogrešan email ili lozinka");
                }
            });
    };

    return (
        <div>
            <h2>Log in</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Log in</button>
            </form>
            <p>You don't have account? <Link to="/register">Register now</Link></p>
        </div>
    );
}

export default Login;
