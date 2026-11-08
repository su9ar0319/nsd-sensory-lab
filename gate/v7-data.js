'use strict';
const GATE_V7_VERSION="gate-operation-v7";
const GATE_V7_QUESTIONS=[
{axis:0,text:"낯선 게이트에서 작은 환경 변화가 발생하면, 당장 눈앞의 목표보다 그 변화의 원인을 먼저 확인하는 편입니다."},
{axis:1,text:"정보가 전부 모이지 않았더라도, 작전의 목표와 현재 위험을 비교해 대응 순서를 정할 수 있습니다."},
{axis:2,text:"작전 진행이 멈춰 있을 때에는 누군가의 지시를 기다리기보다 자신이 맡을 수 있는 행동을 먼저 시작합니다."},
{axis:3,text:"위험을 발견하면 본인이 확인한 사실과 추측을 구분해 동행자에게 전달합니다."},
{axis:4,text:"동료의 능력이나 상태가 바뀌면 처음 배정했던 역할을 다시 조율하는 편입니다."},
{axis:5,text:"목표를 완수할 가능성이 충분하다면 일정 수준의 위험은 감수할 수 있습니다."},
{axis:6,text:"동료가 위험에 노출되면 맡은 임무를 조정해서라도 안전을 확보하려 합니다."},
{axis:7,text:"지금 사용할 수 있는 자원보다 다음 위기에 남겨둘 자원을 먼저 계산합니다."},
{axis:8,text:"진행하던 전술이 통하지 않는다면 계획을 바꾸는 것을 실패로 여기지 않습니다."},
{axis:9,text:"여러 대원이 동시에 동요하는 상황에서도 행동 순서를 정리해 혼란을 줄이려 합니다."},
{axis:10,text:"목표를 거의 달성했더라도 사전에 정한 철수 조건이 충족되면 물러날 수 있습니다."},
{axis:11,text:"작전 종료 후에는 바로 다음 임무를 맡기보다 자신의 상태와 회복 여력을 확인합니다."},
{axis:2,text:"예상치 못한 기회가 생기면 세부 정보가 조금 부족해도 행동할 준비가 되어 있습니다."},
{axis:4,text:"동료의 판단을 존중하면서도 전체 작전이 어긋나지 않도록 합류 시점과 역할을 맞추는 편입니다."},
{axis:7,reverse:true,text:"지금의 임무가 중요하다면 이후 대응에 필요한 여력을 모두 사용해도 괜찮다고 생각합니다."},
{axis:8,reverse:true,text:"새로운 정보가 나오더라도 처음 세운 방식이 가장 신뢰할 만하므로 웬만하면 변경하지 않습니다."}
];
const GATE_V7_CLARIFIERS=[
{axis:6,text:"동료가 아직 움직일 수 있다고 주장해도, 위험이 크다고 판단하면 임무 중단을 직접 제안합니다."},
{axis:7,text:"당장 더 많은 지원이 필요하더라도 자원 소모 상한을 분명하게 알립니다."},
{axis:8,text:"이미 많은 자원을 투입했더라도 계획이 틀렸다는 증거가 나오면 빠르게 방향을 바꿉니다."},
{axis:10,text:"임무를 성공시키고 싶은 마음과 별개로, 철수 결정 자체는 객관적인 기준으로 내릴 수 있습니다."}
];
function gateV7Scenarios(role){
  return GATE_SCENARIOS.common.slice(0,4).concat((GATE_SCENARIOS[role]||[]).slice(0,4));
}
function gateV7Valid(p){
 return !!(p&&p.version===GATE_V7_VERSION&&typeof p.id==="string"&&p.id.length>=4&&typeof p.name==="string"&&p.name.length>0&&p.name.length<=40&&["센티넬","가이드"].includes(p.role)&&Array.isArray(p.axes)&&p.axes.length===12&&p.axes.every(n=>Number.isFinite(n)&&n>=1&&n<=10)&&Array.isArray(p.choices)&&p.choices.length===8&&p.choices.every(n=>Number.isInteger(n)&&n>=0&&n<=3)&&Array.isArray(p.facets)&&p.facets.length===12);
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
