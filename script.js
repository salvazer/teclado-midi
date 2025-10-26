document.addEventListener('DOMContentLoaded', function() {
    // Configuración del teclado
    const keyboardContainer = document.getElementById('piano-keyboard');
    const audioContainer = document.getElementById('audio-container');
    const midiStatusElement = document.getElementById('midi-status');
    
    // Mapeo de teclas del teclado físico a notas
    const keyMapping = {
        'q': 'a', 'w': 'b', 'e': 'c', 'r': 'd', 't': 'e', 'y': 'f', 'u': 'g', 'i': 'h',
        'o': 'i', 'p': 'j', 'a': 'k', 's': 'l', 'd': 'm', 'f': 'n', 'g': 'o', 'h': 'p',
        'j': 'q', 'k': 'r', 'l': 's', 'z': 't', 'x': 'u', 'c': 'v', 'v': 'w', 'b': 'x',
        'n': 'y', 'm': 'z', ',': 'ñ', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5'
    };
    
    // Objeto para almacenar los audios activos
    const activeAudios = {};
    
    // Objeto para almacenar las rutas de audio personalizadas
    const customAudioPaths = {};
    
    // Crear el teclado visual
    function createKeyboard() {
        // Crear 32 teclas
        for (let i = 0; i < 32; i++) {
            const key = document.createElement('div');
            key.className = 'key white-key';
            key.dataset.note = getNoteName(i);
            
            // Añadir etiqueta con la tecla correspondiente
            const keyLabel = document.createElement('div');
            keyLabel.className = 'key-label';
            keyLabel.textContent = getKeyForNote(getNoteName(i));
            key.appendChild(keyLabel);
            
            // Añadir etiqueta para mostrar información del audio
            const audioInfo = document.createElement('div');
            audioInfo.className = 'audio-info';
            audioInfo.textContent = getNoteName(i) + '.wav';
            key.appendChild(audioInfo);
            
            keyboardContainer.appendChild(key);
            
            // Añadir eventos de ratón y touch
            key.addEventListener('mousedown', function() {
                playNote(this.dataset.note);
                this.classList.add('active');
            });
            
            key.addEventListener('mouseup', function() {
                stopNote(this.dataset.note);
                this.classList.remove('active');
            });
            
            key.addEventListener('mouseleave', function() {
                stopNote(this.dataset.note);
                this.classList.remove('active');
            });
            
            // Eventos táctiles para dispositivos móviles
            key.addEventListener('touchstart', function(e) {
                e.preventDefault(); // Prevenir el comportamiento por defecto
                playNote(this.dataset.note);
                this.classList.add('active');
            });
            
            key.addEventListener('touchend', function(e) {
                e.preventDefault(); // Prevenir el comportamiento por defecto
                stopNote(this.dataset.note);
                this.classList.remove('active');
            });
            
            key.addEventListener('touchcancel', function(e) {
                e.preventDefault(); // Prevenir el comportamiento por defecto
                stopNote(this.dataset.note);
                this.classList.remove('active');
            });
            
            // Añadir eventos de arrastrar y soltar
            key.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });
            
            key.addEventListener('dragleave', function() {
                this.classList.remove('drag-over');
            });
            
            key.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const file = files[0];
                    
                    // Verificar que sea un archivo de audio
                    if (file.type.startsWith('audio/')) {
                        const note = this.dataset.note;
                        const audioURL = URL.createObjectURL(file);
                        
                        // Actualizar la ruta de audio personalizada
                        customAudioPaths[note] = audioURL;
                        
                        // Actualizar la etiqueta de información del audio
                        const audioInfo = this.querySelector('.audio-info');
                        if (audioInfo) {
                            audioInfo.textContent = file.name;
                        }
                        
                        // Actualizar o crear el elemento de audio
                        let audioElement = document.getElementById(`audio-${note}`);
                        if (!audioElement) {
                            audioElement = document.createElement('audio');
                            audioElement.id = `audio-${note}`;
                            audioContainer.appendChild(audioElement);
                        }
                        audioElement.src = audioURL;
                        audioElement.preload = 'auto';
                        
                        // Guardar la configuración en localStorage
                        saveAudioConfig();
                    }
                }
            });
        }
    }
    
    // Obtener el nombre de la nota según el índice
    function getNoteName(index) {
        const notes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 
                      'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ñ', '1', '2', '3', '4', '5'];
        return notes[index];
    }
    
    // Obtener la tecla física correspondiente a una nota
    function getKeyForNote(note) {
        for (const [key, value] of Object.entries(keyMapping)) {
            if (value === note) {
                return key.toUpperCase();
            }
        }
        return '';
    }
    
    // Precargar todos los audios
    function preloadAudios() {
        const notes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 
                      'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ñ', '1', '2', '3', '4', '5'];
        
        notes.forEach(note => {
            const audioElement = document.createElement('audio');
            audioElement.id = `audio-${note}`;
            audioElement.src = `acordeon/${note}.wav`;
            audioElement.preload = 'auto';
            audioContainer.appendChild(audioElement);
        });
    }
    
    // Reproducir una nota
    function playNote(note) {
        // Si ya hay un audio activo para esta nota, lo detenemos primero
        if (activeAudios[note]) {
            activeAudios[note].pause();
            activeAudios[note].currentTime = 0;
        }
        
        // Verificar si hay una ruta de audio personalizada
        const audioSrc = customAudioPaths[note] || `acordeon/${note}.wav`;
        
        // Buscar o crear el elemento de audio
        let audioElement = document.getElementById(`audio-${note}`);
        if (!audioElement) {
            audioElement = document.createElement('audio');
            audioElement.id = `audio-${note}`;
            audioElement.src = audioSrc;
            audioElement.preload = 'auto';
            audioContainer.appendChild(audioElement);
        }
        
        // Clonamos el audio para permitir múltiples reproducciones simultáneas
        const audioClone = audioElement.cloneNode(true);
        audioClone.play();
        activeAudios[note] = audioClone;
    }
    
    // Guardar configuración de audio en localStorage
    function saveAudioConfig() {
        const config = {};
        for (const [note, path] of Object.entries(customAudioPaths)) {
            config[note] = path;
        }
        localStorage.setItem('audioConfig', JSON.stringify(config));
    }
    
    // Cargar configuración de audio desde localStorage
    function loadAudioConfig() {
        const config = localStorage.getItem('audioConfig');
        if (config) {
            try {
                const parsedConfig = JSON.parse(config);
                for (const [note, path] of Object.entries(parsedConfig)) {
                    customAudioPaths[note] = path;
                    
                    // Actualizar la etiqueta de información del audio
                    const keyElement = document.querySelector(`.key[data-note="${note}"]`);
                    if (keyElement) {
                        const audioInfo = keyElement.querySelector('.audio-info');
                        if (audioInfo) {
                            // Extraer el nombre del archivo de la URL
                            const fileName = path.split('/').pop() || note + '.wav';
                            audioInfo.textContent = fileName;
                        }
                    }
                }
            } catch (e) {
                console.error('Error al cargar la configuración de audio:', e);
            }
        }
    }
    
    // Detener una nota
    function stopNote(note) {
        if (activeAudios[note]) {
            // Detener inmediatamente el audio
            activeAudios[note].pause();
            activeAudios[note].currentTime = 0;
            delete activeAudios[note];
        }
    }
    
    // Eventos de teclado
    document.addEventListener('keydown', function(event) {
        const key = event.key.toLowerCase();
        
        // Evitar repetición cuando se mantiene pulsada una tecla
        if (event.repeat) return;
        
        if (keyMapping[key]) {
            const note = keyMapping[key];
            playNote(note);
            
            // Activar visualmente la tecla
            const keyElement = document.querySelector(`.key[data-note="${note}"]`);
            if (keyElement) {
                keyElement.classList.add('active');
            }
        }
    });
    
    document.addEventListener('keyup', function(event) {
        const key = event.key.toLowerCase();
        
        if (keyMapping[key]) {
            const note = keyMapping[key];
            stopNote(note);
            
            // Desactivar visualmente la tecla
            const keyElement = document.querySelector(`.key[data-note="${note}"]`);
            if (keyElement) {
                keyElement.classList.remove('active');
            }
        }
    });
    
    // Inicializar MIDI
    function initMIDI() {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({ sysex: false })
                .then(onMIDISuccess, onMIDIFailure);
        } else {
            midiStatusElement.textContent = 'WebMIDI no soportado en este navegador';
        }
    }
    
    function onMIDISuccess(midiAccess) {
        midiStatusElement.textContent = 'MIDI disponible';
        
        const inputs = midiAccess.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = onMIDIMessage;
            midiStatusElement.textContent = 'Dispositivo MIDI conectado';
        }
        
        midiAccess.onstatechange = function(e) {
            if (e.port.state === 'connected') {
                midiStatusElement.textContent = 'Dispositivo MIDI conectado';
                e.port.onmidimessage = onMIDIMessage;
            } else {
                midiStatusElement.textContent = 'Dispositivo MIDI desconectado';
            }
        };
    }
    
    function onMIDIFailure() {
        midiStatusElement.textContent = 'Error al acceder a MIDI';
    }
    
    function onMIDIMessage(message) {
        const command = message.data[0];
        const note = message.data[1];
        const velocity = message.data[2];
        
        // Mapear notas MIDI a nuestras notas
        const midiNoteMapping = {
            60: 'a', 61: 'b', 62: 'c', 63: 'd', 64: 'e', 65: 'f', 66: 'g', 67: 'h',
            68: 'i', 69: 'j', 70: 'k', 71: 'l', 72: 'm', 73: 'n', 74: 'o', 75: 'p',
            76: 'q', 77: 'r', 78: 's', 79: 't', 80: 'u', 81: 'v', 82: 'w', 83: 'x',
            84: 'y', 85: 'z', 86: 'ñ', 87: '1', 88: '2', 89: '3', 90: '4', 91: '5'
        };
        
        // Nota activada (144) con velocidad > 0
        if (command === 144 && velocity > 0) {
            const mappedNote = midiNoteMapping[note];
            if (mappedNote) {
                playNote(mappedNote);
                
                // Activar visualmente la tecla
                const keyElement = document.querySelector(`.key[data-note="${mappedNote}"]`);
                if (keyElement) {
                    keyElement.classList.add('active');
                }
            }
        } 
        // Nota desactivada (128) o nota activada (144) con velocidad 0
        else if (command === 128 || (command === 144 && velocity === 0)) {
            const mappedNote = midiNoteMapping[note];
            if (mappedNote) {
                stopNote(mappedNote);
                
                // Desactivar visualmente la tecla
                const keyElement = document.querySelector(`.key[data-note="${mappedNote}"]`);
                if (keyElement) {
                    keyElement.classList.remove('active');
                }
            }
        }
    }
    
    // Inicializar
    createKeyboard();
    preloadAudios();
    loadAudioConfig(); // Cargar configuración guardada
    initMIDI();
});