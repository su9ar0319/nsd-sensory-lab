'use strict';
/** Resolve Korean particles for dynamic names and tactical labels. */
function gateEngineJosa(word,withFinal,withoutFinal){
 const text=String(word??"").trim();
 if(!text)return text;
 if(/[0-9]$/.test(text)){const ending=[true,true,false,true,false,false,true,true,true,false][Number(text.slice(-1))];return text+(ending?withFinal:withoutFinal)}
 const c=text.charCodeAt(text.length-1);
 const jong=(c>=0xAC00&&c<=0xD7A3)?(c-0xAC00)%28:null;
 return text+(jong===null?withoutFinal:jong?withFinal:withoutFinal);
}
function gateQuestions(role){
 return GATE_AXES.flatMap((axis,i)=>{
   const pack=[...GATE_COMMON[i].slice(0,2),...GATE_ROLE[role][i].slice(0,2)];
   return pack.map((text,j)=>({id:i*4+j,axis:i,text,reverse:j===1||j===3,roleOnly:j>=2}));
 });
}

function gateScenarios(role){return [...GATE_SCENARIOS.common,...GATE_SCENARIOS[role]]}

function gateClamp(x,lo=0,hi=100){return Math.min(hi,Math.max(lo,x))}

function gateMean(x){return x.reduce((a,b)=>a+b,0)/(x.length||1)}

function gateFixed(x){return Number(x).toFixed(1)}

function gateHash(...parts){let h=2166136261;for(const c of parts.join("|"))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h>>>0}

function gatePick(items,...parts){return items[gateHash(...parts)%items.length]}

function gateScoring(answers,choices,role){
 if(!GATE_ROLE[role]||answers.length!==48||choices.length!==16||answers.some(x=>!Number.isInteger(x)||x<1||x>10)||choices.some(x=>!Number.isInteger(x)||x<0||x>3))throw Error("64개 문항에 모두 답해 주세요.");
 const qs=gateQuestions(role),base=GATE_AXES.map((_,i)=>gateMean(qs.filter(q=>q.axis===i).map(q=>q.reverse?11-answers[q.id]:answers[q.id])));
 const changes=Array(12).fill(0);
 gateScenarios(role).forEach((scene,i)=>{changes[scene.opts[choices[i]].axis]+=.24});
 const axes=base.map((v,i)=>Math.round(gateClamp(v+changes[i],1,10)*100)/100);
 const facets=GATE_AXES.map((_,i)=>[gateMean(qs.slice(i*4,i*4+2).map(q=>q.reverse?11-answers[q.id]:answers[q.id])),gateMean(qs.slice(i*4+2,i*4+4).map(q=>q.reverse?11-answers[q.id]:answers[q.id]))]).map(x=>x.map(v=>Math.round(v*100)/100));
 return {version:GATE_VERSION,role,axes,facets,choices:choices.slice(),answers:answers.slice()};
}

function gateSignature(p){
 const order=[...p.axes.keys()].sort((a,b)=>p.axes[b]-p.axes[a]||a-b);
 const head=order[0],second=order[1],tail=order[11];
 const diff=p.axes[head]-p.axes[second],facets=p.facets?.[head]||[p.axes[head],p.axes[head]],inside=Math.abs(facets[0]-facets[1]);
 const mode=inside>=2?"변칙형":diff>=1.7?"주도형":"연계형";
 const title=mode==="변칙형"?`${GATE_AXES[head].type} · 상황 전환형`:mode==="주도형"?`${GATE_AXES[head].type} · 중심 돌파형`:`${GATE_AXES[head].type} · ${GATE_AXES[second].short} 연계형`;
 return {name:title,family:GATE_AXES[head].type,primary:head,secondary:second,weakest:tail,mode,contrast:diff,inside,code:`GO-${String(head+1).padStart(2,"0")}${String(second+1).padStart(2,"0")}-${Math.round(p.axes[head]*10)}-${Math.round(p.axes[second]*10)}`,detail:mode==="변칙형"?`${GATE_AXES[head].name}에서 공통 상황과 직군 전용 상황의 응답 차이가 ${gateFixed(inside)}점으로 나타납니다. 익숙한 일과 돌발 상황에서 전술의 결이 바뀔 수 있습니다.`:mode==="주도형"?`${gateEngineJosa(GATE_AXES[head].name, "이", "가")} 두 번째 강점보다 ${gateFixed(diff)}점 높습니다. 하나의 판단 기준이 행동을 강하게 이끄는 편입니다.`:`${gateEngineJosa(GATE_AXES[head].name, "과", "와")} ${gateEngineJosa(GATE_AXES[second].name, "이", "가")} ${gateFixed(diff)}점 차이로 맞물립니다. 두 강점이 한 번의 판단에 함께 사용될 수 있습니다.`};
}

function gateChoice(p,i){
 const s=gateScenarios(p.role)[i];
 return s?.opts?.[p.choices[i]]?.label||"현장 정보 확인";
}

