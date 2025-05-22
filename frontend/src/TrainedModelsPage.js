import React, { useState, useEffect } from "react"
import axios from "axios"
import Sidebar from "./Sidebar"
// Add form styles here
const formStyles = {
  "form-label": {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  "form-input": {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    backgroundColor: "#f5f5f5",
    boxSizing: "border-box",
    fontSize: "14px",
    transition: "border-color 0.2s",
    "&:focus": {
      outline: "none",
      borderColor: "#3B82F6",
    }
  }
}
const Switch = ({ isOn, onToggle, disabled = false }) => {
  return (
    <div
      onClick={() => !disabled && onToggle(!isOn)}
      style={{
        width: "40px",
        height: "20px",
        backgroundColor: isOn ? "#4ADE80" : "#E5E7EB",
        borderRadius: "10px",
        padding: "2px",
        cursor: disabled ? "default" : "pointer",
        transition: "background-color 0.3s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          width: "16px",
          height: "16px",
          backgroundColor: "white",
          borderRadius: "50%",
          transform: `translateX(${isOn ? "20px" : "0"})`,
          transition: "transform 0.3s",
        }}
      />
    </div>
  )
}

const Button = ({ children, onClick, variant = "default", style = {} }) => {
  const baseStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
    border: "none",
    transition: "background-color 0.2s",
  }

  const styles = {
    default: {
      ...baseStyle,
      backgroundColor: "#4CAF50",
      color: "white",
    },
    outline: {
      ...baseStyle,
      backgroundColor: "transparent",
      border: "1px solid #ccc",
      color: "#333",
    },
    destructive: {
      ...baseStyle,
      backgroundColor: "#f44336",
      color: "white",
    },
    editing: {
      ...baseStyle,
      backgroundColor: "#008000",
      color: "white",
    },
  }
  

  return (
    <button style={{ ...styles[variant], ...style }} onClick={onClick}>
      {children}
    </button>
  )
}

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null

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
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={() => onOpenChange(false)}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

