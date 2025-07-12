// // components/NotificationCard.js
// import React from "react";

// export default function NotificationCard({ title, body, onClose }) {
//   return (
//     <div className="fixed top-5 right-5 max-w-sm w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 animate-slide-in">
//       <div className="flex justify-between items-start">
//         <div>
//           <h4 className="font-semibold text-lg text-gray-900">{title}</h4>
//           <p className="text-gray-700 mt-1">{body}</p>
//         </div>
//         <button
//           onClick={onClose}
//           aria-label="Close notification"
//           className="text-gray-400 hover:text-gray-700 ml-4 font-bold text-xl leading-none"
//         >
//           &times;
//         </button>
//       </div>
//     </div>
//   );
// }




// components/NotificationCard.js
import React from "react";

export default function NotificationCard({ title, body, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20, // roughly top-5
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: 320, // max-w-xs ~ 20rem = 320px
        width: "100%",
        backgroundColor: "white",
        border: "1px solid #D1D5DB", // gray-300
        borderRadius: 12, // rounded-lg
        boxShadow:
          "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", // shadow-lg
        padding: 16, // p-4
        zIndex: 50,
        animation: "slide-in 0.3s ease forwards", // you can define keyframes or remove
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h4
            style={{
              fontWeight: 600,
              fontSize: 16, // text-md
              color: "#111827", // gray-900
              margin: 0,
            }}
          >
            {title}
          </h4>
          <p
            style={{
              color: "#4B5563", // gray-700
              marginTop: 4,
              fontSize: 14, // text-sm
            }}
          >
            {body}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close notification"
          style={{
            marginLeft: 16,
            fontWeight: "bold",
            fontSize: 20,
            lineHeight: 1,
            color: "#9CA3AF", // gray-400
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#374151")} // gray-700 hover
          onMouseOut={(e) => (e.currentTarget.style.color = "#9CA3AF")}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
