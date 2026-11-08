'use strict';
// 방향별 발신/수신 해석과 점수 기반 시너지·역효과 엔진
function linkSeed(a,b){return [a.id||a.name,b.id||b.name,a.role,b.role,a.axes.join(","),b.axes.join(","),a.choices.join(""),b.choices.join("")].join("|");}

function pickNonrepeat(pool,seed,key,ex){
 let x=teamPick(pool,seed,key);if(ex&&ex.includes(x)&&pool.length>1)x=pool[(pool.indexOf(x)+1)%pool.length];return x;
}

function directionLayers(src,dst,avoid){
 const seed=linkSeed(src,dst),v=interaction(src,dst);
 const rx=pickNonrepeat(SYNERGY_DB.rx[bandIndex(src.axes[1])][bandIndex(dst.axes[0])],seed,"rx",avoid?.parts[0]?.paragraph);
 const gap=src.axes[2]-dst.axes[2],det=gap>1.3?"lead":gap< -1.3?"follow":"together";
 const detect=pickNonrepeat(SYNERGY_DB.cues.detect[det],seed,"detect",avoid?.parts[1]?.paragraph);
 const supportType=src.axes[3]>=6.4&&src.axes[4]<5.2&&dst.axes[4]>6.1?"push":src.axes[3]>=6.4&&dst.axes[0]>=5.4?"welcome":src.axes[3]<4.5?"wait":"mixed";
 const supp=pickNonrepeat(SYNERGY_DB.cues.support[supportType],seed,"support",avoid?.parts[2]?.paragraph);
 const effectType=v.delta>10?"debuff":v.delta< -10?"synergy":"mixed";
 const impact=pickNonrepeat(SYNERGY_DB.cues.effect[effectType],seed,"effect",avoid?.parts[4]?.paragraph);
 const roleType=src.role==="센티넬"&&dst.role==="센티넬"?"SS":src.role==="가이드"&&dst.role==="가이드"?"GG":"SG";
 const roleLine=pickNonrepeat(SYNERGY_DB.cues.role[roleType],seed,"role",avoid?.parts[3]?.paragraph);
 const all=getScenarios(src.role);
 const roleIndex=4+(Math.round(src.axes[1]*5+dst.axes[0]*7+src.axes[3]*3)%4);
 const commonIndex=(Math.round(src.axes[2]*3+dst.axes[4]*7))%4;
 const sourceScene=all[roleIndex],receiveScene=getScenarios(dst.role)[commonIndex];
 const sourceAct=sourceScene?.opts?.[src.choices[roleIndex]]?.[0]||"상황을 살핀다";
 const receiveAct=receiveScene?.opts?.[dst.choices[commonIndex]]?.[0]||"상황을 살핀다";
 const targetReading=dst.axes[0]>=6.8?`${dst.name}은(는) 작은 자극도 폭넓게 받아들이므로 ${src.name}의 행동이 오래 남을 여지가 있습니다.`:
    dst.axes[0]<4.5?`${dst.name}은(는) 필요한 신호만 선별하려 해 ${src.name}의 뜻이 명확하게 전달되어야 합니다.`:
    `${dst.name}은(는) 상황에 따라 자극의 강도를 조절하기 때문에 전달 시점이 반응을 좌우합니다.`;
 const roleDetail=src.role==="가이드"&&dst.role==="센티넬"?
   `${src.name}은(는) 자신의 가이딩 잔량과 ${dst.name}의 부하도 변화를 함께 확인할 필요가 있습니다. 가이딩을 수행한다면 그 범위와 종료 시점도 당사자와 합의해야 합니다.`:
  src.role==="센티넬"&&dst.role==="가이드"?
   `${src.name}이(가) 부하도 상승을 알리는 순간 ${dst.name}의 가이딩 잔량도 확인해야 합니다. 불편함을 숨기면 지원자가 필요한 시점을 가늠하기 어려워집니다.`:
  src.role==="가이드"?
   `${src.name}은(는) ${dst.name}과(와) 다른 가이딩 잔량을 지닙니다. 지원 순서를 정할 때 ${src.name}의 현재 여력을 별도로 확인하고, ${dst.name}의 지원 가능성까지 이미 확보된 자원처럼 계산하지 않는 편이 좋습니다.`:
   `센티넬인 ${src.name}은(는) ${dst.name}의 상태를 자신의 부하도와 따로 살펴야 합니다. ${src.name}이(가) 주변 자극을 조정하거나 외부 가이딩 지원을 요청하는 식으로 행동할 수 있으며, ${dst.name}의 감각 부담을 무조건 대신 해결하는 관계는 아닙니다.`;
 const ending=v.delta>10?
  `${src.name}→${dst.name}에서는 자극 ${v.stimulation}에 비해 완충 ${v.buffer}이 낮아 부담이 앞서기 쉽습니다. ${impact}`:
  v.delta< -10?`${src.name}→${dst.name}에서는 완충 ${v.buffer}이 자극 ${v.stimulation}보다 높게 나타나 상대가 숨 돌릴 여지가 있습니다. ${impact}`:
  `${src.name}→${dst.name}에서는 자극 ${v.stimulation}과 완충 ${v.buffer}이 비슷해 실제 행동의 시점에 따라 영향이 바뀔 수 있습니다. ${impact}`;
 const parts=[
 {label:"01 · 발신자의 행동이 상대에게 닿는 방식",paragraph:`${src.name}의 표현 강도는 ${fixed(src.axes[1])}점이고 ${dst.name}의 감각 수용은 ${fixed(dst.axes[0])}점입니다. ${rx} ${targetReading}`},
 {label:"02 · 경고를 발견하는 순서",paragraph:`전조 감지는 ${src.name} ${fixed(src.axes[2])}점, ${dst.name} ${fixed(dst.axes[2])}점입니다. ${detect} ${src.name}의 관찰이 ${dst.name}에게 구체적인 근거와 함께 전달된다면, 두 사람은 어떤 정보를 먼저 확인할지 조율할 수 있습니다.`},
 {label:"03 · 완충이 도움이 되거나 부담이 되는 순간",paragraph:`${src.name}의 완충 개입 ${fixed(src.axes[3])}점과 경계 조율 ${fixed(src.axes[4])}점이 동시에 작용합니다. ${supp} ${src.name}이(가) 제안하는 지원의 범위와 ${dst.name}이(가) 실제 원하는 도움의 범위가 만나면서 이 점수의 차이가 구체적인 행동으로 드러납니다.`},
 {label:"04 · 실제 선택에서 보이는 차이",paragraph:`${src.name}은(는) '${sourceScene.title}'에서 '${sourceAct}'를 선택했고, ${dst.name}은(는) '${receiveScene.title}'에서 '${receiveAct}'를 선택했습니다. ${roleLine} ${roleDetail}`},
 {label:"05 · 이 방향의 시너지와 역효과",paragraph:ending}
 ];
 return {src:src.name,dst:dst.name,stimulation:v.stimulation,buffer:v.buffer,delta:v.delta,kind:effectType,parts,body:parts.map(x=>x.paragraph).join("\n\n")};
}

