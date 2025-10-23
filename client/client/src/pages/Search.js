import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function SearchResults() {
    const query = useQuery().get("query") || "";
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `http://localhost:4000/api/all/events/search?query=${encodeURIComponent(query)}&page=${page}&limit=10`
            );
            const data = await res.json();
            setEvents(data?.data || []);
            setTotalPages(data?.totalPages || 1);
        } catch (err) {
            console.error(err);
            setEvents([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [query, page]);

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Results of "{query}"</h2>

            {loading && <p>Loading...</p>}

            {!loading && events.length === 0 && <p>No results.</p>}

            {events && events.map((event) => (
                <div key={event.id} style={{ borderBottom: "1px solid #ccc", margin: "1rem 0" }}>
                    <Link to={`/event/${event.id}`}>
                        <h3>{event.title}</h3>
                    </Link>
                    <p>{event.description.substring(0, 100)}...</p>
                    <small>
                        Date: {new Date(event.eventDate).toLocaleDateString()} | Category: {event.category?.name} | Author: {event.author?.fullName}
                    </small>
                </div>
            ))}

            {/* Pagination */}
            <div style={{ marginTop: "1rem" }}>
                <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>
                    Previous
                </button>
                <span style={{ margin: "0 1rem" }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default SearchResults;
