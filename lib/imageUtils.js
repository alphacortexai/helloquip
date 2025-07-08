// // lib/generateResizedUrls.js

// export const generateResizedUrls = (originalUrl) => {
//   if (!originalUrl) return null;

//   const urlWithoutToken = originalUrl.split('?')[0];
//   const token = originalUrl.includes('?') ? originalUrl.split('?')[1] : '';

//   const lastSlash = urlWithoutToken.lastIndexOf('/');
//   const basePath = urlWithoutToken.substring(0, lastSlash + 1); // .../products/
//   const filename = urlWithoutToken.substring(lastSlash + 1); // pdt1.jpg

//   const dotIndex = filename.lastIndexOf('.');
//   const nameWithoutExt = filename.substring(0, dotIndex); // pdt1

//   const sizes = ['200x200', '680x680', '800x800'];
//   const resizedUrls = {};

//   sizes.forEach(size => {
//     resizedUrls[size] = `${basePath}${encodeURIComponent(nameWithoutExt)}_${size}.webp${token ? '?' + token : ''}`;
//   });

//   resizedUrls.original = originalUrl;
//   return resizedUrls;
// };



const generateResizedUrls = (originalUrl) => {
  if (!originalUrl) return null;
  
  const urlWithoutToken = originalUrl.split('?')[0];
  const token = originalUrl.includes('?') ? originalUrl.split('?')[1] : '';
  
  const lastSlash = urlWithoutToken.lastIndexOf('/');
  const basePath = decodeURIComponent(urlWithoutToken.substring(0, lastSlash + 1)); // use this variable name
  
  const filename = urlWithoutToken.substring(lastSlash + 1);
  
  const dotIndex = filename.lastIndexOf('.');
  const nameWithoutExt = filename.substring(0, dotIndex);
  
  const sizes = ['200x200', '680x680', '800x800'];
  const resizedUrls = {};
  
  sizes.forEach(size => {
    resizedUrls[size] = `${basePath}${encodeURIComponent(nameWithoutExt)}_${size}.webp${token ? '?' + token : ''}`;
  });
  
  resizedUrls.original = originalUrl;
  return resizedUrls;
};
