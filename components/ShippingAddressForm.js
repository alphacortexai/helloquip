"use client";
import { useState, useEffect } from "react";

export default function ShippingAddressForm({ onAddressChange, initialData = {} }) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    phone: initialData.phone || "",
    district: initialData.district || "",
    address: initialData.address || "",
  });

  useEffect(() => {
    if (onAddressChange) {
      onAddressChange(form);
    }
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-4 border rounded-md mb-4">
      <h3 className="text-sm font-semibold mb-2">Shipping Address</h3>
      <div className="grid gap-3 text-sm">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="text"
          name="district"
          placeholder="District"
          value={form.district}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="text"
          name="address"
          placeholder="Detailed Address"
          value={form.address}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
      </div>
    </div>
  );
}
