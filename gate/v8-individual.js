'use strict';
/* V8: Evidence-grounded individual interpretation.
   No random output, user names or record IDs are never used as variation seeds.
   Public sensory/chroma summaries may enrich explanations, but cannot change tactical scores. */
const GATE_V8_AXIS_TEXT=[
 {intent:"낯선 변화가 어디에서 시작됐는지 알아야 다음 행동을 선택할 수 있다고 느낀다",method:"정보의 양보다 처음 관측한 변화와 이후 발생한 변화를 비교하는 데 집중한다",cost:"관찰을 계속하는 동안 결정 시점이 늦어질 수 있다",request:"발견한 단서가 언제 결론에 반영됐는지 알려주는 동료",weak:"이미 정해진 계획을 따르는 편이 편하더라도 새 신호를 확인하는 절차를 잃지 않는 것이 좋다"},
 {intent:"모든 정보를 얻는 것보다 지금 선택해야 하는 것을 구분하는 일을 중시한다",method:"목표와 위험을 함께 놓고 우선순위를 먼저 정리한다",cost:"결론이 정리된 뒤 들어온 이견을 놓칠 수 있다",request:"결론의 근거를 짧게 검증하거나 빠진 선택지를 알려주는 동료",weak:"타인의 판단을 빌리는 것이 무능함은 아니다. 결정 기준을 먼저 공유하면 도움이 된다"},
 {intent:"움직이지 않는 시간이 또 다른 위험을 만들 수 있다고 본다",method:"명령만 기다리기보다 지금 수행할 수 있는 행동을 찾아 착수한다",cost:"행동 개시가 빠른 만큼 동료의 준비 시간과 엇갈릴 수 있다",request:"새로운 위험을 바로 알리고 따라올 수 있는 속도를 명확히 말하는 동료",weak:"먼저 움직이지 않더라도 행동 개시 신호를 구체적으로 정하면 팀이 멈추지 않는다"},
 {intent:"자신이 알아챈 사실이 타인의 판단으로 이어져야 의미가 있다고 생각한다",method:"관측한 사실과 해석을 구분한 뒤 팀이 쓸 수 있는 단서로 바꾼다",cost:"정확하게 설명하려다가 전달 시점을 놓칠 수 있다",request:"받은 보고에 어떤 행동으로 응답할지 알려주는 동료",weak:"말이 적다고 정보가 부족하다는 뜻은 아니다. 경고에 필요한 최소 정보를 합의하면 된다"},
 {intent:"사람마다 감당할 수 있는 일이 다르므로 역할은 고정될 필요가 없다고 본다",method:"상태와 능력의 차이를 고려해 누가 무엇을 맡을지 다시 배분한다",cost:"잦은 역할 변경은 동료에게 간섭처럼 느껴질 수 있다",request:"현재 가능한 범위와 원하지 않는 지원을 분명히 표현하는 동료",weak:"혼자 역할을 정하는 대신 작은 분업부터 시작하면 조율의 부담을 덜 수 있다"},
 {intent:"얻을 수 있는 성과가 충분하다면 위험도 선택의 일부라고 생각한다",method:"손실 가능성만 보지 않고 진입했을 때 확보할 기회도 계산한다",cost:"개인이 감수할 수 있는 위험과 팀 전체에 넘겨지는 위험을 혼동하기 쉽다",request:"진행 중단 조건과 남은 여력을 객관적으로 확인해 주는 동료",weak:"안전을 중시한다는 이유로 기회를 놓친다고 단정할 수 없다. 위험 허용 범위를 사전에 정하면 좋다"},
 {intent:"동료의 위험을 외면한 성공은 불완전한 결과라고 느낀다",method:"당사자의 상태와 의사를 확인하면서 지원이나 위치 조정을 찾는다",cost:"지원의 필요성을 자신이 먼저 판단하면 상대의 거절과 부딪힐 수 있다",request:"자신에게 가능한 지원과 원하지 않는 개입을 말해주는 동료",weak:"대신 구해 주는 선택을 하지 않더라도 경고와 회피 동선을 제공할 수 있다"},
 {intent:"현재의 해결책이 다음 위기의 자원 부족으로 이어지지 않기를 바란다",method:"한 번의 대응에 쓸 양과 이후를 위해 남길 여력을 분리한다",cost:"지원 요청이 급박할수록 절제가 무심함처럼 보일 수 있다",request:"요청하는 지원의 범위와 남은 자원 상태를 공유하는 동료",weak:"지금 자원을 적극적으로 사용하는 선택 자체가 잘못된 것은 아닙니다. 다만 소모 상한과 후속 계획을 함께 마련하는 편이 좋습니다"},
 {intent:"목표를 고수하는 것과 방법을 고수하는 것은 다르다고 생각한다",method:"새로운 위험이 드러나면 기존 경로 대신 가능한 대안을 찾아 바꾼다",cost:"새 전술을 공유하기 전 이미 행동하면 팀은 서로 다른 계획을 수행하게 된다",request:"전환 이유를 듣고 역할 변경에 동의할 시간을 확보하는 동료",weak:"처음 계획을 지키려는 이유를 설명하면 무리한 변경을 막는 안전장치가 될 수 있다"},
 {intent:"위기가 겹칠수록 행동의 순서를 분명하게 하는 것이 중요하다고 본다",method:"동시에 쏟아지는 경고를 실행 가능한 지시와 확인 항목으로 정돈한다",cost:"질서를 세우려는 태도가 동료의 자율적인 대응을 제한할 수 있다",request:"지금 들은 지시가 실행 가능한지 짧게 되돌려 주는 동료",weak:"모든 상황을 통제할 필요는 없다. 역할과 중단 신호만 합의해도 혼란을 줄일 수 있다"},
 {intent:"물러나는 선택도 작전의 일부이며, 언제 멈출지가 중요하다고 본다",method:"성과가 가까워 보여도 중단 조건을 확인하고 귀환 경로를 검토한다",cost:"안전한 철수를 우선하다가 아직 남아 있는 기회를 접을 수 있다",request:"철수 근거를 존중하면서 재진입 조건도 함께 논의하는 동료",weak:"물러나기를 늦췄다고 반드시 무모한 인물은 아니다. 중단 조건을 미리 합의해 둘 필요가 있다"},
 {intent:"임무가 끝났다는 사실과 다시 움직일 수 있다는 사실을 구별한다",method:"남은 피로와 상태를 살펴 회복을 작전 일정의 일부로 다룬다",cost:"다른 대원의 빠른 재투입 요구와 자신의 회복 기준이 어긋날 수 있다",request:"작전 후 상태 점검과 휴식 범위를 존중하는 동료",weak:"바로 다음 행동을 원하더라도 자기 상태를 확인하는 짧은 절차를 만들면 좋다"}
];
const GATE_V8_PRIORITIES=[
 {id:"보호",axis:6,side:3,choices:[3,6],kind:"동료가 위험한 순간에도 선택권과 안전을 함께 지키려는 마음",cause:"한 사람을 지키는 것이 목표 달성과 어떻게 이어지는지를 먼저 따진다",risk:"돕고 싶다는 판단이 상대의 거절보다 앞서면 보호가 간섭으로 느껴질 수 있다",quote:"위험한 건 말할게. 어떻게 도울지는 네가 정해."},
 {id:"지속",axis:7,side:11,choices:[2,5,7],kind:"이번 작전을 넘어 다음 위기까지 버틸 여력을 남기려는 마음",cause:"지금의 해결보다 앞으로 지원이 끊기지 않을 조건을 중요하게 본다",risk:"급박한 상황에서는 한도를 지키려는 말이 냉정하게 들릴 수 있다",quote:"지금 다 쓰면 다음에는 무엇으로 버틸 건데?"},
 {id:"돌파",axis:5,side:2,choices:[1,2,4],kind:"위험이 있더라도 행동이 열어 주는 기회를 놓치지 않으려는 마음",cause:"움직이는 선택이 정체된 상황을 바꿀 수 있다고 믿는다",risk:"팀의 동의와 준비를 확인하지 못하면 자신의 속도가 남의 위험이 된다",quote:"열린 길이 있을 때 움직이자. 대신 뒤도 확인할게."},
 {id:"검증",axis:0,side:1,choices:[0,1,4],kind:"확인되지 않은 전제를 근거로 움직이고 싶지 않은 마음",cause:"상황을 설명할 수 있어야 제대로 대응할 수 있다고 생각한다",risk:"확인을 이어 가는 사이 지금 쓸 수 있는 선택지가 줄어들 수 있다",quote:"그게 사실인지부터 확인하자. 그다음은 빨리 결정할게."},
 {id:"조율",axis:4,side:3,choices:[0,2,3],kind:"각자 다른 행동이 한 작전으로 이어지게 만들려는 마음",cause:"혼자 잘 움직이는 것보다 여러 사람이 함께 움직일 조건을 세우려 한다",risk:"상대가 원하지 않는 배치까지 제안하면 통제로 오해받을 수 있다",quote:"누가 앞서느냐보다, 우리가 어디서 만나는지가 중요해."},
 {id:"통제",axis:9,side:10,choices:[0,1,3],kind:"위험을 예측 가능한 크기와 순서로 나누려는 마음",cause:"위기에 밀려 움직이기보다 어떤 행동이 먼저인지 결정하려 한다",risk:"예외를 허용할 틈을 잃으면 복잡한 상황을 지나치게 단순화할 수 있다",quote:"전부 동시에 하지 마. 지금은 하나씩 맞춰."},
 {id:"변경",axis:8,side:1,choices:[1,2,6],kind:"한 번 정한 방법에 얽매이지 않고 목표를 지키려는 마음",cause:"계획을 바꾸는 일이 실패가 아니라 상황에 맞춘 대응이라고 여긴다",risk:"새 방법이 팀에 도착하기 전에 실행되면 혼란이 커진다",quote:"틀린 길을 지킬 이유는 없어. 목표는 그대로니까."},
 {id:"귀환",axis:11,side:10,choices:[5,6,7],kind:"현장을 떠난 뒤까지 책임질 수 있어야 작전이 끝난다고 느끼는 마음",cause:"임무의 끝을 성과 보고가 아니라 안전하게 회복한 시점까지 넓혀 본다",risk:"회복에 필요한 시간에 대한 기준이 다른 동료와 충돌할 수 있다",quote:"끝났다는 말 말고, 지금 상태가 어떤지부터 보자."}
];
const GATE_V8_SCENE_HINTS={
 common:[
 ["추가 정보를 얻어야 진입 오류를 줄일 수 있다고 본다","판단 기준을 정하는 일이 정보 자체보다 급하다고 본다","역할을 나누면 서로 다른 주장을 동시에 확인할 수 있다고 본다","최악의 가능성을 먼저 차단하면 이후 선택지가 남는다고 본다"],
 ["모호한 신호의 범위를 더 확인하는 것이 우선이다","전술을 바꾸면 예기치 못한 기척을 피할 여지가 있다고 본다","경고를 공유해야 팀 전체의 판단이 바뀐다고 본다","위험을 정리할 때까지 진입보다 안전을 먼저 확인한다"],
 ["목표 앞의 위협을 제압해 길을 연다고 본다","자신이 먼저 위치를 확보할 때 정체를 풀 수 있다고 본다","동료와의 역할 중복부터 없애려 한다","앞서 움직이기 전에 각자의 남은 여력을 확인한다"],
 ["상대의 거절이 현재 지원 범위를 결정하는 중요한 정보다","직접 지원하지 않더라도 주변 위험을 낮추려 한다","위험을 알리는 것과 상대를 대신 결정하는 일을 구별하려 한다","지원 가능 범위와 거절 가능한 선택을 함께 제시한다"]
 ],
 "센티넬":[
 ["부하도 변화를 감각 자극과 분리해 설명하려 한다","자극을 피할 위치 변경을 먼저 선택한다","전투 부담을 줄여 목표를 이어갈 방법을 찾는다","안전한 이탈과 실제 가능한 가이딩 지원을 확인하려 한다"],
 ["확인 가능한 신호를 다시 찾아 목표를 놓치지 않으려 한다","동료가 위험을 파악할 수 있게 현재 상태를 알리려 한다","확실하게 대응할 수 있는 위협부터 처리하려 한다","한계를 넘기기 전에 감각을 정리할 여유를 만들려 한다"],
 ["상대가 괜찮다는 말의 근거부터 살피려 한다","당사자의 판단과 별개로 후퇴 경로를 마련하려 한다","진행 가능한 자원과 감수할 위험을 비교하려 한다","다른 작전 목표로 변경해 동료의 부담을 낮추려 한다"],
 ["현재 상태를 숨기지 않고 지원이 필요한 이유를 공유한다","전투를 지속하기 전 자극이 낮은 위치를 찾는다","지원이 늦더라도 임무를 최소 단계로 끝내려 한다","부하도 전조를 기준으로 잠시 철수하는 가능성을 검토한다"]
 ],
 "가이드":[
 ["지원 요청과 부하도 전조를 나눠 먼저 도울 대상을 정한다","가능한 한 사람에게 우선 가이딩을 수행하는 선택이다","역할을 나눠 동시에 몰리는 요청을 줄이려 한다","가이딩 잔량 상한을 먼저 공개하고 안전 기준을 정한다"],
 ["남은 가이딩 잔량을 알려 지원 강도를 다시 논의하려 한다","가이딩 강도를 낮춰 공명 고갈 위험을 줄이려 한다","직접 가이딩 이외의 환경적 지원으로 대응을 바꾼다","잔량이 0이 되기 전 안전한 철수를 요청하려 한다"],
 ["거절의 이유를 확인한 뒤 동의 가능한 도움을 찾으려 한다","가이딩을 강요하지 않고 동선으로 위험을 낮추려 한다","부하도 위험 신호를 객관적으로 전달하려 한다","직접 가이딩하지 않는 대안을 제시하려 한다"],
 ["현재의 위협을 동료에게 알리면서 지원의 범위를 조정하려 한다","자신의 역할을 바꿔 팀의 빈틈을 채우려 한다","가이딩 외의 대응으로 현장 위험을 낮추려 한다","위협이 커지면 안전한 위치에서 지원을 재평가하려 한다"]
 ]
};
/** Polite analyst narration, without modifying in-character direct quotes. */
function gateV8Polite(fragment){
 const suffixes=[
  ["수 없다","수 없습니다"],["수 있다","수 있습니다"],
  ["아니다","아닙니다"],["않는다","않습니다"],
  ["느낀다","느낍니다"],["믿는다","믿습니다"],
  ["여긴다","여깁니다"],["바란다","바랍니다"],
  ["찾는다","찾습니다"],["바꾼다","바꿉니다"],
  ["다룬다","다룹니다"],["따진다","따집니다"],
  ["커진다","커집니다"],["줄어든다","줄어듭니다"],
  ["본다","봅니다"],["한다","합니다"],["된다","됩니다"],
  ["좋다","좋습니다"],["쉽다","쉽습니다"],
  ["있다","있습니다"],["없다","없습니다"],["정보다","정보입니다"],["이다","입니다"]
 ];
 return String(fragment).split(/(\.\s*)/).map(part=>{
  const trimmed=part.trimEnd(),spaces=part.slice(trimmed.length);
  for(const [ending,formal] of suffixes)
   if(trimmed.endsWith(ending))return trimmed.slice(0,-ending.length)+formal+spaces;
  return part;
 }).join("");
}
function gateV8AsFact(fragment){
 return String(fragment).replace(/[.\s]+$/,"").replace(/다$/,"다는 점을");
}
function gateV8Mean(xs){return xs.reduce((a,b)=>a+b,0)/(xs.length||1)}
function gateV8Clamp(x){return Math.max(0,Math.min(10,x))}
function gateV8Choice(p,i){const scene=gateV7Scenarios(p.role)[i],selected=p.choices[i];return {scene,index:i,choice:scene.opts[selected],label:scene.opts[selected].label,hint:(i<4?GATE_V8_SCENE_HINTS.common[i][selected]:GATE_V8_SCENE_HINTS[p.role][i-4][selected])}}
function gateV8Priorities(p){
 return GATE_V8_PRIORITIES.map(m=>{
  const hits=m.choices.filter(i=>gateV8Choice(p,i).choice.axis===m.axis).length;
  const score=0.64*p.axes[m.axis]+0.22*p.axes[m.side]+0.45*hits;
  return {...m,rank:score,hits};
 }).sort((a,b)=>b.rank-a.rank||a.id.localeCompare(b.id,"ko"));
}
function gateV8Evidence(p){
 const c=Array.from({length:8},(_,i)=>gateV8Choice(p,i));
 const priorities=gateV8Priorities(p);
 const top=p.axes.map((v,i)=>({i,v})).sort((a,b)=>b.v-a.v||a.i-b.i);
 const swing=[
  {name:"확인보다 행동이 앞서는 긴장",score:p.axes[2]-p.axes[0],line:"움직이기 시작하는 속도와 정보를 확인하는 속도를 따로 맞춰야 한다"},
  {name:"성과와 철수 사이의 긴장",score:p.axes[5]-p.axes[10],line:"목표에 다가갈수록 중단 기준을 먼저 공유해야 한다"},
  {name:"보호와 조율 사이의 긴장",score:p.axes[6]-p.axes[4],line:"동료를 지키려는 판단을 역할 변경으로 어떻게 연결할지 따로 논의해야 한다"},
  {name:"관찰과 교신 사이의 긴장",score:p.axes[0]-p.axes[3],line:"발견한 정보가 팀 전체에 도착하는 시점이 전술의 변수가 된다"},
  {name:"자원 보존과 회복 사이의 긴장",score:p.axes[7]-p.axes[11],line:"남아 있는 자원과 실제로 다음 작전을 감당할 상태를 분리해야 한다"},
  {name:"전환과 역할 고정 사이의 긴장",score:p.axes[8]-p.axes[4],line:"자신의 전술이 바뀐 만큼 팀 배치도 함께 바뀌었는지 확인해야 한다"}
 ].sort((a,b)=>Math.abs(b.score)-Math.abs(a.score)||a.name.localeCompare(b.name,"ko"));
 return {choices:c,priorities,top,swing};
}
function gateV8Source(p,type){
 const raw=typeof gateV7FindLinked==="function"?gateV7FindLinked(p,type):null;
 if(!raw||!Array.isArray(raw.axes)||raw.axes.length!==6||raw.axes.some(x=>!Number.isFinite(x)))return null;
 const order=raw.axes.map((v,i)=>({i,v})).sort((a,b)=>b.v-a.v||a.i-b.i);
 const facets=Array.isArray(raw.facets)?raw.facets:[];
 const gap=(facets.length===12&&Number.isFinite(facets[order[0].i*2])&&Number.isFinite(facets[order[0].i*2+1]))?Math.abs(facets[order[0].i*2]-facets[order[0].i*2+1]):null;
 return {name:raw.name,id:raw.id,role:raw.role,top:order[0].i,second:order[1].i,score:order[0].v,secondScore:order[1].v,facetGap:gap,raw};
}
const GATE_V8_SENSORY_AXIS=["자극을 받아들이는 방식","표현이 주변에 전해지는 방식","작은 변화에 반응하는 방식","안정화와 개입을 시도하는 방식","거리와 동의를 정하는 방식","현장 이후에 남는 감각"];
const GATE_V8_COLOR_AXIS=["선택과 대가를 받아들이는 방식","상처와 보호를 다루는 방식","상실과 기억에 머무는 방식","죄책감 이후 변화를 택하는 방식","신뢰와 취약함을 내보이는 방식","다시 삶을 이어 가는 방식"];
function gateV8Integrated(p){
 const sensory=gateV8Source(p,"sensory"),chroma=gateV8Source(p,"chroma"),pieces=[];
 const sensoryWithTactical=[0,3,0,9,6,11],chromaWithTactical=[1,6,11,8,4,11];
 if(sensory){
  const top=GATE_V8_SENSORY_AXIS[sensory.top],related=sensoryWithTactical[sensory.top],axis=GATE_AXES[related].name,score=p.axes[related];
  const nearby=sensory.secondScore>=sensory.score-.9?" "+GATE_V8_SENSORY_AXIS[sensory.second]+"도 비슷하게 두드러져, 두 감각 반응이 상황에 따라 번갈아 나타날 수 있습니다.":"";
  const contrast=score>=7?axis+"도 높은 편입니다. 감각을 받아들이는 방식과 작전에서 택하는 대응이 서로 맞물리는 장면을 살펴볼 만합니다.":score<=4.5?gateV7Josa(axis,"은","는")+" 상대적으로 낮게 나타납니다. 감각의 민감함과 실제 작전에서 앞세우는 판단 기준이 서로 다를 수 있다는 점이 흥미롭습니다.":gateV7Josa(axis,"은","는")+" 중간 수준입니다. 감각 반응이 강해도 현장에서는 다른 전술을 먼저 택할 여지가 있습니다.";
  pieces.push("감각 간섭 기록에서는 "+gateV7Josa(top,"이","가")+" 두드러집니다."+nearby+" 게이트 작전에서 이에 대응하는 "+contrast+(typeof sensory.facetGap==="number"&&sensory.facetGap>=2?" 같은 감각 축 안에서도 반응의 편차가 있어, 긴장이 높아질수록 행동이 한 방향으로만 고정되지는 않을 듯합니다.":""));
 }
 if(chroma){
  const top=GATE_V8_COLOR_AXIS[chroma.top],related=chromaWithTactical[chroma.top],axis=GATE_AXES[related].name,score=p.axes[related];
  const nearby=chroma.secondScore>=chroma.score-.9?" 동시에 "+GATE_V8_COLOR_AXIS[chroma.second]+"도 비슷하게 나타나, 이 인물의 결정에는 서로 다른 가치가 함께 관여할 수 있습니다.":"";
  const contrast=score>=7?gateV7Josa(axis,"이","가")+" 강하게 나타납니다. 중요하게 여기는 가치가 위기 속 선택에도 비교적 직접적으로 드러나는 편입니다.":score<=4.5?gateV7Josa(axis,"은","는")+" 낮게 나타납니다. 마음속에 남겨 둔 가치와 실제 현장에서 우선하는 행동이 꼭 일치하지 않는 인물로 읽힙니다.":gateV7Josa(axis,"은","는")+" 중간 수준입니다. 평소의 가치가 결정의 바탕이 되더라도, 현장의 상황에 따라 다른 대응을 택할 수 있습니다.";
  pieces.push("색채·잔향 기록에서는 "+gateV7Josa(top,"이","가")+" 특히 눈에 띕니다."+nearby+" 이 성향과 연결해 볼 수 있는 작전 지표인 "+contrast+(typeof chroma.facetGap==="number"&&chroma.facetGap>=2?" 해당 가치 안에서도 서로 다른 응답이 나타나, 한 가지 동기로만 모든 판단을 설명하기는 어렵습니다.":""));
 }
 return {sensory,chroma,text:pieces.join(" ")};
}

