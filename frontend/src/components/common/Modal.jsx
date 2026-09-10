import { X } from "lucide-react";

const Modal = ({ title, children, onClose }) => {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>

          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Modal;