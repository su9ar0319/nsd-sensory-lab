'use strict';
// 1인 심화: 점수 축 교차, 설문 선택 연계, 역할별 위기, 협력과 서사 전개.
function soloSelect(p,items,label){return narrativePick(items,profileKey(p,"solo-"+label));}

function soloCrosses(p){
 const a=p.axes,pairs=[[0,5],[1,2],[2,3],[3,4],[0,1],[2,5]];
 return pairs.map(([i,j],idx)=>{
  const d=Math.abs(a[i]-a[j]),hi=Math.max(a[i],a[j]),lo=Math.min(a[i],a[j]);
  const band=hi>=6.8&&lo>=6.8?"high":hi<4.5?"low":d>=2?"split":"mid";
  const text=soloSelect(p,SOLO_DEPTH_BANK.CROSS[`${i}-${j}`][band],`cross-${i}-${j}-${band}`);
  const suffix=d>=2?`두 감각 축의 점수 차이는 ${fixed(d)}점으로, 먼저 드러나는 반응과 뒤늦게 나타나는 반응의 간격이 생길 수 있습니다.`:
   hi>=6.8?`두 축 모두 높은 방향에 놓여 있어 한 사건에 두 감각 반응이 겹치는 순간을 살펴볼 수 있습니다.`:
   lo<4.5?`두 축 모두 조심스럽게 나타나므로 다른 사람이 행동을 기대하는 순간에도 한발 물러설 여지가 있습니다.`:
   `두 점수는 ${fixed(a[i])}점과 ${fixed(a[j])}점입니다. 상황이 바뀌면 두 감각 중 먼저 움직이는 쪽도 달라질 수 있습니다.`;
  return {title:`${DOMAINS[i].short} × ${DOMAINS[j].short}`,text:`${text} ${suffix}`,rank:d*.8+Math.max(0,hi-6)+Math.max(0,4.5-lo)+(idx===1?.5:0)};
 }).sort((x,y)=>y.rank-x.rank).slice(0,3);
}

function soloFacets(p){
 const a=p.axes,f=Array.isArray(p.facets)&&p.facets.length===12?p.facets:a.flatMap(x=>[x,x]);
 return DOMAINS.map((d,i)=>{
  const l=Number(f[i*2]),r=Number(f[i*2+1]),gap=Math.abs(l-r);
  const core=gap>=2.2?`같은 축을 묻는 두 문항군에서 반응의 강도가 크게 갈립니다. 한 가지 태도로 설명하기 어려운 맥락의 차이가 있을 수 있어, 평소와 위기 때의 모습이 달라지는 장면을 그려 볼 만합니다.`:
   gap>=1?`비슷한 감각을 다루는 질문에도 반응의 세기가 조금씩 달라집니다. 익숙한 상황에서는 자연스러운 선택이 낯선 상황에서는 망설임으로 바뀌는 식의 변화가 가능해집니다.`:
   `문항의 표현이 달라져도 유사한 방향으로 응답했습니다. 이 감각에서는 기본 리듬이 비교적 일정하므로, 다른 모습을 보여 주려면 환경이나 동료의 반응이 어떻게 달라졌는지에 주목하는 편이 좋습니다.`;
  return {title:`${d.short}의 내부 온도차`,gap,text:`같은 축의 두 문항군 평균은 ${fixed(l)}점과 ${fixed(r)}점으로 ${fixed(gap)}점 차이입니다. ${core} 전체 축 점수 ${fixed(a[i])}점만으로 보이지 않는 세부적인 반응의 차이를 읽을 수 있습니다.`};
 }).sort((x,y)=>y.gap-x.gap).slice(0,2);
}

