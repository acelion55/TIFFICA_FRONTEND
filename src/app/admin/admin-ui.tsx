'use client';

import React from 'react';
import {
  Search, RefreshCw, Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, ArrowUpDown, X, Filter, FileSpreadsheet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ─── Design tokens (ERP / Excel-inspired) ─── */
export const ERP = {
  page: 'space-y-4 pt-2',
  panel: 'bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden',
  panelHead: 'px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between',
  input: 'w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400',
  select: 'w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200',
  btn: 'inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border transition-colors',
  btnPrimary: 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900',
  btnSecondary: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
  btnDanger: 'bg-white text-red-700 border-red-200 hover:bg-red-50',
  tableHead: 'bg-slate-800 text-white',
  tableHeadCell: 'text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap',
  tableRow: 'border-b border-slate-100 hover:bg-slate-50/80',
  tableRowAlt: 'bg-slate-50/40',
  kpi: 'bg-white border border-slate-200 rounded-lg px-3 py-2.5 shadow-sm min-w-0',
  kpiLabel: 'text-[10px] font-semibold uppercase text-slate-500 tracking-wide truncate',
  kpiValue: 'text-lg font-bold text-slate-900 mt-0.5 tabular-nums',
  badge: 'inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold uppercase',
};

export const DATE_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'last_week', label: 'Last Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_quarter', label: 'This Quarter' },
  { id: 'last_quarter', label: 'Last Quarter' },
  { id: 'this_year', label: 'This Year' },
  { id: 'custom', label: 'Custom' },
] as const;

export type DatePresetId = (typeof DATE_PRESETS)[number]['id'];

export function getDateRangeFromPreset(preset: DatePresetId, customFrom?: string, customTo?: string): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const iso = (dt: Date) => dt.toISOString().split('T')[0];

  const startOfWeek = (date: Date) => {
    const x = new Date(date);
    const day = x.getDay();
    x.setDate(x.getDate() - day + (day === 0 ? -6 : 1));
    return x;
  };

  switch (preset) {
    case 'today':
      return { from: iso(now), to: iso(now) };
    case 'yesterday': {
      const yd = new Date(now);
      yd.setDate(yd.getDate() - 1);
      return { from: iso(yd), to: iso(yd) };
    }
    case 'this_week': {
      const s = startOfWeek(now);
      return { from: iso(s), to: iso(now) };
    }
    case 'last_week': {
      const s = startOfWeek(now);
      s.setDate(s.getDate() - 7);
      const e = new Date(s);
      e.setDate(e.getDate() + 6);
      return { from: iso(s), to: iso(e) };
    }
    case 'this_month':
      return { from: iso(new Date(y, m, 1)), to: iso(now) };
    case 'last_month':
      return { from: iso(new Date(y, m - 1, 1)), to: iso(new Date(y, m, 0)) };
    case 'this_quarter': {
      const qm = Math.floor(m / 3) * 3;
      return { from: iso(new Date(y, qm, 1)), to: iso(now) };
    }
    case 'last_quarter': {
      const qm = Math.floor(m / 3) * 3 - 3;
      return { from: iso(new Date(y, qm, 1)), to: iso(new Date(y, qm + 3, 0)) };
    }
    case 'this_year':
      return { from: iso(new Date(y, 0, 1)), to: iso(now) };
    case 'custom':
    default:
      return { from: customFrom || '', to: customTo || '' };
  }
}

