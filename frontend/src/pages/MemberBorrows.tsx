import React, { useState } from 'react';
import { BorrowRecord } from '../types';

const P = {
  pageBg:          '#f5f0e8',
  cardBg:          '#faf7f2',
  cardBorder:      '#c8b89a',
  textPrimary:     '#1e1e1e',
  textSecondary:   '#7a6a55',
  textMuted:       '#a89880',
  inputBg:         '#fff9f2',
  inputBorder:     '#d4c8b0',
  btnPrimary:      '#5c3d1e',
  btnPrimaryTxt:   '#fff9f2',
  btnSecondary:    '#e8e0d0',
  btnSecondaryTxt: '#5c3d1e',
  // status colors
  borrowedBg:      '#dce8f0',
  borrowedTxt:     '#1d5c7a',
  overdueBg:       '#f5ddd8',
  overdueTxt:      '#8b2a1a',
  pendingBg:       '#faecd4',
  pendingTxt:      '#7a4e10',
  returnedBg:      '#d8ead9',
  returnedTxt:     '#245c2a',
  rejectedBg:      '#ede0e0',
  rejectedTxt:     '#6b3030',
  overdueCardBorder: '#c87a6a',
  dotAmber:        '#c47830',
  sectionLabel:    '#8b6f47',
};

interface MemberBorrowsProps {
  borrows: BorrowRecord[];
  onRequest: () => void;
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

const MemberBorrows: React.FC<MemberBorrowsProps> = ({ borrows, onRequest }) => {
  const [statusFilter, setStatusFilter] = useState('');

  const active   = borrows.filter(b => b.status === 'borrowed' || b.status === 'overdue');
  const pending  = borrows.filter(b => b.status === 'pending');
  const returned = borrows.filter(b => b.status === 'returned');
  const rejected = borrows.filter(b => b.status === 'rejected');

  const allFiltered = statusFilter
    ? borrows.filter(b => b.status === statusFilter)
    : null;

  return (
    <div className="page" style={{ background: P.pageBg, minHeight: '100%' }}>
      {/* Header */}
      <div className="page-header" style={{ borderBottom: `1px solid ${P.cardBorder}`, paddingBottom: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ color: P.textPrimary, fontWeight: 600, margin: 0 }}>My Borrows</h1>
          <p style={{ color: P.textSecondary, fontSize: 14, margin: '4px 0 0' }}>
            Track your borrow/return dates and overdue status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              background: P.inputBg,
              border: `1px solid ${P.inputBorder}`,
              borderRadius: 8,
              padding: '8px 14px',
              color: P.textPrimary,
              fontSize: 14,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">All Status</option>
            <option value="borrowed">Borrowed</option>
            <option value="overdue">Overdue</option>
            <option value="pending">Pending</option>
            <option value="returned">Returned</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={onRequest}
            style={{
              background: P.btnPrimary,
              color: P.btnPrimaryTxt,
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            + Request Book
          </button>
        </div>
      </div>

      {allFiltered ? (
        <BorrowTable records={allFiltered} showMember={false} />
      ) : (
        <>
          {/* Currently Borrowed */}
          <section style={{ marginBottom: 32 }}>
            <SectionHeading dot="amber" label="Currently Borrowed" count={active.length} />
            {active.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {active.map(r => <ActiveBorrowCard key={r.id} record={r} />)}
              </div>
            ) : (
              <EmptyCard>
                You have no books currently borrowed.{' '}
                <button
                  onClick={onRequest}
                  style={{ background: 'none', border: 'none', color: P.btnPrimary, fontWeight: 600, cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline', padding: 0 }}
                >
                  Browse available books →
                </button>
              </EmptyCard>
            )}
          </section>

          {/* Pending Requests */}
          {pending.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <SectionHeading dot="amber" label="Pending Approval" count={pending.length} />
              <BorrowTable records={pending} showMember={false} />
            </section>
          )}

          {/* Return History */}
          <section>
            <SectionHeading dot="muted" label="Return History" count={[...returned, ...rejected].length} />
            {[...returned, ...rejected].length > 0 ? (
              <BorrowTable records={[...returned, ...rejected]} showMember={false} />
            ) : (
              <EmptyCard>No returned books yet.</EmptyCard>
            )}
          </section>
        </>
      )}
    </div>
  );
};

// Empty state card
const EmptyCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    background: P.cardBg,
    border: `1.5px solid ${P.cardBorder}`,
    borderRadius: 12,
    padding: 36,
    textAlign: 'center',
    color: P.textMuted,
    fontSize: 14,
    boxShadow: '0 1px 4px rgba(120,90,50,0.08)',
  }}>
    {children}
  </div>
);

// Section heading
const SectionHeading: React.FC<{ dot: 'amber' | 'muted'; label: string; count: number }> = ({ dot, label, count }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  }}>
    <span style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      background: dot === 'amber' ? P.dotAmber : P.textMuted,
    }} />
    <span style={{
      fontSize: 11,
      fontWeight: 700,
      color: P.sectionLabel,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    }}>
      {label}
    </span>
    <span style={{ fontSize: 11, color: P.textMuted, fontWeight: 400 }}>({count})</span>
  </div>
);

