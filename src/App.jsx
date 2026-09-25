import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { QuestionnaireScreen } from './screens/QuestionnaireScreen';
import { TopicSelectionScreen } from './screens/TopicSelectionScreen';
import { LearningScreen } from './screens/LearningScreen';
import { api } from './services/api';
import { getLanguageSpeechCode } from './utils/helpers';
import { LANGUAGE_TOPICS } from './constants/languageTopics';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isTopicSet, setIsTopicSet] = useState(false);
  const [learningMode, setLearningMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [userStats, setUserStats] = useState(null);

  const timerRef = useRef(null);
  const speechSynthRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  // Load saved user data on startup
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedUser = localStorage.getItem('userData');
      const savedPreferences = localStorage.getItem('userPreferences');
      const savedUserId = localStorage.getItem('userId');

      if (savedUser && savedPreferences) {
        const parsedUser = JSON.parse(savedUser);
        const parsedPrefs = JSON.parse(savedPreferences);
        
        setUserData(parsedUser);
        setUserPreferences(parsedPrefs);
        setUserId(savedUserId || parsedUser.id);
        setIsAuthenticated(true);
        setHasCompletedQuestionnaire(true);
        setSelectedLanguage(parsedPrefs.targetLanguage);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAuthComplete = async (user) => {
    setUserData(user);
    setIsAuthenticated(true);
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('userId', user.id);
  };

  const handleQuestionnaireComplete = async (preferences) => {
    setUserPreferences(preferences);
    setHasCompletedQuestionnaire(true);
    setSelectedLanguage(preferences.targetLanguage);
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  };

  const createPersonalizedIntroduction = useCallback((topic, language) => {
    const languageIcon = LANGUAGE_TOPICS[language]?.icon || '📚';
    const proficiencyLevel = userPreferences?.proficiencyLevel || 5;

    if (proficiencyLevel <= 3) {
      return `📖 ${languageIcon} Hello! Today we learn "${topic.name}". ${topic.description}. Example: "${topic.example}". Ready? Let's start!`;
    } else if (proficiencyLevel <= 7) {
      return `👋 ${languageIcon} Great choice! Today we'll explore "${topic.name}" - ${topic.description}. For example: "${topic.example}". Shall we begin?`;
    } else {
      return `✨ ${languageIcon} Excellent selection! Today's topic is "${topic.name}". ${topic.description}. Let me share an example: "${topic.example}". Ready to dive deeper?`;
    }
  }, [userPreferences]);

  const speakText = useCallback(async (text) => {
    if (isMuted || !speechSynthRef.current) return;

    try {
      speechSynthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      let rate = 0.9;
      let pitch = 1.0;

      if (userPreferences) {
        if (userPreferences.proficiencyLevel <= 3) {
          rate = 0.6;
        } else if (userPreferences.proficiencyLevel <= 6) {
          rate = 0.8;
        } else {
          rate = 0.9;
        }

        if (userPreferences.targetLanguage === 'Japanese' || userPreferences.targetLanguage === 'Korean') {
          pitch = 1.05;
        }
      }

      utterance.lang = getLanguageSpeechCode(selectedLanguage);
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthRef.current.speak(utterance);
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  }, [isMuted, selectedLanguage, userPreferences]);

  const stopSpeaking = useCallback(async () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) stopSpeaking();
      return !prev;
    });
  }, [stopSpeaking]);

  const handleStartTutor = async (topic) => {
    setSelectedTopic(topic);
    setLearningMode('tutor');
    setIsTopicSet(true);
    setIsCallActive(true);
    setIsLoading(true);

    try {
      const data = await api.startSession(
        selectedLanguage,
        userId,
        topic.id,
        topic.name,
        topic.concept,
        topic.example,
        userPreferences
      );

      setSessionId(data.sessionId);

      const introduction = data.message || createPersonalizedIntroduction(topic, selectedLanguage);

      const tutorMessage = {
        id: Date.now().toString(),
        text: introduction,
        isUser: false,
        timestamp: Date.now(),
      };

      setMessages([tutorMessage]);
      await speakText(introduction);
    } catch (error) {
      console.error('Error starting tutor session:', error);
      const errorMessage = `I'm sorry, I'm having trouble starting the lesson on ${topic.name}. Let me try again.`;

      const errorTutorMessage = {
        id: Date.now().toString(),
        text: errorMessage,
        isUser: false,
        timestamp: Date.now(),
      };

      setMessages([errorTutorMessage]);
      await speakText(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartFlashcards = (topic) => {
    setSelectedTopic(topic);
    setLearningMode('flashcards');
    setIsTopicSet(true);
  };

  const handleStartQuiz = (topic) => {
    setSelectedTopic(topic);
    setLearningMode('quiz');
    setIsTopicSet(true);
  };

  const generateResponse = async (userInput) => {
    setIsLoading(true);
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await api.sendMessage(
        sessionId,
        userId,
        userInput,
        selectedLanguage,
        selectedTopic,
        conversationHistory
      );

      const assistantMessage = {
        id: Date.now().toString(),
        text: response,
        isUser: false,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      await speakText(response);
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = "I didn't catch that. Can you try again?";
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: errorMessage,
        isUser: false,
        timestamp: Date.now()
      }]);
      await speakText(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreferences = async (newPreferences) => {
    setUserPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
    if (newPreferences.targetLanguage !== selectedLanguage) {
      setSelectedLanguage(newPreferences.targetLanguage);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    setIsAuthenticated(false);
    setHasCompletedQuestionnaire(false);
    setUserData(null);
    setUserPreferences(null);
    setSelectedLanguage('Spanish');
    setSelectedTopic(null);
    setIsTopicSet(false);
    setLearningMode(null);
    setMessages([]);
    setSessionId(null);
  };

  // Timer effect
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isCallActive]);

  const fetchStats = async () => {
    if (!userId) return;
    console.log('Fetching stats for userId:', userId);
    const stats = await api.fetchStats(userId);
    console.log('Stats received:', stats);
    setUserStats(stats);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    await generateResponse(currentInput);
  };

  const handleEndCall = async () => {
    setIsCallActive(false);
    console.log('Session ID:', sessionId);
    console.log('User ID:', userId);
    console.log('Call Duration:', callDuration);
    await api.endSession(sessionId, userId);
    stopSpeaking();
    handleBackToTopics();
  };

  const handleBackToTopics = () => {
    setIsTopicSet(false);
    setSelectedTopic(null);
    setLearningMode(null);
    setMessages([]);
    setSessionId(null);
    setInputText('');
    setIsLoading(false);
    setIsSpeaking(false);
    fetchStats();
  };

  const toggleStats = () => setShowStats(!showStats);

  // Screen routing based on user state
  if (!isAuthenticated) {
    return <AuthScreen onAuthComplete={handleAuthComplete} />;
  }

  if (!hasCompletedQuestionnaire) {
    return <QuestionnaireScreen userData={userData} onComplete={handleQuestionnaireComplete} />;
  }

  if (!isTopicSet) {
    return (
      <TopicSelectionScreen
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        onStartTutor={handleStartTutor}
        onStartFlashcards={handleStartFlashcards}
        onStartQuiz={handleStartQuiz}
        userStats={userStats}
        showStats={showStats}
        onToggleStats={toggleStats}
        onFetchStats={fetchStats}
        userPreferences={userPreferences}
        onUpdatePreferences={handleUpdatePreferences}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LearningScreen
      mode={learningMode}
      selectedLanguage={selectedLanguage}
      selectedTopic={selectedTopic}
      userPreferences={userPreferences}
      onBack={handleBackToTopics}
      messages={messages}
      isLoading={isLoading}
      isSpeaking={isSpeaking}
      isMuted={isMuted}
      callDuration={callDuration}
      inputText={inputText}
      onInputChange={setInputText}
      onSendMessage={handleSendMessage}
      onEndCall={handleEndCall}
      onToggleMute={toggleMute}
      onStopSpeaking={stopSpeaking}
      userStats={userStats}
      showStats={showStats}
      onToggleStats={toggleStats}
      onFetchStats={fetchStats}
      sessionId={sessionId}
      setSessionId={setSessionId}
      setIsTopicSet={setIsTopicSet}
      setMessages={setMessages}
      setSelectedTopic={setSelectedTopic}
      speakText={speakText}
      stopSpeaking={stopSpeaking}
    />
  );
};

export default App;