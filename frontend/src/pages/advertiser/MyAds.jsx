import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import {
  getMyAds,
  createAd,
  updateAd,
} from "../../services/add.service";

import AdTableSkeleton from "../../components/adds/AdTableSkeleton";

const MyAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetUrl: "",
    image: null,
  });

  const fetchAds = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getMyAds({
        ...(status !== "ALL" && { status }),
        ...(search.trim() && {
          search: search.trim(),
        }),
        page,
        limit: 10,
      });

      setAds(response.data || []);

      setPagination(
        response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (error) {
      console.error("Failed to fetch ads:", error);

      setAds([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to load ads"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds(1);
  }, [search, status]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      targetUrl: "",
      image: null,
    });

    setEditingAd(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);

    setFormData({
      title: ad.title,
      description: ad.description,
      targetUrl: ad.targetUrl,
      image: null,
    });

    setShowForm(true);
  };

  const handleCloseForm = () => {
    if (formLoading) return;

    setShowForm(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setFormLoading(true);

      const data = new FormData();

      data.append("title", formData.title);
      data.append(
        "description",
        formData.description
      );
      data.append(
        "targetUrl",
        formData.targetUrl
      );

      if (formData.image) {
        data.append("image", formData.image);
      }

      if (editingAd) {
        await updateAd(
          editingAd.id,
          data
        );

        toast.success(
          "Ad updated successfully and sent for verification"
        );
      } else {
        if (!formData.image) {
          toast.error("Please select an image");
          return;
        }

        await createAd(data);

        toast.success(
          "Ad created successfully and sent for verification"
        );
      }

      setShowForm(false);
      resetForm();

      await fetchAds(pagination.page);
    } catch (error) {
      console.error(
        "Failed to save ad:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to save ad"
      );
    } finally {
      setFormLoading(false);
    }
  };

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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Ads</h1>
          <p>
            Manage your advertisements and
            verification status.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={handleCreate}
        >
          Create Ad
        </button>
      </div>

      {/* FILTERS */}

      <div className="ads-filter-bar">
        <div className="ads-search-box">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
            />
            <path d="m21 21-4.3-4.3" />
          </svg>

          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="ads-status-filter">
          <label>Status</label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option value="ALL">All</option>
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

      {/* TABLE */}

      <div className="table-card">
        {loading ? (
          <AdTableSkeleton />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>Target URL</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
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

                    <td>
                      <a
                        href={ad.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit
                      </a>
                    </td>

                    <td>
                      <span
                        className={`ad-status-badge ${ad.status.toLowerCase()}`}
                      >
                        {ad.status}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        ad.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {ad.status !==
                        "APPROVED" && (
                        <button
                          className="ad-edit-button"
                          onClick={() =>
                            handleEdit(ad)
                          }
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}

      {!loading &&
        pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={
                pagination.page === 1
              }
              onClick={() =>
                handlePageChange(
                  pagination.page - 1
                )
              }
            >
              Previous
            </button>

            {Array.from(
              {
                length:
                  pagination.totalPages,
              },
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

      {/* CREATE / EDIT MODAL */}

      {showForm && (
        <div
          className="ad-modal-overlay"
          onClick={handleCloseForm}
        >
          <div
            className="ad-form-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="ad-modal-header">
              <div>
                <h2>
                  {editingAd
                    ? "Edit Ad"
                    : "Create Ad"}
                </h2>

                <p>
                  {editingAd
                    ? "Update your advertisement."
                    : "Create a new advertisement."}
                </p>
              </div>

              <button
                className="ad-modal-close"
                onClick={handleCloseForm}
              >
                ×
              </button>
            </div>

            <form
              className="ad-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label>Title</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  required
                  disabled={formLoading}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>
                  Target URL
                </label>

                <input
                  type="url"
                  name="targetUrl"
                  value={
                    formData.targetUrl
                  }
                  onChange={handleChange}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label>
                  Image
                  {!editingAd && " *"}
                </label>

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  disabled={formLoading}
                  required={!editingAd}
                />

                {editingAd &&
                  editingAd.imageUrl && (
                    <img
                      src={
                        editingAd.imageUrl
                      }
                      alt={editingAd.title}
                      className="ad-form-preview"
                    />
                  )}
              </div>

              <div className="ad-form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    handleCloseForm
                  }
                  disabled={formLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Saving..."
                    : editingAd
                    ? "Update Ad"
                    : "Create Ad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAds;