import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import AdSpaceTableSkeleton from "../addSpaces/AdSpaceTableSkeleton";
import toast from "react-hot-toast";

import {
    getAdSpaces,
    createAdSpace,
    updateAdSpace,
} from "../../services/adspace.service";

import Modal from "../../components/common/Modal";
import AdSpaceForm from "../addSpaces/AdSpaceForm";
import AdSpaceTable from "../addSpaces/AdSpaceTable";

const AdSpaces = () => {
    const [spaces, setSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingSpace, setEditingSpace] = useState(null);

    const [error, setError] = useState("");

    const fetchSpaces = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdSpaces();
            setSpaces(data);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load ad spaces"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpaces();
    }, []);

    const openCreateModal = () => {
        setEditingSpace(null);
        setModalOpen(true);
    };

    const openEditModal = (space) => {
        setEditingSpace(space);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (!saving) {
            setModalOpen(false);
            setEditingSpace(null);
        }
    };

   const handleSubmit = async (formData) => {
    try {
        setSaving(true);
        setError("");

        if (editingSpace) {
            await updateAdSpace(editingSpace.id, formData);
            toast.success("Ad space updated successfully");
        } else {
            await createAdSpace(formData);
            toast.success("Ad space created successfully");
        }

        closeModal();
        await fetchSpaces();
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "Failed to save ad space";

        setError(message);
        toast.error(message);
    } finally {
        setSaving(false);
    }
};

    return (
        <div>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">Configuration</p>

                    <h2>Ad spaces</h2>

                    <p className="page-description">
                        Configure the available advertising positions across
                        your pages.
                    </p>
                </div>

                <div className="heading-actions">
                    <button
                        className="secondary-button"
                        onClick={fetchSpaces}
                        disabled={loading}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    <button
                        className="primary-button"
                        onClick={openCreateModal}
                    >
                        <Plus size={17} />
                        Add ad space
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            <div className="content-card">
                <div className="card-header">
                    <div>
                        <h3>All ad spaces</h3>
                        <p>
                            {spaces.length} configured spaces
                        </p>
                    </div>
                </div>

                {loading ? (
                    <AdSpaceTableSkeleton />
                ) : (
                    <AdSpaceTable
                        spaces={spaces}
                        onEdit={openEditModal}
                    />
                )}
            </div>

            {modalOpen && (
                <Modal
                    title={
                        editingSpace
                            ? "Edit ad space"
                            : "Create ad space"
                    }
                    onClose={closeModal}
                >
                    <AdSpaceForm
                        initialData={editingSpace}
                        onSubmit={handleSubmit}
                        onCancel={closeModal}
                        loading={saving}
                    />
                </Modal>
            )}
        </div>
    );
};

export default AdSpaces;