function relationshipCards(a,b,ab,ba){
 const x=a.axes,y=b.axes,gap=Math.abs(x[2]-y[2]),p=[];
 const best=ab.buffer>=ba.buffer?[a,b,ab]:[b,a,ba];
 const synergies=[
 {weight:40+Math.max(x[2],y[2])*5+gap*2,title:gap>1.5?"전조 감지와 검증의 분업":"함께 발견하는 위험 신호",text:`${gap>1.5?x[2]>y[2]?a.name:b.name:a.name}은(는) 위험을 먼저 알리거나 경고를 교차 확인할 수 있습니다. ${gap>1.5?"감지 시점이 다른 만큼 경고와 검증을 나누면 대응의 폭이 넓어집니다.":"감지 시점이 가까워 서로의 단서를 빠르게 이해하지만, 확인할 방향을 나누면 더 안전합니다."}`},
 {weight:35+best[2].buffer*.5,title:"감각 부담을 덜어 주는 방향",text:`${best[0].name}→${best[1].name} 방향에서 완충 지표는 ${best[2].buffer}입니다. 이 방향의 환경 조정이나 지원 제안이 상대에게 숨을 고를 틈을 만들 수 있습니다. 다만 지원을 원하는 시점과 범위는 확인해야 합니다.`},
 {weight:25+Math.min(x[4],y[4])*6,title:"경계와 동의의 협력",text:`${a.name}의 경계 조율 ${fixed(x[4])}점, ${b.name}의 경계 조율 ${fixed(y[4])}점이 서로 만납니다. 도움의 범위가 일치한다면 불필요한 개입을 줄이고, 차이가 있다면 사전에 합의하는 과정이 시너지가 됩니다.`},
 {weight:65-Math.abs(x[5]-y[5])*4,title:"회복의 리듬을 존중하는 동행",text:`감각적 여운의 차이는 ${fixed(Math.abs(x[5]-y[5]))}점입니다. ${Math.abs(x[5]-y[5])<1.6?"함께 쉰 뒤 다시 움직이기 편할 수 있습니다.":"서로 다른 회복 시간을 인정하면 다음 동행을 위한 불필요한 압박을 줄일 수 있습니다."}`},
 {weight:40+Math.abs(x[0]-y[0])*3+gap*2,title:"다른 감각으로 빈틈 메우기",text:`${a.name}의 감각 수용은 ${fixed(x[0])}점, ${b.name}은(는) ${fixed(y[0])}점입니다. 작은 기척을 많이 받아들이는 사람과 중요한 정보만 선별하는 사람이 서로 관찰을 공유하면 놓친 단서를 보완할 수 있습니다.`}
 ];
 if(a.role!==b.role)synergies.push({weight:65,title:"부하도·가이딩 잔량을 함께 고려하기",text:`${a.role==="센티넬"?a.name:b.name}의 부하도 변화를 알리는 행동과 ${a.role==="가이드"?a.name:b.name}의 가이딩 잔량 확인이 이어지면 지원 시점을 더 명확히 정할 수 있습니다. 두 사람의 자원 상태를 하나로 취급하지 않는 판단이 중요합니다.`});
 const worse=ab.delta>=ba.delta?[a,b,ab]:[b,a,ba];
 const debuffs=[
 {weight:Math.max(x[1]*y[0],y[1]*x[0]),title:"자극이 맞물릴 때의 과부담",text:`${worse[0].name}→${worse[1].name} 방향의 자극·완충 차이는 ${worse[2].delta>=0?"+":""}${worse[2].delta}입니다. ${worse[2].delta>10?"상대가 이미 예민한 상태라면 신호가 추가적인 부담이 될 수 있습니다.":"평소에는 균형을 유지해도 급박한 현장에서는 전달 강도를 조절할 필요가 있습니다."}`},
 {weight:35+Math.abs(x[4]-y[4])*9,title:"배려가 간섭으로 바뀌는 경계",text:`경계 조율 점수 차이가 ${fixed(Math.abs(x[4]-y[4]))}점입니다. 한 사람은 먼저 묻고 다른 한 사람은 먼저 움직일 수 있습니다. 특히 위험을 느끼는 순간 서로 다른 도움의 기준이 충돌합니다.`},
 {weight:30+gap*8,title:"경고 시점의 어긋남",text:`전조 감지 점수 차이가 ${fixed(gap)}점으로 나타납니다. ${gap>2?"한쪽의 빠른 경고가 다른 사람에게는 충분한 근거 없이 들릴 수 있습니다.":"두 사람이 같은 위험만 바라보면 작은 사각지대가 생길 수 있습니다."} 위험 정보를 짧게 설명할 순서를 마련하는 편이 좋습니다.`},
 {weight:30+Math.abs(x[3]-y[3])*7,title:"지원 역할의 쏠림",text:`${a.name}의 완충 개입 ${fixed(x[3])}점과 ${b.name}의 ${fixed(y[3])}점은 지원을 시작하는 시점이 달라질 가능성을 보여 줍니다. 한 사람에게만 해결을 맡기면 부담이 쌓일 수 있습니다.`},
 {weight:30+Math.abs(x[5]-y[5])*7,title:"사후 회복의 시간차",text:`${x[5]>=y[5]?a.name:b.name}에게 감각적 여운이 상대적으로 오래 남을 가능성이 있습니다. 한 사람이 편안해졌다고 해서 다른 사람도 다음 일정을 바로 감당할 수 있는 것은 아닙니다.`}
 ];
 if(a.role==="가이드"||b.role==="가이드")debuffs.push({weight:50+Math.max(x[3],y[3])*3,title:"가이딩 잔량의 집중 소모",text:`${[a,b].filter(q=>q.role==="가이드").map(q=>q.name).join("·")}의 가이딩 잔량은 별도로 확인해야 합니다. 한쪽의 완충이 강하게 나와도 연속 가이딩을 무조건 감당할 수 있는 것은 아닙니다. 지원 역할을 나누는 판단이 필요합니다.`});
 synergies.sort((v,w)=>w.weight-v.weight);debuffs.sort((v,w)=>w.weight-v.weight);
 return {synergies:synergies.slice(0,4),debuffs:debuffs.slice(0,4)};
}

