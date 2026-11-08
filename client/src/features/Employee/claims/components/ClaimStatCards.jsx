import React from 'react';
import { FileText, Clock, CheckCircle2, IndianRupee } from 'lucide-react';
import { formatINR } from '../utils/claimFormatters';

export default function ClaimStatCards({ stats, loading }) {
  const cards = [
    {
      id: 'total',
      title: 'Total Claims',
      value: loading ? '—' : (stats?.totalCount ?? 0),
      subtitle: 'All submitted claims',
      icon: FileText,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      id: 'pending',
      title: 'Pending Review',
      value: loading ? '—' : (stats?.pendingCount ?? 0),
      subtitle: 'Awaiting a decision',
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      id: 'approved',
      title: 'Approved Claims',
      value: loading ? '—' : (stats?.approvedCount ?? 0),
      subtitle: 'Approved, sanctioned or paid',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      id: 'value',
      title: 'Total Claim Value',
      value: loading ? '—' : formatINR(stats?.totalValue ?? 0),
      subtitle: `Approved value: ${formatINR(stats?.approvedValue ?? 0)}`,
      icon: IndianRupee,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-700 tracking-wide">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <p className="text-xs text-slate-400 mt-2 font-normal">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
