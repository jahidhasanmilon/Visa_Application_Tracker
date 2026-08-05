import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import {
  signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, resetPassword, authErrorKey, isNoAccountError,
} from '../../services/authService';
import { useLanguage } from '../../i18n/LanguageContext';

interface AuthFormProps {
  title: string;
  subtitle: string;
  switchTo?: { to: string; label: string };
  allowSignUp?: boolean;
  /** Return an error message to reject this account right after sign-in (and sign it back out). */
  guard?: (email: string | null) => string | null;
}

export default function AuthForm({ title, subtitle, switchTo, allowSignUp = true, guard }: AuthFormProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [noAccountHint, setNoAccountHint] = useState(false);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  function switchMode(next: 'signin' | 'signup' | 'reset') {
    setMode(next);
    setError('');
    setNoAccountHint(false);
    setNotice('');
  }

  async function afterAuth(signedInEmail: string | null) {
    if (guard) {
      const rejection = guard(signedInEmail);
      if (rejection) {
        await signOut();
        setError(rejection);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNoAccountHint(false);
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'reset') {
        await resetPassword(email);
        setNotice(t('login.resetSent', { email }));
      } else {
        const cred = mode === 'signin'
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password);
        await afterAuth(cred.user.email);
      }
    } catch (err) {
      const code = (err as { code?: string }).code || '';
      setError(t(authErrorKey(code)));
      setNoAccountHint(mode === 'signin' && isNoAccountError(code));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setNoAccountHint(false);
    setBusy(true);
    try {
      const cred = await signInWithGoogle();
      await afterAuth(cred.user.email);
    } catch (err) {
      const code = (err as { code?: string }).code || '';
      setError(t(authErrorKey(code)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="app-page-title" style={{ marginBottom: 4 }}>
        {mode === 'reset' ? t('login.resetTitle') : title}
      </div>
      <div style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 24 }}>
        {mode === 'reset' ? t('login.resetSub') : subtitle}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="app-field">
          <label>{t('login.email')}</label>
          <div className="app-input-wrap">
            <Mail size={16} />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
        </div>
        {mode !== 'reset' && (
          <div className="app-field">
            <label>{t('login.password')}</label>
            <div className="app-input-wrap">
              <Lock size={16} />
              <input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {mode === 'signin' && (
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <a href="#" onClick={(e) => { e.preventDefault(); switchMode('reset'); }} style={{ fontSize: 12.5, color: 'var(--muted)', textDecoration: 'none' }}>
                  {t('login.forgotPassword')}
                </a>
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>
            {noAccountHint && allowSignUp && (
              <a href="#" onClick={(e) => { e.preventDefault(); switchMode('signup'); }} style={{ display: 'inline-block', marginTop: 4, fontSize: 12.5, fontWeight: 600, color: 'var(--violet)', textDecoration: 'none' }}>
                {t('login.createAccountInstead')}
              </a>
            )}
          </div>
        )}
        {notice && <div style={{ color: 'var(--success)', fontSize: 13, marginBottom: 14 }}>{notice}</div>}

        <button className="app-btn app-btn-primary app-btn-block" type="submit" disabled={busy}>
          {busy ? t('login.pleaseWait') : mode === 'signin' ? t('login.signIn') : mode === 'signup' ? t('login.signUp') : t('login.sendResetLink')}
        </button>
      </form>

      {mode === 'reset' ? (
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--muted)' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); switchMode('signin'); }} style={{ color: 'var(--ink)', fontWeight: 600 }}>{t('login.backToSignIn')}</a>
        </div>
      ) : (
        <>
          <div className="app-divider-text">{t('login.or')}</div>

          <button className="app-btn app-btn-ghost app-btn-block" onClick={handleGoogle} disabled={busy}>
            {t('login.google')}
          </button>

          {allowSignUp && (
            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--muted)' }}>
              {mode === 'signin' ? (
                <>{t('login.noAccount')}{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); switchMode('signup'); }} style={{ color: 'var(--ink)', fontWeight: 600 }}>{t('login.signUpLink')}</a>
                </>
              ) : (
                <>{t('login.haveAccount')}{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); switchMode('signin'); }} style={{ color: 'var(--ink)', fontWeight: 600 }}>{t('login.signIn')}</a>
                </>
              )}
            </div>
          )}
        </>
      )}

      {switchTo && (
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12.5 }}>
          <Link to={switchTo.to} style={{ color: 'var(--violet)', fontWeight: 600, textDecoration: 'none' }}>{switchTo.label}</Link>
        </div>
      )}
    </div>
  );
}