/* Natural action phrasing for the three major phases of a hypothetical gate operation.
 * Source choices are preserved separately, in the expandable evidence section. */
const GATE_V8_OPERATION_ACTIONS={
 opening:[
  "단서를 더 확인하며 섣부른 결론을 피합니다.",
  "먼저 결정의 기준을 정리해 판단이 지연되지 않도록 합니다.",
  "역할을 나눠 서로 다른 단서를 동시에 확인하도록 조율합니다.",
  "가장 위험한 가능성부터 차단해 다음 행동을 위한 여지를 확보합니다."
 ],
 entry:[
  "탐색 범위를 조심스럽게 넓혀 기척의 정체를 확인합니다.",
  "예상 밖의 신호에 맞춰 진입 경로를 신속하게 바꿉니다.",
  "발견한 경고를 짧게 정리해 동행자 모두에게 알립니다.",
  "잠시 멈춰 철수가 필요한 조건부터 다시 확인합니다."
 ],
 "센티넬":[
  "주변 신호를 다시 살피며 놓친 위치를 추적합니다.",
  "감각 혼란을 혼자 감추지 않고 동료에게 현재 위험을 알립니다.",
  "확실하게 파악한 위협부터 제압하며 대응 범위를 좁힙니다.",
  "잠시 물러나 감각을 정리하고 이후 행동을 검토합니다."
 ],
 "가이드":[
  "남은 가이딩 잔량을 공유해 지원 계획을 다시 논의합니다.",
  "가이딩 강도를 조절해 소모를 관리합니다.",
  "직접 가이딩 대신 환경을 조정하는 방식으로 대응을 바꿉니다.",
  "공명 고갈에 이르기 전에 철수 조건을 확인합니다."
 ]
};
/* Scene-specific field assessment: every selected action has its own consequence
 * and operational constraint. These are not capability scores or sense signatures. */
