import React, { useState } from 'react';
import { authApi } from '../../services/authApi';
import logo from './logo.svg';

export const AuthSection = ({ onAuthComplete }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');

  // Email verification flow state
  const [pendingVerification, setPendingVerification] = useState(null);
  const [resendStatus, setResendStatus] = useState(null); // null | 'sending' | 'sent' | 'failed'
  const [unverifiedLogin, setUnverifiedLogin] = useState(null);

  /* ---------- Login ---------- */

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setUnverifiedLogin(null);
    setResendStatus(null);

    try {
      const response = await authApi.login(email, password);

      if (response.success) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('userData', JSON.stringify(response.user));
        onAuthComplete(response.user);
        return;
      }

      if (response.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedLogin({ email });
        setError('');
        return;
      }

      setError(response.message || 'Invalid credentials');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Signup ---------- */

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.signup(name, email, password);

      if (response.success) {
        // The backend no longer issues tokens at signup. Show the
        // "check your email" screen instead of logging the user in.
        setPendingVerification({
          email: response.user?.email || email,
          emailSent: response.emailSent !== false,
        });
        return;
      }

      setError(response.message || 'Could not create account');
    } catch (err) {
      console.error('Signup error:', err);
      setError('Signup failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Resend verification ---------- */

  const handleResend = async (targetEmail) => {
    setResendStatus('sending');
    try {
      const result = await authApi.resendVerification(targetEmail);
      setResendStatus(result.success ? 'sent' : 'failed');
    } catch (err) {
      console.error('Resend error:', err);
      setResendStatus('failed');
    }
  };

  /* ---------- Mode toggle ---------- */

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setName('');
    setError('');
    setUnverifiedLogin(null);
    setPendingVerification(null);
    setResendStatus(null);
  };

  /* ---------- Shared header block ---------- */

  const renderHeader = () => (
    <div className="nb-text-center nb-mb-xl">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 'var(--nb-space-md)',
        }}
      >
        <img
          src={logo}
          alt="Hello Ai logo"
          style={{
            width: '50px',
            height: '50px',
            border: 'var(--nb-border)',
            boxShadow: 'var(--nb-shadow-sm)',
            background: 'var(--nb-yellow)',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
      <h3 className="nb-heading nb-heading-lg">
        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
      </h3>
      <p className="nb-text nb-text-muted nb-mt-sm">
        {mode === 'login'
          ? 'Log in to continue your learning journey'
          : 'Sign up free and start learning today'}
      </p>
    </div>
  );

  /* ---------- Check-your-email screen ---------- */

  if (pendingVerification) {
    return (
      <section
        id="signup"
        style={{
          padding: 'var(--nb-space-2xl) var(--nb-space-lg)',
          background: 'var(--nb-purple)',
          borderBottom: 'var(--nb-border-thick)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            className="nb-card"
            style={{
              maxWidth: '500px',
              margin: '0 auto',
              background: 'var(--nb-white)',
              padding: 'var(--nb-space-xl)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto var(--nb-space-md)',
                background: 'var(--nb-lime)',
                border: 'var(--nb-border)',
                boxShadow: 'var(--nb-shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
              }}
            >
              ✉
            </div>

            <h2 className="nb-heading nb-heading-lg nb-mb-md">
              Check your email
            </h2>

            <p className="nb-text nb-mb-lg">
              We sent a verification link to{' '}
              <strong>{pendingVerification.email}</strong>. Click the link to
              activate your account, then come back here to log in.
            </p>

            {!pendingVerification.emailSent && (
              <div
                className="nb-card nb-mb-md"
                style={{
                  background: 'var(--nb-orange)',
                  padding: 'var(--nb-space-md)',
                }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>
                  We could not send the email. Try resending below.
                </p>
              </div>
            )}

            {resendStatus === 'sent' && (
              <div
                className="nb-card nb-mb-md"
                style={{
                  background: 'var(--nb-lime)',
                  padding: 'var(--nb-space-md)',
                }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>
                  Verification email sent. Check your inbox.
                </p>
              </div>
            )}

            {resendStatus === 'failed' && (
              <div
                className="nb-card nb-mb-md"
                style={{
                  background: 'var(--nb-red)',
                  color: 'var(--nb-white)',
                  padding: 'var(--nb-space-md)',
                }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>
                  Could not resend. Try again in a moment.
                </p>
              </div>
            )}

            <div className="nb-flex nb-gap-sm nb-flex-center nb-flex-wrap">
              <button
                className="nb-button"
                onClick={() => handleResend(pendingVerification.email)}
                disabled={resendStatus === 'sending'}
              >
                {resendStatus === 'sending'
                  ? 'Sending...'
                  : 'Resend verification email'}
              </button>
              <button
                className="nb-button nb-button-primary"
                onClick={() => {
                  setPendingVerification(null);
                  setResendStatus(null);
                  setMode('login');
                }}
              >
                Go to login
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- Main login / signup form ---------- */

  return (
    <section
      id="signup"
      style={{
        padding: 'var(--nb-space-2xl) var(--nb-space-lg)',
        background: 'var(--nb-purple)',
        borderBottom: 'var(--nb-border-thick)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="nb-text-center nb-mb-xl">
          <div
            className="nb-badge nb-mb-md"
            style={{ background: 'var(--nb-yellow)' }}
          >
            Get Started
          </div>
          <h2
            className="nb-heading"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--nb-white)',
            }}
          >
            Ready to Speak a New Language?
          </h2>
          <p
            className="nb-text nb-mt-md"
            style={{
              color: 'rgba(255,255,255,0.8)',
              maxWidth: '600px',
              margin: 'var(--nb-space-md) auto 0',
            }}
          >
            Create your free account and start practicing in minutes.
          </p>
        </div>

        <div
          className="nb-card"
          style={{
            maxWidth: '450px',
            margin: '0 auto',
            background: 'var(--nb-white)',
          }}
        >
          {renderHeader()}

          {/* Unverified login banner */}
          {unverifiedLogin && (
            <div
              className="nb-card nb-mb-lg"
              style={{
                background: 'var(--nb-orange)',
                padding: 'var(--nb-space-md)',
              }}
            >
              <p
                style={{
                  margin: 0,
                  marginBottom: 'var(--nb-space-sm)',
                  fontWeight: 700,
                }}
              >
                Your email is not verified yet
              </p>
              <p
                className="nb-text-sm"
                style={{
                  margin: 0,
                  marginBottom: 'var(--nb-space-md)',
                }}
              >
                We sent a verification link to{' '}
                <strong>{unverifiedLogin.email}</strong>. Check your inbox, or
                request a new one below.
              </p>
              <button
                className="nb-button nb-button-full"
                onClick={() => handleResend(unverifiedLogin.email)}
                disabled={resendStatus === 'sending'}
              >
                {resendStatus === 'sending'
                  ? 'Sending...'
                  : 'Resend verification email'}
              </button>
              {resendStatus === 'sent' && (
                <p
                  className="nb-text-sm nb-mt-sm"
                  style={{ margin: 0, fontWeight: 600 }}
                >
                  Sent. Check your inbox.
                </p>
              )}
              {resendStatus === 'failed' && (
                <p
                  className="nb-text-sm nb-mt-sm"
                  style={{ margin: 0, fontWeight: 600 }}
                >
                  Could not send. Try again in a moment.
                </p>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              style={{
                background: 'var(--nb-red)',
                color: 'var(--nb-white)',
                padding: 'var(--nb-space-md)',
                border: 'var(--nb-border)',
                boxShadow: 'var(--nb-shadow-sm)',
                marginBottom: 'var(--nb-space-lg)',
                fontWeight: '600',
              }}
            >
              ⚠ {error}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
            <div className="nb-flex nb-flex-col nb-gap-md">
              {mode === 'signup' && (
                <div>
                  <label className="nb-label">Full Name</label>
                  <input
                    type="text"
                    className="nb-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="nb-label">Email</label>
                <input
                  type="email"
                  className="nb-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="nb-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="nb-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: '50px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                    }}
                  >
                    {showPassword ? '⨂' : '⨀'}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="nb-label">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="nb-input"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                className="nb-button nb-button-primary nb-button-full nb-mt-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="nb-flex nb-flex-center nb-gap-sm">
                    <span
                      className="nb-spinner"
                      style={{
                        width: '20px',
                        height: '20px',
                        borderWidth: '3px',
                      }}
                    />
                    Loading...
                  </span>
                ) : mode === 'login' ? (
                  'Login'
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={toggleMode}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 'var(--nb-space-lg)',
              padding: 'var(--nb-space-md)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--nb-font)',
              fontSize: '0.875rem',
              fontWeight: '600',
              textDecoration: 'underline',
            }}
          >
            {mode === 'login'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Login'}
          </button>

          {mode === 'signup' && (
            <p className="nb-text-xs nb-text-muted nb-text-center nb-mt-md">
              By signing up, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};