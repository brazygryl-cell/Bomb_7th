const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

let soundsEnabled = true;
let audioCtx = null;
let currentLesson = 0;
let currentSlide = 0;
let lessonDefault = 180;
let lessonRemaining = 180;
let lessonInterval = null;
let garyPlayed = false;
const GARY_FALLBACK = 10.475;

const richerNotes = {
"What Is a Circuit?":[
"Electric current needs a complete loop. Electricity does not simply travel to a component and stop; it must have a return path.",
"A power source creates the electrical energy that moves through the circuit.",
"A load is the part that uses electrical energy to do work, such as producing light, sound, or motion.",
"An open circuit has a break somewhere in the path. A closed circuit has a complete path."
],
"LEDs, Polarity & Resistors":[
"An LED is a diode, which means current is designed to flow through it in one direction.",
"Polarity tells us which side of a component connects toward positive and which side connects toward negative.",
"A resistor limits current. Without enough resistance, too much current can damage an LED.",
"Troubleshooting an LED starts with power, polarity, resistor placement, and the connection path."
],
"Breadboard Basics":[
"A breadboard lets us prototype circuits without soldering permanent connections.",
"Inside the breadboard, groups of holes are connected by hidden metal strips.",
"Power rails usually run along the sides and are useful for distributing positive and negative power.",
"Terminal rows in the center connect small groups of holes. Placing both legs of a component in the same connected row can prevent the circuit from working as intended."
],
"Troubleshooting Lab":[
"Troubleshooting is a process, not random trial and error.",
"Change one variable at a time so you can tell which change actually fixed the problem.",
"Start with the simplest checks: power, complete path, polarity, placement, then component condition.",
"Evidence-based troubleshooting lets you explain why the circuit failed and why your fix worked."
],
"Inputs & Outputs":[
"An input sends information or a command into a system.",
"The system processes that input by changing the state of the circuit.",
"An output is the response the system produces, such as light, sound, or motion.",
"This is the same Input → Process → Output model used in computer systems."
],
"Switches & Control":[
"A switch controls whether a conductive path is complete.",
"When a switch opens, it interrupts the path. When it closes, it completes the path.",
"Control components let users change system behavior without rebuilding the circuit.",
"In the project, a defuse connection will work by interrupting the path that activates the alarm output."
],
"Buzzers & Alarm Outputs":[
"A buzzer converts electrical energy into sound, making it an audible output.",
"Alarm systems often combine audible and visual outputs because people notice different signals in different conditions.",
"A trigger is the event that causes an alarm output to activate.",
"A well-designed alarm has a clear input, a predictable output, and a controllable path."
],
"Multiple Outputs":[
"A circuit can have more than one output and more than one branch.",
"In a series path, components share one route for current. In parallel branches, current has separate paths.",
"Different outputs can represent different system states, such as SAFE, WARNING, and ALARM.",
"Designing branches carefully is important because one change may affect one output without shutting down the entire system."
],
"Mini Security Alarm Build":[
"Good engineering starts with a plan: identify the input, outputs, power source, and control path before building.",
"Testing should happen in stages. Confirm one part works before adding another.",
"Your written explanation should match the physical circuit you built.",
"A circuit is not finished when it works once; it is finished when you can explain, test, and reproduce its behavior."
],
"Reading Circuit Diagrams":[
"A schematic represents electrical connections using symbols instead of showing the exact physical appearance of the wires.",
"Diagrams make it easier to communicate, rebuild, and troubleshoot a circuit.",
"A useful schematic shows how components connect, not where they happen to sit on a desk.",
"Engineers use diagrams because a clear model is easier to analyze than a pile of wires."
],
"Defusal Logic":[
"Defusal is really controlled troubleshooting: trace the alarm path, identify the control point, and interrupt the correct connection.",
"Start from the output you want to stop and trace backward toward the power source.",
"Decoy wires should make a circuit challenging to analyze, but the circuit must still be logically understandable.",
"Guessing is risky. A strong defusal decision is supported by the circuit path and component roles."
],
"December Project Preview":[
"Your project must be challenging because of logic, not because the wiring is messy or unsafe.",
"Every team needs a real defuse path, at least two decoy connections, and a circuit diagram that accurately matches the build.",
"The builder team must be able to explain exactly what every important wire and component does.",
"The defusing team earns success by tracing the system and defending its reasoning before changing a connection."
]
};


