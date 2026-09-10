import { useEffect, useState } from "react";
import { getAdminAnalytics } from "../../services/analytics.service";

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const response = await getAdminAnalytics();

                // Supports:
                // { summary: {...} }
                // OR
                // { success: true, data: { summary: {...} } }

                const data = response?.data?.summary
                    ? response.data
                    : response;

                setAnalytics(data);
            } catch (error) {
                console.error(
                    "Failed to load admin analytics:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    const summary = analytics?.summary || {};

    const totalAdSpaces = Number(
        summary.totalAdSpaces || 0
    );

    const totalAds = Number(
        summary.totalAds || 0
    );

    const approvedAds = Number(
        summary.approvedAds || 0
    );

    const pendingAds = Number(
        summary.pendingAds || 0
    );

    const totalOrders = Number(
        summary.totalOrders || 0
    );

    const paidOrders = Number(
        summary.paidOrders || 0
    );

    const totalRevenue = Number(
        summary.totalRevenue || 0
    );

    const totalImpressions = Number(
        summary.totalImpressions || 0
    );

    const totalClicks = Number(
        summary.totalClicks || 0
    );

    const maxActivity = Math.max(
        totalImpressions,
        totalClicks,
        1
    );

    const maxOrders = Math.max(
        totalOrders,
        1
    );

    const maxRevenue = Math.max(
        totalRevenue,
        1
    );

    const paidOrderPercentage =
        totalOrders > 0
            ? Math.round(
                  (paidOrders / totalOrders) * 100
              )
            : 0;

    const approvedAdPercentage =
        totalAds > 0
            ? Math.round(
                  (approvedAds / totalAds) * 100
              )
            : 0;

    return (
        <div className="admin-dashboard">

            <div className="page-heading">
                <div>
                    <p className="eyebrow">
                        Overview
                    </p>

                    <h2>
                        Admin dashboard
                    </h2>

                    <p className="page-description">
                        Manage your advertising platform from one place.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-loading">
                    Loading dashboard...
                </div>
            ) : (
                <>
                    {/* TOP STATS */}

                    <div className="stats-grid">

                        <div className="stat-card">
                            <span>
                                Ad spaces
                            </span>

                            <strong>
                                {totalAdSpaces}
                            </strong>

                            <small>
                                Across 5 pages
                            </small>
                        </div>

                        <div className="stat-card">
                            <span>
                                Total ads
                            </span>

                            <strong>
                                {totalAds}
                            </strong>

                            <small>
                                {approvedAds} approved
                            </small>
                        </div>

                        <div className="stat-card">
                            <span>
                                Pending ads
                            </span>

                            <strong>
                                {pendingAds}
                            </strong>

                            <small>
                                Awaiting review
                            </small>
                        </div>

                        <div className="stat-card">
                            <span>
                                Total orders
                            </span>

                            <strong>
                                {totalOrders}
                            </strong>

                            <small>
                                {paidOrders} paid
                            </small>
                        </div>

                        <div className="stat-card">
                            <span>
                                Total revenue
                            </span>

                            <strong>
                                ₹{totalRevenue.toFixed(2)}
                            </strong>

                            <small>
                                From paid orders
                            </small>
                        </div>

                    </div>


                    {/* ACTIVITY + ORDERS */}

                    <div className="admin-dashboard-grid">

                        <div className="dashboard-card">

                            <div className="dashboard-card-header">
                                <div>
                                    <p className="eyebrow">
                                        ACTIVITY
                                    </p>

                                    <h3>
                                        Ad engagement
                                    </h3>

                                    <p>
                                        Total recorded impressions and clicks.
                                    </p>
                                </div>
                            </div>

                            <div className="activity-chart">

                                <div className="activity-item">

                                    <div className="activity-label">
                                        <span>
                                            Impressions
                                        </span>

                                        <strong>
                                            {totalImpressions}
                                        </strong>
                                    </div>

                                    <div className="activity-bar">
                                        <div
                                            className="activity-bar-fill"
                                            style={{
                                                width: `${
                                                    (totalImpressions /
                                                        maxActivity) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    </div>

                                </div>


                                <div className="activity-item">

                                    <div className="activity-label">
                                        <span>
                                            Clicks
                                        </span>

                                        <strong>
                                            {totalClicks}
                                        </strong>
                                    </div>

                                    <div className="activity-bar">
                                        <div
                                            className="activity-bar-fill"
                                            style={{
                                                width: `${
                                                    (totalClicks /
                                                        maxActivity) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="dashboard-card">

                            <div className="dashboard-card-header">
                                <div>
                                    <p className="eyebrow">
                                        ORDERS
                                    </p>

                                    <h3>
                                        Order overview
                                    </h3>

                                    <p>
                                        Current order and payment activity.
                                    </p>
                                </div>
                            </div>

                            <div className="order-chart">

                                <div className="order-chart-item">

                                    <div className="order-chart-value">
                                        <strong>
                                            {totalOrders}
                                        </strong>

                                        <span>
                                            Total
                                        </span>
                                    </div>

                                    <div className="order-bar">
                                        <div
                                            className="order-bar-fill"
                                            style={{
                                                width: "100%",
                                            }}
                                        />
                                    </div>

                                </div>


                                <div className="order-chart-item">

                                    <div className="order-chart-value">
                                        <strong>
                                            {paidOrders}
                                        </strong>

                                        <span>
                                            Paid
                                        </span>
                                    </div>

                                    <div className="order-bar">
                                        <div
                                            className="order-bar-fill"
                                            style={{
                                                width: `${
                                                    (paidOrders /
                                                        maxOrders) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    </div>

                                </div>

                            </div>

                            <div className="dashboard-card-footer">
                                {paidOrderPercentage}% of orders paid
                            </div>

                        </div>

                    </div>


                    {/* REVENUE */}

                    <div className="dashboard-card revenue-card">

                        <div className="dashboard-card-header">

                            <div>
                                <p className="eyebrow">
                                    REVENUE
                                </p>

                                <h3>
                                    Platform revenue
                                </h3>

                                <p>
                                    Revenue generated from paid orders.
                                </p>
                            </div>

                            <strong className="dashboard-revenue">
                                ₹{totalRevenue.toFixed(2)}
                            </strong>

                        </div>


                        <div className="revenue-visual">

                            <div className="revenue-axis">
                                <span>
                                    ₹0
                                </span>

                                <span>
                                    ₹{totalRevenue.toFixed(0)}
                                </span>
                            </div>

                            <div className="revenue-bar">
                                <div
                                    className="revenue-bar-fill"
                                    style={{
                                        width: `${
                                            totalRevenue > 0
                                                ? (totalRevenue /
                                                      maxRevenue) *
                                                  100
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>

                        </div>

                    </div>


                    {/* AD STATUS */}

                    <div className="dashboard-card">

                        <div className="dashboard-card-header">

                            <div>
                                <p className="eyebrow">
                                    ADS
                                </p>

                                <h3>
                                    Advertisement status
                                </h3>

                                <p>
                                    Current advertisement approval status.
                                </p>
                            </div>

                        </div>


                        <div className="ad-status-grid">

                            <div className="ad-status-item">
                                <span>
                                    Total ads
                                </span>

                                <strong>
                                    {totalAds}
                                </strong>
                            </div>

                            <div className="ad-status-item">
                                <span>
                                    Approved
                                </span>

                                <strong>
                                    {approvedAds}
                                </strong>

                                <small>
                                    {approvedAdPercentage}%
                                </small>
                            </div>

                            <div className="ad-status-item">
                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {pendingAds}
                                </strong>
                            </div>

                        </div>

                    </div>

                </>
            )}

        </div>
    );
};

export default AdminDashboard;

