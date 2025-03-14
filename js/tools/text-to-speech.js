// Text to Speech Converter Tool
document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('text-input');
    const voiceSelect = document.getElementById('voice-select');
    const rateRange = document.getElementById('rate-range');
    const pitchRange = document.getElementById('pitch-range');
    const volumeRange = document.getElementById('volume-range');
    const rateValue = document.getElementById('rate-value');
    const pitchValue = document.getElementById('pitch-value');
    const volumeValue = document.getElementById('volume-value');
    const speakBtn = document.getElementById('speak-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const infoAlert = document.getElementById('info-alert');
    const errorAlert = document.getElementById('error-alert');

    let currentUtterance = null;
    let currentAudio = null;
    let currentAudioBlob = null;

    // ElevenLabs API Configuration
    const ELEVENLABS_API_KEY = 'sk_a3a4f59cdfc74d7fa3923e4d4466fa5df8a69ddcce308cae';
    const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
    let elevenLabsVoices = [];

    // Initialize speech synthesis
    const speechSynthesis = window.speechSynthesis;

    // Load available voices from both systems
    async function loadVoices() {
        voiceSelect.innerHTML = '<option value="">Loading voices...</option>';
        
        try {
            // Load ElevenLabs voices
            const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load ElevenLabs voices');
            }
            
            const data = await response.json();
            elevenLabsVoices = data.voices;
            
            // Add ElevenLabs voices to select
            elevenLabsVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = `elevenlabs_${voice.voice_id}`;
                option.textContent = `${voice.name} (ElevenLabs)`;
                voiceSelect.appendChild(option);
            });

            // Add system voices
            const systemVoices = speechSynthesis.getVoices();
            systemVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = `system_${voice.name}`;
                option.textContent = `${voice.name} (System)`;
                voiceSelect.appendChild(option);
            });

            // Set default voice
            if (elevenLabsVoices.length > 0) {
                voiceSelect.value = `elevenlabs_${elevenLabsVoices[0].voice_id}`;
            } else if (systemVoices.length > 0) {
                voiceSelect.value = `system_${systemVoices[0].name}`;
            }
        } catch (error) {
            console.error('Error loading voices:', error);
            showError('Failed to load voices. Using system voices only.');
            loadSystemVoices();
        }
    }

    // Load system voices as fallback
    function loadSystemVoices() {
        const voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = `system_${voice.name}`;
            option.textContent = `${voice.name} (System)`;
            voiceSelect.appendChild(option);
        });

        if (voices.length > 0) {
            voiceSelect.value = `system_${voices[0].name}`;
        }
    }

    // Initialize voices
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    } else {
        loadVoices();
    }

    // Update range values display
    rateRange.addEventListener('input', () => {
        rateValue.textContent = rateRange.value;
    });

    pitchRange.addEventListener('input', () => {
        pitchValue.textContent = pitchRange.value;
    });

    volumeRange.addEventListener('input', () => {
        volumeValue.textContent = volumeRange.value;
    });

    // Show info message
    function showInfo(message) {
        infoAlert.textContent = message;
        infoAlert.classList.remove('d-none');
        errorAlert.classList.add('d-none');
    }

    // Show error message
    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
        infoAlert.classList.add('d-none');
    }

    // Convert text to speech using ElevenLabs API
    async function convertWithElevenLabs(text, voiceId) {
        try {
            const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to convert text to speech');
            }

            const audioBlob = await response.blob();
            currentAudioBlob = audioBlob; // Store the blob for download
            const audioUrl = URL.createObjectURL(audioBlob);
            return audioUrl;
        } catch (error) {
            console.error('ElevenLabs API error:', error);
            throw error;
        }
    }

    // Download audio as MP3
    function downloadAudio() {
        if (!currentAudioBlob) {
            showError('No audio available to download');
            return;
        }

        const fileName = `speech_${new Date().toISOString().slice(0,10)}.mp3`;
        const url = URL.createObjectURL(currentAudioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showInfo('Audio downloaded successfully');
    }

    // Add download button to the UI
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn-success ms-2';
    downloadBtn.innerHTML = '<i class="fas fa-download me-2"></i>Download MP3';
    downloadBtn.onclick = downloadAudio;
    document.querySelector('.d-flex.justify-content-center').appendChild(downloadBtn);

    // Speak button click handler
    speakBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            showError('Please enter some text to speak');
            return;
        }

        // Stop any ongoing speech
        if (currentUtterance) {
            speechSynthesis.cancel();
        }
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        const selectedVoice = voiceSelect.value;
        const isElevenLabs = selectedVoice.startsWith('elevenlabs_');
        const voiceId = selectedVoice.split('_')[1];

        try {
            if (isElevenLabs) {
                // Use ElevenLabs API
                showInfo('Converting text to speech...');
                const audioUrl = await convertWithElevenLabs(text, voiceId);
                
                currentAudio = new Audio(audioUrl);
                currentAudio.volume = parseFloat(volumeRange.value);
                
                currentAudio.onended = () => {
                    currentAudio = null;
                    speakBtn.disabled = false;
                    pauseBtn.disabled = true;
                    stopBtn.disabled = true;
                    pauseBtn.innerHTML = '<i class="fas fa-pause me-2"></i>Pause';
                    showInfo('Speech completed');
                };

                currentAudio.play();
                showInfo('Speaking...');
            } else {
                // Use system speech synthesis
                currentUtterance = new SpeechSynthesisUtterance(text);
                const voices = speechSynthesis.getVoices();
                const systemVoice = voices.find(voice => voice.name === voiceId);
                if (systemVoice) {
                    currentUtterance.voice = systemVoice;
                }

                currentUtterance.rate = parseFloat(rateRange.value);
                currentUtterance.pitch = parseFloat(pitchRange.value);
                currentUtterance.volume = parseFloat(volumeRange.value);

                speechSynthesis.speak(currentUtterance);
                showInfo('Speaking...');
            }

            // Update button states
            speakBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
        } catch (error) {
            showError('Failed to convert text to speech. Please try again.');
            speakBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
        }
    });

    // Pause button click handler
    pauseBtn.addEventListener('click', () => {
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
                pauseBtn.innerHTML = '<i class="fas fa-pause me-2"></i>Pause';
                showInfo('Speech resumed');
            } else {
                currentAudio.pause();
                pauseBtn.innerHTML = '<i class="fas fa-play me-2"></i>Resume';
                showInfo('Speech paused');
            }
        } else if (speechSynthesis.speaking) {
            speechSynthesis.pause();
            pauseBtn.innerHTML = '<i class="fas fa-play me-2"></i>Resume';
            showInfo('Speech paused');
        } else {
            speechSynthesis.resume();
            pauseBtn.innerHTML = '<i class="fas fa-pause me-2"></i>Pause';
            showInfo('Speech resumed');
        }
    });

    // Stop button click handler
    stopBtn.addEventListener('click', () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        speechSynthesis.cancel();
        currentUtterance = null;
        
        // Reset button states
        speakBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
        pauseBtn.innerHTML = '<i class="fas fa-pause me-2"></i>Pause';
        
        showInfo('Speech stopped');
    });

    // Handle speech end
    speechSynthesis.onend = () => {
        currentUtterance = null;
        
        // Reset button states
        speakBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
        pauseBtn.innerHTML = '<i class="fas fa-pause me-2"></i>Pause';
        
        showInfo('Speech completed');
    };

    // Handle speech error
    speechSynthesis.onerror = (event) => {
        showError(`Speech error: ${event.error}`);
        
        // Reset button states
        speakBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
        pauseBtn.innerHTML = '<i class="fas fa-pause me-2"></i>Pause';
    };
}); 