function enrichContent(day, slide){
  let extra = "";
  if(slide.type === "Notes" && richerNotes[day.topic]){
    extra += "<div class='copy-block'><span class='copy-label'>✍ COPY THIS</span><ul>" +
      richerNotes[day.topic].map(x => "<li>"+x+"</li>").join("") +
      "</ul></div>";
  }
  if(slide.type === "Bell Ringer") extra += "<div class='fun-tip'>⏱ MISSION BRIEFING: Write first. Talk second. Be ready to defend your answer.</div>";
  if(slide.type === "Vocabulary") extra += "<div class='fun-tip'>🎴 VOCAB CHECK: Pick one word you could explain to a classmate without reading the definition.</div>";
  if(slide.type === "Activity") extra += "<div class='fun-tip'>🧰 BUILD RULE: Test one change at a time. Random wire-moving does not count as troubleshooting.</div>";
  if(slide.type === "Exit Ticket") extra += "<div class='fun-tip'>✅ FINAL CHECK: Use at least one vocabulary word from today.</div>";
  return slide.html + extra;
}

const stickerByType = {"Bell Ringer":"⏱️","Objective":"🎯","Vocabulary":"🧠","Notes":"✍️","Activity":"🛠️","Exit Ticket":"✅"};
const themeByType = {"Bell Ringer":"theme-bell","Objective":"theme-objective","Vocabulary":"theme-vocab","Notes":"theme-notes","Activity":"theme-activity","Exit Ticket":"theme-exit"};
const stageByType = {
  "Bell Ringer":"POWER SOURCE ONLINE",
  "Objective":"SWITCH CLOSED • MISSION SET",
  "Vocabulary":"CURRENT FLOWING • COMPONENT ID",
  "Notes":"CIRCUIT ENERGIZED • DATA TRANSFER",
  "Activity":"LOAD ENGAGED • BUILD MODE",
  "Exit Ticket":"FINAL DIAGNOSTIC • SYSTEM CHECK"
};

