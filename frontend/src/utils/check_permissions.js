import { jwtDecode } from "jwt-decode";

export function getUserDetailsFromToken() {
    // Retrieve the token from localStorage
    const token = localStorage.getItem("token");

    // Check if the token exists
    if (!token) {
        console.warn("No token found");
        return null;
    }

    try {
        // Decode the JWT token
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);
        // Extract and return the username & userrole
        return { username: decodedToken.sub, userRole: decodedToken.role };
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
}

export async function fetchPermissions(username) {
    if (!username) {
        console.error("No username provided");
        return null;
    }

    try {
        console.log("Fetching permissions for username:", username);
        const response = await fetch(`http://localhost:8000/check-permissions/${username}`);
        if (!response.ok) {
            throw new Error("Failed to fetch permissions");
        }
        const data = await response.json();
        console.log("Permissions:", data);
        return data;
    } catch (error) {
        console.error("Error fetching permissions:", error);
        return null;
    }
}


export async function fetchUserRole() {
    const user = getUserDetailsFromToken();

    if (!user) {
      console.error("No user details retrieved from token");
      return false;
  }

    const username = user?.username;

    try {
        console.log("Fetching role for username:", username);
        const response = await fetch(`http://localhost:8000/check-permissions/userrole/${username}`);
        if (!response.ok) {
            throw new Error("Failed to fetch user's role");
        }
        const role = await response.json();
        console.log("Role:", role);

        if (role == null) {
            console.error("User role is null");
        }

        return role;
    } catch (error) {
        console.error("Error fetching role:", error);
        return null;
    }
}



export async function checkPermissions(permission) {

  const user = getUserDetailsFromToken();

  if (!user) {
    console.error("No user details retrieved from token");
    return false;
}
    const username = user?.username;
    const permissionFound = false;
    try {
        const permissions = await fetchPermissions(username);
        if (!permissions) {
            console.error("No permissions found");
            return false;
        }
        if (permissions.includes(permission)) {
          return true;
      }
    
    } catch (error) {
        console.error("Error checking permissions:", error);
        return false;
    }
}