"use client"

import { useState } from "react"
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
          transform: translateX(${isOn ? "20px" : "0"}),
          transition: "transform 0.3s",
        }}
      />
    </div>
  )
}

const Button = ({ children, onClick, variant = "default", className = "", style = {} }) => {
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
    <button style={{ ...styles[variant], ...style }} onClick={onClick} className={className}>
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

const initialModels = [
  {
    id: 1,
    algorithm: "Random Forest Classifier",
    createdBy: "Ng Mei Ting",
    dateTime: "5 Mar 2025 3pm",
    isUsed: false,
    isTraining: true,
  },
  {
    id: 2,
    algorithm: "Decision Tree",
    createdBy: "Ong Hui Min",
    dateTime: "10 Feb 2025 7pm",
    isUsed: false,
    isTraining: false,
  },
  {
    id: 3,
    algorithm: "SVM",
    createdBy: "Faris Amirul Bin Hassan",
    dateTime: "1 Jan 2025 10am",
    isUsed: true,
    isTraining: false,
  },
]

const TrainedModelsPage = () => {
  const [models, setModels] = useState(initialModels)
  const [isAddModelOpen, setIsAddModelOpen] = useState(false)
  const [newAlgorithm, setNewAlgorithm] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const userRole = "data-analyst"

  const handleToggleModel = (modelId) => {
    setModels(
      models.map((model) => {
        if (model.id === modelId) {
          return { ...model, isUsed: !model.isUsed }
        }
        return model.id !== modelId && !model.isTraining ? { ...model, isUsed: false } : model
      }),
    )
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleAddModel = () => {
    if (!newAlgorithm.trim()) return

    const newModel = {
      id: models.length + 1,
      algorithm: newAlgorithm,
      createdBy: "Current User",
      dateTime: new Date().toLocaleString(),
      isUsed: false,
      isTraining: false,
      fileName: selectedFile ? selectedFile.name : "No file uploaded",
    }

    setModels([...models, newModel])
    setNewAlgorithm("")
    setSelectedFile(null)
    setIsAddModelOpen(false)
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f4f4f4", overflow: "hidden" }}>
      <Sidebar userRole={userRole} />

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
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", width: "50px" }}>ID</th>
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", minWidth: "200px" }}>Algorithm</th>
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", minWidth: "180px" }}>Created By</th>
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", minWidth: "150px" }}>Date/Time Trained</th>
                  <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee", width: "100px" }}>Is Used</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model, index) => (
                  <tr key={model.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                    <td style={{ padding: "16px", borderBottom: "1px solid #eee" }}>{model.id}</td>
                    <td style={{ padding: "16px", borderBottom: "1px solid #eee" }}>{model.algorithm}</td>
                    <td style={{ padding: "16px", borderBottom: "1px solid #eee" }}>{model.createdBy}</td>
                    <td style={{ padding: "16px", borderBottom: "1px solid #eee" }}>{model.dateTime}</td>
                    <td style={{ padding: "16px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                      <Switch
                        isOn={model.isUsed}
                        onToggle={() => handleToggleModel(model.id)}
                        disabled={model.isTraining}
                      />
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
          <h2 style={{ margin: 0 }}>Add Models</h2>
        </div>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="algorithm" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>Algorithm</label>
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
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="model-upload" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>Upload Model</label>
            <div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input id="model-upload" type="file" onChange={handleFileChange} style={{ display: "none" }} />
                <Button variant="outline" onClick={() => document.getElementById("model-upload")?.click()} style={{ width: "100%", justifyContent: "flex-start" }}>
                  {selectedFile ? selectedFile.name : "Select file..."}
                </Button>
              </div>
              {selectedFile && (
                <p style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}>
                  File size: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <Button
            variant="default"
            onClick={handleAddModel}
            style={{
              backgroundColor: "#4CAF50",
              padding: "10px 20px",
              borderRadius: "6px",
            }}
          >
            Confirm
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsAddModelOpen(false)}
            style={{ padding: "10px 20px", borderRadius: "6px" }}
          >
            Cancel
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

export default TrainedModelsPage