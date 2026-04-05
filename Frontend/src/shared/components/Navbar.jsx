import { Link } from "react-router-dom";
import useAuth from "../../features/auth/hook/useAuth";
import { toast } from "react-toastify";
import "./Navbar.scss";

const navItems = [
    {
        label: "Order",
        items: [
            { label: "Table View", to: "/terminal" },
            { label: "Orders", to: "/orders" },
            { label: "Payments", to: "/payment" },
            { label: "Customers", to: "/customers" },
        ],
    },
    {
        label: "Products",
        items: [
            { label: "Products", to: "/products" },
            { label: "Category", to: "/categories" },
        ],
    },
    {
        label: "Reporting",
        items: [{ label: "Dashboard", to: "/reporting" }],
    },
];

const actionItems = [
    { label: "Profile", to: "/profile" },
    { label: "Settings", to: "/settings" },
    { label: "Kitchen Display", to: "/kitchen" },
    { label: "Customer Display", to: "/customer-display" },
    { label: "Logout", to: "/logout" },
];

const Navbar = () => {

    const { LogoutUser, user } = useAuth();
    const isOwner = String(user?.role || "").toLowerCase() === "owner";
    const filteredActionItems = actionItems.filter((item) => {
        if (item.label === "Settings" && !isOwner) return false;
        return true;
    });

    const copyField = async (label, value) => {
        if (!value) {
            toast.error(`${label} not available`);
            return;
        }

        try {
            await navigator.clipboard.writeText(String(value));
            toast.success(`${label} copied`);
        } catch {
            toast.error(`Could not copy ${label.toLowerCase()}`);
        }
    };

    return (
        <header className="navbar-shell">
            <nav className="navbar">
                <div className="navbar-left">
                    <Link to={'/'}>
                        <h1 className="brand">Odoo Cafe</h1>
                    </Link>
                    <ul className="nav-menu" aria-label="Primary Navigation">
                        {navItems.map((item) => (
                            <li className="nav-item" key={item.label}>
                                <button type="button" className="nav-link">
                                    {item.label}
                                </button>
                                <div className="nav-dropdown">
                                    {item.items.map((link) => (
                                        <Link key={link.to} to={link.to}>
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="navbar-right">
                    <div className="menu-dots-wrapper">
                        <button type="button" className="menu-dots" aria-label="More options">
                            &#8942;
                        </button>
                        <div className="menu-dots-dropdown">
                            {filteredActionItems.map((item) => (
                                item.label === "Logout" ? (
                                    <button
                                        key={item.to}
                                        type="button"
                                        onClick={LogoutUser}
                                    >
                                        {item.label}
                                    </button>
                                ) : (
                                    <Link key={item.to} to={item.to}>
                                        {item.label}
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                    <div className="navbar-user">
                        <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
                        <span className="user-display">{user?.name || "User"}</span>
                        <div className="user-hover-card">
                            <button type="button" onClick={() => copyField("Restaurant Name", user?.restaurant_name)}>
                                <span>Restaurant Name</span>
                                <strong>{user?.restaurant_name || "-"}</strong>
                            </button>
                            <button type="button" onClick={() => copyField("Restaurant ID", user?.restaurant_id)}>
                                <span>Restaurant ID</span>
                                <strong>{user?.restaurant_id || "-"}</strong>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;