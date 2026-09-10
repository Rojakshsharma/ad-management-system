import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/auth/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdSpaces from "./components/addSpaces/AdSpaces";

import AdvertiserDashboard from "./pages/advertiser/AdvertiserDashboard";
import Pricing from "./pages/admin/Pricing";

import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Ads from "./pages/admin/Ads";
import MyAds from "./pages/advertiser/MyAds";
import Page1 from "./pages/public/Page1";
import Page2 from "./pages/public/Page2";
import Page3 from "./pages/public/Page3";
import Page4 from "./pages/public/Page4";
import Page5 from "./pages/public/Page5";
import BuyPlacement from "./pages/advertiser/BuyPlacement";
import Orders from "./pages/advertiser/Orders";
// import Analytics from "./pages/advertiser/Analytics";

const Unauthorized = () => (
  <div className="center-page">
    <h2>Access denied</h2>
    <p>You don't have permission to access this page.</p>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/page1" element={<Page1 />} />
          <Route path="/page2" element={<Page2 />} />
          <Route path="/page3" element={<Page3 />} />
          <Route path="/page4" element={<Page4 />} />
          <Route path="/page5" element={<Page5 />} />

          {/* ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route
              path="/admin"
              element={
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              }
            />

            <Route
              path="/admin/ad-spaces"
              element={
                <AppLayout>
                  <AdSpaces />
                </AppLayout>
              }
            />

            <Route
              path="/admin/pricing"
              element={
                <AppLayout>
                  <Pricing />
                </AppLayout>
              }
            />

            <Route
              path="/admin/ads"
              element={
                <AppLayout>
                  <Ads />
                </AppLayout>
              }
            />
          </Route>



          {/* ADVERTISER */}
          <Route element={<ProtectedRoute allowedRoles={["ADVERTISER"]} />}>
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <AdvertiserDashboard />
                </AppLayout>
              }
            />

            <Route
              path="/advertiser/ads"
              element={
                <AppLayout>
                  <MyAds />
                </AppLayout>
              }
            />

            <Route
              path="/buy-placement"
              element={
                <AppLayout>
                  <BuyPlacement />
                </AppLayout>
              }
            />

            <Route
              path="/orders"
              element={
                <AppLayout>
                  <Orders />
                </AppLayout>
              }
            />

            {/* <Route
              path="/analytics"
              element={
                <AppLayout>
                  <Analytics />
                </AppLayout>
              }
            /> */}
            
          </Route>

          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          {/* Unknown route */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;