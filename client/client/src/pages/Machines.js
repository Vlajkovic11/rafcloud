import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Machines() {
    const [machines, setMachines] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Filter polja
    const [searchName, setSearchName] = useState("");
    const [stateFilter, setStateFilter] = useState(""); // "Off" ili "On"
    const [activeFilter, setActiveFilter] = useState(null); // true / false / null
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userPermissions = user.permissions || [];

    const canCreate = userPermissions.includes("create_machine");

    useEffect(() => {
        fetchMachines();
    }, []);

    const fetchMachines = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/machines", {
                headers: { Authorization: `Bearer ${token}` },
            });

            // console.log("Response status:", res.status);

            const data = await res.json();
            if (res.ok) {
                setMachines(data);
                setFiltered(data);
            } else {
                alert(data.error || "Failed to fetch machines");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // const canSearch = userPermissions.includes("search_machine");


    const handleSearch = (e) => {
        e.preventDefault();

        if (!userPermissions.includes("search_machine")) {
            alert("You don't have permission to search machines!");
            return;
        }

        let result = [...machines];

        if (searchName.trim() !== "") {
            result = result.filter((m) =>
                m.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        if (stateFilter) {
            result = result.filter((m) => m.state === stateFilter);
        }

        if (activeFilter !== null) {
            result = result.filter((m) => m.active === activeFilter);
        }

        if (startDate) {
            const start = new Date(startDate);
            result = result.filter((m) => new Date(m.createdAt) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            result = result.filter((m) => new Date(m.createdAt) <= end);
        }

        setFiltered(result);
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Machines</h2>

            {/* FILTER FORM */}
            <form
                onSubmit={handleSearch}
                style={{
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                }}
            >
                {/* Search by name */}
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    style={{ padding: "6px", flex: "1" }}
                />

                {/* Checkbox Off / On */}
                <div>
                    <label style={{ marginRight: "10px" }}>
                        <input
                            type="checkbox"
                            checked={stateFilter === "Off"}
                            onChange={() =>
                                setStateFilter(stateFilter === "Off" ? "" : "Off")
                            }
                        />
                        Off
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={stateFilter === "On"}
                            onChange={() =>
                                setStateFilter(stateFilter === "On" ? "" : "On")
                            }
                        />
                        On
                    </label>
                </div>

                {/* Active checkbox */}
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={activeFilter === true}
                            onChange={() =>
                                setActiveFilter(activeFilter === true ? null : true)
                            }
                        />
                        Active
                    </label>
                </div>

                <div>
                    <label>
                        Start Date:
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </label>

                    <label style={{ marginLeft: "1rem" }}>
                        End Date:
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    // disabled={!canSearch}
                    style={{
                        padding: "6px 12px",
                        cursor: "pointer",
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                    }}
                >
                    Search
                </button>
            </form>

            {/* TABLE */}
            {filtered.length === 0 ? (
                <p>No machines available.</p>
            ) : (
                <table
                    border="1"
                    cellPadding="8"
                    style={{ width: "100%", borderCollapse: "collapse" }}
                >
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>State</th>
                            <th>Active</th>
                            <th>Created By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((m) => (
                            <tr key={m.id}>
                                <td>{m.id}</td>
                                <td
                                    style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
                                    onClick={() => navigate(`/machines/${m.id}`)}
                                >
                                    {m.name}
                                </td>
                                <td>{m.state}</td>
                                <td>{m.active ? "Yes" : "No"}</td>
                                <td>{m.createdBy?.fullName || "Unknown"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={{ marginTop: "1rem" }}>
                <button
                    onClick={() => {
                        if (!canCreate) {
                            alert("You don't have permission to create machines!");
                            return;
                        }
                        navigate("/machines/create");
                    }}
                    disabled={!canCreate}
                    style={{
                        padding: "6px 12px",
                        cursor: canCreate ? "pointer" : "not-allowed",
                        background: canCreate ? "#007bff" : "#ccc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                    }}
                >
                    Create Machine
                </button>
            </div>
        </div>
    );
}

export default Machines;
