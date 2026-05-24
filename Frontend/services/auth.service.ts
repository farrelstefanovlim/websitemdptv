import api from "@/lib/axios";

export const authService = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  refresh: () => api.post("/auth/refresh"),

  logout: () => api.post("/auth/logout"),
};
