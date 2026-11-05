import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Extracts raw JWT token and employee/user ID from localStorage.
 * Checks for token expiration before issuing API requests.
 */
const getAuthSession = () => {
  let token = '';
  let employeeId = '';

  const rawAuth = localStorage.getItem('fms_auth');
  if (rawAuth) {
    try {
      const parsed = JSON.parse(rawAuth);
      token = parsed.token || parsed.accessToken || '';
      const user = parsed.user || {};
      employeeId = user.employeeId || user.employee?._id || user._id || user.id || '';
    } catch {
      token = rawAuth;
    }
  }

  if (!token) {
    token = localStorage.getItem('token') || '';
  }

  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          console.warn('Session token has expired. Redirecting to login.');
          localStorage.removeItem('fms_auth');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return { token: '', employeeId: '' };
        }
      }
    } catch {
      // Allow raw token if decoding fails
    }
  }

  return { token, employeeId };
};

const getHeaders = (token) => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches and aggregates claims across TA, LTC, Medical, and Accommodation.
 */
export const fetchAllEmployeeClaims = async () => {
  const { token, employeeId } = getAuthSession();
  if (!token) return [];

  const config = getHeaders(token);

  const requests = [
    // 1. TA Claims
    axios.get(`${API_BASE_URL}/ta/claims/me`, config).catch(() =>
      employeeId ? axios.get(`${API_BASE_URL}/ta/claims/${employeeId}`, config) : Promise.reject('No TA endpoint')
    ),

    // 2. LTC Claims
    employeeId
      ? axios.get(`${API_BASE_URL}/ltc/claims/${employeeId}`, config)
      : axios.get(`${API_BASE_URL}/claims/ltc`, config).catch(() => axios.get(`${API_BASE_URL}/ltc/all`, config)),

    // 3. Medical Claims (Claims + Advances)
    axios.get(`${API_BASE_URL}/medical/claims/mine`, config),
    axios.get(`${API_BASE_URL}/medical/advances/mine`, config),

    // 4. Accommodation Requests
    axios.get(`${API_BASE_URL}/accommodation/mine`, config),
  ];

  const results = await Promise.allSettled(requests);

  const normalizeList = (result, type) => {
    if (result.status !== 'fulfilled') return [];
    const resData = result.value?.data;
    const items = resData?.claims || resData?.data || (Array.isArray(resData) ? resData : []);
    const list = Array.isArray(items) ? items : [];

    return list.map((item) => ({
      ...item,
      claimType: type,
      id: item._id || item.id,
      applicationId:
        item.applicationId ||
        item.claimNumber ||
        item.referenceNo ||
        (item._id ? item._id.slice(-8).toUpperCase() : 'N/A'),
      createdAt: item.createdAt || item.date || item.appliedDate || item.submissionDate || new Date().toISOString(),
      amount: Number(
        item.netAmount ??
        item.totalAmount ??
        item.claimedAmount ??
        item.totalCost ??
        item.advanceAmount ??
        0
      ),
      status: (item.status || 'submitted').toLowerCase(),
    }));
  };

  const combined = [
    ...normalizeList(results[0], 'TA'),
    ...normalizeList(results[1], 'LTC'),
    ...normalizeList(results[2], 'Medical'),
    ...normalizeList(results[3], 'Medical Advance'),
    ...normalizeList(results[4], 'Accommodation'),
  ];

  return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