const GATE_V8_FIELD_ASSESSMENTS={
 common:[
  [
   "현장 확인을 늘리는 만큼 첫 진입이 늦어질 수 있습니다. 어느 단서가 확보되면 출발할 수 있는지 기준을 정하고, 기다리는 동안 출입구를 지킬 대원을 따로 지정해야 합니다.",
   "판단 기준을 먼저 세우면 엇갈린 보고를 한 방향으로 정리할 수 있습니다. 다만 기준에서 빠진 위험이 없는지 한 명은 다른 경로의 정보를 계속 확인하도록 하는 편이 안전합니다.",
   "두 위험을 동시에 확인하면 정보 확보가 빨라질 수 있지만 대원들이 서로 다른 위치에 놓입니다. 합류 시점과 연락이 끊겼을 때의 재집결 장소를 먼저 확정해야 합니다.",
   "가장 치명적인 경로를 먼저 막아두면 다음 판단에 필요한 시간을 벌 수 있습니다. 봉쇄에 투입한 인원 때문에 비어 버릴 통로가 없는지, 다른 위험을 확인할 대원이 남아 있는지 점검해야 합니다."
  ],
  [
   "탐색 범위를 넓히면 숨어 있는 위협의 위치를 좁힐 여지가 생깁니다. 대신 확인 구역이 길어지므로, 어느 지점까지 접근할지 경계를 정하고 동료에게 돌아올 위치를 알려야 합니다.",
   "예상하지 못한 기척에 맞춰 경로를 바꾸면 직접 충돌을 피할 수 있습니다. 그러나 기존 진입로와 합류 지점이 달라지므로, 우회가 확정되기 전에 후방 인원에게 변경 사실을 전달해야 합니다.",
   "모든 대원에게 경고가 전달되면 각자 다른 신호를 따라 움직일 위험을 줄일 수 있습니다. 경고와 함께 위험 방향, 아직 확인되지 않은 범위, 다음 이동 여부를 짧게 공유하는 편이 좋습니다.",
   "일단 진입을 멈추면 불확실한 신호에 전열 전체가 뛰어드는 일을 막을 수 있습니다. 다만 정지한 위치도 안전하다는 보장은 없으므로, 후퇴 경로와 경계를 맡을 대원을 함께 지정해야 합니다."
  ],
  [
   "위협을 먼저 견제하면 다른 대원이 통로를 통과할 시간을 만들 수 있습니다. 견제가 끝나기 전에 전열이 모두 이동하지 않도록, 통과 신호와 후방 엄호를 끝낼 시점을 정해야 합니다.",
   "자신이 먼저 길을 열면 전진 대기가 짧아질 수 있습니다. 하지만 뒤따르는 대원이 같은 방향으로 밀려들지 않도록, 확보 완료 신호가 오기 전에는 후방 위치를 유지하게 하는 편이 좋습니다.",
   "앞뒤 역할을 명확히 나누면 같은 통로로 두 사람이 동시에 진입하는 혼선을 줄일 수 있습니다. 선두가 위치를 바꾸거나 통로가 막힐 경우 누가 역할 변경을 알릴지도 정해야 합니다.",
   "각 대원의 부담을 먼저 확인하면 감당하기 어려운 전진을 줄일 수 있습니다. 판단이 길어지는 동안 기척이 가까워질 수 있으므로, 지금 움직일 수 있는 최소 인원과 대기 위치를 확정해야 합니다."
  ],
  [
   "거절 의사를 확인하면 불필요한 직접 개입을 피할 수 있습니다. 그렇더라도 외부 위협은 남아 있으니, 상대가 거절하지 않은 경고·후방 경계·퇴로 확보를 어떤 범위에서 할 수 있는지 묻는 편이 좋습니다.",
   "다른 위치에서 안전을 확보하면 동료의 선택을 유지하면서 위험을 줄일 여지가 생깁니다. 지원할 위치를 바꾸는 순간 기존 전열에 빈틈이 생기지 않도록 담당 구역을 넘겨야 합니다.",
   "위험의 근거를 전달하면 동료가 자신의 선택을 다시 판단할 수 있습니다. 설명이 끝나기 전에 위험이 커질 수 있으므로, 사실과 추정을 구분해 짧게 전하고 즉시 대응할 경고 신호를 정해야 합니다.",
   "가능한 지원 범위를 먼저 제시하면 자원을 무리하게 약속하는 일을 피할 수 있습니다. 제안한 방법을 상대가 받아들이지 않을 경우 사용할 대체 동선과 철수 조건도 함께 준비해야 합니다."
  ]
 ],
 "센티넬":[
  [
   "부하도 상승의 원인을 나눠 알리면 동료가 불필요한 대응을 줄일 수 있습니다. 그러나 원인 파악에 매달리다 경고 자체를 늦게 전하지 않도록 현재 부담과 위험 위치부터 우선 공유해야 합니다.",
   "위치를 바꾸면 자극이 덜한 지점에서 대응을 이어갈 수 있습니다. 이동하는 동안 기존 전열이 비지 않도록 후방 대원에게 위치 변경과 새 엄호 구역을 알려야 합니다.",
   "전투 행동을 줄이면 부담을 더 키우지 않고 목표를 이어갈 여지가 남습니다. 대신 처리하지 못한 위협이 다른 대원에게 향할 수 있으므로, 맡지 못하는 공격 방향을 명확히 넘겨야 합니다.",
   "가이드와 철수 지점을 먼저 확인하면 부하도 상승에 대비한 다음 선택이 분명해집니다. 지원을 받기 전까지 누구와 합류할지, 위험 구역에서 얼마나 더 버틸지를 별도로 정하는 편이 좋습니다."
  ],
  [
   "추가 신호를 탐색하면 적의 위치를 다시 좁힐 수 있지만 그동안 공격이 이어질 수 있습니다. 탐색하는 대원을 보호할 엄호 위치와 신호를 찾지 못했을 때 물러날 지점을 정해야 합니다.",
   "현재 위험을 바로 알리면 동료들이 확인되지 않은 위치를 안전하다고 착각하는 일을 막을 수 있습니다. 경고를 보낼 때에는 마지막으로 확인된 방향과 당장 피해야 할 구역을 함께 알려야 합니다.",
   "확인된 표적부터 처리하면 즉시 대응할 위협을 줄일 수 있습니다. 다만 놓친 적은 여전히 남아 있으므로, 후방을 감시할 대원과 다음 표적을 재확인할 순서를 정해 두는 편이 좋습니다.",
   "잠시 물러나면 전투 판단을 다시 정리할 시간을 얻을 수 있습니다. 후퇴하는 동선을 동료가 모르면 엄호가 끊길 수 있으므로, 안전 지점과 복귀 신호를 짧게 공유해야 합니다."
  ],
  [
   "동료의 상태를 다시 확인하면 무리한 전진을 멈출 근거를 확보할 수 있습니다. 확인에 시간이 걸리는 동안 목표가 이동할 수도 있으므로, 판단을 마칠 때까지 전열을 유지할 대원이 필요합니다.",
   "퇴로를 마련하면 동료가 계속 움직이기로 하더라도 돌아올 선택지를 남길 수 있습니다. 앞선 경로와 후퇴 경로가 겹치지 않도록 다른 대원에게 방향을 분명히 전달해야 합니다.",
   "남은 자원과 위험을 비교하면 목표를 이어갈지를 정할 기준이 생깁니다. 다만 동료의 의사와 현재 부하도를 혼동하지 않고, 수치가 악화되면 누가 중단 신호를 낼지 정해야 합니다.",
   "작전 대상을 변경하면 부담이 집중된 동료를 전열에서 보호할 수 있습니다. 목표가 바뀌는 순간 다른 대원이 예전 목표를 추적하지 않도록 변경 사유와 합류 지점을 공유해야 합니다."
  ],
  [
   "부하도와 감각 상태를 함께 알리면 동료가 필요한 지원을 판단할 근거를 얻습니다. 보고가 끝나기 전에 위협이 커질 수도 있으므로, 즉각 피해야 할 위험과 지원이 필요한 시점을 먼저 전달해야 합니다.",
   "자극을 완충할 환경을 찾으면 가이딩을 받기 전까지의 부담을 낮출 여지가 생깁니다. 다만 이동 과정에서 전열이 벌어질 수 있어, 안전한 장소를 확인할 사람과 이동을 엄호할 사람을 나누어야 합니다.",
   "남은 힘으로 목표를 먼저 마무리하면 작전이 길어지는 일을 피할 수 있습니다. 그러나 다음 위협이나 귀환에 사용할 여력이 줄어들 수 있으니, 목표가 끝나지 않을 때의 철수 시점을 분명히 해야 합니다.",
   "잠정 철수는 폭주 전조가 악화되기 전에 행동을 전환할 선택지를 만듭니다. 퇴로 확보를 다른 대원에게 맡기고, 언제 재진입을 검토할지 기준을 남기는 편이 좋습니다."
  ]
 ],
 "가이드":[
  [
   "두 사람의 전조를 비교하면 어느 지원이 더 긴급한지 판단할 근거를 확보할 수 있습니다. 다만 우선순위를 정하는 동안 다른 센티넬에게 위험이 커질 수 있으므로, 대기 중의 안전 확보도 별도로 요청해야 합니다.",
   "한 사람을 먼저 가이딩하면 급한 위험에 집중할 수 있습니다. 그러나 다른 센티넬의 요청은 남아 있으므로, 지원 대기 순서와 가이딩 중 후방을 맡을 대원을 분리해야 합니다.",
   "다른 대원에게 일부 역할을 넘기면 직접 가이딩에 집중할 수 있습니다. 교대할 사람이 처리할 수 있는 위험과 직접 가이딩이 필요한 상황을 구분하고, 연결되지 않은 지원까지 약속하지 않는 편이 좋습니다.",
   "잔량과 철수 기준을 먼저 알리면 두 요청을 모두 감당하려다 공명 고갈에 이르는 위험을 줄일 수 있습니다. 우선 가이딩할 대원과 직접 지원이 어려운 대원의 대체 대응을 함께 정해야 합니다."
  ],
  [
   "남은 잔량을 공개하면 지원 요청의 강도와 순서를 조절할 수 있습니다. 하지만 잔량을 보고하는 동안에도 위협은 계속되므로, 누가 전열을 유지할지 함께 지정해야 합니다.",
   "가이딩 강도를 줄이면 더 오래 지원할 가능성이 생깁니다. 지원받는 센티넬의 상태가 다시 나빠질 수 있으므로, 강도를 낮춘 뒤 중단하거나 철수할 신호를 먼저 합의해야 합니다.",
   "환경을 조정하는 지원으로 바꾸면 직접 가이딩을 위한 잔량을 아낄 수 있습니다. 다만 현재의 부하도 전조를 환경 조정만으로 다룰 수 있는지 확인하고, 부족할 때의 대체 방법을 준비해야 합니다.",
   "공명 고갈 전에 철수하면 남은 지원 능력을 보존할 수 있습니다. 이동 과정에서 센티넬의 부하도가 악화될 수 있으므로, 안전한 통로와 교대 지원을 마련한 뒤 움직이는 편이 좋습니다."
  ],
  [
   "거절 이유를 확인하면 센티넬이 받아들일 수 있는 도움의 범위를 찾을 수 있습니다. 질문 자체가 대응을 지연시키지 않도록 현재 위험을 간결하게 전하고, 직접 가이딩 이외의 선택지도 열어 두어야 합니다.",
   "전투 동선을 바꾸면 가이딩 없이도 위협과의 접촉을 줄일 수 있습니다. 기존 진입로를 포기하는 대가로 다른 위험에 노출되지 않도록 우회 구역과 합류 위치를 확인해야 합니다.",
   "객관적인 경고를 전하면 당사자가 위험을 이해하고 선택할 여지가 생깁니다. 센티넬이 가이딩을 원하지 않는다면 동의 없이 수행하지 말고, 즉시 취할 수 있는 경계·후퇴 방법을 제안해야 합니다.",
   "대체 지원과 철수를 함께 제안하면 직접 가이딩을 거절한 뒤에도 작전의 선택지가 남습니다. 가능한 지원을 선택하는 주체와 철수를 시작할 신호를 별도로 합의하는 편이 좋습니다."
  ],
  [
   "적의 접근 신호를 전달하면 가이딩에 집중하는 동안에도 동료들이 위험 방향을 확인할 수 있습니다. 경고를 보낼 때 외부 위협을 처리할 대원과 지원을 계속할 수 있는 조건을 함께 정해야 합니다.",
   "역할을 잠시 바꾸면 외부 위협에 빈틈없이 대응할 가능성이 생깁니다. 변경된 역할이 가이딩의 지속 여부에 영향을 주므로, 지원받는 센티넬에게 전환 시점과 대체 지원을 분명히 알려야 합니다.",
   "환경을 정리하는 쪽으로 대응하면 직접 가이딩에서 잠시 벗어나 외부 위협을 낮출 수 있습니다. 그러나 현재 지원이 필요한 센티넬이 있다면 가이딩을 중단할 조건과 다른 대원의 엄호를 먼저 확인해야 합니다.",
   "안전한 위치로 물러나면 외부 위험을 줄인 뒤 지원 방식을 다시 결정할 수 있습니다. 이동하며 지원을 중단해야 하는지, 센티넬과 어느 지점에서 다시 합류할지 구체적으로 정해야 합니다."
  ]
 ]
};
/** Tactical outcome for the actual situation and response, never a generic axis label. */
function gateV8FieldAssessment(p,c){
 const group=c.index<4?GATE_V8_FIELD_ASSESSMENTS.common[c.index]:GATE_V8_FIELD_ASSESSMENTS[p.role][c.index-4];
 return group[c.choiceIndex??p.choices[c.index]];
}
function gateV8PickScenes(p,e){
 const arr=e.choices;
 const ranked=arr.map((c,i)=>{
  const idx=e.top.findIndex(t=>t.i===c.choice.axis);
  return {...c,priority:(idx>=0?12-idx:0)+(i>=4?3:0)+(i===3?2:0)};
 }).sort((a,b)=>b.priority-a.priority||a.index-b.index);
 const early=ranked.filter(x=>x.index<4)[0],late=ranked.filter(x=>x.index>=4)[0];
 const mid=ranked.find(x=>x.index!==early.index&&x.index!==late.index&&x.index>=1&&x.index<=6)||ranked.find(x=>x.index!==early.index&&x.index!==late.index);
 return [early,mid,late].sort((a,b)=>a.index-b.index);
}
/* Individualized action agreements draw on several scenario choices and both
   the strongest tactical motivation and role-specific limits. */
