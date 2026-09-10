import { useEffect, useState } from "react";
import { getMyOrders } from "../../services/order.service";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const loadOrders = async () => {
        try {
            setLoading(true);
            setMessage("");

            const response = await getMyOrders({
                page: 1,
                limit: 50,
            });

            setOrders(response.data?.orders || []);
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to load orders"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const formatDuration = (seconds) => {
        if (seconds >= 3600) {
            const hours = seconds / 3600;
            return `${hours} ${hours === 1 ? "hour" : "hours"}`;
        }

        return `${seconds} sec`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Orders</h1>
                    <p>
                        View your placement orders and payment status.
                    </p>
                </div>
            </div>

            {message && (
                <div className="card">
                    <p>{message}</p>
                </div>
            )}

            <div className="card">
                {loading ? (
                    <p>Loading orders...</p>
                ) : orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ad</th>
                                    <th>Page</th>
                                    <th>Position</th>
                                    <th>Size</th>
                                    <th>Date</th>
                                    <th>Duration</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <strong>
                                                {order.ad?.title || "—"}
                                            </strong>
                                        </td>

                                        <td>
                                            Page {order.adSpace?.pageNumber || "—"}
                                        </td>

                                        <td>
                                            {order.adSpace?.position || "—"}
                                        </td>

                                        <td>
                                            {order.adSpace?.size || "—"}
                                        </td>

                                        <td>
                                            {formatDate(order.date)}
                                        </td>

                                        <td>
                                            {formatDuration(
                                                order.durationSeconds
                                            )}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(order.totalPrice).toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge status-${order.status.toLowerCase()}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge status-${order.paymentStatus.toLowerCase()}`}
                                            >
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
