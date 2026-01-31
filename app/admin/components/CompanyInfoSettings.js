"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const defaultSystemPrompt = `You are Heloquip's customer service assistant. Be concise, friendly, and helpful.

Answer questions about products, quotes, orders, shipping, returns, and account issues.

When 'Company Information' is provided in the context, use it to answer questions about contact details, phone numbers, email addresses, working hours, location, shipping policies, return policies, payment methods, and any other company-related questions. Always provide the actual company contact info from the context when users ask how to reach the company.

When 'Products in database' is provided in the context, use that list to answer product and catalog questions. Do not say you do not have product data when it is provided—always use the list.

Product data may include description, warranty, manufacturer, and attributes. Use these when answering questions about a product's features, warranty, or specifications.

Use database lookup results when provided and never invent order or product details.

When listing orders, always show the order number in UPPERCASE (e.g. Order #0NO20PBGDP1XUGM9AAU4).

If a user asks about an order but order number or email is missing, request the order number and the email used at checkout.

If you are unsure or need human help, ask a clarifying question and offer to connect them.

Do not ask for sensitive payment details.

IMPORTANT—do not invent processes or promise outcomes this chat cannot deliver:
- This chat does NOT save conversations, log requests, or forward them to any team.
- Do NOT say you have 'noted', 'logged', 'recorded', or 'submitted' the user's request.
- Do NOT promise that 'a team member will contact you' for requests made only in this chat.
- For quote requests: tell users to add items to their cart and use the 'Request Quote' button on the cart or checkout page.

In general: only describe actions and systems that exist. If you are not sure whether something happens in the background, do not claim it does.`;

const defaultInfo = {
  companyName: "Heloquip",
  phoneNumbers: [],
  emails: [],
  whatsapp: "",
  address: "",
  workingHours: "",
  website: "",
  socialMedia: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  },
  shippingInfo: "",
  returnPolicy: "",
  paymentMethods: "",
  additionalInfo: "",
  systemPrompt: "",
};

export default function CompanyInfoSettings() {
  const [info, setInfo] = useState(defaultInfo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const docRef = doc(db, "settings", "companyInfo");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setInfo({ ...defaultInfo, ...docSnap.data() });
      }
    } catch (error) {
      console.error("Error fetching company info:", error);
      setMessage({ type: "error", text: "Failed to load company info" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const docRef = doc(db, "settings", "companyInfo");
      await setDoc(docRef, {
        ...info,
        updatedAt: new Date(),
      });
      setMessage({ type: "success", text: "Company info saved successfully!" });
    } catch (error) {
      console.error("Error saving company info:", error);
      setMessage({ type: "error", text: "Failed to save company info" });
    } finally {
      setSaving(false);
    }
  };

  const addPhone = () => {
    if (newPhone.trim() && !info.phoneNumbers.includes(newPhone.trim())) {
      setInfo({ ...info, phoneNumbers: [...info.phoneNumbers, newPhone.trim()] });
      setNewPhone("");
    }
  };

  const removePhone = (phone) => {
    setInfo({ ...info, phoneNumbers: info.phoneNumbers.filter((p) => p !== phone) });
  };

  const addEmail = () => {
    if (newEmail.trim() && !info.emails.includes(newEmail.trim())) {
      setInfo({ ...info, emails: [...info.emails, newEmail.trim()] });
      setNewEmail("");
    }
  };

  const removeEmail = (email) => {
    setInfo({ ...info, emails: info.emails.filter((e) => e !== email) });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Company Information</h2>
        <p className="text-sm text-gray-600 mt-1">
          This information will be used by the AI chat assistant to answer customer questions about your company.
        </p>
      </div>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={info.companyName}
                onChange={(e) => setInfo({ ...info, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Your company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={info.website}
                onChange={(e) => setInfo({ ...info, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="https://www.example.com"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={info.address}
              onChange={(e) => setInfo({ ...info, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Company address"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
            <input
              type="text"
              value={info.workingHours}
              onChange={(e) => setInfo({ ...info, workingHours: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="e.g., Mon-Fri 9AM-5PM, Sat 10AM-2PM"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h3>
          
          {/* Phone Numbers */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers</label>
            <div className="flex gap-2 mb-2">
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPhone())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Add phone number"
              />
              <button
                onClick={addPhone}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {info.phoneNumbers.map((phone, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {phone}
                  <button
                    onClick={() => removePhone(phone)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Email Addresses */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Addresses</label>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Add email address"
              />
              <button
                onClick={addEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {info.emails.map((email, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {email}
                  <button
                    onClick={() => removeEmail(email)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
            <input
              type="tel"
              value={info.whatsapp}
              onChange={(e) => setInfo({ ...info, whatsapp: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="WhatsApp number for customer support"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Social Media</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input
                type="url"
                value={info.socialMedia.facebook}
                onChange={(e) => setInfo({ ...info, socialMedia: { ...info.socialMedia, facebook: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Facebook page URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter/X</label>
              <input
                type="url"
                value={info.socialMedia.twitter}
                onChange={(e) => setInfo({ ...info, socialMedia: { ...info.socialMedia, twitter: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Twitter profile URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input
                type="url"
                value={info.socialMedia.instagram}
                onChange={(e) => setInfo({ ...info, socialMedia: { ...info.socialMedia, instagram: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Instagram profile URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="url"
                value={info.socialMedia.linkedin}
                onChange={(e) => setInfo({ ...info, socialMedia: { ...info.socialMedia, linkedin: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="LinkedIn page URL"
              />
            </div>
          </div>
        </div>

        {/* Business Policies */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Business Policies & Info</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Information</label>
              <textarea
                value={info.shippingInfo}
                onChange={(e) => setInfo({ ...info, shippingInfo: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Describe your shipping policies, delivery times, shipping areas, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Policy</label>
              <textarea
                value={info.returnPolicy}
                onChange={(e) => setInfo({ ...info, returnPolicy: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Describe your return and refund policies"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Methods</label>
              <textarea
                value={info.paymentMethods}
                onChange={(e) => setInfo({ ...info, paymentMethods: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="List accepted payment methods (e.g., Mobile Money, Visa, Cash on Delivery)"
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Additional Information</h3>
          <p className="text-xs text-gray-500 mb-2">
            Add any other information you want the AI assistant to know about your company (FAQs, special services, promotions, etc.)
          </p>
          <textarea
            value={info.additionalInfo}
            onChange={(e) => setInfo({ ...info, additionalInfo: e.target.value })}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Any additional information the AI should know..."
          />
        </div>

        {/* AI System Prompt */}
        <div className="bg-white border border-purple-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-purple-700">AI Assistant System Prompt</h3>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">Advanced</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            This is the core instruction that defines how the AI assistant behaves. Edit carefully - this controls the AI's personality, capabilities, and limitations.
          </p>
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setInfo({ ...info, systemPrompt: defaultSystemPrompt })}
              className="text-xs text-purple-600 hover:text-purple-800 underline"
            >
              Reset to default prompt
            </button>
          </div>
          <textarea
            value={info.systemPrompt || ""}
            onChange={(e) => setInfo({ ...info, systemPrompt: e.target.value })}
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-mono"
            placeholder={defaultSystemPrompt}
          />
          <p className="text-xs text-gray-400 mt-2">
            Leave empty to use the default prompt. The AI will automatically have access to company info and product data from the database.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {saving ? "Saving..." : "Save Company Info"}
          </button>
        </div>
      </div>
    </div>
  );
}
