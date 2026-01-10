import React, { useEffect, useState } from "react";

function ScheduledErrors() {
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchErrors = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/errors/scheduled", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (res.ok) {
                setErrors(data.errors || []);
            } else {
                alert(data.error || "Failed to fetch scheduled errors");
            }
        } catch (err) {
            console.error(err);
            alert("Error fetching scheduled errors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchErrors();
    }, []);

    if (loading) return <p>Loading scheduled errors...</p>;

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Scheduled Errors</h2>

            {errors.length === 0 ? (
                <p>No scheduled errors.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Machine</th>
                        <th>Operation</th>
                        <th>Message</th>
                        <th>Execute At</th>
                        <th>Created At</th>
                    </tr>
                    </thead>
                    <tbody>
                    {errors.map(e => (
                        <tr key={e.id}>
                            <td>{e.id}</td>
                            <td>{e.machineName} (#{e.machineId})</td>
                            <td>{e.operation}</td>
                            <td>{e.message}</td>
                            <td>{new Date(e.executeAt).toLocaleString()}</td>
                            <td>{new Date(e.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ScheduledErrors;