function gateV8Agreement(p,e){
 const q=p.choices,role=p.role,priority=e.priorities[0].id;
 const support=[
  "동료가 지원을 거절했을 때 어떤 질문까지 다시 해도 되는지, 개입을 재논의할 신호는 무엇인지 먼저 정하는 편이 좋습니다.",
  "동료가 직접적인 도움을 원하지 않을 때는 주변 위험을 누가 맡아 줄지, 서로의 관할을 어디서 나눌지 정해야 합니다.",
  "위험을 설명하는 사람과 그 설명을 듣고 결정을 내리는 사람을 구분해 두어야 합니다. 경고가 일방적인 지시로 바뀌지 않게 하기 위해서입니다.",
  "지원 요청이 몰릴 때 어느 정도의 자원까지 제공할 수 있는지, 그 한도를 언제 공유할지 합의하는 편이 좋습니다."
 ][q[3]];
 const movement=[
  "두 대원이 동시에 전진할 때는 위협 견제를 맡을 사람과 통로로 진입할 사람을 따로 지정하는 편이 좋습니다.",
  "먼저 통로를 확보하는 대원과 그 위치를 넘겨받는 대원의 합류 신호를 미리 정해야 합니다.",
  "전진 순서가 겹치면 앞뒤 역할을 누가 조정하고 언제 배치를 바꿀지 확실히 해 두는 편이 좋습니다.",
  "전진을 결정하기 전 각자의 남은 여력을 누가 확인할지, 위험을 감수할 한계는 어디인지 함께 정해야 합니다."
 ][q[2]];
 const critical=(role==="센티넬"?[
  "동료가 계속 움직일 수 있다고 말하더라도 상태를 확인할 근거와 재점검 시점을 합의해야 합니다.",
  "동료가 무리를 하겠다고 주장할 때는 후퇴 경로를 마련할 담당과 철수 신호를 정해 두는 편이 좋습니다.",
  "작전 지속 여부가 걸린 순간에는 남은 자원과 위험을 어떤 순서로 비교할지 두 사람이 같은 기준을 가져야 합니다.",
  "동료에게 부담이 집중되면 목표를 전환할 권한과 그 사실을 알리는 시점을 미리 정해 두는 편이 좋습니다."
 ]:[
  "가이딩을 거절한 센티넬에게 어떤 이유를 물을 수 있는지, 동의 가능한 도움의 범위를 어디까지로 볼지 먼저 합의해야 합니다.",
  "가이딩 없이 동선을 조정할 때 담당할 위치와 센티넬의 선택권을 분명히 해 두는 편이 좋습니다.",
  "부하도 경고를 전할 때 어떤 징후를 먼저 알릴지, 가이딩 여부를 결정할 사람을 분리해 두는 것이 좋습니다.",
  "직접 가이딩이 어려운 때 사용할 대체 지원과 철수 조건을 미리 정해 두어야 합니다."
 ])[q[6]];
 const reserve=(role==="센티넬"?[
  "가이딩이 늦어질 때는 부하도 변화와 지원 요청을 어떤 방식으로 알릴지 결정해 두는 편이 좋습니다.",
  "자극이 커지는 상황에는 각자가 확보할 완충 지점과 합류할 위치를 공유해야 합니다.",
  "남은 힘으로 작전을 마무리하려는 선택이 나온다면 목표를 끝낼 수 있는 조건과 중단 시점을 함께 정해야 합니다.",
  "폭주 전조가 확인되면 잠정 철수를 제안할 사람과 그 제안을 실행할 경로를 정해 두는 편이 좋습니다."
 ]:[
  "외부 위협이 커졌을 때는 누가 경고 신호를 전달하고 누가 가이딩 중인 대원을 보호할지 나눠야 합니다.",
  "현장의 역할을 바꿔야 할 때는 지원 대상과 변경 시점을 빠르게 전달할 규칙을 정하는 편이 좋습니다.",
  "직접 가이딩 대신 환경을 정리해야 한다면 어떤 대응까지 맡을지 미리 합의해 두는 편이 좋습니다.",
  "외부 위험이 커지면 안전한 위치로 이동해 가이딩을 다시 평가할 신호를 정해 두어야 합니다."
 ])[q[7]];
 const emphasis={
  보호:"보호를 우선하는 인물인 만큼, 개입하기 전에 상대가 원하는 도움을 확인하는 절차가 중요합니다.",
  지속:"다음 대응에 남길 여력을 중요하게 여기므로, 자원 사용 상한을 선언할 시점을 함께 정해 두는 편이 좋습니다.",
  돌파:"결정이 빠르게 행동으로 이어질 수 있으므로, 먼저 움직일 조건과 멈춰야 할 조건을 모두 명확히 해야 합니다.",
  검증:"판단의 근거를 확인해야 움직이기 쉬우므로, 정보가 충분하다고 인정할 기준부터 공유하는 편이 좋습니다.",
  조율:"여러 대원의 역할을 맞추려는 경향이 있으므로, 배치를 제안하는 사람과 최종 동의하는 사람을 분리하는 편이 좋습니다.",
  통제:"위기의 순서를 정리하려는 경향이 있으므로, 지휘 신호와 현장 이견을 전달할 통로를 함께 마련해야 합니다.",
  변경:"상황에 따라 전술을 바꾸는 편이므로, 변경 내용을 언제 누구에게 알릴지 미리 정해 두는 편이 좋습니다.",
  귀환:"작전 이후까지 살피는 경향이 있으므로, 귀환 이후 상태 확인과 다음 투입 기준을 같이 합의해야 합니다."
 };
 const change=e.choices[0].choice.axis===e.choices[1].choice.axis?"초기 보고와 진입 상황에서 비슷한 대응 속도를 보인다는 점도 참고할 만합니다.":"초기 정보가 충돌할 때와 진입 지점에서 예상 밖의 신호를 만났을 때 서로 다른 접근을 택하므로, 대응을 전환할 시점도 함께 맞추는 것이 좋습니다.";
 return support+" "+movement+" "+critical+" "+reserve+" "+emphasis[priority]+" "+change;
}
function gateV8Sections(p){
 const e=gateV8Evidence(p),pri=e.priorities[0],other=e.priorities[1],high=e.top[0],runner=e.top[1],low=e.top[e.top.length-1],h=GATE_V8_AXIS_TEXT[high.i],h2=GATE_V8_AXIS_TEXT[runner.i],lo=GATE_V8_AXIS_TEXT[low.i],integrated=gateV8Integrated(p);
 const q=e.choices,scenes=gateV8PickScenes(p,e);
 const nm=i=>GATE_AXES[i].name;
 const sceneSentence=(c)=>gateV8Polite(c.hint)+".";
 const sceneCards=scenes.map((c,i)=>({title:["진입과 첫 판단","위험 속에서 바뀌는 선택","직군별 한계와 대응"][i],scene:c.scene.title,choice:c.label,text:gateV8FieldAssessment(p,c)}));
 const close=pri.rank-other.rank;
 const motive="가장 두드러진 동기는 '"+pri.id+"'에 가깝습니다. "+pri.kind+"이 있습니다. "+gateV8Polite(pri.cause)+". "+(close<.6?"다만 '"+other.id+"'의 동기도 비슷한 비중으로 나타납니다. 따라서 하나의 이유로만 행동을 설명하면 판단의 중요한 절반을 놓칠 수 있습니다.":"뒤이어 '"+other.id+"' 성향이 선택의 방향을 조정하는 경우가 있습니다.");
 const core="이 인물은 "+gateV7Josa(nm(high.i),"을","를")+" 바탕으로 "+gateV8Polite(h.method)+". 그 밑바탕에는 이런 판단이 놓여 있습니다. "+gateV8Polite(h.intent)+". "+(runner.v>=high.v-.9?"여기에 "+gateV7Josa(nm(runner.i),"이","가")+" 근접한 비중으로 나타나, "+gateV8Polite(h2.method)+". 두 접근은 같은 목표에 기여할 수도 있지만 항상 같은 속도로 움직이지는 않습니다.":"보조적으로 드러나는 "+gateV7Josa(nm(runner.i),"은","는")+" 주력 판단을 수정하거나 뒷받침하는 방식으로 작동할 수 있습니다. "+gateV8Polite(h2.method)+".")+" "+motive;
 const s1=sceneCards[0],s2=sceneCards[1],s3=sceneCards[2];
 const tension=e.swing[0],diff=Math.abs(tension.score),strong=diff>=2.5,margin=diff>=1.25;
 const contrastText=strong?"전술 축의 차이가 비교적 크게 나타나므로":"두 성향의 차이가 아주 크게 벌어진 것은 아니지만";
 const tensionText=contrastText+" '"+tension.name+"'을 실제 작전의 갈림길로 읽을 만합니다. "+gateV8Polite(tension.line)+". "+gateV8Polite(h.cost)+". "+gateV8Polite(pri.risk)+". "+(p.axes[5]>=7.3&&p.axes[10]<5.3?"특히 돌파가 필요한 순간에 철수 기준이 느슨해지지 않도록, 동료와 미리 결정권과 중단 신호를 정하는 편이 좋습니다.":p.axes[6]>=7.3&&p.axes[4]<5.3?"동료를 돕고 싶다는 의지가 강해도 실제로 역할을 바꾸는 과정에는 별도의 협의가 필요합니다.":"이 긴장이 곧 잘못된 판단을 뜻하는 것은 아닙니다. 같은 사람이 다른 조건에서 합리적으로 다른 선택을 할 수 있다는 의미입니다.");
 const scene3=q[5],scene4=q[7];
 const opening=GATE_V8_OPERATION_ACTIONS.opening[p.choices[0]];
 const entry=GATE_V8_OPERATION_ACTIONS.entry[p.choices[1]];
 const crisis=GATE_V8_OPERATION_ACTIONS[p.role][p.choices[5]];
 const differentAxes=new Set([q[0].choice.axis,q[1].choice.axis,q[5].choice.axis]).size;
 const arc=differentAxes===1?
  "상황이 달라져도 핵심 판단 기준이 크게 흔들리지 않는 편입니다. 같은 전술을 반복하는 것이 유리한지 현장 조건과 대조할 필요는 있습니다.":
  differentAxes===3?
  "초반에는 "+GATE_AXES[q[0].choice.axis].name+", 진입 단계에는 "+GATE_AXES[q[1].choice.axis].name+", 위기 대응에는 "+gateV7Josa(GATE_AXES[q[5].choice.axis].name,"이","가")+" 각각 강조됩니다. 이처럼 상황이 바뀔 때마다 전술의 무게중심도 달라집니다.":
  "세 단계 중 일부에서 같은 전술 기준이 반복되지만, "+GATE_AXES[q[0].choice.axis].name+", "+GATE_AXES[q[1].choice.axis].name+", "+GATE_AXES[q[5].choice.axis].name+"이 모두 같은 비중으로 작동하지는 않습니다. 대응을 바꾸는 시점을 살펴보는 편이 정확합니다.";
 const reconstruction="설문 응답을 가상의 작전 흐름으로 이어 보면, 서로 다른 보고가 올라오는 초반에는 "+opening+" 이어 진입 지점에서 낯선 기척이 포착되면 "+entry+" "+(p.role==="가이드"?"가이딩 잔량이 예상보다 빠르게 줄어들 때는 ":"감각 과부하로 적의 위치를 놓친 순간에는 ")+crisis+" "+arc+" "+(p.role==="가이드"?
  "지원 강도를 바꾸거나 중단할 때는 센티넬의 의사와 남은 가이딩 잔량을 먼저 확인합니다.":
  "감각이 흐트러지는 순간일수록 부하도 전조와 귀환 경로를 함께 점검하는 편이 좋습니다.");
 const partner="이 인물과 동행하는 사람에게 가장 중요한 것은 "+h.request+"입니다. "+h2.request+"의 역할이 함께 있으면 도움이 될 수 있습니다. 반대로 "+gateV8AsFact(h.cost)+" 모르고 접근하면 서로를 오해하기 쉽습니다. "+(q[3].choice.axis===6?"도움을 거절한 동료 앞에서 거절 자체를 확인하는 선택을 했으므로, 직접 개입하기보다 가능한 지원 형태부터 합의하는 방식이 적합할 수 있습니다.":q[3].choice.axis===7?"도움의 필요성과 실제 지원 가능한 양을 함께 이야기하는 편이므로, 요청의 범위가 모호한 동료와 먼저 합의가 필요합니다.":q[3].choice.axis===3?"도움을 거절한 상대에게 위험 정보를 설명하는 쪽을 택했으므로, 설명이 설득이나 강요로 바뀌지 않도록 거리를 조절해야 합니다.":"동료가 도움을 거절할 때 직접 지원 대신 주변을 안정시키는 선택을 했으므로, 보이지 않는 지원까지 동의 범위에 포함할지 합의하는 편이 좋습니다.");
 const recovery="작전이 끝난 뒤에도 이 인물이 같은 속도로 움직인다고 가정해서는 안 됩니다. "+(p.axes[11]>=7?"사후 회복 점수가 높아 종료 이후의 상태 확인을 중요한 판단 절차로 보는 편입니다.":"사후 회복이 주력 성향에 비해 덜 선명하므로, 다음 임무 전에 상태를 점검하는 절차를 팀 차원에서 확보하면 도움이 됩니다.")+" "+(p.axes[7]>=7?"남겨 둔 자원의 양과 실제 회복된 상태는 다르기 때문에 다시 투입할 조건을 따로 확인하는 편입니다.":"자원 배분을 판단할 때 다음 단계에 필요한 여력을 별도로 계산하는 동료와 협력하면 좋습니다.")+" "+(p.role==="가이드"?"가이딩 중 다른 위협이 커지는 상황에서는 ":"가이딩이 늦어질 가능성이 생기면 ")+sceneSentence(scene4)+" "+(p.role==="가이드"?"가이딩을 수행했다면 가이딩 잔량을 확인해야 하며, 잔량이 0이면 공명 고갈 상태가 됩니다.":"현재 부하도와 감각 부담을 확인하지 않고 안정되었다고 단정해서는 안 됩니다.");
 const distinct="겉으로는 "+gateV7Josa(nm(high.i),"이","가")+" 가장 뚜렷한 인물처럼 보이지만, 이 성향 하나로는 설명하기 어렵습니다. "+gateV7Josa(nm(runner.i),"이","가")+" 함께 작동하는 방식과 가장 낮게 나온 "+gateV7Josa(nm(low.i),"이","가")+" 개입하는 조건을 나누어 봐야 합니다. "+gateV8Polite(lo.weak)+". "+(e.top[2].v>=6.8?"세 번째로 강하게 나타난 "+nm(e.top[2].i)+" 역시 주력 두 성향만으로는 예측하기 어려운 행동을 만들 수 있습니다.":"그 밖의 전술 축은 상대적으로 덜 선명하므로, 모든 상황에서 안정적으로 같은 능력을 발휘한다고 판단하기보다 선택을 관찰할 여지가 남습니다.")+" 대원들의 전진이 겹칠 때는 "+sceneSentence(q[2])+" 한편 동료의 상태를 다시 살펴야 하는 상황에서는 "+sceneSentence(q[6])+" 서로 다른 장면에서 무엇을 우선하는지 비교하면, 한 인물 안에서 전술의 기준이 달라지는 지점을 읽을 수 있습니다.";
 const cross=integrated.text;
 const key=gateV8Agreement(p,e);
 const line=pri.quote;
 return {e,high,runner,low,pri,other,integrated,title:GATE_AXES[high.i].type+" · "+GATE_AXES[runner.i].short+" 연계형",subtitle:pri.id+" 우선 / "+other.id+" 동반",intro:"이 인물의 작전에서는 "+gateV7Josa(nm(high.i),"과","와")+" "+gateV7Josa(nm(runner.i),"이","가")+" 두드러집니다. 실제 선택에서 무엇을 먼저 지키고 어느 순간 판단을 바꾸는지 살피면, 이 인물의 전술이 더욱 선명해집니다.",core,sceneCards,tensionText,reconstruction,partner,recovery,distinct,cross,key,line};
}
function gateV8Reader(p){
 if(!gateV7Valid(p))return gateV7Reader(p);
 const s=gateV8Sections(p),h=gateEsc;
 const panel=(title,text)=>'<section class="gate-v7-panel"><h4>'+h(title)+'</h4><p>'+h(text)+'</p></section>';
 const chapter=(id,english,korean)=>'<div class="gate-v7-chapter"><small>'+id+' / '+english+'</small><h3>'+korean+'</h3></div>';
 const sc=s.sceneCards.map((x,i)=>panel("SCENE "+String(i+1).padStart(2,"0")+" · "+x.scene,x.text)).join("");
 const evidence=s.e.top.map(v=>'<span class="gate-v7-chip">'+h(GATE_AXES[v.i].name)+' '+gateFixed(v.v)+'</span>').join("");
 const choiceEvidence=s.e.choices.map((c,i)=>'<li><b>Q'+String(i+17).padStart(2,"0")+'</b> '+h(c.scene.title)+' · '+h(c.label)+'</li>').join("");
 const matched=[s.integrated.sensory?"감각 간섭 기록 연동":null,s.integrated.chroma?"색채·잔향 기록 연동":null].filter(Boolean).join(" · ");
 return '<section class="surface gate-v7-report" id="gatePersonal"><div class="eyebrow">NSD / INDIVIDUAL OPERATIONAL STUDY · V10</div><div class="gate-v7-cover"><small>'+h(p.role)+' / INDIVIDUAL GATE REPORT</small><h2>'+h(p.name)+' · '+h(s.title)+'</h2><p>'+h(s.intro)+'</p><p class="gate-v8-subline">'+h(s.subtitle)+'</p></div>'+
 chapter("01","MOTIVE","이 인물이 움직이는 이유")+panel("주력 전술과 행동 동기",s.core)+
 chapter("02","FIELD CHOICES","현장에서 실제로 고른 선택")+'<div class="gate-v7-scenes">'+sc+'</div>'+
 chapter("03","INNER TENSION","장점과 취약함이 동시에 나타나는 지점")+panel("행동의 균열",s.tensionText)+
 chapter("04","RECONSTRUCTION","진입부터 위기까지 이어지는 한 장면")+panel("응답을 바탕으로 재구성한 작전",s.reconstruction)+
 chapter("05","INTERFERENCE","2인·3인 동행자가 알아야 할 것")+panel("협력과 갈등의 실제 조건",s.partner)+panel("미리 합의할 내용",s.key)+
 chapter("06","AFTER ACTION","철수와 회복, 다음 게이트")+panel("작전 종료 이후의 판단",s.recovery)+
 chapter("07","DISTINCTION","비슷한 유형이라도 다른 이유")+panel("다른 캐릭터와 갈라지는 선택",s.distinct)+
 (s.cross?chapter("08","CROSS REPORT","감각·색채 기록과의 교차 해석")+panel("감각과 가치관이 작전에 남기는 흔적",s.cross):"")+
 chapter(s.cross?"09":"08","VOICE","이 캐릭터가 남길 법한 한마디")+'<blockquote class="gate-v7-quote">'+h(s.line)+'</blockquote>'+
 '<details class="gate-v7-evidence"><summary>연구자용 수치 및 상황 선택 확인</summary><div class="gate-v7-chips">'+evidence+'</div>'+(matched?'<p>'+h(matched)+'</p>':"")+'<h4>8개 상황 응답 원문</h4><ol class="gate-v8-choice-evidence">'+choiceEvidence+'</ol></details>'+
 '<div class="row actions"><button class="btn primary" onclick="gateFromSolo(\''+h(p.id)+'\',\'pair\')">2인 동행 분석</button><button class="btn light" onclick="gateFromSolo(\''+h(p.id)+'\',\'trio\')">3인 작전 시뮬레이션</button><button class="btn light" onclick="window.print()">인쇄 · PDF</button></div></section>';
}
function gateV8Solo(p){
 const r=gateV8Sections(p);
 return {signature:gateSignature(p),quick:[],deep:[
  {title:"판단 동기",text:r.core},{title:"현장 선택",text:r.sceneCards.map(s=>s.text).join(" ")},
  {title:"내적 긴장",text:r.tensionText},{title:"작전 재구성",text:r.reconstruction},
  {title:"동행의 조건",text:r.partner+" "+r.key},{title:"사후 회복",text:r.recovery},
  {title:"개별성",text:r.distinct},{title:"감각·색채 교차",text:r.cross}],axisReadings:[],scenarios:r.sceneCards};
}
gateRenderSolo=gateV8Reader;
gateSolo=gateV8Solo;
