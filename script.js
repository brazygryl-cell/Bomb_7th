const lessons = [
  {
    label: "MISSION 01",
    title: "What makes a circuit work?",
    text: "A complete circuit needs a power source, a conductive path, and a load/output. Break the path and the circuit becomes open."
  },
  {
    label: "MISSION 02",
    title: "Open vs. closed circuits",
    text: "Closed circuit = complete path and current can flow. Open circuit = the path is broken, so the output stops."
  },
  {
    label: "MISSION 03",
    title: "LED polarity",
    text: "LEDs only work in the correct direction. Check the anode/cathode orientation before assuming the entire circuit is broken."
  },
  {
    label: "MISSION 04",
    title: "Breadboard connections",
    text: "Breadboards hide internal connections. Trace rows and power rails carefully before moving random wires."
  },
  {
    label: "MISSION 05",
    title: "Inputs and outputs",
    text: "A button or switch can be an input. LEDs and buzzers are outputs. The circuit determines how the output responds."
  },
  {
    label: "MISSION 06",
    title: "Troubleshoot with evidence",
    text: "Do not guess. Check power, polarity, continuity, component placement, and the intended path one step at a time."
  },
  {
    label: "MISSION 07",
    title: "Defusal logic",
    text: "To stop an alarm without destroying the system, identify which path controls the alarm output and interrupt that specific path."
  }
];

let lessonIndex = 0;
let seconds = 60;
let remaining = 60;
let timer = null;
let running = false;

const display = document.querySelector("#timerDisplay");
const timerSub = document.querySelector("#timerSub");
const timerShell = document.querySelector("#timerShell");
const statusText = document.querySelector("#systemStatus");
const statusDot = document.querySelector("#statusDot");
const flashLayer = document.querySelector("#flashLayer");

function renderLesson(){
  const item = lessons[lessonIndex];
  document.querySelector("#stepLabel").textContent = item.label;
  document.querySelector("#lessonTitle").textContent = item.title;
  document.querySelector("#lessonText").textContent = item.text;
}

document.querySelector("#nextStep").addEventListener("click",()=>{
  lessonIndex = (lessonIndex + 1) % lessons.length;
  renderLesson();
});
document.querySelector("#prevStep").addEventListener("click",()=>{
  lessonIndex = (lessonIndex - 1 + lessons.length) % lessons.length;
  renderLesson();
});

document.querySelectorAll(".concept").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const concept = btn.dataset.concept;
    const messages = {
      power:"POWER: The energy source that drives the circuit.",
      path:"PATH: The conductive route current follows.",
      output:"OUTPUT: The part that does something visible or audible, like an LED or buzzer.",
      control:"CONTROL: A switch/button that opens or closes part of the circuit."
    };
    document.querySelector("#feedback").textContent = messages[concept];
    quickShake();
  });
});

function formatTime(v){
  const m = Math.floor(v/60).toString().padStart(2,"0");
  const s = (v%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}
function updateTimer(){
  display.textContent = formatTime(remaining);
  timerShell.classList.toggle("critical", remaining <= 10 && remaining > 0);
}
function setStatus(text,color){
  statusText.textContent = text;
  statusDot.style.background = color;
  statusDot.style.boxShadow = `0 0 0 4px ${color}33`;
}
function arm(){
  clearInterval(timer);
  running = true;
  timerSub.textContent = "ARMED";
  setStatus("SYSTEM ARMED","#ff4d5e");
  playAudio("audioBombStrapped");
  flash("red");
  timer = setInterval(()=>{
    remaining -= 1;
    updateTimer();
    if(remaining <= 0){
      clearInterval(timer);
      running = false;
      detonate();
    }
  },1000);
}
function pause(){
  if(!running) return;
  clearInterval(timer);
  running = false;
  timerSub.textContent = "PAUSED";
  setStatus("SYSTEM PAUSED","#ff9f43");
}
function reset(){
  clearInterval(timer);
  running = false;
  remaining = seconds;
  updateTimer();
  timerSub.textContent = "STANDBY";
  timerShell.classList.remove("critical");
  setStatus("SYSTEM SAFE","#3ac47d");
}
function defuse(){
  clearInterval(timer);
  running = false;
  timerSub.textContent = "DEFUSED";
  setStatus("DEVICE DEFUSED","#3ac47d");
  flash("green");
  document.body.classList.add("shake");
  setTimeout(()=>document.body.classList.remove("shake"),800);
}
function detonate(){
  timerSub.textContent = "DETONATED";
  setStatus("ALARM TRIGGERED","#ff4d5e");
  document.body.classList.add("mega-shake");
  flash("red");
  setTimeout(()=>document.body.classList.remove("mega-shake"),1900);
}
function wrongWire(){
  if(remaining > 5) remaining = Math.max(0,remaining-5);
  updateTimer();
  timerSub.textContent = "-5 SEC PENALTY";
  document.body.classList.add("shake");
  flash("red");
  setTimeout(()=>{
    document.body.classList.remove("shake");
    if(running) timerSub.textContent = "ARMED";
  },900);
}
function quickShake(){
  document.body.classList.add("shake");
  setTimeout(()=>document.body.classList.remove("shake"),700);
}
function flash(kind){
  flashLayer.className = "";
  void flashLayer.offsetWidth;
  flashLayer.classList.add(kind==="green"?"green-flash":"flash");
  setTimeout(()=>flashLayer.className="",1200);
}
function playAudio(id){
  const a = document.getElementById(id);
  if(!a) return;
  a.currentTime = 0;
  a.play().catch(()=>{});
}

document.querySelectorAll("[data-seconds]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    seconds = Number(btn.dataset.seconds);
    remaining = seconds;
    updateTimer();
    timerSub.textContent = "STANDBY";
  });
});
document.querySelector("#armBtn").addEventListener("click",arm);
document.querySelector("#pauseBtn").addEventListener("click",pause);
document.querySelector("#resetBtn").addEventListener("click",reset);
document.querySelector("#defuseBtn").addEventListener("click",defuse);
document.querySelector("#detonateBtn").addEventListener("click",detonate);
document.querySelector("#wrongWire").addEventListener("click",wrongWire);
document.querySelector("#bombStrapped").addEventListener("click",()=>{playAudio("audioBombStrapped");quickShake();});
document.querySelector("#bombFactory").addEventListener("click",()=>{playAudio("audioBombFactory");flash("red");});

document.querySelectorAll("#answerGrid button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const correct = btn.dataset.correct === "true";
    const feedback = document.querySelector("#feedback");
    if(correct){
      feedback.textContent = "CORRECT — troubleshoot the system logically before changing parts.";
      feedback.style.background = "#d7f7e5";
      flash("green");
    }else{
      feedback.textContent = "NOPE — that is not evidence-based troubleshooting.";
      feedback.style.background = "#ffd9de";
      wrongWire();
    }
  });
});

document.addEventListener("keydown",(e)=>{
  if(e.target.tagName === "INPUT") return;
  const k = e.key.toLowerCase();
  if(k==="a") arm();
  if(k==="p") pause();
  if(k==="r") reset();
  if(k==="d") defuse();
  if(k==="x") detonate();
  if(k==="w") wrongWire();
  if(k==="1") playAudio("audioBombStrapped");
  if(k==="2") playAudio("audioBombFactory");
});

renderLesson();
updateTimer();
