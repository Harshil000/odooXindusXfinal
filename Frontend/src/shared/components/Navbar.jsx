import { Link } from "react-router-dom";
import useAuth from "../../features/auth/hook/useAuth";
import "./Navbar.scss";

const navItems = [
    {
        label: "Order",
        items: [
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
    { label: "Settings", to: "/settings" },
    { label: "Kitchen Display", to: "/kitchen" },
    { label: "Customer Display", to: "/customer-display" },
    { label: "Logout", to: "/logout" },
];

const Navbar = () => {

    const { LogoutUser, user } = useAuth();

    return (
        <header className="navbar-shell">
            <nav className="navbar">
                <div className="navbar-left">
                    <h1 className="brand">Odoo Cafe</h1>
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
                            {actionItems.map((item) => (
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
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;