const lessons = [
{date:"MON • NOV 9",topic:"What Is a Circuit?",slides:[
{type:"Bell Ringer",title:"What makes electricity move?",html:"<p>In your notebook: What do you think must be present for a light to turn on?</p><p><b>Bonus:</b> What would happen if one wire were removed?</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> identify the parts of a basic circuit and explain the difference between an open and closed circuit.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Circuit</b><br>A complete path electricity can travel through.</div><div class='note-card vocab'><b>Current</b><br>The flow of electric charge.</div><div class='note-card vocab'><b>Open Circuit</b><br>A broken path; current cannot complete the loop.</div><div class='note-card vocab'><b>Closed Circuit</b><br>A complete path; current can flow.</div></div>"},
{type:"Notes",title:"The basic circuit",html:"<ul><li><b>Power source:</b> provides electrical energy.</li><li><b>Conductive path:</b> wires carry current.</li><li><b>Load/output:</b> LED, buzzer, motor, etc.</li><li>Break the path anywhere → the circuit becomes open.</li></ul>"},
{type:"Activity",title:"Human Circuit Challenge",html:"<div class='note-card activity'><p>Each person represents a component. Create a complete path from power → wire → output → return path.</p><p>Ms. CJ will “break” one part. Your team identifies where the circuit became open.</p></div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'><p>1. What is the difference between an open and closed circuit?</p><p>2. Why can one missing connection stop the entire system?</p></div>",timer:true}
]},
{date:"TUE • NOV 10",topic:"LEDs, Polarity & Resistors",slides:[
{type:"Bell Ringer",title:"Why might an LED fail?",html:"<p>An LED is connected to a battery but does not light. List <b>two</b> possible reasons.</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> correctly identify LED polarity and explain why resistors are used in a circuit.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>LED</b><br>Light-emitting diode.</div><div class='note-card vocab'><b>Polarity</b><br>The correct positive/negative orientation.</div><div class='note-card vocab'><b>Anode</b><br>Positive side of an LED.</div><div class='note-card vocab'><b>Resistor</b><br>Limits current to protect components.</div></div>"},
{type:"Notes",title:"LED rules",html:"<ul><li>LEDs work in only one direction.</li><li>Long leg usually = anode (+).</li><li>Short leg usually = cathode (−).</li><li>A resistor limits current so the LED is not damaged.</li></ul>"},
{type:"Activity",title:"Build It",html:"<div class='note-card activity'>Build a working LED circuit. Then intentionally reverse the LED and record what changes. Troubleshoot before asking for help.</div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'>What are two things you should check when an LED does not turn on?</div>",timer:true}
]},
{date:"THU • NOV 12",topic:"Breadboard Basics",slides:[
{type:"Bell Ringer",title:"Hidden connections",html:"<p>Why do you think a breadboard has so many holes? Are all the holes connected?</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> identify breadboard rows and power rails and place components so they connect correctly.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Breadboard</b><br>A reusable board for building circuits without solder.</div><div class='note-card vocab'><b>Power Rail</b><br>Long connected row used for + or − power.</div><div class='note-card vocab'><b>Terminal Row</b><br>Short connected groups used for components.</div><div class='note-card vocab'><b>Jumper Wire</b><br>A wire used to connect points on the board.</div></div>"},
{type:"Notes",title:"Read the board before wiring",html:"<ul><li>Not every hole is connected.</li><li>Components must share connected rows to interact.</li><li>Power rails make distributing + and − easier.</li><li>Random placement causes invisible wiring errors.</li></ul>"},
{type:"Activity",title:"Breadboard Map",html:"<div class='note-card activity'>Use a printed breadboard map. Shade which holes are internally connected, then rebuild Tuesday’s LED circuit on the breadboard.</div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'>Explain how breadboard holes are connected and why that matters when troubleshooting.</div>",timer:true}
]},
{date:"FRI • NOV 13",topic:"Troubleshooting Lab",slides:[
{type:"Bell Ringer",title:"Fix it without guessing",html:"<p>Put these in the order you would check them: polarity, power, wire placement, component condition.</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> troubleshoot a malfunctioning circuit using evidence instead of random changes.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Troubleshoot</b><br>Systematically identify and fix a problem.</div><div class='note-card vocab'><b>Fault</b><br>The specific problem causing failure.</div><div class='note-card vocab'><b>Test</b><br>A deliberate check used to gather evidence.</div><div class='note-card vocab'><b>Evidence</b><br>Observed information that supports a diagnosis.</div></div>"},
{type:"Notes",title:"Troubleshooting sequence",html:"<ol><li>Check power.</li><li>Trace the full path.</li><li>Check polarity.</li><li>Check component placement.</li><li>Change one thing at a time.</li><li>Retest.</li></ol>"},
{type:"Activity",title:"Circuit Doctor Rotation",html:"<div class='note-card activity'>Each group receives a broken circuit. Record: <b>Problem → Evidence → Fix → Result.</b> Rotate after repair.</div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'>What troubleshooting strategy helped you locate the fault fastest today?</div>",timer:true}
]},
{date:"MON • NOV 16",topic:"Inputs & Outputs",slides:[
{type:"Bell Ringer",title:"Input → Process → Output",html:"<p>Label the input and output in this system: <b>button → circuit → buzzer</b>.</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> explain how an input causes a circuit to produce an output.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Input</b><br>A signal or action sent into a system.</div><div class='note-card vocab'><b>Output</b><br>The response produced by a system.</div><div class='note-card vocab'><b>Switch</b><br>A device that opens or closes a path.</div><div class='note-card vocab'><b>Signal</b><br>Information sent through a system.</div></div>"},
{type:"Notes",title:"Physical systems still use IPO",html:"<ul><li>Keyboard → computer → monitor</li><li>Button → circuit → LED</li><li>Switch → circuit → buzzer</li></ul>"},
{type:"Activity",title:"Button-Controlled LED",html:"<div class='note-card activity'>Build a circuit where the LED turns on only when the button/switch creates a complete path.</div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'>Identify the input and output in your circuit and explain what changed when the button was pressed.</div>",timer:true}
]},
{date:"TUE • NOV 17",topic:"Switches & Control",slides:[
{type:"Bell Ringer",title:"How do you stop a circuit?",html:"<p>If a buzzer is sounding, what could a switch do to stop it?</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> use a switch to control whether a circuit path is open or closed.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Control</b><br>A component that changes system behavior.</div><div class='note-card vocab'><b>Normally Open</b><br>Path is open until activated.</div><div class='note-card vocab'><b>Normally Closed</b><br>Path is closed until activated.</div><div class='note-card vocab'><b>Defuse Path</b><br>The connection that disables the alarm output.</div></div>"},
{type:"Notes",title:"Switches control paths",html:"<ul><li>Opening a switch breaks the path.</li><li>Closing a switch completes the path.</li><li>In December, one connection will act as the correct defuse path.</li></ul>"},
{type:"Activity",title:"Add a Control",html:"<div class='note-card activity'>Add a switch to yesterday’s LED circuit. Your circuit must have a clear ON and OFF state.</div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'>How can opening one connection disable an alarm without disconnecting every component?</div>",timer:true}
]},
{date:"WED • NOV 18",topic:"Buzzers & Alarm Outputs",slides:[
{type:"Bell Ringer",title:"Visible vs audible outputs",html:"<p>Why might an alarm system use both a light and a sound?</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> wire and control a buzzer as an audible output.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Buzzer</b><br>An electronic component that produces sound.</div><div class='note-card vocab'><b>Audible Output</b><br>A system response you can hear.</div><div class='note-card vocab'><b>Alert</b><br>A signal designed to get attention.</div><div class='note-card vocab'><b>Trigger</b><br>An event that causes an output to activate.</div></div>"},
{type:"Notes",title:"Alarm outputs",html:"<ul><li>Outputs communicate system state.</li><li>LED = visual signal.</li><li>Buzzer = audible signal.</li><li>A switch can determine when the alarm is active.</li></ul>"},
{type:"Activity",title:"Make an Alarm",html:"<div class='note-card activity'>Build a switch-controlled buzzer. If materials allow, add an LED so the system produces both sound and light.</div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'>What is the input, what is the output, and what event triggers the alarm?</div>",timer:true}
]},
{date:"THU • NOV 19",topic:"Multiple Outputs",slides:[
{type:"Bell Ringer",title:"Safe or alarm?",html:"<p>Design a two-state system: what should the green LED mean? What should the red LED mean?</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> combine multiple outputs to communicate different system states.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Branch</b><br>A separate path in a circuit.</div><div class='note-card vocab'><b>Series</b><br>Components share one path.</div><div class='note-card vocab'><b>Parallel</b><br>Components have separate branches.</div><div class='note-card vocab'><b>System State</b><br>The current condition of the system.</div></div>"},
{type:"Notes",title:"One system, several outputs",html:"<ul><li>Green can show SAFE.</li><li>Red + buzzer can show ALARM.</li><li>Separate branches allow different outputs to behave differently.</li></ul>"},
{type:"Activity",title:"Safe / Alarm Build",html:"<div class='note-card activity'>Create a circuit with a green SAFE indicator and a red/buzzer ALARM state.</div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'>Why might a system use multiple outputs instead of only one?</div>",timer:true}
]},
{date:"FRI • NOV 20",topic:"Mini Security Alarm Build",slides:[
{type:"Bell Ringer",title:"Design before building",html:"<p>List the minimum components your alarm needs to work.</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> design, build, test, and explain a simple security alarm circuit.</div>"},
{type:"Vocabulary",title:"Review Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Input</b></div><div class='note-card vocab'><b>Output</b></div><div class='note-card vocab'><b>Open/Closed Circuit</b></div><div class='note-card vocab'><b>Troubleshoot</b></div></div>"},
{type:"Notes",title:"Build requirements",html:"<ul><li>Power source</li><li>Switch/input</li><li>LED</li><li>Buzzer</li><li>At least one resistor</li><li>Written explanation of how the alarm is stopped</li></ul>"},
{type:"Activity",title:"Mini Build",html:"<div class='note-card activity'>Build and test your alarm. Another group should be able to identify the input, output, and control path.</div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'>What part of your build would you improve before the December project?</div>",timer:true}
]},
{date:"MON • NOV 23",topic:"Reading Circuit Diagrams",slides:[
{type:"Bell Ringer",title:"Why use a diagram?",html:"<p>What is easier to understand: a pile of wires or a labeled circuit diagram? Why?</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> read and create a simple circuit diagram using standard symbols.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Schematic</b><br>A symbolic drawing of a circuit.</div><div class='note-card vocab'><b>Symbol</b><br>A simplified picture representing a component.</div><div class='note-card vocab'><b>Connection</b><br>A point where parts of a circuit join.</div><div class='note-card vocab'><b>Diagram</b><br>A visual model of how a system is arranged.</div></div>"},
{type:"Notes",title:"Read the system on paper",html:"<ul><li>Battery = power source</li><li>Line = wire/path</li><li>Resistor = current-limiting component</li><li>Switch = control</li><li>LED/buzzer = output</li></ul>"},
{type:"Activity",title:"Physical → Diagram",html:"<div class='note-card activity'>Draw the circuit you built Friday. Your diagram must match the real connections.</div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'>How can a circuit diagram help someone troubleshoot a system they did not build?</div>",timer:true}
]},
{date:"TUE • NOV 24",topic:"Defusal Logic",slides:[
{type:"Bell Ringer",title:"Trace before touching",html:"<p>If you had to stop a buzzer without turning off all power, what path would you look for?</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> trace a circuit and identify which connection controls the alarm output.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Trace</b><br>Follow the path through a circuit.</div><div class='note-card vocab'><b>Decoy</b><br>A connection meant to distract from the correct one.</div><div class='note-card vocab'><b>Control Path</b><br>The path that determines whether an output activates.</div><div class='note-card vocab'><b>Defuse</b><br>Disable the alarm by interrupting the correct path.</div></div>"},
{type:"Notes",title:"Defusal is troubleshooting",html:"<ul><li>Do not guess.</li><li>Start at the buzzer and trace backward.</li><li>Identify which connection actually feeds the alarm.</li><li>Changing the wrong connection may create a penalty.</li></ul>"},
{type:"Activity",title:"Paper Defusal Challenge",html:"<div class='note-card activity'>Teams analyze sample diagrams and circle the connection they believe would disable the buzzer. Defend your choice before the answer is revealed.</div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'>What evidence should you use before moving a wire in the December project?</div>",timer:true}
]},
{date:"WED • NOV 25",topic:"December Project Preview",slides:[
{type:"Bell Ringer",title:"Design a challenge",html:"<p>What would make a circuit challenging to defuse without making it impossible?</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> sketch a safe timed alarm concept that includes a real defuse path and decoy connections.</div>"},
{type:"Vocabulary",title:"Project Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Alarm Path</b></div><div class='note-card vocab'><b>Defuse Path</b></div><div class='note-card vocab'><b>Decoy</b></div><div class='note-card vocab'><b>Secret Key</b></div></div>"},
{type:"Notes",title:"December rules",html:"<ul><li>6 teams.</li><li>No cutting wires.</li><li>At least one correct defuse connection.</li><li>At least two decoys.</li><li>Teams must understand and diagram their own circuit.</li><li>Teacher approval required before tournament use.</li></ul>"},
{type:"Activity",title:"Concept Sketch",html:"<div class='note-card activity'>Sketch your first alarm idea: input, outputs, alarm path, defuse path, and decoy connections. Do not build yet.</div>"},
{type:"Exit Ticket",title:"Exit Ticket",html:"<div class='note-card exit'>What part of your future alarm will another team have to reason through instead of simply guess?</div>",timer:true}
]}
];


