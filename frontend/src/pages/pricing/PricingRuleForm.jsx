import { useState } from "react";

const PricingRuleForm = ({
  adSpaceId,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [form, setForm] = useState({
    adSpaceId,
    startDate: "",
    endDate: "",
    price: 0,
    priority: 1,
    color: "#bfdbfe",
    details: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        ["price", "priority"].includes(name)
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
          <label>Start date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>End date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Price / hour</label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Priority</label>
          <input
            type="number"
            name="priority"
            min="1"
            value={form.priority}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Color</label>
          <input
            type="color"
            name="color"
            value={form.color}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full-span">
          <label>Details</label>
          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            placeholder="Optional pricing rule details"
            rows="3"
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
          type="submit"
          className="primary-button"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create pricing rule"}
        </button>
      </div>
    </form>
  );
};

export default PricingRuleForm;