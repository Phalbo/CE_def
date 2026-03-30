// File: main/app-audio-playback.js — v1.0 (Group 6)
// In-browser audio preview via Tone.js 14.8.49.
// Plays the chord-pad progression with a triangle-wave PolySynth.
// Handles AudioContext resume, Play/Stop, indicator dot.

(function () {
    'use strict';

    let _parts  = [];
    let _synths = [];
    let _stopTimer = null;

    // ── helpers ──────────────────────────────────────────────────────────────

    function midiToToneNote(midi) {
        const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
        const octave = Math.floor(midi / 12) - 1;
        return NAMES[midi % 12] + octave;
    }

    function ticksToSec(ticks, bpm, tpqn) {
        return (ticks / tpqn) * (60 / bpm);
    }

    // ── UI state ─────────────────────────────────────────────────────────────

    function setPreviewActive(active) {
        const playBtn = document.getElementById('previewButton');
        const stopBtn = document.getElementById('stopPreviewButton');
        const dot     = document.getElementById('preview-indicator-dot');
        if (playBtn) playBtn.disabled = active;
        if (stopBtn) stopBtn.disabled = !active;
        if (dot) dot.className = active ? 'preview-dot preview-dot--active' : 'preview-dot';
    }

    // ── stop ─────────────────────────────────────────────────────────────────

    function stopPreview() {
        if (typeof Tone === 'undefined') return;

        Tone.Transport.stop();
        Tone.Transport.cancel(0);

        _parts.forEach(p => { try { p.dispose(); } catch (_) {} });
        _synths.forEach(s => { try { s.dispose(); } catch (_) {} });
        _parts  = [];
        _synths = [];

        if (_stopTimer !== null) {
            clearTimeout(_stopTimer);
            _stopTimer = null;
        }

        setPreviewActive(false);
    }

    // ── start ─────────────────────────────────────────────────────────────────

    async function startPreview() {
        if (typeof Tone === 'undefined') {
            alert('Tone.js is not loaded — cannot preview audio.');
            return;
        }

        // currentMidiData lives in app-setup.js global scope
        if (!currentMidiData || !currentMidiData.sections) {
            if (typeof showToast === 'function') showToast('Generate a song first.', 'error', 2000);
            else alert('Generate a song first.');
            return;
        }

        // Clean up any previous playback
        stopPreview();

        // Resume AudioContext (browser autoplay policy)
        await Tone.start();

        const { bpm, sections } = currentMidiData;
        const TPQN = typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined'
            ? TICKS_PER_QUARTER_NOTE_REFERENCE
            : 128;

        const FLAT_MAP = { Db:'C#', Eb:'D#', Gb:'F#', Ab:'G#', Bb:'A#', Cb:'B' };
        const NOTE_LIST = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

        // Collect chord events
        const chordEvents = [];
        sections.forEach(sd => {
            if (!sd.mainChordSlots) return;
            sd.mainChordSlots.forEach(slot => {
                if (!slot.chordName || slot.effectiveDurationTicks <= 0) return;
                const entry = (typeof CHORD_LIB !== 'undefined') ? CHORD_LIB[slot.chordName] : null;
                if (!entry || !entry.notes || entry.notes.length === 0) return;

                const startSec = ticksToSec(sd.startTick + slot.effectiveStartTickInSection, bpm, TPQN);
                const durSec   = ticksToSec(slot.effectiveDurationTicks, bpm, TPQN) * 0.88;

                const midiNotes = entry.notes.map(n => {
                    const resolved = FLAT_MAP[n] || n;
                    const idx = NOTE_LIST.indexOf(resolved);
                    return idx !== -1 ? idx + 48 : null;   // MIDI octave 4
                }).filter(n => n !== null);

                if (midiNotes.length > 0) {
                    chordEvents.push({
                        time:     startSec,
                        notes:    midiNotes.map(midiToToneNote),
                        duration: durSec,
                        velocity: 0.48
                    });
                }
            });
        });

        if (chordEvents.length === 0) {
            if (typeof showToast === 'function') showToast('No chord data for preview.', 'error', 2000);
            return;
        }

        // ── Pad synth (triangle, slow attack) ───────────────────────────────
        const padSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope:   { attack: 0.12, decay: 0.15, sustain: 0.72, release: 0.6 },
            volume:     -10
        }).toDestination();
        _synths.push(padSynth);

        // Schedule chords
        const padPart = new Tone.Part((time, ev) => {
            padSynth.triggerAttackRelease(ev.notes, ev.duration, time, ev.velocity);
        }, chordEvents);
        padPart.start(0);
        _parts.push(padPart);

        // ── Bass synth (root note only, square wave) ─────────────────────────
        const bassSynth = new Tone.Synth({
            oscillator: { type: 'square' },
            envelope:   { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.25 },
            volume:     -16
        }).toDestination();
        _synths.push(bassSynth);

        const bassEvents = chordEvents.map(ev => ({
            time:     ev.time,
            note:     ev.notes[0].replace(/\d+$/, m => String(parseInt(m, 10) - 1)), // one octave down
            duration: ev.duration,
            velocity: ev.velocity * 0.75
        }));

        const bassPart = new Tone.Part((time, ev) => {
            bassSynth.triggerAttackRelease(ev.note, ev.duration, time, ev.velocity);
        }, bassEvents);
        bassPart.start(0);
        _parts.push(bassPart);

        // ── Schedule auto-stop ───────────────────────────────────────────────
        const totalDur = chordEvents.reduce(
            (mx, e) => Math.max(mx, e.time + e.duration + 0.5),
            0
        );

        Tone.Transport.bpm.value = bpm;
        Tone.Transport.start();
        setPreviewActive(true);

        // Use native setTimeout for the auto-stop (avoids Tone.Transport drift issues)
        _stopTimer = setTimeout(stopPreview, totalDur * 1000 + 300);
    }

    // ── inject indicator dot next to preview buttons (after render) ───────────

    function injectPreviewDot() {
        if (document.getElementById('preview-indicator-dot')) return;
        const playBtn = document.getElementById('previewButton');
        if (!playBtn) return;
        const dot = document.createElement('span');
        dot.id = 'preview-indicator-dot';
        dot.className = 'preview-dot';
        dot.title = 'Preview status';
        playBtn.insertAdjacentElement('afterend', dot);
    }

    // ── event delegation (buttons injected by renderSongOutput) ──────────────

    document.addEventListener('click', e => {
        if (e.target.id === 'previewButton')     startPreview();
        if (e.target.id === 'stopPreviewButton') stopPreview();
    });

    // Observe DOM for the preview button being injected
    const _observer = new MutationObserver(() => {
        if (document.getElementById('previewButton')) {
            injectPreviewDot();
        }
    });
    _observer.observe(document.body, { childList: true, subtree: true });

})();
