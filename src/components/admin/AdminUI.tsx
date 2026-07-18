/**
 * AdminUI.tsx — Shared dark-luxury UI primitives for the admin panel.
 * Import these in Products, Orders, Blogs, Customers, Users pages
 * to keep the dark aesthetic consistent across all admin pages.
 */

import { Loader2 } from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────
export const A = {
  gold:       '#C9A96E',
  goldDim:    'rgba(201,169,110,0.12)',
  goldBorder: 'rgba(201,169,110,0.18)',
  surface:    'rgba(255,255,255,0.03)',
  border:     'rgba(201,169,110,0.08)',
  borderHover:'rgba(201,169,110,0.22)',
  text:       'rgba(255,255,255,0.72)',
  textDim:    'rgba(255,255,255,0.28)',
  textFaint:  'rgba(255,255,255,0.14)',
  red:        '#f87171',
  green:      '#34D399',
  bg:         '#0f0d0a',
};

// ─── Page wrapper ─────────────────────────────────────────
export const APage = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-6 pb-4">{children}</div>
);

// ─── Page header ──────────────────────────────────────────
export const AHeader = ({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between admin-fade-up" style={{ opacity: 0 }}>
    <div>
      <p className="mb-1 font-sans text-[9px] uppercase tracking-[0.3em]" style={{ color: A.gold }}>
        Divine Interior
      </p>
      <h1 className="font-display text-2xl font-light text-white">{title}</h1>
      {subtitle && (
        <p className="mt-1 font-sans text-xs" style={{ color: A.textDim }}>{subtitle}</p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// ─── Gold button ──────────────────────────────────────────
export const AGoldBtn = ({
  children, onClick, disabled, type = 'button', className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`admin-btn-gold flex items-center gap-2 px-5 h-10 ${className}`}
  >
    {children}
  </button>
);

// ─── Ghost button ─────────────────────────────────────────
export const AGhostBtn = ({
  children, onClick, disabled, type = 'button', className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-4 h-10 rounded-xl font-sans text-[11px] font-semibold uppercase tracking-wider transition-all disabled:opacity-40 ${className}`}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid rgba(255,255,255,0.10)`,
      color: A.text,
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLButtonElement).style.borderColor = A.goldBorder;
      (e.currentTarget as HTMLButtonElement).style.color = A.gold;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.10)';
      (e.currentTarget as HTMLButtonElement).style.color = A.text;
    }}
  >
    {children}
  </button>
);

// ─── Card ─────────────────────────────────────────────────
export const ACard = ({
  children, className = '', style = {},
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`admin-card admin-fade-up ${className}`} style={{ opacity: 0, ...style }}>
    {children}
  </div>
);

// ─── Search input ─────────────────────────────────────────
export const ASearch = ({
  value, onChange, placeholder = 'Search…',
}: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="relative">
    <svg
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
      style={{ color: A.textFaint }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="admin-input w-full h-10 pl-10 pr-4 font-sans text-sm"
    />
  </div>
);

// ─── Select ───────────────────────────────────────────────
export const ASelect = ({
  value, onChange, children, className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`admin-input h-10 px-3 font-sans text-sm appearance-none cursor-pointer ${className}`}
  >
    {children}
  </select>
);

// ─── Table ────────────────────────────────────────────────
export const ATable = ({
  headers, children, empty,
}: {
  headers: string[];
  children: React.ReactNode;
  empty?: React.ReactNode;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {headers.map(h => (
            <th
              key={h}
              className="pb-3 pr-5 text-left font-sans text-[10px] uppercase tracking-[0.2em]"
              style={{ color: A.textDim }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
    {!children && empty}
  </div>
);

// ─── Table row ────────────────────────────────────────────
export const ATr = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <tr
    className="admin-row cursor-default"
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : {}}
  >
    {children}
  </tr>
);

// ─── Table cell ───────────────────────────────────────────
export const ATd = ({
  children, className = '', gold = false, dim = false,
}: {
  children: React.ReactNode; className?: string; gold?: boolean; dim?: boolean;
}) => (
  <td
    className={`py-3.5 pr-5 font-sans text-xs ${className}`}
    style={{ color: gold ? A.gold : dim ? A.textDim : A.text }}
  >
    {children}
  </td>
);

// ─── Empty state ──────────────────────────────────────────
export const AEmpty = ({
  icon: Icon, title, subtitle, action,
}: {
  icon: React.ElementType; title: string; subtitle?: string; action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div
      className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
      style={{ background: A.goldDim, border: `1px solid ${A.goldBorder}` }}
    >
      <Icon className="h-7 w-7" style={{ color: A.gold }} />
    </div>
    <p className="font-display text-lg font-light text-white/60">{title}</p>
    {subtitle && <p className="mt-1 font-sans text-xs" style={{ color: A.textDim }}>{subtitle}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// ─── Loading spinner ──────────────────────────────────────
export const ALoader = () => (
  <div className="flex h-48 items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin" style={{ color: A.gold }} />
  </div>
);

// ─── Form label ───────────────────────────────────────────
export const ALabel = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
  <label
    htmlFor={htmlFor}
    className="font-sans text-[10px] uppercase tracking-[0.25em]"
    style={{ color: A.textDim }}
  >
    {children}
  </label>
);

// ─── Form input ───────────────────────────────────────────
export const AInput = ({
  id, type = 'text', placeholder, className = '', error, ...rest
}: {
  id?: string; type?: string; placeholder?: string;
  className?: string; error?: string;
  [key: string]: any;
}) => (
  <div>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      className={`admin-input w-full h-10 px-4 font-sans text-sm ${className}`}
      {...rest}
    />
    {error && <p className="mt-1 font-sans text-xs" style={{ color: A.red }}>{error}</p>}
  </div>
);

// ─── Form textarea ────────────────────────────────────────
export const ATextarea = ({
  id, placeholder, rows = 3, className = '', error, ...rest
}: {
  id?: string; placeholder?: string; rows?: number;
  className?: string; error?: string;
  [key: string]: any;
}) => (
  <div>
    <textarea
      id={id}
      rows={rows}
      placeholder={placeholder}
      className={`admin-input w-full px-4 py-3 font-sans text-sm resize-none ${className}`}
      {...rest}
    />
    {error && <p className="mt-1 font-sans text-xs" style={{ color: A.red }}>{error}</p>}
  </div>
);

// ─── Dialog wrapper ───────────────────────────────────────
export const ADialogBody = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-4 pt-2">{children}</div>
);

// ─── Field group ──────────────────────────────────────────
export const AField = ({
  label, htmlFor, children, error,
}: {
  label: string; htmlFor?: string; children: React.ReactNode; error?: string;
}) => (
  <div className="space-y-1.5">
    <ALabel htmlFor={htmlFor}>{label}</ALabel>
    {children}
    {error && <p className="font-sans text-xs" style={{ color: A.red }}>{error}</p>}
  </div>
);

// ─── Toggle ───────────────────────────────────────────────
export const AToggle = ({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label?: string }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-5 w-9 rounded-full transition-all duration-200"
      style={{
        background: checked
          ? 'linear-gradient(135deg, #C9A96E, #8B6914)'
          : 'rgba(255,255,255,0.10)',
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: checked ? '18px' : '2px' }}
      />
    </button>
    {label && (
      <span className="font-sans text-sm" style={{ color: A.text }}>{label}</span>
    )}
  </label>
);

// ─── Status badge map (for use in Orders / Blogs pages) ──
export const ORDER_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  pending:    { bg: 'rgba(251,191,36,0.12)',  text: '#FBBf24', label: 'Pending'    },
  confirmed:  { bg: 'rgba(96,165,250,0.12)',  text: '#60A5FA', label: 'Confirmed'  },
  processing: { bg: 'rgba(129,140,248,0.12)', text: '#818CF8', label: 'Processing' },
  shipped:    { bg: 'rgba(167,139,250,0.12)', text: '#A78BFA', label: 'Shipped'    },
  delivered:  { bg: 'rgba(52,211,153,0.12)',  text: '#34D399', label: 'Delivered'  },
  cancelled:  { bg: 'rgba(248,113,113,0.12)', text: '#F87171', label: 'Cancelled'  },
  refunded:   { bg: 'rgba(156,163,175,0.12)', text: '#9CA3AF', label: 'Refunded'   },
};

export const PAYMENT_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  pending:  { bg: 'rgba(251,191,36,0.12)',  text: '#FBBf24', label: 'Pending'  },
  paid:     { bg: 'rgba(52,211,153,0.12)',  text: '#34D399', label: 'Paid'     },
  failed:   { bg: 'rgba(248,113,113,0.12)', text: '#F87171', label: 'Failed'   },
  refunded: { bg: 'rgba(156,163,175,0.12)', text: '#9CA3AF', label: 'Refunded' },
};

export const BLOG_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  draft:     { bg: 'rgba(156,163,175,0.12)', text: '#9CA3AF', label: 'Draft'     },
  published: { bg: 'rgba(52,211,153,0.12)',  text: '#34D399', label: 'Published' },
  archived:  { bg: 'rgba(251,191,36,0.12)',  text: '#FBBf24', label: 'Archived'  },
};

export const ABadge = ({ cfg }: { cfg: { bg: string; text: string; label: string } }) => (
  <span
    className="admin-badge"
    style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.text}22` }}
  >
    {cfg.label}
  </span>
);
