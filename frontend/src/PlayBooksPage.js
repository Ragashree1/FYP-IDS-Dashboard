import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"

const userRole = "2"

// New AddPlaybookModal component that matches the design in the images
const PlaybookModal = ({ playbook, onClose, onSave }) => {
  const [playbookName, setPlaybookName] = useState(playbook?.name || "");
  const [description, setDescription] = useState(playbook?.description || "");
  const [status, setStatus] = useState(playbook?.is_active || false);
  const [blockIP, setBlockIP] = useState(playbook?.actions?.blockIP ??false);
  const [sendEmailAlert, setSendEmailAlert] = useState(playbook?.actions?.sendEmailAlert ?? false);
  const [emailRecipients, setEmailRecipients] = useState(playbook?.actions?.emailRecipients || "");
  const [conditions, setConditions] = useState([]);

  const conditionFieldOptions = {
    threshold: [{ value: "source_ip_alert_count", label: "Source IP + alert count" }],
    severity: [{ value: "severity", label: "Severity" }],
    class_type: [{ value: "class_type", label: "Class Type" }],
    ip_reputation: [{ value: "source_ip", label: "Source IP" }],
    geolocation: [{ value: "source_ip", label: "Source IP" }],
    destination_targeting: [{ value: "destination_ip", label: "Destination IP" }],
  };

  const conditionTypeOptions = [
    { value: "threshold", label: "Threshold" },
    { value: "severity", label: "Severity" },
    { value: "class_type", label: "Class Type" },
    { value: "ip_reputation", label: "IP Reputation" },
  ];

  const conditionOperatorOptions = {
    threshold: [{ value: "greater than or equal", label: ">=" }],
    severity: [{ value: "greater than or equal", label: ">=" }],
    class_type: [
      { value: "equal", label: "Equals" },
      { value: "not equal", label: "Not Equals" },
    ],
    ip_reputation: [{ value: "exists", label: "Exists" }],
    geolocation: [
      { value: "equal", label: "Equals" },
      { value: "not equal", label: "Not Equals" },
    ],
  };

  const conditionValueOptions = {
    severity: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
    ip_reputation: [{ value: "threat_intel_feed", label: "Threat Intel Feed" }],
  };

  useEffect(() => {
    if (playbook?.conditions) {
      const parsedConditions = playbook.conditions.map((condition, index) => ({
        id: index + 1,
        condition_type: condition.condition_type || "threshold",
        field: condition.field || "source_ip_alert_count",
        operator: condition.operator || "greater than or equal",
        value: condition.value || "",
        window_period: condition.window_period || "",
      }));
      setConditions(parsedConditions);
      if (playbook?.actions){
        setBlockIP(playbook.actions.blockIP);
        setSendEmailAlert(playbook.actions.sendEmailAlert);
        setEmailRecipients(playbook.actions.emailRecipients);
      }
    } else {
      setConditions([
        {
          id: 1,
          condition_type: "threshold",
          field: "source_ip_alert_count",
          operator: "greater than or equal",
          value: "",
          window_period: "",
        },
      ]);
    }
  }, [playbook]);

  const handleAddCondition = () => {
    const newCondition = {
      id: conditions.length + 1,
      condition_type: "threshold",
      field: "source_ip_alert_count",
      operator: "greater than or equal",
      value: "",
      window_period: "",
    };
    setConditions((prevConditions) => [...prevConditions, newCondition]);
  };

  const handleRemoveCondition = (id) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((condition) => condition.id !== id));
    }
  };

  const handleConditionChange = (id, field, value) => {
    setConditions(
      conditions.map((condition) =>
        condition.id === id
          ? {
              ...condition,
              [field]: value,
              ...(field === "condition_type" && {
                field: conditionFieldOptions[value]?.[0]?.value || "",
                operator: conditionOperatorOptions[value]?.[0]?.value || "",
                value: "",
              }),
            }
          : condition
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for duplicate condition types
    const conditionTypes = conditions.map((condition) => condition.condition_type);
    const hasDuplicateConditionTypes = conditionTypes.some(
      (type, index) => conditionTypes.indexOf(type) !== index
    );
    console.log(hasDuplicateConditionTypes)

    if (hasDuplicateConditionTypes) {
      const alertBox = document.createElement("div");
      alertBox.style.position = "fixed";
      alertBox.style.top = "5%";
      alertBox.style.left = "50%";
      alertBox.style.transform = "translate(-50%, -50%)";
      alertBox.style.backgroundColor = "#f44336";
      alertBox.style.color = "white";
      alertBox.style.padding = "16px";
      alertBox.style.borderRadius = "8px";
      alertBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
      alertBox.style.zIndex = "1000";
      alertBox.textContent = "The same condition type cannot be added twice.";

      document.body.appendChild(alertBox);

      setTimeout(() => {
        alertBox.style.transition = "opacity 0.5s";
        alertBox.style.opacity = "0";
        setTimeout(() => document.body.removeChild(alertBox), 500);
      }, 3000);
      return;
    }

    const actionType = blockIP && sendEmailAlert
      ? "Block IP + Alert"
      : blockIP
      ? "Block IP"
      : sendEmailAlert
      ? "Alert"
      : "";

    const playbookData = {
      name: playbookName,
      description,
      triggerType: "Alert Category",
      actionType,
      is_active: status,
      conditions,
      actions: {
        blockIP,
        sendEmailAlert,
        emailRecipients,
      },
    };
    onSave(playbookData, playbook?.id);
  };

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
            {playbook ? "Edit Playbook" : "Add New Playbook"}
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

                  {/* Condition Type */}
                  <div style={{ marginBottom: "16px", width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Condition Type</label>
                    <select
                      value={condition.condition_type}
                      onChange={(e) =>
                        handleConditionChange(condition.id, "condition_type", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        boxSizing: "border-box",
                      }}
                    >
                      {conditionTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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

                  {/* Operator */}
                  <div style={{ marginBottom: "16px", width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Operator</label>
                    <select
                      value={condition.operator}
                      onChange={(e) =>
                        handleConditionChange(condition.id, "operator", e.target.value)
                      }
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

                  {/* Value */}
                  <div style={{ marginBottom: "16px", width: "100%" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>Value</label>
                    {condition.condition_type === "threshold" ? (
                      <input
                        type="number"
                        value={condition.value}
                        onChange={(e) =>
                          handleConditionChange(condition.id, "value", e.target.value)
                        }
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
                    ) : condition.condition_type === "severity" ||
                      condition.condition_type === "ip_reputation" ? (
                      <select
                        value={condition.value}
                        onChange={(e) =>
                          handleConditionChange(condition.id, "value", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          backgroundColor: "white",
                          boxSizing: "border-box",
                        }}
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
                        onChange={(e) =>
                          handleConditionChange(condition.id, "value", e.target.value)
                        }
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
              {playbook ? "Save" : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample data
  const [playbooks, setPlaybooks] = useState([])

  // Fetch playbooks on component mount
  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const fetchPlaybooks = async () => {
    try {
      const response = await fetch('http://localhost:8000/playbooks');
      const data = await response.json();
      setPlaybooks(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching playbooks:', error);
      setError('Failed to fetch playbooks');
      setLoading(false);
      setPlaybooks([]);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterChange = (e) => {
    setFilterType(e.target.value)
  }

  const filteredPlaybooks = playbooks && playbooks.filter((playbook) => {
    const matchesSearch =
      playbook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playbook.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.keys(playbook.conditions).join(', ').toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.keys(playbook.actions).join(', ').toLowerCase().includes(searchQuery.toLowerCase())

    if (!filterType) return matchesSearch

    switch (filterType) {
      case "name":
        return playbook.name.toLowerCase().includes(searchQuery.toLowerCase())
      case "description":
        return playbook.description.toLowerCase().includes(searchQuery.toLowerCase())
      case "trigger-type":
        return Object.keys(playbook.conditions).join(', ').toLowerCase().includes(searchQuery.toLowerCase())
      case "action-type":
        return Object.keys(playbook.actions).join(', ').toLowerCase().includes(searchQuery.toLowerCase())
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
    console.log(formData);
    try {
      let actionType = ""
      if (formData.blockIP && formData.sendEmailAlert) {
        actionType = "Block IP + Alert"
      } else if (formData.blockIP) {
        actionType = "Block IP"
      } else if (formData.sendEmailAlert) {
        actionType = "Alert"
      }

      console.log('saving playbook');
      console.log('form data: ', formData)
      const playbookData = {
        name: formData.name,
        description: formData.description,
        actionType: formData.actionType,
        status: formData.status ? "active" : "inactive",
        conditions: formData.conditions,
        actions: formData.actions,
        blockIP: formData.blockIP,
        sendEmailAlert: formData.sendEmailAlert,
        emailRecipients: formData.emailRecipients,
      };
      console.log('obj ', playbookData);

      let response;
      if (id) {
        // Update existing playbook
        response = await fetch(`http://localhost:8000/playbooks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playbookData),
        });
      } else {
        // Create new playbook
        response = await fetch('http://localhost:8000/playbooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playbookData),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${id ? 'update' : 'create'} playbook`);
      }

      // Refresh playbooks list
      fetchPlaybooks();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving playbook:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeletePlaybook = async (playbookId) => {
    try {
      const response = await fetch(`http://localhost:8000/playbooks/${playbookId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete playbook');
      }

      // Refresh playbooks list
      fetchPlaybooks();
    } catch (error) {
      console.error('Error deleting playbook:', error);
    }
  };

  const handleToggleStatus = async (playbookId) => {
    try {
      const response = await fetch(`http://localhost:8000/playbooks/${playbookId}/toggle`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to toggle playbook status');
      }

      // Refresh playbooks list
      fetchPlaybooks();
    } catch (error) {
      console.error('Error toggling playbook status:', error);
    }
  };

  if (loading) {
    return <div>Loading playbooks...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
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
    const actionsList = [];
    console.log("printing actions")
    console.log(actions)
    if (actions.blockIP) {
      actionsList.push('Block IP');
    }
    
    if (actions.sendEmailAlert) {
      actionsList.push('Send Email');
    }
    
    return actionsList.length > 0 ? actionsList.join(' + ') : 'No actions';
  };

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
      <td style={{ padding: "16px" }}>
        {formatActionType(playbook.actions)}
      </td>
      <td style={{ padding: "16px" }}>
        {new Date(playbook.created_at).toLocaleDateString()}
      </td>
      <td style={{ padding: "16px" }}>
        {new Date(playbook.updated_at).toLocaleDateString()}
      </td>
      <td style={{ padding: "16px", textAlign: "center" }}>
        <span style={getStatusStyle(playbook.is_active)}>
          {playbook.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td style={{ padding: "16px", textAlign: "center" }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={() => handleEditPlaybook(playbook)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleToggleStatus(playbook.id)}
            style={{
              padding: '6px 12px',
              backgroundColor: playbook.is_active ? '#f44336' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {playbook.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => handleDeletePlaybook(playbook.id)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

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
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Created By</th>
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

      {showAddPlaybookModal && <PlaybookModal onClose={handleCloseModal} onSave={handleSavePlaybook} />}
    </div>
  )
}

export default PlaybooksPage

