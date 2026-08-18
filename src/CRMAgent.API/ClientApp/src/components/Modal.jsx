import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#14141a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full flex-shrink-0 ${isDestructive ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
              <AlertCircle size={24} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 px-6 py-4 flex gap-3 justify-end border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition shadow-lg ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-blue-500/25'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertModal({ isOpen, onClose, title, message, variant = 'info' }) {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle size={24} />,
    error: <AlertCircle size={24} />,
    info: <Info size={24} />
  };

  const colors = {
    success: 'bg-emerald-500/20 text-emerald-500',
    error: 'bg-red-500/20 text-red-500',
    info: 'bg-blue-500/20 text-blue-500'
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#14141a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className={`p-3 rounded-full mb-4 ${colors[variant]}`}>
              {icons[variant]}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
