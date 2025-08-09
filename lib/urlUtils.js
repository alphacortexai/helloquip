export function cleanFirebaseUrl(url) {
  if (!url || typeof url !== "string") return "";

  try {
    // Decode twice to handle double-encoded paths
    let cleaned = decodeURIComponent(decodeURIComponent(url));
    const [baseUrl, queryStr = ""] = cleaned.split("?");

    // Expecting /v0/b/{bucket}/o/{objectPath}
    const bucket = baseUrl.split("/b/")[1]?.split("/")[0];
    const objectPath = baseUrl.split("/o/")[1];
    if (!bucket || !objectPath) return url; // fallback

    const reEncodedPath = encodeURIComponent(objectPath);
    const qs = queryStr ? `?${queryStr}` : "";
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${reEncodedPath}${qs}`;
  } catch (err) {
    return url;
  }
}


