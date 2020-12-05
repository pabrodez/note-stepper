import "./styles.scss";
import ToneStep from "./ToneStep";

const toneStep = new ToneStep()
document.body.appendChild(toneStep.ui)

// start audio context
toneStep.startAudio()
// schedule a repeated event on Transport 
toneStep.startScheduleRepeat()