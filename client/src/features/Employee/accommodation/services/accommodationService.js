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

    return localStorage.getItem("token") || "";
  } catch (error) {
    console.error("Unable to read FMS authentication token:", error);
    return "";
  }
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
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

export const accommodationService = {
  getMine() {
    return apiRequest("/accommodation/mine");
  },

  submit(payload) {
    return apiRequest("/accommodation", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export default accommodationService;
