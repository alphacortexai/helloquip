"use client";
import React from "react";
import Image from "next/image";
// import { assets } from "@/assets/assets"; // make sure your logo path is correct

const Footer = () => {
  return (
    <footer className="bg-white text-gray-600 mt-10">
      <div className="flex flex-col md:flex-row items-start justify-between px-6 md:px-16 lg:px-32 gap-10 py-10 border-t border-gray-200">
        {/* Logo and Description */}
        <div className="w-full md:w-1/3">
          {/* <Image className="w-28 md:w-32" src={assets.logo} alt="HelloQuip logo" /> */}
          <p className="mt-4 text-sm leading-relaxed">
            HelloQuip is your trusted partner for high-quality medical equipment. We are committed to providing reliable, accessible, and affordable solutions to support healthcare across Africa.
          </p>
        </div>

        {/* Company Links */}
        <div className="w-full md:w-1/3">
          <h2 className="font-semibold text-gray-900 mb-4">Company</h2>
          <ul className="text-sm space-y-2">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="w-full md:w-1/3">
          <h2 className="font-semibold text-gray-900 mb-4">Get in Touch</h2>
          <div className="text-sm space-y-2">
            <p>+256 700 000 000</p>
            <p>support@helloquip.com</p>
            <p>Kampala, Uganda</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="py-4 text-center text-xs text-gray-500 border-t border-gray-100">
        © 2025 HelloQuip. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
