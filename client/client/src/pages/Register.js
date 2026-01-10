import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:4000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, email, password }),

            });

            const text = await res.text();
            let data = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch (err) {
                data = null;
            }

            if (!res.ok) {
                console.log("REGISTER failed:", res.status, text);
                alert(data?.error || `Registracija neuspešna (HTTP ${res.status})`);
                return;
            }

            if (data?.success) {
                navigate("/login");
            } else {
                alert(data?.error || "Registracija neuspešna");
            }
        } catch (err) {
            console.error(err);
            alert("Ne mogu da se povežem sa serverom");
        }
    };


    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
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
                <button type="submit">Register</button>
            </form>
            <p>Already have account? <Link to="/login">Log in</Link></p>
        </div>
    );
}

export default Register;
