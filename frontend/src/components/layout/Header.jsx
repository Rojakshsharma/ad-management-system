import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="header">
      <div>
        <p className="header-eyebrow">
          {user.role === "ADMIN"
            ? "Administration"
            : "Advertising"}
        </p>

        <h1>
          {user.role === "ADMIN"
            ? "Manage your ad platform"
            : "Manage your campaigns"}
        </h1>
      </div>

      <div className="header-user">
        <div className="avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="user-info">
          <strong>{user.name}</strong>
          <span>{user.role}</span>
        </div>

        <button
          className="icon-button"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;