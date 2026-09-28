// src/screens/VerifyEmailScreen.jsx

import React, { useEffect, useState } from 'react';
import { authApi } from '../services/authApi';

export const VerifyEmailScreen = ({ onDone }) => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    authApi.verifyEmail(token).then((result) => {
      setStatus(result.success ? 'success' : 'error');
      setMessage(result.message);
    });
  }, []);

  return (
    <div className="nb-container nb-flex nb-flex-center" style={{ background: 'var(--nb-purple)' }}>
      <div className="nb-card nb-text-center" style={{ maxWidth: '480px' }}>
        {status === 'verifying' && (
          <>
            <div className="nb-spinner" />
            <p className="nb-mt-md">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="nb-heading nb-heading-lg nb-mb-md">Verified</h2>
            <p className="nb-text nb-mb-lg">{message}</p>
            <button
              className="nb-button nb-button-primary"
              onClick={onDone}
            >
              Go to login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="nb-heading nb-heading-lg nb-mb-md">Verification failed</h2>
            <p className="nb-text nb-mb-lg">{message}</p>
            <button
              className="nb-button nb-button-primary"
              onClick={onDone}
            >
              Back to login
            </button>
          </>
        )}
      </div>
    </div>
  );
};