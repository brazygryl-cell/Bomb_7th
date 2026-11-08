const $ = s => document.querySelector(s);
const $ = s => [...document.querySelectorAll(s)];

let soundsEnabled = true;
let audioCtx;
function ensureAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==="suspended") audioCtx.resume();
}
function tone(freq=440,dur=.12,type="sine",vol=.05,delay=0){
  if(!soundsEnabled) return;
  ensureAudio();
  const o=audioCtx.createOscillator(), g=audioCtx.createGain();
  o.type=type; o.frequency.value=freq; g.gain.value=vol;
  o.connect(g); g.connect(audioCtx.destination);
  const t=audioCtx.currentTime+delay;
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.start(t); o.stop(t+dur);
}
function uiSound(name){
  if(!soundsEnabled) return;
  if(name==="click"){tone(520,.06,"square",.025);tone(700,.05,"square",.018,.06)}
  if(name==="next"){tone(420,.07,"sine",.03);tone(620,.08,"sine",.03,.07)}
  if(name==="wrong"){tone(180,.16,"sawtooth",.04);tone(120,.2,"sawtooth",.04,.12)}
  if(name==="zap"){tone(900,.04,"square",.04);tone(300,.14,"sawtooth",.035,.03)}
  if(name==="success"){tone(523,.1,"sine",.04);tone(659,.1,"sine",.04,.1);tone(784,.18,"sine",.045,.2)}
  if(name==="alarm"){tone(220,.16,"square",.035);tone(160,.16,"square",.035,.18)}
  if(name==="pop"){tone(760,.055,"triangle",.025);tone(980,.07,"triangle",.02,.05)}
}

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

function enrichContent(day,slide){
  let extra="";
  const t=slide.type;
  if(t==="Notes" && richerNotes[day.topic]){
    extra="<div class='copy-block'><span class='copy-label'>✍ COPY THIS</span><ul>"+
      richerNotes[day.topic].map(x=>"<li>"+x+"</li>").join("")+
      "</ul></div>";
  }
  if(t==="Bell Ringer") extra+="<div class='fun-tip'>⏱ MISSION BRIEFING: Write first. Talk second. Be ready to defend your answer.</div>";
  if(t==="Vocabulary") extra+="<div class='fun-tip'>🎴 VOCAB CHECK: Pick one word you could explain to a classmate without reading the definition.</div>";
  if(t==="Activity") extra+="<div class='fun-tip'>🧰 BUILD RULE: Test one change at a time. Random wire-moving does not count as troubleshooting.</div>";
  if(t==="Exit Ticket") extra+="<div class='fun-tip'>✅ FINAL CHECK: Your answer should use at least one vocabulary word from today.</div>";
  return slide.html+extra;
}
const stickerByType={"Bell Ringer":"⏱️","Objective":"🎯","Vocabulary":"🧠","Notes":"✍️","Activity":"🛠️","Exit Ticket":"✅"};
const themeByType={"Bell Ringer":"theme-bell","Objective":"theme-objective","Vocabulary":"theme-vocab","Notes":"theme-notes","Activity":"theme-activity","Exit Ticket":"theme-exit"};


const circuitStageNames = {
  "Bell Ringer":"POWER SOURCE ONLINE",
  "Objective":"SWITCH CLOSED • MISSION SET",
  "Vocabulary":"CURRENT FLOWING • COMPONENT ID",
  "Notes":"CIRCUIT ENERGIZED • DATA TRANSFER",
  "Activity":"LOAD ENGAGED • BUILD MODE",
  "Exit Ticket":"FINAL DIAGNOSTIC • SYSTEM CHECK"
};
function updateCircuitProgress(){
  const progress = $("#circuitProgress");
  if(!progress) return;
  const nodes=$("#circuitProgress .node"), traces=$("#circuitProgress .trace");
  nodes.forEach((n,i)=>{
    n.classList.toggle("complete",i<currentSlide);
    n.classList.toggle("active",i===currentSlide);
  });
  traces.forEach((t,i)=>{
    t.classList.toggle("complete",i<currentSlide);
    t.classList.toggle("active",i===currentSlide-1 || i===currentSlide);
  });
}
function sparkBurst(count=8){
  const stage=$("#slideStage");
  if(!stage) return;
  for(let i=0;i<count;i++){
    const s=document.createElement("span");
    s.className="spark"; s.textContent=Math.random()>.5?"✦":"⚡";
    s.style.left=(20+Math.random()*60)+"%";
    s.style.top=(20+Math.random()*55)+"%";
    s.style.setProperty("--dx",(Math.random()*180-90)+"px");
    s.style.setProperty("--dy",(Math.random()*120-60)+"px");
    stage.appendChild(s);
    setTimeout(()=>s.remove(),800);
  }
}
function pulseCircuit(){
  const stage=$("#slideStage");
  if(!stage) return;
  uiSound("zap");
  stage.classList.remove("pulse-circuit"); void stage.offsetWidth; stage.classList.add("pulse-circuit");
  sparkBurst(10);
  setTimeout(()=>stage.classList.remove("pulse-circuit"),900);
}
const pulseBtn=$("#circuitPulseBtn");
if(pulseBtn) pulseBtn.onclick=pulseCircuit;

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

