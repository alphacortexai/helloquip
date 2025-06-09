// import React from 'react';

// const ProductCard = ({ product, variant = 'default' }) => {
//   const commonClasses = 'bg-white shadow-sm hover:shadow-md rounded-2xl transition duration-200';
//   const softShadow = 'shadow-[0_4px_12px_rgba(0,0,0,0.05)]';

//   const renderDefault = () => (
//     <div className={`${commonClasses} ${softShadow} p-4`}>
//       <img
//         src={product.image}
//         alt={product.name}
//         loading="lazy"
//         className="w-full h-48 object-cover rounded-xl mb-3"
//       />
//       <h2 className="text-lg font-semibold">{product.name}</h2>
//       <p className="text-gray-600 mt-1">{product.description}</p>
//       <p className="text-blue-600 font-bold mt-2">UGX {product.price}</p>
//     </div>
//   );

//   const renderLandscape = () => (
//     <div className={`${commonClasses} ${softShadow} p-4 flex gap-4 items-center`}>
//       <img
//         src={product.image}
//         alt={product.name}
//         loading="lazy"
//         className="w-32 h-32 object-cover rounded-xl flex-shrink-0"
//       />
//       <div>
//         <h2 className="text-lg font-semibold">{product.name}</h2>
//         <p className="text-gray-600 mt-1 line-clamp-2">{product.description}</p>
//         <p className="text-blue-600 font-bold mt-2">UGX {product.price}</p>
//       </div>
//     </div>
//   );

//   const renderPortrait = () => (
//     <div className={`${commonClasses} ${softShadow} p-4 w-48`}>
//       <img
//         src={product.image}
//         alt={product.name}
//         loading="lazy"
//         className="w-full h-56 object-cover rounded-xl mb-3"
//       />
//       <h2 className="text-base font-semibold">{product.name}</h2>
//       <p className="text-gray-500 text-sm mt-1 line-clamp-3">{product.description}</p>
//       <p className="text-blue-600 font-bold mt-2 text-sm">UGX {product.price}</p>
//     </div>
//   );

//   const renderCompact = () => (
//     <div className="flex flex-col items-start group">
//       <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
//         <img
//           src={product.image}
//           alt={product.name}
//           loading="lazy"
//           className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//         />
//       </div>
//       <div className="pt-1 w-full">
//         <p className="text-sm font-regular text-gray-700 truncate">{product.name}</p>
//         <p className="text-sm font-semibold text-gray-700">
//           UGX {Number(product.price).toLocaleString?.()}
//         </p>
//       </div>
//     </div>
//   );

//   switch (variant) {
//     case 'landscape':
//       return renderLandscape();
//     case 'portrait':
//       return renderPortrait();
//     case 'compact':
//       return renderCompact();
//     default:
//       return renderDefault();
//   }
// };

// export default ProductCard;





import React from 'react';

const ProductCard = ({ product, variant = 'default' }) => {
  const commonClasses = 'bg-white shadow-sm hover:shadow-md rounded-2xl transition duration-200';
  const softShadow = 'shadow-[0_4px_12px_rgba(0,0,0,0.05)]';

  // Helper to display product code or 'null'
  const productCodeText = product.productCode ? product.productCode : "null";

  const renderDefault = () => (
    <div className={`${commonClasses} ${softShadow} p-4`}>
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="w-full h-48 object-cover rounded-xl mb-3"
      />
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-sm text-gray-400 italic mb-1">{productCodeText}</p>
      <p className="text-gray-600 mt-1">{product.description}</p>
      <p className="text-blue-600 font-bold mt-2">UGX {product.price}</p>
    </div>
  );

  const renderLandscape = () => (
    <div className={`${commonClasses} ${softShadow} p-4 flex gap-4 items-center`}>
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="w-32 h-32 object-cover rounded-xl flex-shrink-0"
      />
      <div>
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-sm text-gray-400 italic mb-1">{productCodeText}</p>
        <p className="text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        <p className="text-blue-600 font-bold mt-2">UGX {product.price}</p>
      </div>
    </div>
  );

  const renderPortrait = () => (
    <div className={`${commonClasses} ${softShadow} p-4 w-48`}>
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="w-full h-56 object-cover rounded-xl mb-3"
      />
      <h2 className="text-base font-semibold">{product.name}</h2>
      <p className="text-xs text-gray-400 italic mb-1">{productCodeText}</p>
      <p className="text-gray-500 text-sm mt-1 line-clamp-3">{product.description}</p>
      <p className="text-blue-600 font-bold mt-2 text-sm">UGX {product.price}</p>
    </div>
  );

  const renderCompact = () => (
    <div className="flex flex-col items-start group">
      <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="pt-1 w-full">
        <p className="text-sm font-regular text-gray-700 truncate">{product.name}</p>
        <p className="text-xs text-gray-400 italic">{productCodeText}</p>
        <p className="text-sm font-semibold text-gray-700">
          UGX {Number(product.price).toLocaleString?.()}
        </p>
      </div>
    </div>
  );

  switch (variant) {
    case 'landscape':
      return renderLandscape();
    case 'portrait':
      return renderPortrait();
    case 'compact':
      return renderCompact();
    default:
      return renderDefault();
  }
};

export default ProductCard;
