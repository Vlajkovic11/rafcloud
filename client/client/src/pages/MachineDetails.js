import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function MachineDetails() {
    const { id } = useParams();
    const [machine, setMachine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [userPermissions, setUserPermissions] = useState([]);

    useEffect(() => {
        fetchMachine();
        fetchUserPermissions();
    }, [id]);

    const fetchUserPermissions = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok || res.status === 200) {
                setUserPermissions(data.permissions || []);
                localStorage.setItem("user", JSON.stringify(data));
            }
        } catch (err) {
            console.error(err);
        }
    };

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
                if (endpoint === "restart") {
                    setMachine(prev => ({
                        ...prev,
                        errors: [
                            ...(prev.errors || []),
                            {
                                id: data.error.id,
                                message: data.error.message,
                                createdAt: data.error.createdAt,
                            },
                        ],
                    }));
                } else {
                    await fetchMachine();
                }
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

    // Dynamic logic button
    const isActive = machine.active;
    const state = machine.state; // "On" or "Off"

    const canTurnOn = isActive && state === "Off" && userPermissions.includes("turnon_machine");
    const canTurnOff = isActive && state === "On" && userPermissions.includes("turnoff_machine");
    const canRestart = isActive && userPermissions.includes("restart_machine");
    const canDestroy = isActive && state === "Off" && userPermissions.includes("destroy_machine");

    const buttonStyle = (enabled) => ({
        padding: "8px 14px",
        cursor: enabled ? "pointer" : "not-allowed",
        background: enabled ? "#007bff" : "#ccc",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
    });

    return (
        <div style={{ padding: "1rem" }}>
            <h2>{machine.name}</h2>

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                <button
                    disabled={!canTurnOn || actionLoading}
                    onClick={() => handleAction("turn-on")}
                    style={buttonStyle(canTurnOn)}
                >
                    Turn On
                </button>
                <button
                    disabled={!canTurnOff || actionLoading}
                    onClick={() => handleAction("turn-off")}
                    style={buttonStyle(canTurnOff)}
                >
                    Turn Off
                </button>
                <button
                    disabled={!canRestart || actionLoading}
                    onClick={() => handleAction("restart")}
                    style={buttonStyle(canRestart)}
                >
                    Restart
                </button>
                <button
                    disabled={!canDestroy || actionLoading}
                    onClick={() => handleAction("destroy")}
                    style={buttonStyle(canDestroy)}
                >
                    Destroy
                </button>
            </div>

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
