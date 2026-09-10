import { Navigate, Outlet } from "react-router-dom";
import { storage } from "../utils/storage";
import { permissions } from "../routes/permission";

const ProtectedRoute = ({ allowedRoles }) => {
    const isAuthenticated = storage.isAuthenticated();
    const user = storage.getUser();

    console.log("AUTH:", isAuthenticated);
    console.log("USER:", user);
    console.log("ALLOWED ROLES:", allowedRoles);

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    const userPermissions = permissions[user.role];

    if (!userPermissions) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;