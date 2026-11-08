'use strict';
/* V8: Differentiation of pair/trio narratives based on actual choices + axes.
   Original numeric results, saved data and simulation stage mechanics remain unchanged. */
function gateV8Brief(p){
 const e=gateV8Evidence(p),core=e.priorities[0];
 return {core,top:e.top[0],second:e.top[1],choices:e.choices,swing:e.swing[0],role:p.role};
}
function gateV8JoinNames(a,b){
 return gateEngineJosa(a.name,"은","는")+" "+b.name+"에게";
}
function gateV8PairChoice(a,b,idx){
 const ca=gateV8Choice(a,idx),cb=gateV8Choice(b,idx);
 const common=ca.choice.axis===cb.choice.axis;
 const one=ca.choice.axis,two=cb.choice.axis;
 const they=gateEngineJosa(a.name,"은","는")+" '"+ca.label+"', "+gateEngineJosa(b.name,"은","는")+" '"+cb.label+"'를 선택했습니다.";
 const detail=common?"서로 다른 인물의 선택이 "+GATE_AXES[one].name+"이라는 같은 전술 방향에 닿습니다. 방향이 같더라도 실제 행동의 범위나 부담까지 일치한다고 보기는 어렵습니다.":"한 사람은 "+GATE_AXES[one].name+", 다른 사람은 "+GATE_AXES[two].name+"에 무게를 둡니다. 이때 먼저 행동할 사람을 정하지 않으면 같은 장면에서 서로 다른 순서가 시작됩니다.";
 return they+" "+detail+" "+(idx===3?"지원 거절 장면에서는 동의를 확인하지 않은 가이딩이나 강제 개입을 전제하지 않습니다.":idx===0?"작전 시작 전에 두 판단을 어떤 순서로 확인할지 합의하는 것이 중요합니다.":"이 차이가 갈등으로 이어지는지는 실제 부하도·가이딩 잔량과 현장 위험을 확인한 뒤 판단해야 합니다.");
}
function gateV8TeamStrength(p){
 const e=gateV8Brief(p),a=GATE_AXES[e.top.i].name;
 return gateEngineJosa(p.name,"은","는")+" '"+e.core.id+"'을 중요한 동기로 사용하며, "+a+"을 중심으로 움직일 가능성이 있습니다";
}
function gateV8PairExtras(a,b){
 const A=gateV8Brief(a),B=gateV8Brief(b),changed=A.core.id!==B.core.id;
 const sameChoice=[0,1,2,3].filter(i=>A.choices[i].choice.axis===B.choices[i].choice.axis);
 const opposite=[0,1,2,3].filter(i=>A.choices[i].choice.axis!==B.choices[i].choice.axis);
 const differences=a.axes.map((v,i)=>({axis:i,delta:v-b.axes[i],abs:Math.abs(v-b.axes[i])})).sort((x,y)=>y.abs-x.abs||x.axis-y.axis);
 const largest=differences[0],aLead=largest.delta>=0?a:b,bOther=largest.delta>=0?b:a;
 const shared=sameChoice.length>=3?"공통 작전 상황에서 전술 방향이 비슷한 장면이 많습니다. 이 경우 속도와 역할을 정확히 나누지 않으면 같은 행동이 중복될 수도 있습니다.":opposite.length>=3?"공통 작전 상황에서 두 사람은 자주 다른 전술 방향을 선택합니다. 서로의 판단을 오해하지 않으려면 대응 순서와 중단 신호를 먼저 맞춰야 합니다.":"네 가지 공통 상황에서 선택의 일치와 차이가 함께 나타납니다. 특정 상황만으로 두 사람을 완전한 상극이나 천생연분으로 단정할 수는 없습니다.";
 const causes=changed?gateEngineJosa(a.name,"은","는")+" '"+A.core.id+"'을, "+gateEngineJosa(b.name,"은","는")+" '"+B.core.id+"'을 중요하게 여깁니다. 같은 행동을 하더라도 우선순위가 다른 이유가 여기에 있을 수 있습니다.":"두 사람 모두 '"+A.core.id+"'을 두드러진 판단 동기로 사용합니다. 같은 기준을 가진다는 장점이 있지만, 동시에 같은 위험을 놓칠 가능성도 따로 점검해야 합니다.";
 const bound="가장 뚜렷한 지표 차이는 "+GATE_AXES[largest.axis].name+"에서 나타납니다. "+gateEngineJosa(aLead.name,"이","가")+" 이 기준을 더 적극적으로 적용하는 편이고, "+gateEngineJosa(bOther.name,"은","는")+" 다른 조건을 살필 여지가 큽니다. 차이가 곧 우열을 뜻하지는 않습니다.";
 return {A,B,shared,causes,bound,largest,changed};
}
const gateV8PairOriginal=gatePair;
gatePair=function(a,b){
 const result=gateV8PairOriginal(a,b),e=gateV8PairExtras(a,b);
 const add=(s,text)=>s+" "+text;
 const sceneOrder=[0,3,2];
 result.scenes=result.scenes.map((row,i)=>({
  ...row,
  title:["서로 다른 정보에서 시작할 때","도움을 거절한 동료 앞에서","역할이 동시에 겹칠 때"][i],
  text:gateV8PairChoice(a,b,sceneOrder[i])
 }));
 if(result.directions&&result.directions.length===2){
  result.directions.forEach((d,i)=>{
   const source=i===0?a:b,target=i===0?b:a,src=gateV8Brief(source),dst=gateV8Brief(target);
   d.sections[0].text=add(d.sections[0].text,"진입 지점에서 "+gateEngineJosa(source.name,"은","는")+" '"+src.choices[1].label+"'를 선택했습니다. 판단 이유는 "+src.choices[1].hint+". 한편 "+gateEngineJosa(target.name,"은","는")+" '"+dst.choices[1].label+"'를 선택했으며, "+dst.choices[1].hint+". 두 선택이 시작되는 순서를 맞추는 것이 중요합니다.");
   d.sections[1].text=add(d.sections[1].text,""+gateEngineJosa(source.name,"은","는")+" '"+src.core.id+"'에, "+gateEngineJosa(target.name,"은","는")+" '"+dst.core.id+"'에 무게를 두므로 같은 지시도 서로 다른 이유로 받아들일 수 있습니다.");
   d.sections[2].text=add(d.sections[2].text,"지원 거절 상황에서는 "+gateEngineJosa(source.name,"이","가")+" '"+src.choices[3].label+"'를, "+gateEngineJosa(target.name,"이","가")+" '"+dst.choices[3].label+"'를 선택했습니다. 이때 동의와 자원 상한을 하나의 조건으로 섞지 않고 분리해 확인해야 합니다.");
   d.sections[3].text=add(d.sections[3].text,e.shared+" "+e.bound);
  });
 }
 result.synergies.forEach((card,i)=>{
  const c=i===0?0:i===1?2:i===2?1:3;
  card.action=add(card.action,"공통 선택에서는 "+gateV8PairChoice(a,b,c));
  card.break=add(card.break,i===0?e.shared:e.causes);
 });
 result.debuffs.forEach((card,i)=>{
  const c=i===0?1:i===1?2:i===2?3:0;
  card.chain=add(card.chain,"구체적인 차이는 "+gateV8PairChoice(a,b,c));
  card.mitigation=add(card.mitigation,i%2===0?e.bound:e.causes);
 });
 result.resources=add(result.resources,e.causes+" "+(a.role==="가이드"||b.role==="가이드"?"가이딩 잔량의 실제 소모 여부는 가이딩을 수행했는지에 따라 달라지며, 가이딩이 자동으로 시작되지는 않습니다.":"두 센티넬의 부하도는 서로 연결되어 자동으로 조정되지 않으므로 개별 상태를 확인해야 합니다."));
 result.v8Evidence={motives:[e.A.core.id,e.B.core.id],sharedCommonChoices:4-e.A.choices.slice(0,4).filter((v,i)=>v.choice.axis!==e.B.choices[i].choice.axis).length,largestAxisDifference:e.largest.axis};
 return result;
};
function gateV8TrioSummary(ps,stage,record){
 const arr=ps.map((p,i)=>({p,choice:gateV8Choice(p,stage.index-1),motivation:gateV8Brief(p).core.id}));
 const groups=new Map();
 for(const x of arr){const key=x.choice.choice.axis;groups.set(key,(groups.get(key)||0)+1)}
 const agreement=groups.size===1?"세 대원의 선택이 같은 전술 축을 향합니다. 그러나 맡은 위치와 현재 자원까지 같은 것은 아니므로 역할을 겹치지 않게 배치해야 합니다.":groups.size===3?"세 대원의 선택이 각기 다른 전술 축을 향합니다. 이것은 무조건적인 불화가 아니라 정찰·판단·지원의 분업 기회일 수도 있습니다.":"두 대원이 같은 전술 방향을 고르고 나머지 한 사람이 다른 대응을 택합니다. 다른 판단을 누가 검증하고 언제 합류할지 결정해야 합니다.";
 const motives=[...new Set(arr.map(x=>x.motivation))];
 const motiveText=motives.length===1?"세 사람 모두 '"+motives[0]+"'을 중요하게 여기지만, 같은 목표를 위해 서로 같은 일만 하지는 않도록 주의해야 합니다.":motives.length===3?"세 사람의 중심 동기가 '"+motives.join("', '")+"'으로 갈립니다. 각자의 우선순위를 지휘 판단에 어떻게 포함할지 명확히 해야 합니다.":"세 사람의 행동 이유는 '"+motives.join("'과 '")+"'으로 나뉩니다. 같은 결정을 하더라도 합의의 이유가 다른지 확인할 필요가 있습니다.";
 const report=arr.map(x=>gateEngineJosa(x.p.name,"은","는")+" '"+x.choice.label+"'를 고릅니다").join("; ")+".";
 const risk=record.critical?"자원 임계 상태에 가까운 대원이 나타난 단계이므로, 행동에 앞서 각자의 실제 상태와 가능한 대응을 구분해 확인해야 합니다.":record.success?"이 단계의 가상 판정은 성공 쪽이지만, 다음 단계에서 같은 대응이 안전하리라는 보장은 없습니다.":"이 단계는 가상 판정에서 추가 부담이 발생했습니다. 실패의 책임을 한 명에게 돌리기보다 선택이 연결되지 않은 지점을 찾아야 합니다.";
 const resource=record.resources.map(x=>x.name+" "+(x.role==="센티넬"?"부하도 모형":"가이딩 잔량 모형")+" "+x.before+"→"+x.after).join(", ");
 return agreement+" "+motiveText+" "+report+" "+risk+" 모형상의 자원 변화는 "+resource+"입니다. 실제 자원 수치나 자동 가이딩을 뜻하지는 않습니다.";
}
const gateV8TrioOriginal=gateTrio;
gateTrio=function(ps){
 const result=gateV8TrioOriginal(ps);
 const personalities=ps.map(p=>gateV8Brief(p));
 const cores=personalities.map(x=>x.core.id);
 const unique=[...new Set(cores)];
 const cover=unique.length===3?"서로 다른 우선순위 세 가지를 동시에 운용하는 팀입니다. 의견이 나뉘었을 때 누가 합의의 근거를 모으는지가 중요합니다.":unique.length===1?"세 명의 판단 동기가 유사합니다. 즉각적인 합의는 쉬워질 수 있지만 다른 방향의 위험을 놓치지 않을 교차 확인자가 필요합니다.":"둘은 판단의 이유가 가깝고 한 사람은 다른 기준을 가지고 있습니다. 소수의 다른 의견을 무시하지 않는 배치가 유효합니다.";
 result.stages.forEach((stage,i)=>{
  stage.summary+=" "+gateV8TrioSummary(ps,{index:i+1},stage);
  if(i===3||i===4||i===5)stage.consequence+=" "+(stage.resources.some(r=>r.role==="가이드"&&r.guiding)?"이 단계에서는 명시적으로 선택된 가이딩의 수행이 가이딩 잔량 감소에 반영되었습니다.":"이 단계에서 모든 가이드가 자동으로 가이딩을 수행한 것은 아닙니다.");
 });
 result.pairs.forEach((pair,i)=>{
  const map=[[0,1,2],[0,2,1],[1,2,0]][i],p=ps[map[2]],choice=gateV8Choice(p,6);
  pair.intervention+=" "+gateEngineJosa(p.name,"은","는")+" 동료와 판단이 엇갈리는 장면에서 '"+choice.label+"'를 선택했습니다. 다른 두 사람의 결정을 대신 내리기보다 그 선택이 "+GATE_AXES[choice.choice.axis].name+"과 어떻게 연결되는지 확인할 수 있습니다.";
 });
 result.synergies.forEach((s,i)=>{s.effect+=" "+cover+" "+(i===0?"첫 진입에서 세 사람이 어떤 선택을 했는지 확인하면 분업의 출발점을 찾을 수 있습니다.":"판단이 갈릴 때는 실제 상황 선택과 담당 역할을 연결해 확인하는 것이 좋습니다.")});
 result.debuffs.forEach((s,i)=>{s.chain+=" "+cover+" "+(i%2===0?"작전 중 상대의 동의를 무시한 지원이나 자동 연결은 가정하지 않습니다.":"남은 부하도와 가이딩 잔량은 각자 확인해야 하며, 모형 수치와 실제 상태를 혼동하지 않아야 합니다.")});
 result.notice+=" V8 행동 해설은 각 대원이 실제로 고른 8개 상황 선택의 방향을 반영하며, 캐릭터별 선택 동기의 차이를 연동합니다.";
 result.v8Evidence={primaryMotives:cores,distinctMotives:unique.length,simulatedStages:result.stages.length};
 return result;
};
