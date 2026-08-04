import { useRef, useState } from 'react';
import { ShieldCheck, UserRound, Mail, LogOut, Camera, Loader2, Pencil, Check, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import PageHeader from '../components/PageHeader';
import UserAvatar from '../components/UserAvatar';
import SummaryStat from '../components/SummaryStat';
import { useApplicants } from '../hooks/useApplicants';
import type { AppRole } from '../constants/roles';
import { signOut, uploadProfilePhoto, updateDisplayName } from '../services/authService';
import { displayNameFor } from '../utils/userDisplay';

interface ProfileProps {
  user: User;
  role: AppRole;
  onUserUpdate: () => void;
}

export default function Profile({ user, role, onUserUpdate }: ProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Image must be under 3MB.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      await uploadProfilePhoto(file);
      onUserUpdate();
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function startEditName() {
    setNameInput(displayNameFor(user));
    setNameError('');
    setEditingName(true);
  }

  async function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError('Name cannot be empty.');
      return;
    }
    setSavingName(true);
    setNameError('');
    try {
      await updateDisplayName(trimmed);
      onUserUpdate();
      setEditingName(false);
    } catch {
      setNameError('Could not save name. Please try again.');
    } finally {
      setSavingName(false);
    }
  }

  return (
    <>
      <PageHeader title="Profile" subtitle="Your account details." />
      <div className="app-content">
        <div className="app-card app-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <UserAvatar user={user} size="lg" />
            <button
              type="button"
              className="app-icon-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Change profile photo"
              style={{
                position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, padding: 0,
                borderRadius: '50%', background: 'var(--violet)', color: '#fff',
                border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {uploading ? <Loader2 size={12} className="app-spin" /> : <Camera size={12} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            {editingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  className="app-input"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); saveName(); }
                    if (e.key === 'Escape') { e.preventDefault(); setEditingName(false); }
                  }}
                  disabled={savingName}
                  autoFocus
                  style={{ maxWidth: 220, fontSize: 15, padding: '6px 10px' }}
                />
                <button type="button" className="app-icon-btn" onClick={saveName} disabled={savingName} title="Save" aria-label="Save name">
                  {savingName ? <Loader2 size={15} className="app-spin" /> : <Check size={15} />}
                </button>
                <button type="button" className="app-icon-btn" onClick={() => setEditingName(false)} disabled={savingName} title="Cancel" aria-label="Cancel">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="app-brand-font" style={{ fontWeight: 700, fontSize: 18 }}>{displayNameFor(user)}</div>
                <button type="button" className="app-icon-btn" onClick={startEditName} title="Edit name" aria-label="Edit name">
                  <Pencil size={13} />
                </button>
              </div>
            )}
            {nameError && (
              <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{nameError}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              <Mail size={13} /> {user.email}
            </div>
            <div className="app-role-pill" style={{ marginTop: 10 }}>
              {role === 'admin' ? <ShieldCheck size={12} /> : <UserRound size={12} />}
              {role === 'admin' ? 'Admin' : 'Applicant'}
            </div>
            {uploadError && (
              <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>{uploadError}</div>
            )}
          </div>
          <button className="app-btn app-btn-ghost" onClick={() => signOut()}>
            <LogOut size={15} /> Sign out
          </button>
        </div>

        {role === 'admin' ? <AdminSummary /> : <ApplicantSummary email={user.email} />}
      </div>
    </>
  );
}

function AdminSummary() {
  const { stats, loading } = useApplicants();
  if (loading) return null;
  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div className="app-card-title">At a glance</div>
      </div>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <SummaryStat label="Applicants managed" value={stats.total} />
        <SummaryStat label="Approved" value={stats.approved} />
        <SummaryStat label="Overdue" value={stats.overdue} />
      </div>
    </div>
  );
}

function ApplicantSummary({ email }: { email: string | null }) {
  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div className="app-card-title">How this works</div>
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
        Your dashboard shows the applicant record on file with the email address <strong style={{ color: 'var(--ink)' }}>{email}</strong>.
        If your status looks out of date, reach out to the team that filed your application — only admin can make changes here.
      </p>
    </div>
  );
}
