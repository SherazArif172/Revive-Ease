import adminHandler from "./adminMock";
import coachHandler from "./coachMock";
import providerHandler from "./providerMock";

// TEMP: serve dummy data instead of calling the real backend. Set to false to restore real API calls.
export const MOCK_ENABLED = true;

// Switch the dashboard role with ?role=admin|sub%20admin|coach|provider|clinic%20admin (persisted in localStorage).
export const getMockRole = () => {
  try {
    const q = new URLSearchParams(window.location.search).get("role");
    if (q) localStorage.setItem("mockRole", q);
    return localStorage.getItem("mockRole") || "admin";
  } catch (e) {
    return "admin";
  }
};

export const mockUser = () => ({
  email: "demo@reviveease.com",
  userType: getMockRole(),
  token: "mock-token",
  id: "mock-user-1",
  user_id: "mock-user-1",
  fcmToken: null,
  userData: {
    _id: "mock-user-1",
    id: "mock-user-1",
    first_name: "Demo",
    last_name: "User",
    name: "Demo User",
    email: "demo@reviveease.com",
    userType: getMockRole(),
    profile_image: "",
  },
});

// Provider and coach handlers only answer for their own context, so they go before the catch-all admin one.
const handlers = [providerHandler, coachHandler, adminHandler];
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockBaseQuery = async (args) => {
  const req = typeof args === "string" ? { url: args, method: "GET" } : { method: "GET", ...args };
  req.method = String(req.method).toUpperCase();
  const [path, qs = ""] = String(req.url).split("?");
  req.path = "/" + path.replace(/^\/+/, "");
  req.params = new URLSearchParams(qs);
  await delay(120);
  for (const h of handlers) {
    const data = h(req);
    if (data !== undefined) return { data };
  }
  if (req.method !== "GET") return { data: { success: true, status: true, message: "Done (mock)" } };
  console.warn("[mock] no handler for", req.method, req.url);
  return { data: { success: true, status: true, data: [], message: "mock" } };
};
