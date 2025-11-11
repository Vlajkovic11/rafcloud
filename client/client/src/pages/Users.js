import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [userPermissions, setUserPermissions] = useState([]);

    // const canEdit = userPermissions.includes("update_user");
    // const canDelete = userPermissions.includes("delete_user");
    const canCreate = userPermissions.includes("create_user");

    // Fetch all users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:4000/api/users", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users || []);
            } else {
                alert(data.error || "Failed to fetch users");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPermissions = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok || res.status === 200) {
                setUser(data);
                setUserPermissions(data.permissions || []);
                localStorage.setItem("user", JSON.stringify(data));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchUserPermissions();
    }, []);

    const handleEdit = (targetUserId, targetUserEmail) => {
        if (targetUserEmail === "admin@rafcloud" && user.email !== "admin@rafcloud") {
            alert("You cannot edit admin");
            return;
        }
        if (!userPermissions.includes("update_user")) {
            alert("Nemate dozvolu za izmenu korisnika.");
            return;
        }
        navigate(`/users/edit/${targetUserId}`);
    };

    const handleDelete = async (targetUserId, targetUserEmail) => {
        if (targetUserEmail === "admin@rafcloud" && user.email !== "admin@rafcloud") {
            alert("You cannot delete admin");
            return;
        }

        if (!userPermissions.includes("delete_user")) {
            alert("Nemate dozvolu za brisanje korisnika.");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`http://localhost:4000/api/users/${targetUserId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (res.ok) {
                fetchUsers();
            } else {
                const errData = await res.json();
                alert(errData.error || "Greška prilikom brisanja korisnika");
            }
        } catch (error) {
            console.error("Greška:", error);
        }
    };

    const handleCreateUser = () => {
        if (!canCreate) {
            alert("Nemate dozvolu za kreiranje korisnika.");
            return;
        }
        navigate("/users/create");
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h2>All Users</h2>

            {loading && <p>Loading users...</p>}

            {!loading && users.length === 0 && <p>No users found.</p>}

            {!loading && users.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Full Name</th>
                            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Email</th>
                            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Permissions</th>
                            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{user.fullName}</td>
                                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{user.email}</td>
                                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                    {user.permissions?.join(", ")}
                                </td>
                                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                    <button
                                        onClick={() => handleEdit(user.id, user.email)}
                                        disabled={!userPermissions.includes("update_user") ||
                                            (user.email !== "admin@rafcloud" && user.email === "admin@rafcloud")}
                                        style={{
                                            padding: "5px 8px",
                                            cursor: "pointer",
                                            background: "#007bff",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "3px",
                                            marginRight: "8px"
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id, user.email)}
                                        disabled={!userPermissions.includes("delete_user") ||
                                            (user.email === "admin@rafcloud" && user.email !== "admin@rafcloud")}
                                        style={{
                                            padding: "5px 8px",
                                            cursor: "pointer",
                                            background: "#007bff",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "3px",
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <button
                onClick={handleCreateUser}
                disabled={!canCreate}
                style={{
                    padding: "10px 15px",
                    cursor: "pointer",
                    background: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    marginTop: "1rem"
                }}
            >
                Create New User
            </button>
        </div>
    );
}

export default Users;
