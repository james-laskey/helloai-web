import React, { useEffect, useRef, useState } from 'react';
import { LANGUAGE_TOPICS } from '../constants/languageTopics';
import { formatDuration, getLanguageSpeechCode } from '../utils/helpers';
import { StatsModal } from '../components/StatsModal';

export const CallScreen = ({
  selectedLanguage,
  selectedTopic,
  messages,
  isLoading,
  isSpeaking,
  isMuted,
  callDuration,
  inputText,
  onInputChange,
  onSendMessage,
  onEndCall,
  onToggleMute,
  onStopSpeaking,
  userStats,
  showStats,
  onToggleStats,
  onFetchStats,
  speakText
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = getLanguageSpeechCode(selectedLanguage);

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
        onInputChange(resultText);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [selectedLanguage, onInputChange]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognition && !isListening && !isMuted && !isLoading && !isSpeaking) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const handleManualVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendMessage = () => {
    if (isListening) {
      stopListening();
    }
    onSendMessage();
  };

  const repeatLastTutorMessage = async () => {
    const lastTutorMessage = [...messages].reverse().find(msg => !msg.isUser);
    if (lastTutorMessage && lastTutorMessage.text) {
      await speakText(lastTutorMessage.text);
    }
  };

  const lastTutorMessage = [...messages].reverse().find(msg => !msg.isUser);
  const shouldShowRepeatButton = lastTutorMessage && !isLoading && !isSpeaking;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--nb-space-lg)' }}>
      <StatsModal visible={showStats} onClose={onToggleStats} userStats={userStats} />

      {/* Top Bar */}
      <div className="nb-card" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--nb-space-md)'
      }}>
        <button onClick={onEndCall} className="nb-button nb-button-danger" style={{ padding: 'var(--nb-space-sm)' }}>
          ✕
        </button>
        <div className="nb-flex nb-flex-center nb-gap-md">
          <span className="nb-heading nb-heading-sm">{formatDuration(callDuration)}</span>
          <span className="nb-badge">{selectedTopic?.name}</span>
        </div>
        <button onClick={onFetchStats} className="nb-button" style={{ padding: 'var(--nb-space-sm)' }}>
          📊
        </button>
      </div>

      {/* Tutor Avatar */}
      <div className="nb-card nb-text-center" style={{ padding: 'var(--nb-space-xl)' }}>
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto var(--nb-space-md)',
          background: 'var(--nb-purple)',
          border: 'var(--nb-border-thick)',
          boxShadow: 'var(--nb-shadow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
          animation: isSpeaking ? 'nb-pulse 1s ease-in-out infinite' : 'none'
        }}>
          {LANGUAGE_TOPICS[selectedLanguage]?.icon || '👩‍🏫'}
        </div>
        <h2 className="nb-heading nb-heading-md">{selectedLanguage} Tutor</h2>
        <p className="nb-text nb-text-muted">Focus: {selectedTopic?.name}</p>
      </div>

      {/* Control Buttons */}
      <div className="nb-flex nb-gap-md nb-flex-center">
        <button
          onClick={onToggleMute}
          className={`nb-button ${isMuted ? 'nb-button-danger' : ''}`}
          style={{ padding: 'var(--nb-space-md)' }}
        >
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>

        <button
          onClick={handleManualVoiceToggle}
          className={`nb-button ${isListening ? 'nb-button-success' : 'nb-button-secondary'}`}
          style={{ padding: 'var(--nb-space-md)' }}
        >
          {isListening ? '⏹️ Stop' : '🎤 Voice'}
        </button>

        <button
          onClick={onStopSpeaking}
          className="nb-button"
          style={{ padding: 'var(--nb-space-md)' }}
        >
          🔉 Volume
        </button>

        <button
          onClick={onEndCall}
          className="nb-button nb-button-danger"
          style={{ padding: 'var(--nb-space-md)' }}
        >
          📞 End
        </button>
      </div>

      {/* Transcript */}
      <div className="nb-card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '300px',
        maxHeight: '500px',
        padding: 0
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--nb-space-sm)',
          padding: 'var(--nb-space-md)',
          borderBottom: 'var(--nb-border)',
          background: 'var(--nb-yellow)'
        }}>
          <span>💬</span>
          <span className="nb-heading nb-heading-sm" style={{ margin: 0 }}>Live Transcript</span>
          {isListening && (
            <span className="nb-badge nb-badge-success" style={{ marginLeft: 'auto' }}>
              🎤 Voice Active
            </span>
          )}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--nb-space-md)'
        }}>
          {messages.length === 0 ? (
            <div className="nb-flex nb-flex-center" style={{ height: '100%', color: '#666' }}>
              <p>Tap the Voice button and start speaking to begin!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isLastTutorMessage = !message.isUser && index === messages.length - 1;
              return (
                <div key={message.id} style={{ marginBottom: 'var(--nb-space-md)' }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: 'var(--nb-space-md)',
                    background: message.isUser ? 'var(--nb-cyan)' : 'var(--nb-white)',
                    border: 'var(--nb-border)',
                    boxShadow: 'var(--nb-shadow-sm)',
                    marginLeft: message.isUser ? 'auto' : 0
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--nb-space-xs)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#666'
                    }}>
                      <span>{message.isUser ? 'You' : `${selectedLanguage} Tutor`}</span>
                      <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="nb-text nb-text-sm" style={{ margin: 0 }}>{message.text}</p>
                  </div>

                  {/* Repeat Button */}
                  {isLastTutorMessage && !message.isUser && shouldShowRepeatButton && (
                    <button
                      onClick={repeatLastTutorMessage}
                      className="nb-badge nb-badge-success"
                      style={{ marginTop: 'var(--nb-space-sm)', cursor: 'pointer' }}
                    >
                      🔄 Repeat
                    </button>
                  )}
                </div>
              );
            })
          )}

          {isLoading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--nb-space-sm)',
              padding: 'var(--nb-space-md)',
              background: 'var(--nb-gray)',
              border: '2px solid var(--nb-black)',
              maxWidth: '200px'
            }}>
              <div className="nb-spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }} />
              <span className="nb-text-sm">Tutor is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text Input */}
        <div style={{
          padding: 'var(--nb-space-md)',
          borderTop: 'var(--nb-border)',
          display: 'flex',
          gap: 'var(--nb-space-sm)'
        }}>
          <input
            type="text"
            className="nb-input"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading || isListening}
          />
          <button
            onClick={handleSendMessage}
            className="nb-button nb-button-primary"
            disabled={!inputText.trim() || isLoading || isListening}
          >
            Send ➤
          </button>
        </div>
      </div>
    </div>
  );
};