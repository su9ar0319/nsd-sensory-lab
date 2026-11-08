'use strict';
/* V9 FIELD OPERATIONS: combat-zone, route, resource and withdrawal evidence.
   Legacy scoring, stored profiles, and seven-step numeric simulation are not changed.
   This file replaces only reader-facing pair/trio report text. */
function gateV9Part(name,particle){const m={"은":["은","는"],"이":["이","가"],"을":["을","를"],"과":["과","와"]}[particle];return gateEngineJosa(name,m[0],m[1])}
const GATE_V9_FIELD_ACTIONS={
 common:[
  ["보고가 엇갈리자 추가 단서 확보를 우선합니다","엇갈린 정보 중 즉시 결론을 내릴 기준부터 정합니다","진입 대원을 나눠 두 정보를 병렬로 확인합니다","가장 치명적인 가능성을 먼저 봉쇄합니다"],
  ["정체를 모르는 기척 주변으로 탐색 범위를 확장합니다","새 신호를 근거로 진입 경로를 변경합니다","기척에 대한 경고를 전원에게 즉시 공유합니다","진입을 멈추고 철수 조건을 확인합니다"],
  ["먼저 위협을 견제해 전진 통로를 확보합니다","앞서 진입해 대원들이 움직일 길을 엽니다","앞뒤 전열의 담당을 나누어 충돌을 줄입니다","각 대원의 부하와 여력을 대조한 뒤 이동합니다"],
  ["지원 거절의 범위를 확인해 직접 개입을 조정합니다","직접 지원 대신 다른 위치에서 안전을 확보합니다","위험 상태를 설명하고 당사자의 판단을 기다립니다","남은 자원 안에서 가능한 지원책을 제시합니다"]
 ],
 "센티넬":[
  ["부하도 경보와 자극 원인을 나눠 보고합니다","자극을 피할 수 있는 위치로 전열을 바꿉니다","전투 행동을 최소한으로 좁히며 진입을 이어갑니다","가이딩 지원 가능성과 철수 거점을 확인합니다"],
  ["확인할 수 있는 신호를 다시 탐색합니다","현재 위치를 놓친 위험을 동료에게 알립니다","파악된 위협부터 우선 제압합니다","한 걸음 물러나 감각을 정리합니다"],
  ["계속 전진하겠다는 동료의 판단 근거를 확인합니다","동료의 후퇴 동선을 미리 마련합니다","잔여 자원과 현재 위협을 비교해 진행 여부를 따집니다","작전 대상을 바꿔 동료의 부담을 줄입니다"],
  ["현재 부하도와 감각 상태를 팀에 알립니다","자극을 낮출 수 있는 환경을 찾습니다","남은 여력으로 목표를 마칠 수 있는지 따집니다","폭주 전조를 기준으로 잠정 철수를 검토합니다"]
 ],
 "가이드":[
  ["두 대원의 요청과 부하도 전조를 비교합니다","가이딩이 더 급한 한 사람부터 지원합니다","다른 대원과 지원 역할을 분산합니다","가이딩 잔량의 상한과 철수 조건을 먼저 알립니다"],
  ["잔여 가이딩 잔량을 공개해 지원 범위를 다시 정합니다","가이딩 강도를 줄여 소모 속도를 조절합니다","환경 조정으로 대체할 수 있는 지원을 우선합니다","공명 고갈 이전에 철수 지점을 확보합니다"],
  ["가이딩 거절의 이유와 가능한 지원 범위를 확인합니다","가이딩 대신 진입 동선을 바꿔 위협을 줄입니다","관측된 부하도 전조를 전달하고 결정을 맡깁니다","대체 지원안과 철수 조건을 함께 제시합니다"],
  ["접근하는 위협에 대한 경고를 전달합니다","동료의 배치에 맞춰 자신의 역할을 바꿉니다","가이딩 외에 현장을 안정시킬 행동을 찾습니다","안전한 위치에서 지원 지속 여부를 다시 판단합니다"]
 ]
};
function gateV9Action(p,i){
 const ix=p.choices[i],group=i<4?GATE_V9_FIELD_ACTIONS.common[i]:GATE_V9_FIELD_ACTIONS[p.role][i-4];
 return group[ix];
}
function gateV9Compare(a,b,i){
 const A=gateV8Choice(a,i),B=gateV8Choice(b,i);
 return A.choice.axis===B.choice.axis?"같은 방향으로 움직일 수 있지만 누가 실행하고 누가 확인할지 정하지 않으면 행동이 겹칩니다.":"서로 다른 방향을 택하므로 한 사람의 행동이 끝나기를 기다릴지, 동시에 진행할지 먼저 합의해야 합니다.";
}
function gateV9Direction(from,to,original){
 const f=gateV9Part(from.name,"은"),t=gateV9Part(to.name,"은");
 const resource=from.role==="가이드"?
  "지원 중단 신호를 잔량 변화에 맞춰 먼저 알릴 필요가 있습니다.":
  "부하도 전조가 누적될 때 앞선 진입을 멈출 기준이 필요합니다.";
 const lowRetreat=from.axes[10]<6?
  "철수 판단이 상대적으로 늦어질 수 있으므로 후방 확보를 누가 제안할지 미리 정해 두는 편이 좋습니다.":
  "철수 조건에 일찍 주목하는 편이므로 전진 담당에게 중단 기준을 명확하게 알리는 것이 좋습니다.";
 original.sections=[
  {title:"진입로 정보가 엇갈리는 순간",text:f+" "+gateV9Action(from,0)+". 반면 "+t+" "+gateV9Action(to,1)+". 진입 직전에는 어떤 정보부터 사실로 인정할지 맞춰야 합니다. "+gateV9Compare(from,to,0)},
  {title:"전진 순서와 후방의 빈틈",text:f+" "+gateV9Action(from,2)+". "+t+" "+gateV9Action(to,2)+". 둘이 동시에 같은 통로로 향하면 후방을 맡을 사람이 사라질 수 있습니다. 전열과 후방의 담당을 나누고, 통로가 바뀔 때 재배치 신호를 정해야 합니다."},
  {title:"동료의 지원 거절과 위험 확대",text:"지원 범위가 충돌할 때 "+f+" "+gateV9Action(from,3)+". "+t+" "+gateV9Action(to,6)+". 위험을 알리는 일과 상대의 결정을 대신하는 일을 분리해야 합니다. 특히 가이딩의 동의 여부, 외부 위협을 맡을 사람, 철수 경로를 순서대로 결정하는 편이 좋습니다."},
  {title:"목표 유지와 철수 조건의 충돌",text:"예상보다 위협이 커지면 "+f+" "+gateV9Action(from,7)+". 다른 한쪽에서는 "+t+" "+gateV9Action(to,5)+". "+resource+" "+lowRetreat}
 ];
 return original;
}
function gateV9Synergy(a,b,card){
 const c=card.title;
 let info;
 if(c.includes("정찰과")){
  const first=a.axes[0]>=b.axes[0]?a:b,other=first===a?b:a;
  info={title:"엇갈린 진입 정보를 처리하는 분업",
  condition:"게이트 입구에서 두 종류의 위험 신호가 동시에 확인되어 진입 순서를 정해야 할 때입니다.",
  action:gateV9Part(first.name,"은")+" "+gateV9Action(first,1)+". "+gateV9Part(other.name,"은")+" "+gateV9Action(other,0)+". 한쪽이 변화의 위치를 좁히는 동안 다른 쪽은 바로 실행할 대응을 확정하면 첫 진입의 지연을 줄일 수 있습니다.",
  break:"서로 확인했다는 신호 없이 각자 다른 출입 경로로 들어가면 합류 지점을 잃을 수 있습니다."};
 }else if(c.includes("역할 교대")){
  const change=a.axes[8]>=b.axes[8]?a:b,stay=change===a?b:a;
  info={title:"진입 경로 변경과 전열 교대",
  condition:"확보한 통로가 예상과 다르게 막히거나 목표로 향하는 길이 바뀌는 순간입니다.",
  action:gateV9Part(change.name,"이")+" 대체 동선을 제시하고 "+gateV9Part(stay.name,"이")+" 후방·전방 배치를 다시 맞춥니다. 첫 경로를 버리더라도 목표와 귀환 방향은 동시에 유지해야 합니다.",
  break:"새 경로를 아는 사람이 한 명뿐이면 나머지 대원은 이전 목표를 향해 움직이게 됩니다."};
 }else if(c.includes("동료 보호")){
  const help=a.axes[6]>=b.axes[6]?a:b,other=help===a?b:a;
  info={title:"위험 대원 보호와 임무 지속의 분리",
  condition:"한 대원에게 위협이 집중되지만 아직 모든 목표를 포기할 필요는 없는 상황입니다.",
  action:gateV9Part(help.name,"은")+" "+gateV9Action(help,3)+". "+gateV9Part(other.name,"은")+" "+gateV9Action(other,2)+". 안전 확보를 맡은 사람과 목표를 이어갈 사람을 분리하면 구조 때문에 전열 전체가 무너지는 일을 피할 수 있습니다.",
  break:"동료를 지킨다는 이유로 의사를 확인하지 않고 전열에서 이탈시키거나, 목표 담당까지 동시에 자리를 떠나면 작전이 흔들립니다."};
 }else if(c.includes("여력 보존")){
  const manager=a.axes[7]>=b.axes[7]?a:b,other=manager===a?b:a;
  info={title:"연속 전투에 대비한 자원 배분",
  condition:"첫 위험을 처리했지만 다음 구역의 위협과 귀환에 필요한 여력이 아직 남아 있는 상황입니다.",
  action:gateV9Part(manager.name,"은")+" "+gateV9Action(manager,7)+". "+gateV9Part(other.name,"은")+" "+gateV9Action(other,5)+". 다음 교전까지 필요한 자원과 즉시 사용할 자원을 별도 항목으로 관리하면 지원 요청이 몰리는 순간에도 선택지가 남습니다.",
  break:"한 번의 수습에 성공했다는 이유로 같은 강도의 지원을 반복하면 다음 위험 구간에서 여력이 부족해집니다."};
 }else{
  const guide=[a,b].find(p=>p.role==="가이드"),sentinel=[a,b].find(p=>p.role==="센티넬");
  info={title:"부하도 상승과 가이딩 잔량의 교차 압박",
  condition:"센티넬의 부하도 전조가 커지는 동시에 가이드에게 다음 지원 요청까지 들어온 상황입니다.",
  action:guide&&sentinel?gateV9Part(sentinel.name,"은")+" "+gateV9Action(sentinel,4)+". "+gateV9Part(guide.name,"은")+" "+gateV9Action(guide,5)+". 직접 가이딩을 수행할지, 위험 구역에서 일단 벗어날지 순서대로 결정합니다.":"각자의 위험 수준과 남은 자원에 맞춰 역할을 다시 배정합니다.",
  break:"지원 효과만 확인하고 다음 가이딩을 계속 요청하면 가이딩 잔량이 먼저 바닥날 수 있습니다."};
 }
 return {...card,...info};
}
function gateV9Debuff(a,b,card){
 let v;
 if(card.title.includes("행동이 확인")){
  v={title:"미확인 위험 구역으로의 선행 진입",
  trigger:"경로 안전이 확인되기 전에 한 대원이 먼저 통과하려는 순간입니다.",
  chain:gateV9Part(a.name,"은")+" "+gateV9Action(a,1)+". "+gateV9Part(b.name,"은")+" "+gateV9Action(b,1)+". 신호의 해석이 달라도 진입 신호는 하나여야 하며, 먼저 움직인 대원이 다른 쪽의 후퇴 경로를 막을 수 있습니다.",
  mitigation:"위험 신호를 확인할 대원과 최초 진입할 대원을 나누고, 두 사람 모두 확인한 뒤 출발하도록 합니다."};
 }else if(card.title.includes("위험 허용")){
  const breaker=a.axes[5]>=b.axes[5]?a:b,care=breaker===a?b:a;
  v={title:"목표 앞에서 갈리는 돌파·철수 판단",
  trigger:"목표가 가까워졌지만 위협이 누적되어 추가 진입과 귀환 중 하나를 선택해야 할 때입니다.",
  chain:gateV9Part(breaker.name,"은")+" 목표 달성의 기회를 더 크게 볼 수 있고, "+gateV9Part(care.name,"은")+" 남은 위험을 정리하려 할 수 있습니다. 한쪽이 진입하는 동안 다른 쪽이 철수하면 지원과 귀환 경로가 모두 불안정해집니다.",
  mitigation:"돌파 여부를 결정하기 전에 '진입을 중단할 징후'와 '반드시 확보할 귀환 경로'를 따로 확인합니다."};
 }else if(card.title.includes("집중 소모")){
  v={title:"지원 요청 집중과 다음 구역의 자원 공백",
  trigger:"연속된 위험 상황에서 한 사람에게 대응 요청이 계속 몰릴 때입니다.",
  chain:"센티넬의 부하도와 가이드의 가이딩 잔량이 다른 속도로 변할 수 있습니다. 현재의 문제를 수습하는 데 자원을 집중하면 다음 구역에 들어갈 때 대응 수단이 줄어듭니다.",
  mitigation:"동행자별로 이번 구역에 사용할 자원과 귀환을 위해 남길 자원을 구분해 보고합니다."};
 }else if(card.title.includes("철수 시점")){
  v={title:"귀환 경로가 끊어지는 철수 지연",
  trigger:"작전 목표를 향한 마지막 이동 중 후방의 상황이 달라져 철수가 어려워질 수 있을 때입니다.",
  chain:"진입을 이어가는 대원과 돌아가려는 대원의 판단이 어긋나면 합류 지점이 멀어집니다. 이탈할 통로가 늦게 정해질수록 남은 자원을 어디에 써야 할지도 불분명해집니다.",
  mitigation:"작전 목표의 진행도와 무관하게 철수 경로를 갱신하고, 중단 신호가 나오면 누가 후방을 맡을지 정합니다."};
 }else{
  const guide=[a,b].find(p=>p.role==="가이드");
  v={title:"연속 가이딩 요청과 공명 고갈",
  trigger:"짧은 간격으로 가이딩 요청이 반복되는데 후속 위험도 남아 있는 경우입니다.",
  chain:guide?gateV9Part(guide.name,"은")+" 지원을 이어갈수록 가이딩 잔량이 줄어듭니다. 당장의 부하도 완화가 다음 요청까지 감당할 여력을 보장하지는 않습니다.":"지원 부담이 특정 대원에게 쏠리면 안전한 대응이 어려워집니다.",
  mitigation:"추가 가이딩 요청을 받기 전에 잔량과 지원 강도를 공유하고, 공명 고갈 전에 대체 배치나 철수를 선택합니다."};
 }
 return {...card,...v};
}
function gateV9PairScenes(a,b){
 const aChoice=(x,i)=>gateV9Part(x.name,"은")+" "+gateV9Action(x,i)+".";
 return [
  {title:"CASE 01 · 진입 지점의 예상 밖 기척",text:"첫 진입로에서 예고되지 않은 신호가 나타나면 "+aChoice(a,1)+" "+aChoice(b,1)+" "+gateV9Compare(a,b,1)+" 이동을 확정하기 전에 통로를 다시 열 사람과 경고를 공유할 사람을 정해야 합니다."},
  {title:"CASE 02 · 같은 통로로 전진하는 두 대원",text:"둘의 전진 시점이 겹치면 "+aChoice(a,2)+" "+aChoice(b,2)+" 공격을 맡는 사람과 후방을 지키는 사람이 동시에 전면에 나서지 않도록 진형을 다시 정리해야 합니다."},
  {title:"CASE 03 · 위협 확대와 귀환 선택",text:"목표가 남아 있는 동안 예상보다 많은 자원을 사용하면 "+aChoice(a,7)+" "+aChoice(b,7)+" 여기서는 누가 더 오래 버틸지가 아니라 어떤 조건에서 함께 돌아올 수 있는지가 핵심입니다."}
 ];
}
const gateV9OriginalPair=gateV8PairOriginal;
gatePair=function(a,b){
 const r=gateV9OriginalPair(a,b);
 r.directions=r.directions.map((d,i)=>gateV9Direction(i===0?a:b,i===0?b:a,d));
 r.synergies=r.synergies.map(card=>gateV9Synergy(a,b,card));
 r.debuffs=r.debuffs.map(card=>gateV9Debuff(a,b,card));
 r.resources=(a.role==="가이드"||b.role==="가이드"?
   "지원 요청이 연속되면 가이딩 잔량과 센티넬 부하도 전조를 따로 확인해야 합니다. 직접 가이딩, 진입로 변경, 일시 철수 중 어느 대응에 자원을 배분할지 결정하고, 다음 구역과 귀환에 필요한 여력을 남깁니다.":
   "두 센티넬의 부하도 전조와 위험 구역 통과 시간을 따로 확인해야 합니다. 한 사람이 전진을 맡으면 다른 사람이 귀환 통로를 관리하는 식으로 역할을 분리하고, 폭주 전조에 대비할 철수 신호를 맞춥니다.");
 r.scenes=gateV9PairScenes(a,b);
 r.v9Focus="gate-field-operations";
 return r;
};

