import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"

const userRole = "data-analyst"

const Switch = ({ isOn, onToggle, disabled = false }) => {
  return (
    <div
      onClick={() => !disabled && onToggle(!isOn)}
      style={{
        width: "40px",
        height: "20px",
        backgroundColor: isOn ? "#90EE90" : "#ccc",
        borderRadius: "10px",
        padding: "2px",
        cursor: disabled ? "default" : "pointer",
        transition: "background-color 0.3s",
        opacity: disabled ? 0.5 : 1,
        margin: "0 auto", // Center the switch horizontally
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

const TrainedModelsPage = () => {
  const navigate = useNavigate()
  const [models, setModels] = useState([
    {
      id: 1,
      algorithm: "Random Forest Classifier",
      createdBy: "Ng Mei Ting",
      dateTime: "5 Mar 2025 3pm",
      status: "70% trained",
      accuracy: "70%",
      isUsed: false,
      isTraining: true,
    },
    {
      id: 2,
      algorithm: "Decision Tree",
      createdBy: "Ong Hui Min",
      dateTime: "10 Feb 2025 7pm",
      status: "Trained",
      accuracy: "65%",
      isUsed: false,
      isTraining: false,
    },
    {
      id: 3,
      algorithm: "SVM",
      createdBy: "Faris Amirul Bin Hassan",
      dateTime: "1 Jan 2025 10am",
      status: "Trained",
      accuracy: "74%",
      isUsed: true,
      isTraining: false,
    },
  ])

  const handleToggleModel = (modelId) => {
    setModels(
      models.map((model) => {
        // If we're turning on this model, turn off all others
        if (model.id === modelId) {
          return { ...model, isUsed: !model.isUsed }
        }
        // If we're turning on a model, turn off all others
        return model.id !== modelId && !model.isTraining ? { ...model, isUsed: false } : model
      }),
    )
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f4f4f4", overflow: "hidden" }}>
      <Sidebar userRole={userRole} />

      <div style={{ flex: 1, padding: "32px", overflowY: "auto", overflowX: "hidden" }}>
        <h1 style={{ margin: "0 0 32px 0" }}>Trained Models</h1>

        <div style={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", whiteSpace: "nowrap" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", width: "50px" }}>
                    ID
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", minWidth: "200px" }}>
                    Algorithm
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", minWidth: "180px" }}>
                    Created By
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", minWidth: "150px" }}>
                    Date/Time Trained
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", minWidth: "120px" }}>
                    Status
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee", width: "100px" }}>
                    Accuracy
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee", width: "100px" }}>
                    Is Used
                  </th>
                </tr>
              </thead>
              <tbody>
                {models.map((model, index) => (
                  <tr
                    key={model.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                    }}
                  >
                    <td style={{ padding: "16px", borderBottom: "1px solid #eee" }}>{model.id}</td>
                    <td style={{ padding: "16px", borderBottom: "1px solid #eee" }}>{model.algorithm}</td>
                    <td style={{ padding: "16px", borderBottom: "1px solid #eee" }}>{model.createdBy}</td>
                    <td style={{ padding: "16px", borderBottom: "1px solid #eee" }}>{model.dateTime}</td>
                    <td style={{ padding: "16px", borderBottom: "1px solid #eee" }}>
                      <span
                        style={{
                          color: model.status === "Trained" ? "#4CAF50" : "#666",
                          fontWeight: model.status === "Trained" ? "500" : "normal",
                        }}
                      >
                        {model.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px", borderBottom: "1px solid #eee" }}>{model.accuracy}</td>
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
    </div>
  )
}

export default TrainedModelsPage
//

