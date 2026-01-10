import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, setUser }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            await fetch("http://localhost:4000/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
        } catch (error) {
            console.error("Greška pri logout-u:", error);
        }
    };

    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                backgroundColor: "#f2f2f2",
            }}
        >
            <div>
                {user?.permissions?.includes("read_user") && (
                    <Link to="/users" style={{ marginLeft: "1rem" }}>
                        Users
                    </Link>
                )}

                {user?.permissions?.includes("search_machine") && (
                    <Link to="/machines" style={{ marginLeft: "1rem" }}>
                        Machines
                    </Link>
                )}

                {user?.permissions?.includes("search_machine") && (
                    <Link to="/errors/scheduled" style={{ marginLeft: "1rem" }}>
                        Scheduled Errors
                    </Link>
                )}
            </div>

            <div>
                {user ? (
                    <>
                        <span style={{ marginRight: "1rem" }}>{user.fullName}</span>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <Link to="/login">Log in / Register</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
