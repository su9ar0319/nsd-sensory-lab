'use strict';
// 3인 시너지와 부담의 연쇄: 세 쌍의 여섯 방향 및 제3자 개입 분석
function thirdPersonEffect(a,b,c,forward,backward){
 const seed=linkSeed(a,b)+"::"+(c.id||c.name);
 const bad=Math.max(forward.delta,backward.delta);
 const highSens=Math.max(a.axes[0],b.axes[0]);
 let label,kind,text;
 if(c.axes[3]>=6.8&&bad>10){
   kind="buffer";label="제3자의 완충으로 부담 분산";
   text=`${a.name}과(와) ${b.name} 사이에 자극이 커질 때 ${c.name}의 완충 개입 ${fixed(c.axes[3])}점이 의미를 가집니다. ${c.name}이(가) 환경이나 동선을 조정하면 두 사람이 서로를 직접 진정시키려다 만드는 추가적인 압박을 줄일 수 있습니다. 다만 누구를 먼저 지원할지는 당사자의 의사를 확인해야 합니다.`;
 }else if(c.axes[1]>=6.8&&highSens>=6.8){
   kind="amplify";label="제3자의 신호가 자극을 증폭";
   text=`${c.name}의 자극 발산 ${fixed(c.axes[1])}점이 이미 예민한 두 사람의 감각에 더해질 수 있습니다. ${a.name}과(와) ${b.name} 사이의 의견이 엇갈린 순간 ${c.name}까지 강한 표현으로 개입하면 긴장이 커질 여지가 있습니다. 상황을 정리하려면 누가 말하고 누가 듣는지 순서를 나누는 편이 좋습니다.`;
 }else if(c.axes[2]>mean([a.axes[2],b.axes[2]])+1.1){
   kind="detect";label="제3자의 별도 감지 경로";
   text=`${c.name}의 전조 감지 ${fixed(c.axes[2])}점은 다른 두 사람의 평균보다 높습니다. ${a.name}과(와) ${b.name}이(가) 서로에게 집중하는 동안 ${c.name}이(가) 다른 위험 신호를 발견할 가능성이 있습니다. 관찰한 사실을 공유하고 결론은 함께 확인하는 구조가 유리합니다.`;
 }else if(c.axes[4]>=6.3){
   kind="boundary";label="제3자의 개입 범위 조율";
   text=`${c.name}의 경계 조율 ${fixed(c.axes[4])}점은 두 사람의 갈등을 정리할 단서입니다. ${a.name}과(와) ${b.name}이(가) 서로 도움의 범위를 다르게 생각할 때 ${c.name}이(가) 요청과 동의를 다시 확인할 수 있습니다. 대신 두 사람의 선택을 대신 결정하지는 않는 편이 좋습니다.`;
 }else{
   kind="watch";label="제3자의 거리 유지와 후속 확인";
   text=`${c.name}은(는) 두 사람과 다른 속도로 움직일 수 있습니다. ${a.name}과(와) ${b.name}이(가) 자극을 주고받는 동안 ${c.name}이(가) 바로 개입하지 않고 주변 상황을 확인하면, 불필요한 행동을 늘리지 않으면서 판단할 단서를 남길 수 있습니다.`;
 }
 return {name:c.name,kind,label,text};
}

