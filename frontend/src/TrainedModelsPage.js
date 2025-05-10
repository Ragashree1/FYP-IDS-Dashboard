import React, { useState, useEffect } from "react"
import axios from "axios"
import Sidebar from "./Sidebar"

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
  const [isAddModelOpen, setIsAddModelOpen] = useState(false)
  const [newModelName, setNewModelName] = useState("") // Added state for model name
  const [newAlgorithm, setNewAlgorithm] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const organizationId = 1 // Example organization ID
  const baseUrl = "http://localhost:8000"

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    const response = await axios.get(baseUrl + "/ml_model", {
      params: { organization_id: await getOrgId() },
    })
    setModels(response.data)
  }

  const handleAddModel = async () => {
    if (!newModelName.trim() || !newAlgorithm.trim() || !selectedFile) return

    const formData = new FormData()
    formData.append("model_name", newModelName) // Include model name
    formData.append("algorithm", newAlgorithm)
    formData.append("organization_id", await getOrgId())
    formData.append("file", selectedFile)

    await axios.post(baseUrl + "/ml_model", formData)
    fetchModels()
    setIsAddModelOpen(false)
    setNewModelName("") // Reset model name
    setNewAlgorithm("") // Reset algorithm
    setSelectedFile(null) // Reset file input
  }

  const handleDeleteModel = async (modelId) => {
    await axios.delete(baseUrl + `/ml_model/${modelId}`)
    fetchModels()
  }

  const handleToggleModelStatus = async (modelId, isActive) => {
    await axios.put(baseUrl + `/ml_model/${modelId}/status`, {
      organization_id: organizationId,
      is_active: isActive,
    })
    fetchModels()
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
      <Sidebar />

      <div style={{ flex: 1, padding: "32px", overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>Trained Models</h1>
          <Button
            onClick={() => setIsAddModelOpen(true)}
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
            {models.map((model, index) => (
          <tr key={model.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
            <td style={{ padding: "16px", borderBottom: "1px solid #eee", verticalAlign: "middle" }}>{index + 1}</td>
            <td style={{ padding: "16px", borderBottom: "1px solid #eee", verticalAlign: "middle" }}>{model.algorithm}</td>
            <td style={{ padding: "16px", borderBottom: "1px solid #eee", verticalAlign: "middle" }}>{model.file_name}</td>
            <td style={{ padding: "16px", borderBottom: "1px solid #eee", verticalAlign: "middle" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                <Switch
                  isOn={model.is_active}
                  onToggle={() => handleToggleModelStatus(model.id, !model.is_active)}
                />
              </div>
            </td>
            <td style={{ padding: "16px", borderBottom: "1px solid #eee", verticalAlign: "middle" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                <Button variant="destructive" onClick={() => handleDeleteModel(model.id)}>
                  Delete
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

      <Dialog open={isAddModelOpen} onOpenChange={setIsAddModelOpen}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0 }}>Add Model</h2>
        </div>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="model-name"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Model Name
            </label>
            <input
              id="model-name"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                backgroundColor: "#f5f5f5",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="algorithm"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Algorithm
            </label>
            <input
              id="algorithm"
              value={newAlgorithm}
              onChange={(e) => setNewAlgorithm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                backgroundColor: "#f5f5f5",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="model-upload"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Upload Model
            </label>
            <input
              id="model-upload"
              type="file"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file && file.name.endsWith(".pkl")) {
                  setSelectedFile(file)
                } else {
                  alert("Please upload a valid .pkl file.")
                  e.target.value = null // Reset the file input
                }
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                backgroundColor: "#f5f5f5",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <Button variant="default" onClick={handleAddModel}>
            Confirm
          </Button>
          <Button variant="destructive" onClick={() => setIsAddModelOpen(false)}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

export default TrainedModelsPage