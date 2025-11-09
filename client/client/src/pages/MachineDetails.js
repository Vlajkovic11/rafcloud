import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function MachineDetails() {
    const { id } = useParams();
    const [machine, setMachine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchMachine();
    }, [id]);

    const fetchMachine = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:4000/api/machines/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (res.ok) {
                setMachine(data);
            } else {
                alert(data.error || "Failed to fetch machine details");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper funkcija za slanje zahteva prema backendu
    const handleAction = async (endpoint) => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem("token");

            const res = await fetch(`http://localhost:4000/api/machines/${id}/${endpoint}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (res.ok) {
                // alert(data.message || "Action logged successfully");
                await fetchMachine(); // osveži podatke o mašini
            } else {
                alert(data.error || "Action failed");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!machine) return <p>Machine not found.</p>;

    return (
        <div style={{ padding: "1rem" }}>
            <h2>{machine.name}</h2>

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                <button
                    disabled={actionLoading}
                    onClick={() => handleAction("turn-on")}
                    style={{ padding: "8px 14px" }}
                >
                    Turn On
                </button>
                <button
                    disabled={actionLoading}
                    onClick={() => handleAction("turn-off")}
                    style={{ padding: "8px 14px" }}
                >
                    Turn Off
                </button>
                <button
                    disabled={actionLoading}
                    onClick={() => handleAction("restart")}
                    style={{ padding: "8px 14px" }}
                >
                    Restart
                </button>
                <button
                    disabled={actionLoading}
                    onClick={() => handleAction("create-error")}
                    style={{ padding: "8px 14px" }}
                >
                    Create
                </button>
                <button
                    disabled={actionLoading}
                    onClick={() => handleAction("destroy")}
                    style={{ padding: "8px 14px" }}
                >
                    Destroy
                </button>
            </div>

            {/* Prikaz grešaka */}
            <div style={{ marginTop: "2rem" }}>
                <h3>Error Logs</h3>
                {machine.errors?.length > 0 ? (
                    <ul>
                        {machine.errors.map((err) => (
                            <li key={err.id}>
                                {err.message} — <i>{new Date(err.createdAt).toLocaleString()}</i>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No errors logged for this machine.</p>
                )}
            </div>
        </div>
    );
}

export default MachineDetails;
