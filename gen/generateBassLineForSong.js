// gen/generateBassLineForSong.js

const BASS_PARAMS = {
    // Range MIDI standard per un basso a 4 corde (C1 a G4)
    PITCH_RANGE: { min: 36, max: 55 },

    // Probabilità di eseguire un arpeggio invece del pattern standard
    ARPEGGIO_CHANCE: 0.15,

    // Probabilità di usare un salto d'ottava quando si suona la tonica
    OCTAVE_JUMP_CHANCE: 0.35,

    // Probabilità di inserire una nota di passaggio cromatica (deve essere molto bassa)
    CHROMATIC_PASSING_NOTE_CHANCE: 0.05,

    // Gerarchia di probabilità per la selezione delle note armoniche (quando non si suona la tonica)
    NOTE_SELECTION_PROBABILITY: [
        { type: 'FIFTH', weight: 45 },      // La quinta è la nota più stabile dopo la tonica
        { type: 'THIRD', weight: 30 },      // La terza definisce il colore dell'accordo
        { type: 'DIATONIC', weight: 25 },   // Una nota di passaggio della scala
    ]
};

const BASS_RHYTHMIC_PATTERNS = {
    '4/4': [
        { name: "EarlyRock_Box_4-4", weight: 30, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '5' }, { d: 1.0, p: 'R8' }, { d: 1.0, p: '5' }] },
        { name: "EarlyRock_Slow_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '5' }, { d: 2.0, p: 'R8' }] },
        { name: "Mid50s_Walking_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b5' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'b5' }, { d: 0.5, p: '4' }, { d: 0.5, p: '3' }] },
        { name: "Mid50s_BluesWalk_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b5' }, { d: 0.5, p: '5' }, { d: 0.5, p: '6' }] },
        { name: "Mid50s_Riff_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '3' }, { d: 1.0, p: 'R8' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }] },
        { name: "Mid50s_SimpleRock_4-4", weight: 30, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '3' }, { d: 1.0, p: '5' }] },
        { name: "RockabillyShuffle_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '6' }, { d: 0.5, p: '5' }] },
        { name: "Rockabilly_Shuffle_Walk_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '2' }, { d: 1.0, p: '3' }, { d: 1.0, p: '#4' }, { d: 1.0, p: '5' }, { d: 1.0, p: '6' }, { d: 1.0, p: 'b7' }, { d: 1.0, p: 'rest' }] },
        { name: "Rockabilly_Shuffle_Triplet_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'rest' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'rest' }] },
        { name: "Rockabilly_Shuffle_Bluesy_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }] },
        { name: "The_Twist_4-4", weight: 25, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '#4' }, { d: 1.5, p: '5' }, { d: 0.5, p: '#4' }] },
        { name: "AcidRock_Groove_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b7' }, { d: 1.0, p: 'R8' }] },
        { name: "AcidRock_Driving_4-4", weight: 18, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: '5' }] },
        { name: "HardRock_Syncopated_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '6' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }] },
        { name: "HardRock_Gallop_4-4", weight: 22, pattern: [{ d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 1.0, p: 'b7' }, { d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 1.0, p: 'b7' }] },
        { name: "ProgRock_Sync_4-4", weight: 15, pattern: [{ d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '7' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '5' }] },
        { name: "Rockabilly_Walking_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '2' }, { d: 1.0, p: '3' }, { d: 1.0, p: '#4' }, { d: 1.0, p: '5' }, { d: 1.0, p: '6' }, { d: 1.0, p: 'b7' }, { d: 1.0, p: 'rest' }] },
        { name: "The_Twist_Groove_4-4", weight: 25, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 1.5, p: 'R' }, { d: 0.5, p: 'b7' }] },
        { name: "AcidRock_Syncopated_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b7' }, { d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }] },
        { name: "HardRock_DrivingEights_4-4", weight: 28, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }] },
        { name: "HeavyMetal_ChromaticWalk_4-4", weight: 18, pattern: [{ d: 2.0, p: 'R' }, { d: 0.5, p: '2' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }] },
        { name: "HeavyMetal_Gallop_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }] },
        { name: "HeavyMetal_MinorDescent_4-4", weight: 18, pattern: [{ d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '6' }, { d: 0.5, p: '5' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '2' }, { d: 0.5, p: 'R' }] },
        { name: "HeavyMetal_Dotted_4-4", weight: 15, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 1.5, p: 'R' }, { d: 0.5, p: 'R' }] },
        { name: "NuMetal_DrivingSixteenths_4-4", weight: 15, pattern: [{ d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'b2' }, { d: 0.25, p: 'R' }] },
        { name: "NuMetal_SyncopatedGroove_4-4", weight: 15, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b3' }, { d: 2.0, p: 'rest' }] },
        { name: "NuMetal_SimpleTension_4-4", weight: 15, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: 'b2' }] },
        { name: "Thrash_Driving16ths_4-4", weight: 18, pattern: [{ d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: '5' }, { d: 0.25, p: '5' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: '4' }, { d: 0.25, p: '4' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'b7' }, { d: 0.25, p: 'b7' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: '6' }, { d: 0.25, p: '6' }] },
        { name: "PopRock_Quarters_4-4", weight: 25, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }] },
        { name: "PopRock_Slow_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 2.0, p: 'R' }] },
        { name: "PopRock_Arpeggio_4-4", weight: 22, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: '3' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R8' }] },
        { name: "PopRock_ScaleDown_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '7' }, { d: 0.5, p: '6' }, { d: 1.0, p: '5' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'R' }] },
        { name: "NewWave_Groove_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }, { d: 1.0, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }] },
        { name: "NewWave_OctaveEighths_4-4", weight: 28, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }] },
        { name: "SouthernRock_Syncopated_4-4", weight: 25, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '4' }, { d: 1.0, p: 'R' }] },
        { name: "SouthernRock_Funky_4-4", weight: 18, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b7' }] },
        { name: "SouthernRock_Slow_4-4", weight: 20, pattern: [{ d: 1.0, p: 'rest' }, { d: 1.5, p: 'R' }, { d: 1.0, p: '5' }, { d: 0.5, p: 'R' }] },
        { name: "CountryRock_Simple_4-4", weight: 25, pattern: [{ d: 2.0, p: 'R' }, { d: 2.0, p: '5' }] },
        { name: "CountryRumba_4-4", weight: 20, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.5, p: 'R' }, { d: 0.5, p: '5' }] },
        { name: "CountryTrainbeat_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b2' }, { d: 0.5, p: '2' }] },
        { name: "CountryTrainbeat_Walk_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '2' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '6' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'R8' }] },
        { name: "Blues_Shuffle_4-4", weight: 25, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.0, p: '5' }, { d: 0.5, p: '6' }, { d: 1.0, p: 'b7' }] },
        { name: "Blues_Shuffle_Turnaround_4-4", weight: 20, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '5' }, { d: 1.0, p: '4' }] },
        { name: "Blues_ChromaticWalk_4-4", weight: 22, pattern: [{ d: 2.0, p: 'R' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b5' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'b7' }] },
        { name: "BritishBlues_Pentatonic_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }] },
        { name: "ClassicFunk_Swing_4-4", weight: 25, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: '6' }, { d: 0.5, p: 'b7' }, { d: 1.0, p: 'R8' }] },
        { name: "ClassicFunk_Syncopated16ths_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }] },
        { name: "ClassicFunk_Simple_4-4", weight: 28, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '5' }, { d: 1.0, p: 'R8' }, { d: 1.0, p: '5' }] },
        { name: "ClassicFunk_RestAndPush_4-4", weight: 20, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'rest' }, { d: 0.5, p: '5' }, { d: 0.5, p: '6' }] },
        { name: "Disco_OctavePulse_4-4", weight: 30, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 1.0, p: 'rest' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R8' }] },
        { name: "Disco_WalkingOctaves_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }] },
        { name: "Disco_SyncopatedFunk_4-4", weight: 22, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 1.0, p: '3' }, { d: 1.0, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }] },
        { name: "Disco_ChromaticClimb_4-4", weight: 18, pattern: [{ d: 2.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '6' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '7' }] },
        { name: "Disco_DrivingEights_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b5' }, { d: 1.0, p: '5' }] },
        { name: "Disco_FunkyGroove_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '5' }] },
        { name: "FunkFusion_Slap_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }] },
        { name: "FunkFusion_Chromatic_4-4", weight: 22, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b2' }, { d: 0.5, p: '2' }, { d: 0.5, p: 'b3' }] },
        { name: "FunkFusion_Groove1_4-4", weight: 28, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '6' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }] },
        { name: "FunkFusion_Groove2_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 1.0, p: 'rest' }] },
        { name: "FunkFusion_Driving_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'b7' }] },
        { name: "FunkFusion_SyncopatedWalk_4-4", weight: 18, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '2' }, { d: 0.5, p: 'R' }, { d: 1.0, p: '2' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '2' }] },
        { name: "HipHop_Groove1_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }] },
        { name: "HipHop_Slow_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '5' }, { d: 2.0, p: 'R' }] },
        { name: "HipHop_SwingFeel_4-4", weight: 28, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b3' }] },
        { name: "HipHop_Jazzy_4-4", weight: 22, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '6' }, { d: 0.5, p: '5' }] },
        { name: "HipHop_SyncopatedFunk_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '5' }] },
        { name: "HipHop_LaidBack_4-4", weight: 20, pattern: [{ d: 2.0, p: 'R' }, { d: 1.5, p: '5' }, { d: 0.5, p: 'b7' }] },
        { name: "Latin_Tumbao_4-4", weight: 25, pattern: [{ d: 2.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R8' }] },
        { name: "Latin_ChaChaCha_4-4", weight: 25, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }] },
        { name: "Latin_Mambo_4-4", weight: 28, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.5, p: 'R' }, { d: 0.5, p: '5' }] },
        { name: "Latin_Guaracha_4-4", weight: 20, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 2.0, p: 'R' }] },
        { name: "Latin_Guaguanco_4-4", weight: 28, pattern: [{ d: 2.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }] },
        { name: "Latin_Songo_4-4", weight: 22, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 1.0, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }] },
        { name: "Reggae_Groove_4-4", weight: 25, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 1.0, p: 'b7' }, { d: 1.0, p: 'R' }] },
        { name: "Reggae_HeavyTwo_4-4", weight: 20, pattern: [{ d: 2.0, p: 'R' }, { d: 2.0, p: '5' }] },
        { name: "Ska_Walking_4-4", weight: 28, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'b7' }, { d: 1.0, p: '5' }, { d: 1.0, p: '4' }] },
        { name: "Ska_Eighths_4-4", weight: 22, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '5' }, { d: 0.5, p: '5' }, { d: 0.5, p: '5' }] },
        { name: "BossaNova_Simple_4-4", weight: 25, pattern: [{ d: 3.0, p: 'R' }, { d: 1.0, p: 'rest' }, { d: 3.0, p: '5' }, { d: 1.0, p: 'rest' }] },
        { name: "Samba_Simple_4-4", weight: 20, pattern: [{ d: 2.0, p: 'R' }, { d: 2.0, p: '5' }] },
        { name: "Samba_Syncopated_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '5' }, { d: 1.5, p: 'R' }, { d: 0.5, p: 'rest' }] }
    ],
    '12/8': [
        { name: "DooWopClassic", weight: 30, pattern: [{ d: 1.5, p: 'R' }, { d: 1.0, p: '5' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'rest' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'R' }] },
        { name: "DooWopAlternate", weight: 25, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 1.0, p: '5' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }] },
        { name: "DooWopBallad", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }, { d: 0.5, p: '3' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }] },
        { name: "DooWopAlternate_2", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }] }
    ],
    '3/4': [
        { name: "CountryWaltz_3-4", weight: 30, pattern: [{ d: 1.5, p: 'R' }, { d: 1.5, p: '5' }] }
    ],
    '2/4': [
        { name: "ProgRock_Odd_2-4", weight: 15, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'R8' }] }
    ],
    '9/8': [
        { name: "ProgRock_Groove_9-8", weight: 15, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.5, p: '5' }, { d: 1.0, p: 'R8' }, { d: 1.0, p: '5' }] }
    ],
    '6/4': [
        { name: "ProgRock_Groove_6-4", weight: 15, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 1.5, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }, { d: 0.5, p: '4' }] }
    ],
    '5/4': [
        { name: "ProgRock_Arp_5-4", weight: 15, pattern: [{ d: 1.0, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.0, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.0, p: '5' }] },
        { name: "ProgRock_Sync_5-4", weight: 15, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'rest' }, { d: 1.0, p: '5' }, { d: 1.0, p: 'R' }] }
    ]
};