function ensureAudio(){
  if(!soundsEnabled) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === "suspended") audioCtx.resume();
  }catch(e){}
}
function tone(freq=440,dur=.08,type="sine",vol=.025,delay=0){
  if(!soundsEnabled) return;
  try{
    ensureAudio();
    if(!audioCtx) return;
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.type=type; o.frequency.value=freq; g.gain.value=vol;
    o.connect(g); g.connect(audioCtx.destination);
    const t=audioCtx.currentTime+delay;
    g.gain.setValueAtTime(vol,t);
    g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.start(t); o.stop(t+dur);
  }catch(e){}
}
function uiSound(kind){
  if(kind==="next"){ tone(420,.06); tone(650,.07,"sine",.02,.07); }
  else if(kind==="zap"){ tone(900,.04,"square",.03); tone(300,.12,"sawtooth",.025,.04); }
  else if(kind==="success"){ tone(523,.08); tone(659,.08,"sine",.025,.09); tone(784,.12,"sine",.025,.18); }
  else tone(700,.05,"triangle",.02);
}

function show(id){
  $$(".screen").forEach(el => el.classList.remove("active"));
  const target=$(id);
  if(target) target.classList.add("active");
}

function buildDayMenu(){
  const grid=$("#dayGrid");
  if(!grid) return;
  grid.innerHTML="";
  lessons.forEach((day,i)=>{
    const btn=document.createElement("button");
    btn.className="day-card";
    btn.innerHTML="<span class='date'>"+day.date+"</span><strong>"+day.topic+"</strong><small>Bell Ringer • Notes • Vocab • Activity • Exit Ticket</small>";
    btn.addEventListener("click",()=>openLesson(i));
    grid.appendChild(btn);
  });
}

