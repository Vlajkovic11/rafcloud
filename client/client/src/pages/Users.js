import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/all/admin/users", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:4000/api/all/admin/users/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) fetchUsers();
            else {
                const errData = await res.json();
                alert(errData.error || "Greška prilikom brisanja korisnika");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Users</h2>
            <button
                onClick={() => navigate("/users/create")}
                style={{ marginBottom: "1rem" }}
            >
                Add New User
            </button>

            {loading ? (
                <p>Loading users...</p>
            ) : (
                <table border="1" cellPadding="5" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.fullName}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>
                                    <button
                                        onClick={() => navigate(`/users/edit/${u.id}`)}
                                    >
                                        Edit
                                    </button>{" "}
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        style={{ color: "red" }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Users;
