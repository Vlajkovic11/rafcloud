import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CreateUser() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        permissions: [],
    });
    const [allPermissions, setAllPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch all permissions for checkboxes
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:4000/api/permissions", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok && data) {
                    setAllPermissions(data || []);
                } else {
                    alert(data.error || "Failed to load permissions");
                }
            } catch (err) {
                console.error(err);
                alert("Error fetching permissions");
            } finally {
                setLoading(false);
            }
        };
        fetchPermissions();
    }, []);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePermissionChange = (permId) => {
        setFormData(prev => {
            const alreadyHas = prev.permissions.includes(permId);
            return {
                ...prev,
                permissions: alreadyHas
                    ? prev.permissions.filter(p => p !== permId)
                    : [...prev.permissions, permId],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
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
            alert("Error creating user");
        }
    };

    if (loading) return <p>Loading permissions...</p>;

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Create New User</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Full Name: </label>
                    <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Email: </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Password: </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Confirm Password: </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label><strong>Permissions:</strong></label>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: "0.5rem",
                        marginTop: "0.5rem"
                    }}>
                        {allPermissions.map((perm) => (
                            <label key={perm.id}>
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.includes(perm.id)}
                                    onChange={() => handlePermissionChange(perm.id)}
                                />{" "}
                                {perm.name}
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" style={{ marginTop: "1rem" }}>Create User</button>
            </form>
        </div>
    );
}

export default CreateUser;
