import React, { useState } from 'react';
import { Book } from '../types';
import StatusBadge from '../components/StatusBadge';
import { deleteBook } from '../api';

const PALETTE = {
  pageBg:        '#f5f0e8',   
  cardBg:        '#faf7f2',   
  cardBorder:    '#c8b89a',   
  cardUnavail:   '#f0ebe0',   
  textPrimary:   '#2c2017',   
  textSecondary: '#7a6a55',   
  textMuted:     '#a89880',   
  genreText:     '#8b6f47',   
  inputBg:       '#fff9f2',   
  inputBorder:   '#d4c8b0',   
  btnPrimary:    '#5c3d1e',   
  btnPrimaryTxt: '#fff9f2',
  btnSecondary:  '#e8e0d0',   
  btnSecondaryTxt: '#5c3d1e',
  btnBorrow:     '#3d6b4f',   
  btnBorrowTxt:  '#f0f7f2',
  btnEdit:       '#e8e0d0',
  btnEditTxt:    '#5c3d1e',
  btnDelete:     '#c8b8a2',
  btnDeleteTxt:  '#5c3d1e',
  copiesOk:      '#3d6b4f',
  copiesNone:    '#a05c3b',
  availBadgeBg:  '#d4ead9',
  availBadgeTxt: '#2d6b40',
  unavailBadgeBg:'#f0e0d0',
  unavailBadgeTxt:'#8b4a20',
};

const GENRE_COLORS: Record<string, string> = {
  fiction:     '#9b6ec8',
  non_fiction: '#3a9e8a',
  science:     '#4a7fc1',
  technology:  '#3398b0',
  history:     '#c47830',
  biography:   '#c45880',
  mystery:     '#c44040',
  fantasy:     '#7a50c0',
  romance:     '#c03860',
};
const genreColor = (genre: string) => GENRE_COLORS[genre] || '#8b7a60';