function gateSolo(p){
 const a=p.axes,s=gateSignature(p),order=[...a.keys()].sort((i,j)=>a[j]-a[i]||i-j);
 const hi=order.slice(0,4),low=order.slice(-3).reverse();
 const match=(i,j)=>`${GATE_AXES[i].name} ${gateFixed(a[i])}점과 ${GATE_AXES[j].name} ${gateFixed(a[j])}점`;
 const quick=[
  {title:"전술 서명과 판단의 중심",text:`${s.detail} 그 결과 ${gateEngineJosa(GATE_AXES[s.primary].name, "과", "와")} ${gateEngineJosa(GATE_AXES[s.secondary].name, "이", "가")} 이번 작전의 우선순위를 결정하는 주요 단서가 됩니다.`},
  {title:"강점이 모이는 행동",text:`가장 선명한 강점은 ${GATE_AXES[hi[0]].name} ${gateFixed(a[hi[0]])}점입니다. ${gateEngineJosa(GATE_AXES[hi[1]].name, "과", "와")} ${GATE_AXES[hi[2]].name}까지 고려하면 한 가지 기능만 수행하는 인물보다 다른 역할과 맞물릴 가능성이 보입니다.`},
  {title:"판단이 늦어질 수 있는 구간",text:`상대적으로 낮은 지표는 ${GATE_AXES[low[0]].name} ${gateFixed(a[low[0]])}점입니다. 실수로 단정하기보다 이 판단이 중요한 장면에서 어떤 정보나 지원이 필요한지 살펴볼 수 있습니다.`},
  {title:"첫 번째 경고를 받는 방식",text:`'${gateChoice(p,1)}'라는 선택은 익숙한 계획에 없던 신호를 다루는 방법을 보여 줍니다. ${GATE_AXES[0].name} ${gateFixed(a[0])}점과 ${GATE_AXES[3].name} ${gateFixed(a[3])}점이 정보를 모으고 동료에게 전달하는 속도에 서로 다른 영향을 줍니다.`},
  {title:"동료 보호와 작전 목표",text:`${match(6,5)}을 함께 보면 동료를 보호하려는 판단과 작전 진전을 위해 위험을 받아들이는 기준이 구분됩니다. '${gateChoice(p,3)}'라는 상황 선택이 이 긴장을 해석할 단서가 됩니다.`},
  {title:"자원 부족에 대한 반응",text:`${match(7,10)}을 보면 한계가 오기 전에 무엇을 남기고 어떤 시점에 물러서는지 읽을 수 있습니다. '${gateChoice(p,5)}'를 선택한 이유가 실제 동행에서는 중요한 협력 정보가 됩니다.`},
  {title:"계획이 어긋났을 때",text:`${match(8,1)}의 조합은 계획 수정의 폭과 판단 근거를 함께 보여 줍니다. '${gateChoice(p,4)}'라는 선택은 처음의 정답을 고집할지 새 길을 찾을지의 분기점이 됩니다.`},
  {title:"게이트를 떠난 뒤",text:`사후 회복은 ${gateFixed(a[11])}점, 철수 판단은 ${gateFixed(a[10])}점입니다. '${gateChoice(p,7)}'라는 선택을 함께 읽으면 임무 종료와 실제 복귀 준비가 반드시 같은 순간은 아니라는 점이 드러납니다.`}
 ];
 const deep=[
  {title:"01 / 전술을 결정하는 두 강점",text:`${gateEngineJosa(match(hi[0],hi[1]), "은", "는")} 서로 다른 강점을 만듭니다. ${GATE_AXES[hi[0]].desc}와 ${GATE_AXES[hi[1]].desc}를 함께 고려해야 이 인물의 작전 리듬이 보입니다. ${s.detail}`},
  {title:"02 / 과감함과 보호의 간격",text:`위험 감수 ${gateFixed(a[5])}점, 동료 보호 ${gateFixed(a[6])}점입니다. ${a[5]>a[6]+1.5?"작전 기회가 보일 때 조금 더 앞서 움직이지만 동료가 뒤처지는지 확인해야 합니다.":a[6]>a[5]+1.5?"동료의 안전을 먼저 지키려 하므로 성급한 돌파 제안을 받으면 신중해질 수 있습니다.":"진전과 보호에 비슷한 비중을 둡니다. 그 순간 누가 위험을 떠안을지에 따라 최종 선택이 달라질 수 있습니다."} 긴급 판단은 실제 상태 확인과 분리할 수 없습니다.`},
  {title:"03 / 전술 정보를 전달하는 속도",text:`${match(0,3)}입니다. ${a[0]>a[3]+1.5?"관찰은 빠르지만 그 사실이 팀 전체에 충분히 전달되지 않을 가능성이 있습니다.":"보고와 관찰이 비교적 가까운 속도로 움직일 수 있습니다."} 첫 진입 시 '${gateChoice(p,0)}', 미지의 기척 앞에서 '${gateChoice(p,1)}'를 선택한 흐름을 연결하면 경고를 어떻게 행동으로 전환하는지 드러납니다.`},
  {title:"04 / 지시보다 빠른 행동의 대가",text:`선제 행동 ${gateFixed(a[2])}점과 상황 인지 ${gateFixed(a[0])}점을 함께 고려합니다. ${a[2]>a[0]+1.5?"먼저 움직이는 순간이 관찰보다 앞서기 쉬워, 동료의 새로운 보고가 늦게 반영될 수 있습니다.":"충분히 살핀 뒤 움직이려는 성향이 있어 돌발 기회를 놓치지 않도록 역할을 정할 필요도 있습니다."} 실제로 팀 내 행동이 겹친 장면에서는 '${gateChoice(p,2)}'를 선택했습니다.`},
  {title:"05 / 전술 변경과 역할 교대",text:`${match(4,8)}에서 팀을 다시 배치하는 능력과 개인의 전술을 고치는 능력은 다르게 나타납니다. ${a[4]>=a[8]?"동료와 함께 움직임을 조정하는 판단이 개인 행동을 즉시 바꾸는 것보다 강하게 드러날 수 있습니다.":"자신의 계획은 빠르게 수정하지만 동료의 역할 조정은 별도의 설명이 필요할 수 있습니다."} 목표가 이동했을 때 '${gateChoice(p,4)}'를 택한 점을 비교해 볼 수 있습니다.`},
  {title:"06 / 위험이 누적되는 시점",text:`위기 통제 ${gateFixed(a[9])}점, 자원 관리 ${gateFixed(a[7])}점, 철수 판단 ${gateFixed(a[10])}점입니다. ${p.role==="센티넬"?"센티넬의 부하도는 전투 진행 중에도 상승할 수 있고, 가이딩은 별도의 요청과 수행이 필요합니다.":"가이드의 가이딩 잔량은 지원을 수행할 때 소모되며, 0이 되면 공명 고갈 상태가 됩니다."} 고갈이나 폭주 전조가 나타나면 안전한 판단을 우선할 필요가 있습니다.`},
  {title:"07 / 직군 전용 위기 선택",text:`'${gateScenarios(p.role)[8].title}' 상황에서 '${gateChoice(p,8)}'를 택했고, '${gateScenarios(p.role)[13].title}' 상황에서는 '${gateChoice(p,13)}'를 골랐습니다. 각각의 선택을 비교하면 개인의 위험을 숨기거나 드러내는 방식과 작전 목표를 유지하려는 태도가 구분됩니다.`},
  {title:"08 / 한계를 인정하는 순간",text:`${p.role==="가이드"?`가이딩 잔량 관리 ${gateFixed(a[7])}점과 철수 판단 ${gateFixed(a[10])}점의 간격이 자원 한계를 알리는 시점을 바꿀 수 있습니다. 공명 고갈은 누군가의 좋은 의도로 사라지는 문제가 아닙니다.`:`부하도 변화에 대한 대응과 철수 판단은 분리해서 봐야 합니다. 가이딩이 즉시 가능하다고 가정하기보다 현재 위험을 공유해야 합니다.`} '${gateChoice(p,13)}'라는 선택을 실제 상황과 연결해 볼 수 있습니다.`},
  {title:"09 / 동료가 오해할 수 있는 행동",text:`${a[3]<4.5?"정보 전달 점수가 상대적으로 낮다면 스스로 충분히 설명했다고 생각해도 동료는 근거를 전달받지 못할 수 있습니다.":"정보 전달을 적극적으로 하더라도 듣는 사람의 감각 부담 때문에 같은 뜻으로 받아들여지지 않을 수 있습니다."} ${a[6]>7?"동료를 돕고 싶은 마음이 강할수록 당사자의 동의와 현재 자원 확인을 생략하지 않아야 합니다.":"거리 유지가 항상 무관심을 의미하지는 않습니다."} 다른 대원은 이 차이를 행동으로 판단할 수 있습니다.`},
  {title:"10 / 재진입을 둘러싼 긴장",text:`사후 회복 ${gateFixed(a[11])}점과 자원 관리 ${gateFixed(a[7])}점은 다른 질문에 대한 답입니다. 다시 움직일 수 있는가와 지금 움직여야 하는가는 구분해야 합니다. '${gateChoice(p,15)}'라는 마지막 직군별 선택이 미래의 동행 조건을 바꿉니다.`}
 ];
 const scenarios=[0,1,3,5,8,12,15].map(i=>({title:gateScenarios(p.role)[i].title,choice:gateChoice(p,i),text:`${gateScenarios(p.role)[i].story} 이 인물은 '${gateChoice(p,i)}'를 선택했습니다. ${GATE_AXES[gateScenarios(p.role)[i].opts[p.choices[i]].axis].name}에 가중치를 두는 판단입니다. 실제 현장에서는 동료의 다른 판단과 만나 장점이나 위험으로 이어질 수 있습니다.`}));
 const axisReadings=GATE_AXES.map((d,i)=>({title:d.name,score:a[i],text:gatePick(GATE_NARRATIVES.solo[i][a[i]<4.5?0:a[i]>=6.8?2:1],p.id,p.name,p.role,"axis",i,gateFixed(a[i]))}));
 return {signature:s,quick,deep,scenarios,axisReadings,strong:hi.map(i=>({i,score:a[i]})),weak:low.map(i=>({i,score:a[i]}))};
}

