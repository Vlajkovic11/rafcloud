import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

function MachineDetails() {
    const { id } = useParams();

    const [machine, setMachine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [userPermissions, setUserPermissions] = useState([]);


    const [scheduleOp, setScheduleOp] = useState("TURN_ON");
    const [scheduleAt, setScheduleAt] = useState("");
    const [scheduleLoading, setScheduleLoading] = useState(false);


    const pollRef = useRef(null);
    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;


        fetchMachine(false);
        fetchUserPermissions();


        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(() => {
            fetchMachine(true);
        }, 2000);

        return () => {
            isMountedRef.current = false;
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };

    }, [id]);

    const fetchUserPermissions = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (res.ok) {
                if (!isMountedRef.current) return;
                setUserPermissions(data.permissions || []);
                localStorage.setItem("user", JSON.stringify(data));
            } else {
                console.error("Failed to fetch /me:", data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMachine = async (silent = false) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:4000/api/machines/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (res.ok) {
                if (!isMountedRef.current) return;
                setMachine(data);
            } else {
                if (!silent) alert(data.error || "Failed to fetch machine details");
            }
        } catch (err) {
            console.error(err);
            if (!silent) alert("Failed to fetch machine details");
        } finally {
            if (!silent && isMountedRef.current) setLoading(false);
            if (silent && loading && isMountedRef.current) setLoading(false);
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
                await fetchMachine(true);
            } else {
                alert(data.error || "Action failed");
            }
        } catch (err) {
            console.error(err);
            alert("Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();

        if (!scheduleAt) {
            alert("Pick date and time");
            return;
        }

        const executeAtIso = new Date(scheduleAt).toISOString();

        try {
            setScheduleLoading(true);
            const token = localStorage.getItem("token");

            const res = await fetch(`http://localhost:4000/api/machines/${id}/schedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    operation: scheduleOp,
                    executeAt: executeAtIso,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert(
                    `Scheduled ${data.operation || scheduleOp} at ${
                        data.executeAt
                            ? new Date(data.executeAt).toLocaleString()
                            : new Date(executeAtIso).toLocaleString()
                    }`
                );


                await fetchMachine(true);
            } else {
                alert(data.error || "Failed to schedule operation");
            }
        } catch (err) {
            console.error(err);
            alert("Error scheduling operation");
        } finally {
            setScheduleLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!machine) return <p>Machine not found.</p>;

    const isActive = machine.active;
    const state = machine.state; // "On" / "Off"
    const isBusy = !!machine.busy;

    const canTurnOn =
        !isBusy && isActive && state === "Off" && userPermissions.includes("turnon_machine");
    const canTurnOff =
        !isBusy && isActive && state === "On" && userPermissions.includes("turnoff_machine");
    const canRestart =
        !isBusy && isActive && state === "On" && userPermissions.includes("restart_machine");
    const canDestroy =
        !isBusy && isActive && state === "Off" && userPermissions.includes("destroy_machine");

    const canScheduleSelected =
        (scheduleOp === "TURN_ON" && userPermissions.includes("turnon_machine")) ||
        (scheduleOp === "TURN_OFF" && userPermissions.includes("turnoff_machine")) ||
        (scheduleOp === "RESTART" && userPermissions.includes("restart_machine"));

    const buttonStyle = (enabled) => ({
        padding: "8px 14px",
        cursor: enabled ? "pointer" : "not-allowed",
        background: enabled ? "#007bff" : "#ccc",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        opacity: actionLoading ? 0.85 : 1,
    });

    return (
        <div style={{ padding: "1rem" }}>
            <h2>{machine.name}</h2>

            <div style={{ marginTop: "0.5rem" }}>
                <b>State:</b> {machine.state}{" "}
                <span style={{ marginLeft: "1rem" }}>
          <b>Active:</b> {machine.active ? "Yes" : "No"}
        </span>{" "}
                <span style={{ marginLeft: "1rem" }}>
          <b>Busy:</b> {machine.busy ? "Yes" : "No"}
        </span>
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
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

            {/* Scheduling */}
            <div style={{ marginTop: "2rem" }}>
                <h3>Schedule operation</h3>

                <form
                    onSubmit={handleSchedule}
                    style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}
                >
                    <select value={scheduleOp} onChange={(e) => setScheduleOp(e.target.value)}>
                        <option value="TURN_ON">TURN_ON</option>
                        <option value="TURN_OFF">TURN_OFF</option>
                        <option value="RESTART">RESTART</option>
                    </select>

                    <input
                        type="datetime-local"
                        value={scheduleAt}
                        onChange={(e) => setScheduleAt(e.target.value)}
                    />

                    <button type="submit" disabled={!canScheduleSelected || scheduleLoading}>
                        {scheduleLoading ? "Scheduling..." : "Schedule"}
                    </button>
                </form>

                {!canScheduleSelected && (
                    <p style={{ marginTop: "0.5rem" }}>
                        You don't have permission to schedule this operation.
                    </p>
                )}
            </div>

            {/* Error logs */}
            {/*<div style={{ marginTop: "2rem" }}>*/}
            {/*    <h3>Error Logs</h3>*/}
            {/*    {machine.errors?.length > 0 ? (*/}
            {/*        <ul>*/}
            {/*            {machine.errors.map((err) => (*/}
            {/*                <li key={err.id}>*/}
            {/*                    {err.message} — <i>{new Date(err.createdAt).toLocaleString()}</i>*/}
            {/*                </li>*/}
            {/*            ))}*/}
            {/*        </ul>*/}
            {/*    ) : (*/}
            {/*        <p>No errors logged for this machine.</p>*/}
            {/*    )}*/}
            {/*</div>*/}
        </div>
    );
}

export default MachineDetails;
