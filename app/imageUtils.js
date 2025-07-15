// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// // Utility to generate all resized image URLs based on one uploaded original
// export async function uploadResizedImages(file) {
//   const storage = getStorage();
//   const timestamp = Date.now();
//   const fileExtension = file.name.split(".").pop();
//   const baseName = file.name.replace(`.${fileExtension}`, "");
//   const filePath = `products/${baseName}_${timestamp}.${fileExtension}`;
//   const storageRef = ref(storage, filePath);

//   // Upload the original file
//   await uploadBytes(storageRef, file);

//   const baseURL = storageRef.fullPath.replace(/\.[^/.]+$/, "");

//   // Create paths for resized versions assuming your Cloud Function uses suffixes
//   const sizes = ["90x90", "680x680", "200x200", "800x800"];
//   const resizedURLs = {};

//   for (let size of sizes) {
//     const resizedPath = `${baseURL}_${size}.${fileExtension}`;
//     const resizedRef = ref(storage, resizedPath);
//     resizedURLs[size] = await getDownloadURL(resizedRef);
//   }

//   return resizedURLs; // { "90x90": url, "200x200": url, "800x800": url }
// }


// ✅ TOP-LEVEL, NO CONDITIONS OR LOOPS AROUND THIS
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadResizedImages(file) {
  const storage = getStorage();
  const timestamp = Date.now();
  const fileExtension = file.name.split(".").pop();
  const baseName = file.name.replace(`.${fileExtension}`, "");
  const filePath = `products/${baseName}_${timestamp}.${fileExtension}`;
  const storageRef = ref(storage, filePath);

  // Upload the original file
  await uploadBytes(storageRef, file);

  const baseURL = storageRef.fullPath.replace(/\.[^/.]+$/, "");

  const sizes = ["90x90", "680x680", "200x200", "800x800"];
  const resizedURLs = {};

  for (let size of sizes) {
    const resizedPath = `${baseURL}_${size}.${fileExtension}`;
    const resizedRef = ref(storage, resizedPath);
    resizedURLs[size] = await getDownloadURL(resizedRef);
  }

  return resizedURLs;
}