function gateDirection(a,b){
 const aa=a.axes,bb=b.axes;
 const pressure=gateClamp(Math.round(20+aa[2]*3.7+aa[5]*3.4+aa[3]*1.2-bb[9]*2.4-bb[6]*1.3),0,100);
 const support=gateClamp(Math.round(8+aa[3]*3+aa[4]*2+aa[6]*1.2+bb[8]*1.4),0,100);
 const diff=+(support-pressure).toFixed(1);
 const type=diff>12?"지원 우세":diff< -12?"부담 우세":"변동형";
 const first=aa[0]>=bb[0]?"관찰을 공유하는 쪽":"확인 질문을 받아들이는 쪽";
 const response=`${a.name}의 선제 행동 ${gateFixed(aa[2])}점과 ${b.name}의 상황 인지 ${gateFixed(bb[0])}점이 만나면 ${first}에서 정보의 속도가 달라집니다. ${aa[2]>bb[0]+1.8?"행동이 확인보다 앞설 수 있으므로 출발 전에 현재 단서를 명시하는 편이 좋습니다.":"상대에게 먼저 판단의 여지를 남길 수 있지만 결정할 사람을 정해 두어야 합니다."}`;
 const coordination=`${a.name}의 정보 전달 ${gateFixed(aa[3])}점, ${b.name}의 역할 조율 ${gateFixed(bb[4])}점입니다. ${aa[3]>bb[4]+1.8?"보고가 먼저 쌓여 상대가 재배치를 결정하기 어려워질 수 있습니다.":"현장 정보가 역할 변경으로 이어지려면 누가 어떤 정보에 응답할지 합의해야 합니다."} ${gateEngineJosa(a.name, "은", "는")} '${gateChoice(a,2)}'를, ${gateEngineJosa(b.name, "은", "는")} '${gateChoice(b,2)}'를 선택했습니다.`;
 const resource=`${a.name}의 자원 관리 ${gateFixed(aa[7])}점과 ${b.name}의 철수 판단 ${gateFixed(bb[10])}점을 비교하면, 지원을 지속할 조건과 멈출 조건이 같지 않습니다. ${a.role==="가이드"?"가이딩을 수행한다면 잔량을 소모하므로, 지원 범위를 먼저 정해야 합니다.":"센티넬의 부하도는 누적될 수 있으므로, 현재 상태를 알리는 것이 전술의 일부입니다."}`;
 const closure=`${type}으로 분석되는 이 방향에서는 부담 지표 ${pressure}, 지원 지표 ${support}로 나타납니다. ${diff>12?"상대가 맡은 역할을 안정시키는 여지가 있지만 동의를 생략하면 지원 효과가 흔들릴 수 있습니다.":diff< -12?"한 사람의 빠른 선택이 상대에게 추가 판단을 요구할 수 있어 행동 개시 시점이 중요합니다.":"상황에 따라 도움과 부담이 뒤바뀌므로 어떤 행동을 먼저 하는지가 결과를 좌우합니다."}`;
 return {from:a.name,to:b.name,pressure,support,diff,type,sections:[{title:"선제 행동과 상대의 관찰",text:response},{title:"교신과 역할 변경",text:coordination},{title:"자원 사용과 철수 조건",text:resource},{title:"이 방향의 전술적 영향",text:closure}]};
}

