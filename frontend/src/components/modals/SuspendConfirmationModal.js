const SuspendConfirmationModal = ({ onClose, onConfirm, user, isSuspending }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
          {isSuspending
            ? `Are you sure you want to suspend ${user.userFirstName || ''} ${user.userLastName || ''}?`
            : `Are you sure you want to reactivate ${user.userFirstName || ''} ${user.userLastName || ''}?`}
        </h3>
        <p style={{ marginBottom: "24px", color: "#666" }}>
          {isSuspending
            ? "This user will no longer be able to access the system until reactivated."
            : "This will restore the user's access to the system."}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 24px",
              backgroundColor: "#90EE90",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "8px 24px",
              backgroundColor: "#ffcccb",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendConfirmationModal;
