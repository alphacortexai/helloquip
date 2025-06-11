


// "use client";

// import Image from "next/image";
// import phoneIcon from "../app/assets/phone.png";
// import whatsappIcon from "../app/assets/whatsapp.png";




// export default function ContactButtons({ phoneNumber }) {
//   const cleanedNumber = phoneNumber.replace(/[^\d]/g, "");

//   return (
//     <div className="flex flex-row gap-2">
//       {/* Phone Call Icon Button */}
//       <a
//         href={`tel:${phoneNumber}`}
//         className="rounded-md p-1 hover:bg-blue-200 transition flex items-center justify-center"
//         aria-label="Call Phone"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         <Image src={phoneIcon} alt="Phone" width={50} height={50} />
//       </a>

//             {/* WhatsApp Icon Button */}
//       <a
//         href={`https://wa.me/${cleanedNumber}`}
//         className="rounded-md p-2 hover:bg-green-700 transition flex items-center justify-center"
//         aria-label="WhatsApp Chat"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         <Image src={whatsappIcon} alt="WhatsApp" width={50} height={50} />
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
    <div className="flex justify-center items-center gap-6 mb-2">
      {/* Phone Call */}
      <a
        href={`tel:${phoneNumber}`}
        className="flex items-center gap-3 hover:bg-blue-100 px-3 py-2 rounded-md transition"
        aria-label="Call Phone"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src={phoneIcon} alt="Phone" width={46} height={46} />
        <span className="text-base text-[16px] text-gray-800">Call Now</span>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/${cleanedNumber}`}
        className="flex items-center gap-3 hover:bg-green-100 px-3 py-2 rounded-md transition"
        aria-label="WhatsApp Chat"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src={whatsappIcon} alt="WhatsApp" width={46} height={46} />
        <span className="text-base text-[16px] text-gray-800">WhatsApp</span>
      </a>
    </div>
  );
}