function gatePair(a,b){
 if(a.id===b.id)throw Error("서로 다른 두 캐릭터를 선택해 주세요.");
 const ab=gateDirection(a,b),ba=gateDirection(b,a),x=a.axes,y=b.axes;
 const detection=x[0]>=y[0]?a:b,partner=detection===a?b:a;
 const planner=x[1]>=y[1]?a:b,alternate=planner===a?b:a;
 const helper=x[6]>=y[6]?a:b,other=helper===a?b:a;
 const manager=x[7]>=y[7]?a:b,receiver=manager===a?b:a;
 const agile=x[8]>=y[8]?a:b,steady=agile===a?b:a;
 const guide=[a,b].find(p=>p.role==="가이드"),sentinel=[a,b].find(p=>p.role==="센티넬");
 const recovery=x[11]>=y[11]?a:b,rest=recovery===a?b:a;
 const sorted=(arr,n)=>arr.sort((v,w)=>w.weight-v.weight).slice(0,n);
 const synergy=[
 {weight:Math.max(x[0],y[0])*6,title:"정찰과 후속 판단의 분업",condition:`${gateEngineJosa(detection.name, "이", "가")} 관찰한 변화의 근거를 먼저 공유하고 ${gateEngineJosa(planner.name, "이", "가")} 대응 우선순위를 정할 때입니다.`,action:`${gateEngineJosa(detection.name, "은", "는")} '${gateChoice(detection,1)}'에 가까운 방식으로 단서를 확보하고, ${gateEngineJosa(alternate.name, "이", "가")} 별도의 위험을 확인할 수 있습니다.`,break:`관찰 내용이 전달되기 전에 한 사람이 행동을 확정하거나 같은 정보만 반복 확인할 때입니다.`},
 {weight:Math.max(x[4],y[4])*5+Math.abs(x[8]-y[8])*3,title:"역할 교대를 통한 전술 전환",condition:`${gateEngineJosa(agile.name, "이", "가")} 새로운 경로를 제안할 때 ${gateEngineJosa(steady.name, "이", "가")} 현재 역할과 충돌하는 부분을 정리할 때입니다.`,action:`두 사람의 전술 유연성 차이는 ${gateFixed(Math.abs(x[8]-y[8]))}점입니다. 계획 변경을 개인 판단으로 끝내지 않고 실제 역할 배치까지 연결할 수 있습니다.`,break:`새 계획이 동료에게 전달되지 않거나 변경 사실을 알고도 이전 역할을 반복할 때입니다.`},
 {weight:Math.max(x[6],y[6])*5,title:"동료 보호를 작전 목표와 연결하기",condition:`${gateEngineJosa(helper.name, "이", "가")} 위험한 대원의 부담을 발견하고 ${gateEngineJosa(other.name, "이", "가")} 진행 가능한 대안을 함께 검토할 때입니다.`,action:`${helper.name}의 보호 성향 ${gateFixed(helper.axes[6])}점을 활용해 직접 지원과 외부 위험 차단을 구분합니다.`,break:`보호를 이유로 상대의 선택을 대신 결정하거나 작전 목표를 아무 설명 없이 변경할 때입니다.`},
 {weight:Math.max(x[7],y[7])*5,title:"여력 보존과 후속 지원",condition:`${gateEngineJosa(manager.name, "이", "가")} 다음 단계에 필요한 자원을 먼저 계산하고 ${gateEngineJosa(receiver.name, "이", "가")} 현재 지원 범위를 동의할 때입니다.`,action:`${gateEngineJosa(manager.name, "은", "는")} '${gateChoice(manager,5)}'를 선택했습니다. 이 대응을 준비 단계에서 공유하면 나중에 필요한 지원을 남길 수 있습니다.`,break:`한 사람이 성공적으로 수습했다는 이유로 같은 지원량을 계속 요구할 때입니다.`}
 ];
 if(guide&&sentinel)synergy.push({weight:62,title:"부하도와 가이딩 잔량의 교차 관리",condition:`${gateEngineJosa(sentinel.name, "이", "가")} 위험한 부하도 전조를 알리고 ${gateEngineJosa(guide.name, "이", "가")} 가능한 지원 범위를 선택할 때입니다.`,action:`가이딩을 수행할 경우 ${guide.name}의 잔량이 소모됩니다. 환경 조정으로 해결할 수 있는 일과 직접 지원이 필요한 일을 분리하면 상호 부담을 낮출 수 있습니다.`,break:`${guide.name}의 현재 잔량 확인 없이 이전에 성공한 가이딩 강도를 반복할 때입니다.`});
 const debuff=[
 {weight:Math.abs(x[2]-y[0])*5+33,title:"행동이 확인보다 앞서는 충돌",trigger:`${gateEngineJosa(x[2]>=y[2]?a.name:b.name, "이", "가")} 먼저 움직이는 동안 상대가 다른 위험을 아직 확인하지 못한 순간입니다.`,chain:`서로의 지시를 기다리는 게 아니라 이미 서로 다른 목표를 향해 움직이면서 중복 행동이 생깁니다.`,mitigation:`진입 전 서로 반드시 전달해야 할 단서를 하나씩 지정하고 행동 개시 신호를 맞춥니다.`},
 {weight:Math.abs(x[5]-y[5])*5+27,title:"위험 허용 기준의 불일치",trigger:`위험 감수 점수 차이가 ${gateFixed(Math.abs(x[5]-y[5]))}점으로 나타나는 상황에서 같은 목표를 두고 서로 다른 행동을 정할 때입니다.`,chain:`한 사람은 돌파가 가능한 기회라고 보고 다른 사람은 철수를 준비할 수 있습니다.`,mitigation:`목표 달성 조건과 반드시 철수할 조건을 사전에 분리해 합의합니다.`},
 {weight:Math.abs(x[7]-y[7])*5+30,title:"지원 자원의 집중 소모",trigger:`${gateEngineJosa(manager.name, "은", "는")} 소모를 줄이려 하는데 ${receiver.name}의 활동이 계속해서 지원을 요구하는 상황입니다.`,chain:`작전 초반 안정이 다음 단계에서 사용할 가이딩 잔량이나 부하도 여유를 잠식할 수 있습니다.`,mitigation:`대응을 선택할 때 현재 소모뿐 아니라 다음 상황에 남길 자원을 함께 계산합니다.`},
 {weight:Math.abs(x[10]-y[10])*5+27,title:"철수 시점의 어긋남",trigger:`${gateEngineJosa(x[10]>=y[10]?a.name:b.name, "이", "가")} 철수를 준비하지만 상대는 아직 임무를 진행할 수 있다고 판단할 때입니다.`,chain:`철수와 돌파가 동시에 시작되면 후방 지원과 정찰을 누가 담당할지 불명확해질 수 있습니다.`,mitigation:`재진입 가능성보다 안전한 이탈 경로 확보를 공통 확인 항목으로 정합니다.`}
 ];
 if(guide)debuff.push({weight:63,title:"공명 고갈을 늦게 발견하는 위험",trigger:`${guide.name}에게 요청이 몰리며 가이딩 잔량의 감소가 숨겨질 때입니다.`,chain:`센티넬의 부하도가 낮아져도 가이드의 잔량이 자동으로 회복되는 것은 아닙니다. 계속 지원하면 공명 고갈 위험이 높아질 수 있습니다.`,mitigation:`가이딩 전후 잔량과 추가 지원 가능 여부를 따로 확인합니다.`});
 synergy.forEach((card,i)=>{card.action+=" "+gatePick(GATE_NARRATIVES.pair[i],a.id,b.id,"pair-synergy",i,gateFixed(x[4]-y[4]));});
 const resources=`${a.role==="센티넬"?`${a.name}의 부하도 전조와 폭주 위험`:`${a.name}의 가이딩 잔량과 공명 고갈 위험`} / ${b.role==="센티넬"?`${b.name}의 부하도 전조와 폭주 위험`:`${b.name}의 가이딩 잔량과 공명 고갈 위험`}을 별도로 기록합니다. 현재 자원 상태는 설문만으로 확정할 수 없으므로 실제 작전 전 확인이 필요합니다.`;
 return {a:a.name,b:b.name,directions:[ab,ba],synergies:sorted(synergy,4),debuffs:sorted(debuff,4),resources,rankLabel:gateMean([x[4],y[4],x[9],y[9]])>=6.7?"조율 우세":gateMean([x[5],y[5],x[2],y[2]])>=7.1?"돌파 우세":"변동형",scenes:[0,5,6].map(i=>({title:["진입 직후","자원 소모가 커질 때","위험 판단 충돌"][ [0,5,6].indexOf(i)],text:`${gateEngineJosa(a.name, "은", "는")} '${gateChoice(a,i)}', ${gateEngineJosa(b.name, "은", "는")} '${gateChoice(b,i)}'를 선택했습니다. 서로 다른 판단을 연결할 공통 신호가 필요합니다.`}))};
}

