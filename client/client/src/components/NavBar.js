import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, setUser, refreshTrigger }) {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?query=${encodeURIComponent(query)}`);
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            await fetch("http://localhost:4000/api/all/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ userId: user.id })
            });
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/");
        } catch (error) {
            console.error("Greška pri logout-u:", error);
        }
    };

    return (
        <div>
            <nav style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                backgroundColor: "#f2f2f2"
            }}>

                <div>
                    <Link to="/">Login</Link> |{" "}
                    {user?.role === "admin" && (
                        <>
                            {" | "}
                            <Link to="/users">Users</Link>
                        </>
                    )}

                    <form onSubmit={handleSearch} style={{ display: "inline", marginLeft: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit">Find</button>
                    </form>
                </div>

                <div>
                    {user ? (
                        <>
                            <span style={{ marginRight: "1rem" }}> {user.fullName}</span>
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <Link to="/login"> Log in / Register</Link>
                    )}
                </div>
            </nav>

        </div>
    );
}

export default Navbar;
