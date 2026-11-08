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
 const all=getScenarios(src.role);
 const roleIndex=4+(Math.round(src.axes[1]*5+dst.axes[0]*7+src.axes[3]*3)%4);
 const commonIndex=(Math.round(src.axes[2]*3+dst.axes[4]*7))%4;
 const sourceScene=all[roleIndex],receiveScene=getScenarios(dst.role)[commonIndex];
 const sourceAct=sourceScene?.opts?.[src.choices[roleIndex]]?.[0]||"상황을 살핀다";
 const receiveAct=receiveScene?.opts?.[dst.choices[commonIndex]]?.[0]||"상황을 살핀다";
 const roleDetail=src.role==="가이드"&&dst.role==="센티넬"?
   `${src.name}은(는) 자신의 가이딩 잔량과 ${dst.name}의 부하도 변화를 함께 확인할 필요가 있습니다. 가이딩을 수행한다면 그 범위와 종료 시점도 당사자와 합의해야 합니다.`:
   src.role==="센티넬"&&dst.role==="가이드"?
   `${src.name}이(가) 부하도 상승을 알리는 순간 ${dst.name}의 가이딩 잔량도 확인해야 합니다. 불편함을 숨기면 지원자가 필요한 시점을 가늠하기 어려워집니다.`:"";
 const ending=v.delta>10?
  `${src.name}→${dst.name}에서는 자극 ${v.stimulation}에 비해 완충 ${v.buffer}이 낮아 부담이 앞서기 쉽습니다. ${impact}`:
  v.delta< -10?`${src.name}→${dst.name}에서는 완충 ${v.buffer}이 자극 ${v.stimulation}보다 높게 나타나 상대가 숨 돌릴 여지가 있습니다. ${impact}`:
  `${src.name}→${dst.name}에서는 자극 ${v.stimulation}과 완충 ${v.buffer}이 비슷해 실제 행동의 시점에 따라 영향이 바뀔 수 있습니다. ${impact}`;
 const detectComparison=gap>1.3?
   `${src.name}의 전조 감지는 ${fixed(src.axes[2])}점으로 ${dst.name}보다 ${fixed(gap)}점 높습니다.`:
   gap< -1.3?`${src.name}의 전조 감지는 ${fixed(src.axes[2])}점으로 ${dst.name}보다 ${fixed(-gap)}점 낮습니다.`:
   `${src.name}의 전조 감지는 ${fixed(src.axes[2])}점으로 상대와 비슷한 수준입니다.`;
 const parts=[
 {label:"01 · 발신자의 행동이 상대에게 닿는 방식",paragraph:`${src.name}의 표현 강도는 ${fixed(src.axes[1])}점이고 ${dst.name}의 감각 수용은 ${fixed(dst.axes[0])}점입니다. ${rx}`},
 {label:"02 · 경고를 발견하는 순서",paragraph:`${detectComparison} ${detect}`},
 {label:"03 · 완충이 도움이 되거나 부담이 되는 순간",paragraph:`${src.name}의 완충 개입은 ${fixed(src.axes[3])}점, 경계 조율은 ${fixed(src.axes[4])}점입니다. ${supp}`},
 {label:"04 · 실제 선택에서 보이는 차이",paragraph:`${src.name}은(는) '${sourceScene.title}'에서 '${sourceAct}'를 선택했고, ${dst.name}은(는) '${receiveScene.title}'에서 '${receiveAct}'를 선택했습니다. ${roleDetail}`.trim()},
 {label:"05 · 이 방향의 시너지와 역효과",paragraph:ending}
 ];
 return {src:src.name,dst:dst.name,stimulation:v.stimulation,buffer:v.buffer,delta:v.delta,kind:effectType,parts,body:parts.map(x=>x.paragraph).join("\n\n")};
}

