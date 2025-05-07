import { User } from "@/api/entities";

export async function checkAuth() {
  try {
    const user = await User.me();
    return { isAuthenticated: true, user };
  } catch (error) {
    return { isAuthenticated: false, user: null };
  }
}

export async function requireAuth() {
  const { isAuthenticated, user } = await checkAuth();
  if (!isAuthenticated) {
    // Redirect to login
    await User.login();
    return false;
  }
  return user;
}

// THIS is base44 default authentication and is not currently used.