function gateAssignments(ps){
 const slots=[["정찰·감지",0],["지휘·조율",4],["안전·자원",7]],perm=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
 const best=perm.map(p=>({p,score:p.reduce((v,n,i)=>v+ps[n].axes[slots[i][1]],0)})).sort((a,b)=>b.score-a.score)[0].p;
 return slots.map(([label,axis],i)=>({label,axis,index:best[i],name:ps[best[i]].name,score:ps[best[i]].axes[axis]}));
}

function gateTrio(ps){
 if(ps.length!==3||new Set(ps.map(p=>p.id)).size!==3)throw Error("서로 다른 세 캐릭터를 선택해 주세요.");
 const roles=gateAssignments(ps),detect=ps[roles[0].index],lead=ps[roles[1].index],sustain=ps[roles[2].index];
 const pairIndices=[[0,1,2],[0,2,1],[1,2,0]];
 const pairs=pairIndices.map(([i,j,k])=>{
  const analysis=gatePair(ps[i],ps[j]);
  const third=ps[k];const strong=third.axes[0]>7.2?"추가 전조를 확인":third.axes[8]>7.2?"전술 변경을 제안":third.axes[7]>7.2?"자원 소모를 점검":"위험 정보를 교차 확인";
  return {label:`${ps[i].name} × ${ps[j].name}`,from:analysis.directions[0],back:analysis.directions[1],third:third.name,intervention:`${gateEngineJosa(third.name, "은", "는")} 두 사람의 판단이 어긋날 때 '${strong}'하는 제3자 역할을 맡을 수 있습니다. 직접 결정을 대신하기보다 각자의 관찰을 모아 대응의 순서를 정합니다.`,tension:Math.max(analysis.directions[0].pressure,analysis.directions[1].pressure),synergy:analysis.synergies[0].title,debuff:analysis.debuffs[0].title};
 });
 const threatFrom=gateMean(ps.map(p=>p.axes[5]))*3,control=gateMean(ps.map(p=>p.axes[9]));
 let threat=Math.round(gateClamp(39+threatFrom-control*2)),cohesion=Math.round(gateClamp(gateMean(ps.map(p=>p.axes[4]))*10)),success=0;
 let state=ps.map(p=>({id:p.id,name:p.name,role:p.role,value:p.role==="가이드"?Math.round(gateClamp(89-p.axes[5]*1.4+p.axes[7]*1.5)):Math.round(gateClamp(17+p.axes[5]*2.2-p.axes[7]*1.2))}));
 const stages=[];
 for(let stage=0;stage<7;stage++){
  /* Seven-step hazard curve: challenging mid-gate without turning stages 4-6 into an unavoidable failure. */
  const riskBias=[9,16,22,29,34,30,18][stage];
  const rolescore=stage===0?gateMean(ps.map(p=>p.axes[1])):stage===1?detect.axes[0]:stage===2?gateMean(ps.map(p=>p.axes[0])):stage===3?gateMean(ps.map(p=>p.axes[8])):stage===4?sustain.axes[7]:stage===5?lead.axes[10]:gateMean(ps.map(p=>p.axes[11]));
  const choices=ps.map(p=>gateChoice(p,stage));
  const roleChoices=ps.map(p=>gateChoice(p,4+(stage%4)));
  const choiceAxes=ps.map(p=>gateScenarios(p.role)[stage].opts[p.choices[stage]].axis);
  const aligned=new Set(choiceAxes).size===1;
  const shared=gateMean(ps.map(p=>p.axes[4]));
  const roleAffinity=gateMean(ps.map(p=>p.axes[gateScenarios(p.role)[4+(stage%4)].opts[p.choices[4+(stage%4)]].axis]));
  const readiness=Math.round(rolescore*4.5+shared*1.4+roleAffinity+(aligned?4:0));
  const currentThreat=threat;
  /* Balance escalating external danger against actual tactical readiness, not the number of Guides in the squad. */
  const pressure=Math.round(gateClamp(15+riskBias+threat*.29-readiness*.22));
  const successStep=readiness>=pressure-2;
  if(successStep)success++;else cohesion=gateClamp(cohesion-7);
  const localResource=[];
  state=state.map((old,i)=>{
   const p=ps[i],active=p.role==="센티넬";
   const guideChoice=p.choices[4+(stage%4)];
   // 가이딩은 자동 발생하지 않습니다. 이 모형에서는 관련 행동을 명시적으로 선택했을 때만 잔량을 소모합니다.
   const requestedGuiding=!active&&((stage===0&&guideChoice===1)||(stage===1&&guideChoice===1)||(stage===3&&guideChoice===0)||(stage===4&&guideChoice===1)||(stage===5&&guideChoice===1)||(stage===6&&guideChoice===1));
   const guiding=requestedGuiding&&old.value>0;
   const drain=active?Math.max(3,Math.round(pressure*.14+p.axes[5]*.5-p.axes[7]*.35)):guiding?Math.min(old.value,Math.max(3,Math.round(pressure*.13+p.axes[6]*.2-p.axes[7]*.45))):0;
   const recovery=stage===6?Math.max(3,Math.round(p.axes[11]*1.3)):0;
   const value=active?Math.round(gateClamp(old.value+drain-recovery)):Math.round(gateClamp(old.value-drain+recovery));
   localResource.push({name:p.name,role:p.role,before:old.value,after:value,change:active?value-old.value:old.value-value,kind:active?"부하도":"가이딩 잔량",guiding});
   return {...old,value};
  });
  const critical=state.some(p=>p.role==="센티넬"?p.value>=86:p.value<=14);
  threat=Math.round(gateClamp(threat*.65+pressure*.35+(successStep?-5:7)+(critical?9:0)-((stage===5&&lead.axes[10]>7)?6:0)));
  cohesion=Math.round(gateClamp(cohesion+(successStep?3:-3)+(aligned?2:0)));
  const actor=ps[stage%3],roleText=stage===0?`정보가 먼저 모이면 ${gateEngineJosa(lead.name, "이", "가")} 초기 역할을 확정하고 ${gateEngineJosa(detect.name, "이", "가")} 확인할 신호를 좁힙니다.`:stage===1?`${detect.name}의 정찰이 첫 진입의 리듬을 정합니다. 관찰 범위가 겹치지 않도록 다른 대원은 후방을 살필 수 있습니다.`:stage===2?`처음 확인되지 않은 기척이 드러납니다. ${gateEngineJosa(detect.name, "이", "가")} 포착한 정보가 ${lead.name}에게 전달되는 순서가 중요합니다.`:stage===3?`행동이 엇갈리면 ${gateEngineJosa(lead.name, "은", "는")} 기존 배치를 유지할지 다른 방법을 택할지 선택해야 합니다.`:stage===4?`${gateEngineJosa(sustain.name, "은", "는")} 자원 사용의 한계를 확인합니다. 높은 부하도나 낮은 잔량은 위험을 높일 수 있습니다.`:stage===5?`목표를 이어갈지 철수할지 ${gateEngineJosa(lead.name, "이", "가")} 근거를 정리하고 각자의 의사를 확인해야 합니다.`:`작전이 끝나도 ${sustain.name}의 사후 상태 점검은 별개로 진행해야 합니다.`;
  const consequence=critical?`자원 임계 상태에 가까운 대원이 감지되어 후속 단계의 위험에 추가 영향을 줍니다.`:successStep?`이 단계의 판단이 일정 부분 맞아떨어져 다음 단계의 위협이 낮아지는 흐름입니다.`:`판단이 엇갈리거나 현장의 압박이 높아져 다음 단계에 부담이 남습니다.`;
  const stageDetail=gatePick(GATE_NARRATIVES.stage[stage][successStep?0:1],ps.map(p=>p.id).join(","),"gate-stage",stage,pressure,successStep?"success":"risk");
  stages.push({index:stage+1,title:GATE_STAGES[stage],beforeThreat:currentThreat,pressure,afterThreat:threat,cohesion,success:successStep,critical,summary:roleText+" "+stageDetail,consequence,actions:ps.map((p,i)=>({name:p.name,choice:choices[i],roleChoice:roleChoices[i]})),resources:localResource,lead:actor.name});
 }
 const last=stages.at(-1),finalResources=state;
 const outcome=finalResources.some(p=>p.role==="센티넬"?p.value>=92:p.value<=8)?"긴급 철수 우선":success>=5&&last.afterThreat<58?"작전 목표 확보 가능":success>=3?"조건부 임무 종료":"재평가 및 철수 권장";
 const best=pairs.slice().sort((a,b)=>(b.from.support+b.back.support)-(a.from.support+a.back.support))[0];
 const worst=pairs.slice().sort((a,b)=>b.tension-a.tension)[0];
 const trioSynergies=[
 {title:"정찰 → 판단 → 자원 관리의 연결",condition:`${gateEngineJosa(detect.name, "이", "가")} 전조를 확인하면 ${gateEngineJosa(lead.name, "이", "가")} 행동 순서를 정하고 ${gateEngineJosa(sustain.name, "이", "가")} 남은 여력을 확인할 때입니다.`,effect:"세 역할이 한 인물에 몰리지 않아 위기의 처음과 이후를 동시에 다룰 수 있습니다.",break:"경고를 공유하지 않거나 지휘 판단이 자원 상태 확인보다 앞서 나갈 때입니다."},
 {title:`${best.label}의 역할 보완`,condition:`${best.label}에서 상대의 정보 전달과 전술 조정이 적절한 순서로 이어질 때입니다.`,effect:`제3자인 ${gateEngineJosa(best.third, "이", "가")} 다른 방향의 정보를 점검하면 두 사람의 협력으로 놓칠 수 있는 위험을 보완합니다.`,break:"두 사람만 지원 정보를 주고받고 제3자의 관찰을 작전 판단에서 제외할 때입니다."},
 {title:"세 방향의 추가 감시",condition:`세 사람이 정찰 영역을 나누고 각자 관찰 결과를 짧게 보고할 때입니다.`,effect:`전조 감지 최고점 ${gateFixed(Math.max(...ps.map(p=>p.axes[0])))}점의 대원이 신호를 발견해도 다른 대원이 근거를 확인할 수 있습니다.`,break:"같은 기척을 세 사람이 중복 추적하면서 뒤쪽의 위험을 놓칠 때입니다."},
 {title:"보조 인력으로 이어지는 작전 수정",condition:`전술 유연성이 높은 대원이 변경안을 제시하고 역할 조율 담당이 실제 배치를 바꿀 때입니다.`,effect:`세 사람의 전술 유연성 차이는 ${gateFixed(Math.max(...ps.map(p=>p.axes[8]))-Math.min(...ps.map(p=>p.axes[8])))}점입니다. 차이를 활용해 다른 대안을 검토할 수 있습니다.`,break:"계획을 수정한 사람만 새 목표를 알고 다른 둘은 이전 동선을 따를 때입니다."},
 {title:"재투입 전 여력 재확인",condition:`모든 대원이 작전 종료 후 상태를 따로 보고하고 다음 임무의 지원 범위를 다시 정할 때입니다.`,effect:`작전 최종 단계에서 시뮬레이션 자원 지표를 비교하면 누가 쉬어야 할지 구체적으로 논의할 수 있습니다.`,break:"한 사람이 아직 움직일 수 있다는 이유로 팀 전체를 즉시 다시 투입할 때입니다."}
 ];
 const trioDebuffs=[
 {title:`${worst.label}의 판단 충돌`,trigger:`이 조합에서 양방향 부담 지표가 높은 관계입니다. ${worst.third}의 개입 시점도 영향을 받습니다.`,chain:"두 대원의 행동이 어긋나면 세 번째 사람이 확인해야 할 위험이 늘어납니다.",counter:"제3자가 먼저 결론을 내리지 말고 누구의 관찰이 확인된 사실인지 구분합니다."},
 {title:"자원의 비대칭 소모",trigger:`${finalResources.map(p=>`${p.name} ${p.value}`).join(" · ")}의 마지막 자원 지표가 서로 다른 상황입니다.`,chain:"센티넬 부하도와 가이드 가이딩 잔량은 방향이 반대인 지표라서 단순 합산하면 위험을 놓칠 수 있습니다.",counter:"직군별 지표를 구분하고 추가 지원·철수 기준을 따로 정합니다."},
 {title:"철수 판단이 늦어지는 연쇄",trigger:`팀의 철수 판단 평균이 ${gateFixed(gateMean(ps.map(p=>p.axes[10])))}점인 상태에서 목표 달성을 계속 요구할 때입니다.`,chain:"대원마다 소모가 누적되어 임무를 이어갈 수 있는 범위가 달라집니다.",counter:"게이트 목표와 안전한 귀환을 분리해 누가 중단을 제안해도 검토할 수 있게 합니다."},
 {title:"동시에 시작되는 두 가지 행동",trigger:"두 명이 다른 신호를 기준으로 동시에 움직이고 나머지 한 명이 뒤늦게 상황을 확인할 때입니다.",chain:"지휘와 실행 사이의 보고가 끊기면 세 사람의 동선이 겹칩니다.",counter:"변경된 목표를 실행 전에 한 문장으로 공유합니다."},
 {title:"작전 종료 후 숨은 피로",trigger:`사후 회복 지표 차이가 ${gateFixed(Math.max(...ps.map(p=>p.axes[11]))-Math.min(...ps.map(p=>p.axes[11])))}점인 세 사람이 같은 시간에 재투입을 요청받을 때입니다.`,chain:"임무 종료 사실을 자원 회복의 완료와 혼동하면 다음 게이트에서 위험이 더 빠르게 커질 수 있습니다.",counter:"회복 가능 여부와 다음 작전에 필요한 자원 조건을 대원별로 확인합니다."}
 ];
 return {roles,pairs,stages,synergies:trioSynergies,debuffs:trioDebuffs,finalResources,outcome,success,threat:last.afterThreat,cohesion:last.cohesion,notice:"일곱 단계의 작전 흐름을 통해 대원별 자원 부담과 판단의 차이를 살펴볼 수 있습니다. 다음 진입에 앞서 각자의 한계와 역할을 다시 조율하는 편이 좋습니다."};
}
