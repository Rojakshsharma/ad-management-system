import { useEffect, useState } from "react";
import { RefreshCw, Plus } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../../components/common/Modal";
import PricingRuleForm from "../pricing/PricingRuleForm";

import {
    createPricingRule,
    getPricingRules,
    updatePricingRule,
} from "../../services/pricingRule.service";

import { getAdSpaces } from "../../services/adspace.service";

const Pricing = () => {
    const [spaces, setSpaces] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState("");
    const [rules, setRules] = useState([]);

    const [loadingSpaces, setLoadingSpaces] = useState(true);
    const [loadingRules, setLoadingRules] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [editingRule, setEditingRule] = useState(null);


    const fetchSpaces = async () => {
        try {
            setLoadingSpaces(true);

            const data = await getAdSpaces();
            setSpaces(data);

            if (data.length > 0) {
                setSelectedSpace(data[0].id);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load ad spaces"
            );
        } finally {
            setLoadingSpaces(false);
        }
    };

    const fetchRules = async () => {
        if (!selectedSpace) return;

        try {
            setLoadingRules(true);

            const data = await getPricingRules(selectedSpace);
            setRules(data);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load pricing rules"
            );
        } finally {
            setLoadingRules(false);
        }
    };

    const openCreateModal = () => {
        setEditingRule(null);
        setModalOpen(true);
    };

    const openEditModal = (rule) => {
        setEditingRule(rule);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (!saving) {
            setModalOpen(false);
        }
    };

    const handleCreateRule = async (formData) => {
        try {
            setSaving(true);

            await createPricingRule(formData);

            toast.success("Pricing rule created successfully");

            closeModal();
            await fetchRules();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Failed to create pricing rule";

            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateRule = async (formData) => {
        try {
            setSaving(true);

            await updatePricingRule(editingRule.id, formData);

            toast.success("Pricing rule updated successfully");

            closeModal();
            setEditingRule(null);

            await fetchRules();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Failed to update pricing rule";

            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSpaces();
    }, []);

    useEffect(() => {
        fetchRules();
    }, [selectedSpace]);

    return (
        <div>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">Configuration</p>

                    <h2>Pricing</h2>

                    <p className="page-description">
                        Manage date-based pricing rules for your ad spaces.
                    </p>
                </div>

                <button
                    className="secondary-button"
                    onClick={fetchRules}
                    disabled={loadingRules || !selectedSpace}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <div>
                        <h3>Select ad space</h3>

                        <p>
                            Choose an ad space to view its pricing rules.
                        </p>
                    </div>
                </div>

                <div className="form-group pricing-space-select">
                    <label>Ad space</label>

                    <select
                        value={selectedSpace}
                        onChange={(e) => setSelectedSpace(e.target.value)}
                        disabled={loadingSpaces}
                    >
                        {spaces.map((space) => (
                            <option key={space.id} value={space.id}>
                                Page {space.pageNumber} • {space.position} •{" "}
                                {space.size} • {space.year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="content-card pricing-rules-card">
                <div className="card-header">
                    <div>
                        <h3>Pricing rules</h3>

                        <p>
                            {rules.length} configured rules
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={openCreateModal}
                        disabled={!selectedSpace}
                    >
                        <Plus size={17} />
                        Add pricing rule
                    </button>
                </div>

                {loadingRules ? (
                    <div className="empty-state">
                        <p>Loading pricing rules...</p>
                    </div>
                ) : rules.length === 0 ? (
                    <div className="empty-state">
                        <h3>No pricing rules</h3>

                        <p>
                            This ad space currently uses its base price.
                        </p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date range</th>
                                    <th>Price / hour</th>
                                    <th>Priority</th>
                                    <th>Color</th>
                                    <th>Details</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {rules.map((rule) => (
                                    <tr key={rule.id}>
                                        <td>
                                            {new Date(
                                                rule.startDate
                                            ).toLocaleDateString("en-IN")}{" "}
                                            -{" "}
                                            {new Date(
                                                rule.endDate
                                            ).toLocaleDateString("en-IN")}
                                        </td>

                                        <td>
                                            <strong>
                                                ₹
                                                {Number(
                                                    rule.price
                                                ).toLocaleString("en-IN")}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className="badge">
                                                {rule.priority}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className="pricing-color"
                                                style={{
                                                    backgroundColor: rule.color,
                                                }}
                                                title={rule.color}
                                            />
                                        </td>
                                        <td>
                                            {rule.details || "-"}
                                        </td>

                                        <td>
                                            <button
                                                className="secondary-button"
                                                onClick={() =>
                                                    openEditModal(rule)
                                                }
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen && (
                <Modal
                    title={
                        editingRule
                            ? "Update pricing rule"
                            : "Create pricing rule"
                    }
                    onClose={closeModal}
                >
                    <PricingRuleForm
                        adSpaceId={selectedSpace}
                        initialData={editingRule}
                        onSubmit={
                            editingRule
                                ? handleUpdateRule
                                : handleCreateRule
                        }
                        onCancel={closeModal}
                        loading={saving}
                    />
                </Modal>
            )}
        </div>
    );
};

export default Pricing;
