import { useEffect, useState } from "react";
import { getMyAds } from "../../services/add.service";
import { getAvailability } from "../../services/placement.service";
import { createOrder, payOrder } from "../../services/order.service";
import Modal from "../../components/common/Modal";

const formatDuration = (seconds = 0) => {
    const totalSeconds = Math.max(0, Number(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    const parts = [];

    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) {
        parts.push(`${remainingSeconds}s`);
    }

    return parts.join(" ");
};

const BuyPlacement = () => {
    const [ads, setAds] = useState([]);

    const [form, setForm] = useState({
        adId: "",
        pageNumber: "1",
        position: "TOP",
        size: "BANNER",
        date: "",
        durationSeconds: "3600",
    });

    const [availability, setAvailability] = useState(null);
    const [order, setOrder] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadAds = async () => {
            try {
                const response = await getMyAds({
                    page: 1,
                    limit: 100,
                    status: "APPROVED",
                });

                setAds(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                setMessage(
                    error.response?.data?.message ||
                        "Failed to load approved ads"
                );
            }
        };

        loadAds();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

        setAvailability(null);
        setOrder(null);
        setPaymentModalOpen(false);
        setPaymentSuccess(false);
        setTransactionId("");
        setMessage("");
    };

    const checkAvailability = async () => {
        if (!form.adId || !form.date) {
            setMessage("Please select an ad and date");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await getAvailability({
                pageNumber: Number(form.pageNumber),
                position: form.position,
                size: form.size,
                date: form.date,
            });

            setAvailability(response.data);
        } catch (error) {
            setAvailability(null);
            setMessage(
                error.response?.data?.message ||
                    "Failed to check availability"
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!availability) return;

        try {
            setLoading(true);
            setMessage("");

            const response = await createOrder({
                adId: form.adId,
                adSpaceId: availability.adSpace.id,
                date: form.date,
                durationSeconds: Number(form.durationSeconds),
            });

            const createdOrder = response.data;

            if (!createdOrder?.id) {
                throw new Error("Invalid order response");
            }

            if (
                createdOrder.status !== "PENDING" ||
                createdOrder.paymentStatus !== "PENDING"
            ) {
                throw new Error(
                    "Order was created with an unexpected status"
                );
            }

            setOrder(createdOrder);
            setPaymentSuccess(false);
            setTransactionId("");
            setPaymentModalOpen(true);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to create order"
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (
            !order?.id ||
            order.status !== "PENDING" ||
            order.paymentStatus !== "PENDING"
        ) {
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await payOrder(order.id);
            const paidOrder = response.data?.order;

            if (!paidOrder?.id) {
                throw new Error("Invalid payment response");
            }

            if (
                paidOrder.status !== "CONFIRMED" ||
                paidOrder.paymentStatus !== "PAID"
            ) {
                throw new Error(
                    "Payment response returned an unexpected order status"
                );
            }

            setOrder(paidOrder);
            setTransactionId(response.data?.transactionId || "");
            setPaymentSuccess(true);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    error.message ||
                    "Payment failed"
            );
        } finally {
            setLoading(false);
        }
    };

    const closePaymentModal = () => {
        if (loading) return;

        setPaymentModalOpen(false);

        if (paymentSuccess) {
            setMessage(
                transactionId
                    ? `Payment successful. Transaction ID: ${transactionId}`
                    : "Payment successful. Order confirmed."
            );
        }
    };

    const selectedDuration = Number(form.durationSeconds);

    const totalSeconds =
        availability?.capacity?.totalSeconds || 86400;

    const bookedSeconds =
        availability?.capacity?.bookedSeconds || 0;

    const remainingSeconds =
        availability?.capacity?.remainingSeconds || 0;

    const canFitSelectedDuration =
        remainingSeconds >= selectedDuration;

    const bookedPercentage =
        totalSeconds > 0
            ? Math.min((bookedSeconds / totalSeconds) * 100, 100)
            : 0;

    const selectedAd = ads.find(
        (ad) => ad.id === form.adId
    );

    return (
        <div className="page-container buy-placement-page">
            <div className="page-header">
                <div>
                    <h1>Buy Placement</h1>
                    <p>
                        Choose where and how long you want your ad to run.
                    </p>
                </div>
            </div>

            <div className="card placement-selection-card">
                <div className="section-heading">
                    <div>
                        <h2>Placement Details</h2>
                        <p>
                            Select your approved advertisement and preferred
                            placement.
                        </p>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Advertisement</label>

                        <select
                            name="adId"
                            value={form.adId}
                            onChange={handleChange}
                        >
                            <option value="">
                                {ads.length > 0
                                    ? "Select approved ad"
                                    : "No approved ads found"}
                            </option>

                            {ads.map((ad) => (
                                <option key={ad.id} value={ad.id}>
                                    {ad.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Page</label>

                        <select
                            name="pageNumber"
                            value={form.pageNumber}
                            onChange={handleChange}
                        >
                            {[1, 2, 3, 4, 5].map((page) => (
                                <option key={page} value={page}>
                                    Page {page}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Position</label>

                        <select
                            name="position"
                            value={form.position}
                            onChange={handleChange}
                        >
                            <option value="TOP">Top</option>
                            <option value="MID">Middle</option>
                            <option value="BOTTOM">Bottom</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Size</label>

                        <select
                            name="size"
                            value={form.size}
                            onChange={handleChange}
                        >
                            <option value="BANNER">Banner</option>
                            <option value="GRID">Grid</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Date</label>

                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Duration</label>

                        <select
                            name="durationSeconds"
                            value={form.durationSeconds}
                            onChange={handleChange}
                        >
                            <option value="15">15 seconds</option>
                            <option value="30">30 seconds</option>
                            <option value="3600">1 hour</option>
                            <option value="7200">2 hours</option>
                        </select>
                    </div>
                </div>

                <div className="placement-action">
                    <button
                        className="primary-button"
                        onClick={checkAvailability}
                        disabled={loading || ads.length === 0}
                    >
                        {loading ? "Checking..." : "Check Availability"}
                    </button>
                </div>
            </div>

            {message && (
                <div className="placement-message">
                    {message}
                </div>
            )}

            {availability && (
                <div className="card availability-card">
                    <div className="availability-header">
                        <div>
                            <span className="eyebrow">
                                AVAILABLE PLACEMENT
                            </span>

                            <h2>
                                Page {availability.adSpace.pageNumber} ·{" "}
                                {availability.adSpace.position}
                            </h2>

                            <p>
                                {availability.adSpace.size} placement
                                {selectedAd
                                    ? ` for ${selectedAd.title}`
                                    : ""}
                            </p>
                        </div>

                        <div
                            className={`availability-badge ${
                                availability.capacity.available &&
                                canFitSelectedDuration
                                    ? "available"
                                    : "unavailable"
                            }`}
                        >
                            <span />

                            {availability.capacity.available &&
                            canFitSelectedDuration
                                ? "Available"
                                : "Not Available"}
                        </div>
                    </div>

                    <div className="availability-stats">
                        <div className="availability-stat">
                            <span>Price / hour</span>
                            <strong>
                                ₹{availability.pricing.pricePerHour}
                            </strong>
                        </div>

                        <div className="availability-stat">
                            <span>Daily capacity</span>
                            <strong>
                                {formatDuration(totalSeconds)}
                            </strong>
                        </div>

                        <div className="availability-stat">
                            <span>Already booked</span>
                            <strong>
                                {formatDuration(bookedSeconds)}
                            </strong>
                        </div>

                        <div className="availability-stat highlight">
                            <span>Remaining</span>
                            <strong>
                                {formatDuration(remainingSeconds)}
                            </strong>
                        </div>
                    </div>

                    <div className="capacity-section">
                        <div className="capacity-header">
                            <span>Daily capacity usage</span>

                            <strong>
                                {Math.round(bookedPercentage)}% booked
                            </strong>
                        </div>

                        <div className="capacity-bar">
                            <div
                                className="capacity-bar-fill"
                                style={{
                                    width: `${bookedPercentage}%`,
                                }}
                            />
                        </div>

                        <div className="capacity-footer">
                            <span>
                                {formatDuration(bookedSeconds)} used
                            </span>

                            <span>
                                {formatDuration(remainingSeconds)} available
                            </span>
                        </div>
                    </div>

                    <div className="booking-summary">
                        <div>
                            <span>Your selected duration</span>
                            <strong>
                                {formatDuration(selectedDuration)}
                            </strong>
                        </div>

                        <div>
                            <span>After booking</span>
                            <strong>
                                {formatDuration(
                                    Math.max(
                                        0,
                                        remainingSeconds - selectedDuration
                                    )
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Placement</span>
                            <strong>
                                {availability.adSpace.position}
                            </strong>
                        </div>
                    </div>

                    <div className="availability-action">
                        {availability.capacity.available &&
                        canFitSelectedDuration ? (
                            <>
                                <div>
                                    <strong>Ready to reserve?</strong>
                                    <p>
                                        Your selected placement has enough
                                        available capacity.
                                    </p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={handlePurchase}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Reserving..."
                                        : "Reserve Placement"}
                                </button>
                            </>
                        ) : (
                            <div className="capacity-warning">
                                <strong>
                                    Not enough available capacity
                                </strong>

                                <p>
                                    Only{" "}
                                    {formatDuration(remainingSeconds)}{" "}
                                    is available for this placement.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {paymentModalOpen && order && (
                <Modal
                    title={
                        paymentSuccess
                            ? "Payment Complete"
                            : "Complete Payment"
                    }
                    onClose={closePaymentModal}
                >
                    <div className="placement-payment-modal">
                        {!paymentSuccess ? (
                            <>
                                <div className="placement-payment-intro">
                                    <span className="eyebrow">
                                        PAYMENT
                                    </span>

                                    <h3>Confirm your placement</h3>

                                    <p>
                                        Your placement is reserved. Complete
                                        payment to confirm your order.
                                    </p>
                                </div>

                                <div className="placement-payment-summary">
                                    <div>
                                        <span>Advertisement</span>
                                        <strong>
                                            {selectedAd?.title ||
                                                "Advertisement"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Placement</span>
                                        <strong>
                                            Page{" "}
                                            {
                                                availability?.adSpace
                                                    ?.pageNumber
                                            }{" "}
                                            ·{" "}
                                            {
                                                availability?.adSpace
                                                    ?.position
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Date</span>
                                        <strong>
                                            {new Date(
                                                order.date
                                            ).toLocaleDateString("en-IN")}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Duration</span>
                                        <strong>
                                            {formatDuration(
                                                order.durationSeconds
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                <div className="placement-payment-card">
                                    <div className="placement-payment-card-top">
                                        <span>DEMO PAYMENT</span>
                                        <strong>•••• 4242</strong>
                                    </div>

                                    <div className="placement-payment-card-number">
                                        4242 4242 4242 4242
                                    </div>

                                    <div className="placement-payment-card-bottom">
                                        <span>DEMO CUSTOMER</span>
                                        <span>12/28</span>
                                    </div>
                                </div>

                                <div className="placement-payment-total">
                                    <span>Total Amount</span>

                                    <strong>
                                        ₹
                                        {Number(order.totalPrice).toFixed(
                                            2
                                        )}
                                    </strong>
                                </div>

                                <button
                                    className="placement-payment-button"
                                    onClick={handlePayment}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Processing Payment..."
                                        : `Pay ₹${Number(
                                              order.totalPrice
                                          ).toFixed(2)}`}
                                </button>

                                <p className="placement-payment-note">
                                    This is a demo payment. No real money
                                    will be charged.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="placement-payment-success">
                                    <div className="placement-payment-success-icon">
                                        ✓
                                    </div>

                                    <h3>Payment Successful</h3>

                                    <p>
                                        Your placement has been confirmed
                                        successfully.
                                    </p>
                                </div>

                                <div className="placement-payment-confirmation">
                                    <div>
                                        <span>Order ID</span>
                                        <strong>{order.id}</strong>
                                    </div>

                                    <div>
                                        <span>Amount Paid</span>
                                        <strong>
                                            ₹
                                            {Number(
                                                order.totalPrice
                                            ).toFixed(2)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Payment Status</span>
                                        <strong>
                                            {order.paymentStatus}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Transaction ID</span>
                                        <strong>
                                            {transactionId || "—"}
                                        </strong>
                                    </div>
                                </div>

                                <button
                                    className="placement-payment-button"
                                    onClick={closePaymentModal}
                                >
                                    Done
                                </button>
                            </>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default BuyPlacement;