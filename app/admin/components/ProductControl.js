"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  Cog6ToothIcon, 
  EyeIcon, 
  EyeSlashIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

export default function ProductControl() {
  const [settings, setSettings] = useState({
    showMOQ: true,
    showSKU: true,
    productNameCase: 'normal' // 'normal', 'uppercase', 'lowercase'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'productDisplay');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const settingsRef = doc(db, 'settings', 'productDisplay');
      await setDoc(settingsRef, settings, { merge: true });
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleCaseChange = (caseType) => {
    setSettings(prev => ({
      ...prev,
      productNameCase: caseType
    }));
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Cog6ToothIcon className="h-6 w-6 text-gray-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Product Display Control</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Configure how product information is displayed across the application
          </p>
        </div>

        {/* Settings Form */}
        <div className="p-6 space-y-8">
          {/* MOQ and SKU Visibility */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-600" />
              Product Information Visibility
            </h2>
            <p className="text-sm text-gray-600">
              Control which product details are shown on product cards
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MOQ Setting */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Minimum Order Quantity (MOQ)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Show "1 item (MOQ)" on product cards
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('showMOQ')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings.showMOQ ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.showMOQ ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-3 flex items-center">
                  {settings.showMOQ ? (
                    <EyeIcon className="h-4 w-4 text-green-600 mr-2" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <span className={`text-sm ${settings.showMOQ ? 'text-green-600' : 'text-gray-500'}`}>
                    {settings.showMOQ ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* SKU Setting */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Product SKU</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Show "SKU: [product-code]" on product cards
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('showSKU')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings.showSKU ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.showSKU ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-3 flex items-center">
                  {settings.showSKU ? (
                    <EyeIcon className="h-4 w-4 text-green-600 mr-2" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <span className={`text-sm ${settings.showSKU ? 'text-green-600' : 'text-gray-500'}`}>
                    {settings.showSKU ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Name Case */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-600" />
              Product Name Formatting
            </h2>
            <p className="text-sm text-gray-600">
              Choose how product names are displayed on product cards
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {[
                  { value: 'normal', label: 'Normal Case', description: 'Product Name As Stored' },
                  { value: 'uppercase', label: 'UPPERCASE', description: 'ALL PRODUCT NAMES IN CAPS' },
                  { value: 'lowercase', label: 'lowercase', description: 'all product names in lowercase' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="productNameCase"
                      value={option.value}
                      checked={settings.productNameCase === option.value}
                      onChange={() => handleCaseChange(option.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>


          {/* Preview Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Preview</h2>
            <p className="text-sm text-gray-600">
              See how your settings will affect product display
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="max-w-xs">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Product Image</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-sm font-medium text-gray-800 truncate ${
                      settings.productNameCase === 'uppercase' ? 'uppercase' : 
                      settings.productNameCase === 'lowercase' ? 'lowercase' : ''
                    }`}>
                      Sample Product Name
                    </h3>
                    <p className="text-sm text-gray-900 font-semibold">UGX 150,000</p>
                    {settings.showMOQ && (
                      <p className="text-xs text-gray-500">1 item (MOQ)</p>
                    )}
                    {settings.showSKU && (
                      <p className="text-[11px] text-blue-600 italic">SKU: SAMPLE-001</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`flex items-center p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <XCircleIcon className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
