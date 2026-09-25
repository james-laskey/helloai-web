import React, { useState } from 'react';
import { authApi } from '../services/authApi';

export const AuthScreen = ({ onAuthComplete }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await authApi.login(email, password);

      if (response.success) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('userData', JSON.stringify(response.user));
        onAuthComplete(response.user);
      } else {
        setError(response.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('userData', JSON.stringify(response.user));
        onAuthComplete(response.user);
      } else {
        setError(response.message || 'Could not create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Signup failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setName('');
    setError('');
  };

  return (
    <div className="nb-container" style={{ 
      background: 'var(--nb-purple)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--nb-space-lg)'
    }}>
      <div className="nb-card" style={{ 
        maxWidth: '450px', 
        width: '100%',
        background: 'var(--nb-white)'
      }}>
        {/* Header */}
        <div className="nb-text-center nb-mb-xl">
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto var(--nb-space-md)',
            background: 'var(--nb-yellow)',
            border: 'var(--nb-border-thick)',
            boxShadow: 'var(--nb-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem'
          }}>
            🗣️
          </div>
          <h1 className="nb-heading nb-heading-lg">Hello Ai</h1>
          <p className="nb-text nb-text-muted">The "speak easy" Language Learning App</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'var(--nb-red)',
            color: 'var(--nb-white)',
            padding: 'var(--nb-space-md)',
            border: 'var(--nb-border)',
            boxShadow: 'var(--nb-shadow-sm)',
            marginBottom: 'var(--nb-space-lg)',
            fontWeight: '600'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
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
                    fontSize: '1.25rem'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
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
                  <span className="nb-spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }} />
                  Loading...
                </span>
              ) : (
                mode === 'login' ? 'Login' : 'Sign Up'
              )}
            </button>
          </div>
        </form>

        {/* Toggle Mode */}
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
            textDecoration: 'underline'
          }}
        >
          {mode === 'login'
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};