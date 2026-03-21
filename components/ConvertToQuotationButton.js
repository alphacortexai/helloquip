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
//       await generatePDF(quotationData);
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
import { useCurrency } from "@/hooks/useCurrency";

export default function ConvertToQuotationButton({ cartItems, address, userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currency, formatPrice } = useCurrency();

  const isCompanyCustomer = address?.customerType === "company";

  const getRecipientDetails = (addr = {}) => {
    const isCompany = addr.customerType === "company";

    if (isCompany) {
      return {
        primaryName: addr.organizationName || "N/A",
        secondaryName: addr.contactPerson ? `Attn: ${addr.contactPerson}` : "",
      };
    }

    return {
      primaryName: addr.fullName || "N/A",
      secondaryName: "",
    };
  };

  const loadLetterheadImage = async () => {
    const response = await fetch("/heloquip-letterhead.png");
    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generatePDF = async (quotationData) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const topMargin = 50;
    const bottomMargin = 20;
    const sideMargin = 14;
    const letterheadImage = await loadLetterheadImage();

    const addLetterheadBackground = () => {
      doc.addImage(letterheadImage, "PNG", 0, 0, pageWidth, pageHeight);
    };

    addLetterheadBackground();

    // Header
    doc.setFontSize(20);
    doc.setTextColor("#1F2A40");
    doc.text("Quotation", sideMargin, topMargin + 2);

    // Company Info & Quote Meta
    doc.setFontSize(10);
    doc.setTextColor("#444444");
    doc.text("www.heloquip.com", sideMargin, topMargin + 9);
    doc.text("hello@heloquip.com", sideMargin, topMargin + 15);
    doc.text(`Quote No: 000${Math.floor(Math.random() * 1000)}`, 150, topMargin + 2);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, topMargin + 9);

    // Address Section
    const addr = quotationData.address || {};
    doc.setFont(undefined, "bold");
    doc.text("QUOTE TO:", sideMargin, topMargin + 26);
    doc.setFont(undefined, "normal");
    const recipient = getRecipientDetails(addr);
    doc.text(recipient.primaryName, sideMargin, topMargin + 32);
    if (recipient.secondaryName) {
      doc.text(recipient.secondaryName, sideMargin, topMargin + 38);
    }

    const locationY = recipient.secondaryName ? topMargin + 44 : topMargin + 38;
    const phoneY = recipient.secondaryName ? topMargin + 50 : topMargin + 44;
    doc.text(`${addr.city || ""}, ${addr.area || ""}`, sideMargin, locationY);
    doc.text(`Phone: ${addr.phoneNumber || "N/A"}`, sideMargin, phoneY);

    // Item Table
    const tableData = quotationData.items.map((item) => [
      item.name,
      formatPrice(item.price),
      item.quantity,
      formatPrice(item.price * item.quantity)
    ]);

    autoTable(doc, {
      startY: topMargin + 58,
      margin: { top: topMargin, bottom: bottomMargin, left: sideMargin, right: sideMargin },
      head: [["DESCRIPTION", "PRICE", "QTY", "TOTAL"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [31, 42, 64] },
      didDrawPage: ({ pageNumber }) => {
        if (pageNumber > 1) {
          addLetterheadBackground();
        }
      },
    });

    // Totals
    const subtotal = quotationData.totalAmount;
    const tax = Math.round(subtotal * 0.1); // 10% Tax
    const grandTotal = subtotal + tax;

    let finalY = Math.min(doc.lastAutoTable.finalY + 10, pageHeight - bottomMargin - 24);
    doc.setFont(undefined, "bold");
    doc.text(`SUBTOTAL: ${formatPrice(subtotal)}`, 140, finalY);
    finalY += 7;
    doc.text(`TAX: ${formatPrice(tax)}`, 140, finalY);
    finalY += 7;
    doc.text(`GRAND TOTAL: ${formatPrice(grandTotal)}`, 140, finalY);

    // Footer
    doc.setFontSize(9);
    finalY = Math.min(finalY + 16, pageHeight - bottomMargin - 8);
    doc.setFont(undefined, "bold");
    doc.text("Terms and Conditions", sideMargin, finalY);
    doc.setFont(undefined, "normal");
    doc.text(
      "Payment due within 30 days. Please contact hello@heloquip.com for questions.",
      sideMargin,
      finalY + 6
    );

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
      const required = isCompanyCustomer
        ? [address?.organizationName, address?.contactPerson, address?.city, address?.area, address?.phoneNumber]
        : [address?.fullName, address?.city, address?.area, address?.phoneNumber];
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
        displayCurrency: currency,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "quotations"), quotationData);
      await generatePDF(quotationData);
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
