import api from "@/lib/axios";
import type { AppUser } from "@/components/feature/users/types/user.type";

/* ── Mapper: snake_case API → camelCase frontend ── */
const mapUser = (u: any): AppUser => ({
  id: u.id,
  username: u.username,
  fullName: u.full_name || u.fullName,
  email: u.email,
  role: u.role,
  password: "",
  isActive: u.is_active ?? u.isActive ?? true,
  createdAt: u.created_at || u.createdAt || "",
  lastLogin: u.last_login || u.lastLogin || null,
});

export const userService = {
  /** Fetch all users — returns frontend-ready AppUser[] */
  fetchUsers: async (): Promise<AppUser[]> => {
    const res = await api.get("/users");
    return (res.data.data || []).map(mapUser);
  },

  /** Register a new user */
  register: (data: {
    username: string;
    fullName: string;
    email: string;
    password: string;
    role: string;
    divisionId?: string;
  }) => api.post("/users/register", data),

  /* Raw axios calls (kept for flexibility) */
  getAll: () => api.get("/users"),
};
