// import React, { useState } from 'react';

// const ProductCard = ({ product, variant = 'default', isFirst = false }) => {
//   const [imageLoaded, setImageLoaded] = useState(false);

//   const commonClasses = 'bg-white shadow-sm hover:shadow-md rounded-2xl transition duration-200';
//   const softShadow = 'shadow-[0_4px_12px_rgba(0,0,0,0.05)]';
//   const productCodeText = product.sku || 'N/A';

//   const discount = product.discount || 0;
//   const originalPrice = Number(product.price || 0);
//   const discountedPrice = discount > 0
//     ? Math.round(originalPrice - (originalPrice * discount) / 100)
//     : originalPrice;

//   const imageProps = {
//     src: product.image || 'https://via.placeholder.com/220',
//     alt: product.name || 'Product',
//     loading: 'lazy',
//     className: 'w-full h-full object-cover rounded-xl',
//     onLoad: () => setImageLoaded(true),
//   };

//   const wrapperStyle = imageLoaded ? 'opacity-100' : 'opacity-0';

//   const renderDefault = () => (
//     <div className={`${commonClasses} ${softShadow} p-4 transition-opacity duration-300 ${wrapperStyle}`}>
//       <img {...imageProps} className="w-full h-48 object-cover rounded-xl mb-3" />
//       <h2 className="text-lg font-semibold">{product.name}</h2>
//       <p className="text-sm text-gray-400 italic mb-1">CODE: {productCodeText}</p>
//       <p className="text-gray-600 mt-1">{product.description}</p>
//       <p className="text-blue-600 font-bold mt-2">UGX {discountedPrice.toLocaleString()}</p>
//     </div>
//   );

//   const renderLandscape = () => (
//     <div className={`${commonClasses} ${softShadow} p-4 flex gap-4 items-center transition-opacity duration-300 ${wrapperStyle}`}>
//       <img {...imageProps} className="w-32 h-32 object-cover rounded-xl flex-shrink-0" />
//       <div>
//         <h2 className="text-lg font-semibold">{product.name}</h2>
//         <p className="text-sm text-gray-400 italic mb-1">CODE: {productCodeText}</p>
//         <p className="text-gray-600 mt-1 line-clamp-2">{product.description}</p>
//         <p className="text-blue-600 font-bold mt-2">UGX {discountedPrice.toLocaleString()}</p>
//       </div>
//     </div>
//   );

//   const renderLandscapeMain = () => (
//     <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition flex w-full max-w-2xl mx-auto mb-3 transition-opacity duration-300 ${wrapperStyle}`}>
//       <div className="w-32 sm:w-40 h-32 sm:h-40 bg-gray-50 flex-shrink-0">
//         <img {...imageProps} className="w-full h-full object-cover rounded-l-2xl" />
//       </div>
//       <div className="flex flex-col justify-between p-4 w-full">
//         <div>
//           <h3 className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2">{product.name || 'Unnamed Product'}</h3>
//           <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description || 'No description available'}</p>
//         </div>
//         <div className="flex items-end justify-between mt-3">
//           <div>
//             <p className="text-sm text-gray-900 font-semibold">
//               UGX {discountedPrice.toLocaleString()}
//             </p>
//             <p className="text-[11px] text-gray-500">1 item (MOQ)</p>
//           </div>
//           <p className="text-[7px] text-gray-400 italic">
//             CODE: {product.sku}
//           </p>
//         </div>
//       </div>
//     </div>
//   );

//   const renderLandscapeMain02 = () => (
//     <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition flex w-full max-w-2xl mx-auto mb-4 transition-opacity duration-300 ${wrapperStyle}`}>
//       <div className="w-40 sm:w-44 h-48 sm:h-52 bg-gray-50 flex-shrink-0">
//         <img {...imageProps} className="w-full h-full object-cover rounded-l-2xl" />
//       </div>

//       <div className="flex flex-col justify-between p-5 w-full">
//         <div>
//           <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2">
//             {product.name || 'Unnamed Product'}
//           </h3>
//           <p className="text-sm text-gray-500 mt-1 line-clamp-2">
//             {product.description || 'No description available'}
//           </p>
//         </div>

