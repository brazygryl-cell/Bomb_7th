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
  if(slide.type === "Notes" && richerNotes[day.topic] && !slide.html.includes("copy-block")){
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
{type:"Bell Ringer",title:"Input → Process → Output",html:"<p>Label the parts of this system: <b>button → circuit → LED</b>.</p><p>Which part is the INPUT? Which part is the OUTPUT? What does the circuit do in between?</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> explain how an input changes a circuit and produces an output, then test that relationship in a virtual circuit simulator.</div><div class='virtual-lab'><b>NO HARDWARE YET:</b> Today we model the system online before touching a real breadboard.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Input</b><br>An action or signal sent into a system.</div><div class='note-card vocab'><b>Process / Control</b><br>The part of the system that decides or changes what happens next.</div><div class='note-card vocab'><b>Output</b><br>The response the system produces.</div><div class='note-card vocab'><b>Signal</b><br>Information carried through a system.</div></div>"},
{type:"Notes",title:"See the system before you build it",html:"<div class='circuit-example'><div class='flow-node input-node'>INPUT<br><span>Switch / Button</span></div><div class='flow-arrow'>→</div><div class='flow-node process-node'>PROCESS<br><span>Path Opens / Closes</span></div><div class='flow-arrow'>→</div><div class='flow-node output-node'>OUTPUT<br><span>LED / Buzzer</span></div></div><div class='diagram-caption'>When the input changes, the circuit state changes. That new state controls the output.</div><div class='copy-block'><span class='copy-label'>✍ COPY THIS</span><ul><li>An input causes a change in the system.</li><li>The process/control determines whether current has a complete path.</li><li>The output communicates the result with light, sound, or motion.</li><li>Physical circuits follow the same Input → Process → Output model as computers.</li></ul></div>"},
{type:"Activity",title:"Virtual Lab: Controlled Output",html:"<div class='lab-links'><a class='lab-btn' href='https://www.tinkercad.com/circuits' target='_blank'>OPEN TINKERCAD CIRCUITS ↗</a><a class='lab-btn secondary' href='https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc-virtual-lab' target='_blank'>BACKUP: PHET DC LAB ↗</a></div><div class='note-card activity'><b>MISSION:</b><ol><li>Create one power source.</li><li>Add one switch or control.</li><li>Add one light/LED output.</li><li>Run the simulation with the switch OPEN.</li><li>Run it again with the switch CLOSED.</li><li>Record exactly what changed.</li></ol><p><b>Do not just write “it turned on.”</b> Explain what happened to the electrical path.</p></div>"},
{type:"Exit Ticket",title:"System Check",html:"<div class='note-card exit'><p>Explain the circuit using all three terms: <b>input, process/control, output.</b></p><p>What evidence showed that the input controlled the output?</p></div>",timer:true}
]},
{date:"TUE • NOV 17",topic:"Switches & Control",slides:[
{type:"Bell Ringer",title:"How do you stop a circuit?",html:"<p>A buzzer is sounding. You are NOT allowed to remove the battery.</p><p>What could you change in the circuit to stop the sound?</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> explain how a switch controls an electrical path and identify where a circuit can be interrupted to disable an output.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Control</b><br>A component that changes system behavior.</div><div class='note-card vocab'><b>Open Switch</b><br>Breaks the conductive path.</div><div class='note-card vocab'><b>Closed Switch</b><br>Completes the conductive path.</div><div class='note-card vocab'><b>Defuse Path</b><br>A connection whose interruption disables the alarm output.</div></div>"},
{type:"Notes",title:"A switch does not create power — it controls the path",html:"<div class='switch-demo'><div class='switch-case'><b>OPEN SWITCH</b><div class='wire-demo'><span class='battery-mini'>+ −</span><span class='wire-line'></span><span class='switch-open'>／ &nbsp; ●</span><span class='wire-line'></span><span class='bulb off'>LED OFF</span></div><small>Gap in path → no complete loop.</small></div><div class='switch-case'><b>CLOSED SWITCH</b><div class='wire-demo'><span class='battery-mini'>+ −</span><span class='wire-line'></span><span class='switch-closed'>●──●</span><span class='wire-line'></span><span class='bulb on'>LED ON</span></div><small>Complete path → output can activate.</small></div></div><div class='copy-block'><span class='copy-label'>✍ COPY THIS</span><ul><li>Opening a switch creates a break.</li><li>Closing a switch completes a path.</li><li>A control component changes behavior without rebuilding the whole circuit.</li><li>A defuse path works by opening the correct alarm path.</li></ul></div>"},
{type:"Activity",title:"Virtual Lab: Find the Control Point",html:"<div class='lab-links'><a class='lab-btn' href='https://www.tinkercad.com/circuits' target='_blank'>TINKERCAD ↗</a><a class='lab-btn secondary' href='https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc-virtual-lab' target='_blank'>PHET ↗</a></div><div class='note-card activity'><ol><li>Build power → switch → light → return.</li><li>Test OPEN and CLOSED.</li><li>Move the switch to a different location in the same series path.</li><li>Test again.</li><li>Answer: Does switch position in the same path change its ability to interrupt current?</li></ol><p><b>Challenge:</b> Identify two different places where opening the path would stop the output.</p></div>"},
{type:"Exit Ticket",title:"Control Logic",html:"<div class='note-card exit'>Why can opening one connection disable an alarm without disconnecting every component? Use the phrase <b>complete path</b>.</div>",timer:true}
]},
{date:"WED • NOV 18",topic:"Buzzers & Alarm Outputs",slides:[
{type:"Bell Ringer",title:"Why use more than light?",html:"<p>Why might a real warning system use both a flashing light and a sound?</p><p>Give one situation where a sound is more useful than a light.</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> compare visual and audible outputs and diagnose a system where one output works while another fails.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Buzzer</b><br>An electronic component that produces sound.</div><div class='note-card vocab'><b>Audible Output</b><br>A system response you can hear.</div><div class='note-card vocab'><b>Visual Output</b><br>A response you can see, such as an LED.</div><div class='note-card vocab'><b>Trigger</b><br>The event that activates an output.</div></div>"},
{type:"Notes",title:"One input can control different outputs",html:"<div class='branch-diagram'><div class='branch-source'>POWER</div><div class='branch-junction'>●</div><div class='branch-lines'><div>↘ <span class='branch-output green'>LED / VISUAL</span></div><div>↗ <span class='branch-output alarm'>BUZZER / SOUND</span></div></div></div><div class='diagram-caption'>If one output works and the other does not, the entire system is probably not powerless. Investigate the failed output's branch.</div><div class='copy-block'><span class='copy-label'>✍ COPY THIS</span><ul><li>Outputs communicate system state.</li><li>LEDs communicate visually; buzzers communicate audibly.</li><li>A working output is evidence that at least part of the power/path is functioning.</li><li>When only one branch fails, troubleshoot that branch before blaming the whole system.</li></ul></div>"},
{type:"Activity",title:"Virtual Alarm Model",html:"<div class='lab-links'><a class='lab-btn' href='https://www.tinkercad.com/circuits' target='_blank'>TINKERCAD CIRCUITS ↗</a><a class='lab-btn secondary' href='https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc-virtual-lab' target='_blank'>PHET IF NEEDED ↗</a></div><div class='note-card activity'><ol><li>Create one switch-controlled output.</li><li>If the simulator provides a buzzer, use it. If not, use a second light as the alarm indicator.</li><li>Create an OFF state and an ALARM state.</li><li>Then intentionally disconnect only one output.</li><li>Explain why the remaining output can still provide evidence about the system.</li></ol></div>"},
{type:"Exit Ticket",title:"Fault Evidence",html:"<div class='note-card exit'>The light works, but the buzzer does not. Give <b>two possible branch-specific faults</b> and explain why a dead battery is now a weaker hypothesis.</div>",timer:true}
]},
{date:"THU • NOV 19",topic:"Multiple Outputs",slides:[
{type:"Bell Ringer",title:"Safe, warning, alarm",html:"<p>Design three system states using only lights:</p><p><b>SAFE = ? &nbsp;&nbsp; WARNING = ? &nbsp;&nbsp; ALARM = ?</b></p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> compare series and parallel paths and design multiple outputs that represent different system states.</div>"},
{type:"Vocabulary",title:"Vocabulary",html:"<div class='note-grid'><div class='note-card vocab'><b>Branch</b><br>A separate path current can travel through.</div><div class='note-card vocab'><b>Series</b><br>Components share one current path.</div><div class='note-card vocab'><b>Parallel</b><br>Components are placed on separate branches.</div><div class='note-card vocab'><b>System State</b><br>The current condition of a system.</div></div>"},
{type:"Notes",title:"Series vs. Parallel",html:"<div class='compare-diagrams'><div class='series-card'><b>SERIES: ONE PATH</b><div class='simple-circuit'>POWER → 🟢 → 🔴 → RETURN</div><p>One break can stop everything in that path.</p></div><div class='parallel-card'><b>PARALLEL: SEPARATE BRANCHES</b><div class='simple-circuit'>POWER → ● → 🟢 → RETURN<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↘ 🔴 → RETURN</div><p>One branch can fail while another still works.</p></div></div><div class='copy-block'><span class='copy-label'>✍ COPY THIS</span><ul><li>Series components share one path.</li><li>Parallel outputs have separate branches.</li><li>Branches allow outputs to behave independently.</li><li>Different outputs can communicate SAFE, WARNING, and ALARM states.</li></ul></div>"},
{type:"Activity",title:"Virtual Lab: Two Outputs",html:"<div class='lab-links'><a class='lab-btn' href='https://www.tinkercad.com/circuits' target='_blank'>TINKERCAD ↗</a><a class='lab-btn secondary' href='https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc-virtual-lab' target='_blank'>PHET ↗</a></div><div class='note-card activity'><ol><li>Create one power source.</li><li>Add two light outputs.</li><li>First place them in one shared path.</li><li>Then redesign them on separate branches.</li><li>Disconnect ONE output branch.</li><li>Record what happens to the other output.</li></ol><p><b>Engineering question:</b> Which design is better for a system where one indicator should stay active even if the other branch fails?</p></div>"},
{type:"Exit Ticket",title:"Branch Reasoning",html:"<div class='note-card exit'>Green works. Red does not. What can you conclude about the power source, and what should you inspect next?</div>",timer:true}
]},
{date:"FRI • NOV 20",topic:"Mini Security Alarm Build",slides:[
{type:"Bell Ringer",title:"Design before simulation",html:"<p>Your virtual alarm must have a SAFE state and an ALARM state.</p><p>What input will cause the system to change states?</p>",timer:true},
{type:"Objective",title:"Today’s Mission",html:"<div class='note-card'><b>I can</b> design, simulate, test, troubleshoot, and explain a virtual security-alarm system using input, control, and multiple outputs.</div>"},
{type:"Vocabulary",title:"Engineering Review",html:"<div class='note-grid'><div class='note-card vocab'><b>Input</b><br>Starts or changes system behavior.</div><div class='note-card vocab'><b>Control Path</b><br>Determines whether the alarm output activates.</div><div class='note-card vocab'><b>Output</b><br>Communicates system state.</div><div class='note-card vocab'><b>Evidence</b><br>Observed results that support a diagnosis.</div></div>"},
{type:"Notes",title:"Model your alarm before the December build",html:"<div class='alarm-blueprint'><div class='blueprint-row'><span class='bp-box'>POWER</span><span>→</span><span class='bp-box'>INPUT / SWITCH</span><span>→</span><span class='bp-box danger'>CONTROL PATH</span></div><div class='blueprint-split'>↙ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↘</div><div class='blueprint-row'><span class='bp-box safe'>SAFE OUTPUT</span><span class='bp-box alarm'>ALARM OUTPUT</span></div></div><div class='copy-block'><span class='copy-label'>✍ COPY THIS</span><ul><li>Plan before building: input, control, outputs, and power.</li><li>Test one stage at a time.</li><li>A real defuse point must interrupt the actual alarm path.</li><li>A decoy may look important, but it should not disable the true alarm output.</li><li>Your explanation must match the circuit behavior you actually tested.</li></ul></div>"},
{type:"Activity",title:"Virtual Security Alarm Challenge",html:"<div class='lab-links'><a class='lab-btn' href='https://www.tinkercad.com/circuits' target='_blank'>BUILD IN TINKERCAD ↗</a><a class='lab-btn secondary' href='https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc-virtual-lab' target='_blank'>PHET BACKUP ↗</a></div><div class='note-card activity'><p><b>REQUIREMENTS</b></p><ol><li>One power source.</li><li>At least one switch/input.</li><li>At least two outputs or two clearly different states.</li><li>A SAFE/OFF state.</li><li>An ALARM/ON state.</li><li>One real control/defuse point.</li><li>One decoy connection or control that does NOT disable the alarm.</li></ol><p><b>TEST LOG:</b> Change one variable at a time and record what each test proves.</p></div>"},
{type:"Exit Ticket",title:"Engineering Defense",html:"<div class='note-card exit'><p>Explain your system using: <b>input, output, complete path, open circuit, evidence.</b></p><p>Identify the real defuse point and explain why the decoy does not work.</p></div>",timer:true}
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
function tone(freq=440,dur=.1,type="square",vol=.08,delay=0){
  if(!soundsEnabled) return;
  try{
    ensureAudio();
    if(!audioCtx) return;
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.type=type;
    o.frequency.value=freq;
    g.gain.value=vol;
    o.connect(g);
    g.connect(audioCtx.destination);
    const t=audioCtx.currentTime+delay;
    g.gain.setValueAtTime(vol,t);
    g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.start(t);
    o.stop(t+dur);
  }catch(e){}
}

function alarmBurst(level="nav"){
  if(!soundsEnabled) return;
  if(level==="nav"){
    // Short security-alarm pulse: repeated harsh beeps, not melodic.
    [0,.11,.22,.33].forEach((d,i)=>{
      tone(i%2===0 ? 980 : 760,.085,"square",.12,d);
    });
  }else if(level==="warning"){
    [0,.10,.20,.30,.40].forEach((d,i)=>{
      tone(i%2===0 ? 1120 : 820,.09,"square",.13,d);
    });
  }else if(level==="fault"){
    [0,.13,.26].forEach((d)=>{
      tone(170,.12,"sawtooth",.14,d);
    });
  }else if(level==="success"){
    [0,.12].forEach((d,i)=>{
      tone(i===0 ? 720 : 920,.10,"square",.10,d);
    });
  }else if(level==="siren"){
    const seq=[680,1040,680,1040,680,1040,680,1040];
    seq.forEach((f,i)=>tone(f,.15,"square",.14,i*.12));
  }
}

function uiSound(kind){
  if(kind==="next" || kind==="click") alarmBurst("nav");
  else if(kind==="zap" || kind==="warning") alarmBurst("warning");
  else if(kind==="wrong") alarmBurst("fault");
  else if(kind==="success") alarmBurst("success");
  else if(kind==="alarm") alarmBurst("siren");
  else alarmBurst("nav");
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
  uiSound("warning");
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
  const g=$("#garyAudio"), f=$("#factoryAudio");
  if(g) g.volume=1;
  if(f) f.volume=1;
  buildDayMenu();

  const openLessons=$("#openLessons");
  if(openLessons) openLessons.addEventListener("click",()=>{ uiSound("warning"); show("#lessonMenu"); });

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

  const presentationExit=$("#presentationExitBtn");
  if(presentationExit) presentationExit.addEventListener("click",exitPresentationMode);

  document.addEventListener("fullscreenchange",()=>{
    if(!document.fullscreenElement && document.body.classList.contains("app-presentation")){
      document.body.classList.remove("app-presentation");
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
  document.addEventListener("keydown",(e)=>{
    const deck=$("#lessonDeck");
    if(!deck || !deck.classList.contains("active")) return;
    if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)) return;

    if(e.key==="ArrowRight" || e.key==="ArrowDown"){
      e.preventDefault();
      $("#nextSlide")?.click();
    }else if(e.key==="ArrowLeft" || e.key==="ArrowUp"){
      e.preventDefault();
      $("#prevSlide")?.click();
    }
  });

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
