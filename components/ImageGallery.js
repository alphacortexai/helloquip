// // // components/ImageGallery.js
// // import Image from "next/image";

// // export default function ImageGallery({ images, activeImage, onSelect }) {
// //   return (
// //     <>
// //       <div className="rounded-xl w-full h-55 md:h-[120px] flex items-center justify-center overflow-hidden">
// //         {activeImage ? (
// //           <Image
// //             src={activeImage}
// //             alt="Main preview"
// //             width={400}
// //             height={300}
// //             className="object-contain rounded-xl"
// //             priority
// //           />
// //         ) : (
// //           <div className="w-full h-full bg-gray-200" />
// //         )}
// //       </div>

// //       <div className="flex gap-2 overflow-x-auto">
// //         {Array.from({ length: 5 }).map((_, index) => {
// //           const thumb = images[index];
// //           return thumb ? (
// //             <div
// //               key={index}
// //               className={`w-10 h-10 relative rounded-lg overflow-hidden border-1 cursor-pointer ${
// //                 activeImage === thumb
// //                   ? "border-blue-500"
// //                   : "border-gray-200"
// //               }`}
// //               onClick={() => onSelect(thumb)}
// //             >
// //               <Image
// //                 src={thumb}
// //                 alt={`thumbnail-${index}`}
// //                 fill
// //                 className="object-cover"
// //               />
// //             </div>
// //           ) : (
// //             <div
// //               key={index}
// //               className="w-10 h-10 bg-gray-200 rounded-lg border border-gray-300"
// //             />
// //           );
// //         })}
// //       </div>
// //     </>
// //   );
// // }




// // components/ImageGallery.js
// import { useState } from "react";
// import Image from "next/image";

// export default function ImageGallery({ images, activeImage, onSelect }) {
//   const [showFullView, setShowFullView] = useState(false);

//   const handleImageClick = () => {
//     if (activeImage) setShowFullView(true);
//   };

//   return (
//     <>
//       {/* Fullscreen Modal */}
//       {showFullView && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
//           onClick={() => setShowFullView(false)}
//         >
//           <div className="relative w-full max-w-4xl max-h-[90vh]">
//             <Image
//               src={activeImage}
//               alt="Full preview"
//               layout="responsive"
//               width={800}
//               height={600}
//               className="object-contain rounded-lg"
//             />
//             <button
//               onClick={() => setShowFullView(false)}
//               className="absolute top-2 right-2 text-white bg-black/50 px-2 py-1 rounded"
//             >
//               ✕
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Main Preview */}
//       <div
//         className="rounded-xl w-full h-55 md:h-[120px] flex items-center justify-center px-4 overflow-hidden cursor-pointer"
//         onClick={handleImageClick}
//       >
//         {activeImage ? (
//           <Image
//             src={activeImage}
//             alt="Main preview"
//             width={400}
//             height={300}
//             className="object-contain rounded-xl"
//             priority
//           />
//         ) : (
//           <div className="w-full h-full bg-gray-200" />
//         )}
//       </div>

//       {/* Thumbnails */}
//       <div className="flex gap-2 overflow-x-auto mt-2 px-4">
//         {Array.from({ length: 5 }).map((_, index) => {
//           const thumb = images[index];
//           return thumb ? (
//             <div
//               key={index}
//               className={`w-10 h-10 relative rounded-lg overflow-hidden border cursor-pointer ${
//                 activeImage === thumb
//                   ? "border-blue-500"
//                   : "border-gray-200"
//               }`}
//               onClick={() => onSelect(thumb)}
//             >
//               <Image
//                 src={thumb}
//                 alt={`thumbnail-${index}`}
//                 fill
//                 className="object-cover"
//               />
//             </div>
//           ) : (
//             <div
//               key={index}
//               className="w-10 h-10 bg-gray-200 rounded-lg border border-gray-300"
//             />
//           );
//         })}
//       </div>
//     </>
//   );
// }




