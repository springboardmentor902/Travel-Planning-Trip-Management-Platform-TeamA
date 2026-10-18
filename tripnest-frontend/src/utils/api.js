
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Trip APIs
export const tripAPI = {
  create: (data) => api.post("/api/trips", data),
  getAll: () => api.get("/api/trips"),
  getById: (id) => api.get(`/api/trips/${id}`),
  update: (id, data) => api.put(`/api/trips/${id}`, data),
  delete: (id) => api.delete(`/api/trips/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/api/trips/${id}/status?status=${status}`),
};

// Itinerary APIs
export const itineraryAPI = {
  create: (tripId, data) =>
    api.post(`/api/trips/${tripId}/itineraries`, data),

  generate: (tripId) =>
    api.post(`/api/trips/${tripId}/itineraries/generate`),

  getByTrip: (tripId) =>
    api.get(`/api/trips/${tripId}/itineraries`),

  getById: (id) =>
    api.get(`/api/itineraries/${id}`),

  update: (id, data) =>
    api.put(`/api/itineraries/${id}`, data),

  delete: (id) =>
    api.delete(`/api/itineraries/${id}`),
};

// Activity APIs
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

// Destination APIs
export const destinationAPI = {
  getAll: () => api.get("/api/destinations"),
  getById: (id) => api.get(`/api/destinations/${id}`),
  getPopular: () => api.get("/api/destinations/popular"),
  search: (query) =>
    api.get(`/api/destinations/search?query=${encodeURIComponent(query)}`),
};

// Budget APIs
export const budgetAPI = {
  get: (tripId) => api.get(`/api/trips/${tripId}/budget`),
  create: (tripId, data) =>
    api.post(`/api/trips/${tripId}/budget`, data),
  update: (tripId, data) =>
    api.put(`/api/trips/${tripId}/budget`, data),
  summary: (tripId) =>
    api.get(`/api/trips/${tripId}/budget/summary`),
  delete: (tripId) =>
    api.delete(`/api/trips/${tripId}/budget`),
};

// Expense APIs
export const expenseAPI = {
  getAll: (tripId) =>
    api.get(`/api/trips/${tripId}/expenses`),

  getSummary: (tripId) =>
    api.get(`/api/trips/${tripId}/expenses/summary`),

  getByCategory: (tripId, category) =>
    api.get(`/api/trips/${tripId}/expenses/category`, {
      params: { cat: category },
    }),

  getSettlement: (tripId) =>
    api.get(`/api/trips/${tripId}/settlement`),

  create: (tripId, data) =>
    api.post(`/api/trips/${tripId}/expenses`, data),

  update: (id, data) =>
    api.put(`/api/expenses/${id}`, data),

  delete: (id) =>
    api.delete(`/api/expenses/${id}`),
};

// Group APIs
export const groupAPI = {
  getAll: () => api.get("/api/groups"),

  getByTrip: (tripId) =>
    api.get(`/api/groups/trip/${tripId}`),

  getById: (id) =>
    api.get(`/api/groups/${id}`),

  create: (data) =>
    api.post("/api/groups", data),

  invite: (id, email) =>
    api.post(`/api/groups/${id}/invite`, { email }),

  accept: (id) =>
    api.patch(`/api/groups/${id}/accept`),

  decline: (id) =>
    api.patch(`/api/groups/${id}/decline`),

  removeMember: (groupId, memberId) =>
    api.delete(`/api/groups/${groupId}/members/${memberId}`),

  delete: (id) =>
    api.delete(`/api/groups/${id}`),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get("/api/notifications"),

  getUnread: () =>
    api.get("/api/notifications/unread"),

  getCount: () =>
    api.get("/api/notifications/count"),

  markRead: (id) =>
    api.patch(`/api/notifications/${id}/read`),

  markAllRead: () =>
    api.patch("/api/notifications/read-all"),

  delete: (id) =>
    api.delete(`/api/notifications/${id}`),
};


export const itineraryFileAPI = {
  // Get all documents attached to an itinerary day
  getByItinerary: (itineraryId) =>
    api.get(`/api/itinerary-files/itinerary/${itineraryId}`),

  // Upload a document to an itinerary day
  upload: (itineraryId, formData) =>
    api.post(
      `/api/itinerary-files/upload/${itineraryId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    ),

  // Get one document
  getById: (id) =>
    api.get(`/api/itinerary-files/${id}`),

  // Open/download a document
  download: (id) =>
    api.get(`/api/itinerary-files/download/${id}`, {
      responseType: "blob",
    }),

  // Delete a document
  delete: (id) =>
    api.delete(`/api/itinerary-files/${id}`),
};


export default api;
