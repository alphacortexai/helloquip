// "use client";

// import { useState } from "react";
// import { addDoc, collection } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import jsPDF from "jspdf";


// export default function ConvertToQuotationButton({ cartItems, address, userId }) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const generatePDF = (quotationData) => {
//     const doc = new jsPDF();

//     doc.setFontSize(18);
//     doc.text("Quotation", 10, 10);

//     doc.setFontSize(12);
//     let y = 20;

//     quotationData.items.forEach((item, i) => {
//       doc.text(
//         `${i + 1}. ${item.name} - Qty: ${item.quantity} - Price: UGX ${item.price.toLocaleString()}`,
//         10,
//         y
//       );
//       y += 10;
//     });

//     y += 10;
//     doc.text(
//       `Total Amount: UGX ${quotationData.totalAmount.toLocaleString()}`,
//       10,
//       y
//     );
//     y += 10;

//     doc.text("Shipping Address:", 10, y);
//     y += 8;

//     doc.text(`Full Name: ${quotationData.address.fullName || "N/A"}`, 10, y);
//     y += 8;
//     doc.text(`Region: ${quotationData.address.city || "N/A"}`, 10, y);
//     y += 8;
//     doc.text(`Area: ${quotationData.address.area || "N/A"}`, 10, y);
//     y += 8;
//     doc.text(`Phone: ${quotationData.address.phoneNumber || "N/A"}`, 10, y);

//     doc.save("quotation.pdf");
//   };

//   const handleConvert = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       if (!userId) throw new Error("User not authenticated");

//       const quotationData = {
//         userId,
//         items: cartItems.map((item) => ({
//           id: item.id,
//           name: item.name,
//           price: item.price,
//           quantity: item.quantity || 1,
//           description: item.description || "",
//           sku: item.sku || "",
//         })),
//         address,
//         totalAmount: cartItems.reduce(
//           (sum, item) => sum + item.price * (item.quantity || 1),
//           0
//         ),
//         createdAt: new Date().toISOString(),
//       };

//       // Save quotation to Firestore
//       await addDoc(collection(db, "quotations"), quotationData);

//       // Generate and download PDF
//       generatePDF(quotationData);
//     } catch (err) {
//       setError(err.message || "Failed to create quotation");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <button
//         onClick={handleConvert}
//         disabled={loading}
//         className={`w-full mt-4 px-6 py-3 rounded text-base font-semibold transition ${
//           loading
//             ? "bg-yellow-400 cursor-not-allowed"
//             : "bg-yellow-600 hover:bg-yellow-700 text-white"
//         }`}
//       >
//         {loading ? "Processing..." : "📄 Convert to Quotation & Download PDF"}
//       </button>
//       {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ConvertToQuotationButton({ cartItems, address, userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePDF = (quotationData) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor("#1F2A40");
    doc.text("HELLOQUIP AUTO QUOTATION", 14, 20);

    // Company Info & Quote Meta
    doc.setFontSize(11);
    doc.setTextColor("#444");
    doc.text("www.helloquip.com", 14, 28);
    doc.text(`Quote No: 000${Math.floor(Math.random() * 1000)}`, 150, 20);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 28);

    // Address Section
    const addr = quotationData.address || {};
    doc.setFont(undefined, "bold");
    doc.text("QUOTE TO:", 14, 40);
    doc.setFont(undefined, "normal");
    doc.text(`${addr.fullName || "N/A"}`, 14, 46);
    doc.text(`${addr.city || ""}, ${addr.area || ""}`, 14, 52);
    doc.text(`Phone: ${addr.phoneNumber || "N/A"}`, 14, 58);

    // Item Table
    const tableData = quotationData.items.map((item) => [
      item.name,
      `UGX ${item.price.toLocaleString()}`,
      item.quantity,
      `UGX ${(item.price * item.quantity).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [["DESCRIPTION", "PRICE", "QTY", "TOTAL"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [31, 42, 64] },
    });

    // Totals
    const subtotal = quotationData.totalAmount;
    const tax = Math.round(subtotal * 0.1); // 10% Tax
    const grandTotal = subtotal + tax;

    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont(undefined, "bold");
    doc.text(`SUBTOTAL: UGX ${subtotal.toLocaleString()}`, 140, finalY);
    finalY += 7;
    doc.text(`TAX: UGX ${tax.toLocaleString()}`, 140, finalY);
    finalY += 7;
    doc.text(`GRAND TOTAL: UGX ${grandTotal.toLocaleString()}`, 140, finalY);

    // Footer
    doc.setFontSize(9);
    finalY += 20;
    doc.setFont(undefined, "bold");
    doc.text("Terms and Conditions", 14, finalY);
    doc.setFont(undefined, "normal");
    doc.text(
      "Payment due within 30 days. Please contact support@helloquip.com for questions.",
      14,
      finalY + 6
    );

    // Save PDF
    doc.save("quotation.pdf");
  };

  const handleConvert = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userId) throw new Error("User not authenticated");
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error("Your cart is empty. Add items before generating a quotation.");
      }
      const required = [address?.fullName, address?.city, address?.area, address?.phoneNumber];
      if (required.some((v) => !v || String(v).trim() === "")) {
        throw new Error("Please complete your shipping address to generate a quotation.");
      }

      const quotationData = {
        userId,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          description: item.description || "",
          sku: item.sku || "",
        })),
        address,
        totalAmount: cartItems.reduce(
          (sum, item) => sum + item.price * (item.quantity || 1),
          0
        ),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "quotations"), quotationData);
      generatePDF(quotationData);
    } catch (err) {
      setError(err.message || "Failed to create quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleConvert}
        disabled={loading}
        className={`w-full mt-4 px-6 py-3 rounded text-base font-semibold transition ${
          loading
            ? "bg-yellow-400 cursor-not-allowed"
            : "bg-yellow-600 hover:bg-yellow-700 text-white"
        }`}
      >
        {loading ? "Processing..." : "📄 Convert to Quotation & Download PDF"}
      </button>
      {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
    </div>
  );
}
