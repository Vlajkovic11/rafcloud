import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateUser() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        role: "event creator",
        password: "",
        confirmPassword: ""
    });

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/all/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                alert("User created successfully!");
                navigate("/users");
            } else {
                alert(data.error || "Error creating user");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Create New User</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Full Name: </label>
                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Email: </label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Role: </label>
                    <select name="role" value={formData.role} onChange={handleInputChange}>
                        <option value="event creator">Event Creator</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label>Password: </label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Confirm Password: </label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
                </div>
                <button type="submit" style={{ marginTop: "1rem" }}>Create User</button>
            </form>
        </div>
    );
}

export default CreateUser;
