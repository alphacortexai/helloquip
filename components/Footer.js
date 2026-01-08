"use client";
import React from "react";
import Link from "next/link";
import CachedLogo from "./CachedLogo";
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="mb-4">
              <CachedLogo
                variant="footer"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Exceptional, Premium and Budget healthcare commodities at your fingertips. We are committed to supporting healthcare across Africa by improving access to healthcare commodities through our innovative e-commerce platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#2e4493] transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#2e4493] transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-gray-800 pb-2 inline-block">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white transition-colors text-sm">Categories</Link></li>
              <li><Link href="/search" className="text-gray-400 hover:text-white transition-colors text-sm">Search Products</Link></li>
              <li><Link href="/order" className="text-gray-400 hover:text-white transition-colors text-sm">My Orders</Link></li>
              <li><Link href="/account" className="text-gray-400 hover:text-white transition-colors text-sm">My Account</Link></li>
              <li><Link href="/feedback" className="text-gray-400 hover:text-white transition-colors text-sm">Share Feedback</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-gray-800 pb-2 inline-block">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white transition-colors text-sm">Shipping Info</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-gray-800 pb-2 inline-block">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <PhoneIcon className="h-5 w-5 text-[#2e4493] mt-0.5" />
                <span className="text-gray-400 text-sm">+256 774 660 089</span>
              </div>
              <div className="flex items-start space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-[#2e4493] mt-0.5" />
                <span className="text-gray-400 text-sm">hello@heloquip.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-[#2e4493] mt-0.5" />
                <span className="text-gray-400 text-sm">Kampala, Uganda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-500 text-xs">
            © 2025 Heloquip. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex space-x-2">
              <div className="px-2 py-1 bg-gray-800 rounded text-[10px] font-bold text-gray-400">VISA</div>
              <div className="px-2 py-1 bg-gray-800 rounded text-[10px] font-bold text-gray-400">MASTERCARD</div>
              <div className="px-2 py-1 bg-gray-800 rounded text-[10px] font-bold text-gray-400">MTN</div>
              <div className="px-2 py-1 bg-gray-800 rounded text-[10px] font-bold text-gray-400">AIRTEL</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