function pairDeepResult(a,b){
 const base=pairResult(a,b),seed=linkSeed(a,b),fw=directionLayers(a,b),bw=directionLayers(b,a,fw);
 const c=relationshipCards(a,b,base.fromAToB,base.fromBToA),diff=Math.abs(a.axes[2]-b.axes[2]);
 const same=diff<1.6&&Math.abs(a.axes[0]-b.axes[0])<1.6;
 const opening=`${a.name}의 표현 강도 ${fixed(a.axes[1])}점과 ${b.name}의 감각 수용 ${fixed(b.axes[0])}점, 그리고 반대 방향의 조합은 서로 다른 관계를 만듭니다. ${teamPick(TEAM_DB.PAIR.opening[same?"same":"different"],seed,"opening")} ${fw.kind!==bw.kind?"한쪽에서는 완충이, 다른 쪽에서는 자극이 앞설 수 있어 서로의 편안함이 자동으로 일치하지는 않습니다.":"같은 방향의 영향이 나오더라도 실제 전달 방식과 선택한 대응은 두 사람마다 다르게 나타납니다."}`;
 const sigKey=diff>1.5?"split":Math.min(a.axes[2],b.axes[2])>=6.8?"fast":"slow";
 const signal=`${teamPick(TEAM_DB.PAIR.signal[sigKey],seed,"signal")} ${a.name}의 전조 감지 ${fixed(a.axes[2])}점과 ${b.name}의 ${fixed(b.axes[2])}점을 비교하면, 감지와 후속 행동을 어떻게 나눌지가 중요한 협력 조건입니다.`;
 const supKey=Math.abs(a.axes[3]-b.axes[3])>1.6?"split":Math.min(a.axes[3],b.axes[3])>6.8?"both":"quiet";
 const supportTiming=`${teamPick(TEAM_DB.PAIR.support[supKey],seed,"support")} ${a.name}과(와) ${b.name}이(가) 어떤 순간에 도움을 제안하는지에 따라 상대가 받는 부담이 달라질 수 있습니다.`;
 const misKey=Math.abs(a.axes[4]-b.axes[4])>1.6?"boundary":Math.abs(a.axes[1]-b.axes[1])>1.6?"expression":"timing";
 const misreading=`${teamPick(TEAM_DB.PAIR.misread[misKey],seed,"misread")} 두 사람이 같은 행동을 서로 다른 뜻으로 해석하는 순간에는 먼저 무엇이 필요했는지 구체적으로 확인하는 편이 좋습니다.`;
 const roleKey=a.role==="센티넬"&&b.role==="센티넬"?"SS":a.role==="가이드"&&b.role==="가이드"?"GG":"SG";
 const resource=`${teamPick(TEAM_DB.PAIR.role[roleKey],seed,"role")} ${base.role}`;
 const restGap=Math.abs(a.axes[5]-b.axes[5]);
 const recovery=`${teamPick(TEAM_DB.PAIR.after[restGap>1.8?"split":Math.min(a.axes[5],b.axes[5])>=6.8?"slow":"fast"],seed,"rest")} 두 사람의 잔향 회복 차이는 ${fixed(restGap)}점입니다.`;
 const pick=(p,i)=>getScenarios(p.role)[i]?.opts[p.choices[i]]?.[0]||"상황을 살핀다";
 const scenes=[
 {title:"첫 번째 경고를 들었을 때",text:`${a.name}은(는) '${pick(a,0)}', ${b.name}은(는) '${pick(b,0)}'를 선택했습니다. 이 선택들은 위험을 발견했을 때 무엇을 먼저 지키는지 보여 줍니다. 누가 경고를 전달하고 누가 별도의 신호를 확인할지 나누면 충돌을 줄일 수 있습니다.`},
 {title:"동료에게 도움이 필요할 때",text:`${a.name}의 대응은 '${pick(a,1)}'이고 ${b.name}의 대응은 '${pick(b,1)}'입니다. 지원을 빨리 시작하는 사람은 장면을 바꾸려 하고, 신중하게 확인하는 사람은 상대가 감당할 범위를 살핍니다. 두 판단의 순서를 맞추면 도움이 간섭으로 변하는 순간을 줄일 수 있습니다.`},
 {title:"게이트를 떠난 뒤",text:`${a.name}은(는) '${pick(a,5)}'를 선택했고 ${b.name}은(는) '${pick(b,5)}'를 선택했습니다. 두 사람은 각 직군의 장면에서 회복을 다르게 다룹니다. 어느 쪽이 먼저 안정되었는지보다 언제 다음 행동을 시작할 준비가 되는지 확인하는 편이 좋습니다.`}
 ];
 const decision=`경계 조율 점수는 ${a.name} ${fixed(a.axes[4])}점, ${b.name} ${fixed(b.axes[4])}점입니다. ${Math.abs(a.axes[4]-b.axes[4])>2.2?"두 사람 중 한쪽이 먼저 움직이려 하고 다른 쪽이 사전 동의를 원할 수 있습니다.":"기본적인 기준이 비슷해도 위기에서는 설명을 생략할 수 있습니다."} 실제 개입 이전에 상대가 선택할 수 있는 범위를 간단히 확인하는 편이 좋습니다.`;
 const gap=base.fromAToB.delta-base.fromBToA.delta;
 const turning=`${Math.abs(gap)>13?`${base.fromAToB.delta>base.fromBToA.delta?a.name:b.name}에게서 상대 방향으로 전달되는 자극과 완충의 차이가 더 크게 나타납니다.`:"두 방향의 자극·완충 차이는 비교적 가까운 편입니다."} ${teamPick(TEAM_DB.PAIR.outlook[Math.abs(gap)>20?"asymmetric":same?"near":"far"],seed,"outlook")} 두 방향에서 자극과 완충이 뒤바뀌는 장면을 살펴보면 관계의 균형을 더 명확히 읽을 수 있습니다.`;
 return {...base,opening,fromA:fw.body,fromB:bw.body,directional:[fw,bw],synergies:c.synergies,debuffs:c.debuffs,
 signal,supportTiming,misreading,resource,recovery,decision,turning,scenes,outlook:turning,
 primary:`${opening} ${base.primary}`,support:c.synergies[2].text,risk:c.debuffs[2].text};
}
