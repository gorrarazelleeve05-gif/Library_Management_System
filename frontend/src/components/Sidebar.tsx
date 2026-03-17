import React from 'react';
import { LayoutDashboard, BookOpen, Users, BookMarked, RefreshCw, LogOut } from 'lucide-react';
import { Tab, AuthUser, AdminDashboardStats, MemberDashboardStats } from '../types';
import Logo from './Logo';

interface SidebarProps {
  tab: Tab;
  user: AuthUser;
  stats: AdminDashboardStats | MemberDashboardStats | null;
  onTabChange: (tab: Tab) => void;
  onRefresh: () => void;
  onLogout: () => void;
}

const ADMIN_NAV = [
  { id: 'dashboard' as Tab, icon: <LayoutDashboard size={17}/>, label: 'Dashboard' },
  { id: 'books'     as Tab, icon: <BookOpen size={17}/>,        label: 'Books' },
  { id: 'members'   as Tab, icon: <Users size={17}/>,           label: 'Members' },
  { id: 'borrows'   as Tab, icon: <BookMarked size={17}/>,      label: 'Borrow Records' },
];

const MEMBER_NAV = [
  { id: 'dashboard' as Tab, icon: <LayoutDashboard size={17}/>, label: 'My Dashboard' },
  { id: 'books'     as Tab, icon: <BookOpen size={17}/>,        label: 'Browse Books' },
  { id: 'borrows'   as Tab, icon: <BookMarked size={17}/>,      label: 'My Borrows' },
];

const Sidebar: React.FC<SidebarProps> = ({ tab, user, stats, onTabChange, onRefresh, onLogout }) => {
  const isAdmin  = user.role === 'admin';
  const navItems = isAdmin ? ADMIN_NAV : MEMBER_NAV;
  const pendingCount = isAdmin && stats ? (stats as AdminDashboardStats).pending_count : 0;
  const overdueCount = isAdmin && stats ? (stats as AdminDashboardStats).overdue_count : 0;
  const myOverdue    = !isAdmin && stats ? (stats as MemberDashboardStats).my_overdue  : 0;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <Logo size={36} />
        <div>
          <div className="brand-name">Librarium</div>
          <div className="brand-sub">Management System</div>
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {(user.first_name || user.username)[0].toUpperCase()}
        </div>
        <div className="user-info">
          <div className="user-name">{user.first_name || user.username}</div>
          <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-member'}`}>
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${tab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="nav-icon" style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'borrows' && pendingCount > 0 && (
              <span className="nav-badge nav-badge-amber" style={{ marginLeft: 'auto' }}>{pendingCount} new</span>
            )}
            {item.id === 'borrows' && overdueCount > 0 && pendingCount === 0 && (
              <span className="nav-badge" style={{ marginLeft: 'auto' }}>{overdueCount}</span>
            )}
            {item.id === 'borrows' && myOverdue > 0 && (
              <span className="nav-badge" style={{ marginLeft: 'auto' }}>{myOverdue}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="refresh-btn" onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <RefreshCw size={13}/> Refresh
        </button>
        <button className="logout-btn" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <LogOut size={13}/> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