let currentLesson = 0, currentSlide = 0;
let lessonDefault = 180, lessonRemaining = 180, lessonInterval = null;
let projectDefault = 60, projectRemaining = 60, projectInterval = null;
let lessonGaryPlayed = false, projectGaryPlayed = false;
const GARY_FALLBACK = 10.475;

const gary = $("#garyAudio"), factory = $("#factoryAudio");
$("#soundToggle").onclick=()=>{soundsEnabled=!soundsEnabled;$("#soundToggle").textContent=soundsEnabled?"🔊 SOUNDS ON":"🔇 SOUNDS OFF";$("#soundToggle").setAttribute("aria-pressed",String(soundsEnabled));if(soundsEnabled)uiSound("pop")};

function show(id){
  $$(".screen").forEach(x=>x.classList.remove("active"));
  $(id).classList.add("active");
}
const openLessonsBtn=$("#openLessons"); if(openLessonsBtn) openLessonsBtn.onclick=()=>{uiSound("zap");show("#lessonMenu")};
const openProjectBtn=$("#openProject"); if(openProjectBtn) openProjectBtn.onclick=()=>{uiSound("alarm");show("#projectScreen")};
$$(".back-home").forEach(b=>b.onclick=()=>show("#homeScreen"));
$("#backToDays").onclick=()=>{stopLessonTimer();show("#lessonMenu")};

const dayGrid=$("#dayGrid");
lessons.forEach((d,i)=>{
  const b=document.createElement("button");
  b.className="day-card";
  b.innerHTML=`<span class="date">${d.date}</span><strong>${d.topic}</strong><small>Bell Ringer • Notes • Vocab • Activity • Exit Ticket</small>`;
  b.onclick=()=>{uiSound("click");openLesson(i)};
  dayGrid.appendChild(b);
});

function openLesson(i){currentLesson=i;currentSlide=0;show("#lessonDeck");renderSlide();setTimeout(()=>pulseCircuit(),250)}
function renderSlide(){uiSound("pop");
  const day=lessons[currentLesson], s=day.slides[currentSlide];
  $("#deckDate").textContent=day.date; $("#deckTopic").textContent=day.topic;
  $("#slideCount").textContent=`${currentSlide+1} / ${day.slides.length}`;
  $("#slideBadge").textContent=s.type.toUpperCase(); $("#slideTitle").textContent=s.title; $("#slideBody").innerHTML=enrichContent(day,s); $("#slideSticker").textContent=stickerByType[s.type]||"⚡"; $("#slideStage").className="slide-stage "+(themeByType[s.type]||"")+" stage-enter"; $("#stageCallout").textContent=circuitStageNames[s.type]||"SYSTEM ONLINE"; updateCircuitProgress(); setTimeout(()=>$("#slideStage").classList.remove("stage-enter"),500);
  $("#slideTimerArea").classList.toggle("hidden",!s.timer);
  if(s.timer){resetLessonTimer(false)}
}
$("#nextSlide").onclick=()=>{const max=lessons[currentLesson].slides.length-1;if(currentSlide<max){uiSound("next");sparkBurst(5);currentSlide++;renderSlide();setTimeout(()=>pulseCircuit(),120)}};
$("#prevSlide").onclick=()=>{if(currentSlide>0){uiSound("click");currentSlide--;renderSlide()}};

