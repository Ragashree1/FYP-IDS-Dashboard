"use client"

const RejectConfirmationModal = ({ user, onClose, onConfirm }) => {
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
        }}
      >
        <h2 style={{ marginTop: 0 }}>Reject Organization Request</h2>
        <p>Are you sure you want to reject the request from {user.userComName}?</p>
        <p style={{ fontSize: "14px", color: "#666" }}>
          This will mark the account as rejected and the user will not be able to log in.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#d32f2f",
              color: "white",
              cursor: "pointer",
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

export default RejectConfirmationModal

