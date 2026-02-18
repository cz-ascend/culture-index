```js
export const ROLES = {
  investment: {
    label: "Investment Function", icon: "📈", euDemand: 75,
    idealTraits: { autonomy:[65,100], social:[50,80], patience:[20,55], conformity:[35,65], energy:[60,100] },
    coreValueWeights: { integrity:1.5, humility:1.0, grit:1.5, learning:1.2 },
    keyQualities: ["Conviction under uncertainty","Fast pattern recognition","Ego-detached from positions","High risk/reward orientation","Intellectual curiosity"],
    redFlag: "Very high Conformity + very low Autonomy — may be too passive for conviction-based decision making",
  },
  accountManagement: {
    label: "Account Management", icon: "🤝", euDemand: 60,
    idealTraits: { autonomy:[40,70], social:[65,100], patience:[45,75], conformity:[35,65], energy:[50,80] },
    coreValueWeights: { integrity:1.5, humility:1.5, grit:1.0, learning:1.0 },
    keyQualities: ["Empathy and active listening","Proactive communication","Conflict de-escalation","Translates complexity simply","Relationship depth"],
    redFlag: "Very low Social Ability + very high Patience — may be too passive for proactive relationship building",
  },
  operations: {
    label: "Operations Function", icon: "⚙️", euDemand: 45,
    idealTraits: { autonomy:[20,55], social:[35,65], patience:[60,100], conformity:[65,100], energy:[40,70] },
    coreValueWeights: { integrity:1.5, humility:1.2, grit:1.3, learning:0.8 },
    keyQualities: ["Attention to detail","Process discipline","Consistency under pressure","Systems thinking","Calm in operational crises"],
    redFlag: "Very high Autonomy + very low Conformity — may resist processes and create inconsistency",
  },
}
export const SECTIONS = [
  { id:"autonomy", title:"Section A", questions:[
    {id:"a1",text:"When beginning a new project, which do you find yourself doing?",a:"Looking to others for direction on how to proceed",b:"Figuring out the path forward on my own"},
    {id:"a2",text:"When a decision needs to be made and input is limited, you typically:",a:"Hold off until you can gather more perspectives",b:"Make the call and adjust later if needed"},
    {id:"a3",text:"In a group with no designated leader, you tend to:",a:"Focus on contributing to whoever steps up",b:"Naturally begin coordinating the group"},
    {id:"a4",text:"When you disagree with a colleague's approach, you usually:",a:"Let them run with it unless asked for input",b:"Voice your perspective clearly"},
    {id:"a5",text:"Your preferred working arrangement is:",a:"Working closely within a defined structure",b:"Setting your own direction and pace"},
  ]},
  { id:"social", title:"Section B", questions:[
    {id:"b1",text:"After a long day of back-to-back meetings, you feel:",a:"Drained and in need of quiet time",b:"Energized and ready to keep going"},
    {id:"b2",text:"When working through a complex problem, you prefer to:",a:"Work through it privately before sharing conclusions",b:"Talk it out with others as you think"},
    {id:"b3",text:"When building professional relationships, you typically:",a:"Develop a few deep, trusted connections over time",b:"Connect broadly with many people quickly"},
    {id:"b4",text:"When you want to move someone toward a decision, you:",a:"Present the data and let it speak for itself",b:"Actively build a case and work to persuade"},
    {id:"b5",text:"Your most productive environment tends to be:",a:"Quiet and focused, with minimal interruptions",b:"Active and social, with ongoing dialogue"},
  ]},
  { id:"patience", title:"Section C", questions:[
    {id:"c1",text:"Which environment brings out your best work?",a:"Fast-moving, where priorities shift and urgency is high",b:"Stable, where you can build depth over time"},
    {id:"c2",text:"Doing the same task repeatedly over weeks:",a:"Starts to feel tedious fairly quickly",b:"Becomes something I can do with precision and confidence"},
    {id:"c3",text:"When a process takes longer than expected, you tend to:",a:"Look for ways to accelerate or skip steps",b:"Trust that working through it thoroughly is worth it"},
    {id:"c4",text:"When faced with a big decision:",a:"You'd rather make a call and course-correct than delay",b:"You prefer to sit with it and weigh it carefully"},
    {id:"c5",text:"Your attention is more naturally drawn to:",a:"The overall picture and where things are heading",b:"The mechanics of how something actually works"},
  ]},
  { id:"conformity", title:"Section D", questions:[
    {id:"d1",text:"When you encounter a rule that seems inefficient, you:",a:"Tend to question whether it's the best way",b:"Follow it, trusting it exists for good reason"},
    {id:"d2",text:"In your work, you place more value on:",a:"Getting to the right outcome by the best available path",b:"Ensuring every step is accurate and well-documented"},
    {id:"d3",text:"Your natural working style is:",a:"Fluid — you adapt the approach as things evolve",b:"Structured — you prefer a clear process to follow"},
    {id:"d4",text:"When given a detailed checklist:",a:"You find it more limiting than helpful",b:"You find it reassuring and useful"},
    {id:"d5",text:"When reviewing completed work, your instinct is to:",a:"Check that it achieved what it set out to do",b:"Verify that every detail is correct and nothing was missed"},
  ]},
  { id:"energy", title:"Section E", questions:[
    {id:"e1",text:"How would you describe your natural operating tempo?",a:"Consistent and measured",b:"Intense and high-output"},
    {id:"e2",text:"At the end of a demanding work week, you typically feel:",a:"Ready to decompress and recharge",b:"Frustrated it's over — there's still more to do"},
    {id:"e3",text:"When you take on a workload, you generally:",a:"Stay within scope and protect your bandwidth",b:"Expand into whatever needs doing, even beyond your role"},
    {id:"e4",text:"After work hours, your relationship with work is:",a:"Clear separation — you switch off consciously",b:"Blurred — ideas and tasks follow you home"},
    {id:"e5",text:"Does your current role match your natural energy level?",a:"Yes — the pace suits me well",b:"Not quite — I often feel I need to dial up or down significantly"},
  ]},
  { id:"integrity", title:"Section F", questions:[
    {id:"int1",text:"When delivering a project, you focus more on:",a:"Hitting the goal through whatever works",b:"The quality of how the goal is reached, not just whether it is"},
    {id:"int2",text:"In team settings, you share information:",a:"Selectively, based on who needs to know",b:"Openly, defaulting to transparency unless there's a reason not to"},
    {id:"int3",text:"When you sense tension or a problem building, you:",a:"Address it directly before it grows",b:"Monitor it and wait for a better moment"},
    {id:"int4",text:"Your position on an issue tends to:",a:"Stay consistent regardless of who you're talking to",b:"Shift slightly depending on the audience and context"},
    {id:"int5",text:"When something goes wrong on your watch, your first instinct is to:",a:"Understand what happened and communicate it clearly",b:"Manage the situation carefully before surfacing it"},
  ]},
  { id:"humility", title:"Section G", questions:[
    {id:"hum1",text:"When a project succeeds, what matters most to you?",a:"That the team's contribution is recognized",b:"That your specific role in the outcome is visible"},
    {id:"hum2",text:"When someone challenges your thinking:",a:"You find it worth exploring, even if you ultimately disagree",b:"You tend to defend your position unless the counter is very compelling"},
    {id:"hum3",text:"How do you typically respond when you realize you were wrong?",a:"Acknowledge it directly and update your position",b:"Reflect on it privately, then quietly adjust"},
    {id:"hum4",text:"In group discussions, you find yourself:",a:"Listening most of the time and speaking when you have something to add",b:"Naturally taking up more of the airtime"},
    {id:"hum5",text:"When a colleague is struggling with something you're good at:",a:"You proactively offer to help",b:"You focus on your own work and let them figure it out"},
  ]},
  { id:"grit", title:"Section H", questions:[
    {id:"grit1",text:"When something you've worked hard on fails, you:",a:"Feel it, but it sharpens your determination to try again",b:"Take time to recover before re-engaging"},
    {id:"grit2",text:"When a strategy isn't producing results:",a:"You keep iterating — there's a way to make it work",b:"You reassess and consider cutting your losses"},
    {id:"grit3",text:"Which type of work energizes you more?",a:"Long-horizon projects that build toward something big",b:"Shorter sprints with clear, frequent wins"},
    {id:"grit4",text:"When you receive sharp criticism:",a:"You use it to focus and improve",b:"You need time to process before it becomes useful"},
    {id:"grit5",text:"When conditions change and a commitment becomes harder to keep:",a:"You protect the commitment and adapt around it",b:"You re-negotiate the commitment to fit the new reality"},
  ]},
  { id:"learning", title:"Section I", questions:[
    {id:"cl1",text:"Outside of work requirements, how often do you seek out new knowledge?",a:"Frequently — curiosity drives me independently of what's needed",b:"When it's relevant to something I'm working on"},
    {id:"cl2",text:"When you've mastered a skill, you:",a:"Look for the next gap to fill",b:"Continue refining and deepening what you already know"},
    {id:"cl3",text:"Your relationship with your own blind spots is:",a:"You actively try to surface and address them",b:"You focus on building on your strengths"},
    {id:"cl4",text:"When tackling a problem, you tend to:",a:"Experiment with new methods even if outcome is uncertain",b:"Apply what has worked in similar situations before"},
    {id:"cl5",text:"Your approach to mentorship and feedback:",a:"You seek it out regularly as a development tool",b:"You draw on it when you feel stuck or uncertain"},
  ]},
]

export const PROFILES = [
  { name:"The Enterpriser", emoji:"🦁", summary:"High-drive, visionary, decisive leader",
    description:"Wired to lead, build, scale, and win. Initiates without permission, influences naturally, thrives in high-stakes environments.",
    strengths:["Executive leadership","Deal-making & negotiation","Vision casting","Investment decisions","Growth environments"],
    blindSpots:["May steamroll slower personalities","Under-values detail work","Can pivot too fast","Struggles delegating patiently"],
    thrivesIn:["Competitive, autonomous cultures","Fast-paced, outcome-focused roles","Turnaround or growth scenarios"],
    strugglesWith:["Highly regulated environments","Sustained detail focus","Slow consensus cultures"],
    pairWith:"High-C / High-D operators",
    match: s => s.autonomy>=65 && s.social>=55 && s.patience<=45 && s.conformity<=45 },
  { name:"The Analyst", emoji:"🔬", summary:"Precise, systematic, accuracy-driven",
    description:"Finds truth in data. Builds robust systems, catches what others miss, holds the standard on quality.",
    strengths:["Deep research & due diligence","Risk identification","Process design","Quality control","Complex problem solving"],
    blindSpots:["May over-analyze before acting","Can struggle with ambiguity","May appear rigid","Undervalues speed"],
    thrivesIn:["Data-rich, research environments","Roles with clear standards","Structured workflows"],
    strugglesWith:["Ambiguous, undefined problems","Fast-pivot cultures","High social visibility"],
    pairWith:"High-A / High-B influencers",
    match: s => s.conformity>=65 && s.autonomy<=50 && s.social<=50 },
  { name:"The Collaborator", emoji:"🤝", summary:"Empathetic, relationship-first, steady glue",
    description:"Holds teams together. Reads the room, supports others generously, and builds trust over time.",
    strengths:["Client relationship management","Team cohesion","Mentoring","Steady execution","Conflict de-escalation"],
    blindSpots:["Avoids difficult conversations","Can over-accommodate","Under-advocates for self","Slow to change course"],
    thrivesIn:["Collaborative, people-first cultures","Long-term relationship roles","Stable environments"],
    strugglesWith:["High-conflict environments","Rapid change","Purely results-driven cultures"],
    pairWith:"High-A / Low-C drivers",
    match: s => s.social>=60 && s.patience>=60 && s.autonomy<=55 },
  { name:"The Operator", emoji:"⚙️", summary:"Systematic, reliable, process-driven executor",
    description:"The backbone of operations. Follows through, maintains systems, and delivers consistently.",
    strengths:["Process management","Compliance & accuracy","Consistent execution","Risk mitigation","Operational reliability"],
    blindSpots:["May resist innovation","Slowed by need for certainty","Struggles with strategic ambiguity"],
    thrivesIn:["Process-heavy, regulated environments","Roles with clear accountability","Stable workflows"],
    strugglesWith:["Fast-pivot environments","Ambiguous mandates","Startup cultures"],
    pairWith:"High-A visionaries",
    match: s => s.conformity>=65 && s.patience>=60 },
  { name:"The Catalyst", emoji:"⚡", summary:"Creative, socially intelligent, change agent",
    description:"Sparks energy in any room. Intuitive, expressive, great at getting buy-in for new ideas.",
    strengths:["Change management","Creative problem-solving","Stakeholder engagement","Innovation","Culture building"],
    blindSpots:["May leave execution to others","Distracted by new ideas","Undervalues follow-through"],
    thrivesIn:["Innovation-focused cultures","High-visibility roles","Transformation projects"],
    strugglesWith:["Maintenance roles","Rigid process environments","Repetitive detail-heavy work"],
    pairWith:"High-C / High-D operators",
    match: s => s.social>=65 && s.autonomy>=55 && s.conformity<=50 },
]

// Sections where the "a" answer scores HIGH (values sections)
export const A_HIGH_IDS = new Set([
  "int1","int3","int4","int5",
  "hum1","hum2","hum3","hum4","hum5",
  "grit1","grit2","grit3","grit4","grit5",
  "cl1","cl2","cl3","cl4","cl5"
])

// Sections where high raw score = low trait (patience, conformity are reversed)
export const REVERSE_DIMS = new Set(["patience","conformity"])
```

