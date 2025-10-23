import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const fetchEvents = async (currentPage) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/all/?page=${currentPage}&limit=10`);
            const data = await res.json();
            setEvents(data.data);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents(page);
    }, [page]);

    const handleCreateEvent = () => {
        navigate("/create-event");
    };

    const handleEdit = (id) => {
        navigate(`/edit-event/${id}`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            const res = await fetch(`http://localhost:4000/api/all/${id}`, {
                method: "DELETE",
            });
            console.log(res);
            if (res.ok) {
                fetchEvents(page);
            } else {
                const errData = await res.json();
                alert(errData.error || "Greška prilikom brisanja događaja");
            }
        } catch (error) {
            console.error("Greška:", error);
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Most recent events</h2>

            <button
                onClick={handleCreateEvent}
                style={{ margin: "1rem 0", padding: "0.5rem 1rem" }}
            >
                Create event
            </button>

            {loading && <p>Loading events...</p>}

            {!loading && events.length === 0 && <p>No events found.</p>}

            {events.map((event) => (
                <div key={event.id} style={{ borderBottom: "1px solid #ccc", margin: "1rem 0", paddingBottom: "1rem" }}>
                    <Link to={`/event/${event.id}`}>
                        <h3>{event.title}</h3>
                    </Link>
                    <p>{event.description.substring(0, 100)}...</p>
                    <small>
                        Publish date: {new Date(event.createdAt).toLocaleDateString()} | Category:{" "}
                        {event.category?.name} | Author: {event.author?.fullName}
                    </small>
                    {event.tags?.length > 0 && (
                        <div>
                            Tags:{" "}
                            {event.tags.map((t, idx) => (
                                <React.Fragment key={t.tag.id}>
                                    <Link
                                        to={`/tag/${encodeURIComponent(t.tag.name)}`}
                                        style={{ color: "blue", textDecoration: "underline" }}
                                    >
                                        {t.tag.name}
                                    </Link>
                                    {idx < event.tags.length - 1 && ", "}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: "0.5rem" }}>
                        <button
                            onClick={() => handleEdit(event.id)}
                            style={{ marginRight: "0.5rem" }}
                        >
                            Izmeni
                        </button>
                        <button
                            onClick={() => handleDelete(event.id)}
                            style={{ marginRight: "0.5rem" }}
                        >
                            Obriši
                        </button>
                    </div>

                </div>
            ))}

            {/* Pagination controls */}
            <div style={{ marginTop: "1rem" }}>
                <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    style={{ marginRight: "1rem" }}
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    style={{ marginLeft: "1rem" }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default Home;
