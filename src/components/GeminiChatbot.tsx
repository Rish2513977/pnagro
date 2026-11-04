import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
  Tractor,
  MapPin,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  User,
  ArrowRight,
  Copy,
  Check,
  MessageSquare,
  X,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkle,
} from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  action?: {
    type: 'browse' | 'radar';
    label: string;
  };
}

interface GeminiChatbotProps {
  onNavigateToBrowse?: () => void;
  onNavigateToRadar?: () => void;
  language: 'en' | 'hi';
  isEmbedded?: boolean;
  onCloseFloating?: () => void;
}

const SUGGESTED_PROMPTS_EN = [
  {
    icon: '🚜',
    label: 'Best Tractor HP for 10 Acres',
    query: 'Which tractor HP and implements are recommended for preparing 10 acres of wheat field?',
  },
  {
    icon: '⚙️',
    label: 'Cultivator vs Rotavator',
    query: 'What is the difference between a Cultivator and a Rotavator for soil preparation?',
  },
  {
    icon: '🌾',
    label: 'Paddy Harvesting Machinery',
    query: 'What is the best combine harvester setup for paddy rice, and what are typical hourly rates?',
  },
  {
    icon: '💰',
    label: 'Tractor Rental Earnings',
    query: 'How much can I earn per month by listing my 50 HP Tractor with an operator on PNagro?',
  },
  {
    icon: '📍',
    label: 'How PNagro GPS Radar Works',
    query: 'How does PNagro live radar tracking work for ordering a tractor directly to my farm?',
  },
];

const SUGGESTED_PROMPTS_HI = [
  {
    icon: '🚜',
    label: '10 एकड़ के लिए सही ट्रैक्टर',
    query: '10 एकड़ गेहूं की जुताई के लिए कितने हॉर्सपावर (HP) का ट्रैक्टर और कौन सा उपकरण सही रहेगा?',
  },
  {
    icon: '⚙️',
    label: 'कल्टीवेटर बनाम रोटावेटर',
    query: 'कल्टीवेटर और रोटावेटर में क्या अंतर है और मिट्टी की तैयारी में कौन सा बेहतर है?',
  },
  {
    icon: '🌾',
    label: 'धान कटाई मशीनरी',
    query: 'धान की कटाई के लिए कंबाइन हार्वेस्टर का किराया और उपयोग कैसे करें?',
  },
  {
    icon: '💰',
    label: 'ट्रैक्टर से कमाई',
    query: 'PNagro पर अपना 50 HP ट्रैक्टर किराए पर देकर महीने में कितनी कमाई हो सकती है?',
  },
  {
    icon: '📍',
    label: 'GPS रडार बुकिंग प्रक्रिया',
    query: 'PNagro लाइव मैप से पास का ट्रैक्टर खेत पर कैसे बुक करें?',
  },
];

