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
import { useLanguage } from '../i18n/LanguageContext';

interface ProfileProps {
  user: User;
  role: AppRole;
  onUserUpdate: () => void;
}

export default function Profile({ user, role, onUserUpdate }: ProfileProps) {
  const { t } = useLanguage();
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
      setUploadError(t('profile.errImageFile'));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadError(t('profile.errImageSize'));
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      await uploadProfilePhoto(file);
      onUserUpdate();
    } catch {
      setUploadError(t('profile.errUploadFailed'));
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
      setNameError(t('profile.errNameEmpty'));
      return;
    }
    setSavingName(true);
    setNameError('');
    try {
      await updateDisplayName(trimmed);
      onUserUpdate();
      setEditingName(false);
    } catch {
      setNameError(t('profile.errNameSave'));
    } finally {
      setSavingName(false);
    }
  }

  return (
    <>
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />
      <div className="app-content">
        <div className="app-card app-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <UserAvatar user={user} size="lg" />
            <button
              type="button"
              className="app-icon-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title={t('profile.changePhoto')}
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
                <button type="button" className="app-icon-btn" onClick={saveName} disabled={savingName} title={t('profile.saveName')} aria-label={t('profile.saveName')}>
                  {savingName ? <Loader2 size={15} className="app-spin" /> : <Check size={15} />}
                </button>
                <button type="button" className="app-icon-btn" onClick={() => setEditingName(false)} disabled={savingName} title={t('profile.cancelEdit')} aria-label={t('profile.cancelEdit')}>
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="app-brand-font" style={{ fontWeight: 700, fontSize: 18 }}>{displayNameFor(user)}</div>
                <button type="button" className="app-icon-btn" onClick={startEditName} title={t('profile.editName')} aria-label={t('profile.editName')}>
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
              {role === 'admin' ? t('profile.admin') : t('profile.applicant')}
            </div>
            {uploadError && (
              <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>{uploadError}</div>
            )}
          </div>
          <button className="app-btn app-btn-ghost" onClick={() => signOut()}>
            <LogOut size={15} /> {t('profile.signOut')}
          </button>
        </div>

        {role === 'admin' ? <AdminSummary /> : <ApplicantSummary email={user.email} />}
      </div>
    </>
  );
}

function AdminSummary() {
  const { t } = useLanguage();
  const { stats, loading } = useApplicants();
  if (loading) return null;
  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div className="app-card-title">{t('profile.atAGlance')}</div>
      </div>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <SummaryStat label={t('profile.applicantsManaged')} value={stats.total} />
        <SummaryStat label={t('profile.roadmapComplete')} value={stats.approved} />
        <SummaryStat label={t('profile.overdue')} value={stats.overdue} />
      </div>
    </div>
  );
}

// Editing your details now happens per-application on the "My Status"
// dashboard — unambiguous even when you own more than one application
// record — so this is informational only.
function ApplicantSummary({ email }: { email: string | null }) {
  const { t } = useLanguage();
  return (
    <div className="app-card app-card-pad">
      <div className="app-card-head">
        <div className="app-card-title">{t('profile.howThisWorks')}</div>
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
        {t('profile.howItWorksBody', { email: email ?? '' })}
      </p>
    </div>
  );
}
