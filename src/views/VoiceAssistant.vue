<template>
  <!-- Main page wrapper for the Voice Assistant -->
  <div class="voice-assistant-page">
    <!-- Central container for the voice assistant UI -->
    <div class="voice-assistant-container">
      <!-- Title and subtitle with entrance animation -->
      <transition name="fade-slide-down" appear>
        <div class="voice-assistant-title">
          <h1 class="main-title">TruthLens Voice Agent</h1>
          <p class="subtitle">Chat with <span class="gradient-text">Clara</span>. Your real-time multilingual AI from TruthLens.</p>
        </div>
      </transition>
      <!-- Voice Assistant Main Button with animated disc background -->
      <transition name="scale-fade" appear>
        <div class="voice-button-wrapper" :class="{ 'active': isActive, 'listening': isListening, 'speaking': isSpeaking }">
          <!-- Label Call Clara sobre el botón, solo cuando está inactiva -->
          <div v-if="!isListening && !isSpeaking && !isConnecting && !isAlwaysListening" class="call-clara-label">
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none" style="margin-right:6px;">
              <rect x="3" y="10" width="2" height="4" rx="1" fill="#60a5fa"/>
              <rect x="7" y="7" width="2" height="10" rx="1" fill="#60a5fa"/>
              <rect x="11" y="5" width="2" height="14" rx="1" fill="#60a5fa"/>
              <rect x="15" y="8" width="2" height="8" rx="1" fill="#60a5fa"/>
            </svg>
            Call Clara
          </div>
          <!-- Animated Background Disc -->
          <div class="voice-disc">
            <div :class="['disc-gradient', (isListening || isSpeaking) ? 'disc-gradient-bright' : '']"></div>
            <div class="disc-shine"></div>
          </div>
          <!-- Main Button for voice interaction -->
          <button
            @click="toggleVoiceChat"
            @mousedown="handleMouseDown"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
            :disabled="isConnecting"
            class="voice-button"
            :class="{
              'listening': isListening,
              'speaking': isSpeaking,
              'connecting': isConnecting,
              'error': hasError
            }"
            :aria-label="getButtonLabel()"
          >
            <span :class="['liquid-blob', (isListening || isSpeaking) ? 'liquid-blob-active' : '']"></span>
          </button>
        </div>
      </transition>
      <!-- State label for listening/speaking -->
      <transition name="state-fade-slide" mode="out-in">
        <div v-if="isListening || isSpeaking" class="voice-state-label" key="state-label">
          <span v-if="isListening">Listening</span>
          <span v-else-if="isSpeaking">Responding</span>
        </div>
      </transition>
      
      <!-- Mobile optimization indicator -->
      <div v-if="isMobile" class="mobile-optimization-indicator">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span>Mobile Optimized</span>
      </div>
    </div>
    <!-- Tarjeta informativa de Clara -->
    <div class="mt-8 sm:mt-12 max-w-2xl mx-auto px-4 sm:px-0">
      <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-2xl shadow-xl border border-cyan-400/20 p-6 sm:p-8 mb-8 flex flex-col items-start">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 mr-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
            <div class="w-5 h-5 rounded-full bg-slate-900"></div>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white">Clara, your critical guide</h2>
        </div>
        <p class="text-slate-200 mb-3 text-base">Clara is the voice of TruthLens — your companion for exploring the platform and making sense of what you see.</p>
        <ul class="list-disc list-inside text-slate-300 mb-3 text-base space-y-1">
          <li>Understand how bias, emotional tone, and manipulation appear in language</li>
          <li>Uncover the 'why' behind each analysis tool and its findings</li>
          <li>Develop a more critical perspective on media and language</li>
        </ul>
        <p class="text-slate-200 text-base font-semibold">Clara's goal is to help you think for yourself.</p>
      </div>
    </div>
    <!-- ChatBot assistant at the bottom -->
    <ChatBot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import listenStartSound from '../assets/sounds/listen_start.wav';
import speakStartSound from '../assets/sounds/speak_start.mp3';
import ChatBot from '../components/ChatBot.vue';
import { Conversation } from '@elevenlabs/client';
import { useAudioOptimization } from '../composables/useAudioOptimization';

// Audio optimization
const { isMobile, getMobileAudioConstraints, playAudio, resumeAudioContext } = useAudioOptimization();

