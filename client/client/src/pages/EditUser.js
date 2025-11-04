import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        permissions: [],
    });
    const [allPermissions, setAllPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user and all available permissions
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                // Fetch user info
                const userRes = await fetch(`http://localhost:4000/api/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userData = await userRes.json();

                // Fetch all permissions
                const permRes = await fetch("http://localhost:4000/api/permissions", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const permData = await permRes.json();

                if (userRes.ok && permRes.ok) {
                    setFormData({
                        fullName: userData.fullName,
                        email: userData.email,
                        permissions: userData.permissions || [],
                    });
                    setAllPermissions(permData || []);
                } else {
                    alert(userData.error || permData.error || "Error fetching data");
                    navigate("/users");
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                alert("Failed to load user data");
                navigate("/users");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePermissionChange = (permName) => {
        setFormData(prev => {
            const alreadyHas = prev.permissions.includes(permName);
            return {
                ...prev,
                permissions: alreadyHas
                    ? prev.permissions.filter(p => p !== permName)
                    : [...prev.permissions, permName],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:4000/api/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                alert("User updated successfully!");
                navigate("/home");
            } else {
                alert(data.error || "Error updating user");
            }
        } catch (err) {
            console.error("Update error:", err);
            alert("Error updating user");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Edit User</h2>
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
                                    checked={formData.permissions.includes(perm.name)}
                                    onChange={() => handlePermissionChange(perm.name)}
                                />{" "}
                                {perm.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                    <button type="submit">Save Changes</button>
                    <button
                        type="button"
                        onClick={() => navigate("/users")}
                        style={{ marginLeft: "1rem" }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditUser;
