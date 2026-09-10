import {
    LayoutDashboard,
    Monitor,
    DollarSign,
    Megaphone,
    ShoppingBag,
    BarChart3,
    PlusCircle,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { permissions } from "../../routes/permission";

const icons = {
    Dashboard: LayoutDashboard,
    "Ad Spaces": Monitor,
    Pricing: DollarSign,
    Ads: Megaphone,
    "My Ads": Megaphone,
    "Buy Placement": PlusCircle,
    Orders: ShoppingBag,
    Analytics: BarChart3,
};

const Sidebar = () => {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const navigation = permissions[user.role]?.navigation || [];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-mark">A</div>

                <div>
                    <strong>AdSpace</strong>
                    <span>Management</span>
                </div>
            </div>

            <div className="sidebar-section">
                <span className="sidebar-label">
                    {user.role === "ADMIN" ? "ADMIN" : "ADVERTISER"}
                </span>

                <nav>
                    {navigation.map((item) => {
                        const Icon = icons[item.label] || LayoutDashboard;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? "active" : ""}`
                                }
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;