import api from "./api";

// new item request
export const createRequest = (data) => api.post("/requests", data);

// view requests (no auth)
export const getOpenRequests = () => api.get("/requests/open");

// Claim (accept) a request
export const acceptRequest = (id) => api.patch(`/requests/${id}/accept`);

// Fetch active requests for current user
export const getActiveRequests = () => api.get("/requests/active");

// Complete a request
export const completeRequest = (id) => api.patch(`/requests/${id}/complete`);

// View request history — my orders
export const getMyOrders = () => api.get("/requests/history/my-orders");

// View request history — my deliveries
export const getMyDeliveries = () => api.get("/requests/history/my-deliveries");
