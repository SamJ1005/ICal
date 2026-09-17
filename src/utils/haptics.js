// Web Audio Synthesized Tactile Haptic Click & iPhone Keyboard Sound
let audioCtx = null;
let keyboardBuffer = null;
let isLoadingAudio = false;

// Preload and decode iPhone Keyboard sound
export function initAudio() {
  if (typeof window === "undefined") return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  if (keyboardBuffer || isLoadingAudio) return;
  isLoadingAudio = true;

  // Try loading /iPhone Keyboard.caf, fallback to /iPhone Keyboard.wav
  fetch("/iPhone Keyboard.caf")
    .then((res) => {
      if (!res.ok) throw new Error("CAF fetch failed");
      return res.arrayBuffer();
    })
    .then((data) => {
      // Decode with audioCtx, or parse PCM if native CAF decode is unsupported
      return audioCtx.decodeAudioData(data).catch(() => {
        // Fallback PCM decoder for 16-bit 44.1kHz stereo PCM inside CAF
        const bytes = new Uint8Array(data);
        const pcmOffset = bytes.length - 4416;
        if (pcmOffset < 0) throw new Error("Invalid CAF PCM length");
        const numSamples = 4416 / 4;
        const buffer = audioCtx.createBuffer(2, numSamples, 44100);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);
        const view = new DataView(data, pcmOffset, 4416);
        for (let i = 0; i < numSamples; i++) {
          left[i] = view.getInt16(i * 4, true) / 32768;
          right[i] = view.getInt16(i * 4 + 2, true) / 32768;
        }
        return buffer;
      });
    })
    .then((buf) => {
      keyboardBuffer = buf;
      isLoadingAudio = false;
    })
    .catch(() => {
      // Fallback: try WAV
      fetch("/iPhone Keyboard.wav")
        .then((res) => (res.ok ? res.arrayBuffer() : null))
        .then((data) => (data ? audioCtx.decodeAudioData(data) : null))
        .then((buf) => {
          if (buf) keyboardBuffer = buf;
          isLoadingAudio = false;
        })
        .catch(() => {
          isLoadingAudio = false;
        });
    });
}

// Auto-init on script evaluation in browser
if (typeof window !== "undefined") {
  initAudio();
}

export function playHapticFeedback() {
  // 1. Physical device vibration for touch devices
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(8);
    }
  } catch (e) {}

  // 2. Play Audio
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    if (!keyboardBuffer && !isLoadingAudio) {
      initAudio();
    }

    // If preloaded iPhone Keyboard buffer is ready, play it
    if (keyboardBuffer) {
      const source = audioCtx.createBufferSource();
      source.buffer = keyboardBuffer;
      const gain = audioCtx.createGain();
      gain.gain.value = 0.05; // Default sound volume set to 5%
      source.connect(gain);
      gain.connect(audioCtx.destination);
      source.start(0);
      return;
    }

    // Fallback: soft warm haptic tap
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = "sine";
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);

    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.016);

    gain.gain.setValueAtTime(0.038, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.018);
  } catch (e) {
    // Audio context blocked or error
  }
}
