import React, { useState ,useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"

const role = "1"; 

const DeleteConfirmationModal = ({ onClose, onConfirm }) => {
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
          textAlign: "center",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Are you sure you want to delete this role?</h3>
        <p style={{ marginBottom: "24px", color: "#666" }}>
          This action cannot be undone and all permissions associated with this role will be permanently deleted.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 24px",
              backgroundColor: "#90EE90",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "8px 24px",
              backgroundColor: "#ffcccb",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const RoleDetailModal = ({ onClose, onConfirm, role = null }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    roleName: role?.roleName || "",
    //permissions_id: role?.permission?.id || [],
    permission_id: role?.permission?.map(p => p.id) || [],
  })
  const [searchPermissions , setSearchPermissions] = useState([])

  useEffect(() => {
    if (role) {
      setFormData({
        roleName: role.roleName || "",
        permission_id: role.permission?.map(p => p.id) || [],
      });
    }
  }, [role]);


  const fetchPermission = async () => {
    try {
      const response = await fetch ("http://127.0.0.1:8000/roles-permission/permission/", {
          method: "GET",
        });

      if (response.ok) {
        const data = await response.json();
        setSearchPermissions(data); // Assuming the response is an array of permissions
      }else {
        throw new Error('Failed to fetch permissions');
      } 
    }
      catch (err) {
      console.error("Failed to fetch permissions:", err);
    }
  };
  

  useEffect(() => {
    fetchPermission();
  }, []);

  const filteredPermissions = searchPermissions.filter((permission) =>
    permission.permissionName?.toLowerCase().includes(searchQuery?.toLowerCase()|| ""),
  )

  const handlePermissionToggle = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permission_id: prev.permission_id?.includes(permission.id)
        ? prev.permission_id.filter((p) => p !== permission.id)
        //: [...prev.permissions_id || [], permission.id],
        : [...prev.permission_id, permission.id],
    }));
  }

  const handleConfirm = () => {
    if (!formData.roleName.trim()) {
      alert("Please enter a role name")
      return
    }
    onConfirm(formData)
    onClose()
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
          padding: "24px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0" }}>{role ? "Edit Role" : "Create Role"}</h2>
        <div
          style={{
            display: "flex",
            gap: "24px",
            flexDirection: "row",
            flexWrap: "wrap", // Added to prevent overflow on small screens
          }}
        >
          {/* Left Side - Role Input */}
          <div style={{ flex: "1 1 300px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>Role Name</label>
              <input
                type="text"
                value={formData.roleName}
                onChange={(e) => setFormData((prev) => ({ ...prev, roleName: e.target.value }))}
                placeholder="Enter role name"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#f5f5f5",
                  boxSizing: "border-box", // Added to prevent overflow
                }}
              />
            </div>
          </div>

          {/* Right Side - Permissions */}
          <div style={{ flex: "1 1 300px" }}>
            <h3 style={{ margin: "0 0 16px 0" }}>Permissions</h3>
            <input
              type="text"
              placeholder="Search permissions"
              value={formData.permission_id}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#e0e0e0",
                boxSizing: "border-box", // Added to prevent overflow
              }}
            />
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "16px",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {filteredPermissions.map((permission) => (
                <div
                  key={permission.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    id={permission.id}
                    //checked={formData.permissions_id?.includes(permission.id)?? false}
                    checked={formData.permission_id?.includes(permission.id)} // Checking if the permission id is in the array
                    onChange={() => handlePermissionToggle(permission)}
                    style={{ marginRight: "8px" }}
                  />
                  <label htmlFor={permission.id}>{permission.permissionName}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "24px",
          }}
        >
          <button
            onClick={handleConfirm}
            style={{
              padding: "8px 24px",
              backgroundColor: "#90EE90",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "8px 24px",
              backgroundColor: "#ffcccb",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const RolesAndPermissionPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [roles, setRoles] = useState([ ])
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [showRoleFilter, setShowRoleFilter] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false);


  const fetchRoles = async () => {
    try {
      const response = await fetch ("http://127.0.0.1:8000/roles-permission/", {
          method: "GET",
        });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user:", data); // Add this line to inspect the fetched data
        setRoles(data); // Assuming the response is an array of roles
      }else {
        throw new Error('Failed to fetch roles');
      } 
    }
      catch (err) {
      setError("Failed to fetch roles");
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchRoles();
  }, []);


  const uniqueRoles = ["All Roles", ...new Set(roles.map((role) => role.roleName))]


  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role?.roleName?.toLowerCase()?.includes(searchQuery.toLowerCase())
    const matchesFilter = roleFilter === "All Roles" || role.roleName === roleFilter
    return matchesSearch && matchesFilter
  })

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleOpenModal = (role = null) => {
    setSelectedRole(role)
    setShowRoleModal(true)
  }

  const handleConfirmRole = (formData) => {
    if (selectedRole) {
      // Modify existing role
      updateRole({ ...formData, id: selectedRole?.id });
    } else {
      // Add new role
      const newRole = {
        roleName: formData.roleName,
        permission_id: formData.permission_id,
      }
      addRole(newRole)
    }
    setShowRoleModal(false)
  }
  
  const updateRole = async (role) => {
    try {
      const response = await fetch (`http://127.0.0.1:8000/roles-permission/${role.id}/`, { method: "PUT", headers: {
        "Content-Type": "application/json", // Add this header to indicate the body is JSON
      },
        body: JSON.stringify(role), // Send userData as the payload to update the role
      });
  
      if (!response.ok) {
        throw new Error("Failed to update role");
      }
  
      fetchRoles(); // Refresh the roles list
    } catch (err) {
      setError("Failed to edit role");
    }
  };


  const addRole = async (role) => {
    try {
      await fetch(`http://127.0.0.1:8000/roles-permission/`, { method: "POST" , headers: {
        "Content-Type": "application/json", // Add this header to indicate the body is JSON
      },
        body: JSON.stringify(role), // Send userData as the payload to add the user
      });
      fetchRoles() 
    } catch (err) {
      setError("Failed to add role");
    }
  };

  const handleDelete = async (role) => {
    await deleteUser(role)
    fetchRoles()
  }


  const deleteUser = async (role) => {
    try {
      await fetch(`http://127.0.0.1:8000/roles-permission/${role.id}/`, { method: "DELETE" });
      fetchRoles()
    } catch (err) {
      setError("Failed to delete role");
    }
  };

  const handleConfirmDelete = () => {
    setRoles(roles.filter((role) => role.id !== roleToDelete.id))
    setShowDeleteModal(false)
    setRoleToDelete(null)
    fetchRoles()
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setRoleToDelete(null)
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f4f4f4",
        overflow: "hidden", // Added to prevent horizontal scrolling
      }}
    >
      <Sidebar userRole={role} />

      <div
        style={{
          flex: 1,
          padding: "32px",
          overflowY: "auto", // Allow vertical scrolling
          overflowX: "hidden", // Prevent horizontal scrolling
        }}
      >
        <h1 style={{ margin: "0 0 8px 0" }}>Roles & Permission Management</h1>
        <h2 style={{ margin: "0 0 24px 0", fontWeight: "normal", color: "#666" }}>Role Details & Permissions</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap", // Added to prevent overflow on small screens
            gap: "10px", // Added for spacing when wrapped
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => handleOpenModal()}
              style={{
                background: "#90EE90",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              +
            </button>
            Add Role
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap", // Added to prevent overflow on small screens
            }}
          >
            <button
              onClick={() => fetchRoles()}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                color: "#666",
              }}
            >
              🔄
            </button>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowRoleFilter(!showRoleFilter)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#666",
                }}
              >
                🝖
              </button>
              {showRoleFilter && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    zIndex: 10,
                    width: "150px",
                  }}
                >
                  {uniqueRoles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => {
                        setRoleFilter(role)
                        setShowRoleFilter(false)
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: roleFilter === role ? "#f0f0f0" : "transparent",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearch}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  width: "200px",
                  boxSizing: "border-box", // Added to prevent overflow
                }}
              />
              <button
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#666",
                }}
              >
                🔍
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "8px",
            overflow: "auto", // Changed from "hidden" to "auto" to allow scrolling if needed
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            maxWidth: "100%", // Added to prevent overflow
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>#</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Roles</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Modify</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "16px" }}>{role.id}</td>
                  <td style={{ padding: "16px", textAlign: "center" }}>{role.roleName}</td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                      <button
                        onClick={() => handleOpenModal(role)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #eee",
              textAlign: "right",
              color: "#666",
            }}
          >
            Page 1 of 2
          </div>
        </div>

        {showRoleModal && (
          <RoleDetailModal role={selectedRole} onClose={() => setShowRoleModal(false)} onConfirm={handleConfirmRole} />
        )}

        {showDeleteModal && (
          <DeleteConfirmationModal onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} />
        )}
      </div>
    </div>
  )
}

export default RolesAndPermissionPage