//         <div className="flex items-end justify-between mt-3">
//           <div>
//             <p className="text-sm text-gray-900 font-semibold">
//               UGX {discountedPrice.toLocaleString()}
//             </p>
//             <p className="text-xs text-gray-500">1 item (MOQ)</p>
//           </div>
//           <p className="text-xs text-gray-400 italic">
//             CODE: {product.sku}
//           </p>
//         </div>
//       </div>
//     </div>
//   );

//   const renderPortrait = () => (
//     <div className={`${commonClasses} ${softShadow} p-4 w-48 transition-opacity duration-300 ${wrapperStyle}`}>
//       <img {...imageProps} className="w-full h-56 object-cover rounded-xl mb-3" />
//       <h2 className="text-base font-semibold">{product.name}</h2>
//       <p className="text-[7px] text-gray-400 italic mb-1">CODE: {productCodeText}</p>
//       <p className="text-gray-500 text-sm mt-1 line-clamp-3">{product.description}</p>
//       <p className="text-blue-600 font-bold mt-2 text-sm">UGX {discountedPrice.toLocaleString()}</p>
//     </div>
//   );

//   const renderCompact = () => (
//     <div className={`bg-white border border-gray-200 rounded-2xl p-1 w-full max-w-xs mx-auto hover:shadow-md transition mb-1 break-inside-avoid transition-opacity duration-300 ${wrapperStyle}`}>
//       <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '3 / 4' }}>
//         {!imageLoaded && (
//           <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
//         )}

//         <img
//           src={product.image}
//           alt={product.name || "Product"}
//           loading={isFirst ? "eager" : "lazy"} // ✅ Only eager load first image
//           onLoad={() => setImageLoaded(true)}
//           className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-xl ${
//             imageLoaded ? "opacity-100" : "opacity-0"
//           }`}
//         />
//       </div>

//       <div className="px-4 pb-4 pt-2">
//       <p
//         className="text-sm font-medium text-gray-800 mb-2 overflow-hidden"
//         style={{
//           display: '-webkit-box',
//           WebkitLineClamp: 2,
//           WebkitBoxOrient: 'vertical',
//           minHeight: '2.5rem', // roughly 2 lines of text height at text-sm
//           lineHeight: '1.25rem', // Tailwind's default line height for text-sm
//         }}
//       >
//         {product.name || 'Unnamed Product'}
//       </p>

//         <p className="text-sm text-gray-900 font-semibold">
//           UGX {discountedPrice.toLocaleString()}
//         </p>
//         <p className="text-xs text-gray-500 mb-2">1 item (MOQ)</p>
//         <p className="text-[7px] text-gray-400 italic mt-1">
//           CODEX: {product.sku || 'N/A'}
//         </p>
//       </div>
//     </div>
//   );

//   const renderCompactX = () => (
//     <div className={`bg-white border border-gray-200 rounded-2xl p-1 w-full max-w-xs mx-auto hover:shadow-md transition mb-2 break-inside-avoid transition-opacity duration-300 ${wrapperStyle}`}>
//       <div className="w-full h-full sm:h-48 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
//         <img {...imageProps} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
//       </div>
//       <div className="px-4 pb-4 pt-2">
//         <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{product.name || 'Unnamed Product'}</p>
//         <p className="text-sm text-gray-900 font-semibold">UGX {discountedPrice.toLocaleString()}</p>
//         <p className="text-xs text-gray-500 mb-2">1 item (MOQ)</p>
//         <p className="text-[7px] text-gray-400 italic mt-1">CODEX: {product.sku || "N/A"}</p>
//       </div>
//     </div>
//   );

//   switch (variant) {
//     case 'landscape':
//       return renderLandscape();
//     case 'landscapemain':
//       return renderLandscapeMain();
//     case 'landscapemain02':
//       return renderLandscapeMain02();
//     case 'portrait':
//       return renderPortrait();
//     case 'compact':
//       return renderCompact();
//     case 'compactX':
//       return renderCompactX();
//     default:
//       return renderDefault();
//   }
// };

// export default ProductCard;



import React, { useState } from 'react';

