import React from 'react';
import { ModalWrapper } from '../components/ModalWrapper';

interface RulesModalProps { onClose: () => void; }

const RULES = [
  {
    icon: '📅',
    title: 'Loan Period',
    text: 'Books may be borrowed for up to 14 days. The due date is set upon admin approval of your request.',
  },
  {
    icon: '🔁',
    title: 'Renewals',
    text: 'Contact the librarian to request a renewal before the due date. Renewals are subject to availability.',
  },
  {
    icon: '⚠️',
    title: 'Overdue Books',
    text: 'Books not returned by the due date are marked overdue. Repeated overdue borrowing may affect your borrow privileges.',
  },
  {
    icon: '📚',
    title: 'Borrow Limit',
    text: 'Members may borrow up to 3 books at a time. Requests beyond this limit will be placed on hold.',
  },
  {
    icon: '🛡️',
    title: 'Book Care',
    text: 'Borrowers are responsible for the condition of borrowed books. Damaged or lost books must be reported immediately.',
  },
  {
    icon: '🚫',
    title: 'Non-Transferable',
    text: 'Borrowed books are for the registered member\'s personal use only and may not be transferred to others.',
  },
  {
    icon: '✅',
    title: 'Returning Books',
    text: 'Return books directly to the librarian or through the system. Ensure return is confirmed by the admin.',
  },
  {
    icon: '🔒',
    title: 'Account Responsibility',
    text: 'Keep your login credentials secure. You are responsible for all activity on your account.',
  },
];

const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => (
  <ModalWrapper title="📜 Library Rules & Regulations" onClose={onClose}>
    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
      Please read and follow these rules to ensure a fair and enjoyable experience for all members.
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {RULES.map((rule, i) => (
        <div key={i} style={{
          display: 'flex', gap: 14, alignItems: 'flex-start',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.2 }}>{rule.icon}</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{rule.title}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{rule.text}</p>
          </div>
        </div>
      ))}
    </div>

    <div style={{
      marginTop: 20,
      background: 'rgba(99,102,241,0.08)',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: 10, padding: '12px 16px',
      fontSize: 13, color: 'var(--indigo-light)',
      lineHeight: 1.6,
    }}>
      📌 By using the library system, you agree to abide by these rules. Violations may result in suspension of borrowing privileges.
    </div>

    <div className="modal-actions">
      <button className="btn-primary" onClick={onClose}>I Understand</button>
    </div>
  </ModalWrapper>
);

export default RulesModal;
