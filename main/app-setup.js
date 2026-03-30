// File: app-setup.js - v1.34
// Responsabile dell'impostazione iniziale, creazione UI dinamica, listeners principali.

let currentSongDataForSave = null;
let glossaryChordData = {};
let CHORD_LIB = {};
let currentMidiData = null; // Dati della canzone attualmente generata
let midiSectionTitleElement = null; // Elemento H3 per il titolo della sezione download MIDI


document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateButton');
    const songOutputDiv = document.getElementById('songOutput');
    const songOutputContainer = document.getElementById('song-output-container');
  const keySelectionDropdown = document.getElementById('keySelection');
    const structureDropdown = document.getElementById('songStructure');

    const actionButtonsContainer = document.getElementById('action-buttons');

    // --- Popolamento dropdown tonalità ---
   if (keySelectionDropdown && typeof possibleKeysAndModes !== 'undefined' && possibleKeysAndModes.length > 0) {
        possibleKeysAndModes.forEach(keyInfoLoop => {
            const option = document.createElement('option');
            option.value = `${keyInfoLoop.root}_${keyInfoLoop.mode}`;
            option.textContent = keyInfoLoop.name;
            keySelectionDropdown.appendChild(option);
        });
        const randomOption = keySelectionDropdown.querySelector('option[value="random"]');
        if (randomOption) randomOption.textContent = "Random";
    }


    const moodDropdown = document.getElementById('mood');

    const populateStructures = (mood = null) => {
        structureDropdown.innerHTML = '<option value="random" selected>Random (based on Mood)</option>'; // Pulisce e aggiunge l'opzione random

        let templates = SONG_STRUCTURE_TEMPLATES;
        if (mood) {
            templates = SONG_STRUCTURE_TEMPLATES.filter(t => t.mood === mood);

        }


        templates.forEach(template => {
            const opt = document.createElement('option');
            opt.value = template.id;
            opt.textContent = template.name;
            structureDropdown.appendChild(opt);
        });
    };

    if (typeof loadSongStructures === 'function') {
        loadSongStructures().then(() => {
            populateStructures(moodDropdown.value); // Popola inizialmente con il mood selezionato
        }).catch(() => {
            console.error("Could not load structures for dropdown.");
        });

    }


    moodDropdown.addEventListener('change', (event) => {
        populateStructures(event.target.value);
    });

    // --- Inizializzazione libreria accordi ---
    if (typeof buildChordLibrary === "function") {
        CHORD_LIB = buildChordLibrary();
    } else {
        console.error("buildChordLibrary function not found! Chord functionalities will be limited.");
    }

    // --- Event Listener principale ---
    if (generateButton) {
        if (typeof generateSongArchitecture === "function") {
            generateButton.addEventListener('click', generateSongArchitecture);
        } else {
            console.error("generateSongArchitecture function not found! Generation will not work.");
            generateButton.disabled = true;
            generateButton.textContent = 'Error: Setup Incomplete';
        }
    }

    // Definisci attachActionListenersGlobal per essere chiamata dopo la generazione della UI
    window.attachActionListenersGlobal = function() {
        const addListener = (id, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        };

        addListener('saveSongButton', handleSaveSong);
        addListener('downloadSingleTrackChordMidiButton', handleGeneratePad);
        addListener('generateChordRhythmButton', handleGenerateChordRhythm);
        addListener('generateMelodyButton', handleGenerateMelody);
        addListener('generateVocalLineButton', handleGenerateVocalLine);
        addListener('generateBassLineButton', handleGenerateBassLine);
        addListener('generateDrumTrackButton', handleGenerateDrumTrack);

        addListener('generateCountermelodyButton', () => addTrackToMidiData('Countermelody', generateCountermelodyForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, sectionCache)));
        addListener('generateTextureButton', () => addTrackToMidiData('Texture', generateTextureForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getChordRootAndType }, sectionCache)));
        addListener('generateOrnamentButton', () => addTrackToMidiData('Ornament', generateOrnamentForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, sectionCache)));
        addListener('generateMiasmaticButton', () => addTrackToMidiData('Miasmatic', generateMiasmaticForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, sectionCache)));
        addListener('generateDronesButton', () => addTrackToMidiData('Drones', generateDronesForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, sectionCache)));
        addListener('generatePercussionButton', () => addTrackToMidiData('Percussion', generatePercussionForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, sectionCache)));
        addListener('generateGlitchFxButton', () => addTrackToMidiData('GlitchFx', generateGlitchFxForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement }, sectionCache)));

        // Phase 3 new actions
        addListener('previewButton', playPreview);
        addListener('stopPreviewButton', stopPreview);
        addListener('savePdfButton', handleSavePDF);
    };
});

/**
 * Capture #songOutput with html2canvas and save as PDF via jsPDF.
 * Degrades gracefully if either CDN library failed to load.
 */
async function handleSavePDF() {
    if (!currentMidiData) { alert('Generate a song first.'); return; }

    if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
        alert('PDF libraries are not available. Check your internet connection and reload the page.');
        return;
    }

    const pdfBtn = document.getElementById('savePdfButton');
    if (pdfBtn) { pdfBtn.disabled = true; pdfBtn.textContent = 'Generating PDF…'; }

    try {
        const songOutput = document.getElementById('songOutput');
        const canvas = await html2canvas(songOutput, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const title = currentMidiData.displayTitle || currentMidiData.title || 'CapricEngine Song';
        const key = currentMidiData.fullKeyName || 'Unknown Key';
        const mood = document.getElementById('mood')?.value?.replace(/_/g, ' ') || '';
        const structure = document.getElementById('songStructure')?.options[document.getElementById('songStructure')?.selectedIndex]?.text || '';

        pdf.setFontSize(18);
        pdf.text(title, 10, 14);
        pdf.setFontSize(9);
        pdf.text(`Key: ${key}  |  BPM: ${currentMidiData.bpm}  |  Mood: ${mood}  |  Structure: ${structure}`, 10, 21);
        pdf.setDrawColor(180);
        pdf.line(10, 23, 200, 23);

        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 10, 27, imgWidth, imgHeight);

        const fileName = (currentMidiData.title || 'capricengine').replace(/[^a-zA-Z0-9_]/g, '_') + '.pdf';
        pdf.save(fileName);
    } catch (e) {
        console.error('PDF generation error:', e);
        alert('Could not generate PDF. See console for details.');
    } finally {
        if (pdfBtn) { pdfBtn.disabled = false; pdfBtn.textContent = 'Save PDF'; }
    }
}

function addTrackToMidiData(trackName, trackEvents) {
    if (!currentMidiData) {
        alert("Please generate a song first.");
        return;
    }
    if (trackEvents && trackEvents.length > 0) {
        const fileName = `${currentMidiData.title.replace(/[^a-zA-Z0-9_]/g, '_')}_${trackName}.mid`;
        downloadSingleTrackMidi(trackName, trackEvents, fileName, currentMidiData.bpm, currentMidiData.timeSignatureChanges);
    } else {
        alert(`Could not generate ${trackName} track with the current data.`);
    }
}