function soloDecisions(p){
 const a=p.axes,c=p.choices,role=p.role,sc=getScenarios(role);
 const clue=i=>sc[i].opts[c[i]]?.[2]||"상황을 확인합니다.";
 const plans=[
  {key:"entry",title:"정보가 한꺼번에 밀려올 때",idx:0,follow:3,after:`첫 혼선에서 보인 행동은 이후 동행 규칙을 정하는 방식과 이어집니다. 다음 동행을 준비하는 상황에서는 '${clue(3)}'라는 선택을 했습니다.`},
  {key:"refusal",title:"동료가 도움을 거절했을 때",idx:1,follow:3,after:`이 장면은 경계 조율 ${fixed(a[4])}점과 맞물립니다. 상대를 보호하는 행동과 상대에게 결정권을 남기는 행동을 어떻게 이어 갈지 보여 줍니다.`},
  {key:role==="센티넬"?"resourceS":"resourceG",title:"자신의 자원에 경고가 켜졌을 때",idx:4,follow:5,after:`이어지는 직군 전용 상황에서는 '${clue(5)}'라는 방향을 선택했습니다. 두 장면 사이에서 지원을 요청하거나 제공하는 기준이 어떻게 달라지는지를 살펴볼 수 있습니다.`},
  {key:"aftermath",title:"게이트가 끝나도 감각이 남았을 때",idx:2,follow:6,after:`직군별 사후 장면에서는 '${clue(6)}'라는 반응도 선택했습니다. 타인에게 건네는 회복 방식과 자신의 피로를 처리하는 방식이 같을 필요는 없습니다.`}
 ];
 return plans.map(o=>({title:o.title,text:`${soloSelect(p,SOLO_DEPTH_BANK.DECISIONS[o.key][c[o.idx]],`decision-${o.key}`)} ${o.after}`}));
}

function soloRole(p){
 const a=p.axes,c=p.choices,role=p.role,sc=getScenarios(role),bank=SOLO_DEPTH_BANK.ROLE[role],clue=i=>sc[i].opts[c[i]]?.[2]||"상태를 확인합니다.";
 const phases=role==="센티넬"?[
  ["부하도가 오르기 시작할 때","onset",4,2],
  ["지원이나 가이딩을 제안받았을 때","pressure",5,3],
  ["안정된 뒤 다음 행동을 결정할 때","after",7,5]
 ]:[
  ["가이딩 잔량이 줄기 시작할 때","onset",4,2],
  ["가이딩이 필요한 사람과 마주할 때","pressure",5,3],
  ["지원을 끝내고 자신의 상태를 확인할 때","after",6,5]
 ];
 return phases.map(([title,key,scene,axis])=>{
  const next=axis===5?a[5]>=6.8?`잔향 회복 ${fixed(a[5])}점의 방향을 보면 충분한 회복 시간이 필요한 순간을 남길 수 있습니다.`:`잔향 회복 ${fixed(a[5])}점으로 빠른 전환이 나타나더라도 실제 피로를 확인할 틈은 필요할 수 있습니다.`:
   axis===2?`전조 감지 ${fixed(a[2])}점에서 나타나는 반응과 연결하면 경고를 알리는 시점이 중요해집니다.`:
   `완충 개입 ${fixed(a[3])}점에서 나타나는 행동과 연결하면 지원의 크기뿐 아니라 범위를 정하는 기준도 살펴볼 수 있습니다.`;
  return {title,text:`${soloSelect(p,bank[key],`role-${key}`)} 설문에서 선택한 대응은 '${clue(scene)}'라는 방향입니다. ${next}`};
 });
}

function soloMisreads(p){
 const a=p.axes,opts=[
  {key:a[1]<4.5?"quiet":"loud",title:"주변이 겉모습만 보고 판단할 때",score:Math.abs(a[1]-5.5)+1,axis:1},
  {key:a[3]>=6.8?"help":"wait",title:"도움을 주는 태도가 오해로 바뀔 때",score:Math.abs(a[3]-5.5)+1,axis:3},
  {key:a[5]>=6.8?"after":"fast",title:"임무가 끝난 뒤의 행동을 오해할 때",score:Math.abs(a[5]-5.5)+1,axis:5}
 ];
 return opts.sort((x,y)=>y.score-x.score).slice(0,2).map(o=>{
  const detail=o.axis===1?`이 캐릭터의 전조 감지 ${fixed(a[2])}점과 자극 발산 ${fixed(a[1])}점은 같은 정보가 아닙니다. 무슨 자극을 받았고 무엇을 말로 옮겼는지를 따로 보면 오해를 줄일 수 있습니다.`:
   o.axis===3?`완충 개입 ${fixed(a[3])}점과 경계 조율 ${fixed(a[4])}점 사이의 간격을 보면, 왜 직접 행동하거나 기다리는지를 더 구체적으로 이해할 여지가 있습니다.`:
   `잔향 회복 ${fixed(a[5])}점은 회복의 리듬을 보여 주지만, 사건의 심각성을 얼마나 중요하게 생각하는지까지 결정하지는 않습니다.`;
  return {title:o.title,text:`${soloSelect(p,SOLO_DEPTH_BANK.MISREAD[o.key],`misread-${o.key}`)} ${detail}`};
 });
}

