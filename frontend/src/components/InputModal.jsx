import React, { useState } from 'react';

const InputModal = ({ isOpen, onClose, onSubmit, title, label, placeholder, type = 'text', required = true }) => {
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (required && !value) return;
    onSubmit(value);
    setValue('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">{label}</label>
            <input
              type={type}
              required={required}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setValue('');
                onClose();
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputModal;