// State management
const isActive = ref(false);
const isListening = ref(false);
const isSpeaking = ref(false);
const isConnecting = ref(false);
const hasError = ref(false);
const statusMessage = ref('');
const isAlwaysListening = ref(false);
const hasPermissions = ref(false);

// ElevenLabs configuration
const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
let conversation: Conversation | null = null;

// Computed properties
const getButtonLabel = () => {
  if (!hasPermissions.value) return 'Activar micrófono';
  if (isConnecting.value) return 'Conectando...';
  if (isAlwaysListening.value) return 'Finalizar conversación';
  if (isListening.value) return 'Escuchando...';
  if (isSpeaking.value) return 'Clara está respondiendo';
  return 'Iniciar conversación';
};

// Initialize ElevenLabs Voice
const initializeVoice = async (): Promise<boolean> => {
  try {
    if (!apiKey || !agentId) {
      throw new Error('Missing ElevenLabs API key or Agent ID');
    }

    // Resume audio context for mobile
    await resumeAudioContext();

    // Request microphone permissions with mobile-optimized settings
    const audioConstraints = getMobileAudioConstraints();
    const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
    hasPermissions.value = true;
    stream.getTracks().forEach(track => track.stop()); // Stop the stream after getting permissions

    // Start the conversation
    conversation = await Conversation.startSession({
      agentId,
      onConnect: () => {
        console.log('Voice conversation connected');
        isListening.value = true;
        isSpeaking.value = false;
        isConnecting.value = false;
      },
      onDisconnect: () => {
        console.log('Voice conversation disconnected');
        isListening.value = false;
        isSpeaking.value = false;
        isConnecting.value = false;
      },
      onError: (message: string) => {
        console.error('Voice error:', message);
        handleError(message || 'Error en la conversación de voz');
      },
      onModeChange: (mode) => {
        console.log('Mode changed:', mode.mode);
        if (mode.mode === 'speaking') {
          isSpeaking.value = true;
          isListening.value = false;
          // Play speak start sound with mobile optimization
          playAudio(speakStartSound, { volume: isMobile.value ? 0.8 : 0.5 });
        } else {
          isSpeaking.value = false;
          if (isAlwaysListening.value) {
            isListening.value = true;
          }
        }
      }
    });

    return true;
  } catch (error) {
    console.error('Error initializing voice:', error);
    handleError('Error al inicializar el asistente de voz');
    return false;
  }
};

// Voice chat control
const toggleVoiceChat = async () => {
  if (!conversation) {
    isConnecting.value = true;
    const success = await initializeVoice();
    isConnecting.value = false;
    if (!success) return;
  }

  if (isAlwaysListening.value && conversation) {
    // Stop the conversation
    await conversation.endSession();
    conversation = null;
    isAlwaysListening.value = false;
    isActive.value = false;
  } else {
    // Start the conversation
    isActive.value = true;
    isAlwaysListening.value = true;
  }
};

// Mouse event handlers
const handleMouseDown = () => {
  if (!isAlwaysListening.value && !isConnecting.value) {
    isActive.value = true;
  }
};

const handleMouseUp = async () => {
  if (!isAlwaysListening.value && !isConnecting.value && isActive.value && conversation) {
    isActive.value = false;
    await conversation.endSession();
    conversation = null;
  }
};

// Error handling
const handleError = (message: string) => {
  hasError.value = true;
  statusMessage.value = message;
  isConnecting.value = false;
  isListening.value = false;
  isSpeaking.value = false;
  isAlwaysListening.value = false;
  isActive.value = false;
  
  setTimeout(() => {
    hasError.value = false;
    statusMessage.value = '';
  }, 3000);
};

// Lifecycle hooks
onMounted(async () => {
  try {
    // Resume audio context for mobile
    await resumeAudioContext();
    
    // Check microphone permissions with mobile optimization
    const audioConstraints = getMobileAudioConstraints();
    const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
    hasPermissions.value = true;
    stream.getTracks().forEach(track => track.stop());
  } catch (error) {
    console.error('Error checking microphone permissions:', error);
    hasPermissions.value = false;
  }
});

onUnmounted(async () => {
  if (conversation) {
    await conversation.endSession();
    conversation = null;
  }
});

// Watch to play sounds when state changes
watch(isListening, (newVal, oldVal) => {
  console.log('isListening changed:', oldVal, '->', newVal);
  if (newVal && !oldVal) {
    playAudio(listenStartSound);
  }
});
watch(isSpeaking, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    playAudio(speakStartSound);
  }
});
</script>

