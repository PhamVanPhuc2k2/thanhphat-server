/**
 * Escape các ký tự đặc biệt trong regex để chống NoSQL Injection qua $regex.
 * Sử dụng trước khi truyền user input vào MongoDB $regex query.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