export function filterByDateRange<T extends { createdAt?: string }>(items: T[], from: string, to: string): T[] {
  if (!from && !to) return items;
  return items.filter(item => {
    if (!item.createdAt) return false;
    const day = new Date(item.createdAt).toISOString().split('T')[0];
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  });
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const body = rows.map(r => r.map(esc).join(','));
  const blob = new Blob([[headers.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminToolbar({
  search,
  setSearch,
  searchPlaceholder = 'Search…',
  onRefresh,
  children,
}: {
  search?: string;
  setSearch?: (v: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`${ERP.panel} p-3`}>
      <div className="flex flex-wrap items-center gap-2">
        {setSearch !== undefined && (
          <div className="flex-1 min-w-[180px] flex items-center gap-2 border border-slate-200 rounded-md px-3 py-2 bg-white">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              value={search ?? ''}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 text-sm focus:outline-none min-w-0"
            />
          </div>
        )}
        {children}
        {onRefresh && (
          <button type="button" onClick={onRefresh} className={`${ERP.btn} ${ERP.btnSecondary}`}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminKpiGrid({ items, className = '' }: { items: { label: string; value: string | number; hint?: string }[]; className?: string }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 ${className}`}>
      {items.map(k => (
        <div key={k.label} className={ERP.kpi}>
          <p className={ERP.kpiLabel}>{k.label}</p>
          <p className={ERP.kpiValue}>{k.value}</p>
          {k.hint && <p className="text-[10px] text-slate-400 mt-0.5">{k.hint}</p>}
        </div>
      ))}
    </div>
  );
}

export function AdminKpiCarousel({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 snap-x md:hidden scrollbar-hide">
      {items.map(k => (
        <div key={k.label} className={`${ERP.kpi} snap-start shrink-0 w-[140px]`}>
          <p className={ERP.kpiLabel}>{k.label}</p>
          <p className={ERP.kpiValue}>{k.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminDatePresets({
  preset,
  setPreset,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}: {
  preset: DatePresetId;
  setPreset: (p: DatePresetId) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
}) {
  React.useEffect(() => {
    if (preset !== 'custom') {
      const { from, to } = getDateRangeFromPreset(preset);
      setDateFrom(from);
      setDateTo(to);
    }
  }, [preset, setDateFrom, setDateTo]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1">
        {DATE_PRESETS.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={`px-2.5 py-1 text-[10px] font-semibold rounded-md border ${
              preset === p.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={`${ERP.input} w-[130px]`} />
          <span className="text-slate-400 text-xs">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={`${ERP.input} w-[130px]`} />
        </>
      )}
    </div>
  );
}

export function AdminFilterPanel({
  open,
  onToggle,
  hasActive,
  title = 'Advanced filters',
  children,
  onApply,
  onReset,
}: {
  open: boolean;
  onToggle: () => void;
  hasActive?: boolean;
  title?: string;
  children: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
}) {
  return (
    <div className={ERP.panel}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 bg-slate-50 border-b border-slate-200 hover:bg-slate-100"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" />
          {title}
          {hasActive && <span className="w-2 h-2 rounded-full bg-slate-800" />}
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">{children}</div>
          {(onApply || onReset) && (
            <div className="px-4 pb-4 flex gap-2 border-t border-slate-100 pt-3">
              {onApply && (
                <button type="button" onClick={onApply} className={`${ERP.btn} ${ERP.btnPrimary} flex-1`}>Apply filters</button>
              )}
              {onReset && (
                <button type="button" onClick={onReset} className={`${ERP.btn} ${ERP.btnSecondary} flex-1`}>Reset</button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function AdminPanel({
  title,
  subtitle,
  actions,
  children,
  noPadding,
}: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <div className={ERP.panel}>
      {(title || actions) && (
        <div className={ERP.panelHead}>
          <div>
            {title && <h3 className="text-sm font-bold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4'}>{children}</div>
    </div>
  );
}

export function MiniBarChart({ data, valueKey = 'value', labelKey = 'label', maxBars = 12 }: {
  data: { label: string; value: number }[];
  valueKey?: string;
  labelKey?: string;
  maxBars?: number;
}) {
  const slice = data.slice(-maxBars);
  const max = Math.max(1, ...slice.map(d => d.value));
  return (
    <div className="flex items-end gap-1 h-24 border-b border-slate-200 pb-1">
      {slice.length === 0 ? (
        <p className="text-xs text-slate-400 w-full text-center self-center">No data</p>
      ) : slice.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div className="w-full bg-slate-200 rounded-t-sm" style={{ height: `${Math.max(4, (d.value / max) * 100)}%`, minHeight: 4 }} title={`${d.label}: ${d.value}`} />
          <span className="text-[9px] text-slate-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

export function AdminDataTable<T extends { _id?: string }>({
  columns,
  rows,
  pageSize = 25,
  emptyMessage = 'No records',
  onRowClick,
  selectable,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  exportFilename,
  exportHeaders,
  exportRows,
}: {
  columns: AdminTableColumn<T>[];
  rows: T[];
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  exportFilename?: string;
  exportHeaders?: string[];
  exportRows?: (string | number)[][];
}) {
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, search]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  React.useEffect(() => setPage(1), [search, rows.length, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <div className={ERP.panel}>
      <div className="px-3 py-2 border-b border-slate-200 flex flex-wrap items-center gap-2 bg-slate-50">
        <div className="flex-1 min-w-[160px] flex items-center gap-2 border border-slate-200 rounded-md px-2 py-1.5 bg-white">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Table search…" className="flex-1 text-xs focus:outline-none" />
        </div>
        {exportFilename && exportHeaders && exportRows && (
          <button
            type="button"
            onClick={() => exportToCsv(exportFilename, exportHeaders, exportRows)}
            className={`${ERP.btn} ${ERP.btnSecondary}`}
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        )}
        <button type="button" className={`${ERP.btn} ${ERP.btnSecondary} opacity-60 cursor-not-allowed`} title="PDF export — configure in report builder">
          <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
        </button>
      </div>
      <div className="overflow-x-auto max-h-[min(70vh,600px)]">
        <table className="w-full text-sm border-collapse">
          <thead className={`${ERP.tableHead} sticky top-0 z-10`}>
            <tr>
              {selectable && (
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={paged.length > 0 && selectedIds?.size === paged.length}
                    onChange={onToggleSelectAll}
                    className="rounded"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`${ERP.tableHeadCell} ${col.sortable ? 'cursor-pointer select-none' : ''} ${col.className || ''}`}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      sortKey === col.key
                        ? (sortDir === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)
                        : <ArrowUpDown className="w-3 h-3 opacity-50" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="py-16 text-center text-xs font-semibold text-slate-400 uppercase">{emptyMessage}</td></tr>
            ) : paged.map((row, i) => (
              <tr
                key={row._id || i}
                className={`${ERP.tableRow} ${i % 2 ? ERP.tableRowAlt : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && row._id && (
                  <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds?.has(row._id)} onChange={() => onToggleSelect?.(row._id!)} className="rounded" />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} className={`px-3 py-2 text-slate-800 ${col.className || ''}`}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
        <span>{sorted.length} records · page {safePage}/{totalPages}</span>
        <div className="flex gap-1">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage(p => p - 1)} className="p-1 border rounded disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1 border rounded disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

export function AdminEmptyState({ message, icon: Icon }: { message: string; icon?: LucideIcon }) {
  return (
    <div className="py-16 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
      {Icon && <Icon className="w-8 h-8 text-slate-300 mx-auto mb-2" />}
      <p className="text-xs font-semibold text-slate-500 uppercase">{message}</p>
    </div>
  );
}

export function AdminStatusBadge({ status, map }: { status: string; map?: Record<string, string> }) {
  const styles = map || {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    delivered: 'bg-green-50 text-green-800 border-green-200',
    cancelled: 'bg-red-50 text-red-800 border-red-200',
    active: 'bg-green-50 text-green-800 border-green-200',
    paid: 'bg-green-50 text-green-800 border-green-200',
  };
  return (
    <span className={`${ERP.badge} ${styles[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status?.replace(/_/g, ' ') || '—'}
    </span>
  );
}

export function AdminSectionTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-0">
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`px-3 py-2 text-xs font-semibold border-b-2 -mb-px ${
            active === t.id ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
