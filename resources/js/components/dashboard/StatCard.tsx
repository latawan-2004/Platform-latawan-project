import { ArrowDown, ArrowUp, BarChart3 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

type StatCardProps = {
    label: string;
    value: string | number;
    description?: string;
    tone?: 'emerald' | 'amber' | 'slate' | 'rose';
    icon?: 'total' | 'published' | 'draft' | 'archived' | 'categories' | 'fee';
};

const iconMap = {
    total: BarChart3,
    published: ArrowUp,
    draft: ArrowDown,
    archived: ArrowDown,
    categories: BarChart3,
    fee: BarChart3,
};

const toneClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
};

export default function StatCard({
    label,
    value,
    description,
    tone = 'emerald',
    icon = 'total',
}: StatCardProps) {
    const Icon = iconMap[icon];

    return (
        <Card className="border-stone-200/80 bg-[#fffdf8] shadow-[0_10px_30px_-24px_rgba(31,61,48,0.8)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_35px_-24px_rgba(31,61,48,0.8)]">
            <CardContent className="flex items-start justify-between gap-4 pt-6">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-stone-600">
                        {label}
                    </p>
                    <p className="text-3xl font-semibold tracking-tight text-emerald-950">
                        {value}
                    </p>
                    {description ? (
                        <p className="text-xs text-stone-500">{description}</p>
                    ) : null}
                </div>
                <div className={`rounded-xl p-3 ring-1 ${toneClasses[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    );
}
