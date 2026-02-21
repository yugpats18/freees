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
        return 'bg-accent/20 text-primary';
      case 'in shop':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
      case 'cancelled':
      case 'suspended':
        return 'bg-secondary/20 text-secondary';
      default:
        return 'bg-light text-primary';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
