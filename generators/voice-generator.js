// Voice Beat Generator for Pocket Metronome
class VoiceGenerator {
    constructor() {
        this.voices = [];
        this.selectedVoice = null;
        this.generatedFiles = [];
        this.audioContext = null;

        this.initElements();
        this.loadVoices();
        this.attachEventListeners();
    }

    initElements() {
        this.voiceSelect = document.getElementById('voiceSelect');
        this.pitchSlider = document.getElementById('pitchSlider');
        this.rateSlider = document.getElementById('rateSlider');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.maxNumberInput = document.getElementById('maxNumber');
        this.previewBtn = document.getElementById('previewBtn');
        this.playAllBtn = document.getElementById('playAllBtn');
        this.copySettingsBtn = document.getElementById('copySettingsBtn');
        this.progressDiv = document.getElementById('progress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.settingsDiv = document.getElementById('settings');
        this.pitchValue = document.getElementById('pitchValue');
        this.rateValue = document.getElementById('rateValue');
        this.volumeValue = document.getElementById('volumeValue');
        this.currentVoice = document.getElementById('currentVoice');
        this.currentPitch = document.getElementById('currentPitch');
        this.currentRate = document.getElementById('currentRate');
        this.currentVolume = document.getElementById('currentVolume');
    }

    loadVoices() {
        const loadVoiceList = () => {
            this.voices = speechSynthesis.getVoices();
            if (this.voices.length > 0) {
                this.populateVoiceSelect();
            }
        };

        // Load voices
        loadVoiceList();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoiceList;
        }
    }

    populateVoiceSelect() {
        this.voiceSelect.innerHTML = '';

        // Prefer English voices
        const englishVoices = this.voices.filter(voice => voice.lang.startsWith('en'));
        const otherVoices = this.voices.filter(voice => !voice.lang.startsWith('en'));

        if (englishVoices.length > 0) {
            const englishGroup = document.createElement('optgroup');
            englishGroup.label = 'English Voices';
            englishVoices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${voice.name} (${voice.lang})`;
                englishGroup.appendChild(option);
            });
            this.voiceSelect.appendChild(englishGroup);
        }

        if (otherVoices.length > 0) {
            const otherGroup = document.createElement('optgroup');
            otherGroup.label = 'Other Voices';
            otherVoices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = englishVoices.length + index;
                option.textContent = `${voice.name} (${voice.lang})`;
                otherGroup.appendChild(option);
            });
            this.voiceSelect.appendChild(otherGroup);
        }

        this.selectedVoice = this.voices[0];
    }

    attachEventListeners() {
        this.voiceSelect.addEventListener('change', (e) => {
            this.selectedVoice = this.voices[e.target.value];
        });

        this.pitchSlider.addEventListener('input', (e) => {
            this.pitchValue.textContent = e.target.value;
        });

        this.rateSlider.addEventListener('input', (e) => {
            this.rateValue.textContent = e.target.value;
        });

        this.volumeSlider.addEventListener('input', (e) => {
            this.volumeValue.textContent = e.target.value;
        });

        this.previewBtn.addEventListener('click', () => this.preview());
        this.playAllBtn.addEventListener('click', () => this.playAll());
        this.copySettingsBtn.addEventListener('click', () => this.copySettings());
    }

    preview() {
        const utterance = new SpeechSynthesisUtterance('1');
        utterance.voice = this.selectedVoice;
        utterance.pitch = parseFloat(this.pitchSlider.value);
        utterance.rate = parseFloat(this.rateSlider.value);
        utterance.volume = parseFloat(this.volumeSlider.value);

        speechSynthesis.cancel(); // Cancel any ongoing speech
        speechSynthesis.speak(utterance);
    }

    async playAll() {
        const maxNumber = parseInt(this.maxNumberInput.value);
        if (maxNumber < 1 || maxNumber > 32) {
            alert('Please enter a number between 1 and 32');
            return;
        }

        this.playAllBtn.disabled = true;
        this.progressDiv.classList.remove('hidden');
        speechSynthesis.cancel(); // Cancel any ongoing speech

        for (let i = 1; i <= maxNumber; i++) {
            this.progressFill.style.width = `${(i / maxNumber) * 100}%`;
            this.progressText.textContent = `Playing ${i} of ${maxNumber}...`;

            await this.playNumber(i);
            await this.delay(500); // Delay between numbers
        }

        this.progressDiv.classList.add('hidden');
        this.playAllBtn.disabled = false;

        // Show settings summary
        this.displaySettings();
    }

    async playNumber(number) {
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(number.toString());
            utterance.voice = this.selectedVoice;
            utterance.pitch = parseFloat(this.pitchSlider.value);
            utterance.rate = parseFloat(this.rateSlider.value);
            utterance.volume = parseFloat(this.volumeSlider.value);

            utterance.onend = () => {
                resolve();
            };

            speechSynthesis.speak(utterance);
        });
    }

    displaySettings() {
        this.currentVoice.textContent = this.selectedVoice ? this.selectedVoice.name : 'Default';
        this.currentPitch.textContent = this.pitchSlider.value;
        this.currentRate.textContent = this.rateSlider.value;
        this.currentVolume.textContent = this.volumeSlider.value;
        this.settingsDiv.classList.remove('hidden');
    }

    copySettings() {
        const settings = `Voice: ${this.selectedVoice ? this.selectedVoice.name : 'Default'}
Pitch: ${this.pitchSlider.value}
Rate: ${this.rateSlider.value}
Volume: ${this.volumeSlider.value}`;

        navigator.clipboard.writeText(settings).then(() => {
            const originalText = this.copySettingsBtn.textContent;
            this.copySettingsBtn.textContent = 'Copied! ✓';
            setTimeout(() => {
                this.copySettingsBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            alert('Failed to copy settings to clipboard');
            console.error('Copy failed:', err);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceGenerator();
});
