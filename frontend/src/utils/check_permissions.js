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
        return { username: decodedToken.username, userRole: decodedToken.userRole };
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
        const response = await fetch(`http://127.0.0.1:8000/check-permissions/${username}`);
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


export async function checkPermissions(navigate, permission) {

  const user = getUserDetailsFromToken();

  if (!user) {
    console.error("No user details retrieved from token");
    return false;
}
    const userRole = user?.userRole;
    const username = user?.username;
    const permissionFound = false;
    try {
        const permissions = await fetchPermissions(username);
        if (!permissions) {
            console.error("No permissions found");
            return permissionFound == false;
        }
        if (permissions.includes(permission)) {
          return permissionFound == true;
      }

        if(userRole === "Organisation Admin" && !permissionFound){ // if the user is an organisation admin and the permission is false or empty
          console.log("Permission not found! Navigating....");
          navigate("/user-management");
        }
        else if (!permissionFound){ // if the user is not organisation admin and the permission is false or empty
          console.log("Permission not found! Navigating....");
          navigate("/dashboard");
        }
    
    } catch (error) {
        console.error("Error checking permissions:", error);
        return false;
    }
}