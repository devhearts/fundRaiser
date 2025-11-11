// Define all API endpoints in one place. Adjust paths to match backend routes.
// Note: These are relative paths - axios instance handles the baseURL
// Prefer functions for dynamic segments.

export const endpoints = {
  // Auth
  auth: {
    login: () => `/auth/login`,
    signup: () => `/auth/register`, // Backend uses /register
    logout: () => `/auth/logout`,
    me: () => `/users/profile`, // Backend uses /users/profile
  },

  // Events
  events: {
    list: () => `/events`,
    create: () => `/events`,
    byId: (id: string) => `/events/${id}`,
    contribute: (id: string) => `/events/${id}/contributions`,
    createPledge: (id: string) => `/events/${id}/pledges`,
  },
} as const;

export type EndpointTree = typeof endpoints;
