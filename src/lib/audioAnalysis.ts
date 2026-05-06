export type NoteType = 'up' | 'down' | 'space';

export interface GameNote {
  id: number;
  time: number;
  type: NoteType;
  variant: number; // 0 or 1 for visual variations
  hit: boolean;
  missed: boolean;
}

export function analyzeAudio(audioBuffer: AudioBuffer): GameNote[] {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const chunkSize = Math.floor(sampleRate / 10); // 100ms segments
  const rmsArr: number[] = [];

  // 1. Calculate Root Mean Square energy for each chunk
  for (let i = 0; i < channelData.length; i += chunkSize) {
    let sum = 0;
    const end = Math.min(i + chunkSize, channelData.length);
    for (let j = i; j < end; j++) {
      sum += channelData[j] * channelData[j];
    }
    rmsArr.push(Math.sqrt(sum / (end - i)));
  }

  // 2. Determine an adaptive threshold (80th percentile of energy)
  const sortedRms = [...rmsArr].sort((a, b) => a - b);
  const threshold = sortedRms[Math.floor(sortedRms.length * 0.80)] || 0.05;

  // 3. Find local maxima (peaks) above the threshold
  const peaks: { time: number; energy: number }[] = [];
  for (let i = 1; i < rmsArr.length - 1; i++) {
    if (
      rmsArr[i] > rmsArr[i - 1] &&
      rmsArr[i] > rmsArr[i + 1] &&
      rmsArr[i] > threshold
    ) {
      peaks.push({
        time: (i * chunkSize) / sampleRate,
        energy: rmsArr[i],
      });
    }
  }

  // 4. Filter peaks to avoid overlapping notes (min 0.3s between notes)
  const notes: GameNote[] = [];
  let lastTime = 0;
  const dirTypes: NoteType[] = ['up', 'down'];

  peaks.forEach((p, idx) => {
    if (p.time - lastTime > 0.3) {
      notes.push({
        id: idx,
        time: p.time,
        // 50% chance of 'space' (Attack), 50% separated across up/down (Dodge)
        type: Math.random() < 0.5 ? 'space' : dirTypes[Math.floor(Math.random() * dirTypes.length)],
        variant: Math.random() < 0.5 ? 0 : 1,
        hit: false,
        missed: false,
      });
      lastTime = p.time;
    }
  });

  return notes;
}
