
const API_BASE_URL = "http://localhost:5000/api";

function getAuthToken() {
  try {
    const auth = localStorage.getItem("fms_auth");

    if (auth) {
      const parsed = JSON.parse(auth);

      if (parsed?.token && typeof parsed.token === "string") {
        return parsed.token;
      }
    }

    const fallbackToken = localStorage.getItem("token");
    return fallbackToken || "";
  } catch (error) {
    console.error("Error reading authentication token:", error);
    return "";
  }
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`
    );
  }

  return data;
}

export const taTravelService = {
  // Submit a TA claim
  submitClaim: (claimData) =>
    apiRequest("/ta/claim", {
      method: "POST",
      body: JSON.stringify(claimData),
    }),

  // Submit a TA advance application
  submitAdvance: (advanceData) =>
    apiRequest("/ta/advance", {
      method: "POST",
      body: JSON.stringify(advanceData),
    }),

  // Fetch claims using the existing backend /all route
  getClaims: () => apiRequest("/ta/all"),

  // Fetch one claim
  getClaimById: (claimId) =>
    apiRequest(`/ta/claim/${encodeURIComponent(claimId)}`),
};

export default taTravelService;