function generateBassPhraseForSlot(context, lastEvent, helpers) {
    const { chordName, durationTicks, timeSignature, songData, sectionIndex, slotIndex, forceRootOnDownbeat = true } = context;
    const { getChordRootAndType, getChordNotes, getRandomElement } = helpers;
    const phraseEvents = [];
    const ticksPerBeat = (4 / timeSignature[1]) * (typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128);
    const tsKey = `${timeSignature[0]}/${timeSignature[1]}`;
    const patterns = BASS_RHYTHMIC_PATTERNS[tsKey] || BASS_RHYTHMIC_PATTERNS['4/4'];
    const selectedPattern = getRandomElement(patterns);
    const rhythmPattern = selectedPattern.pattern;

    // Max rest duration: 1 beat — prevents audible multi-beat gaps in the bass
    const MAX_REST_TICKS = ticksPerBeat;

    let currentTick = 0;
    while (currentTick < durationTicks) {
        rhythmPattern.forEach((patternElement, index) => {
            if (currentTick >= durationTicks) return;

            const isRest = patternElement.p === 'rest';
            const rawDurationTicks = patternElement.d * ticksPerBeat;
            // Cap rests to MAX_REST_TICKS so a single rest never causes a gap longer than 1 beat
            const cappedDurationTicks = isRest ? Math.min(rawDurationTicks, MAX_REST_TICKS) : rawDurationTicks;
            const actualDuration = Math.min(cappedDurationTicks, durationTicks - currentTick);

            if (actualDuration <= 0) return;

            if (!isRest) {
                let pitch = getPitchFromSymbol(patternElement.p, {
                    chordName,
                    lastNote: phraseEvents.length > 0 ? phraseEvents[phraseEvents.length - 1] : lastEvent,
                    songData,
                    helpers
                });

                pitch = Math.max(BASS_PARAMS.PITCH_RANGE.min, Math.min(BASS_PARAMS.PITCH_RANGE.max, pitch));

                phraseEvents.push({
                    pitch: [pitch],
                    duration: `T${Math.round(actualDuration)}`,
                    startTick: context.startTick + currentTick,
                    velocity: humanizeVelocity(
                        ['R', 'R8'].includes(patternElement.p) ? 85 : 65,
                        12,
                        (context.startTick + currentTick) % ticksPerBeat,
                        ticksPerBeat
                    )
                });
            }
            currentTick += actualDuration;
        });
    }

    // Extend the last note to fill any trailing gap up to the slot boundary
    if (phraseEvents.length > 0) {
        const lastEv = phraseEvents[phraseEvents.length - 1];
        const lastEvDuration = parseInt(lastEv.duration.slice(1), 10);
        const lastEvEnd = lastEv.startTick - context.startTick + lastEvDuration;
        const trailingGap = durationTicks - lastEvEnd;
        if (trailingGap > 0) {
            lastEv.duration = `T${lastEvDuration + trailingGap}`;
        }
    }

    return phraseEvents;
}