// Status badge
const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { bg: string; txt: string; label: string }> = {
    borrowed: { bg: P.borrowedBg,  txt: P.borrowedTxt,  label: 'Borrowed'  },
    overdue:  { bg: P.overdueBg,   txt: P.overdueTxt,   label: 'Overdue'   },
    pending:  { bg: P.pendingBg,   txt: P.pendingTxt,   label: 'Pending'   },
    returned: { bg: P.returnedBg,  txt: P.returnedTxt,  label: 'Returned'  },
    rejected: { bg: P.rejectedBg,  txt: P.rejectedTxt,  label: 'Rejected'  },
  };
  const s = map[status] ?? { bg: P.cardBorder, txt: P.textSecondary, label: status };
  return (
    <span style={{
      fontSize: 12, fontWeight: 700,
      borderRadius: 20, padding: '5px 14px',
      background: s.bg, color: s.txt,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
};

// Active borrow card
const ActiveBorrowCard: React.FC<{ record: BorrowRecord }> = ({ record }) => {
  const isOverdue = record.overdue_days > 0;

  return (
    <div style={{
      background: P.cardBg,
      border: `1.5px solid ${isOverdue ? P.overdueCardBorder : P.cardBorder}`,
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(120,90,50,0.08)',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: P.textPrimary, fontSize: 16, margin: '0 0 2px' }}>
            {record.book_title}
          </p>
          <p style={{ fontSize: 13, color: P.textSecondary, margin: 0 }}>{record.book_author}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 14 }}>
            {[
              { label: 'Borrowed',    labelColor: '#5a7a9a', value: formatDate(record.borrow_date), valueColor: P.textPrimary },
              { label: 'Due Date',    labelColor: isOverdue ? '#8b1a1a' : '#b03a2a', value: formatDate(record.due_date), valueColor: '#1e1e1e' },
              { label: 'Loan Period', labelColor: '#7a9a7a', value: '14 days',                        valueColor: P.textPrimary },
            ].map(({ label, labelColor, value, valueColor }) => (
              <div key={label}>
                <span style={{ fontSize: 11, fontWeight: 700, color: labelColor, display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: valueColor }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <StatusPill status={record.status} />
          {isOverdue ? (
            <span style={{ fontSize: 12, fontWeight: 600, color: P.overdueTxt }}>
              ⚠ {record.overdue_days} day{record.overdue_days !== 1 ? 's' : ''} overdue
            </span>
          ) : (
            record.days_until_due !== null && record.days_until_due >= 0 && (
              <span style={{ fontSize: 12, color: P.textMuted }}>
                {record.days_until_due} day{record.days_until_due !== 1 ? 's' : ''} remaining
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// Borrow history table
export const BorrowTable: React.FC<{ records: BorrowRecord[]; showMember: boolean }> = ({ records, showMember }) => (
  <div style={{
    background: P.cardBg,
    border: `1.5px solid ${P.cardBorder}`,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(120,90,50,0.08)',
  }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#f0e8d8', borderBottom: `1.5px solid ${P.cardBorder}` }}>
          {['Book', ...(showMember ? ['Member'] : []), 'Borrowed', 'Due Date', 'Returned', 'Status'].map(h => (
            <th key={h} style={{
              padding: '11px 16px',
              textAlign: h === 'Status' ? 'center' : 'left',
              fontSize: 11,
              fontWeight: 700,
              color: P.sectionLabel,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((r, i) => (
          <tr
            key={r.id}
            style={{
              borderBottom: i < records.length - 1 ? `1px solid ${P.inputBorder}` : 'none',
              background: r.status === 'overdue' ? '#fdf0ec' : 'transparent',
            }}
          >
            <td style={{ padding: '12px 16px' }}>
              <div style={{ fontWeight: 600, color: P.textPrimary }}>{r.book_title}</div>
              <div style={{ fontSize: 12, color: P.textMuted }}>{r.book_author}</div>
            </td>
            {showMember && (
              <td style={{ padding: '12px 16px', color: P.textSecondary }}>{r.member_name}</td>
            )}
            <td style={{ padding: '12px 16px', color: P.textSecondary }}>{formatDate(r.borrow_date)}</td>
            <td style={{ padding: '12px 16px', color: r.overdue_days > 0 ? P.overdueTxt : P.textSecondary, fontWeight: r.overdue_days > 0 ? 600 : 400 }}>
              {formatDate(r.due_date)}
            </td>
            <td style={{ padding: '12px 16px', color: P.textSecondary }}>{formatDate(r.return_date)}</td>
            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                <StatusPill status={r.status} />
                {r.overdue_days > 0 && (
                  <span style={{ fontSize: 11, color: P.overdueTxt, fontWeight: 600 }}>{r.overdue_days}d overdue</span>
                )}
                {r.status === 'borrowed' && r.days_until_due !== null && r.days_until_due >= 0 && (
                  <span style={{ fontSize: 11, color: P.textMuted }}>{r.days_until_due}d left</span>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MemberBorrows;