function gateV9StageEvent(ps,stage,record,roles){
 const scout=ps[roles[0].index],leader=ps[roles[1].index],reserve=ps[roles[2].index];
 const actors=ps.map(p=>gateV9Part(p.name,"은")+" "+gateV9Action(p,stage)+".");
 const set=new Set(ps.map(p=>gateV8Choice(p,stage).choice.axis)).size;
 const variant=set===1?
  "대응 방향은 비교적 일치하지만 담당 구역이 겹치지 않도록 역할을 분명히 해야 합니다.":
  set===3?
  "세 사람의 대응 방향이 모두 다릅니다. 이를 동시 수행할지, 단계적으로 실행할지 현장 지휘에서 결정해야 합니다.":
  "두 사람이 비슷한 대응을 택하고 한 사람은 다른 방법을 고릅니다. 그 다른 선택이 후방의 위험을 보완할 수 있는지 살펴봐야 합니다.";
 const event=[
  gateV9Part(leader.name,"이")+" 기존 브리핑의 불일치 사항을 정리하는 동안 게이트 입구의 위험 정보를 서로 확인합니다. 어느 신호까지 확인해야 진입할지, 첫 출발 순서를 언제 확정할지가 관건입니다.",
  "게이트 진입로 안쪽에서 예상하지 못한 기척이 나타납니다. "+gateV9Part(scout.name,"이")+" 위험이 발생한 방향을 확인하는 동안 다른 대원들은 통로를 비워 귀환할 여지를 남겨야 합니다.",
  "첫 번째 이상 징후는 정면뿐 아니라 후방에서도 이어질 수 있습니다. 한 사람이 신호를 확인하는 동안 다른 두 사람이 새로운 위험의 접근을 막을지, 우회 경로를 열지 결정해야 합니다.",
  "대원들의 전진 타이밍이 겹치거나 통로를 변경해야 하는 상황입니다. "+gateV9Part(leader.name,"이")+" 먼저 갈 사람과 후방을 지킬 사람을 다시 배정하지 않으면 서로 다른 경로로 갈라질 수 있습니다.",
  "위협이 이어지면서 부하도와 가이딩 잔량의 여유가 줄어드는 구간입니다. "+gateV9Part(reserve.name,"이")+" 지금 소모할 수 있는 자원과 목표 달성 후 귀환에 남겨야 할 자원을 구분해야 합니다.",
  "목표를 확보할 기회가 남아 있지만 철수 동선도 유지해야 합니다. "+gateV9Part(leader.name,"이")+" 진행과 중단의 기준을 선언하고, 남은 대원들은 각자의 위치에서 귀환 경로가 열려 있는지 확인해야 합니다.",
  "게이트를 벗어나는 단계입니다. 마지막 구간에 위험이 다시 나타날 수 있으므로 선두가 빠져나간 뒤 후방 인원이 고립되지 않도록 합류 순서를 정하고, 귀환 후 상태를 점검합니다."
 ][stage];
 const assessment=record.critical?
   "자원 경고가 나타났으므로 다음 행동에 앞서 교대·철수·지원 중 우선할 조치를 결정해야 합니다.":
   record.success?
   ["초기 진입의 우선순위를 유지할 수 있습니다.","입구의 위협을 넘겼으므로 뒤따르는 대원의 위치를 확인합니다.","후방의 위험이 커지지 않도록 다음 구역의 진입 순서를 확인합니다.","새 배치가 작동했으므로 통신 확인 뒤 전진합니다.","이번 구역을 통과했더라도 귀환에 쓸 자원을 남겨야 합니다.","목표를 향한 진행은 가능하지만 철수 경로는 계속 확보해야 합니다.","귀환 동선을 유지하면서 마지막 합류와 사후 점검을 진행합니다."][stage]:
   ["출발 전에 위험 구역과 안전 구역을 다시 나눠야 합니다.","첫 진입의 지연이 후속 대원까지 이어지지 않게 해야 합니다.","위협의 방향을 놓쳤다면 우회 통로부터 확보해야 합니다.","동시에 움직인 대원들의 위치를 다시 맞춰야 합니다.","자원 소모가 커지면 지금 단계에서 지원을 재배치해야 합니다.","계속 전진하면 귀환이 어려워질 수 있어 중단을 검토해야 합니다.","귀환 순서가 흐트러졌다면 다음 이동보다 합류 확인을 우선해야 합니다."][stage];
 return event+" 현장 대응은 "+actors.join(" ")+" "+variant+" "+assessment;
}
function gateV9TrioPair(ps,item,index){
 const map=[[0,1,2],[0,2,1],[1,2,0]][index],a=ps[map[0]],b=ps[map[1]],third=ps[map[2]];
 const steps=[1,2,5],scene=steps[index];
 const p=gateV9Part(third.name,"은");
 return p+" "+gateV9Action(third,scene)+". "+gateV9Part(a.name,"과")+" "+b.name+"의 전술이 "+(index===0?"진입로 안전을 확인하는 단계":index===1?"동시 전진으로 담당 구역이 겹치는 단계":"목표를 이어갈지 철수할지 결정하는 단계")+"에서 어긋날 때, 제3자는 별도의 위험을 확인하거나 두 사람의 동선을 연결하는 역할을 맡습니다.";
}
function gateV9TrioSynergy(ps,roles,card,index){
 const leader=ps[roles[1].index],scout=ps[roles[0].index],reserve=ps[roles[2].index];
 const rows=[
  ["전술 진입 허가와 경로 확인","입구에서 서로 다른 위험 정보를 받았을 때입니다.",gateV9Part(scout.name,"이")+" 진입로를 확인하고 "+gateV9Part(leader.name,"이")+" 출발 순서를 확정하며 "+gateV9Part(reserve.name,"이")+" 귀환 경로를 확보합니다.","누가 진입을 허가했는지 확인되지 않으면 같은 신호를 두고도 다른 곳으로 이동할 수 있습니다."],
  ["분기된 통로를 잇는 제3자","두 대원이 서로 다른 경로로 움직여 한쪽 통로가 비게 되는 순간입니다.","세 번째 대원은 두 사람의 합류 지점과 후방 이동 가능 여부를 확인합니다. 앞쪽 대원이 목표를 놓치지 않아도 뒤에 돌아올 길은 남아 있어야 합니다.","통로 한쪽의 위험이 확인되지 않은 채 모두 목표 방향으로만 전진하면 후방이 무방비해집니다."],
  ["전방과 후방의 위협 분산","새로운 위험이 전방에 나타났지만 후방에서도 기척이 이어질 때입니다.","전방을 견제하는 대원, 추가 위협을 확인하는 대원, 귀환 통로를 지키는 대원을 분리합니다. 각자 다른 위험에 대응해도 한 번의 교신으로 위치를 알 수 있어야 합니다.","세 사람이 같은 기척만 추적하면 다른 방향의 위협이 접근할 여지를 남깁니다."],
  ["경로 폐쇄 시 전술 재편","기존 이동 경로가 위험해져 다른 통로로 돌아가야 할 때입니다.",gateV9Part(leader.name,"이")+" 변경된 목표와 이동 순서를 전달하고 나머지 대원들은 자신이 맡은 후방·진입 구역을 다시 확인합니다.","앞서간 대원에게만 경로 변경 사실이 알려지면 나머지 둘은 오래된 동선으로 움직이게 됩니다."],
  ["마지막 구간의 귀환 유지","목표 달성 직후에도 남은 자원과 귀환 거리 때문에 위험이 지속될 때입니다.",gateV9Part(reserve.name,"이")+" 세 대원의 잔여 여력을 확인하고 마지막 이동 순서를 조정합니다. 앞서 나간 대원보다 돌아올 수 있는 대원이 더 적어지지 않도록 관리해야 합니다.","작전 목표 확보만 확인한 채 후방 대원의 상태를 놓치면 마지막 구간에 지원할 여력이 사라질 수 있습니다."]
 ];
 const [title,condition,effect,breakText]=rows[index];
 return {...card,title,condition,effect,break:breakText};
}
function gateV9TrioRisk(ps,roles,card,index,result){
 const leader=ps[roles[1].index],reserve=ps[roles[2].index],low=ps.slice().sort((a,b)=>a.axes[10]-b.axes[10])[0];
 const rows=[
  ["교차 지시로 인한 진입 지연","서로 다른 두 경로가 동시에 안전하다고 보고되어 진입 지시가 충돌할 때입니다.","출발 신호가 두 갈래로 나뉘면 대원들은 서로 다른 방향의 통로를 확보하게 되고 합류 시점도 달라집니다.",gateV9Part(leader.name,"이")+" 진입 가능한 경로 하나와 예비 경로 하나를 지정해 혼선을 줄입니다."],
  ["다음 구역에서 발생하는 자원 공백","첫 번째 위험 구간에서 예상보다 많은 대응을 소모했는데 다음 위협이 곧바로 나타날 때입니다.","당장의 안정화에 성공했더라도 후속 위험과 귀환을 위한 가이딩 잔량이나 부하도 여유가 충분하지 않을 수 있습니다.",gateV9Part(reserve.name,"은")+" 다음 단계까지 남길 자원을 확인하고 지원 강도·휴식·우회 중 하나를 선택합니다."],
  ["철수 통로 확보 지연","목표를 향한 전진이 이어지는 동안 후방 통로의 상황이 달라졌을 때입니다.",gateV9Part(low.name,"은")+" 진행을 우선할 여지가 있어도 다른 대원과 중단 조건을 맞추지 않으면 돌아갈 경로를 늦게 정하게 됩니다.","목표 달성 여부와 별개로 모든 대원의 합류 위치, 철수 순서, 중단 신호를 먼저 확정합니다."],
  ["전열 충돌과 후방 공백","두 대원이 동시에 앞으로 이동하고 남은 한 사람도 지원을 위해 위치를 바꾸려 할 때입니다.","목표 방향에는 인원이 집중되지만 후방에서 접근하는 위험을 감시할 사람이 없어집니다.","전진·교대·후방 보호를 서로 다른 담당에게 배정하고 자리를 바꿀 때 짧게 교신합니다."],
  ["귀환 직전의 연속 위험","작전 종료 단계에 예상 밖의 위험이 다시 나타나고 이미 자원이 줄어든 상황입니다.","임무 종료를 앞두고 남은 여력을 확인하지 않으면 마지막 구간에서 대응을 바꿀 수 있는 선택지가 줄어듭니다.","귀환 순서를 한 번 더 점검하고 부하도가 높은 대원이나 잔량이 부족한 가이드의 후속 역할을 조정합니다."]
 ];
 const [title,trigger,chain,counter]=rows[index];
 return {...card,title,trigger,chain,counter};
}
const gateV9OriginalTrio=gateV8TrioOriginal;
gateTrio=function(ps){
 const r=gateV9OriginalTrio(ps);
 r.roles.forEach((x,i)=>{x.label=["진입로 확인","현장 지휘·경로","후방·잔여 자원"][i]});
 r.stages.forEach((stage,i)=>{
  stage.summary=gateV9StageEvent(ps,i,stage,r.roles);
  const critical=stage.resources.filter(x=>x.role==="센티넬"?x.after>=86:x.after<=14);
  stage.consequence=critical.length?
   critical.map(x=>x.name+"의 "+(x.role==="센티넬"?"부하도 상승":"가이딩 잔량 부족")+"이 다음 단계의 위험에 영향을 줍니다.").join(" "):
   stage.success?"이번 단계의 진행이 이어지면서 다음 구역으로 이동할 여지가 확보됩니다.":"해당 구역에서 지연이 발생해 다음 단계의 접근 경로나 자원 배분을 다시 검토해야 합니다.";
 });
 r.pairs.forEach((item,i)=>{item.intervention=gateV9TrioPair(ps,item,i)});
 r.synergies=r.synergies.map((x,i)=>gateV9TrioSynergy(ps,r.roles,x,i));
 r.debuffs=r.debuffs.map((x,i)=>gateV9TrioRisk(ps,r.roles,x,i,r));
 r.notice=r.outcome==="긴급 철수 우선"?
  "계속해서 목표를 추적하기보다 귀환 경로를 우선 확보하고 대원별 자원 부담을 줄여야 합니다.":
  r.outcome==="작전 목표 확보 가능"?
  "작전 목표에 접근할 여지가 있습니다. 후방 합류와 귀환에 필요한 여력을 남기는 배치가 유리합니다.":
  r.outcome==="조건부 임무 종료"?
  "목표의 일부는 확보할 수 있지만 추가 전진에는 위험이 남습니다. 진입을 멈출 조건과 돌아갈 경로를 먼저 확인해야 합니다.":
  "현 단계에서 진입을 이어가기보다 이동 경로와 역할을 재정리하고 철수를 검토하는 편이 좋습니다.";
 r.v9Focus="gate-field-operations";
 return r;
};
