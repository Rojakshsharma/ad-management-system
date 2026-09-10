import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";
import { getAdvertiserAnalytics } from "../../services/analytics.service";

const formatCurrency = (value = 0) =>
    `₹${Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

const formatDate = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
    });
};

const formatDuration = (seconds = 0) => {
    const total = Math.max(0, Number(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remaining = Math.floor(total % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${remaining}s`;
    }

    return `${remaining}s`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
        return null;
    }

    return (
        <div className="analytics-tooltip">
            <strong>{label}</strong>

            {payload.map((item) => (
                <div key={item.dataKey} className="analytics-tooltip-row">
                    <span>{item.name}</span>
                    <strong>
                        {item.dataKey === "spend"
                            ? formatCurrency(item.value)
                            : item.value}
                    </strong>
                </div>
            ))}
        </div>
    );
};

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [selectedAd, setSelectedAd] = useState("ALL");

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                setMessage("");

                const response = await getAdvertiserAnalytics();
                setAnalytics(response.data);
            } catch (error) {
                setMessage(
                    error.response?.data?.message ||
                        "Failed to load analytics"
                );
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    const summary = analytics?.summary || {};
    const orders = analytics?.orders || [];
    const intervals = analytics?.intervals || [];

    const adOptions = useMemo(() => {
        const map = new Map();

        orders.forEach((order) => {
            if (order.adId) {
                map.set(
                    order.adId,
                    order.ad?.title || "Advertisement"
                );
            }
        });

        return Array.from(map.entries());
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (selectedAd === "ALL") {
            return orders;
        }

        return orders.filter(
            (order) => order.adId === selectedAd
        );
    }, [orders, selectedAd]);

    const filteredIntervals = useMemo(() => {
        if (selectedAd === "ALL") {
            return intervals;
        }

        return intervals.filter(
            (interval) => interval.adId === selectedAd
        );
    }, [intervals, selectedAd]);

    const stats = useMemo(() => {
        const paidOrders = filteredOrders.filter(
            (order) => order.paymentStatus === "PAID"
        );

        const spend = paidOrders.reduce(
            (total, order) =>
                total + Number(order.totalPrice || 0),
            0
        );

        const displayDuration = filteredIntervals.reduce(
            (total, interval) =>
                total + Number(interval.durationSeconds || 0),
            0
        );

        const impressions = filteredIntervals.length;

        const clicks =
            selectedAd === "ALL"
                ? Number(summary.totalClicks || 0)
                : 0;

        return {
            totalOrders: filteredOrders.length,
            paidOrders: paidOrders.length,
            pendingOrders: filteredOrders.filter(
                (order) => order.paymentStatus !== "PAID"
            ).length,
            spend,
            impressions,
            clicks,
            displayDuration,
        };
    }, [
        filteredOrders,
        filteredIntervals,
        selectedAd,
        summary.totalClicks,
    ]);

    const ctr =
        stats.impressions > 0
            ? ((stats.clicks / stats.impressions) * 100).toFixed(2)
            : "0.00";

    const impressionsData = useMemo(() => {
        const map = new Map();

        filteredIntervals.forEach((interval) => {
            const date = new Date(interval.startAt);
            const key = date.toISOString().slice(0, 10);

            if (!map.has(key)) {
                map.set(key, {
                    date: key,
                    label: formatDate(interval.startAt),
                    impressions: 0,
                    displayTime: 0,
                });
            }

            const item = map.get(key);

            item.impressions += 1;
            item.displayTime += Number(
                interval.durationSeconds || 0
            );
        });

        return Array.from(map.values()).sort((a, b) =>
            a.date.localeCompare(b.date)
        );
    }, [filteredIntervals]);

    const spendData = useMemo(() => {
        const map = new Map();

        filteredOrders
            .filter(
                (order) => order.paymentStatus === "PAID"
            )
            .forEach((order) => {
                const date = new Date(order.date);
                const key = date.toISOString().slice(0, 10);

                if (!map.has(key)) {
                    map.set(key, {
                        date: key,
                        label: formatDate(order.date),
                        spend: 0,
                    });
                }

                map.get(key).spend += Number(
                    order.totalPrice || 0
                );
            });

        return Array.from(map.values()).sort((a, b) =>
            a.date.localeCompare(b.date)
        );
    }, [filteredOrders]);

    const orderStatusData = useMemo(
        () => [
            {
                name: "Paid",
                value: stats.paidOrders,
            },
            {
                name: "Pending",
                value: stats.pendingOrders,
            },
        ],
        [stats.paidOrders, stats.pendingOrders]
    );

    const adPerformanceData = useMemo(() => {
        const map = new Map();

        filteredOrders.forEach((order) => {
            if (!map.has(order.adId)) {
                map.set(order.adId, {
                    name:
                        order.ad?.title ||
                        "Advertisement",
                    spend: 0,
                    impressions: 0,
                    clicks: 0,
                });
            }

            const item = map.get(order.adId);

            if (order.paymentStatus === "PAID") {
                item.spend += Number(
                    order.totalPrice || 0
                );
            }
        });

        filteredIntervals.forEach((interval) => {
            const item = map.get(interval.adId);

            if (item) {
                item.impressions += 1;
            }
        });

        return Array.from(map.values());
    }, [filteredOrders, filteredIntervals]);

    if (loading) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Analytics</h1>
                        <p>
                            Loading your advertising
                            performance...
                        </p>
                    </div>
                </div>

                <div className="card analytics-loading">
                    Loading analytics...
                </div>
            </div>
        );
    }

    if (message) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Analytics</h1>
                        <p>
                            Monitor your advertising
                            performance.
                        </p>
                    </div>
                </div>

                <div className="placement-message">
                    {message}
                </div>
            </div>
        );
    }

    return (
        <div className="page-container advertiser-analytics-page">
            <div className="analytics-header">
                <div>
                    <h1>Analytics</h1>
                    <p>
                        Monitor your advertising
                        performance and campaign activity.
                    </p>
                </div>

                {/* <div className="analytics-filter">
                    <label>Advertisement</label>

                    <select
                        value={selectedAd}
                        onChange={(event) =>
                            setSelectedAd(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All advertisements
                        </option>

                        {adOptions.map(([id, title]) => (
                            <option
                                key={id}
                                value={id}
                            >
                                {title}
                            </option>
                        ))}
                    </select>
                </div> */}
            </div>

            <div className="analytics-summary-grid">
                <div className="card analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Spend</span>
                        <span className="analytics-stat-icon">
                            ₹
                        </span>
                    </div>

                    <strong>
                        {formatCurrency(stats.spend)}
                    </strong>

                    <small>
                        Total paid advertising spend
                    </small>
                </div>

                <div className="card analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Paid Orders</span>
                        <span className="analytics-stat-icon">
                            ✓
                        </span>
                    </div>

                    <strong>{stats.paidOrders}</strong>

                    <small>
                        {stats.totalOrders} total orders
                    </small>
                </div>

                <div className="card analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Impressions</span>
                        <span className="analytics-stat-icon">
                            ◉
                        </span>
                    </div>

                    <strong>{stats.impressions}</strong>

                    <small>
                        Recorded advertisement displays
                    </small>
                </div>

                <div className="card analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Clicks</span>
                        <span className="analytics-stat-icon">
                            ↗
                        </span>
                    </div>

                    <strong>{stats.clicks}</strong>

                    <small>{ctr}% click-through rate</small>
                </div>

                <div className="card analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Display Time</span>
                        <span className="analytics-stat-icon">
                            ◷
                        </span>
                    </div>

                    <strong>
                        {formatDuration(
                            stats.displayDuration
                        )}
                    </strong>

                    <small>
                        Total recorded display time
                    </small>
                </div>
            </div>

            <div className="analytics-chart-grid">
                <div className="card analytics-chart-card">
                    <div className="analytics-chart-header">
                        <div>
                            <h2>Impressions</h2>
                            <p>
                                Advertisement exposure over
                                time
                            </p>
                        </div>

                        <strong>
                            {stats.impressions}
                        </strong>
                    </div>

                    {impressionsData.length === 0 ? (
                        <div className="analytics-empty-chart">
                            <div>◌</div>
                            <strong>
                                No impressions yet
                            </strong>
                            <span>
                                Your impression activity
                                will appear here once ads
                                start serving.
                            </span>
                        </div>
                    ) : (
                        <div className="analytics-chart">
                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <LineChart
                                    data={
                                        impressionsData
                                    }
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <Tooltip
                                        content={
                                            <CustomTooltip />
                                        }
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="impressions"
                                        name="Impressions"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                        }}
                                        activeDot={{
                                            r: 7,
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="card analytics-chart-card">
                    <div className="analytics-chart-header">
                        <div>
                            <h2>Spend</h2>
                            <p>
                                Paid campaign spend over
                                time
                            </p>
                        </div>

                        <strong>
                            {formatCurrency(stats.spend)}
                        </strong>
                    </div>

                    {spendData.length === 0 ? (
                        <div className="analytics-empty-chart">
                            <div>₹</div>
                            <strong>
                                No paid spend yet
                            </strong>
                            <span>
                                Paid campaign spend will
                                appear here.
                            </span>
                        </div>
                    ) : (
                        <div className="analytics-chart">
                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <BarChart
                                    data={spendData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -10,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) =>
                                            `₹${value}`
                                        }
                                    />

                                    <Tooltip
                                        content={
                                            <CustomTooltip />
                                        }
                                    />

                                    <Bar
                                        dataKey="spend"
                                        name="Spend"
                                        fill="#172033"
                                        radius={[
                                            5,
                                            5,
                                            0,
                                            0,
                                        ]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div className="analytics-bottom-grid">
                <div className="card analytics-chart-card">
                    <div className="analytics-chart-header">
                        <div>
                            <h2>Order Status</h2>
                            <p>
                                Paid and pending orders
                            </p>
                        </div>
                    </div>

                    {stats.totalOrders === 0 ? (
                        <div className="analytics-empty-chart">
                            <div>◌</div>
                            <strong>
                                No orders yet
                            </strong>
                            <span>
                                Order status will appear
                                here.
                            </span>
                        </div>
                    ) : (
                        <div className="analytics-pie-wrapper">
                            <ResponsiveContainer
                                width="100%"
                                height={270}
                            >
                                <PieChart>
                                    <Pie
                                        data={
                                            orderStatusData
                                        }
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        <Cell fill="#172033" />
                                        <Cell fill="#cbd5e1" />
                                    </Pie>

                                    <Tooltip />

                                    <Legend
                                        verticalAlign="bottom"
                                        height={30}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="analytics-pie-center">
                                <strong>
                                    {stats.totalOrders}
                                </strong>
                                <span>Orders</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="card analytics-chart-card">
                    <div className="analytics-chart-header">
                        <div>
                            <h2>Ad Performance</h2>
                            <p>
                                Compare your advertisements
                            </p>
                        </div>
                    </div>

                    {adPerformanceData.length === 0 ? (
                        <div className="analytics-empty-chart">
                            <div>◌</div>
                            <strong>
                                No performance data
                            </strong>
                            <span>
                                Advertisement performance
                                will appear here.
                            </span>
                        </div>
                    ) : (
                        <div className="analytics-chart">
                            <ResponsiveContainer
                                width="100%"
                                height={270}
                            >
                                <BarChart
                                    data={
                                        adPerformanceData
                                    }
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 15,
                                        left: 15,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                    />

                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={90}
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="impressions"
                                        name="Impressions"
                                        fill="#2563eb"
                                        radius={[
                                            0,
                                            5,
                                            5,
                                            0,
                                        ]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div className="card analytics-performance-table">
                <div className="analytics-chart-header">
                    <div>
                        <h2>Campaign Overview</h2>
                        <p>
                            Detailed summary of your
                            advertising activity.
                        </p>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="analytics-table-empty">
                        No campaigns found.
                    </div>
                ) : (
                    <div className="analytics-table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Advertisement</th>
                                    <th>Placement</th>
                                    <th>Orders</th>
                                    <th>Spend</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {adOptions
                                    .filter(
                                        ([id]) =>
                                            selectedAd ===
                                                "ALL" ||
                                            id === selectedAd
                                    )
                                    .map(
                                        ([
                                            adId,
                                            title,
                                        ]) => {
                                            const adOrders =
                                                filteredOrders.filter(
                                                    (
                                                        order
                                                    ) =>
                                                        order.adId ===
                                                        adId
                                                );

                                            const adSpend =
                                                adOrders
                                                    .filter(
                                                        (
                                                            order
                                                        ) =>
                                                            order.paymentStatus ===
                                                            "PAID"
                                                    )
                                                    .reduce(
                                                        (
                                                            total,
                                                            order
                                                        ) =>
                                                            total +
                                                            Number(
                                                                order.totalPrice ||
                                                                    0
                                                            ),
                                                        0
                                                    );

                                            const paid =
                                                adOrders.filter(
                                                    (
                                                        order
                                                    ) =>
                                                        order.paymentStatus ===
                                                        "PAID"
                                                ).length;

                                            const placement =
                                                adOrders[0]
                                                    ?.adSpace;

                                            return (
                                                <tr
                                                    key={
                                                        adId
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                title
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        Page{" "}
                                                        {
                                                            placement?.pageNumber
                                                        }{" "}
                                                        ·{" "}
                                                        {
                                                            placement?.position
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            adOrders.length
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            formatCurrency(
                                                                adSpend
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`analytics-status ${
                                                                paid >
                                                                0
                                                                    ? "paid"
                                                                    : "pending"
                                                            }`}
                                                        >
                                                            {paid >
                                                            0
                                                                ? "Paid"
                                                                : "Pending"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
