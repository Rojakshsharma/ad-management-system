import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import {
    getAdminAds,
    updateAdStatus,
} from "../../services/add.service";

import AdTableSkeleton from "../../components/adds/AdTableSkeleton";

const Ads = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    const [status, setStatus] = useState("ALL");
    const [search, setSearch] = useState("");

    const [selectedAd, setSelectedAd] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const fetchAds = async (page = pagination.page) => {
        try {
            setLoading(true);

            const response = await getAdminAds({
                ...(status !== "ALL" && { status }),
                search,
                page,
                limit: 10,
            });

            setAds(response.data);

            setPagination(response.pagination);
        } catch (error) {
            console.error("Failed to fetch ads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPagination((current) => ({
            ...current,
            page: 1,
        }));

        fetchAds(1);
    }, [status, search]);

    const handlePageChange = (page) => {
        if (
            page < 1 ||
            page > pagination.totalPages ||
            page === pagination.page
        ) {
            return;
        }

        fetchAds(page);
    };

    const handleStatusChange = async (adId, newStatus) => {
        try {
            setUpdatingId(adId);

            await updateAdStatus(adId, newStatus);

            toast.success(
                `Ad status updated to ${newStatus.toLowerCase()}`
            );

            setSelectedAd(null);

            await fetchAds(pagination.page);
        } catch (error) {
            console.error("Failed to update ad status:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update ad status"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Ads</h1>
                    <p>Manage advertiser ads and verification.</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="ads-filter-bar">
                <div className="ads-search-box">
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>

                    <input
                        type="text"
                        placeholder="Search by title, advertiser or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="ads-status-filter">
                    <label>Status</label>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ALL">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Ads Table */}
            <div className="table-card">
                {loading ? (
                    <AdTableSkeleton />
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Ad</th>
                                <th>Advertiser</th>
                                <th>Target URL</th>
                                <th>Status</th>
                                <th>View</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ads.length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        No ads found.
                                    </td>
                                </tr>
                            ) : (
                                ads.map((ad) => (
                                    <tr key={ad.id}>
                                        {/* Ad */}
                                        <td>
                                            <div className="ad-table-info">
                                                {ad.imageUrl && (
                                                    <img
                                                        src={ad.imageUrl}
                                                        alt={ad.title}
                                                        className="ad-table-image"
                                                    />
                                                )}

                                                <div>
                                                    <strong>
                                                        {ad.title}
                                                    </strong>

                                                    <p>
                                                        {ad.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Advertiser */}
                                        <td>
                                            {ad.advertiser?.name}
                                            <br />
                                            <small>
                                                {ad.advertiser?.email}
                                            </small>
                                        </td>

                                        {/* Target URL */}
                                        <td>
                                            <a
                                                href={ad.targetUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Visit
                                            </a>
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <select
                                                className={`ad-status-select ${ad.status.toLowerCase()}`}
                                                value={ad.status}
                                                disabled={
                                                    updatingId === ad.id
                                                }
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        ad.id,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="PENDING">
                                                    Pending
                                                </option>

                                                <option value="APPROVED">
                                                    Approved
                                                </option>

                                                <option value="REJECTED">
                                                    Rejected
                                                </option>
                                            </select>
                                        </td>

                                        {/* View */}
                                        <td>
                                            <button
                                                className="ad-view-button"
                                                onClick={() =>
                                                    setSelectedAd(ad)
                                                }
                                                title="View ad"
                                            >
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.87 7.3 7.74 4 12 4s8.13 3.3 9.94 7.65a1 1 0 0 1 0 .7C20.13 16.7 16.26 20 12 20s-8.13-3.3-9.94-7.65Z" />
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="3"
                                                    />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={pagination.page === 1}
                        onClick={() =>
                            handlePageChange(
                                pagination.page - 1
                            )
                        }
                    >
                        Previous
                    </button>

                    {Array.from(
                        { length: pagination.totalPages },
                        (_, index) => index + 1
                    ).map((page) => (
                        <button
                            key={page}
                            className={
                                page === pagination.page
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                handlePageChange(page)
                            }
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        disabled={
                            pagination.page ===
                            pagination.totalPages
                        }
                        onClick={() =>
                            handlePageChange(
                                pagination.page + 1
                            )
                        }
                    >
                        Next
                    </button>
                </div>
            )}

            {/* View Ad Modal */}
            {selectedAd && (
                <div
                    className="ad-modal-overlay"
                    onClick={() => setSelectedAd(null)}
                >
                    <div
                        className="ad-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="ad-modal-header">
                            <div>
                                <h2>{selectedAd.title}</h2>
                                <p>Ad details</p>
                            </div>

                            <button
                                className="ad-modal-close"
                                onClick={() =>
                                    setSelectedAd(null)
                                }
                            >
                                ×
                            </button>
                        </div>

                        {selectedAd.imageUrl && (
                            <img
                                src={selectedAd.imageUrl}
                                alt={selectedAd.title}
                                className="ad-modal-image"
                            />
                        )}

                        <div className="ad-modal-content">
                            <div className="ad-modal-field">
                                <span>Description</span>
                                <p>
                                    {selectedAd.description}
                                </p>
                            </div>

                            <div className="ad-modal-field">
                                <span>Target URL</span>
                                <a
                                    href={selectedAd.targetUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {selectedAd.targetUrl}
                                </a>
                            </div>

                            <div className="ad-modal-field">
                                <span>Advertiser</span>
                                <p>
                                    {selectedAd.advertiser?.name}
                                    <br />
                                    <small>
                                        {
                                            selectedAd
                                                .advertiser
                                                ?.email
                                        }
                                    </small>
                                </p>
                            </div>

                            <div className="ad-modal-field">
                                <span>Status</span>

                                <select
                                    className={`ad-status-select ${selectedAd.status.toLowerCase()}`}
                                    value={selectedAd.status}
                                    disabled={
                                        updatingId ===
                                        selectedAd.id
                                    }
                                    onChange={(e) =>
                                        handleStatusChange(
                                            selectedAd.id,
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="APPROVED">
                                        Approved
                                    </option>

                                    <option value="REJECTED">
                                        Rejected
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ads;