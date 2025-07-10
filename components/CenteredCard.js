"use client";
import React from "react";

export default function CenteredCard({ title, message, children }) {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl text-center max-w-sm w-full">
        {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
        <p className="text-gray-600 mb-4">{message}</p>
        {children}
      </div>
    </div>
  );
}
