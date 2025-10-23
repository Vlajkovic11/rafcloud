import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        role: "USER",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:4000/api/all/admin/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if (res.ok) {
                    setFormData({
                        fullName: data.fullName,
                        email: data.email,
                        role: data.role,
                    });
                } else {
                    alert(data.error || "Error fetching user");
                    navigate("/users");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, navigate]);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:4000/api/all/admin/users/${id}`, {
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
                navigate("/users");
            } else {
                alert(data.error || "Error updating user");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Edit User</h2>
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
                <button type="submit" style={{ marginTop: "1rem" }}>Save Changes</button>
                <button type="button" onClick={() => navigate("/users")} style={{ marginLeft: "1rem" }}>Cancel</button>
            </form>
        </div>
    );
}

export default EditUser;
