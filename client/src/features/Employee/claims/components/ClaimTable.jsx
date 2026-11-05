import React from 'react';
import { Eye, Inbox } from 'lucide-react';
import ClaimStatusBadge from './ClaimStatusBadge';
import { formatINR, formatDate } from '../utils/claimFormatters';

export default function ClaimTable({ claims, loading, onViewDetails }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-slate-100 rounded-lg w-full" />
          <div className="h-14 bg-slate-50 rounded-lg w-full" />
          <div className="h-14 bg-slate-50 rounded-lg w-full" />
          <div className="h-14 bg-slate-50 rounded-lg w-full" />
        </div>
      </div>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No Claims Found</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No claim records match your current filter or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Claim Reference</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Submitted Date</th>
              <th className="py-3.5 px-6 text-right">Amount</th>
              <th className="py-3.5 px-6 text-center">Status</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {claims.map((claim) => (
              <tr 
                key={claim.id} 
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="py-4 px-6 font-semibold text-slate-900">
                  {claim.applicationId}
                </td>
                <td className="py-4 px-6">
                  <span className="font-medium text-slate-700">
                    {claim.claimType} Claim
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-500">
                  {formatDate(claim.createdAt)}
                </td>
                <td className="py-4 px-6 font-semibold text-slate-900 text-right">
                  {formatINR(claim.amount)}
                </td>
                <td className="py-4 px-6 text-center">
                  <ClaimStatusBadge status={claim.status} />
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    type="button"
                    onClick={() => onViewDetails(claim)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#276fb5] hover:text-[#1d548b] bg-blue-50/60 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
