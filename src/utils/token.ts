export function getValidToken(): string | null {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("token_expiry");

  if (!token || !expiry) {
    return null;
  }

  const now = new Date().getTime();
  if (now > Number(expiry)) {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    return null;
  }

  return token;
}