function soloCooperation(p){
 const a=p.axes,c=p.choices,sc=getScenarios(p.role),clue=i=>sc[i].opts[c[i]]?.[2]||"";
 const speak=a[1]<4.5?`자신의 반응을 겉으로 덜 드러내는 편이라면 말의 양을 늘릴 필요까지는 없습니다. 대신 현재 불편한 자극 한 가지와 필요한 도움 한 가지를 명확하게 말하는 것이 도움이 됩니다.`:
  `자신의 반응이 선명하게 전해지는 편이라면, 강한 경고와 실제 요청을 구별해 짧게 전달하는 방식이 유용합니다. 동료가 알아야 할 사실과 자신의 감정은 서로 다른 정보일 수 있습니다.`;
 const help=a[4]>=6.8?`도움을 받기 전에 허용 범위를 확인하는 일이 중요할 수 있습니다. 상대에게 두 가지 정도의 지원 선택지를 제시받으면 자기 결정권을 유지하면서도 협력할 여지가 생깁니다.`:
  `지원의 방식보다 속도가 먼저 나갈 수 있습니다. 동행하기 전 어느 선까지 직접 도와도 되는지 합의하면 긴급한 순간의 충돌을 줄이는 데 도움이 됩니다.`;
 const rest=a[5]>=6.8?`임무가 끝난 뒤에는 어떤 감각이 남아 있는지 확인한 다음 다음 행동을 정하는 편이 맞을 수 있습니다. 주변에서 재촉하지 않을 때 숨기고 있던 부담을 말할 여유가 생깁니다.`:
  `빠르게 일상으로 전환할 수 있지만 함께 움직인 사람은 같은 속도로 회복하지 않을 수 있습니다. 자신의 복귀 준비를 팀 전체의 복귀 준비와 동일하게 보지 않는 편이 좋습니다.`;
 return [
  {title:"동료에게 전하면 좋은 신호",text:`${speak} 실제 첫 혼선 장면에서는 '${clue(0)}'라는 방향을 선택했습니다. 이 반응을 보고 체계에 반영하면, 표현의 강도보다 정보의 명확성이 중요해집니다.`},
  {title:"지원의 범위를 함께 정하는 방법",text:`${help} 도움을 거절한 상대를 마주했을 때는 '${clue(1)}'라는 선택을 했다는 점도 함께 고려해야 합니다.`},
  {title:"다시 움직일 시점을 정하는 방법",text:`${rest} 직군별 사후 상황에서는 '${clue(p.role==="센티넬"?7:6)}'라는 반응이 나타납니다.`}
 ];
}

function soloStories(p){
 const a=p.axes,c=p.choices,choice=[
  ["notice",a[2]+(c[0]===2?1:0),"아무도 눈치채지 못한 변화"],
  ["boundary",Math.max(a[3],a[4])+Math.abs(a[3]-a[4])*.4,"거절당한 선의 앞에서"],
  ["resource",a[3]+(c[4]===3?1.2:0),"멈출 수 있는 용기"],
  ["aftermath",a[5]+(c[2]===1?1:0),"현장이 끝난 뒤의 이야기"]
 ].sort((x,y)=>y[1]-x[1]).slice(0,2);
 return choice.map(([key,score,title])=>{
  const detail=key==="notice"?`전조 감지 ${fixed(a[2])}점이라는 단서가 있어도 주변이 그 경고를 어떻게 받아들이는지는 아직 정해지지 않았습니다.`:
   key==="boundary"?`완충 개입 ${fixed(a[3])}점과 경계 조율 ${fixed(a[4])}점 사이에서 도움을 줄지 멈출지 선택하게 됩니다.`:
   key==="resource"?`직군의 자원 상태를 다른 사람에게 공개하는 순간이 갈등의 방향을 바꿀 수 있습니다.`:
   `잔향 회복 ${fixed(a[5])}점에 나타난 경향이 현장 밖에서 다른 사람과 얼마나 가까워질지에도 영향을 줄 수 있습니다.`;
  return {title,text:`${soloSelect(p,SOLO_DEPTH_BANK.STORY[key],`story-${key}`)} ${detail}`};
 });
}

function individualDepthReport(p){return {crosses:soloCrosses(p),facets:soloFacets(p),decisions:soloDecisions(p),roleArc:soloRole(p),misreads:soloMisreads(p),cooperation:soloCooperation(p),stories:soloStories(p)};}
