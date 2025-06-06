// "use client";

// export default function ContactButtons({ phoneNumber }) {
//   const cleanedNumber = phoneNumber.replace(/[^\d]/g, "");

//   return (
//     <div className="flex flex-col gap-2">
//       {/* Phone Call Button - very light blue */}
//       <a
//         href={`tel:${phoneNumber}`}
//         className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-200 transition flex justify-center"
//         aria-label="Call Phone"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         Call
//       </a>

//       {/* WhatsApp Button - standard green */}
//       <a
//         href={`https://wa.me/${cleanedNumber}`}
//         className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition flex justify-center"
//         aria-label="WhatsApp Chat"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         WhatsApp
//       </a>
//     </div>
//   );
// }




"use client";

import Image from "next/image";
import phoneIcon from "../app/assets/phone.png";
import whatsappIcon from "../app/assets/whatsapp.png";




export default function ContactButtons({ phoneNumber }) {
  const cleanedNumber = phoneNumber.replace(/[^\d]/g, "");

  return (
    <div className="flex flex-row gap-2">
      {/* Phone Call Icon Button */}
      <a
        href={`tel:${phoneNumber}`}
        className="rounded-md p-1 hover:bg-blue-200 transition flex items-center justify-center"
        aria-label="Call Phone"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src={phoneIcon} alt="Phone" width={50} height={50} />
      </a>

            {/* WhatsApp Icon Button */}
      <a
        href={`https://wa.me/${cleanedNumber}`}
        className="rounded-md p-2 hover:bg-green-700 transition flex items-center justify-center"
        aria-label="WhatsApp Chat"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src={whatsappIcon} alt="WhatsApp" width={50} height={50} />
      </a>
    </div>
  );
}