// Helper to strip markdown and special formatting for clean speech synthesis
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[*_~`#]+/g, '') // remove markdown symbols
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // replace markdown links with text
    .replace(/https?:\/\/\S+/g, '') // remove URLs
    .replace(/•/g, '')
    .replace(/₹/g, 'Rupees ')
    .trim();
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  onNavigateToBrowse,
  onNavigateToRadar,
  language,
  isEmbedded = true,
  onCloseFloating,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text:
        language === 'hi'
          ? 'नमस्ते किसान साथी! 🙏 मैं **PNagro किसान AI वॉयस असिस्टेंट** हूँ। आप मुझसे बोलकर (Mic) या लिखकर ट्रैक्टर, रोटावेटर, हार्वेस्टर बुकिंग या किराए की दरों के बारे में कुछ भी पूछ सकते हैं!'
          : 'Namaste & Welcome! 🚜 I am **PNagro Kisan AI Voice Assistant**, powered by **Google Gemini 3.7**. You can speak using the microphone or type to ask about machinery HP, implements, hourly rates, or farm bookings!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice Assistant State
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceLanguage, setVoiceLanguage] = useState<'hi-IN' | 'en-IN'>(
    language === 'hi' ? 'hi-IN' : 'en-IN'
  );
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechInterimText, setSpeechInterimText] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync voice recognition language when parent language prop changes
  useEffect(() => {
    setVoiceLanguage(language === 'hi' ? 'hi-IN' : 'en-IN');
  }, [language]);

  // Check Web Speech API Support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, isVoiceMode]);

  // Text-To-Speech (Speech Synthesis)
  const speakText = useCallback(
    (text: string, messageId: string) => {
      if (!('speechSynthesis' in window)) return;

      // If already speaking this message, stop it
      if (speakingMessageId === messageId) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        return;
      }

      window.speechSynthesis.cancel(); // Stop any previous speech
      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = voiceLanguage;
      utterance.rate = 0.95; // Clear and slightly paced for farmers
      utterance.pitch = 1.0;

      // Try selecting an appropriate voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (voiceLanguage === 'hi-IN') {
          const hiVoice = voices.find(
            (v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi')
          );
          if (hiVoice) utterance.voice = hiVoice;
        } else {
          const inVoice = voices.find(
            (v) =>
              v.lang.includes('en-IN') ||
              v.name.toLowerCase().includes('india') ||
              v.lang.includes('en-GB')
          );
          if (inVoice) utterance.voice = inVoice;
        }
      }

      utterance.onstart = () => {
        setSpeakingMessageId(messageId);
      };

      utterance.onend = () => {
        setSpeakingMessageId(null);
      };

      utterance.onerror = () => {
        setSpeakingMessageId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [speakingMessageId, voiceLanguage]
  );

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    // Stop any active speech synthesis
    stopSpeaking();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setSpeechInterimText('');
    setLoading(true);
    setVoiceError(null);

    try {
      // Build history
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api.sendGeminiChat(
        query,
        historyPayload,
        voiceLanguage === 'hi-IN' ? 'hi' : 'en'
      );

      let action: { type: 'browse' | 'radar'; label: string } | undefined;
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('radar') || lowerQuery.includes('map') || lowerQuery.includes('near')) {
        action = {
          type: 'radar',
          label: language === 'hi' ? 'लाइव रडार मैप खोलें' : 'View Live Radar Map',
        };
      } else if (
        lowerQuery.includes('rent') ||
        lowerQuery.includes('tractor') ||
        lowerQuery.includes('book') ||
        lowerQuery.includes('harvester')
      ) {
        action = {
          type: 'browse',
          label: language === 'hi' ? 'उपलब्ध मशीनरी ब्राउज़ करें' : 'Browse Available Fleet',
        };
      }

      const botMessageId = `bot-${Date.now()}`;
      const botMessage: Message = {
        id: botMessageId,
        role: 'model',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Auto-speak response if enabled or in Voice Mode
      if (autoSpeakEnabled || isVoiceMode) {
        setTimeout(() => {
          speakText(res.reply, botMessageId);
        }, 200);
      }
    } catch (err: any) {
      const errorBotId = `bot-err-${Date.now()}`;
      const errorMessage: Message = {
        id: errorBotId,
        role: 'model',
        text:
          err.message ||
          (language === 'hi'
            ? 'क्षमा करें, AI सेवा अभी व्यस्त है। आप तुरंत सहायता के लिए हमारे टोल-फ्री हेल्पलाइन 1800-120-PNAGRO पर संपर्क कर सकते हैं।'
            : 'I am momentarily experiencing a connection delay. You can check our Machinery Catalog or call 1800-120-PNAGRO.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);

      if (autoSpeakEnabled || isVoiceMode) {
        setTimeout(() => {
          speakText(errorMessage.text, errorBotId);
        }, 200);
      }
    } finally {
      setLoading(false);
    }
  };

  // Start Voice Recognition (Speech-to-Text)
  const startListening = () => {
    stopSpeaking();
    setVoiceError(null);
    setSpeechInterimText('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।'
          : 'Voice input is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognition.lang = voiceLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }

        setSpeechInterimText(currentTranscript);
        setInputQuery(currentTranscript);

        if (event.results[0].isFinal) {
          const finalQuery = event.results[0][0].transcript;
          setIsListening(false);
          if (finalQuery.trim()) {
            handleSendMessage(finalQuery);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError(
            language === 'hi'
              ? 'माइक्रोफ़ोन की अनुमति अस्वीकार कर दी गई है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन चालू करें।'
              : 'Microphone permission denied. Please allow microphone access.'
          );
        } else if (event.error !== 'no-speech') {
          setVoiceError(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setVoiceError(err.message || 'Microphone activation failed');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    stopSpeaking();
    stopListening();
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text:
          language === 'hi'
            ? 'चैट रीसेट कर दी गई है। आप कृषि उपकरण, फसल जुताई या किराए से जुड़ा कोई भी नया प्रश्न बोलकर या लिखकर पूछ सकते हैं।'
            : 'Chat refreshed. Ask me any new questions about farm machinery, soil tillage, implement selection, or rental bookings.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const prompts = language === 'hi' ? SUGGESTED_PROMPTS_HI : SUGGESTED_PROMPTS_EN;
  const lastBotMessage = [...messages].reverse().find((m) => m.role === 'model');

  return (
    <div
      id="gemini-kisan-ai-card"
      className={`bg-white rounded-2xl border border-stone-200 shadow-xl flex flex-col overflow-hidden ${
        isEmbedded ? 'h-[640px] w-full' : 'h-[580px] w-full sm:w-[440px]'
      }`}
    >
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 px-4 py-3 text-white flex items-center justify-between border-b border-emerald-800/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center shadow-xs font-black shrink-0">
            <Sparkles className="w-4 h-4 text-stone-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white font-heading">
                {language === 'hi' ? 'PNagro AI वॉयस असिस्टेंट' : 'PNagro AI Voice Assistant'}
              </h3>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Gemini 3.7
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/90 font-medium">
              {language === 'hi'
                ? 'बोलकर या लिखकर पूछें • स्मार्ट कृषि मित्र'
                : 'Interactive Voice & Chat Agri Advisor'}
            </p>
          </div>
        </div>

        {/* Header Controls (Voice Mode Switch, Language, Auto-Speak, Reset) */}
        <div className="flex items-center gap-1">
          {/* Voice Mode Toggle Button */}
          <button
            onClick={() => {
              setIsVoiceMode(!isVoiceMode);
              stopSpeaking();
            }}
            title={isVoiceMode ? 'Switch to Chat View' : 'Open Fullscreen Voice Mode'}
            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              isVoiceMode
                ? 'bg-amber-400 text-stone-950 shadow-md'
                : 'text-emerald-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">
              {isVoiceMode ? 'Chat' : 'Voice'}
            </span>
          </button>

          {/* Voice Language Toggle (Hindi / English) */}
          <button
            onClick={() => {
              const next = voiceLanguage === 'hi-IN' ? 'en-IN' : 'hi-IN';
              setVoiceLanguage(next);
            }}
            title="Toggle Voice Language (English / हिन्दी)"
            className="px-1.5 py-1 bg-emerald-950/80 hover:bg-emerald-800 border border-emerald-700/60 rounded-md text-[10px] font-bold text-amber-300 transition"
          >
            {voiceLanguage === 'hi-IN' ? '🇮🇳 HI' : '🌐 EN'}
          </button>

          {/* Auto-Speak Toggle */}
          <button
            onClick={() => {
              const next = !autoSpeakEnabled;
              setAutoSpeakEnabled(next);
              if (!next) stopSpeaking();
            }}
            title={autoSpeakEnabled ? 'Voice Output ON (Click to Mute)' : 'Voice Output Muted (Click to Unmute)'}
            className={`p-1.5 rounded-lg transition ${
              autoSpeakEnabled
                ? 'text-amber-300 bg-white/10'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {autoSpeakEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleClearChat}
            title={language === 'hi' ? 'चैट साफ़ करें' : 'Clear Chat'}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {!isEmbedded && onCloseFloating && (
            <button
              onClick={onCloseFloating}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* VOICE ASSISTANT INTERACTIVE MODE (FULL VOICE VIEW) */}
      {isVoiceMode ? (
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-stone-900 via-emerald-950 to-stone-950 text-white relative overflow-hidden">
          {/* Top Status & Language Bar */}
          <div className="w-full flex items-center justify-between text-xs text-stone-300">
            <div className="flex items-center gap-1.5 bg-stone-800/80 backdrop-blur-md px-3 py-1 rounded-full border border-stone-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  isListening
                    ? 'bg-red-500 animate-ping'
                    : speakingMessageId
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="font-semibold text-[11px]">
                {isListening
                  ? language === 'hi'
                    ? 'सुन रहा हूँ... बोलिए'
                    : 'Listening... Speak now'
                  : speakingMessageId
                  ? language === 'hi'
                    ? 'AI बोल रहा है...'
                    : 'AI Speaking...'
                  : loading
                  ? language === 'hi'
                    ? 'सोच रहा हूँ...'
                    : 'Gemini Thinking...'
                  : language === 'hi'
                  ? 'माइक दबाकर बोलें'
                  : 'Tap Mic to Speak'}
              </span>
            </div>

            <button
              onClick={() => setIsVoiceMode(false)}
              className="text-[11px] text-amber-300 hover:underline font-bold"
            >
              {language === 'hi' ? 'टेक्स्ट चैट पर जाएं' : 'Switch to Text Chat'}
            </button>
          </div>

          {/* Central Animated Voice Orb / Pulse Visualizer */}
          <div className="my-auto flex flex-col items-center justify-center text-center max-w-sm">
            <div className="relative mb-6">
              {/* Outer Pulse Rings */}
              {isListening && (
                <>
                  <div className="absolute inset-0 -m-8 rounded-full bg-emerald-500/20 animate-ping" />
                  <div className="absolute inset-0 -m-4 rounded-full bg-amber-400/30 animate-pulse" />
                </>
              )}

              {speakingMessageId && (
                <div className="absolute inset-0 -m-6 rounded-full bg-blue-500/25 animate-pulse" />
              )}

              {/* Main Button */}
              <button
                onClick={toggleListening}
                disabled={loading}
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 border-4 ${
                  isListening
                    ? 'bg-gradient-to-tr from-red-600 to-amber-500 border-white text-white shadow-red-500/50'
                    : speakingMessageId
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-amber-300 text-white shadow-teal-500/50'
                    : 'bg-gradient-to-tr from-emerald-800 to-stone-800 border-emerald-500/60 text-white hover:border-amber-400'
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="w-8 h-8 animate-bounce text-white" />
                    <span className="text-[10px] font-black uppercase mt-1 tracking-wider">
                      {language === 'hi' ? 'सुन रहा हूँ' : 'Listening'}
                    </span>
                  </>
                ) : speakingMessageId ? (
                  <>
                    <Volume2 className="w-8 h-8 animate-pulse text-amber-300" />
                    <span className="text-[10px] font-black uppercase mt-1 tracking-wider">
                      {language === 'hi' ? 'रोकें' : 'Stop'}
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8 text-emerald-300" />
                    <span className="text-[10px] font-black uppercase mt-1 tracking-wider text-emerald-200">
                      {language === 'hi' ? 'बोलें' : 'Tap & Speak'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Live Spoken Transcript / AI Response Subtitle */}
            <div className="w-full min-h-[70px] bg-stone-900/80 backdrop-blur-md rounded-2xl p-3.5 border border-stone-700/80 shadow-lg text-center">
              {speechInterimText ? (
                <p className="text-xs sm:text-sm text-amber-300 font-medium italic">
                  "{speechInterimText}"
                </p>
              ) : isListening ? (
                <p className="text-xs text-stone-400 animate-pulse">
                  {language === 'hi'
                    ? '🌾 कृपया अपनी खेती या मशीनरी का सवाल पूछें...'
                    : '🌾 Speak your agricultural machinery question...'}
                </p>
              ) : lastBotMessage ? (
                <div className="text-left max-h-24 overflow-y-auto pr-1">
                  <p className="text-[11px] text-stone-300 line-clamp-3 leading-relaxed">
                    {lastBotMessage.text.replace(/[*_#]+/g, '')}
                  </p>
                  {lastBotMessage.id && (
                    <button
                      onClick={() => speakText(lastBotMessage.text, lastBotMessage.id)}
                      className="mt-1 text-[10px] text-amber-400 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>
                        {speakingMessageId === lastBotMessage.id
                          ? language === 'hi'
                            ? 'आवाज़ बंद करें'
                            : 'Stop Audio'
                          : language === 'hi'
                          ? 'दोबारा सुनें'
                          : 'Listen Again'}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-stone-400">
                  {language === 'hi'
                    ? 'ट्रैक्टर HP, हार्वेस्टर किराया या रोटावेटर के बारे में बोलकर पूछें'
                    : 'Ask about tractor HP, combine harvester rent, or tillage equipment'}
                </p>
              )}
            </div>

            {/* Error Message banner */}
            {voiceError && (
              <p className="text-[11px] text-red-300 bg-red-950/80 px-3 py-1.5 rounded-xl mt-2 border border-red-800">
                {voiceError}
              </p>
            )}
          </div>

          {/* Quick Voice Suggestions Chips */}
          <div className="w-full">
            <p className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 text-center">
              {language === 'hi' ? 'त्वरित प्रश्न:' : 'Quick Voice Prompts:'}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {prompts.slice(0, 3).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  className="px-2.5 py-1 bg-stone-800/90 hover:bg-emerald-900 border border-stone-700 text-stone-200 text-[11px] rounded-xl font-medium transition shadow-xs flex items-center gap-1"
                >
                  <span>{p.icon}</span>
                  <span className="truncate max-w-[200px]">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD CHAT VIEW WITH VOICE MIC BUTTON */
        <>
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/60">
            {/* Quick Suggested Prompt Pills */}
            {messages.length <= 2 && (
              <div className="mb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>
                    {language === 'hi' ? 'सुझाए गए मुख्य प्रश्न:' : 'Frequently Asked Farm Queries:'}
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {prompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p.query)}
                      className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition shadow-2xs flex items-center gap-1.5 text-left"
                    >
                      <span>{p.icon}</span>
                      <span className="truncate max-w-[280px]">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Bubbles */}
            {messages.map((msg) => {
              const isModel = msg.role === 'model';
              const isSpeakingThis = speakingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isModel ? 'justify-start' : 'justify-end'}`}
                >
                  {isModel && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4 text-emerald-300" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs relative ${
                      isModel
                        ? 'bg-white text-stone-800 border border-stone-200'
                        : 'bg-emerald-800 text-white font-medium'
                    }`}
                  >
                    {/* Render formatted message content */}
                    <div className="space-y-1.5 whitespace-pre-wrap">
                      {msg.text.split('\n').map((line, lIdx) => {
                        if (line.startsWith('### ') || line.startsWith('## ')) {
                          return (
                            <h4 key={lIdx} className="font-bold text-stone-900 text-sm mt-2 mb-1">
                              {line.replace(/^#+\s/, '')}
                            </h4>
                          );
                        }
                        if (line.startsWith('* ') || line.startsWith('- ')) {
                          return (
                            <div key={lIdx} className="flex items-start gap-1.5 ml-1">
                              <span
                                className={
                                  isModel ? 'text-emerald-700 font-bold' : 'text-emerald-300 font-bold'
                                }
                              >
                                •
                              </span>
                              <span>{line.replace(/^[-*]\s/, '')}</span>
                            </div>
                          );
                        }
                        return <p key={lIdx}>{line}</p>;
                      })}
                    </div>

                    {/* Footer bar for bot message: TTS Speaker Button, Copy, Actions */}
                    {isModel && (
                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                        {/* Audio TTS Button */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => speakText(msg.text, msg.id)}
                            title={isSpeakingThis ? 'Stop speaking' : 'Read aloud with AI voice'}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                              isSpeakingThis
                                ? 'bg-amber-400 text-stone-950 animate-pulse'
                                : 'bg-stone-100 hover:bg-emerald-100 text-stone-700'
                            }`}
                          >
                            {isSpeakingThis ? (
                              <>
                                <VolumeX className="w-3 h-3 text-stone-950" />
                                <span>{language === 'hi' ? 'रोकें' : 'Stop'}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-emerald-700" />
                                <span>{language === 'hi' ? 'सुनें' : 'Listen'}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="text-stone-400 hover:text-stone-700 p-1 transition"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {/* Optional Action Button */}
                        {msg.action && (
                          <button
                            onClick={() => {
                              if (msg.action?.type === 'radar' && onNavigateToRadar) {
                                onNavigateToRadar();
                              } else if (onNavigateToBrowse) {
                                onNavigateToBrowse();
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-md text-[11px] flex items-center gap-1 transition"
                          >
                            {msg.action.type === 'radar' ? (
                              <MapPin className="w-3 h-3 text-emerald-700" />
                            ) : (
                              <Tractor className="w-3 h-3 text-emerald-700" />
                            )}
                            <span className="truncate max-w-[140px]">{msg.action.label}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-emerald-800" />
                          </button>
                        )}
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-1.5 text-right ${
                        isModel ? 'text-stone-400' : 'text-emerald-200'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {!isModel && (
                    <div className="w-7 h-7 rounded-lg bg-stone-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-2xs flex items-center gap-2 text-xs text-stone-600">
                  <RefreshCw className="w-4 h-4 text-emerald-700 animate-spin" />
                  <span>
                    {language === 'hi'
                      ? 'जेमिनी 3.7 कृषि विशेषज्ञ उत्तर तैयार कर रहा है...'
                      : 'Gemini 3.7 is analyzing your farm query...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Input Indicator Banner if listening */}
          {isListening && (
            <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 animate-pulse shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
                <span className="font-bold">
                  {language === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... speak now'}
                </span>
                {speechInterimText && (
                  <span className="italic text-stone-700 truncate max-w-[200px]">
                    "{speechInterimText}"
                  </span>
                )}
              </div>
              <button
                onClick={stopListening}
                className="text-red-700 hover:text-red-900 font-bold underline text-[11px]"
              >
                {language === 'hi' ? 'रोकें' : 'Stop'}
              </button>
            </div>
          )}

          {voiceError && !isListening && (
            <div className="bg-red-50 border-t border-red-200 px-4 py-1.5 text-[11px] text-red-700 flex items-center justify-between shrink-0">
              <span>{voiceError}</span>
              <button onClick={() => setVoiceError(null)} className="text-red-500 font-bold ml-2">
                ✕
              </button>
            </div>
          )}

          {/* Input Bar with Voice Mic Button */}
          <div className="p-3 bg-white border-t border-stone-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Voice Microphone Button */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop recording voice' : 'Click to speak in Hindi or English'}
                  className={`p-2.5 rounded-xl transition shadow-xs shrink-0 flex items-center justify-center ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-white" />
                  ) : (
                    <Mic className="w-4 h-4 text-emerald-800" />
                  )}
                </button>
              )}

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  isListening
                    ? language === 'hi'
                      ? 'सुन रहा हूँ... बोलिए'
                      : 'Listening to your voice...'
                    : language === 'hi'
                    ? 'माइक दबाकर बोलें या ट्रैक्टर HP, रोटावेटर पूछें...'
                    : 'Speak or ask about tractor HP, cultivator, rental rates...'
                }
                disabled={loading}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs shrink-0"
              >
                <span>{language === 'hi' ? 'पूछें' : 'Send'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