function trioDeepResult(ps){
 const base=trioResult(ps),t=TEAM_DB.TRIO,assignments=teamRoleAssignment(ps);
 const role=key=>assignments.find(a=>a.key===key),seed=ps.map(p=>[p.id||p.name,p.axes.join("."),p.choices.join("")].join(":")).join("|");
 const gids=ps.filter(p=>p.role==="가이드"),countG=gids.length,groupKind=["SSS","SSG","SGG","GGG"][countG];
 const trioPairs=[[0,1,2],[0,2,1],[1,2,0]].map(([i,j,k],n)=>{
  const a=ps[i],b=ps[j],c=ps[k],pr=pairDeepResult(a,b);
  const third=thirdPersonEffect(a,b,c,pr.fromAToB,pr.fromBToA);
  const best=pr.synergies[0],worst=pr.debuffs[0];
  const forward=[pr.directional[0].parts[0].paragraph,pr.directional[0].parts[4].paragraph].join(" ");
  const backward=[pr.directional[1].parts[0].paragraph,pr.directional[1].parts[4].paragraph].join(" ");
  return {name:`${a.name} × ${b.name}`,first:a.name,second:b.name,third,
   forward,backward,
   data:`${a.name}→${b.name}: 자극 ${pr.fromAToB.stimulation}·완충 ${pr.fromAToB.buffer} / ${b.name}→${a.name}: 자극 ${pr.fromBToA.stimulation}·완충 ${pr.fromBToA.buffer}`,
   text:`두 사람의 주요 시너지는 '${best.title}', 주의할 역효과는 '${worst.title}'입니다. ${best.text} ${worst.text}`,
   synergy:best,debuff:worst,
   tension:Math.max(pr.fromAToB.delta,pr.fromBToA.delta),
   score:Math.max(pr.fromAToB.buffer,pr.fromBToA.buffer)-Math.max(pr.fromAToB.stimulation,pr.fromBToA.stimulation)};
 });
 const makeup=`${teamPick(t.makeup[groupKind],seed,"makeup")} ${countG===0?"세 사람 모두 센티넬이므로 부하도 상승 징후와 외부 지원 요청 기준을 분리해 확인해야 합니다.":countG===3?"세 사람의 가이딩 잔량은 각자 따로 관리해야 합니다. 같은 직군이라는 이유로 지원을 한 사람에게 몰아주지 않는 편이 좋습니다.":`${gids.map(g=>g.name).join("·")}의 가이딩 잔량과 ${ps.filter(p=>p.role==="센티넬").map(p=>p.name).join("·")}의 부하도는 서로 다른 조건입니다. 지원 요청의 순서를 정하면 공명 고갈에 가까워지는 상황을 예방하는 데 도움이 됩니다.`}`;
 const spread=DOMAINS.map((_,i)=>Math.max(...ps.map(p=>p.axes[i]))-Math.min(...ps.map(p=>p.axes[i])));
 const peaks=ps.map(p=>p.axes.indexOf(Math.max(...p.axes)));
 const pattern=spread.filter(v=>v<1.2).length>=4?"same":new Set(peaks).size===3?"split":spread.filter(v=>v>3.4).length>=2?"one":"resource";
 const pressure=`${teamPick(t.pressure[pattern],seed,"pressure")} ${teamPick(t.pressure.resource,seed,"resource")} 특히 ${role("detect").name}의 전조 감지, ${role("buffer").name}의 완충 개입, ${role("boundary").name}의 경계 조율이 서로 이어지는 순서를 마련하는 것이 중요합니다.`;
 const richest=trioPairs.slice().sort((a,b)=>b.score-a.score)[0],riskiest=trioPairs.slice().sort((a,b)=>b.tension-a.tension)[0];
 const teamSynergies=[
 {title:"감지 → 완충 → 조율의 역할 연계",text:`${role("detect").name}이(가) 이상 징후를 발견하면 ${role("buffer").name}이(가) 주변의 자극과 동선을 정리하고, ${role("boundary").name}이(가) 지원의 범위를 확인합니다. 세 사람을 한 역할에 몰아넣지 않아 경고와 대응이 동시에 진행될 수 있습니다. 다만 서로에게 정보를 전달할 순서가 필요합니다.`},
 {title:`${richest.name}의 상호 보완`,text:`세 관계 중 상대적으로 완충의 여지가 큰 방향이 포함된 조합입니다. ${richest.text} ${richest.third.name}의 참여는 '${richest.third.label}'이라는 다른 가능성을 더합니다.`},
 {title:"서로 다른 감각의 관찰 범위",text:`세 사람이 감각 수용과 전조 감지에서 보이는 차이는 각각 ${fixed(spread[0])}점, ${fixed(spread[2])}점입니다. ${spread[2]>2?"먼저 반응하는 사람과 근거를 확인하는 사람이 나뉠 수 있어 위험을 서로 다른 시점에 포착할 수 있습니다.":"세 사람의 경고 타이밍이 가까워 빠르게 합의할 수 있지만 같은 신호를 함께 놓치는지 점검해야 합니다."}`},
 {title:"지원의 소모를 나누는 선택",text:`${makeup} ${role("buffer").name}이(가) 현장을 완충하는 동안 나머지 두 사람은 경고와 지원 범위를 확인할 수 있습니다. 필요한 지원을 구분해 요청하면 한 사람에게 몰리는 부담을 줄일 수 있습니다.`},
 {title:"역할 변경에도 남는 협력",text:`기본 배치의 감지 담당은 ${role("detect").name}, 완충 담당은 ${role("buffer").name}, 조율 담당은 ${role("boundary").name}입니다. 어느 한 사람이 쉬어야 할 때도 남은 두 사람이 모든 행동을 동시에 이어받기보다 먼저 핵심 신호와 지원 범위를 정하는 것이 유리합니다.`}
 ];
 const maxWear=ps.slice().sort((a,b)=>b.axes[5]-a.axes[5])[0];
 const teamDebuffs=[
 {title:`${riskiest.name} 사이에서의 자극 연쇄`,text:`이 조합에서 상대적으로 부담이 두드러지는 관계입니다. ${riskiest.debuff.text} ${riskiest.third.text} 제3자의 도움도 전달 강도가 높아지면 오히려 압박을 키울 수 있습니다.`},
 {title:"세 사람의 다른 경계 기준",text:`경계 조율 점수의 최대 차이는 ${fixed(spread[4])}점입니다. ${spread[4]>2.2?"누군가는 먼저 행동하고 다른 누군가는 동의를 확인하려 해 같은 지원을 다르게 해석할 수 있습니다.":"기본적인 지원 기준은 비슷해도 급박한 상황에서는 판단이 동시에 몰릴 수 있습니다."} 합의할 수 없는 순간에는 필요한 행동을 구체적으로 나누는 편이 좋습니다.`},
 {title:"지원 역할 집중과 자원 부족",text:`${gids.length?gids.map(g=>g.name).join("·")+"의 가이딩 잔량이 줄어드는 상황과": "세 사람의 부하도가 함께 상승하는 상황과"} ${role("buffer").name}에게 완충 역할이 몰리는 순간을 함께 고려해야 합니다. 한 사람의 대응 속도를 팀 전체의 여유로 착각하면 다음 상황에 필요한 자원이 남지 않을 수 있습니다.`},
 {title:"회복 속도의 차이와 남는 부담",text:`${maxWear.name}의 잔향 회복은 ${fixed(maxWear.axes[5])}점으로 세 사람 중 높게 나타납니다. 나머지 두 사람에게는 이미 끝난 현장도 ${maxWear.name}에게는 감각적 긴장으로 이어질 수 있습니다. 같은 휴식 시간을 모두에게 적용하면 불편함이 남습니다.`},
 {title:"확인되지 않은 정보의 확대",text:`전조 감지 최대 차이가 ${fixed(spread[2])}점입니다. ${role("detect").name}의 경고가 ${role("buffer").name}과(와) ${role("boundary").name}에게 어떤 근거로 전달되는지 명확하지 않으면 서로 다른 행동이 동시에 시작될 수 있습니다. 경고·확인·실행을 구분하는 편이 좋습니다.`}
 ];
 const sc=(p,i)=>getScenarios(p.role)[i]?.opts?.[p.choices[i]]?.[0]||"대응을 정한다";
 const scenes=[
 {title:"STEP 01 · 진입 전 상태 확인",text:`${teamPick(t.scene.entry,seed,"entry")} ${role("detect").name}은(는) 관찰 기준을 정하고 ${role("buffer").name}은(는) 자극을 줄일 방법을 준비하며 ${role("boundary").name}은(는) 각자의 허용 범위를 확인합니다. ${makeup}`},
 {title:"STEP 02 · 낯선 신호가 감지된다면",text:`${teamPick(t.scene.warning,seed,"warning")} ${role("detect").name}은(는) 실제로 '${sc(ps[role("detect").index],0)}'를 선택했습니다. ${role("buffer").name}과(와) ${role("boundary").name}은(는) 이 경고를 서로 다른 판단으로 이어받습니다. ${teamSynergies[0].text}`},
 {title:"STEP 03 · 두 대원의 반응이 충돌한다면",text:`${teamPick(t.scene.crisis,seed,"crisis")} ${riskiest.name} 사이에서 감각적 부담이 커지는 조건을 살펴봅니다. ${riskiest.debuff.text} ${riskiest.third.name}의 지원은 ${riskiest.third.label}이라는 변화를 만들 여지가 있습니다.`},
 {title:"STEP 04 · 자원과 지원의 한계",text:`${teamPick(t.pressure.resource,seed,"resource")} ${role("buffer").name}은(는) '${sc(ps[role("buffer").index],4)}'라는 대응을 선택했습니다. 가이딩 잔량과 부하도는 각 인물에게 별도로 적용되므로, 지원의 순서를 조정하는 동안 남은 대원은 관찰과 경계 확인을 이어가야 합니다.`},
 {title:"STEP 05 · 역할 교대와 최종 선택",text:`${teamPick(t.scene.crisis,seed,"shift")} ${role("boundary").name}은(는) '${sc(ps[role("boundary").index],7)}'를 선택했습니다. 누군가가 더 이상 자기 역할을 지속하기 어렵다면 나머지 두 사람이 상태를 확인하고 어떤 지원을 먼저 이어받을지 정해야 합니다.`},
 {title:"STEP 06 · 종료 뒤 서로 다른 회복",text:`${teamPick(t.scene.ending,seed,"ending")} ${maxWear.name}의 감각적 여운이 상대적으로 길 수 있습니다. ${teamDebuffs[3].text} 다음 동행에서는 세 사람의 회복 시간을 따로 확인한 뒤 일정을 정하는 편이 좋습니다.`}
 ];
 const fallback=assignments.map(x=>{
   const remain=ps.filter((p,i)=>i!==x.index);
   const backup=remain.slice().sort((a,b)=>b.axes[x.axis]-a.axes[x.axis])[0];
   const other=remain.find(p=>p.id!==backup.id);
   return {title:`${x.name}이(가) ${x.label} 담당에서 물러난다면`,text:`남은 두 사람 중 ${backup.name}이(가) ${x.label}의 일부를 대신할 여지가 있습니다(관련 축 ${fixed(backup.axes[x.axis])}점). ${other.name}은(는) 정보를 분담하고 ${backup.name}의 부담이 과해지지 않는지 확인할 수 있습니다. ${teamPick(t.fallback[x.key],seed,x.key,"fallback")} 실제 역할 변경은 두 사람의 현재 상태와 의사를 확인한 뒤 결정하는 것이 좋습니다.`};
 });
 const recoverGap=Math.max(...ps.map(p=>p.axes[5]))-Math.min(...ps.map(p=>p.axes[5]));
 const recovery=`${maxWear.name}은(는) 잔향 회복 ${fixed(maxWear.axes[5])}점으로 가장 긴 여운을 보일 수 있습니다. ${teamPick(t.recovery[recoverGap>2.2?"mixed":mean(ps.map(p=>p.axes[5]))>=6.8?"slow":"fast"],seed,"rec")} ${teamDebuffs[3].text}`;
 const outlook=`${teamPick(t.outlook[spread.filter(x=>x>2.8).length>=3?"split":spread.filter(x=>x<1.2).length>=3?"steady":countG>0?"resource":"volatile"],seed,"outlook")} ${teamSynergies[0].text}`;
 const roles=`${assignments.map(x=>`${x.name}: ${x.label}(${fixed(x.score)}점)`).join(" / ")}. 이 배치는 세 사람의 점수를 함께 비교해 한 명이 모든 역할을 독점하지 않도록 정한 협력 제안입니다.`;
 return {...base,roles,assignments,makeup,pressure:teamDebuffs[4].text,scenes,teamSynergies,teamDebuffs,pairDetails:trioPairs,fallback,recovery,outlook,
  thirdEffects:trioPairs.map(p=>({pair:p.name,...p.third})),failureChains:trioPairs.map(p=>({title:`${p.name}에서 부담이 커진다면`,text:`${p.debuff.text} ${p.third.name}이(가) 이 장면에 참여했을 때 ${p.third.text} ${role("boundary").name}은(는) 당사자들의 의사를 다시 확인하여 후속 행동의 범위를 정할 수 있습니다.`}))};
}