<style scoped>
.voice-assistant-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 13vh;
}

.voice-assistant-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  justify-content: center;
}

.voice-button-wrapper {
  position: relative;
  width: 340px;
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animated Background Disc */
.voice-disc {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.disc-gradient {
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from 0deg,
    #1e40af 0deg,
    #3b82f6 60deg,
    #06b6d4 120deg,
    #0ea5e9 180deg,
    #3b82f6 240deg,
    #1e40af 300deg,
    #1e40af 360deg
  );
  border-radius: 50%;
  animation: rotate 8s linear infinite;
  transition: animation-duration 0.5s cubic-bezier(0.4, 0, 0.2, 1), filter 0.5s, background 0.5s;
}

.disc-gradient-bright {
  filter: brightness(1.25) saturate(1.4) drop-shadow(0 0 32px #38bdf8cc);
  background: conic-gradient(
    from 0deg,
    #38bdf8 0deg,
    #3b82f6 60deg,
    #06b6d4 120deg,
    #0ea5e9 180deg,
    #3b82f6 240deg,
    #38bdf8 300deg,
    #38bdf8 360deg
  );
}

.disc-gradient-fast {
  animation-duration: 2s !important;
}

.disc-shine {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.1) 30%,
    transparent 70%
  );
  border-radius: 50%;
}

/* Main Button */
.voice-button {
  position: relative;
  z-index: 3;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.95);
  border: 4px solid rgba(59, 130, 246, 0.3);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 60px rgba(59, 130, 246, 0.2),
    inset 0 4px 8px rgba(255, 255, 255, 0.1);
  font-size: 2.2rem;
  overflow: visible;
}

.voice-button::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 110px;
  height: 110px;
  background: #101624;
  border-radius: 50%;
  z-index: 11;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
}

.voice-button:hover {
  transform: scale(1.07);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 
    0 0 80px rgba(59, 130, 246, 0.3),
    inset 0 4px 8px rgba(255, 255, 255, 0.15);
}

.voice-button:active {
  transform: scale(0.98);
}

.voice-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Button Content */
.button-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 12;
}

.icon-mic,
.icon-speaker {
  width: 100%;
  height: 100%;
  stroke-width: 3.5;
}

.icon-waveform {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 100%;
}

.wave-bar {
  width: 6px;
  height: 40px;
  background: currentColor;
  border-radius: 3px;
  animation: waveform 1s ease-in-out infinite;
}

.icon-loading {
  display: none;
}

.loading-spinner {
  display: none;
}

.button-text {
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  z-index: 12;
}

/* Title Styles */
.voice-assistant-title {
  width: 100%;
  text-align: center;
  margin-bottom: 1.5rem;
}

