// playbooks-page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"

const userRole = "2"

// New AddPlaybookModal component that matches the design in the images
const AddPlaybookModal = ({ onClose, onSave }) => {
  const [playbookName, setPlaybookName] = useState("")
  const [description, setDescription] = useState("")
  const [conditions, setConditions] = useState([
    {
      id: 1,
      field: "source_ip", // Set default field
      value: "",
      window_period: "",
      condition_type: "threshold",
      operator: "greater than or equal", // Set default operator
    },
  ])
  const [status, setStatus] = useState(true)
  const [blockIP, setBlockIP] = useState(true)
  const [sendEmailAlert, setSendEmailAlert] = useState(true)
  const [emailRecipients, setEmailRecipients] = useState("")

  const conditionFieldOptions = {
    threshold: [
      { value: "source_ip", label: "Source IP" },
      { value: "alert_count", label: "Alert Count" },
    ],
    severity: [{ value: "severity", label: "Severity" }],
    class_type: [{ value: "class_type", label: "Class Type" }],
    ip_reputation: [{ value: "source_ip", label: "Source IP" }],
    geolocation: [{ value: "source_ip", label: "Source IP" }],
    destination_targeting: [{ value: "destination_ip", label: "Destination IP" }],
  }

  const conditionTypeOptions = [
    { value: "threshold", label: "threshold" },
    { value: "severity", label: "Severity" },
    { value: "class_type", label: "Class Type" },
    { value: "ip_reputation", label: "IP Reputation" },
  ]

  const conditionOperatorOptions = {
    threshold: [{ value: "greater than or equal", label: ">=" }],
    severity: [{ value: "greater than or equal", label: ">=" }],
    class_type: [
      { value: "equal", label: "equals" },
      { value: "not equal", label: "not equals" },
    ],
    ip_reputation: [{ value: "exists", label: "exists" }],
    geo_location: [
      { value: "equal", label: "equals" },
      { value: "not equal", label: "not equals" },
    ],
  }

  const conditionValueOptions = {
    severity: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
    ip_reputation: [{ value: "threat_intel_feed", label: "threat intel feed" }],
  }

  const handleAddCondition = () => {
    const newCondition = {
      id: conditions.length + 1,
      condition_type: "threshold",
      field: "source_ip", // Set default field based on condition type
      value: "",
      operator: "greater than or equal", // Set default operator based on condition type
      window_period: "",
    }
    setConditions([...conditions, newCondition])
  }

  const handleRemoveCondition = (id) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((condition) => condition.id !== id));
    }
  };

  const handleConditionChange = (id, field, value) => {
    setConditions(
      conditions.map((condition) => {
        if (condition.id === id) {
          const updatedCondition = { ...condition, [field]: value }

          // If condition type changes, set appropriate defaults
          if (field === "condition_type") {
            const defaultField = conditionFieldOptions[value]?.[0]?.value || ""
            const defaultOperator = conditionOperatorOptions[value]?.[0]?.value || ""
            const defaultValue = conditionValueOptions[value]?.[0]?.value || ""

            updatedCondition.field = defaultField
            updatedCondition.operator = defaultOperator
            updatedCondition.value = defaultValue // Reset value when type changes
          }

          return updatedCondition
        }
        return condition
      }),
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format data according to the backend schema
    const playbookData = {
      name: playbookName,
      description: description,
      conditions: conditions.map((c) => ({
        condition_type: c.condition_type,
        field: c.field,
        operator: c.operator,
        value: c.value,
        window_period: c.window_period,
      })),
      actions: {
        blockIP: blockIP,
        sendEmailAlert: sendEmailAlert,
        emailRecipients: emailRecipients,
      },
      is_active: status,
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
          <h2 style={{ margin: "4px 0 0 0" }}>
            Add New Playbook
          </h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px" }}>
            {/* Playbook Name */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Playbook Name
              </label>
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Description
              </label>
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
                Define when this playbook should be triggered. All conditions must be met for the
                playbook to execute.
              </p>

              {conditions.map((condition, index) => (
                <div
                  key={condition.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "16px",
                    marginBottom: "16px",
                    position: "relative",
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

                  <div style={{ marginBottom: "16px", width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Condition Type</label>
                    <select
                      value={condition.condition_type}
                      onChange={(e) => handleConditionChange(condition.id, "condition_type", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        boxSizing: "border-box",
                      }}
                    >
                      {conditionTypeOptions.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field */}
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
                      {conditionFieldOptions[condition.condition_type]?.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "16px", width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Operator</label>
                    <select
                      value={condition.operator}
                      onChange={(e) => handleConditionChange(condition.id, "operator", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        boxSizing: "border-box",
                      }}
                    >
                      {conditionOperatorOptions[condition.condition_type]?.map((operator) => (
                        <option key={operator.value} value={operator.value}>
                          {operator.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ width: "100%", marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Value</label>

                    {condition.condition_type === "threshold" ? (
                      <input
                        type="number"
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
                    ) : ["severity", "ip_reputation"].includes(condition.condition_type.toLowerCase()) ? (
                      <select
                        value={condition.value}
                        onChange={(e) => handleConditionChange(condition.id, "value", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          backgroundColor: "white",
                          boxSizing: "border-box",
                        }}
                      >
                        {conditionValueOptions[condition.condition_type]?.map((option, index) => (
                          <option key={index} value={option.value || ""}>
                            {option.label || "Unknown"}
                          </option>
                        ))}
                      </select>
                    ) : (
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
                    )}
                  </div>

                  {condition.condition_type === "threshold" ? (
                    <div style={{ width: "100%" }}>
                      <label style={{ display: "block", marginBottom: "8px" }}>Window Period (mins)</label>
                      <input
                        type="number"
                        value={condition.window_period}
                        onChange={(e) => handleConditionChange(condition.id, "window_period", e.target.value)}
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
                  ) : null}
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
                    onChange={() => {}}
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
  const [status, setStatus] = useState(playbook?.is_active || false)

  // Parse action details
  const actions = playbook?.actions || {}
  const [blockIP, setBlockIP] = useState(actions.blockIP !== undefined ? actions.blockIP : true)
  const [sendEmailAlert, setSendEmailAlert] = useState(
    actions.sendEmailAlert !== undefined ? actions.sendEmailAlert : false,
  )
  const [emailRecipients, setEmailRecipients] = useState(actions.emailRecipients || "")

  // Initialize conditions with proper defaults
  const initialConditions = useMemo(() => {
    if (!playbook?.conditions || !Array.isArray(playbook.conditions) || playbook.conditions.length === 0) {
      return [
        {
          id: 1,
          condition_type: "threshold",
          field: "source_ip",
          operator: "greater than or equal",
          value: "",
          window_period: "",
        },
      ]
    }

    return playbook.conditions.map((condition, index) => ({
      id: index + 1,
      condition_type: condition.condition_type || "threshold",
      field: condition.field || "source_ip",
      operator: condition.operator || "greater than or equal",
      value: condition.value || "",
      window_period: condition.window_period || "",
    }))
  }, [playbook?.conditions])

  const [conditions, setConditions] = useState(initialConditions)

  const handleAddCondition = () => {
    const newCondition = {
      id: conditions.length + 1,
      condition_type: "threshold",
      field: "source_ip",
      operator: "greater than or equal",
      value: "",
      window_period: "",
    }
    setConditions([...conditions, newCondition])
  }

  const handleRemoveCondition = (id) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((condition) => condition.id !== id))
    }
  }

  const handleConditionChange = (id, field, value) => {
    setConditions(
      conditions.map((condition) => {
        if (condition.id === id) {
          const updatedCondition = { ...condition, [field]: value }

          // If condition type changes, set appropriate defaults
          if (field === "condition_type") {
            const defaultField = conditionFieldOptions[value]?.[0]?.value || ""
            const defaultOperator = conditionOperatorOptions[value]?.[0]?.value || ""

            updatedCondition.field = defaultField
            updatedCondition.operator = defaultOperator
            updatedCondition.value = ""
          }

          return updatedCondition
        }
        return condition
      }),
    )
  }

  const conditionFieldOptions = {
    threshold: [
      { value: "source_ip", label: "Source IP" },
      { value: "alert_count", label: "Alert Count" },
    ],
    severity: [{ value: "severity", label: "Severity" }],
    class_type: [{ value: "class_type", label: "Class Type" }],
    ip_reputation: [{ value: "source_ip", label: "Source IP" }],
    geolocation: [{ value: "source_ip", label: "Source IP" }],
    destination_targeting: [{ value: "destination_ip", label: "Destination IP" }],
  }

  const conditionTypeOptions = [
    { value: "threshold", label: "threshold" },
    { value: "severity", label: "Severity" },
    { value: "class_type", label: "Class Type" },
    { value: "ip_reputation", label: "IP Reputation" },
  ]

  const conditionOperatorOptions = {
    threshold: [{ value: "greater than or equal", label: ">=" }],
    severity: [{ value: "greater than or equal", label: ">=" }],
    class_type: [
      { value: "equal", label: "equals" },
      { value: "not equal", label: "not equals" },
    ],
    ip_reputation: [{ value: "exists", label: "exists" }],
    geo_location: [
      { value: "equal", label: "equals" },
      { value: "not equal", label: "not equals" },
    ],
  }

  const conditionValueOptions = {
    severity: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
    ip_reputation: [{ value: "threat_intel_feed", label: "threat intel feed" }],
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Format data according to the backend schema
    const playbookData = {
      name: playbookName,
      description,
      conditions: conditions.map((c) => ({
        condition_type: c.condition_type,
        field: c.field,
        operator: c.operator,
        value: c.value,
        window_period: c.window_period,
      })),
      actions: {
        blockIP,
        sendEmailAlert,
        emailRecipients,
      },
      is_active: status,
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
            <div style={{ color: "#666", fontSize: "14px" }}></div>
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

                  <div style={{ marginBottom: "16px", width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Condition Type</label>
                    <select
                      value={condition.condition_type}
                      onChange={(e) => handleConditionChange(condition.id, "condition_type", e.target.value)}
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
                      {conditionTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      {conditionFieldOptions[condition.condition_type]?.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "16px", width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Operator</label>
                    <select
                      value={condition.operator}
                      onChange={(e) => handleConditionChange(condition.id, "operator", e.target.value)}
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
                      {conditionOperatorOptions[condition.condition_type]?.map((operator) => (
                        <option key={operator.value} value={operator.value}>
                          {operator.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ width: "100%", marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Value</label>
                    {condition.condition_type === "threshold" ? (
                      <input
                        type="number"
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
                    ) : condition.condition_type === "severity" || condition.condition_type === "ip_reputation" ? (
                      <select
                        value={condition.value}
                        onChange={(e) => handleConditionChange(condition.id, "value", e.target.value)}
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
                        {conditionValueOptions[condition.condition_type]?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
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
                    )}
                  </div>
                  {condition.condition_type === "threshold" ? (
                    <div style={{ width: "100%" }}>
                      <label style={{ display: "block", marginBottom: "8px" }}>Window period (mins)</label>
                      <input
                        type="number"
                        value={condition.window_period}
                        onChange={(e) => handleConditionChange(condition.id, "window_period", e.target.value)}
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
                  ) : null}
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Sample data
  const [playbooks, setPlaybooks] = useState([])

  // Fetch playbooks on component mount
  useEffect(() => {
    fetchPlaybooks()
  }, [])

  const fetchPlaybooks = async () => {
    try {
      setLoading(true)
      // Get the token from localStorage
      const token = localStorage.getItem("token")

      console.log("Fetching playbooks from: http://localhost:8000/playbooks")

      // Use the correct API endpoint based on the backend code
      const response = await fetch("http://localhost:8000/playbooks", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        mode: "cors",
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`)
      }

      const data = await response.json()
      console.log("Fetched playbooks:", data)

      setPlaybooks(Array.isArray(data) ? data : [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching playbooks:", error)
      setError(`Failed to fetch playbooks: ${error.message}`)
      setLoading(false)
      // If we can't fetch from the API, use sample data for development
      setPlaybooks([
        {
          id: 1,
          name: "Sample Playbook 1",
          description: "This is a sample playbook for development",
          conditions: [
            {
              condition_type: "threshold",
              field: "source_ip",
              operator: "greater than or equal",
              value: "5",
              window_period: "10",
            },
          ],
          actions: {
            blockIP: true,
            sendEmailAlert: true,
            emailRecipients: "admin@example.com",
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterChange = (e) => {
    setFilterType(e.target.value)
  }

  const filteredPlaybooks =
    playbooks &&
    playbooks.filter((playbook) => {
      const matchesSearch =
        playbook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (playbook.description && playbook.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (playbook.conditions &&
          JSON.stringify(playbook.conditions).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (playbook.actions && JSON.stringify(playbook.actions).toLowerCase().includes(searchQuery.toLowerCase()))

      if (!filterType) return matchesSearch

      switch (filterType) {
        case "name":
          return playbook.name.toLowerCase().includes(searchQuery.toLowerCase())
        case "description":
          return playbook.description && playbook.description.toLowerCase().includes(searchQuery.toLowerCase())
        case "trigger-type":
          return (
            playbook.conditions && JSON.stringify(playbook.conditions).toLowerCase().includes(searchQuery.toLowerCase())
          )
        case "action-type":
          return playbook.actions && JSON.stringify(playbook.actions).toLowerCase().includes(searchQuery.toLowerCase())
        case "status-active":
          return playbook.is_active && matchesSearch
        case "status-inactive":
          return !playbook.is_active && matchesSearch
        default:
          return matchesSearch
      }
    })

  const activePlaybooks = playbooks.filter((playbook) => playbook.is_active).length
  const inactivePlaybooks = playbooks.filter((playbook) => !playbook.is_active).length

  const handleViewPlaybook = (playbook) => {
    setSelectedPlaybook(playbook)
    setIsEditing(false)
    setShowPlaybookModal(true)
  }

  const handleEditPlaybook = (playbook) => {
    console.log(playbook)
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

  const handleSavePlaybook = async (formData, id) => {
    try {
      setLoading(true)
      // Get the token from localStorage
      const token = localStorage.getItem("token")

      // Use the correct API endpoint based on the backend code
      let url = "http://localhost:8000/playbooks"
      let method = "POST"

      if (id) {
        url = `http://localhost:8000/playbooks/${id}`
        method = "PUT"
      }

      console.log(`Saving playbook to ${url} with method ${method}`)
      console.log("Playbook data:", JSON.stringify(formData, null, 2))

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        mode: "cors",
        body: JSON.stringify(formData),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to ${id ? "update" : "create"} playbook: ${errorText}`)
      }

      const responseData = await response.json()
      console.log("Save response:", responseData)

      // Refresh playbooks list
      await fetchPlaybooks()
      handleCloseModal()
    } catch (error) {
      console.error("Error saving playbook:", error)
      setError(`Error saving playbook: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlaybook = async (playbookId) => {
    try {
      setLoading(true)
      // Get the token from localStorage
      const token = localStorage.getItem("token")

      console.log(`Deleting playbook with ID: ${playbookId}`)

      // Use the correct API endpoint
      const response = await fetch(`http://localhost:8000/playbooks/${playbookId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        mode: "cors",
      })

      console.log("Delete response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to delete playbook: ${errorText}`)
      }

      // Refresh playbooks list
      await fetchPlaybooks()
    } catch (error) {
      console.error("Error deleting playbook:", error)
      setError(`Error deleting playbook: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (playbookId) => {
    try {
      setLoading(true)
      // Get the token from localStorage
      const token = localStorage.getItem("token")

      console.log(`Toggling status for playbook with ID: ${playbookId}`)

      // Use the correct API endpoint
      const response = await fetch(`http://localhost:8000/playbooks/${playbookId}/toggle`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        mode: "cors",
      })

      console.log("Toggle status response:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to toggle playbook status: ${errorText}`)
      }

      // Refresh playbooks list
      await fetchPlaybooks()
    } catch (error) {
      console.error("Error toggling playbook status:", error)
      setError(`Error toggling status: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div>Loading playbooks...</div>
      </div>
    )
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
      color: status ? "#4CAF50" : "#9E9E9E",
      fontWeight: "500",
    }
  }

  const formatActionType = (actions) => {
    if (!actions) return "No actions"

    const actionsList = []

    if (actions.blockIP) {
      actionsList.push("Block IP")
    }

    if (actions.sendEmailAlert) {
      actionsList.push("Send Email")
    }

    return actionsList.length > 0 ? actionsList.join(" + ") : "No actions"
  }

  const renderPlaybookRow = (playbook) => (
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
      <td style={{ padding: "16px" }}>{formatActionType(playbook.actions)}</td>
      <td style={{ padding: "16px" }}>{new Date(playbook.created_at).toLocaleDateString()}</td>
      <td style={{ padding: "16px" }}>{new Date(playbook.updated_at).toLocaleDateString()}</td>
      <td style={{ padding: "16px", textAlign: "center" }}>
        <span style={getStatusStyle(playbook.is_active)}>{playbook.is_active ? "Active" : "Inactive"}</span>
      </td>
      <td style={{ padding: "16px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button
            onClick={() => handleEditPlaybook(playbook)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleToggleStatus(playbook.id)}
            style={{
              padding: "6px 12px",
              backgroundColor: playbook.is_active ? "#f44336" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {playbook.is_active ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={() => handleDeletePlaybook(playbook.id)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )

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

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

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
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Action Type</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Created At</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Last Modified</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Status</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlaybooks.map(renderPlaybookRow)}

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