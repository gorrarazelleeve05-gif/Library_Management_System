// LOCATION: frontend/src/modals/ProfileModal.tsx

import React, { useState, useRef } from 'react';
import { AuthUser } from '../types';
import { ModalWrapper, FormField } from '../components/ModalWrapper';
import API from '../api/books';

interface ProfileModalProps {
  user: AuthUser;
  onClose: () => void;
  onSaved: (updated: AuthUser, photoUrl?: string) => void;
}

const MEMBER_TYPES = ['Student', 'Faculty', 'Staff', 'Researcher', 'Community Member', 'Other'];

// Compress to 160px JPEG so it is small enough for the database
const compress = (dataUrl: string): Promise<string> =>
  new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const MAX = 160;
      const r = Math.min(MAX / img.width, MAX / img.height, 1);
      const c = document.createElement('canvas');
      c.width  = Math.round(img.width  * r);
      c.height = Math.round(img.height * r);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSaved }) => {
  // Load existing profile from user object (populated from backend)
  const [form, setForm] = useState({
    first_name:  user.first_name || '',
    last_name:   user.last_name  || '',
    email:       user.email      || '',
    member_type: (user as any).member_type || '',
    bio:         (user as any).bio         || '',
  });
  const [photo,     setPhoto]     = useState<string | null>((user as any).photo_b64 || null);
  const [error,     setError]     = useState('');
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const compressed = await compress(ev.target?.result as string);
        setPhoto(compressed);
      } catch { setError('Could not process image.'); }
      finally { setUploading(false); }
    };
    reader.onerror = () => { setError('Could not read image.'); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim()) { setError('First name is required.'); return; }
    setSaving(true); setError('');

    try {
      // Save everything to the Django backend — admin reads from same database
      await API.patch('/auth/me/', {
        first_name:  form.first_name.trim(),
        last_name:   form.last_name.trim(),
        email:       form.email.trim(),
        member_type: form.member_type,
        bio:         form.bio,
        photo_b64:   photo || '',
      });

      const updatedUser: AuthUser = {
        ...user,
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim(),
        member_type: form.member_type,
        bio:         form.bio,
        photo_b64:   photo || '',
      } as any;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      onSaved(updatedUser, photo || undefined);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.first_name[0] || user.username[0] || '?').toUpperCase();

  return (
    <ModalWrapper title="Profile Settings" onClose={onClose}>
      <form onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}

        {/* Photo */}
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
          <div onClick={() => !uploading && fileRef.current?.click()}
            title="Click to upload photo"
            style={{ width:80, height:80, borderRadius:'50%',
              background: photo ? 'none' : 'linear-gradient(135deg,#532c2e,#a97954)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:28, fontWeight:700, color:'white',
              cursor: uploading ? 'wait' : 'pointer',
              flexShrink:0, overflow:'hidden', border:'3px solid var(--border)' }}>
            {photo
              ? <img src={photo} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : uploading ? '⏳' : initials}
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:4 }}>Profile Photo</p>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>
              Any image — auto-compressed and saved to the server.
            </p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button type="button" className="btn-secondary" style={{ fontSize:12, padding:'6px 14px' }}
                onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? 'Processing…' : photo ? '🔄 Change Photo' : '📷 Upload Photo'}
              </button>
              {photo && (
                <button type="button"
                  style={{ fontSize:12, padding:'6px 14px', background:'rgba(244,63,94,.1)',
                    border:'1px solid rgba(244,63,94,.3)', color:'var(--rose)', borderRadius:8, cursor:'pointer' }}
                  onClick={() => { setPhoto(null); if (fileRef.current) fileRef.current.value = ''; }}>
                  ✕ Remove
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*"
              style={{ display:'none' }} onChange={handlePhotoChange}/>
          </div>
        </div>

        <div className="form-grid">
          <FormField label="First Name *">
            <input name="first_name" value={form.first_name} onChange={handle} placeholder="First name"/>
          </FormField>
          <FormField label="Last Name">
            <input name="last_name" value={form.last_name} onChange={handle} placeholder="Last name"/>
          </FormField>
        </div>
        <FormField label="Email">
          <input type="email" name="email" value={form.email} onChange={handle} placeholder="your@email.com"/>
        </FormField>
        <FormField label="Member Type">
          <select name="member_type" value={form.member_type} onChange={handle}>
            <option value="">Select member type…</option>
            {MEMBER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Bio">
          <textarea name="bio" value={form.bio} onChange={handle} rows={3}
            placeholder="Tell us a bit about yourself…"/>
        </FormField>

        <div style={{ background:'var(--surface2)', border:'1px solid var(--border)',
          borderRadius:8, padding:'10px 14px', marginBottom:8, fontSize:13, color:'var(--text-muted)' }}>
          <strong style={{ color:'var(--text)' }}>Username:</strong> {user.username}
          &nbsp;·&nbsp;
          <strong style={{ color:'var(--text)' }}>Role:</strong> {user.role}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving || uploading}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default ProfileModal;