.main-title {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(90deg, #38bdf8 0%, #3b82f6 50%, #60a5fa 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.gradient-text {
  background: linear-gradient(90deg, #38bdf8 0%, #3b82f6 50%, #60a5fa 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* Transitions */
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

.fade-scale-leave-from, .fade-scale-enter-to {
  opacity: 1;
  transform: scale(1);
}

.modern-fade {
  transition: opacity 0.3s, transform 0.3s;
}

/* Blob Animations */
.liquid-blob {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 120px;
  height: 120px;
  border-radius: 44% 56% 48% 52% / 55% 45% 55% 45%;
  opacity: 1;
  pointer-events: none;
  mix-blend-mode: screen;
  z-index: 12;
  filter: blur(2px) brightness(3);
  background: radial-gradient(circle at 60% 40%, #38bdf8 0%, #6366f1 60%, #0ea5e9 100%);
  animation: liquidMove 9s ease-in-out infinite alternate;
  transition: background 0.5s, opacity 0.3s, transform 0.3s;
}

.liquid-blob-active {
  animation: liquidBurst 0.32s cubic-bezier(0.4, 0, 0.2, 1) 1, liquidMove 3s 0.32s ease-in-out infinite alternate;
  opacity: 1;
  transform: scale(3);
}

@keyframes liquidBurst {
  0% {
    opacity: 0.95;
    transform: scale(1);
  }
  40% {
    opacity: 1;
    transform: scale(5);
  }
  100% {
    opacity: 1;
    transform: scale(2.7);
  }
}

@keyframes liquidMove {
  0% {
    border-radius: 44% 56% 48% 52% / 55% 45% 55% 45%;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    filter: blur(6px) brightness(1.2);
  }
  15% {
    border-radius: 60% 40% 55% 45% / 45% 60% 40% 55%;
    transform: translate(-52%, -48%) scale(1.08, 0.95) rotate(12deg);
    filter: blur(7px) brightness(1.22);
  }
  32% {
    border-radius: 50% 60% 40% 60% / 60% 40% 60% 40%;
    transform: translate(-48%, -52%) scale(1.13, 0.92) rotate(-7deg);
    filter: blur(8px) brightness(1.25);
  }
  47% {
    border-radius: 55% 45% 60% 40% / 40% 55% 45% 60%;
    transform: translate(-53%, -47%) scale(0.97, 1.18) rotate(18deg);
    filter: blur(7px) brightness(1.18);
  }
  63% {
    border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%;
    transform: translate(-51%, -49%) scale(1.05, 1.07) rotate(-14deg);
    filter: blur(7px) brightness(1.21);
  }
  78% {
    border-radius: 45% 55% 60% 40% / 60% 40% 55% 45%;
    transform: translate(-49%, -51%) scale(1.11, 0.93) rotate(9deg);
    filter: blur(8px) brightness(1.23);
  }
  100% {
    border-radius: 44% 56% 48% 52% / 55% 45% 55% 45%;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    filter: blur(6px) brightness(1.2);
  }
}

.voice-state-label {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 8px #0ea5e944, 0 1px 2px #000a;
}

/* State Label Animations */
.state-fade-slide-enter-active, .state-fade-slide-leave-active {
  transition: opacity 0.35s, transform 0.35s;
}

.state-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(18px);
}

.state-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-18px);
}

.state-fade-slide-enter-to, .state-fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Active state animations */
.voice-button-wrapper.active .disc-gradient {
  animation-duration: 3s;
}

/* Entrance Animations */
.fade-slide-down-enter-active {
  animation: fade-slide-down 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fade-slide-down {
  0% {
    opacity: 0;
    transform: translateY(-30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.scale-fade-enter-active {
  animation: scale-fade 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes scale-fade {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.permission-hint,
.permission-message {
  display: none;
}
.permission-hint-text {
  color: #60a5fa;
  border: 1px solid #60a5fa;
  background: none;
  font-size: 0.97rem;
  margin: 1.2rem auto 0 auto;
  padding: 0.3rem 1.2rem;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  max-width: 350px;
  opacity: 0.8;
}

.call-clara-label {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(15,23,42,0.92);
  color: #fff;
  font-weight: 500;
  font-size: 0.93rem;
  padding: 0.28rem 0.8rem;
  border-radius: 2rem;
  box-shadow: 0 2px 12px #0002;
  z-index: 20;
  gap: 0.4rem;
  pointer-events: none;
  letter-spacing: 0.01em;
}

.clara-inner-circle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 38px;
  height: 38px;
  background: rgba(16,22,36,0.92);
  border-radius: 80%;
  z-index: 10;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.18);
}

/* Mobile-specific optimizations */
@media (max-width: 768px) {
  .voice-button-wrapper {
    width: 280px;
    height: 280px;
  }
  
  .voice-button {
    width: 200px;
    height: 200px;
    font-size: 1.8rem;
  }
  
  .voice-button::before {
    width: 90px;
    height: 90px;
  }
  
  .liquid-blob {
    width: 100px;
    height: 100px;
  }
  
  .liquid-blob-active {
    transform: scale(2.5);
  }
  
  .main-title {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
  }
  
  /* Improve touch targets for mobile */
  .voice-button {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  /* Optimize audio visual feedback */
  .disc-gradient-bright {
    filter: brightness(1.4) saturate(1.6) drop-shadow(0 0 40px #38bdf8cc);
  }
}

/* iOS-specific optimizations */
@supports (-webkit-touch-callout: none) {
  .voice-button {
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Ensure audio plays on iOS */
  audio {
    -webkit-playsinline: true;
    playsinline: true;
  }
}

/* Android-specific optimizations */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .voice-button {
    -webkit-tap-highlight-color: transparent;
  }
}

/* Mobile optimization indicator */
.mobile-optimization-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 1rem;
  color: #60a5fa;
  font-size: 0.8rem;
  font-weight: 500;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.mobile-optimization-indicator:hover {
  opacity: 1;
}

.mobile-optimization-indicator svg {
  color: #60a5fa;
}
</style> 