function audioLen(){return Number.isFinite(gary.duration)&&gary.duration>0?gary.duration:GARY_FALLBACK}
function fmt(v){const sec=Math.max(0,Math.ceil(v));return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`}
function setStatus(txt,color){$("#systemStatus").textContent=txt;$("#statusDot").style.background=color}
function flash(kind="red"){const f=$("#flashLayer");f.className="";void f.offsetWidth;f.classList.add(kind==="green"?"green":"flash");setTimeout(()=>f.className="",1100)}
function shake(big=false){document.body.classList.add(big?"mega-shake":"shake");setTimeout(()=>document.body.classList.remove(big?"mega-shake":"shake"),big?1800:800)}
function play(a){a.currentTime=0;a.play().catch(()=>{})}
function detonate(){uiSound("alarm");setStatus("ALARM TRIGGERED","#ff4d5e");flash();shake(true)}

function runCountdown(kind){
  const isLesson=kind==="lesson";
  const getRem=()=>isLesson?lessonRemaining:projectRemaining;
  const setRem=v=>{if(isLesson)lessonRemaining=v;else projectRemaining=v};
  const getInt=()=>isLesson?lessonInterval:projectInterval;
  const setInt=v=>{if(isLesson)lessonInterval=v;else projectInterval=v};
  clearInterval(getInt());
  if(isLesson) lessonGaryPlayed=false; else projectGaryPlayed=false;
  const start=performance.now(), starting=getRem();
  setStatus("SYSTEM ARMED","#ff4d5e");
  setInt(setInterval(()=>{
    const elapsed=(performance.now()-start)/1000;
    const rem=Math.max(0,starting-elapsed); setRem(rem);
    if(isLesson) $("#lessonTimerDisplay").textContent=fmt(rem); else $("#projectTimerDisplay").textContent=fmt(rem);
    const played=isLesson?lessonGaryPlayed:projectGaryPlayed;
    if(!played && rem<=audioLen() && rem>0){
      play(gary);
      if(isLesson) lessonGaryPlayed=true; else projectGaryPlayed=true;
    }
    if(rem<=0){
      clearInterval(getInt()); setInt(null);
      if(isLesson) $("#lessonTimerDisplay").textContent="00:00"; else $("#projectTimerDisplay").textContent="00:00";
      detonate();
    }
  },100));
}
function stopLessonTimer(){if(lessonInterval)clearInterval(lessonInterval);lessonInterval=null}
function resetLessonTimer(update=true){stopLessonTimer();gary.pause();gary.currentTime=0;lessonRemaining=lessonDefault;lessonGaryPlayed=false;if(update)$("#lessonTimerDisplay").textContent=fmt(lessonRemaining);else $("#lessonTimerDisplay").textContent=fmt(lessonRemaining);setStatus("SYSTEM SAFE","#42cc83")}
$$("[data-time]").forEach(b=>b.onclick=()=>{lessonDefault=+b.dataset.time;resetLessonTimer()});
$("#lessonTimerStart").onclick=()=>{uiSound("alarm");pulseCircuit();runCountdown("lesson")};
$("#lessonTimerReset").onclick=()=>resetLessonTimer();

function resetProject(){if(projectInterval)clearInterval(projectInterval);projectInterval=null;gary.pause();gary.currentTime=0;projectRemaining=projectDefault;projectGaryPlayed=false;$("#projectTimerDisplay").textContent=fmt(projectRemaining);setStatus("SYSTEM SAFE","#42cc83")}
$$("[data-project-time]").forEach(b=>b.onclick=()=>{projectDefault=+b.dataset.projectTime;resetProject()});
$("#projectArm").onclick=()=>runCountdown("project");
$("#projectWrong").onclick=()=>{uiSound("wrong");projectRemaining=Math.max(0,projectRemaining-5);$("#projectTimerDisplay").textContent=fmt(projectRemaining);flash();shake()};
$("#projectDefuse").onclick=()=>{uiSound("success");if(projectInterval)clearInterval(projectInterval);projectInterval=null;gary.pause();gary.currentTime=0;setStatus("DEVICE DEFUSED","#42cc83");flash("green");shake()};
$("#projectReset").onclick=resetProject;
$("#playFactory").onclick=()=>{uiSound("zap");play(factory);shake()};
$("#manualDetonate").onclick=detonate;

document.addEventListener("keydown",e=>{
  const k=e.key.toLowerCase();
  if(!$("#projectScreen").classList.contains("active"))return;
  if(k==="a")runCountdown("project");
  if(k==="w")$("#projectWrong").click();
  if(k==="d")$("#projectDefuse").click();
  if(k==="r")resetProject();
  if(k==="2")$("#playFactory").click();
});

gary.addEventListener("loadedmetadata",()=>console.log("Gary clip duration:",gary.duration));
resetLessonTimer(); resetProject();