function updateCircuitProgress(){
  const nodes=$$("#circuitProgress .node");
  const traces=$$("#circuitProgress .trace");
  nodes.forEach((n,i)=>{
    n.classList.toggle("complete", i < currentSlide);
    n.classList.toggle("active", i === currentSlide);
  });
  traces.forEach((t,i)=>{
    t.classList.toggle("complete", i < currentSlide);
    t.classList.toggle("active", i === currentSlide || i === currentSlide-1);
  });
}

function sparkBurst(count=6){
  const stage=$("#slideStage");
  if(!stage) return;
  for(let i=0;i<count;i++){
    const s=document.createElement("span");
    s.className="spark";
    s.textContent=Math.random()>.5 ? "✦" : "⚡";
    s.style.left=(20+Math.random()*60)+"%";
    s.style.top=(20+Math.random()*55)+"%";
    s.style.setProperty("--dx",(Math.random()*160-80)+"px");
    s.style.setProperty("--dy",(Math.random()*100-50)+"px");
    stage.appendChild(s);
    setTimeout(()=>s.remove(),800);
  }
}

function pulseCircuit(){
  const stage=$("#slideStage");
  if(!stage) return;
  uiSound("zap");
  stage.classList.remove("pulse-circuit");
  void stage.offsetWidth;
  stage.classList.add("pulse-circuit");
  sparkBurst(8);
  setTimeout(()=>stage.classList.remove("pulse-circuit"),900);
}

