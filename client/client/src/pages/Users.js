import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Ulogovani korisnik i njegove dozvole
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userPermissions = user.permissions || [];

    const canEdit = userPermissions.includes("update_user");
    const canDelete = userPermissions.includes("delete_user");
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

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (id) => {
        if (!canEdit) {
            alert("Nemate dozvolu za izmenu korisnika.");
            return;
        }
        navigate(`/users/edit/${id}`);
    };

    const handleDelete = async (id) => {
        if (!canDelete) {
            alert("Nemate dozvolu za brisanje korisnika.");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`http://localhost:4000/api/users/${id}`, {
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
                                        onClick={() => handleEdit(user.id)}
                                        style={{ marginRight: "0.5rem" }}
                                        disabled={!canEdit}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        disabled={!canDelete}
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
                style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
                disabled={!canCreate}
            >
                Create New User
            </button>
        </div>
    );
}

export default Users;
