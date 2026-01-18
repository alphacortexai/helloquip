"use client";
import React from "react";
import CachedLogo from "./CachedLogo";
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pb-20 md:pb-0">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <CachedLogo
                variant="footer"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
            Exceptional, Premium and Budget healthcare commodities at your fingertips
            We are committed to supporting healthcare across Africa by improving access
            to healthcare commodities as well transformming procurement process making it faster,
            more transparent and cost effective through innovative e-commerce platform
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="/categories" className="text-gray-300 hover:text-blue-400 transition-colors">Categories</a></li>
              <li><a href="/search" className="text-gray-300 hover:text-blue-400 transition-colors">Search Products</a></li>
              <li><a href="/order" className="text-gray-300 hover:text-blue-400 transition-colors">My Orders</a></li>
              <li><a href="/account" className="text-gray-300 hover:text-blue-400 transition-colors">My Account</a></li>
              <li><a href="/feedback" className="text-gray-300 hover:text-blue-400 transition-colors">Share Feedback</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-300 hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-blue-400 transition-colors">Contact Us</a></li>
              <li><a href="/privacy" className="text-gray-300 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-300 hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="/shipping" className="text-gray-300 hover:text-blue-400 transition-colors">Shipping Info</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">+256 774 660 089</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">hello@heloquip.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">Kampala, Uganda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h5 className="text-sm font-semibold mb-2">We Accept</h5>
              <div className="flex space-x-2">
                <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center text-xs">VISA</div>
                <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center text-xs">MC</div>
                <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center text-xs">MPESA</div>
                <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center text-xs">AIRTEL</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              <p>© {new Date().getFullYear()} Heloquip. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
