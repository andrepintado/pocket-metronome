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
        this.recordExportBtn = document.getElementById('recordExportBtn');
        this.copySettingsBtn = document.getElementById('copySettingsBtn');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.progressDiv = document.getElementById('progress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.settingsDiv = document.getElementById('settings');
        this.fileListDiv = document.getElementById('fileList');
        this.filesDiv = document.getElementById('files');
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
        this.recordExportBtn.addEventListener('click', () => this.recordAndExportAll());
        this.copySettingsBtn.addEventListener('click', () => this.copySettings());
        this.downloadAllBtn.addEventListener('click', () => this.downloadAllFiles());
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

    async recordAndExportAll() {
        const maxNumber = parseInt(this.maxNumberInput.value);
        if (maxNumber < 1 || maxNumber > 32) {
            alert('Please enter a number between 1 and 32');
            return;
        }

        try {
            // Request permission to capture tab audio
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true, // Required in Chrome
                audio: true
            });

            // We only need the audio track
            const audioTrack = stream.getAudioTracks()[0];
            const videoTrack = stream.getVideoTracks()[0];

            // Stop video track if present (we don't need it)
            if (videoTrack) {
                videoTrack.stop();
            }

            // Create audio-only stream
            const audioStream = new MediaStream([audioTrack]);

            // Now record each number
            this.recordExportBtn.disabled = true;
            this.progressDiv.classList.remove('hidden');
            this.fileListDiv.classList.add('hidden');
            this.generatedFiles = [];

            for (let i = 1; i <= maxNumber; i++) {
                this.progressFill.style.width = `${(i / maxNumber) * 100}%`;
                this.progressText.textContent = `Recording ${i} of ${maxNumber}...`;

                await this.recordSingleNumber(i, audioStream);
                await this.delay(300); // Small delay between recordings
            }

            // Stop all tracks
            audioStream.getTracks().forEach(track => track.stop());

            this.progressDiv.classList.add('hidden');
            this.recordExportBtn.disabled = false;
            this.displayGeneratedFiles();
            this.fileListDiv.classList.remove('hidden');

        } catch (error) {
            console.error('Recording failed:', error);
            alert('Recording permission denied or failed. Please try again and make sure to select "Share audio" when prompted.');
            this.recordExportBtn.disabled = false;
            this.progressDiv.classList.add('hidden');
        }
    }

    async recordSingleNumber(number, audioStream) {
        return new Promise((resolve, reject) => {
            const mediaRecorder = new MediaRecorder(audioStream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            const audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                this.generatedFiles.push({
                    number: number,
                    blob: audioBlob,
                    filename: `${number}.webm`
                });
                resolve();
            };

            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                reject(event);
            };

            // Start recording
            mediaRecorder.start();

            // Create and speak the utterance
            const utterance = new SpeechSynthesisUtterance(number.toString());
            utterance.voice = this.selectedVoice;
            utterance.pitch = parseFloat(this.pitchSlider.value);
            utterance.rate = parseFloat(this.rateSlider.value);
            utterance.volume = parseFloat(this.volumeSlider.value);

            utterance.onend = () => {
                // Add a small delay to ensure we capture the full audio
                setTimeout(() => {
                    mediaRecorder.stop();
                }, 200);
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                mediaRecorder.stop();
                reject(event);
            };

            speechSynthesis.speak(utterance);
        });
    }

    displayGeneratedFiles() {
        this.filesDiv.innerHTML = '';

        this.generatedFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const fileNumber = document.createElement('div');
            fileNumber.className = 'file-number';
            fileNumber.textContent = file.number;

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.filename;

            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'file-download';
            downloadBtn.textContent = '⬇ Download';
            downloadBtn.onclick = () => this.downloadFile(file);

            fileItem.appendChild(fileNumber);
            fileItem.appendChild(fileName);
            fileItem.appendChild(downloadBtn);
            this.filesDiv.appendChild(fileItem);
        });
    }

    downloadFile(file) {
        const url = URL.createObjectURL(file.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async downloadAllFiles() {
        for (const file of this.generatedFiles) {
            this.downloadFile(file);
            await this.delay(200); // Small delay between downloads
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceGenerator();
});