function openLesson(index){
  stopLessonTimer();
  currentLesson=index;
  currentSlide=0;
  show("#lessonDeck");
  renderSlide();
  setTimeout(pulseCircuit,150);
}

function renderSlide(){
  const day=lessons[currentLesson];
  const slide=day && day.slides ? day.slides[currentSlide] : null;
  if(!day || !slide) return;

  const set=(id,value)=>{ const el=$(id); if(el) el.textContent=value; };
  set("#deckDate",day.date);
  set("#deckTopic",day.topic);
  set("#slideCount",(currentSlide+1)+" / "+day.slides.length);
  set("#slideBadge",slide.type.toUpperCase());
  set("#slideTitle",slide.title);
  set("#slideSticker",stickerByType[slide.type] || "⚡");
  set("#stageCallout",stageByType[slide.type] || "SYSTEM ONLINE");

  const body=$("#slideBody");
  if(body) body.innerHTML=enrichContent(day,slide);

  const stage=$("#slideStage");
  if(stage){
    const liveClass = slide.type==="Activity" ? " activity-live" : slide.type==="Notes" ? " notes-live" : slide.type==="Exit Ticket" ? " exit-live" : "";
    stage.className="slide-stage "+(themeByType[slide.type] || "")+liveClass;
  }
  const timerArea=$("#slideTimerArea");
  if(timerArea) timerArea.classList.toggle("hidden",!slide.timer);

  updateCircuitProgress();
  if(slide.timer) resetLessonTimer();
}

