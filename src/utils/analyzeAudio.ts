import { createArrayOfNoteFrequencies } from "./createFrequencies";

const noteFrequencies = createArrayOfNoteFrequencies();

export function analyzeAudio(stream: MediaStream, handleKeyDetection: (keyDetected: string | undefined) => void, stopSignal: () => boolean) {
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const microphone = audioCtx.createMediaStreamSource(stream);
    microphone.connect(analyser);

    const THRESHOLD_PERCENTAGE = 20; // Adjust this percentage as needed
    let smoothedThreshold = 0;
    const SMOOTHING_FACTOR = 0.1; // Adjust the smoothing factor as needed
    let backgroundNoiseLevel = 0;

    function detectPianoKey() {
    backgroundNoiseLevel = getMaxBackgroundNoiseAmplitude(analyser, dataArray);
    const currentThreshold = backgroundNoiseLevel * (THRESHOLD_PERCENTAGE / 100);

    // Exponential smoothing
    smoothedThreshold = (SMOOTHING_FACTOR * currentThreshold) + ((1 - SMOOTHING_FACTOR) * smoothedThreshold);

    if (stopSignal()) return; // Check if analysis should be stopped
    requestAnimationFrame(detectPianoKey);

    analyser.getByteFrequencyData(dataArray);

    // Calculate the maximum amplitude among frequency bins
    let maxAmplitude = 0;
    let maxFrequencyIndex = 0;
    for (let i = 0; i < bufferLength; i++) {
        const amplitude = dataArray[i];
        if (amplitude > maxAmplitude) {
            maxAmplitude = amplitude;
            maxFrequencyIndex = i;
        }
    }

    // Ignore amplitudes below the noise gate threshold
    if (backgroundNoiseLevel < 140) {
        handleKeyDetection(undefined);
        return;
    }
    
    // Convert index to frequency
    const sampleRate = audioCtx.sampleRate;
    const frequency = sampleRate * maxFrequencyIndex / bufferLength;

    // Find the note closest to the detected frequency
    let detectedKey: string | undefined;
    let minDifference = Infinity;
    for (const note of noteFrequencies) {
        const difference = Math.abs(frequency - note.frequency);
        console.log({ note, difference })
        if (difference < minDifference && difference < 10) { // Adjusted threshold
            minDifference = difference;
            detectedKey = note.noteName;
        }
    }

    handleKeyDetection(detectedKey);
}


    // Start detecting piano key
    detectPianoKey();
}

function getMaxBackgroundNoiseAmplitude(analyser: AnalyserNode, dataArray: Uint8Array): number {
    analyser.getByteFrequencyData(dataArray);
    return Math.max.apply(null, dataArray.subarray(5, 7) as unknown as number[]);
}
