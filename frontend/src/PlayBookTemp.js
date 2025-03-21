const PlaybookModal = ({ playbook, onClose, onSave, isEditing }) => {
  // Initialize basic state
  const [playbookName, setPlaybookName] = useState(playbook?.name || "")
  const [description, setDescription] = useState(playbook?.description || "")
  const [status, setStatus] = useState(playbook?.status === "active")

  // Parse action details using useMemo to prevent re-parsing
  const actionDetails = useMemo(() => {
    try {
      return playbook?.actionDetails ? JSON.parse(playbook.actionDetails) : {};
    } catch (error) {
      return {};
    }
  }, [playbook?.actionDetails]);

  // Initialize action states
  const [blockIP, setBlockIP] = useState(actionDetails.blockIP ?? true);
  const [sendEmailAlert, setSendEmailAlert] = useState(actionDetails.sendEmailAlert ?? false);
  const [emailRecipients, setEmailRecipients] = useState(actionDetails.emailRecipients || "");

  // Initialize conditions using useMemo to prevent recalculation
  const initialConditions = useMemo(() => {
    if (!playbook?.conditions) {
      return [{
        id: 1,
        condition_type: "threshold",
        field: "source_ip",
        operator: "greater than or equal",
        value: "",
        window_period: ""
      }];
    }

    try {
      return Array.isArray(playbook.conditions) 
        ? playbook.conditions.map((condition, index) => ({
            id: index + 1,
            condition_type: condition.condition_type || "threshold",
            field: condition.field || "source_ip",
            operator: condition.operator || "greater than or equal",
            value: condition.value || "",
            window_period: condition.window_period || ""
          }))
        : [{
            id: 1,
            condition_type: "threshold",
            field: "source_ip",
            operator: "greater than or equal",
            value: "",
            window_period: ""
          }];
    } catch (error) {
      console.error("Error parsing conditions:", error);
      return [{
        id: 1,
        condition_type: "threshold",
        field: "source_ip",
        operator: "greater than or equal",
        value: "",
        window_period: ""
      }];
    }
  }, [playbook?.conditions]);

  // Initialize conditions state with memoized value
  const [conditions, setConditions] = useState(initialConditions);

  // Memoize handlers to prevent recreation
  const handleConditionChange = useCallback((id, field, value) => {
    setConditions(prevConditions => 
      prevConditions.map(condition => {
        if (condition.id !== id) return condition;
        
        const updatedCondition = { ...condition, [field]: value };
        
        if (field === "condition_type") {
          const defaultField = conditionFieldOptions[value]?.[0]?.value || "";
          const defaultOperator = conditionOperatorOptions[value]?.[0]?.value || "";
          
          updatedCondition.field = defaultField;
          updatedCondition.operator = defaultOperator;
          updatedCondition.value = "";
        }
        
        return updatedCondition;
      })
    );
  }, []);

  const handleAddCondition = useCallback(() => {
    setConditions(prev => [...prev, {
      id: prev.length + 1,
      condition_type: "threshold",
      field: "source_ip",
      operator: "greater than or equal",
      value: "",
      window_period: ""
    }]);
  }, []);

  const handleRemoveCondition = useCallback((id) => {
    setConditions(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(condition => condition.id !== id);
    });
  }, []);

  const conditionFieldOptions = {
    threshold: [
      { value: "source_ip", label: "Source IP" },
      { value: "alert_count", label: "Alert Count" }
    ],
    severity: [
      { value: "severity", label: "Severity" }
    ],
    class_type: [
      { value: "class_type", label: "Class Type" }
    ],
    ip_reputation: [
      { value: "source_ip", label: "Source IP" }
    ],
    geolocation: [
      { value: "source_ip", label: "Source IP" }
    ],
    destination_targeting: [
      { value: "destination_ip", label: "Destination IP" }
    ]
  };

  const conditionTypeOptions = [
    { value: "threshold", label: "threshold" },
    { value: "severity", label: "Severity" },
    { value: "class_type", label: "Class Type" },
    { value: "ip_reputation", label: "IP Reputation" },
  ];

  const conditionOperatorOptions = {
    threshold: [
      {value: "greater than or equal", label: ">="}
    ],
    severity: [
      {value: "greater than or equal", label: ">="}
    ],
    class_type: [
      {value: "equal", label: "equals"},
      {value: "not equal", label: "not equals"}
    ],
    ip_reputation: [
      {value: "exists", label: "exists"},
    ],
    geo_location: [
      {value: "equal", label: "equals"},
      {value: "not equal", label: "not equals"}
    ]
  }

  const conditionValueOptions = {
    severity: [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
    ],
    ip_reputation: [
    { value: "threat_intel_feed", label: "threat intel feed" },
    ],
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
      description: description,
      triggerType: "Alert Category",
      actionType: actionType,
      status: status ? "active" : "inactive",
      triggerConditions: JSON.stringify(conditions),
      blockIP: blockIP,
      sendEmailAlert: sendEmailAlert,
      emailRecipients: emailRecipients,
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