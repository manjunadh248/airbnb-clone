import React, { useState } from 'react';
import { X, Languages } from 'lucide-react';

interface GlobeModalProps {
  onClose: () => void;
}

export default function GlobeModal({ onClose }: GlobeModalProps) {
  const [activeTab, setActiveTab] = useState<'language' | 'currency'>('language');
  const [translationEnabled, setTranslationEnabled] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-[1032px] h-[90vh] md:h-auto md:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center p-6 pb-2">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200 flex gap-6">
          <button 
            className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'language' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('language')}
          >
            Language and region
          </button>
          <button 
            className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'currency' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('currency')}
          >
            Currency
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'language' && (
            <div className="flex flex-col gap-10">
              
              {/* Translation Toggle Box */}
              <div className="bg-gray-50 rounded-xl p-6 flex justify-between items-center max-w-[500px]">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-800">Translation</span>
                    <Languages className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-500">Automatically translate descriptions and reviews to English.</span>
                </div>
                <div 
                  className={`w-12 h-8 rounded-full flex items-center p-1 cursor-pointer transition-colors ${translationEnabled ? 'bg-black' : 'bg-gray-300'}`}
                  onClick={() => setTranslationEnabled(!translationEnabled)}
                >
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform flex items-center justify-center ${translationEnabled ? 'translate-x-4' : 'translate-x-0'}`}>
                    {translationEnabled && <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '12px', width: '12px', stroke: 'currentcolor', strokeWidth: '4', overflow: 'visible' }}><path fill="none" d="m4 16.5 8 8 16-16"></path></svg>}
                  </div>
                </div>
              </div>

              {/* Suggested */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Suggested languages and regions</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-4">
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">English</span>
                    <span className="text-sm text-gray-500">United States</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">English</span>
                    <span className="text-sm text-gray-500">United Kingdom</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">हिन्दी</span>
                    <span className="text-sm text-gray-500">भारत</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">ಕನ್ನಡ</span>
                    <span className="text-sm text-gray-500">ಭಾರತ</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">मराठी</span>
                    <span className="text-sm text-gray-500">भारत</span>
                  </div>
                </div>
              </div>

              {/* Choose all */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Choose a language and region</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-4">
                  <div className="flex flex-col border border-gray-800 p-2 rounded-lg cursor-pointer bg-gray-50">
                    <span className="text-sm text-gray-800">English</span>
                    <span className="text-sm text-gray-500">India</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">Azərbaycanca</span>
                    <span className="text-sm text-gray-500">Azərbaycan</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">Bahasa Indonesia</span>
                    <span className="text-sm text-gray-500">Indonesia</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">Bosanski</span>
                    <span className="text-sm text-gray-500">Bosna i Hercegovina</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">Català</span>
                    <span className="text-sm text-gray-500">Espanya</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">Čeština</span>
                    <span className="text-sm text-gray-500">Česká republika</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">Crnogorski</span>
                    <span className="text-sm text-gray-500">Crna Gora</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">Dansk</span>
                    <span className="text-sm text-gray-500">Danmark</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">Deutsch</span>
                    <span className="text-sm text-gray-500">Deutschland</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">Deutsch</span>
                    <span className="text-sm text-gray-500">Österreich</span>
                  </div>
                </div>
              </div>
              
            </div>
          )}

          {activeTab === 'currency' && (
            <div className="flex flex-col gap-10">
              <h2 className="text-2xl font-semibold mb-6">Choose a currency</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-4">
                 <div className="flex flex-col border border-gray-800 p-2 rounded-lg cursor-pointer bg-gray-50">
                    <span className="text-sm text-gray-800">Indian rupee</span>
                    <span className="text-sm text-gray-500">INR - ₹</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">United States dollar</span>
                    <span className="text-sm text-gray-500">USD - $</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">Euro</span>
                    <span className="text-sm text-gray-500">EUR - €</span>
                  </div>
                  <div className="flex flex-col hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-800">British pound</span>
                    <span className="text-sm text-gray-500">GBP - £</span>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
