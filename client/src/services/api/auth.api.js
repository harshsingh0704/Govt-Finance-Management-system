// client/src/services/api/auth.api.js

const API_BASE = 'http://localhost:5000/api/auth';

export async function loginUser({ email, password, role }) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email.trim(),
      password,
      role,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Invalid email or password.');
  }

  // Token persist karo agar server return karta hai
  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return {
    user: data.user || data.data || data,
    token: data.token,
  };
}

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Registration failed.');
  }

  return data;
}