interface BooksProps {
  books: Book[];
  onAdd: () => void;
  onEdit: (book: Book) => void;
  onBorrow: (book: Book) => void;
  onViewDetail: (book: Book) => void;
  onDeleted: (msg: string) => void;
  onError: (msg: string) => void;
  readOnly?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value) || options[0];

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: PALETTE.inputBg,
          border: `1px solid ${open ? PALETTE.btnPrimary : PALETTE.inputBorder}`,
          borderRadius: 8,
          padding: '8px 36px 8px 14px',
          color: PALETTE.textPrimary,
          cursor: 'pointer',
          fontSize: 14,
          whiteSpace: 'nowrap',
          position: 'relative',
          minWidth: 130,
          textAlign: 'left',
        }}
      >
        {selected.label}
        <span style={{
          position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          transition: 'transform 0.15s', fontSize: 10, color: PALETTE.textMuted,
        }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 200,
          background: PALETTE.cardBg,
          border: `1.5px solid ${PALETTE.cardBorder}`,
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(120,90,50,0.12)',
          minWidth: '100%',
          overflow: 'hidden',
        }}>
          {options.map(o => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                padding: '9px 16px',
                fontSize: 14,
                cursor: 'pointer',
                color: o.value === value ? PALETTE.btnPrimary : PALETTE.textPrimary,
                fontWeight: o.value === value ? 600 : 400,
                background: o.value === value ? '#f0e8d8' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0e8d8')}
              onMouseLeave={e => (e.currentTarget.style.background = o.value === value ? '#f0e8d8' : 'transparent')}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Books: React.FC<BooksProps> = ({
  books, onAdd, onEdit, onBorrow, onViewDetail, onDeleted, onError, readOnly,
}) => {
  const [search, setSearch] = useState('');
  const [genre,  setGenre]  = useState('');
  const [avail,  setAvail]  = useState('');

  const filtered = books.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !search || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.toLowerCase().includes(q);
    const matchGenre  = !genre  || b.genre === genre;
    const matchAvail  = !avail  || (avail === 'yes' ? b.is_available : !b.is_available);
    return matchSearch && matchGenre && matchAvail;
  });

  const genres = Array.from(new Set(books.map(b => b.genre)));

  const handleDelete = async (book: Book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    try   { await deleteBook(book.id); onDeleted('Book deleted.'); }
    catch (e: any) { onError(e.response?.data?.error || 'Delete failed.'); }
  };

  return (
    <div className="page" style={{ background: PALETTE.pageBg, minHeight: '100%' }}>
      {/* Page header */}
      <div className="page-header" style={{ borderBottom: `1px solid ${PALETTE.cardBorder}`, paddingBottom: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ color: PALETTE.textPrimary, fontWeight: 600, margin: 0 }}>
            {readOnly ? 'Browse Books' : 'Books'}
          </h1>
          <p className="page-sub" style={{ color: PALETTE.textSecondary, margin: '4px 0 0' }}>
            {books.length} books in catalog
          </p>
        </div>
        {!readOnly && (
          <button
            className="btn-primary"
            onClick={onAdd}
            style={{
              background: PALETTE.btnPrimary,
              color: PALETTE.btnPrimaryTxt,
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Add Book
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="toolbar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <input
          className="search-input"
          placeholder="Search title, author, ISBN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: PALETTE.inputBg,
            border: `1px solid ${PALETTE.inputBorder}`,
            borderRadius: 8,
            padding: '8px 14px',
            color: PALETTE.textPrimary,
            flex: '1 1 220px',
            minWidth: 180,
            outline: 'none',
          }}
        />
        <CustomSelect
          value={genre}
          onChange={setGenre}
          options={[{ value: '', label: 'All Genres' }, ...genres.map(g => ({ value: g, label: g.replace('_', ' ') }))]}
        />
        <CustomSelect
          value={avail}
          onChange={setAvail}
          options={[
            { value: '', label: 'All Status' },
            { value: 'yes', label: 'Available' },
            { value: 'no', label: 'Unavailable' },
          ]}
        />
        {(search || genre || avail) && (
          <button
            className="btn-secondary"
            onClick={() => { setSearch(''); setGenre(''); setAvail(''); }}
            style={{
              background: PALETTE.btnSecondary,
              color: PALETTE.btnSecondaryTxt,
              border: `1px solid ${PALETTE.inputBorder}`,
              borderRadius: 8,
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Book cards grid */}
      <div className="card-grid">
        {filtered.map(book => (
          <BookCard
            key={book.id}
            book={book}
            readOnly={readOnly}
            onBorrow={() => onBorrow(book)}
            onViewDetail={() => onViewDetail(book)}
            onEdit={() => onEdit(book)}
            onDelete={() => handleDelete(book)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ color: PALETTE.textMuted, textAlign: 'center', padding: 40 }}>
            <div className="empty-icon" style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
            <p style={{ margin: 0, color: PALETTE.textPrimary }}>No books found</p>
            <p style={{ fontSize: 13, color: PALETTE.textMuted, marginTop: 4 }}>
              Try different search terms or clear filters.
            </p>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p style={{ color: PALETTE.textMuted, fontSize: 12, marginTop: 8 }}>
          {filtered.length} book{filtered.length !== 1 ? 's' : ''} found
        </p>
      )}
    </div>
  );
};

// Book Card 
interface BookCardProps {
  book: Book;
  readOnly?: boolean;
  onBorrow: () => void;
  onViewDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BookCard: React.FC<BookCardProps> = ({
  book, readOnly, onBorrow, onViewDetail, onEdit, onDelete,
}) => {
  const color = book.genre_color || genreColor(book.genre);

  const cardStyle: React.CSSProperties = {
    background: book.is_available ? PALETTE.cardBg : PALETTE.cardUnavail,
    border: `1.5px solid ${PALETTE.cardBorder}`,
    borderRadius: 12,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    opacity: book.is_available ? 1 : 0.75,
    boxShadow: '0 1px 4px rgba(120, 90, 50, 0.08)',
    transition: 'box-shadow 0.15s',
  };

  return (
    <div className={`book-card ${!book.is_available ? 'book-unavailable' : ''}`} style={cardStyle}>
      {/* Genre colour top bar */}
      <div style={{ height: 4, background: color, margin: '-20px -20px 16px -20px', borderRadius: '12px 12px 0 0' }} />

      {/* Genre label + availability badge on the same row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: PALETTE.genreText }}>
          {book.genre.replace('_', ' ')}
        </div>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 20,
          padding: '2px 10px',
          background: book.is_available ? PALETTE.availBadgeBg : PALETTE.unavailBadgeBg,
          color:      book.is_available ? PALETTE.availBadgeTxt : PALETTE.unavailBadgeTxt,
        }}>
          {book.is_available ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <h3 style={{ margin: '0 0 0px', fontSize: 16, fontWeight: 600, color: PALETTE.textPrimary, lineHeight: 1.1 }}>
        {book.title}
      </h3>
      <p style={{ margin: '0', fontSize: 12, color: PALETTE.textMuted, lineHeight: 1.2 }}>
        ISBN: {book.isbn}{book.published_year && book.published_year > 0 ? `  ·  ${book.published_year}` : ''}
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: PALETTE.textPrimary }}>Author: </span>
        <span style={{ color: PALETTE.textSecondary }}>{book.author}</span>
      </p>
      {book.description && (
        <p style={{ margin: '4px 0 0', fontSize: 13, color: PALETTE.textMuted, lineHeight: 1.5 }}>
          {book.description}
        </p>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: book.available_copies === 0 ? PALETTE.copiesNone : PALETTE.copiesOk,
          whiteSpace: 'nowrap',
        }}>
          {book.available_copies}/{book.total_copies} available
        </span>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {/* Details */}
          <button
            onClick={onViewDetail}
            style={{
              background: PALETTE.btnEdit,
              color: PALETTE.btnEditTxt,
              border: `1px solid ${PALETTE.inputBorder}`,
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Details
          </button>
          {/* Borrow / Request */}
          <button
            onClick={onBorrow}
            disabled={!book.is_available}
            style={{
              background: book.is_available ? PALETTE.btnBorrow : PALETTE.btnEdit,
              color:      book.is_available ? PALETTE.btnBorrowTxt : PALETTE.textMuted,
              border: 'none',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: book.is_available ? 'pointer' : 'not-allowed',
              opacity: book.is_available ? 1 : 0.6,
            }}
          >
            {readOnly ? 'Request' : 'Borrow'}
          </button>
          {/* Admin-only: Edit & Delete */}
          {!readOnly && (
            <>
              <button
                onClick={onEdit}
                style={{
                  background: PALETTE.btnEdit,
                  color: PALETTE.btnEditTxt,
                  border: `1px solid ${PALETTE.inputBorder}`,
                  borderRadius: 6,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                style={{
                  background: PALETTE.btnDelete,
                  color: PALETTE.btnDeleteTxt,
                  border: 'none',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Books;