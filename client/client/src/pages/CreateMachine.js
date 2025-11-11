import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateMachine() {
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Please enter a machine name");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/machines", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Server error:", text);
                alert("Error creating machine");
                return;
            }

            // const data = await res.json();
            alert("Machine created successfully!");
            navigate("/machines");

        } catch (err) {
            console.error("Error creating machine:", err);
            alert("Error creating machine");
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Create Machine</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Machine Name: </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter machine name"
                        required
                        style={{ padding: "5px", width: "250px" }}
                    />
                </div>

                <button type="submit">Create</button>
                <button
                    type="button"
                    style={{ marginLeft: "10px" }}
                    onClick={() => navigate("/machines")}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default CreateMachine;
