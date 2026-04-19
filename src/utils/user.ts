export function getUserId(): number {
  return Number(localStorage.getItem("user_id") || 0);
}