const TrainedModelsPage = () => {
  const [models, setModels] = useState([])
  const userRole = "4" // Add this line for Data Analyst role
  const [newModelName, setNewModelName] = useState("") // Added state for model name
  const [newAlgorithm, setNewAlgorithm] = useState("")
  const [labelMappingText, setLabelMappingText] = useState("")
  const [modelType, setModelType] = useState("anomaly") // Default to 'anomaly'
  const [modelFile, setModelFile] = useState(null)
  const [preprocessorFile, setPreprocessorFile] = useState(null)
  const [useDefaultPreprocessor, setUseDefaultPreprocessor] = useState(false)
  const [hasBuiltInPreprocessor, setHasBuiltInPreprocessor] = useState(false)
  const [labelMappingFile, setLabelMappingFile] = useState(null)
  const [featuresList, setFeaturesList] = useState("")
  const [useDefaultFeatures, setUseDefaultFeatures] = useState(false)
  const [editingModel, setEditingModel] = useState(null);
  const [normalClassName, setNormalClassName] = useState("");
  
  // Modify dialog open state to handle both add and edit
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const baseUrl = "https://api.secuboard.live"

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    const response = await axios.get(baseUrl + "/ml_model", {
      params: { organization_id: await getOrgId() },
    })
    setModels(response.data)
  }

  const handleEditClick = (model) => {
    setEditingModel(model);
    setNewModelName(model.model_name);
    setNewAlgorithm(model.algorithm);
    setModelType(model.model_type);
    setLabelMappingText(model.label_mapping ? JSON.stringify(model.label_mapping, null, 2) : "");
    setUseDefaultPreprocessor(model.use_default_preprocessor);
    setHasBuiltInPreprocessor(model.has_built_in_preprocessor);
    setFeaturesList(model.features_list || "");
    setUseDefaultFeatures(model.use_default_features);
    setNormalClassName(model.normal_class_name || "");
    setIsModelDialogOpen(true);
  };

  const resetForm = () => {
    setNewModelName("")
    setNewAlgorithm("")
    setModelType("anomaly")
    setModelFile(null)
    setPreprocessorFile(null)
    setUseDefaultPreprocessor(false)
    setHasBuiltInPreprocessor(false)
    setLabelMappingFile(null)
    setFeaturesList("")
    setUseDefaultFeatures(false)
    setLabelMappingText("")
  }

  const handleSubmitModel = async () => {
    if (!newModelName.trim() || !newAlgorithm.trim() || !modelFile) return
    const formData = new FormData()
    formData.append("model_name", newModelName)
    formData.append("algorithm", newAlgorithm)
    formData.append("model_type", modelType)
    formData.append("organization_id", await getOrgId())

    if (modelType === "multiclass" ) {
      formData.append("normal_class_name", normalClassName)
      if (labelMappingText.trim()) {
        try {
          const mappingJSON = JSON.parse(labelMappingText)
          formData.append("label_mapping", JSON.stringify(mappingJSON))
        } catch (error) {
          alert("Invalid JSON format for table mapping")
          return
        }
      }
    }
    if (useDefaultPreprocessor) {
      formData.append("use_default_preprocessor", true)
    } else if (hasBuiltInPreprocessor) {
      formData.append("has_built_in_preprocessor", true)
    } else {
      if (!preprocessorFile.trim()) {
        alert("Features list is required when not using default features")
        return
      }
      formData.append("preprocessor_file", preprocessorFile)
    }

    if (useDefaultFeatures) {
      formData.append("use_default_features", true)
    } else {
      if (!featuresList.trim()) {
        alert("Features list is required when not using default features")
        return
      }
      formData.append("features_list", featuresList)
    }

    formData.append("model_file", modelFile)

    try {
      if (editingModel) {
        await axios.put(baseUrl + `/ml_model/${editingModel.id}`, formData);
      } else {
        await axios.post(baseUrl + "/ml_model", formData);
      }
      fetchModels();
      setIsModelDialogOpen(false);
      resetForm();
    } catch (error) {
      alert("Error " + (editingModel ? "updating" : "adding") + " model: " + 
        error.response?.data?.detail || error.message);
    }
  };
    

  const handleAddModel = async () => {
    if (!newModelName.trim() || !newAlgorithm.trim() || !modelFile) return

    const formData = new FormData()
    formData.append("model_name", newModelName)
    formData.append("algorithm", newAlgorithm)
    formData.append("model_type", modelType)
    formData.append("organization_id", await getOrgId())

    if (modelType === "multiclass" && labelMappingText.trim()) {
      try {
        formData.append("normal_class_name", normalClassName)
        const mappingJSON = JSON.parse(labelMappingText)
          // Change this part - send as string instead of Blob
        formData.append("label_mapping", JSON.stringify(mappingJSON))
        // const mappingJSON = JSON.parse(labelMappingText)
        // formData.append("label_mapping_file", new Blob([JSON.stringify(mappingJSON)], {
        //   type: 'application/json'
        // }))
      } catch (error) {
        alert("Invalid JSON format for table mapping")
        return
      }
    }


    if (useDefaultPreprocessor) {
      formData.append("use_default_preprocessor", true)
    } else if (hasBuiltInPreprocessor) {
      formData.append("has_built_in_preprocessor", true)
    } else {
      if (!preprocessorFile.trim()) {
        alert("Features list is required when not using default features")
        return
      }
      formData.append("preprocessor_file", preprocessorFile)
    }
    
    if (labelMappingFile) {
      formData.append("label_mapping_file", labelMappingFile)
    }
    
    if (useDefaultFeatures) {
      formData.append("use_default_features", true)
    } else {
      if (!featuresList.trim()) {
        alert("Features list is required when not using default features")
        return
      }
      formData.append("features_list", featuresList)
    }

    formData.append("model_file", modelFile)

    try {
      await axios.post(baseUrl + "/ml_model", formData)
      fetchModels()
      setIsModelDialogOpen(false)
      resetForm()
    } catch (error) {
      alert("Error adding model: " + error.response?.data?.detail || error.message)
    }
  }

  const handleDeleteModel = async (modelId) => {
    await axios.delete(baseUrl + `/ml_model/${modelId}`)
    fetchModels()
  }

  const handleToggleModelStatus = async (modelId, isActive) => {
    await axios.put(baseUrl + `/ml_model/${modelId}/status`, {
      organization_id: await getOrgId(),
      is_active: isActive,
      model_id: modelId,
    })
    await fetchModels()
  }

  const getOrgId = async () => {
    const token = localStorage.getItem("token")
    const response = await fetch(`${baseUrl}/login/get_user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return data.user.organization_id
  }

  

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f4f4f4", overflow: "hidden" }}>
      <Sidebar userRole={userRole} /> {/* Add userRole prop */}

      <div style={{ flex: 1, padding: "32px", overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>Trained Models</h1>
          <Button
            onClick={() => setIsModelDialogOpen(true)}
            style={{
              backgroundColor: "#3B82F6",
              padding: "10px 16px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <span style={{ marginRight: "8px", fontSize: "18px" }}>+</span>
            Add Model
          </Button>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", whiteSpace: "nowrap" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", width: "10%" }}>No.</th>
              <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", width: "30%" }}>Algorithm</th>
              <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", width: "30%" }}>File Name</th>
              <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee", width: "15%" }}>Is Active</th>
              <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee", width: "15%" }}>Actions</th>
            </tr>
            </thead>
            <tbody>
            {[...models]
          .sort((a, b) => Number(a.id) - Number(b.id)) // Sort by ID in ascending order
          .map((model, index) => (
          <tr key={model.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
            <td style={{ padding: "16px", borderBottom: "1px solid #eee", verticalAlign: "middle" }}>{index + 1}</td>
            <td style={{ padding: "16px", borderBottom: "1px solid #eee", verticalAlign: "middle" }}>{model.algorithm} haha {model.is_active}</td>
            <td style={{ padding: "16px", borderBottom: "1px solid #eee", verticalAlign: "middle" }}>{model.model_file_name}</td>
            <td style={{ padding: "16px", borderBottom: "1px solid #eee", verticalAlign: "middle" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
              <Switch
                isOn={Boolean(model.is_active)} // Ensure it's a boolean
                onToggle={() => handleToggleModelStatus(model.id, !model.is_active)}
              />
            </div>
            </td>
            <td style={{ padding: "16px", borderBottom: "1px solid #eee", verticalAlign: "middle" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", width: "100%" }}>
              <Button variant="destructive" onClick={() => handleDeleteModel(model.id)}>
                Delete
              </Button>
              <Button variant="editing" onClick={() => handleEditClick(model)}>
                Edit
              </Button>
            </div>
          </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0 }}>Add Model</h2>
      </div>
      <div style={{ marginBottom: "24px" }}>
        {/* Model Name field */}
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="model-name" style={formStyles["form-label"]}>Model Name</label>
          <input
            id="model-name"
            value={newModelName}
            onChange={(e) => setNewModelName(e.target.value)}
            style={formStyles["form-input"]}
          />
        </div>

        {/* Algorithm field */}
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="algorithm" style={formStyles["form-label"]}>Algorithm</label>
          <input
            id="algorithm"
            value={newAlgorithm}
            onChange={(e) => setNewAlgorithm(e.target.value)}
            style={formStyles["form-input"]}
          />
        </div>

        {/* Model Type Selection */}
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="model-type" style={formStyles["form-label"]}>Model Type</label>
          <select
            id="model-type"
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            style={formStyles["form-input"]}
          >
            <option value="anomaly">Anomaly Detection</option>
            <option value="multiclass">Multi-class Classification</option>
          </select>
        </div>

        {/* Label Mapping File Upload (for multiclass) */}
        {modelType === "multiclass" && (
          
        <div style={{ marginBottom: "16px" }}>

      <label htmlFor="normal-class" style={formStyles["form-label"]}>
        Normal Traffic Class Name
      </label>
      <input
        id="normal-class"
        value={normalClassName}
        onChange={(e) => setNormalClassName(e.target.value)}
        placeholder="e.g., Normal, Benign, etc."
        style={formStyles["form-input"]}
      />
      <div style={{ marginTop: "4px", fontSize: "12px", color: "#666" }}>
        Specify the class name used for normal traffic in your model
        </div>

          <label htmlFor="mapping-text" style={formStyles["form-label"]}>Table Mapping (JSON)</label>
          <textarea
            id="mapping-text"
            value={labelMappingText}
            onChange={(e) => setLabelMappingText(e.target.value)}
            placeholder={`Enter JSON mapping, e.g.:
    {
      "0": "Normal",
      "1": "DoS",
      "2": "Probe"
    }`}
            style={{
              ...formStyles["form-input"],
              minHeight: "120px",
              fontFamily: "monospace",
              whiteSpace: "pre"
            }}
          />
          <div style={{ marginTop: "4px", fontSize: "12px", color: "#666" }}>
            Enter the mapping between numeric labels and their descriptions in JSON format
          </div>
        </div>
      )}

        {/* Model File Upload */}
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="model-upload" style={formStyles["form-label"]}>Upload Model (.pkl)</label>
          <input
            id="model-upload"
            type="file"
            accept=".pkl"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file && file.name.endsWith(".pkl")) {
                setModelFile(file)
              } else {
                alert("Please upload a valid .pkl file.")
                e.target.value = null
              }
            }}
            style={formStyles["form-input"]}
          />
        </div>

        {/* Preprocessor Options */}
        <div style={{ marginBottom: "16px" }}>
          <label style={formStyles["form-label"]}>Preprocessor Options</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label>
              <input
                type="checkbox"
                checked={useDefaultPreprocessor}
                onChange={(e) => setUseDefaultPreprocessor(e.target.checked)}
              />
              Use Default Preprocessor
            </label>
            <label>
              <input
                type="checkbox"
                checked={hasBuiltInPreprocessor}
                onChange={(e) => setHasBuiltInPreprocessor(e.target.checked)}
              />
              Has Built-in Preprocessor
            </label>
          </div>
        </div>

        {/* Preprocessor File Upload (if not using default or built-in) */}
        {!useDefaultPreprocessor && !hasBuiltInPreprocessor && (
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="preprocessor-upload" style={formStyles["form-label"]}>
              Upload Preprocessor (.pkl)
            </label>
            <input
              id="preprocessor-upload"
              type="file"
              accept=".pkl"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file && file.name.endsWith(".pkl")) {
                  setPreprocessorFile(file)
                } else {
                  alert("Please upload a valid .pkl file.")
                  e.target.value = null
                }
              }}
              style={formStyles["form-input"]}
            />
          </div>
        )}

        
        {/* Features List */}
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="features" style={formStyles["form-label"]}>Features List</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label>
              <input
                type="checkbox"
                checked={useDefaultFeatures}
                onChange={(e) => setUseDefaultFeatures(e.target.checked)}
              />
              Use Default Features
            </label>
            {!useDefaultFeatures && (
              <textarea
                id="features"
                value={featuresList}
                onChange={(e) => setFeaturesList(e.target.value)}
                placeholder="Enter comma-separated features..."
                style={{ minHeight: "80px" }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        <Button variant="default" onClick={handleSubmitModel}>
          Confirm
        </Button>
        <Button variant="destructive" onClick={() => {
          setIsModelDialogOpen(false)
          resetForm()
        }}>
          Cancel
        </Button>
      </div>
    </Dialog>
    </div>
  )
}

export default TrainedModelsPage