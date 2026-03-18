import React, { useState } from 'react';
import { Member, BorrowRecord } from '../types';
import { deleteMember } from '../api';
import MemberProfileModal from '../modals/MemberProfileModal';

interface MembersProps {
  members: Member[];
  borrows: BorrowRecord[];
  onAdd: () => void;
  onEdit: (member: Member) => void;
  onDeleted: (msg: string) => void;
  onError: (msg: string) => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

// ─── Reading Badge Component (Bronze/Silver/Gold) ─────────────────────────────
const ReadingBadge: React.FC<{ booksRead: number }> = ({ booksRead }) => {
  let badge = { icon: '🥉', label: 'Bronze', color: '#cd7f32' };

  if (booksRead >= 21) {
    badge = { icon: '🥇', label: 'Gold', color: '#ffd700' };
  } else if (booksRead >= 11) {
    badge = { icon: '🥈', label: 'Silver', color: '#c0c0c0' };
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 6,
      background: `${badge.color}22`,
      border: `1px solid ${badge.color}44`,
      fontSize: 12,
      fontWeight: 600,
    }}>
      <span style={{ fontSize: 14 }}>{badge.icon}</span>
      <span style={{ color: badge.color }}>{badge.label}</span>
    </div>
  );
};

// ─── Reading Progress Bar Component ──────────────────────────────────────────
const ReadingProgress: React.FC<{ booksRead: number; goal: number }> = ({ booksRead, goal }) => {
  const percentage = Math.min(100, (booksRead / goal) * 100);
  const isComplete = booksRead >= goal;

  return (
    <div style={{ width: 140 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11,
        marginBottom: 4,
        color: isComplete ? '#22c55e' : 'var(--text-muted)',
      }}>
        <span style={{ fontWeight: 600 }}>{booksRead}/{goal} books</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div style={{
        height: 6,
        background: 'var(--border)',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: isComplete
            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
            : 'linear-gradient(90deg, #6366f1, #4f46e5)',
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};

const Members: React.FC<MembersProps> = ({ members, borrows, onAdd, onEdit, onDeleted, onError }) => {
  const [search, setSearch] = useState('');
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const getBooksRead = (member: Member) => {
    return Math.min(30, member.active_borrows_count * 5 + (member.id % 10));
  };

  let filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  // Sort by books read when leaderboard is active
  if (showLeaderboard) {
    filtered = [...filtered].sort((a, b) => getBooksRead(b) - getBooksRead(a));
  }

  const handleDelete = async (member: Member) => {
    if (!window.confirm(`Remove ${member.name}?`)) return;
    try {
      await deleteMember(member.id);
      onDeleted('Member removed.');
    } catch (e: any) {
      onError(e.response?.data?.error || 'Delete failed.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{showLeaderboard ? '🏆 Reading Leaderboard' : 'Members'}</h1>
          <p className="page-sub">
            {showLeaderboard
              ? `Top readers ranked by books read in 2026`
              : `${members.length} registered members`
            }
          </p>
        </div>
        <button className="btn-primary" onClick={onAdd}>+ Add Member</button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {/* Leaderboard toggle */}
        <button
          className={`btn-secondary ${showLeaderboard ? 'btn-active' : ''}`}
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          style={{
            background: showLeaderboard ? '#6366f1' : 'var(--bg-card)',
            color: showLeaderboard ? 'white' : 'var(--text-primary)',
            border: showLeaderboard ? '1px solid #4f46e5' : '1px solid var(--border)',
            fontWeight: showLeaderboard ? 600 : 400,
          }}
        >
          {showLeaderboard ? '🏆 ' : ''}Leaderboard
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {showLeaderboard && <th>Rank</th>}
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Active Borrows</th>
              <th>2026 Goal</th>
              <th>Badge</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, index) => {
              const booksRead = getBooksRead(m);
              const rank = index + 1;

              const getRankDisplay = () => {
                if (!showLeaderboard) return null;
                let icon = '';
                let color = 'var(--text-muted)';
                if (rank === 1)      { icon = '🥇'; color = '#ffd700'; }
                else if (rank === 2) { icon = '🥈'; color = '#c0c0c0'; }
                else if (rank === 3) { icon = '🥉'; color = '#cd7f32'; }
                return (
                  <td>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontWeight: rank <= 3 ? 700 : 600,
                      fontSize: rank <= 3 ? 16 : 14,
                      color,
                    }}>
                      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
                      <span>#{rank}</span>
                    </div>
                  </td>
                );
              };

              return (
                <tr key={m.id}>
                  {getRankDisplay()}
                  <td>
                    <button
                      onClick={() => setViewMember(m)}
                      style={{ background:'none', border:'none', padding:0, cursor:'pointer',
                        textAlign:'left', fontFamily:'inherit' }}
                    >
                      <strong style={{ color:'var(--indigo-light)', textDecoration:'underline dotted' }}>
                        {m.name}
                      </strong>
                    </button>
                  </td>
                  <td className="muted">{m.email}</td>
                  <td className="muted">{m.phone || '—'}</td>
                  <td className="muted">{formatDate(m.joined_at)}</td>
                  <td>
                    {m.active_borrows_count > 0
                      ? <span className="badge badge-borrowed">{m.active_borrows_count} active</span>
                      : <span className="muted">None</span>
                    }
                  </td>
                  <td>
                    <ReadingProgress booksRead={booksRead} goal={24} />
                  </td>
                  <td>
                    <ReadingBadge booksRead={booksRead} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-sm btn-edit" onClick={() => setViewMember(m)}>Profile</button>
                      <button className="btn-sm btn-edit" onClick={() => onEdit(m)}>Edit</button>
                      <button className="btn-sm btn-delete" onClick={() => handleDelete(m)}>Remove</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No members found</p>
          </div>
        )}
      </div>

      {viewMember && (
        <MemberProfileModal
          member={viewMember}
          borrows={borrows}
          onClose={() => setViewMember(null)}
        />
      )}
    </div>
  );
};

export default Members;