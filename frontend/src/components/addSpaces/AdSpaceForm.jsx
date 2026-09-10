import { useState } from "react";

const AdSpaceForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [form, setForm] = useState({
    pageNumber: initialData?.pageNumber || 1,
    position: initialData?.position || "TOP",
    size: initialData?.size || "BANNER",
    year: initialData?.year || 2026,
    basePrice: initialData?.basePrice
      ? Number(initialData.basePrice)
      : 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        ["pageNumber", "year", "basePrice"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
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
          <label>Year</label>

          <input
            type="number"
            name="year"
            min="2026"
            value={form.year}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full-span">
          <label>Base price / hour</label>

          <input
            type="number"
            name="basePrice"
            min="0"
            step="0.01"
            value={form.basePrice}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          className="primary-button"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : initialData
            ? "Save changes"
            : "Create ad space"}
        </button>
      </div>
    </form>
  );
};

export default AdSpaceForm;