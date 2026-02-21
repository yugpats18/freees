import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'completed':
      case 'off duty':
        return 'bg-green-100 text-green-800';
      case 'on trip':
      case 'dispatched':
      case 'on duty':
        return 'bg-blue-100 text-blue-800';
      case 'in shop':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
      case 'cancelled':
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
