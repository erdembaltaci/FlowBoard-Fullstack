const API_URL = import.meta.env.VITE_API_URL || "";

// sadece domaini al (/api'yi sil)
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function fileUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
}
