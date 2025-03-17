"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"

const userRole = "network-admin"

// New AddPlaybookModal component that matches the design in the images
const AddPlaybookModal = ({ onClose, onSave }) => {
  const [playbookName, setPlaybookName] = useState("")
  const [description, setDescription] = useState("")
  const [occurrenceThreshold, setOccurrenceThreshold] = useState(3)
  const [conditions, setConditions] = useState([{ id: 1, field: "Alert Category", value: "" }])
  const [status, setStatus] = useState(true)
  const [blockIP, setBlockIP] = useState(true)
  const [sendEmailAlert, setSendEmailAlert] = useState(true)
  const [emailRecipients, setEmailRecipients] = useState("")

  const handleAddCondition = () => {
    const newCondition = {
      id: conditions.length + 1,
      field: "Alert Category",
      value: "",
    }
    setConditions([...conditions, newCondition])
  }

  const handleRemoveCondition = (id) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((condition) => condition.id !== id))
    }
  }

  const handleConditionChange = (id, field, value) => {
    setConditions(conditions.map((condition) => (condition.id === id ? { ...condition, [field]: value } : condition)))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Determine action type based on selected options
    let actionType = ""
    if (blockIP && sendEmailAlert) {
      actionType = "Block IP + Alert"
    } else if (blockIP) {
      actionType = "Block IP"
    } else if (sendEmailAlert) {
      actionType = "Alert"
    }

    const playbookData = {
      name: playbookName,
      description,
      occurrenceThreshold,
      triggerType: "Alert Category",
      actionType,
      status: status ? "active" : "inactive",
      triggerConditions: JSON.stringify(conditions),
      actionDetails: JSON.stringify({
        blockIP,
        sendEmailAlert,
        emailRecipients,
      }),
    }

    onSave(playbookData)
  }

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
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid #eee",
            backgroundColor: "#f9f9f9",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              marginRight: "16px",
              color: "#666",
            }}
          >
            ←
          </button>
          <div>
            <h2 style={{ margin: "4px 0 0 0" }}>Add New Playbook</h2>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px" }}>
            {/* Playbook Name */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Playbook Name</label>
              <input
                type="text"
                value={playbookName}
                onChange={(e) => setPlaybookName(e.target.value)}
                placeholder="Enter playbook name"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a detailed description of this playbook"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  minHeight: "100px",
                  fontSize: "14px",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            {/* Trigger Conditions */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 8px 0" }}>Trigger Conditions</h3>
              <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px" }}>
                Define when this playbook should be triggered. All conditions must be met for the playbook to execute.
              </p>

              {/* Conditions */}
              {conditions.map((condition, index) => (
                <div
                  key={condition.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "16px",
                    marginBottom: "16px",
                    position: "relative",
                    overflow: "hidden", // Prevent content from overflowing
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ marginBottom: "8px", fontWeight: "500" }}>
                    Condition {index + 1}
                    {conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(condition.id)}
                        style={{
                          position: "absolute",
                          right: "16px",
                          top: "16px",
                          background: "none",
                          border: "none",
                          color: "#f44336",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Occurrence Threshold - Moved inside Condition 1 */}
                  {index === 0 && (
                    <div style={{ marginBottom: "16px", width: "100%" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                        Occurrence Threshold
                      </label>
                      <input
                        type="number"
                        value={occurrenceThreshold}
                        onChange={(e) => setOccurrenceThreshold(e.target.value)}
                        min="1"
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                        }}
                        required
                      />
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#666" }}>
                        Number of occurrences required to trigger the playbook
                      </p>
                    </div>
                  )}

                  <div style={{ marginBottom: "16px", width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Field</label>
                    <select
                      value={condition.field}
                      onChange={(e) => handleConditionChange(condition.id, "field", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="Alert Category">Alert Category</option>
                      <option value="Severity">Severity</option>
                    </select>
                  </div>

                  <div style={{ width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Value</label>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => handleConditionChange(condition.id, "value", e.target.value)}
                      placeholder="Enter value"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                      }}
                      required
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddCondition}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  color: "#666",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              >
                + Add Condition
              </button>
            </div>

            {/* Response Actions */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 8px 0" }}>Response Actions</h3>
              <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px" }}>
                Define what actions should be taken when the trigger conditions are met.
              </p>

              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "16px",
                  marginBottom: "16px",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={blockIP}
                      onChange={() => setBlockIP(!blockIP)}
                      style={{ marginRight: "8px" }}
                    />
                    <span style={{ fontWeight: "500" }}>Block IP</span>
                  </label>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={sendEmailAlert}
                      onChange={() => setSendEmailAlert(!sendEmailAlert)}
                      style={{ marginRight: "8px" }}
                    />
                    <span style={{ fontWeight: "500" }}>Send Email Alert</span>
                  </label>
                </div>

                {sendEmailAlert && (
                  <div style={{ marginTop: "16px", width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Recipients</label>
                    <input
                      type="text"
                      value={emailRecipients}
                      onChange={(e) => setEmailRecipients(e.target.value)}
                      placeholder="Enter email address(es)"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Playbook Settings */}
            <div>
              <h3 style={{ margin: "0 0 16px 0" }}>Playbook Settings</h3>

              <div style={{ marginBottom: "16px", display: "flex", alignItems: "center" }}>
                <label style={{ marginRight: "16px", fontWeight: "500" }}>Playbook Status:</label>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "50px",
                    height: "24px",
                    cursor: "pointer",
                  }}
                  onClick={() => setStatus(!status)}
                >
                  <input
                    type="checkbox"
                    checked={status}
                    onChange={() => {}} // Handled by the onClick on the parent div
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: status ? "#4CAF50" : "#ccc",
                      transition: "0.4s",
                      borderRadius: "34px",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        content: "",
                        height: "16px",
                        width: "16px",
                        left: status ? "30px" : "4px",
                        bottom: "4px",
                        backgroundColor: "white",
                        transition: "0.4s",
                        borderRadius: "50%",
                      }}
                    ></span>
                  </span>
                </div>
                <span style={{ marginLeft: "8px", color: status ? "#4CAF50" : "#666" }}>
                  {status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #eee",
              display: "flex",
              justifyContent: "flex-end",
              backgroundColor: "#f9f9f9",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
              position: "sticky",
              bottom: 0,
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginRight: "12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const PlaybookModal = ({ playbook, onClose, onSave, isEditing }) => {
  const [playbookName, setPlaybookName] = useState(playbook?.name || "")
  const [description, setDescription] = useState(playbook?.description || "")
  const [occurrenceThreshold, setOccurrenceThreshold] = useState(playbook?.occurrenceThreshold || 3)
  const [status, setStatus] = useState(playbook?.status === "active")

  // Parse action details to get blockIP and sendEmailAlert values
  const actionDetails = playbook?.actionDetails ? JSON.parse(playbook.actionDetails) : {}
  const [blockIP, setBlockIP] = useState(actionDetails.blockIP !== undefined ? actionDetails.blockIP : true)
  const [sendEmailAlert, setSendEmailAlert] = useState(
    actionDetails.sendEmailAlert !== undefined ? actionDetails.sendEmailAlert : false,
  )
  const [emailRecipients, setEmailRecipients] = useState(actionDetails.emailRecipients || "")

  // Parse trigger conditions
  let initialConditions = [{ id: 1, field: "Alert Category", value: "" }]
  try {
    if (playbook?.triggerConditions) {
      const parsedConditions = JSON.parse(playbook.triggerConditions)
      if (Array.isArray(parsedConditions)) {
        initialConditions = parsedConditions.map((condition, index) => ({
          ...condition,
          id: index + 1,
        }))
      }
    }
  } catch (error) {
    console.error("Error parsing trigger conditions:", error)
  }

  const [conditions, setConditions] = useState(initialConditions)

  const handleAddCondition = () => {
    const newCondition = {
      id: conditions.length + 1,
      field: "Alert Category",
      value: "",
    }
    setConditions([...conditions, newCondition])
  }

  const handleRemoveCondition = (id) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((condition) => condition.id !== id))
    }
  }

  const handleConditionChange = (id, field, value) => {
    setConditions(conditions.map((condition) => (condition.id === id ? { ...condition, [field]: value } : condition)))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Determine action type based on selected options
    let actionType = ""
    if (blockIP && sendEmailAlert) {
      actionType = "Block IP + Alert"
    } else if (blockIP) {
      actionType = "Block IP"
    } else if (sendEmailAlert) {
      actionType = "Alert"
    }

    const playbookData = {
      name: playbookName,
      description,
      occurrenceThreshold,
      triggerType: "Alert Category",
      actionType,
      status: status ? "active" : "inactive",
      triggerConditions: JSON.stringify(conditions),
      actionDetails: JSON.stringify({
        blockIP,
        sendEmailAlert,
        emailRecipients,
      }),
    }

    onSave(playbookData, playbook?.id)
  }

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
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid #eee",
            backgroundColor: "#f9f9f9",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              marginRight: "16px",
              color: "#666",
            }}
          >
            ←
          </button>
          <div>
            <div style={{ color: "#666", fontSize: "14px" }}>
            </div>
            <h2 style={{ margin: "4px 0 0 0" }}>{isEditing ? "Edit Playbook" : "View Playbook"}</h2>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px" }}>
            {/* Playbook Name */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Playbook Name</label>
              <input
                type="text"
                value={playbookName}
                onChange={(e) => setPlaybookName(e.target.value)}
                placeholder="Enter playbook name"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                required
                disabled={!isEditing}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a detailed description of this playbook"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  minHeight: "100px",
                  fontSize: "14px",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
                required
                disabled={!isEditing}
              />
            </div>

            {/* Trigger Conditions */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 8px 0" }}>Trigger Conditions</h3>
              <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px" }}>
                Define when this playbook should be triggered. All conditions must be met for the playbook to execute.
              </p>

              {/* Conditions */}
              {conditions.map((condition, index) => (
                <div
                  key={condition.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "16px",
                    marginBottom: "16px",
                    position: "relative",
                    overflow: "hidden", // Prevent content from overflowing
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ marginBottom: "8px", fontWeight: "500" }}>
                    Condition {index + 1}
                    {isEditing && conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(condition.id)}
                        style={{
                          position: "absolute",
                          right: "16px",
                          top: "16px",
                          background: "none",
                          border: "none",
                          color: "#f44336",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Occurrence Threshold - Moved inside Condition 1 */}
                  {index === 0 && (
                    <div style={{ marginBottom: "16px", width: "100%" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                        Occurrence Threshold
                      </label>
                      <input
                        type="number"
                        value={occurrenceThreshold}
                        onChange={(e) => setOccurrenceThreshold(e.target.value)}
                        min="1"
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                        }}
                        required
                        disabled={!isEditing}
                      />
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#666" }}>
                        Number of occurrences required to trigger the playbook
                      </p>
                    </div>
                  )}

                  <div style={{ marginBottom: "16px", width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Field</label>
                    <select
                      value={condition.field}
                      onChange={(e) => handleConditionChange(condition.id, "field", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        boxSizing: "border-box",
                      }}
                      disabled={!isEditing}
                    >
                      <option value="Alert Category">Alert Category</option>
                      <option value="Severity">Severity</option>
                    </select>
                  </div>

                  <div style={{ width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Value</label>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => handleConditionChange(condition.id, "value", e.target.value)}
                      placeholder="Enter value"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                      }}
                      required
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              ))}

              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddCondition}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: "#666",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                >
                  + Add Condition
                </button>
              )}
            </div>

            {/* Response Actions */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 8px 0" }}>Response Actions</h3>
              <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px" }}>
                Define what actions should be taken when the trigger conditions are met.
              </p>

              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "16px",
                  marginBottom: "16px",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: isEditing ? "pointer" : "default" }}>
                    <input
                      type="checkbox"
                      checked={blockIP}
                      onChange={() => isEditing && setBlockIP(!blockIP)}
                      style={{ marginRight: "8px" }}
                      disabled={!isEditing}
                    />
                    <span style={{ fontWeight: "500" }}>Block IP</span>
                  </label>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: isEditing ? "pointer" : "default" }}>
                    <input
                      type="checkbox"
                      checked={sendEmailAlert}
                      onChange={() => isEditing && setSendEmailAlert(!sendEmailAlert)}
                      style={{ marginRight: "8px" }}
                      disabled={!isEditing}
                    />
                    <span style={{ fontWeight: "500" }}>Send Email Alert</span>
                  </label>
                </div>

                {sendEmailAlert && (
                  <div style={{ marginTop: "16px", width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Recipients</label>
                    <input
                      type="text"
                      value={emailRecipients}
                      onChange={(e) => setEmailRecipients(e.target.value)}
                      placeholder="Enter email address(es)"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Playbook Settings */}
            <div>
              <h3 style={{ margin: "0 0 16px 0" }}>Playbook Settings</h3>

              <div style={{ marginBottom: "16px", display: "flex", alignItems: "center" }}>
                <label style={{ marginRight: "16px", fontWeight: "500" }}>Playbook Status:</label>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "50px",
                    height: "24px",
                    cursor: isEditing ? "pointer" : "default",
                  }}
                  onClick={() => isEditing && setStatus(!status)}
                >
                  <input
                    type="checkbox"
                    checked={status}
                    onChange={() => {}} // Handled by the onClick on the parent div
                    style={{ opacity: 0, width: 0, height: 0 }}
                    disabled={!isEditing}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: status ? "#4CAF50" : "#ccc",
                      transition: "0.4s",
                      borderRadius: "34px",
                      opacity: isEditing ? 1 : 0.7,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        content: "",
                        height: "16px",
                        width: "16px",
                        left: status ? "30px" : "4px",
                        bottom: "4px",
                        backgroundColor: "white",
                        transition: "0.4s",
                        borderRadius: "50%",
                      }}
                    ></span>
                  </span>
                </div>
                <span style={{ marginLeft: "8px", color: status ? "#4CAF50" : "#666" }}>
                  {status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #eee",
              display: "flex",
              justifyContent: "flex-end",
              backgroundColor: "#f9f9f9",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
              position: "sticky",
              bottom: 0,
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginRight: "12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            {isEditing && (
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

const PlaybooksPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("")
  const [selectedPlaybook, setSelectedPlaybook] = useState(null)
  const [showPlaybookModal, setShowPlaybookModal] = useState(false)
  const [showAddPlaybookModal, setShowAddPlaybookModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  // Sample data
  const [playbooks, setPlaybooks] = useState([
    {
      id: 1,
      name: "Block Known Threats",
      description: "Automatically block IPs identified as known threats",
      occurrenceThreshold: 3,
      triggerType: "Alert Category",
      actionType: "Block IP",
      createdBy: "admin",
      lastModified: "03/15/2025",
      status: "active",
      triggerConditions: '{ "category": ["known_threat", "malware"], "severity": "high" }',
      actionDetails: '{ "duration": "permanent", "notify": true }',
    },
    {
      id: 2,
      name: "DOS Attack Response",
      description: "Block IPs attempting DOS attacks",
      occurrenceThreshold: 5,
      triggerType: "Threshold",
      actionType: "Block IP + Alert",
      createdBy: "admin",
      lastModified: "03/12/2025",
      status: "active",
      triggerConditions: '{ "threshold": 100, "timeWindow": "5m", "metric": "requests_per_second" }',
      actionDetails: '{ "duration": "24h", "notify": true }',
    },
    {
      id: 3,
      name: "Suspicious Login Alert",
      description: "Alert on suspicious login attempts",
      occurrenceThreshold: 2,
      triggerType: "Correlation",
      actionType: "Alert",
      createdBy: "admin",
      lastModified: "03/10/2025",
      status: "active",
      triggerConditions: '{ "events": ["failed_login", "location_change"], "timeWindow": "1h" }',
      actionDetails: '{ "channel": "email", "priority": "high" }',
    },
    {
      id: 4,
      name: "Data Exfiltration Detection",
      description: "Detect and respond to potential data exfiltration",
      occurrenceThreshold: 1,
      triggerType: "Threshold",
      actionType: "Block IP + Alert",
      createdBy: "admin",
      lastModified: "03/08/2025",
      status: "active",
      triggerConditions: '{ "threshold": 50, "timeWindow": "10m", "metric": "outbound_data_mb" }',
      actionDetails: '{ "duration": "12h", "notify": true }',
    },
    {
      id: 5,
      name: "Weekend Access Monitoring",
      description: "Monitor and alert on unusual weekend access",
      occurrenceThreshold: 3,
      triggerType: "Time-based",
      actionType: "Alert",
      createdBy: "admin",
      lastModified: "03/05/2025",
      status: "inactive",
      triggerConditions: '{ "days": ["saturday", "sunday"], "hours": "all" }',
      actionDetails: '{ "channel": "email", "priority": "medium" }',
    },
    {
      id: 6,
      name: "Ransomware Prevention",
      description: "Detect and block potential ransomware activity",
      occurrenceThreshold: 1,
      triggerType: "Correlation",
      actionType: "Block IP + Alert",
      createdBy: "admin",
      lastModified: "03/01/2025",
      status: "active",
      triggerConditions: '{ "events": ["file_encryption", "registry_modification"], "timeWindow": "5m" }',
      actionDetails: '{ "duration": "permanent", "notify": true }',
    },
    {
      id: 7,
      name: "Brute Force Protection",
      description: "Protect against brute force attacks",
      occurrenceThreshold: 10,
      triggerType: "Threshold",
      actionType: "Block IP",
      createdBy: "admin",
      lastModified: "02/28/2025",
      status: "active",
      triggerConditions: '{ "threshold": 10, "timeWindow": "2m", "metric": "failed_logins" }',
      actionDetails: '{ "duration": "6h", "notify": false }',
    },
    {
      id: 8,
      name: "Vulnerability Scanner Detection",
      description: "Detect and respond to vulnerability scanning",
      occurrenceThreshold: 5,
      triggerType: "Alert Category",
      actionType: "Block IP",
      createdBy: "admin",
      lastModified: "02/25/2025",
      status: "active",
      triggerConditions: '{ "category": ["port_scan", "vulnerability_scan"], "severity": "medium" }',
      actionDetails: '{ "duration": "48h", "notify": true }',
    },
    {
      id: 9,
      name: "After Hours Access Control",
      description: "Control access during non-business hours",
      occurrenceThreshold: 2,
      triggerType: "Time-based",
      actionType: "Alert",
      createdBy: "admin",
      lastModified: "02/20/2025",
      status: "inactive",
      triggerConditions: '{ "days": ["monday", "tuesday", "wednesday", "thursday", "friday"], "hours": "18:00-09:00" }',
      actionDetails: '{ "channel": "email", "priority": "low" }',
    },
    {
      id: 10,
      name: "Malicious URL Blocking",
      description: "Block access to known malicious URLs",
      occurrenceThreshold: 3,
      triggerType: "Alert Category",
      actionType: "Block IP + Alert",
      createdBy: "admin",
      lastModified: "02/15/2025",
      status: "inactive",
      triggerConditions: '{ "category": ["malicious_url", "phishing"], "severity": "high" }',
      actionDetails: '{ "duration": "72h", "notify": true }',
    },
    {
      id: 11,
      name: "API Abuse Prevention",
      description: "Prevent API abuse and rate limiting",
      occurrenceThreshold: 20,
      triggerType: "Threshold",
      actionType: "Block IP",
      createdBy: "admin",
      lastModified: "02/10/2025",
      status: "active",
      triggerConditions: '{ "threshold": 1000, "timeWindow": "1m", "metric": "api_requests" }',
      actionDetails: '{ "duration": "1h", "notify": false }',
    },
    {
      id: 12,
      name: "Insider Threat Detection",
      description: "Detect potential insider threats",
      occurrenceThreshold: 1,
      triggerType: "Correlation",
      actionType: "Alert",
      createdBy: "admin",
      lastModified: "02/05/2025",
      status: "inactive",
      triggerConditions:
        '{ "events": ["unusual_file_access", "off_hours_activity", "privilege_escalation"], "timeWindow": "24h" }',
      actionDetails: '{ "channel": "email", "priority": "high" }',
    },
  ])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterChange = (e) => {
    setFilterType(e.target.value)
  }

  const filteredPlaybooks = playbooks.filter((playbook) => {
    const matchesSearch =
      playbook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playbook.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playbook.triggerType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playbook.actionType.toLowerCase().includes(searchQuery.toLowerCase())

    if (!filterType) return matchesSearch

    switch (filterType) {
      case "name":
        return playbook.name.toLowerCase().includes(searchQuery.toLowerCase())
      case "description":
        return playbook.description.toLowerCase().includes(searchQuery.toLowerCase())
      case "trigger-type":
        return playbook.triggerType.toLowerCase().includes(searchQuery.toLowerCase())
      case "action-type":
        return playbook.actionType.toLowerCase().includes(searchQuery.toLowerCase())
      case "status-active":
        return playbook.status === "active" && matchesSearch
      case "status-inactive":
        return playbook.status === "inactive" && matchesSearch
      default:
        return matchesSearch
    }
  })

  const activePlaybooks = playbooks.filter((playbook) => playbook.status === "active").length
  const inactivePlaybooks = playbooks.filter((playbook) => playbook.status === "inactive").length

  const handleViewPlaybook = (playbook) => {
    setSelectedPlaybook(playbook)
    setIsEditing(false)
    setShowPlaybookModal(true)
  }

  const handleEditPlaybook = (playbook) => {
    setSelectedPlaybook(playbook)
    setIsEditing(true)
    setShowPlaybookModal(true)
  }

  const handleCloseModal = () => {
    setShowPlaybookModal(false)
    setShowAddPlaybookModal(false)
    setSelectedPlaybook(null)
    setIsEditing(false)
  }

  const handleSavePlaybook = (formData, id) => {
    if (id) {
      // Update existing playbook
      setPlaybooks(
        playbooks.map((playbook) =>
          playbook.id === id
            ? {
                ...playbook,
                ...formData,
                lastModified: new Date()
                  .toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })
                  .replace(/\//g, "/"),
              }
            : playbook,
        ),
      )
    } else {
      // Create new playbook
      const newPlaybook = {
        id: playbooks.length + 1,
        ...formData,
        createdBy: "admin",
        lastModified: new Date()
          .toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "/"),
      }
      setPlaybooks([...playbooks, newPlaybook])
    }

    setShowPlaybookModal(false)
    setShowAddPlaybookModal(false)
    setSelectedPlaybook(null)
    setIsEditing(false)
  }

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredPlaybooks.map((playbook) => playbook.id))
    } else {
      setSelectedRows([])
    }
  }

  const getStatusStyle = (status) => {
    return {
      color: status === "active" ? "#4CAF50" : "#9E9E9E",
      fontWeight: "500",
    }
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f4f4f4",
        overflow: "hidden",
      }}
    >
      <Sidebar userRole={userRole} />

      <div
        style={{
          flex: 1,
          padding: "32px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <h1 style={{ margin: "0 0 24px 0" }}>Playbooks Management</h1>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: "#eee",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#666", marginBottom: "8px" }}>Total Playbooks</div>
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>{playbooks.length}</div>
          </div>

          <div
            style={{
              backgroundColor: "#eee",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#666", marginBottom: "8px" }}>Active</div>
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>{activePlaybooks}</div>
          </div>

          <div
            style={{
              backgroundColor: "#eee",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#666", marginBottom: "8px" }}>Inactive</div>
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>{inactivePlaybooks}</div>
          </div>

          <div
            style={{
              backgroundColor: "#eee",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#666", marginBottom: "8px" }}>IP Blocks (24h)</div>
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>37</div>
          </div>

          <div
            style={{
              backgroundColor: "#eee",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#666", marginBottom: "8px" }}>Actions Executed (24h)</div>
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>142</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <select
              value={filterType}
              onChange={handleFilterChange}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "white",
                minWidth: "200px",
              }}
            >
              <option value="">Filter By (All Fields)</option>
              <option value="name">Name</option>
              <option value="description">Description</option>
              <option value="trigger-type">Trigger Type</option>
              <option value="action-type">Action Type</option>
              <option value="status-active">Status: Active</option>
              <option value="status-inactive">Status: Inactive</option>
            </select>

            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search all fields..."
                value={searchQuery}
                onChange={handleSearch}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px 0 0 4px",
                  width: "300px",
                }}
              />
              <button
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ddd",
                  borderLeft: "none",
                  borderRadius: "0 4px 4px 0",
                  cursor: "pointer",
                }}
              >
                🔍
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowAddPlaybookModal(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#00C853",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            + Add Playbook
          </button>
        </div>

        {/* Playbooks Table */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            overflow: "auto",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            maxWidth: "100%",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee", width: "40px" }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.length > 0 && selectedRows.length === filteredPlaybooks.length}
                  />
                </th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Name</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Description</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                  Occurrence Threshold
                </th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Trigger Type</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Action Type</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Created By</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Last Modified</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Status</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlaybooks.map((playbook) => (
                <tr key={playbook.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(playbook.id)}
                      onChange={() => handleSelectRow(playbook.id)}
                    />
                  </td>
                  <td style={{ padding: "16px", fontWeight: "500" }}>{playbook.name}</td>
                  <td style={{ padding: "16px" }}>{playbook.description}</td>
                  <td style={{ padding: "16px", textAlign: "center" }}>{playbook.occurrenceThreshold}</td>
                  <td style={{ padding: "16px" }}>{playbook.triggerType}</td>
                  <td style={{ padding: "16px" }}>{playbook.actionType}</td>
                  <td style={{ padding: "16px" }}>{playbook.createdBy}</td>
                  <td style={{ padding: "16px" }}>{playbook.lastModified}</td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span style={getStatusStyle(playbook.status)}>
                      {playbook.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <button
                      onClick={() => handleEditPlaybook(playbook)}
                      style={{
                        padding: "6px 16px",
                        backgroundColor: "#666",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPlaybooks.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ padding: "24px", textAlign: "center", color: "#666" }}>
                    No playbooks found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPlaybookModal && (
        <PlaybookModal
          playbook={selectedPlaybook}
          onClose={handleCloseModal}
          onSave={handleSavePlaybook}
          isEditing={isEditing}
        />
      )}

      {showAddPlaybookModal && <AddPlaybookModal onClose={handleCloseModal} onSave={handleSavePlaybook} />}
    </div>
  )
}

export default PlaybooksPage

