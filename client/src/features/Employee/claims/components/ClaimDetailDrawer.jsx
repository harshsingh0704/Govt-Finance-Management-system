import React from 'react';
import { X, Calendar, FileText, CheckCircle2, AlertCircle, ExternalLink, IndianRupee } from 'lucide-react';
import ClaimStatusBadge from './ClaimStatusBadge';
import ClaimLifecycleTimeline from './ClaimLifecycleTimeline';
import { formatINR, formatDate } from '../utils/claimFormatters';

export default function ClaimDetailDrawer({ isOpen, onClose, claim }) {
  if (!isOpen || !claim) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {claim.claimType} Claim
                </span>
                <ClaimStatusBadge status={claim.status} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Ref: {claim.applicationId}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Lifecycle Timeline */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Processing Lifecycle
              </h4>
              <ClaimLifecycleTimeline status={claim.status} createdAt={claim.createdAt} />
            </div>

            {/* 2. Financial Summary */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Financial Summary
              </h4>
              <div className="divide-y divide-slate-100 text-sm">
                <div className="py-2.5 flex justify-between items-center text-slate-600">
                  <span>Total Amount Claimed</span>
                  <span className="font-semibold text-slate-900">
                    {formatINR(claim.totalAmount || claim.amount)}
                  </span>
                </div>
                {Boolean(claim.advanceTaken || claim.advanceAmount) && (
                  <div className="py-2.5 flex justify-between items-center text-slate-600">
                    <span>Advance Adjusted</span>
                    <span className="font-semibold text-amber-600">
                      - {formatINR(claim.advanceTaken || claim.advanceAmount)}
                    </span>
                  </div>
                )}
                <div className="pt-3 flex justify-between items-center font-bold text-base text-slate-900">
                  <span>Net Payable Amount</span>
                  <span className="text-[#276fb5] text-lg">
                    {formatINR(claim.amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Claim Context / Particulars */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Application Particulars
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Submission Date</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(claim.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Category</span>
                  <span className="font-semibold text-slate-800">
                    {claim.claimType} Reimbursement
                  </span>
                </div>
                {claim.purpose && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-1">Purpose / Details</span>
                    <span className="font-medium text-slate-700">
                      {claim.purpose}
                    </span>
                  </div>
                )}
                {claim.destination && (
                  <div>
                    <span className="text-slate-400 block mb-1">Destination</span>
                    <span className="font-semibold text-slate-800">
                      {claim.destination}
                    </span>
                  </div>
                )}
                {claim.patientName && (
                  <div>
                    <span className="text-slate-400 block mb-1">Patient Name</span>
                    <span className="font-semibold text-slate-800">
                      {claim.patientName} ({claim.relationship || 'Self'})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Official Remarks (if any) */}
            {claim.remarks && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Official Review Remarks
                  </h4>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {claim.remarks}
                </p>
              </div>
            )}

            {/* 5. Attachments / Receipts */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Supporting Documents
              </h4>
              {claim.documents && claim.documents.length > 0 ? (
                <div className="space-y-2">
                  {claim.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2 text-slate-700 truncate">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{doc.name || `Document_${idx + 1}`}</span>
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#276fb5] hover:text-[#1d548b] flex items-center gap-1 font-semibold text-[11px]"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No attachments uploaded for this claim.</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
