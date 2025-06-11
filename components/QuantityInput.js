// // components/QuantityInput.js
// export default function QuantityInput({ quantity, setQuantity }) {
//   return (
//     <div className="flex items-center gap-2">
//       <span>Quantity :</span>
//       <div className="flex items-center border border-gray-300 rounded overflow-hidden">
//         <button
//           onClick={() => setQuantity((prev) => Math.max(1, parseInt(prev || 1) - 1))}
//           className="px-3 py-1 text-gray-600 hover:bg-gray-100"
//           type="button"
//         >
//           &minus;
//         </button>

//         <input
//           type="number"
//           min={1}
//           value={quantity}
//           onChange={(e) => {
//             const val = e.target.value;
//             if (val === '') return setQuantity('');
//             const num = parseInt(val);
//             if (!isNaN(num) && num > 0) setQuantity(num);
//           }}
//           onBlur={() => {
//             if (!quantity || quantity < 1) setQuantity(1);
//           }}
//           className="w-12 text-center text-sm py-1 border-l border-r border-gray-300 appearance-none"
//           aria-label="Quantity"
//         />

//         <button
//           onClick={() => setQuantity((prev) => parseInt(prev || 1) + 1)}
//           className="px-3 py-1 text-gray-600 hover:bg-gray-100"
//           type="button"
//         >
//           &#43;
//         </button>
//       </div>
//     </div>
//   );
// }






// components/QuantityInput.js
export default function QuantityInput({ quantity, setQuantity }) {
  return (
    <div className="flex items-center gap-3 text-base font-medium">
      <span className="text-gray-700">Quantity:</span>
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <button
          onClick={() => setQuantity((prev) => Math.max(1, parseInt(prev || 1) - 1))}
          className="px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
          type="button"
        >
          &minus;
        </button>

        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') return setQuantity('');
            const num = parseInt(val);
            if (!isNaN(num) && num > 0) setQuantity(num);
          }}
          onBlur={() => {
            if (!quantity || quantity < 1) setQuantity(1);
          }}
          className="w-16 text-center text-base py-2 border-l border-r border-gray-300 appearance-none"
          aria-label="Quantity"
        />

        <button
          onClick={() => setQuantity((prev) => parseInt(prev || 1) + 1)}
          className="px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
          type="button"
        >
          &#43;
        </button>
      </div>
    </div>
  );
}