function getPitchFromSymbol(symbol, context) {
    const { chordName, lastNote, songData, helpers } = context;
    const { getChordRootAndType, getChordNotes, getDiatonicChords, NOTE_NAMES } = helpers;
    const { root, type } = getChordRootAndType(chordName);
    const chordNotes = getChordNotes(root, type).notes;
    const rootPitch = NOTE_NAMES.indexOf(root);

    switch (symbol) {
        case 'R':
            return rootPitch + 36;
        case 'R8':
            return rootPitch + 48;
        case '3':
            return NOTE_NAMES.indexOf(chordNotes[1]) + 36;
        case '5':
            return NOTE_NAMES.indexOf(chordNotes[2]) + 36;
        case '6':
            // Sesta maggiore o minore a seconda della scala
            const scaleChords = getDiatonicChords(songData.keySignatureRoot, songData.keyModeName);
            const sixthChord = scaleChords[5];
            const { root: sixthRoot } = getChordRootAndType(sixthChord);
            return NOTE_NAMES.indexOf(sixthRoot) + 36;
        case '7':
        case 'b7':
            // Settima maggiore o minore a seconda della scala
            const seventhChord = getDiatonicChords(songData.keySignatureRoot, songData.keyModeName)[6];
            const { root: seventhRoot } = getChordRootAndType(seventhChord);
            return NOTE_NAMES.indexOf(seventhRoot) + 36;
        case '2':
            const secondChord = getDiatonicChords(songData.keySignatureRoot, songData.keyModeName)[1];
            const { root: secondRoot } = getChordRootAndType(secondChord);
            return NOTE_NAMES.indexOf(secondRoot) + 36;
        case '4':
            const fourthChord = getDiatonicChords(songData.keySignatureRoot, songData.keyModeName)[3];
            const { root: fourthRoot } = getChordRootAndType(fourthChord);
            return NOTE_NAMES.indexOf(fourthRoot) + 36;
        case '#4':
             return rootPitch + 6 + 36;
        case 'b5':
            return rootPitch + 6 + 36;
        case 'b3':
            return rootPitch + 3 + 36;
        case 'b2':
            return rootPitch + 1 + 36;
        default:
            return rootPitch + 36;
    }
}

