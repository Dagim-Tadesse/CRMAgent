import React from 'react';

export function Loader({ fullScreen = false, message = "Loading..." }) {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      {/* Premium Multi-ring Spinner */}
      <div className="relative w-16 h-16">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin duration-1000" />
        
        {/* Inner Ring (Reverse rotation) */}
        <div className="absolute inset-2 rounded-full border-4 border-t-purple-400 border-r-blue-400 border-b-transparent border-l-transparent animate-spin duration-700 reverse-spin" />
        
        {/* Core Glowing Orb */}
        <div className="absolute inset-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
      </div>

      {/* Message */}
      <p className="text-gray-400 text-sm font-medium tracking-wide animate-pulse">
        {message}
      </p>

      {/* Tailwind helper class for reverse spin if not predefined */}
      <style>{`
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .reverse-spin {
          animation: reverse-spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f] z-50 flex items-center justify-center">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[400px]">
      {loaderContent}
    </div>
  );
}

export default Loader;
