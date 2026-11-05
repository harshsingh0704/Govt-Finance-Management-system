import React from 'react';
import { Check, Clock, XCircle, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/claimFormatters';

const STAGES = [
  { key: 'draft', label: 'Draft', desc: 'Application prepared' },
  { key: 'submitted', label: 'Submitted', desc: 'Forwarded for processing' },
  { key: 'verified', label: 'Verified', desc: 'Checked by Finance Clerk' },
  { key: 'approved', label: 'Approved', desc: 'Sanctioned by HOD / HOA' },
  { key: 'paid', label: 'Settled', desc: 'Payment disbursed' },
];

export default function ClaimLifecycleTimeline({ status, history = [], createdAt }) {
  const normalizedStatus = (status || 'submitted').toLowerCase();
  const isRejected = normalizedStatus === 'rejected';

  const stageOrder = ['draft', 'submitted', 'verified', 'approved', 'paid'];
  const currentIndex = isRejected ? -1 : stageOrder.indexOf(normalizedStatus);

  return (
    <div className="w-full py-4">
      {isRejected && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-rose-800">Claim Rejected</h4>
            <p className="text-xs text-rose-600 mt-0.5">
              This application has been rejected during verification or review. Refer to the remarks below for details.
            </p>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-2">
          {STAGES.map((stage, idx) => {
            const isCompleted = !isRejected && currentIndex >= idx;
            const isCurrent = !isRejected && currentIndex === idx;

            return (
              <div key={stage.key} className="flex sm:flex-col items-center sm:items-center text-left sm:text-center relative">
                {/* Horizontal connector line on desktop */}
                {idx > 0 && (
                  <div
                    className={`hidden sm:block absolute top-4 -left-1/2 w-full h-0.5 -z-10 ${
                      !isRejected && currentIndex >= idx ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Step indicator node */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border-2 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-white border-[#276fb5] text-[#276fb5] ring-4 ring-blue-50'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 animate-pulse stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Text labels */}
                <div className="ml-4 sm:ml-0 sm:mt-3">
                  <p
                    className={`text-xs font-semibold ${
                      isCompleted
                        ? 'text-slate-900'
                        : isCurrent
                        ? 'text-[#276fb5]'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug hidden sm:block">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
