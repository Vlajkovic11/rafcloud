import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Machines() {
    const [machines, setMachines] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Filter polja
    const [searchName, setSearchName] = useState("");
    const [stateFilter, setStateFilter] = useState(""); // "Free" ili "Busy"
    const [activeFilter, setActiveFilter] = useState(null); // true / false / null

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

    const handleSearch = (e) => {
        e.preventDefault();

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

        setFiltered(result);
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Machines</h2>

            {/* 🔍 FILTER FORMA */}
            <form
                onSubmit={handleSearch}
                style={{
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                }}
            >
                {/* Pretraga po imenu */}
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    style={{ padding: "6px", flex: "1" }}
                />

                {/* Checkbox Free / Busy */}
                <div>
                    <label style={{ marginRight: "10px" }}>
                        <input
                            type="checkbox"
                            checked={stateFilter === "Free"}
                            onChange={() =>
                                setStateFilter(stateFilter === "Free" ? "" : "Free")
                            }
                        />
                        Free
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={stateFilter === "Busy"}
                            onChange={() =>
                                setStateFilter(stateFilter === "Busy" ? "" : "Busy")
                            }
                        />
                        Busy
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

                <button
                    type="submit"
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

            {/* TABELA */}
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
                <button onClick={() => navigate("/machines/create")}>
                    Create Machine
                </button>
            </div>
        </div>
    );
}

export default Machines;
