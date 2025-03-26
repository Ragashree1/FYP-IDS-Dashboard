
import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"

const userRole = "data-analyst"
const permission = "Train Models"

const FileUploadArea = ({ onFileSelect, uploadProgress, isUploading, onCancelUpload, uploadedFile, onDeleteFile }) => {
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].name.endsWith(".csv")) {
      onFileSelect(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0 && files[0].name.endsWith(".csv")) {
      onFileSelect(files[0])
    }
  }

  if (uploadedFile) {
    return (
      <div
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          padding: "20px",
          backgroundColor: "white",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "500", marginBottom: "4px" }}>Uploaded File</div>
            <div style={{ color: "#666", fontSize: "14px" }}>{uploadedFile.name}</div>
          </div>
          <button
            onClick={onDeleteFile}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              padding: "8px",
              color: "#ff4444",
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    )
  }

  if (isUploading) {
    return (
      <div
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          padding: "20px",
          backgroundColor: "white",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span>Media Upload</span>
          <button
            onClick={onCancelUpload}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ color: "#666", fontSize: "14px", marginBottom: "5px" }}>Only support .csv files</div>
        <div style={{ marginTop: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span>Uploading trainData.csv...</span>
            <span>
              {uploadProgress}% • {uploadProgress < 100 ? "30 seconds remaining" : "Complete!"}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "#e0e0e0",
              borderRadius: "2px",
            }}
          >
            <div
              style={{
                width: `${uploadProgress}%`,
                height: "100%",
                backgroundColor: uploadProgress === 100 ? "#4CAF50" : "#2196F3",
                borderRadius: "2px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        border: "2px dashed #ccc",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "white",
        width: "100%",
        maxWidth: "600px",
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>Upload data to train model on</div>
        <div style={{ color: "#666", fontSize: "14px" }}>Add your csv file here, and you can upload max of 1 file</div>
      </div>
      <div
        style={{
          border: "2px dashed #e0e0e0",
          borderRadius: "8px",
          padding: "40px 20px",
          marginBottom: "10px",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>📁</div>
        <div>Drag your file(s) to start uploading</div>
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Browse files
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".csv" style={{ display: "none" }} />
        </div>
      </div>
      <div style={{ color: "#666", fontSize: "14px" }}>Only support .csv file</div>
    </div>
  )
}

const ConfusionMatrix = ({ data }) => {
  return (
    <div style={{ marginTop: "40px" }}>
      <h3 style={{ marginBottom: "20px" }}>Confusion Matrix</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", maxWidth: "600px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "12px", backgroundColor: "#f5f5f5", border: "1px solid #ddd" }}>
                Predicted/Actual
              </th>
              <th style={{ padding: "12px", backgroundColor: "#f5f5f5", border: "1px solid #ddd" }}>Positive</th>
              <th style={{ padding: "12px", backgroundColor: "#f5f5f5", border: "1px solid #ddd" }}>Negative</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "12px", backgroundColor: "#f5f5f5", border: "1px solid #ddd" }}>Positive</td>
              <td style={{ padding: "12px", backgroundColor: "#e3f2fd", border: "1px solid #ddd" }}>
                {data.truePositive}%
              </td>
              <td style={{ padding: "12px", backgroundColor: "#ffebee", border: "1px solid #ddd" }}>
                {data.falsePositive}%
              </td>
            </tr>
            <tr>
              <td style={{ padding: "12px", backgroundColor: "#f5f5f5", border: "1px solid #ddd" }}>Negative</td>
              <td style={{ padding: "12px", backgroundColor: "#ffebee", border: "1px solid #ddd" }}>
                {data.falseNegative}%
              </td>
              <td style={{ padding: "12px", backgroundColor: "#e3f2fd", border: "1px solid #ddd" }}>
                {data.trueNegative}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