import { useState, useRef, useEffect } from "react";
import Image from "next/image";


const getPreferredImageUrl = (imageUrl, size = "680x680") => {
  if (!imageUrl) return null;

  // If it's a string, decode and return
  if (typeof imageUrl === "string") {
    try {
      return decodeURIComponent(imageUrl);
    } catch {
      return imageUrl;
    }
  }

  // If it's an object with multiple sizes
  if (typeof imageUrl === "object") {
    const preferred =
      imageUrl[size] || imageUrl["original"] || Object.values(imageUrl)[0];
    try {
      return decodeURIComponent(preferred);
    } catch {
      return preferred;
    }
  }

  return null;
};




export default function ImageGallery({ images, activeImage, onSelect }) {
  const [showFullView, setShowFullView] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const imageContainerRef = useRef(null);
  const hasSwiped = useRef(false);

  // Get current image index
  const currentIndex = images.findIndex(img => img === activeImage);
  
  // Handle swipe gestures on mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    hasSwiped.current = false;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum distance for a swipe

    if (Math.abs(distance) > minSwipeDistance) {
      hasSwiped.current = true;
      if (distance > 0) {
        // Swiped left - next image
        const nextIndex = (currentIndex + 1) % images.length;
        onSelect(images[nextIndex]);
      } else {
        // Swiped right - previous image
        const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        onSelect(images[prevIndex]);
      }
    }

    // Reset after a short delay to allow click event to check hasSwiped
    setTimeout(() => {
      touchStartX.current = 0;
      touchEndX.current = 0;
      hasSwiped.current = false;
    }, 100);
  };

  const handleImageClick = (e) => {
    // Prevent opening fullscreen if user just swiped
    if (hasSwiped.current) {
      e.preventDefault();
      return;
    }
    if (activeImage) setShowFullView(true);
  };

  return (
    <>
      {/* Fullscreen Modal */}
      {showFullView && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowFullView(false)}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh]">
            <Image
              src={getPreferredImageUrl(activeImage)}
              alt="Full preview"
              layout="responsive"
              width={800}
              height={600}
              className="object-contain rounded-lg"
            />
            <button
              onClick={() => setShowFullView(false)}
              className="absolute top-2 right-2 text-white bg-black/50 px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    {/* 📦 Gallery Wrapper with white bg and light shadow */}
    <div className="bg-white shadow-sm py-2">
    {/* Main Preview */}
    <div
    ref={imageContainerRef}
    className="w-full relative cursor-pointer select-none"
    style={{ paddingBottom: '100%' }} // Changed from 75% to 100% for taller images
    onClick={handleImageClick}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
    {activeImage ? (
        <Image
        src={getPreferredImageUrl(activeImage)}
        alt="Main preview"
        fill
        className="object-cover"
        priority
        />
    ) : (
        <div className="w-full h-full bg-gray-200 rounded-md" />
    )}
    </div>


    {/* Image Indicators (Mobile) - Dots */}
    {images.length > 1 && (
      <div className="flex justify-center gap-2 mt-2 md:hidden">
        {images.map((img, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              activeImage === img ? "w-6 bg-blue-500" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    )}

    {/* Thumbnails - Only show actual images, no blank placeholders */}
    {images.length > 0 && (
      <div className="flex gap-2 overflow-x-auto mt-2 px-4">
        {images.map((thumb, index) => {
          const thumbUrl = getPreferredImageUrl(thumb, "200x200");
          if (!thumbUrl) return null;
          
          return (
            <div
              key={index}
              className={`w-10 h-10 relative rounded-lg overflow-hidden border cursor-pointer flex-shrink-0 ${
                activeImage === thumb
                  ? "border-blue-500"
                  : "border-gray-200"
              }`}
              onClick={() => onSelect(thumb)}
            >
              <Image
                src={thumbUrl}
                alt={`thumbnail-${index}`}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          );
        })}
      </div>
    )}
    </div>

    </>
  );
}
