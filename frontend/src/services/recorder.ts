export interface RecordingResult {
  blob: Blob;
  durationMs: number;
}

export class SessionRecorder {
  private chunks: Blob[] = [];
  private mediaRecorder?: MediaRecorder;
  private startTime?: number;

  async start(stream: MediaStream) {
    this.chunks = [];
    this.startTime = performance.now();
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.mediaRecorder.start();
  }

  async stop(): Promise<RecordingResult> {
    if (!this.mediaRecorder) throw new Error("Recorder not started");
    const stopped = new Promise<void>((resolve) => {
      this.mediaRecorder!.onstop = () => resolve();
    });
    this.mediaRecorder.stop();
    await stopped;

    const blob = new Blob(this.chunks, { type: "audio/webm" });
    const durationMs = (performance.now() - (this.startTime || performance.now())) | 0;
    return { blob, durationMs };
  }
}
