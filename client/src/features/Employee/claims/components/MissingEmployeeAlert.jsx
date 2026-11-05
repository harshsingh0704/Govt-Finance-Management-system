import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function MissingEmployeeAlert() {
  return (
    <div 
      role="alert"
      className="w-full bg-red-50/70 border border-red-200/80 rounded-2xl p-4 mb-6 transition-all duration-200"
    >
      <div className="flex items-center justify-center gap-2.5 text-center">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-sm font-medium text-red-600">
          Your employee profile identifier is not available. Sign in again or ask the administrator to link your login account to your employee profile.
        </p>
      </div>
    </div>
  );
}