function relationshipCards(a,b,ab,ba){
 const x=a.axes,y=b.axes,seed=linkSeed(a,b),gap=Math.abs(x[2]-y[2]);
 const first=x[2]>=y[2]?a:b,verify=first===a?b:a;
 const buffer=ab.buffer>=ba.buffer?a:b,receiver=buffer===a?b:a;
 const direct=buffer===a?ab:ba;
 const higherBoundary=x[4]>=y[4]?a:b,lowerBoundary=higherBoundary===a?b:a;
 const leadSupport=x[3]>=y[3]?a:b,otherSupport=leadSupport===a?b:a;
 const longer=x[5]>=y[5]?a:b,earlier=longer===a?b:a;
 const biggerExposure=x[1]*y[0]>=y[1]*x[0]?a:b,biggerReceiver=biggerExposure===a?b:a;
 const heavier=ab.delta>=ba.delta?a:b,heavierTarget=heavier===a?b:a;
 const guides=[a,b].filter(p=>p.role==="가이드");
 const scenario=(p,i)=>getScenarios(p.role)[i]?.opts?.[p.choices[i]]?.[0]||"현재 상황을 확인한다";
 const any=(key,options)=>teamPick(options,seed,"card-"+key);
 const synergies=[
  {
   weight:40+Math.max(x[2],y[2])*5+gap*2,
   title:gap>1.5?"경고와 검증을 이어 주는 협력":"같은 경고를 다른 근거로 확인하기",
   text:`**활성 조건** ${first.name}이(가) 발견한 기척을 결론이 아닌 관찰 사실로 전하고, ${verify.name}이(가) 다른 정보로 교차 확인할 때입니다. ${any("warning",[
     `${first.name}은(는) '무엇이 달라졌는가'를 먼저 알리고 ${verify.name}은(는) '그 변화가 반복되는가'를 살필 수 있습니다.`,
     `${verify.name}에게 모든 경고를 따라 하게 하기보다, ${first.name}이(가) 놓친 방향을 맡기는 편이 더 유용합니다.`,
     `첫 경고를 듣는 즉시 둘 다 뛰어들기보다 ${first.name}은(는) 발생 위치를, ${verify.name}은(는) 경고 이전의 상황을 확인하는 방식이 가능합니다.`,
     `경고의 내용과 아직 확인되지 않은 추측을 분리하면 ${verify.name}이(가) ${first.name}의 판단을 부정하지 않고 검증에 참여할 수 있습니다.`
   ])} **깨지는 순간** 서로 같은 단서만 반복 확인하거나, 상대의 첫 경고를 근거 없이 무시할 때입니다.`
  },
  {
   weight:35+direct.buffer*.5,
   title:"완충 효과를 살리는 실제 지원 순서",
   text:`**활성 조건** ${receiver.name}이(가) 필요한 도움의 종류를 먼저 밝히거나 ${buffer.name}이(가) 짧은 선택지를 제안할 때입니다. ${any("support",[
     `${buffer.name}은(는) 바로 가까이 다가가기보다 '자극을 줄일까, 잠시 역할을 바꿀까?'처럼 구체적인 조정 방법을 제시할 수 있습니다.`,
     `${receiver.name}이(가) 지금은 대화보다 환경 정리를 원한다면 ${buffer.name}은(는) 직접적인 개입 대신 주변 소음이나 동선을 조정하는 역할을 택할 수 있습니다.`,
     `지원의 목적을 '상대를 즉시 안정시키기'보다 '상대가 다음 행동을 선택할 여유 만들기'로 잡으면 ${buffer.name}의 개입이 일방적인 통제가 되지 않습니다.`,
     `${buffer.name}은(는) 먼저 당사자의 부담이 무엇인지 확인하고 ${receiver.name}은(는) 받아들일 수 있는 도움의 범위를 답하는 식으로 순서를 나눌 수 있습니다.`
   ])} **깨지는 순간** ${buffer.name}이(가) 편하다고 생각한 방식을 ${receiver.name}의 확인 없이 반복할 때입니다.`
  },
  {
   weight:25+Math.min(x[4],y[4])*6,
   title:"동의가 빠르게 전달되는 약속 만들기",
   text:`**활성 조건** 게이트 진입 전에 두 사람이 '말로 경고하기 / 위치 바꾸기 / 직접 지원하기' 중 어디까지 먼저 해도 좋은지 정할 때입니다. ${any("consent",[
     `${higherBoundary.name}이(가) 질문을 정리하고 ${lowerBoundary.name}이(가) 긴급 상황에서 바로 필요한 행동을 제안하면 확인 절차가 길어지지 않습니다.`,
     `${a.name}과(와) ${b.name}은(는) 직접 도움을 받기 싫은 때 사용할 짧은 거절 신호를 정해 불필요한 실랑이를 줄일 수 있습니다.`,
     `서로의 선택권을 남기면서도 위험이 커지면 어떤 도움부터 허용할지 한두 단계로 합의해 두면 대응이 빠릅니다.`,
     `허용된 지원과 반드시 다시 물어봐야 하는 지원을 구분해 두면 익숙해진 사이에서도 경계를 놓치지 않을 수 있습니다.`
   ])} **깨지는 순간** 평소의 동의를 모든 상황에 대한 영구적인 허락으로 받아들일 때입니다.`
  },
  {
   weight:65-Math.abs(x[5]-y[5])*4,
   title:"다음 행동을 결정하는 이중 회복 점검",
   text:`**활성 조건** 게이트 종료 직후 ${earlier.name}이(가) 먼저 괜찮아졌더라도 ${longer.name}의 상태 확인이 끝날 때까지 재진입 결정을 유보하는 경우입니다. ${any("recovery",[
     `둘 다 '지금 다시 들어갈 수 있는가'와 '조용한 장소가 필요한가'를 따로 답하면 겉으로 보이는 침착함만으로 일정을 정하지 않게 됩니다.`,
     `${longer.name}에게는 감각을 정리할 시간이, ${earlier.name}에게는 다음 단계에 필요한 정보를 모을 시간이 주어질 수 있습니다.`,
     `재진입을 논의할 때 바로 찬반을 묻기보다 각자 남아 있는 자극 하나씩을 확인하면 다른 회복 속도를 실무적으로 반영할 수 있습니다.`,
     `한 사람이 먼저 회복하더라도 그 여유를 다른 사람의 회복을 재촉하는 데 쓰지 않고 후속 정보 정리에 쓸 수 있습니다.`
   ])} **깨지는 순간** 한 사람의 빠른 회복을 두 사람 모두의 복귀 준비로 오인할 때입니다.`
  },
  {
   weight:40+Math.abs(x[0]-y[0])*3+gap*2,
   title:"서로 보지 못하는 신호를 교환하기",
   text:`**활성 조건** ${x[0]>=y[0]?a.name:b.name}이(가) 미세한 변화의 목록을 만들고, ${x[0]>=y[0]?b.name:a.name}이(가) 그중 실제 대응이 필요한 신호를 좁혀 줄 때입니다. ${any("coverage",[
     `둘 다 같은 장면만 관찰하면 장점이 줄어듭니다. 한 사람은 동료의 반응을, 다른 사람은 주변의 환경을 맡는 방식이 더 구체적입니다.`,
     `작은 변화가 많아질 때는 모든 자극을 보고하기보다 평소와 달라진 항목 세 가지를 추려 공유하는 방식이 가능합니다.`,
     `두 사람이 포착한 정보가 다르다면 그 차이를 불일치로 보지 않고 다음에 확인할 단서로 활용할 수 있습니다.`,
     `세부 신호를 모으는 역할과 그것을 행동으로 옮길지 결정하는 역할이 분리되면 정보의 과잉을 줄일 수 있습니다.`
   ])} **깨지는 순간** 한쪽의 감각 문턱만 정상이라고 정해 상대의 관찰을 배제할 때입니다.`
  }
 ];
 if(a.role!==b.role){
  const sentinel=a.role==="센티넬"?a:b,guide=a.role==="가이드"?a:b;
  synergies.push({
   weight:65,title:"가이딩 요청을 실제로 조율하는 순서",
   text:`**활성 조건** ${sentinel.name}이(가) 부하도 전조와 원하는 지원을 알리고 ${guide.name}이(가) 자신의 가이딩 잔량을 고려해 가능한 범위를 제안할 때입니다. ${any("sg",[
     `가이딩을 바로 결정하기 전에 ${sentinel.name}은(는) 현재 어려운 감각을 설명하고, ${guide.name}은(는) 환경 조정만으로 대응할 여지가 있는지 먼저 살필 수 있습니다.`,
     `한 번 지원한 뒤에도 두 사람의 상태를 따로 확인하면 ${guide.name}의 소모를 감춘 채 다음 요청을 이어가는 상황을 줄일 수 있습니다.`,
     `${guide.name}은(는) 지원 가능한 범위를 먼저 알리고 ${sentinel.name}은(는) 그 범위 안에서 어떤 조치가 가장 필요한지 선택할 수 있습니다.`,
     `요청을 거절하거나 미루는 순간에도 ${sentinel.name}의 안전을 위해 다른 대안이나 외부 지원 방법을 함께 찾을 수 있습니다.`
   ])} **깨지는 순간** ${guide.name}의 이전 가이딩 성공을 현재 잔량과 관계없는 무제한 지원으로 생각할 때입니다.`
  });
 }
 const synergiesOrdered=synergies.sort((v,w)=>w.weight-v.weight);
 const debuffs=[
  {
   weight:Math.max(x[1]*y[0],y[1]*x[0]),
   title:"강한 표현이 경고를 넘어 압박이 되는 순간",
   text:`**발동 계기** ${biggerExposure.name}이(가) 빠른 지시를 반복하는 동안 ${biggerReceiver.name}이(가) 이미 여러 자극을 처리하고 있는 상황입니다. ${any("overload",[
     `지시를 더 크게 반복하면 필요한 정보보다 긴장만 늘어날 수 있습니다. ${biggerExposure.name}은(는) 한 번에 한 가지 행동만 전달하는 편이 좋습니다.`,
     `${biggerReceiver.name}이(가) 답이 늦더라도 못 들었다고 단정하지 말고 다른 신호를 처리 중인지 확인하는 편이 좋습니다.`,
     `표현의 강도를 갑자기 높이는 대신 현재 위험, 필요한 행동, 확인할 시간의 순서로 알리면 추가 자극을 줄일 수 있습니다.`,
     `급한 현장에서는 말의 양을 줄이고 ${biggerReceiver.name}이(가) 확인한 내용을 한 번 되짚도록 하는 편이 안정적입니다.`
   ])} **확대 경로** 경고를 이해하지 못했다고 판단해 발신자가 더 강한 표현을 반복하는 경우입니다.`
  },
  {
   weight:35+Math.abs(x[4]-y[4])*9,
   title:"도움의 순서가 어긋나 생기는 반발",
   text:`**발동 계기** ${lowerBoundary.name}이(가) 먼저 해결하려는 행동을 하고 ${higherBoundary.name}이(가) 그 범위를 확인하고 싶어 하는 순간입니다. ${any("boundary",[
     `일단 도움을 준 뒤 설명하면 충분하다고 생각하는 쪽과 먼저 묻는 것을 신뢰로 여기는 쪽은 같은 행동을 다르게 기억할 수 있습니다.`,
     `${higherBoundary.name}이(가) 동의를 확인하는 동안 ${lowerBoundary.name}이(가) 손을 뻗으면 속도 차이가 보호와 간섭의 갈등으로 바뀔 수 있습니다.`,
     `문제는 지원 의도의 부재가 아니라 허용 범위의 차이입니다. 다음에는 선택할 수 있는 두 가지 조치를 먼저 제시하는 편이 좋습니다.`,
     `경계의 합의가 없으면 한 사람은 지나치게 늦었다고 느끼고 다른 사람은 선택권을 잃었다고 느낄 수 있습니다.`
   ])} **악화 지점** 한 번 허용했던 행동을 다음에도 묻지 않고 반복할 때입니다.`
  },
  {
   weight:30+gap*8,
   title:"경고가 전달되지 않아 벌어지는 시간차",
   text:`**발동 계기** ${first.name}이(가) 이상을 감지해 이미 행동하려 하는데 ${verify.name}에게는 관찰 근거가 충분히 전달되지 않은 상황입니다. ${any("delay",[
     `먼저 본 사람이 결론만 외치면 상대는 왜 움직여야 하는지 알지 못합니다. 발견한 변화 하나를 먼저 말해야 합니다.`,
     `상대가 확인 질문을 하는 시간을 반대 의견으로 받아들이면 두 사람의 행동이 갈라질 수 있습니다.`,
     `판단이 느린 쪽이 반드시 무능한 것은 아닙니다. 필요한 근거가 어느 단계에서 빠졌는지 찾아야 합니다.`,
     `한 사람이 이미 다음 행동에 들어갔다면 남은 사람은 추가 신호를 확인할 여유를 잃을 수 있습니다.`
   ])} **확대 경로** 먼저 움직인 사람이 설명을 생략하고, 상대는 멈춰서 더 많은 근거를 요구하는 경우입니다.`
  },
  {
   weight:30+Math.abs(x[3]-y[3])*7,
   title:"한 사람에게 몰리는 수습 책임",
   text:`**발동 계기** ${leadSupport.name}이(가) 문제를 발견한 뒤 환경 조정과 동료 상태 확인까지 계속 맡는 상황입니다. ${any("burnout",[
     `${otherSupport.name}이(가) 상대를 기다리기만 하면 ${leadSupport.name}은(는) 자신의 감각 부담을 점검할 시간을 잃을 수 있습니다.`,
     `한 사람이 지원을 전담하면 위기 이후 그 사람의 피로를 다른 사람이 알아차리지 못할 수 있습니다. 관찰 역할을 분리해야 합니다.`,
     `${leadSupport.name}이(가) 직접 지원하는 동안 ${otherSupport.name}은(는) 주변 정보 수집이나 후속 요청을 맡을 수 있습니다.`,
     `지금 당장의 수습이 잘되더라도 같은 배치를 반복하면 다음 사고에 대응할 여유가 남지 않을 수 있습니다.`
   ])} **악화 지점** 매번 익숙한 사람이 자발적으로 맡는다는 이유로 교대 시점을 정하지 않을 때입니다.`
  },
  {
   weight:30+Math.abs(x[5]-y[5])*7,
   title:"한 사람의 복귀 선언이 만드는 압박",
   text:`**발동 계기** ${earlier.name}이(가) 회복했다고 느껴 다음 행동을 제안하지만 ${longer.name}은(는) 아직 감각을 정리하지 못한 상황입니다. ${any("rest-gap",[
     `먼저 안정된 사람이 일정까지 결정해 버리면 다른 사람은 자신의 피로를 설명하는 일을 새 부담으로 느낄 수 있습니다.`,
     `같은 장소에서 쉬더라도 누구에게는 대화가, 다른 사람에게는 고요함이 필요할 수 있습니다. 휴식 방식을 하나로 정하지 않는 편이 좋습니다.`,
     `겉으로 침착해 보인다고 다음 게이트에 바로 들어갈 수 있는 것은 아닙니다. 당사자가 상태를 말할 수 있는 시간을 남겨야 합니다.`,
     `잠시 쉬었다는 사실보다 실제로 어떤 자극이 남았는지 확인하지 않으면 같은 피로를 반복할 수 있습니다.`
   ])} **악화 지점** 쉬는 시간을 타인의 기준으로 충분하다고 판정할 때입니다.`
  }
 ];
 if(guides.length){
  const leader=guides.slice().sort((u,v)=>v.axes[3]-u.axes[3])[0];
  debuffs.push({
   weight:50+Math.max(x[3],y[3])*3,title:"가이딩 잔량을 생각하지 않은 연속 요청",
   text:`**발동 계기** ${leader.name}에게 이전 지원이 성공했다는 이유로 다음 가이딩 요청도 연이어 집중되는 상황입니다. ${any("guide-limit",[
     `가이딩 이후 ${leader.name}의 잔량을 확인하지 않은 채 같은 강도로 추가 요청하면 공명 고갈 위험을 늦게 알아차릴 수 있습니다.`,
     `가이딩이 필요한 순간과 환경을 정리하는 정도로 버틸 수 있는 순간을 구분하면 자원 소모를 한 사람에게 몰지 않을 수 있습니다.`,
     `지원 대상을 정할 때는 센티넬의 현재 부하도뿐 아니라 가이드가 다음 지원까지 감당할 수 있는 여유도 확인해야 합니다.`,
     `가이드에게 거절할 여지가 없으면 남은 가이딩 잔량을 스스로 지키기 어려워집니다. 다른 대응 방식을 준비해 두는 편이 좋습니다.`
   ])} **악화 지점** ${leader.name}이(가) 지원을 계속할 수 있는지 확인하는 절차 없이 임무를 이어갈 때입니다.`
  });
 }
 debuffs.sort((v,w)=>w.weight-v.weight);
 return {synergies:synergiesOrdered.slice(0,4),debuffs:debuffs.slice(0,4)};
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