const ProductCard = ({ badge, product, variant = 'default', isFirst = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

    const imageUrl = product.mainImage || product.extraImages?.[0] || "/fallback.jpg";



  const commonClasses = 'bg-white shadow-sm hover:shadow-md rounded-2xl transition duration-200';
  const softShadow = 'shadow-[0_4px_12px_rgba(0,0,0,0.05)]';
  const productCodeText = product.sku || 'N/A';

  const discount = product.discount || 0;
  const originalPrice = Number(product.price || 0);
  const discountedPrice = discount > 0
    ? Math.round(originalPrice - (originalPrice * discount) / 100)
    : originalPrice;

  // Centralized image props with LCP optimizations applied for the first image
  const imageProps = {
    src: product.image || 'https://firebasestorage.googleapis.com/v0/b/helloquip-80e20.firebasestorage.app/o/placeholder.jpg?alt=media&token=7b4e6ab8-7a01-468c-b5f7-a19d31290045',
    alt: product.name || 'Product',
    loading: isFirst ? 'eager' : 'lazy',         // eager for LCP image, lazy otherwise
    fetchPriority: isFirst ? 'high' : 'auto',    // high fetch priority for LCP
    onLoad: () => setImageLoaded(true),
    onError: () => setImageLoaded(true), // Avoid skeleton staying forever
  };




  

  const wrapperStyle = imageLoaded ? 'opacity-100' : 'opacity-0';

  const renderDefault = () => (
    <div className={`${commonClasses} ${softShadow} p-4 transition-opacity duration-300 ${wrapperStyle}`}>
      <img {...imageProps} className="w-full h-48 object-cover rounded-xl mb-3" />
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-sm text-gray-400 italic mb-1">CODE: {productCodeText}</p>
      <p className="text-gray-600 mt-1">{product.description}</p>
      <p className="text-blue-600 font-bold mt-2">UGX {discountedPrice.toLocaleString()}</p>
    </div>
  );

  const renderLandscape = () => (
    <div className={`${commonClasses} ${softShadow} p-4 flex gap-4 items-center transition-opacity duration-300 ${wrapperStyle}`}>
      <img {...imageProps} className="w-32 h-32 object-cover rounded-xl flex-shrink-0" />
      <div>
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-sm text-gray-400 italic mb-1">CODE: {productCodeText}</p>
        <p className="text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        <p className="text-blue-600 font-bold mt-2">UGX {discountedPrice.toLocaleString()}</p>
      </div>
    </div>
  );

  const renderLandscapeMain = () => (
    <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition flex w-full max-w-2xl mx-auto mb-3 transition-opacity duration-300 ${wrapperStyle}`}>
      <div className="w-32 sm:w-40 h-32 sm:h-40 bg-gray-50 flex-shrink-0">
        <img {...imageProps} className="w-full h-full object-cover rounded-l-2xl" />
      </div>
      <div className="flex flex-col justify-between p-4 w-full">
        <div>
          <h3 className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2">{product.name || 'Unnamed Product'}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description || 'No description available'}</p>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-sm text-gray-900 font-semibold">
              UGX {discountedPrice.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500">1 item (MOQ)</p>
          </div>
          <p className="text-[12px] text-gray-400 italic">
            CODE: {product.sku}
          </p>
        </div>
      </div>
    </div>
  );



  const renderLandscapeMain02 = () => (
    <div className={`relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition flex w-full max-w-2xl mx-auto transition-opacity duration-300 ${wrapperStyle}`}>
      
      {/* Badge */}
      {badge && (
        <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-full shadow-sm">
          {badge}
        </div>
      )}

      <div className="w-40 sm:w-44 h-48 sm:h-52 bg-gray-50 flex-shrink-0">
        <img {...imageProps} className="w-full h-full object-cover rounded-l-2xl" />
      </div>

      <div className="flex flex-col justify-between p-5 w-full">
        <div>
          <h3 className="text-[18px] sm:text-base font-semibold text-gray-800 line-clamp-2">
            {product.name || 'Unnamed Product'}
          </h3>
          {/* <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {product.description || 'No description available'}
          </p> */}
          <p className="text-[12px] text-gray-500 italic">
            SKU: {product.sku}
          </p>

          <div className="mt-2">
            <p className="text-sm text-gray-900 font-semibold">
              UGX {discountedPrice.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">1 item (MOQ)</p>
          </div>

        </div>

      </div>
    </div>
  );


  const renderPortrait = () => (
    <div className={`${commonClasses} ${softShadow} p-4 w-48 transition-opacity duration-300 ${wrapperStyle}`}>
      <img {...imageProps} className="w-full h-56 object-cover rounded-xl mb-3" />
      <h2 className="text-base font-semibold">{product.name}</h2>
      <p className="text-[7px] text-gray-400 italic mb-1">CODE: {productCodeText}</p>
      <p className="text-gray-500 text-sm mt-1 line-clamp-3">{product.description}</p>
      <p className="text-blue-600 font-bold mt-2 text-sm">UGX {discountedPrice.toLocaleString()}</p>
    </div>
  );

  // const renderCompact = () => (
  //   <div className={`bg-white border border-gray-200 rounded-2xl p-1 w-full max-w-xs mx-auto hover:shadow-md transition mb-1 break-inside-avoid transition-opacity duration-300 ${wrapperStyle}`}>
  //     <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '3 / 4' }}>
  //       {!imageLoaded && (
  //         <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
  //       )}

  //       <img {...imageProps} className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-xl ${imageLoaded ? "opacity-100" : "opacity-0"}`} />
  //     </div>

  //     <div className="px-4 pb-4 pt-2">
  //       <p
  //         className="text-sm font-medium text-gray-800 mb-2 overflow-hidden"
  //         style={{
  //           display: '-webkit-box',
  //           WebkitLineClamp: 2,
  //           WebkitBoxOrient: 'vertical',
  //           minHeight: '2.5rem', // roughly 2 lines of text height at text-sm
  //           lineHeight: '1.25rem', // Tailwind's default line height for text-sm
  //         }}
  //       >
  //         {product.name || 'Unnamed Product'}
  //       </p>

  //       <p className="text-sm text-gray-900 font-semibold">
  //         UGX {discountedPrice.toLocaleString()}
  //       </p>
  //       <p className="text-xs text-gray-500 mb-2">1 item (MOQ)</p>
  //       <p className="text-[11px] text-gray-400 italic mt-1">
  //         CODEX: {product.sku || 'N/A'}
  //       </p>
  //     </div>
  //   </div>
  // );

const renderCompact = () => {

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-1 w-full max-w-xs mx-auto hover:shadow-md transition mb-1 break-inside-avoid transition-opacity duration-300 ${wrapperStyle}`}>
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '3 / 4' }}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
        )}

        {imageUrl ? (
          <img
            {...imageProps}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-xl ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs rounded-xl">
            No Image
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-2">
        <p
          className="text-sm font-medium text-gray-800 mb-2 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.5rem',
            lineHeight: '1.25rem',
          }}
        >
          {product.name || 'Unnamed Product'}
        </p>

        <p className="text-sm text-gray-900 font-semibold">
          UGX {discountedPrice.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mb-2">1 item (MOQ)</p>
        <p className="text-[11px] text-gray-400 italic mt-1">
          CODEX: {product.sku || 'N/A'}
        </p>
      </div>
    </div>
  );
};





  const renderCompactX = () => (
    <div className={`bg-white border border-gray-200 rounded-2xl p-1 w-full max-w-xs mx-auto hover:shadow-md transition mb-2 break-inside-avoid transition-opacity duration-300 ${wrapperStyle}`}>
      <div className="w-full h-full sm:h-48 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
        <img {...imageProps} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="px-4 pb-4 pt-2">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{product.name || 'Unnamed Product'}</p>
        <p className="text-sm text-gray-900 font-semibold">UGX {discountedPrice.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mb-2">1 item (MOQ)</p>
        <p className="text-[7px] text-gray-400 italic mt-1">CODEX: {product.sku || "N/A"}</p>
      </div>
    </div>
  );

  switch (variant) {
    case 'landscape':
      return renderLandscape();
    case 'landscapemain':
      return renderLandscapeMain();
    case 'landscapemain02':
      return renderLandscapeMain02();
    case 'portrait':
      return renderPortrait();
    case 'compact':
      return renderCompact();
    case 'compactX':
      return renderCompactX();
    default:
      return renderDefault();
  }
};

export default ProductCard;
