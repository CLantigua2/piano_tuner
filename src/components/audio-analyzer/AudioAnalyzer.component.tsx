import { useState, useEffect } from 'react';
import { initializeMicrophone } from '../../utils/initializeMicrophone';
import { analyzeAudio } from '../../utils/analyzeAudio';
import debounce from 'lodash.debounce';

function AudioAnalyzer() {
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [currentKey, setCurrentKey] = useState<string | undefined>(undefined);
    let stopSignal = false;

    useEffect(() => {
        if (stream && isAnalyzing) {
            // Ensure the debounced setCurrentKey function is used inside analyzeAudio
            analyzeAudio(stream, debouncedSetCurrentKey, () => stopSignal);
        }
    }, [stream, isAnalyzing]);

    // Debounce the setCurrentKey function
    const debouncedSetCurrentKey = debounce((keyDetected: string | undefined) => {
        setCurrentKey(keyDetected);
    }, 500);

    function handleStartAnalysis() {
        initializeMicrophone((audioStream: MediaStream) => {
            setStream(audioStream);
            stopSignal = false;
            setMediaRecorder(startRecording());
            setIsAnalyzing(true);
        });
    }

    function handleStopAnalysis() {
        stopSignal = true;
        setIsAnalyzing(false);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        stopRecording();
    }

    function startRecording() {
        if (stream) {
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            recorder.onstop = () => {
                const recordedBlob = new Blob(chunks, { type: 'audio/wav' });
                const url = URL.createObjectURL(recordedBlob);
                console.log("Recording stopped. Audio URL:", url);
            };

            recorder.start();
            console.log("Recording started.");
            return recorder;
        }
        return null;
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    }

    return (
        <div>
            {!isAnalyzing && (
                <button onClick={handleStartAnalysis}>Start Analysis</button>
            )}
            {isAnalyzing && (
                <button onClick={handleStopAnalysis}>Stop Analysis</button>
            )}
            {isAnalyzing && <p>Listening for piano sounds...</p>}
            {/* Ensure currentKey is properly rendered */}
            {currentKey !== undefined && <p>Detected piano key: {currentKey}</p>}
        </div>
    );
}

export default AudioAnalyzer;