function normalizeSectionName(name) {
  // Rimuove numeri finali tipo "Verse 1" → "Verse"
  return name.replace(/\s*\d+$/, '').trim();
}

// ---------------------------------------------------------------------------
// Walking bass: replace the last beat of a chord slot with an approach note
// ---------------------------------------------------------------------------
function generateWalkingBassPhrase(context, lastEvent, helpers) {
    const { chordName, durationTicks, timeSignature, startTick, songData, nextChordName } = context;
    const { getChordRootAndType, NOTE_NAMES } = helpers;
    const TPQN = typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128;
    const ticksPerBeat = (4 / timeSignature[1]) * TPQN;

    if (durationTicks <= ticksPerBeat) {
        return generateBassPhraseForSlot(context, lastEvent, helpers);
    }

    // Generate standard pattern for everything except the last beat
    const mainContext = { ...context, durationTicks: durationTicks - ticksPerBeat };
    const mainPhrase = generateBassPhraseForSlot(mainContext, lastEvent, helpers);

    // Resolve chord roots to MIDI
    const { root: curRoot } = getChordRootAndType(chordName);
    const curRootIdx = NOTE_NAMES.indexOf(curRoot);
    const curRootMidi = curRootIdx !== -1 ? curRootIdx + 36 : 36;

    let nextRootMidi = null;
    if (nextChordName) {
        const { root: nxtRoot } = getChordRootAndType(nextChordName);
        const nxtIdx = NOTE_NAMES.indexOf(nxtRoot);
        if (nxtIdx !== -1) nextRootMidi = nxtIdx + 36;
    }

    // Pick approach note
    let approachMidi;
    if (nextRootMidi === null || nextRootMidi === curRootMidi) {
        approachMidi = curRootMidi + 7; // fifth of current chord — classic turnaround
    } else {
        const direction = Math.sign(nextRootMidi - curRootMidi);
        approachMidi = nextRootMidi - direction; // one chromatic step before the next root
    }
    approachMidi = Math.max(BASS_PARAMS.PITCH_RANGE.min, Math.min(BASS_PARAMS.PITCH_RANGE.max, approachMidi));

    mainPhrase.push({
        pitch: [approachMidi],
        duration: `T${Math.round(ticksPerBeat)}`,
        startTick: startTick + durationTicks - ticksPerBeat,
        velocity: humanizeVelocity(80, 12)
    });

    return mainPhrase;
}

