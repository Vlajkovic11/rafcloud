import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "",
        description: "",
        eventDate: "",
        location: "",
        tags: "",
    });

    useEffect(() => {
        fetch(`http://localhost:4000/api/all/${id}`)
            .then((res) => res.json())
            .then((data) =>
                setForm({
                    title: data.title,
                    description: data.description,
                    eventDate: new Date(data.eventDate).toISOString().slice(0, 16),
                    location: data.location,
                    tags: data.tags.map(t => t.tag.name).join(", "),
                })
            );
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`http://localhost:4000/api/all/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        navigate("/");
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Edit Event</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <br />
                <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <br />
                <input
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                />
                <br />
                <input
                    type="text"
                    placeholder="Location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
                <br />
                <input
                    type="tags"
                    placeholder="Tags"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
}

export default EditEvent;