function fmt(v){
  const sec=Math.max(0,Math.ceil(v));
  return String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");
}
function audioLen(){
  const g=$("#garyAudio");
  return g && Number.isFinite(g.duration) && g.duration>0 ? g.duration : GARY_FALLBACK;
}
function stopLessonTimer(){
  if(lessonInterval) clearInterval(lessonInterval);
  lessonInterval=null;
}
function resetLessonTimer(){
  stopLessonTimer();
  lessonRemaining=lessonDefault;
  garyPlayed=false;
  const g=$("#garyAudio");
  if(g){ try{ g.pause(); g.currentTime=0; }catch(e){} }
  const d=$("#lessonTimerDisplay");
  if(d) d.textContent=fmt(lessonRemaining);
}
function startLessonTimer(){
  stopLessonTimer();
  const g=$("#garyAudio");
  const startedAt=performance.now();
  const starting=lessonRemaining;
  garyPlayed=false;
  pulseCircuit();
  lessonInterval=setInterval(()=>{
    const elapsed=(performance.now()-startedAt)/1000;
    lessonRemaining=Math.max(0,starting-elapsed);
    const d=$("#lessonTimerDisplay");
    if(d) d.textContent=fmt(lessonRemaining);
    if(!garyPlayed && lessonRemaining<=audioLen() && lessonRemaining>0 && g){
      garyPlayed=true;
      try{ g.currentTime=0; g.play().catch(()=>{}); }catch(e){}
    }
    if(lessonRemaining<=0){
      stopLessonTimer();
      if(d) d.textContent="00:00";
      document.body.classList.add("mega-shake");
      const flash=$("#flashLayer");
      if(flash){ flash.className="flash"; setTimeout(()=>flash.className="",1000); }
      setTimeout(()=>document.body.classList.remove("mega-shake"),1500);
    }
  },100);
}