// ---------------------------------------------------------------------------
// Generative bass: weight-driven note + duration selection
// ---------------------------------------------------------------------------
function generateGenerativeBassPhrase(context, lastEvent, helpers) {
    const { chordName, durationTicks, timeSignature, startTick, songData } = context;
    const { getChordRootAndType, getChordNotes, getDiatonicChords, NOTE_NAMES } = helpers;
    const TPQN = typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128;
    const ticksPerBeat = (4 / timeSignature[1]) * TPQN;

    const { root, type } = getChordRootAndType(chordName);
    const chordResult = getChordNotes(root, type);
    const chordNotes = (chordResult && chordResult.notes) ? chordResult.notes : [root];

    const rootIdx = NOTE_NAMES.indexOf(root);
    const rootMidi = rootIdx !== -1 ? rootIdx + 36 : 36;
    const fifthMidi = chordNotes[2] ? (() => { const i = NOTE_NAMES.indexOf(chordNotes[2]); return i !== -1 ? i + 36 : rootMidi + 7; })() : rootMidi + 7;
    const thirdMidi = chordNotes[1] ? (() => { const i = NOTE_NAMES.indexOf(chordNotes[1]); return i !== -1 ? i + 36 : rootMidi + 4; })() : rootMidi + 4;

    // Scale passing note
    let passingMidi = rootMidi + 2;
    if (typeof getDiatonicChords === 'function' && songData.keySignatureRoot && songData.keyModeName) {
        const diatonics = getDiatonicChords(songData.keySignatureRoot, songData.keyModeName);
        const scaleRoots = diatonics.map(c => { const { root: r } = getChordRootAndType(c); const i = NOTE_NAMES.indexOf(r); return i !== -1 ? i + 36 : null; }).filter(Boolean);
        const passing = scaleRoots.filter(p => p !== rootMidi && p !== fifthMidi && p !== thirdMidi);
        if (passing.length > 0) passingMidi = passing[Math.floor(Math.random() * passing.length)];
    }

    // Duration weights: 70% = 1 beat, 20% = 0.5 beats, 10% = 2 beats
    const durPool = [{ beats: 1.0, w: 70 }, { beats: 0.5, w: 20 }, { beats: 2.0, w: 10 }];
    // Note weights: root 40%, fifth 25%, third 20%, passing 15%
    const notePool = [{ p: rootMidi, w: 40 }, { p: fifthMidi, w: 25 }, { p: thirdMidi, w: 20 }, { p: passingMidi, w: 15 }];

    const weightedPick = (pool) => {
        const total = pool.reduce((s, x) => s + x.w, 0);
        let r = Math.random() * total;
        for (const x of pool) { r -= x.w; if (r <= 0) return x; }
        return pool[0];
    };

    const events = [];
    let currentTick = 0;

    while (currentTick < durationTicks) {
        const remaining = durationTicks - currentTick;
        const durBeats = weightedPick(durPool).beats;
        const durTicks = Math.min(Math.round(durBeats * ticksPerBeat), remaining);
        if (durTicks <= 0) break;

        const chosen = weightedPick(notePool);
        const pitch = Math.max(BASS_PARAMS.PITCH_RANGE.min, Math.min(BASS_PARAMS.PITCH_RANGE.max, chosen.p));

        events.push({
            pitch: [pitch],
            duration: `T${durTicks}`,
            startTick: startTick + currentTick,
            velocity: humanizeVelocity(pitch === rootMidi ? 85 : 65, 12, currentTick % ticksPerBeat, ticksPerBeat)
        });
        currentTick += durTicks;
    }

    return events;
}

