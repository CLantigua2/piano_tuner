const referenceNoteFrequency = 440; // A4 note frequency
const referenceNoteName = "A4";

const a = Math.pow(2, 1 / 12); // 12th root of 2

/**
 * Calculate the frequency of a note based on the reference frequency and the number of steps
 * @param refFreq Reference frequency
 * @param steps Number of steps from the reference frequency
 * @returns The frequency of the note
 * @example
 * calcFrequency(440, 3) // returns 523.25
 * calcFrequency(440, -3) // returns 349.23
 * calcFrequency(440, 0) // returns 440
 * calcFrequency(440, 12) // returns 880
 * calcFrequency(440, -12) // returns 220
 */
const calcFrequency = (refFreq: number, steps: number): number => {
    let result = refFreq * Math.pow(a, steps)

    // plus operator is used to convert the result to a number
    return +(result).toFixed(2);
}; 

const noteNameArray = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

const START_NOTE = 'A0';
const END_NOTE = 'C8';

/**
 * Create an array of note frequencies
 * @returns An array of note frequencies
 * @example
 * createArrayOfNoteFrequencies()
 * // returns
 * [
 *   { noteName: "A0", frequency: 27.50 },
 *   { noteName: "A#0/Bb0", frequency: 29.14 },
 *   { noteName: "B0", frequency: 30.87 },
 *   { noteName: "C1", frequency: 32.70 },
 *   { noteName: "C#1/Db1", frequency: 34.65 },
 *   ...
 *   { noteName: "B7", frequency: 3951.07 },
 *   { noteName: "C8", frequency: 4186.01 }
 * ]
 */
export const createArrayOfNoteFrequencies = (): {
    noteName: string;
    frequency: number;
}[] => {
    const result: { noteName: string, frequency: number }[] = [];
    const noteArray = [];
    const startOctave = parseInt(START_NOTE.slice(-1));
    const endOctave = parseInt(END_NOTE.slice(-1));

    const startNoteName = START_NOTE.slice(0, -1);
    const endNoteName = END_NOTE.slice(0, -1);
    
    const noteNameArrayStartIndex = noteNameArray.indexOf(startNoteName);
    const noteNameArrayEndIndex = noteNameArray.indexOf(endNoteName);

    for (let octave = startOctave; octave <= endOctave; octave++) {
        // if this is the first octave, start from the start note index
        if (octave === startOctave) {
            for (let i = noteNameArrayStartIndex; i < noteNameArray.length; i++) {
                noteArray.push(`${noteNameArray[i]}${octave}`);
            }
            // if this is the last octave, end at the end note index
        } else if (octave === endOctave) {
            for (let i = 0; i <= noteNameArrayEndIndex; i++) {
                noteArray.push(`${noteNameArray[i]}${octave}`);
            }
            // for all other octaves, add all note names
        } else {
            noteNameArray.forEach(note => noteArray.push(`${note}${octave}`));
        }
    }

    // Find frequencies for every note in array
    const referenceNotePosition = noteArray.indexOf(referenceNoteName);
    let firstValue = -Math.abs(referenceNotePosition)

    let noteNameIndex = 0;
    for (let i = firstValue; i < noteArray.length - referenceNotePosition; i++) {
        result.push({
            'noteName': noteArray[noteNameIndex],
            'frequency': calcFrequency(referenceNoteFrequency, i)
        });
        noteNameIndex++;
    }
    return result;
}