import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'bg-secondary/20 text-secondary',
          button: 'bg-secondary hover:bg-secondary/90'
        };
      case 'success':
        return {
          icon: 'bg-green-100 text-green-600',
          button: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          icon: 'bg-yellow-100 text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className={`mx-auto w-16 h-16 ${colors.icon} rounded-full flex items-center justify-center mb-4`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-center mb-4 text-primary">{title}</h2>
        <p className="text-center text-gray-600 mb-6">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 ${colors.button} text-white py-3 rounded-lg font-semibold transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