function enterPresentationMode(){
  document.body.classList.add("app-presentation");
  document.body.classList.add("presentation-mode");
  const g=$("#globalFullscreenBtn");
  const l=$("#fullscreenBtn");
  if(g) g.textContent="✕ EXIT PRESENTATION";
  if(l) l.textContent="✕ EXIT FULL SCREEN";
  if(document.documentElement.requestFullscreen){
    document.documentElement.requestFullscreen().catch(()=>{});
  }
}
function exitPresentationMode(){
  document.body.classList.remove("app-presentation");
  document.body.classList.remove("presentation-mode");
  const g=$("#globalFullscreenBtn");
  const l=$("#fullscreenBtn");
  if(g) g.textContent="⛶ PRESENTATION";
  if(l) l.textContent="⛶ FULL SCREEN";
  if(document.fullscreenElement && document.exitFullscreen){
    document.exitFullscreen().catch(()=>{});
  }
}
function togglePresentationMode(){
  if(document.body.classList.contains("app-presentation")) exitPresentationMode();
  else enterPresentationMode();
}

function init(){
  buildDayMenu();

  const openLessons=$("#openLessons");
  if(openLessons) openLessons.addEventListener("click",()=>{ uiSound("zap"); show("#lessonMenu"); });

  const openProject=$("#openProject");
  if(openProject) openProject.addEventListener("click",()=>show("#projectScreen"));

  $$(".back-home").forEach(btn=>btn.addEventListener("click",()=>show("#homeScreen")));

  const back=$("#backToDays");
  if(back) back.addEventListener("click",()=>{ stopLessonTimer(); show("#lessonMenu"); });

  const next=$("#nextSlide");
  if(next) next.addEventListener("click",()=>{
    const max=lessons[currentLesson].slides.length-1;
    if(currentSlide<max){
      currentSlide++;
      uiSound("next");
      renderSlide();
      setTimeout(pulseCircuit,100);
    }
  });

  const prev=$("#prevSlide");
  if(prev) prev.addEventListener("click",()=>{
    if(currentSlide>0){
      currentSlide--;
      renderSlide();
    }
  });

  const pulse=$("#circuitPulseBtn");
  if(pulse) pulse.addEventListener("click",pulseCircuit);

  const fs=$("#fullscreenBtn");
  if(fs) fs.addEventListener("click",togglePresentationMode);

  const globalFs=$("#globalFullscreenBtn");
  if(globalFs) globalFs.addEventListener("click",togglePresentationMode);

  document.addEventListener("fullscreenchange",()=>{
    if(!document.fullscreenElement && document.body.classList.contains("app-presentation")){
      document.body.classList.remove("app-presentation");
      document.body.classList.remove("presentation-mode");
      const g=$("#globalFullscreenBtn");
      const l=$("#fullscreenBtn");
      if(g) g.textContent="⛶ PRESENTATION";
      if(l) l.textContent="⛶ FULL SCREEN";
    }
  });

  $$("[data-time]").forEach(btn=>btn.addEventListener("click",()=>{
    lessonDefault=Number(btn.dataset.time)||180;
    resetLessonTimer();
  }));

  const start=$("#lessonTimerStart");
  if(start) start.addEventListener("click",startLessonTimer);
  const reset=$("#lessonTimerReset");
  if(reset) reset.addEventListener("click",resetLessonTimer);

  const sound=$("#soundToggle");
  if(sound) sound.addEventListener("click",()=>{
    soundsEnabled=!soundsEnabled;
    sound.textContent=soundsEnabled ? "🔊 SOUNDS ON" : "🔇 SOUNDS OFF";
  });

  resetLessonTimer();
}

let ambientTimer=null;
function startAmbientCircuit(){
  clearInterval(ambientTimer);
  ambientTimer=setInterval(()=>{
    const deck=$("#lessonDeck");
    if(!deck || !deck.classList.contains("active")) return;
    const stage=$("#slideStage");
    if(!stage) return;
    stage.classList.add("pulse-circuit");
    if(Math.random()>.55) sparkBurst(3);
    setTimeout(()=>stage.classList.remove("pulse-circuit"),650);
  },7000);
}
document.addEventListener("DOMContentLoaded",()=>{init();startAmbientCircuit();});