const TrainModel = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [modelParams, setModelParams] = useState({
    algorithm: "Random Forest Classifier",
    trainTestSplit: 60,
    nEstimators: 5,
    maxDepth: 10,
    maxFeatures: 20,
    minSamplesSplit: 20,
    maxLeafNodes: "",
  })
  const [evaluationData, setEvaluationData] = useState({
    truePositive: 81.9,
    falsePositive: 18.1,
    falseNegative: 17.7,
    trueNegative: 82.3,
  })

  useEffect(() => {
    const verifyPermissions = async () => {
        checkPermissions(navigate, permission);
    };

    verifyPermissions();
}, [navigate]);

  const handleFileSelect = (file) => {
    setIsUploading(true)
    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            setUploadedFile(file)
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleCancelUpload = () => {
    setIsUploading(false)
    setUploadProgress(0)
  }

  const handleDeleteFile = () => {
    setUploadedFile(null)
  }

  const handleParamChange = (param, value) => {
    setModelParams((prev) => ({
      ...prev,
      [param]: value,
    }))
  }

  const handleTrainModel = () => {
    console.log("Training model with parameters:", modelParams)
    // Add your model training logic here
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
        <h1 style={{ margin: "0 0 40px 0" }}>Train Model</h1>

        {/* Dataset Section */}
        <div style={{ marginBottom: "60px" }}>
          <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>Dataset</h2>
          <FileUploadArea
            onFileSelect={handleFileSelect}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
            onCancelUpload={handleCancelUpload}
            uploadedFile={uploadedFile}
            onDeleteFile={handleDeleteFile}
          />
        </div>

        {/* Model Parameters Section */}
        <div style={{ marginBottom: "60px" }}>
          <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>Model Parameters</h2>
          <div style={{ maxWidth: "800px", backgroundColor: "white", padding: "30px", borderRadius: "8px" }}>
            <div style={{ marginBottom: "40px" }}>
              {/* Updated this section to be more responsive */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  marginBottom: "30px",
                  gap: "15px",
                }}
              >
                <label
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    minWidth: "100px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Algorithm
                </label>
                <div
                  style={{
                    flex: "1",
                    minWidth: "200px",
                    maxWidth: "100%",
                  }}
                >
                  <select
                    value={modelParams.algorithm}
                    onChange={(e) => handleParamChange("algorithm", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      backgroundColor: "#f5f5f5",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="RandomForestClassifier">Random Forest Classifier</option>
                    <option value="DecisionTreeClassifier">Decision Tree Classifier</option>
                    <option value="SVM">SVM</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <label
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    minWidth: "100px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Train/Test
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    flex: "1",
                    minWidth: "200px",
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={modelParams.trainTestSplit}
                    onChange={(e) => handleParamChange("trainTestSplit", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <span style={{ minWidth: "80px", textAlign: "right" }}>
                    {modelParams.trainTestSplit}%/{100 - modelParams.trainTestSplit}%
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "30px",
                marginBottom: "40px",
              }}
            >
              <div>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>N Estimators</label>
                <input
                  type="number"
                  value={modelParams.nEstimators}
                  onChange={(e) => handleParamChange("nEstimators", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>Max Depth</label>
                <input
                  type="number"
                  value={modelParams.maxDepth}
                  onChange={(e) => handleParamChange("maxDepth", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>Max Features</label>
                <input
                  type="number"
                  value={modelParams.maxFeatures}
                  onChange={(e) => handleParamChange("maxFeatures", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "30px",
                marginBottom: "40px",
              }}
            >
              <div>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>Min Samples Split</label>
                <input
                  type="number"
                  value={modelParams.minSamplesSplit}
                  onChange={(e) => handleParamChange("minSamplesSplit", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>Max Leaf Nodes</label>
                <input
                  type="number"
                  value={modelParams.maxLeafNodes}
                  onChange={(e) => handleParamChange("maxLeafNodes", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleTrainModel}
              style={{
                padding: "12px 32px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Train Model
            </button>
          </div>
        </div>

        {/* Evaluation Section */}
        <div style={{ marginBottom: "60px" }}>
          <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>Evaluation</h2>
          <div style={{ maxWidth: "800px", backgroundColor: "white", padding: "30px", borderRadius: "8px" }}>
            <ConfusionMatrix data={evaluationData} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainModel
//
