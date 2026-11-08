'use strict';
const GATE_V7_VERSION="gate-operation-v7";
const GATE_V7_QUESTIONS=[
{axis:0,text:"게이트의 관측 정보가 예상과 다르면, 원인을 확인하기 위해 진입 계획을 조정하는 편이다."},
{axis:1,text:"정보가 완전히 모이지 않아도 작전 목표와 현재 위험을 비교해 대응 순서를 결정하는 편이다."},
{axis:2,text:"작전 진행이 멈췄을 때 지시를 기다리기보다 자신이 맡을 수 있는 행동을 먼저 시작하는 편이다."},
{axis:3,text:"위험을 발견하면 직접 확인한 사실과 추측을 구분해 동행자에게 전달하는 편이다."},
{axis:4,text:"동료의 능력이나 상태가 바뀌면 처음 배정한 역할을 다시 조율하는 편이다."},
{axis:5,text:"목표 달성 가능성이 충분하다면 일정 수준의 위험을 감수하는 편이다."},
{axis:6,text:"동료가 위험에 노출되면 자신의 임무를 조정해서라도 안전을 확보하려는 편이다."},
{axis:7,text:"지금 사용할 자원보다 다음 위기에 남겨둘 여력을 먼저 계산하는 편이다."},
{axis:8,text:"기존 전술이 통하지 않더라도 계획을 바꾸는 것을 실패로 여기지 않는 편이다."},
{axis:9,text:"여러 대원이 동시에 동요하는 상황에서도 행동 순서를 정리해 혼란을 줄이려는 편이다."},
{axis:10,text:"목표 달성이 가까워도 사전에 정한 철수 조건이 충족되면 물러나는 편이다."},
{axis:11,text:"작전 종료 후에는 바로 다음 임무에 나서기보다 자신의 상태와 회복 여력을 확인하는 편이다."},
{axis:2,text:"예상하지 못한 기회가 생기면 정보가 조금 부족하더라도 행동할 준비를 우선하는 편이다."},
{axis:4,text:"동료의 판단을 존중하면서도 합류 시점과 역할을 맞춰 작전의 흐름을 유지하는 편이다."},
{axis:7,reverse:true,text:"현재 임무가 중요하다면 이후 대응에 필요한 여력을 모두 사용해도 괜찮다고 생각하는 편이다."},
{axis:8,reverse:true,text:"새로운 정보가 나오더라도 처음 정한 전술을 쉽게 변경하지 않는 편이다."}
];
const GATE_V7_CLARIFIERS=[
{axis:6,text:"동료가 계속 움직일 수 있다고 주장해도 위험이 크다고 판단하면 임무 중단을 직접 제안하는 편이다."},
{axis:7,text:"당장 더 많은 지원이 필요하더라도 자원 소모 상한을 분명하게 알리는 편이다."},
{axis:8,text:"이미 많은 자원을 투입했더라도 기존 계획이 틀렸다는 근거가 나오면 빠르게 방향을 바꾸는 편이다."},
{axis:10,text:"임무를 성공시키고 싶은 마음과 별개로 철수 여부를 객관적인 기준으로 판단하는 편이다."}
];
const GATE_V7_SCENE_STORIES={
  "common": [
    "첫 브리핑에서 두 대원이 서로 다른 위험 요소를 보고한 상황이다.",
    "진입 지점에서 사전 계획과 다른 신호가 감지된 상황이다.",
    "두 대원이 동시에 앞으로 나서면서 진로가 혼잡해진 상황이다.",
    "지속적인 지원을 원하는 대원과 혼자 움직이려는 대원의 의견이 충돌한 상황이다."
  ],
  "센티넬": [
    "본인의 부하도가 예상보다 빠르게 상승한 상황이다.",
    "시야와 소리가 겹쳐 목표의 위치를 파악하기 어려워진 상황이다.",
    "부하도가 높아 보이는 동료가 계속 전진하겠다고 주장하는 상황이다.",
    "가이딩 지원이 늦어지는 동안 자신의 부하도가 계속 변하는 상황이다."
  ],
  "가이드": [
    "센티넬 두 명이 동시에 위험을 보고하고 가이딩을 요청했지만 잔량에는 한계가 있는 상황이다.",
    "지원이 끝나기도 전에 가이딩 잔량의 소모 속도가 빨라진 상황이다.",
    "센티넬의 부하도가 높아 보이지만 당사자는 직접 가이딩을 거부하는 상황이다.",
    "가이딩에 집중하는 동안 외부 위협이 커진 상황이다."
  ]
};
function gateV7Scenarios(role){
  const common=GATE_SCENARIOS.common.slice(0,4).map((scene,i)=>({...scene,story:GATE_V7_SCENE_STORIES.common[i]}));
  const specific=(GATE_SCENARIOS[role]||[]).slice(0,4).map((scene,i)=>({...scene,story:GATE_V7_SCENE_STORIES[role][i]}));
  return common.concat(specific);
}
function gateV7Valid(p){
 return !!(p&&p.version===GATE_V7_VERSION&&typeof p.id==="string"&&/^[\w.-]{4,90}$/.test(p.id)&&typeof p.name==="string"&&p.name.length>0&&p.name.length<=40&&["센티넬","가이드"].includes(p.role)&&Array.isArray(p.axes)&&p.axes.length===12&&p.axes.every(n=>Number.isFinite(n)&&n>=1&&n<=10)&&Array.isArray(p.choices)&&p.choices.length===8&&p.choices.every(n=>Number.isInteger(n)&&n>=0&&n<=3)&&Array.isArray(p.facets)&&p.facets.length===12);
}
function gateV7Mean(xs){return xs.reduce((a,b)=>a+b,0)/(xs.length||1)}
function gateV7Score(answers,choices,role,clarifiers){
 if(!["센티넬","가이드"].includes(role)||answers.length!==16||choices.length!==8||answers.some(n=>!Number.isInteger(n)||n<1||n>10)||choices.some(n=>!Number.isInteger(n)||n<0||n>3))throw Error("기본 전술 16문항과 상황 선택 8개에 응답해 주세요.");
 const grouped=Array.from({length:12},()=>[]),scenes=gateV7Scenarios(role),events=Array(12).fill(0);
 GATE_V7_QUESTIONS.forEach((q,i)=>grouped[q.axis].push(q.reverse?11-answers[i]:answers[i]));
 const direct=grouped.map(gateV7Mean);
 scenes.forEach((s,i)=>{const selected=s.opts[choices[i]];if(selected&&Number.isInteger(selected.axis))events[selected.axis]++});
 const cs=Array.isArray(clarifiers)?clarifiers:[0,0,0,0];
 const v=direct.map((d,i)=>{
  let score=d+Math.min(events[i],3)*0.16;
  GATE_V7_CLARIFIERS.forEach((c,j)=>{if(c.axis===i&&Number.isInteger(cs[j])&&cs[j]>=1&&cs[j]<=10)score=d*0.75+cs[j]*0.25+Math.min(events[i],3)*0.16});
  return Math.round(Math.max(1,Math.min(10,score))*100)/100;
 });
 const facets=direct.map((d,i)=>[Math.round(d*100)/100,Math.round((v[i]||d)*100)/100]);
 return {version:GATE_V7_VERSION,role,axes:v,facets,answers:answers.slice(),choices:choices.slice(),clarifiers:cs.slice(),scoreModel:"24 base / up to 4 optional; unlinked sources never alter scores"};
}
function gateV7NeedClarification(answers,choices,role){
 if(answers.length!==16||choices.length!==8||answers.some(n=>n<1||n>10)||choices.some(n=>n<0||n>3))return false;
 const p=gateV7Score(answers,choices,role,[]);
 const uncertain=[6,7,8,10].filter(i=>p.axes[i]>=4.5&&p.axes[i]<=6.5).length;
 const spread=Math.abs(answers[8]-(11-answers[15]))+Math.abs(answers[7]-(11-answers[14]));
 return uncertain>=2||spread>=9;
}
function gateV7PublicRecord(p){
 return {id:p.id,name:p.name,role:p.role,version:GATE_V7_VERSION,axes:p.axes,facets:p.facets,choices:p.choices,isPublic:!!p.isPublic,updatedAt:p.updatedAt,linkRefs:p.linkRefs||{sensoryId:"",chromaId:""},scoreModel:"v7"};
}
