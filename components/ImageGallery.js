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




import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, activeImage, onSelect }) {
  const [showFullView, setShowFullView] = useState(false);

  const handleImageClick = () => {
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
              src={activeImage}
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
    className="w-full relative cursor-pointer"
    style={{ paddingBottom: '75%' }} // 3/4 = 75% padding-bottom for aspect ratio
    onClick={handleImageClick}
    >
    {activeImage ? (
        <Image
        src={activeImage}
        alt="Main preview"
        fill
        className="object-cover"
        priority
        />
    ) : (
        <div className="w-full h-full bg-gray-200 rounded-md" />
    )}
    </div>


    {/* Thumbnails */}
    <div className="flex gap-2 overflow-x-auto mt-2 px-4">
        {Array.from({ length: 5 }).map((_, index) => {
        const thumb = images[index];
        return thumb ? (
            <div
            key={index}
            className={`w-10 h-10 relative rounded-lg overflow-hidden border cursor-pointer ${
                activeImage === thumb
                ? "border-blue-500"
                : "border-gray-200"
            }`}
            onClick={() => onSelect(thumb)}
            >
            <Image
                src={thumb}
                alt={`thumbnail-${index}`}
                fill
                className="object-cover"
            />
            </div>
        ) : (
            <div
            key={index}
            className="w-10 h-10 bg-gray-200 rounded-lg border border-gray-300"
            />
        );
        })}
    </div>
    </div>

    </>
  );
}
