export type MicStatus = "idle" | "granted" | "denied" | "error";

export async function requestMic(): Promise<MicStatus> {
  try {
    const res = await navigator.mediaDevices.getUserMedia({ audio: true });
    res.getTracks().forEach((t) => t.stop());
    return "granted";
  } catch (err) {
    if (err instanceof DOMException && err.name === "NotAllowedError") return "denied";
    return "error";
  }
}
