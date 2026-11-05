import React from 'react';
import { STATUS_CONFIG } from '../utils/claimFormatters';

export default function ClaimStatusBadge({ status }) {
  const normalized = (status || 'draft').toLowerCase();
  const config = STATUS_CONFIG[normalized] || STATUS_CONFIG.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
