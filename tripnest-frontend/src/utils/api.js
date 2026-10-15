import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Trip APIs ──
export const tripAPI = {
  create: (data) => api.post("/api/trips", data),
  getAll: () => api.get("/api/trips"),
  getById: (id) => api.get(`/api/trips/${id}`),
  update: (id, data) => api.put(`/api/trips/${id}`, data),
  delete: (id) => api.delete(`/api/trips/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/api/trips/${id}/status?status=${status}`),
};

// ── Itinerary APIs ──
export const itineraryAPI = {
  generate: (tripId) =>
    api.post(`/api/trips/${tripId}/itineraries/generate`),
  getByTrip: (tripId) =>
    api.get(`/api/trips/${tripId}/itineraries`),
  update: (id, data) =>
    api.put(`/api/itineraries/${id}`, data),
  delete: (id) =>
    api.delete(`/api/itineraries/${id}`),
};

// ── Activity APIs ──
export const activityAPI = {
  create: (itineraryId, data) =>
    api.post(`/api/itineraries/${itineraryId}/activities`, data),
  getByItinerary: (itineraryId) =>
    api.get(`/api/itineraries/${itineraryId}/activities`),
  update: (id, data) =>
    api.put(`/api/activities/${id}`, data),
  delete: (id) =>
    api.delete(`/api/activities/${id}`),
};

// ── Destination APIs ──
export const destinationAPI = {
  getAll: () => api.get("/api/destinations"),
  getById: (id) => api.get(`/api/destinations/${id}`),
  getPopular: () => api.get("/api/destinations/popular"),
  search: (query) =>
    api.get(`/api/destinations/search?query=${query}`),
};

// ── Budget APIs ── ✅ NEW
export const budgetAPI = {
  create: (tripId, data) =>
    api.post(`/api/trips/${tripId}/budget`, data),
  get: (tripId) =>
    api.get(`/api/trips/${tripId}/budget`),
  update: (tripId, data) =>
    api.put(`/api/trips/${tripId}/budget`, data),
  summary: (tripId) =>
    api.get(`/api/trips/${tripId}/budget/summary`),
  delete: (tripId) =>
    api.delete(`/api/trips/${tripId}/budget`),
};

// ── Expense APIs ── ✅ NEW
export const expenseAPI = {
  add: (tripId, data) =>
    api.post(`/api/trips/${tripId}/expenses`, data),
  getAll: (tripId) =>
    api.get(`/api/trips/${tripId}/expenses`),
  summary: (tripId) =>
    api.get(`/api/trips/${tripId}/expenses/summary`),
  getByCategory: (tripId, cat) =>
    api.get(`/api/trips/${tripId}/expenses/category?cat=${cat}`),
  update: (id, data) =>
    api.put(`/api/expenses/${id}`, data),
  delete: (id) =>
    api.delete(`/api/expenses/${id}`),
};

// ── Group APIs ── ✅ NEW
export const groupAPI = {
  create: (data) => api.post("/api/groups", data),
  getAll: () => api.get("/api/groups"),
  getById: (id) => api.get(`/api/groups/${id}`),
  getByTrip: (tripId) =>
    api.get(`/api/groups/trip/${tripId}`),
  invite: (id, email) =>
    api.post(`/api/groups/${id}/invite`, { email }),
  accept: (id) =>
    api.patch(`/api/groups/${id}/accept`),
  decline: (id) =>
    api.patch(`/api/groups/${id}/decline`),
  removeMember: (groupId, memberId) =>
    api.delete(`/api/groups/${groupId}/members/${memberId}`),
  delete: (id) => api.delete(`/api/groups/${id}`),
};

// ── Notification APIs ── ✅ NEW
export const notificationAPI = {
  getAll: () => api.get("/api/notifications"),
  getUnread: () => api.get("/api/notifications/unread"),
  getUnreadCount: () =>
    api.get("/api/notifications/unread/count"),
  markAsRead: (id) =>
    api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () =>
    api.patch("/api/notifications/read-all"),
  delete: (id) =>
    api.delete(`/api/notifications/${id}`),
};


// ── Document APIs ──
export const documentAPI = {
    upload: (tripId, formData) =>
        api.post(`/api/trips/${tripId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    getAll:    (tripId) =>
        api.get(`/api/trips/${tripId}/documents`),
    getPhotos: (tripId) =>
        api.get(`/api/trips/${tripId}/documents/photos`),
    getByType: (tripId, type) =>
        api.get(`/api/trips/${tripId}/documents/type?type=${type}`),
    getById:   (id) =>
        api.get(`/api/documents/${id}`),
    delete:    (id) =>
        api.delete(`/api/documents/${id}`),
};

// ── Analytics APIs ──
export const analyticsAPI = {
    getOverview:    () =>
        api.get('/api/analytics/overview'),
    getExpenseReport: (tripId) =>
        api.get(`/api/analytics/trips/${tripId}/report`),
    getAdminAnalytics: () =>
        api.get('/api/analytics/admin'),
};
// ── Trip Member APIs ──
export const tripMemberAPI = {
    invite:      (tripId, email) =>
        api.post(`/api/trips/${tripId}/invite`,
            { email }),
    getMembers:  (tripId) =>
        api.get(`/api/trips/${tripId}/members`),
    accept:      (tripId) =>
        api.patch(`/api/trips/${tripId}/accept`),
    decline:     (tripId) =>
        api.patch(`/api/trips/${tripId}/decline`),
    remove:      (tripId, memberId) =>
        api.delete(
            `/api/trips/${tripId}/members/${memberId}`),
    getPending:  () =>
        api.get('/api/trips/invitations/pending'),
};
// ── Dashboard APIs ──
export const dashboardAPI = {
    getTravelerDashboard: () =>
        api.get('/api/dashboard'),
    getAdminDashboard: () =>
        api.get('/api/admin/dashboard'),
    getTripReport: (tripId) =>
        api.get(`/api/reports/trips/${tripId}`),
};


export default api;