function generateBassLineForSong(songData, helpers, sectionCache, bassMode = 'pattern') {
    const bassLine = [];
    let lastEvent = null;

    if (!sectionCache.bass) {
        sectionCache.bass = {};
    }

    songData.sections.forEach((section, sectionIndex) => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.bass[baseName]) {
            const cachedBassLine = sectionCache.bass[baseName];
            cachedBassLine.forEach(event => {
                bassLine.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionBassLine = [];

        section.mainChordSlots.forEach((slot, slotIndex) => {
            const nextSlot = section.mainChordSlots[slotIndex + 1] || null;
            const context = {
                chordName: slot.chordName,
                durationTicks: slot.effectiveDurationTicks,
                timeSignature: slot.timeSignature,
                startTick: section.startTick + slot.effectiveStartTickInSection,
                songData,
                sectionIndex,
                slotIndex,
                nextChordName: nextSlot ? nextSlot.chordName : null
            };
            let phrase;
            if (bassMode === 'walking') {
                phrase = generateWalkingBassPhrase(context, lastEvent, helpers);
            } else if (bassMode === 'generative') {
                phrase = generateGenerativeBassPhrase(context, lastEvent, helpers);
            } else {
                phrase = generateBassPhraseForSlot(context, lastEvent, helpers);
            }
            if (phrase.length > 0) {
                lastEvent = phrase[phrase.length - 1];
            }
            sectionBassLine.push(...phrase);
        });

        if (sectionBassLine.length > 0) {
            const cachedSectionBass = sectionBassLine.map(event => ({
                ...event,
                startTick: event.startTick - section.startTick
            }));
            sectionCache.bass[baseName] = cachedSectionBass;
        }

        bassLine.push(...sectionBassLine);
    });

    return bassLine;
}
