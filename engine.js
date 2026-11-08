'use strict';
const trim=(v,low,high)=>Math.max(low,Math.min(high,v));
const mean=xs=>xs.reduce((s,v)=>s+Number(v),0)/(xs.length||1);
const range=(a,b)=>Math.abs(Number(a)-Number(b));
const fixed=(v,k=1)=>Number(v).toFixed(k);
const reverse=v=>11-v;
const bandIndex=x=>x<4.5?0:x<6.8?1:2;
function koParticle(word,a,b){return String(word)+a+'('+b+')';}
function scoreAnswers(answers,choices,role){
 const questions=getQuestions(role),scenarios=getScenarios(role);
 if(questions.length!==40||scenarios.length!==8)throw Error('직군을 선택해 주세요.');
 if(!Array.isArray(answers)||answers.length!==40||answers.some(v=>!Number.isInteger(v)||v<1||v>10))throw Error('40개의 점수 문항을 모두 입력해 주세요.');
 if(!Array.isArray(choices)||choices.length!==8||choices.some(v=>!Number.isInteger(v)||v<0||v>3))throw Error('8개의 상황 선택을 완료해 주세요.');
 const scored=q=>q.reverse?reverse(answers[q.id]):answers[q.id];
 // 두 직군은 동일한 6개 축에서 같은 1~10 범위로 정규화합니다.
 const base=DOMAINS.map((_,i)=>mean(questions.filter(q=>q.axis===i).map(scored)));
 const adjust=Array(6).fill(0);
 scenarios.forEach((s,i)=>s.opts[choices[i]][1].forEach((v,j)=>adjust[j]+=v));
 const axes=base.map((v,i)=>Math.round(trim(v+adjust[i]*.11,1,10)*100)/100);
 const facets=DOMAINS.flatMap((_,i)=>{const qs=questions.filter(q=>q.axis===i),mid=Math.ceil(qs.length/2);return [mean(qs.slice(0,mid).map(scored)),mean(qs.slice(mid).map(scored))]}).map(x=>Math.round(x*100)/100);
 return {axes,facets,choices:choices.slice(),version:LAB_VERSION};
}
const SIGNATURES=[
 ['절제된 감각','여닫히는 감각','겹쳐지는 감각'],
 ['낮은 파동','움직이는 파동','번지는 파동'],
 ['분명한 신호','예고된 변화','선행하는 경보'],
 ['기다리는 완충','조정하는 완충','선제적 완충'],
 ['즉각의 거리','협의의 경계','말로 그리는 선'],
 ['짧은 메아리','되돌아오는 메아리','오래 남는 잔향']
];
const STATES=['파장이 낮은 구간','조정 가능한 구간','자극이 도드라지는 구간'];
function signature(p){const a=p.axes,hi=a.indexOf(Math.max(...a)),lo=a.indexOf(Math.min(...a));const band=bandIndex(a[hi]);const nuance=a[5]>6.8?'감각 여운이 길게 이어지는 기록':a[0]>6.8?'많은 자극을 동시 수용하는 기록':a[3]>6.8?'위기 앞에서 완충을 먼저 찾는 기록':'상황에 따라 반응 리듬을 바꾸는 기록';const hue=(213+Math.round((a[1]-a[0])*8+(a[2]-a[3])*5+360))%360;const bg1=`hsl(${hue} 43% 25%)`,bg2=`hsl(${(hue+38)%360} 51% 41%)`;return {name:SIGNATURES[hi][band],subtitle:nuance,accent:STATES[bandIndex(a[0])],primary:DOMAINS[hi].short,low:DOMAINS[lo].short,hue,bg1,bg2,code:`${String(hi+1).padStart(2,'0')}-${String(band+1).padStart(2,'0')}-${String(Math.round(a[0]*10)).padStart(3,'0')}-${String(Math.round(a[5]*10)).padStart(3,'0')}`};}
function narrativePick(pool,...parts){
 const valid=(Array.isArray(pool)?pool:[]).filter(x=>typeof x==="string"&&x.trim());
 if(!valid.length)return "";
 let h=2166136261>>>0;
 for(const c of parts.map(String).join("¦")){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;}
 return valid[h%valid.length];
}
function profileKey(p,section){return [p.id||p.name,p.role,(p.axes||[]).join("."),(p.choices||[]).join(""),section].join("|");}
function axisNarrative(p,index){
 const tier=bandIndex(p.axes[index]);
 return narrativePick([BAND_TEXTS[index][tier],...NARRATIVE_DB.AXIS_VARIANTS[index][tier]],profileKey(p,`axis-${index}`));
}
function scenarioClue(p,index){
 const s=getScenarios(p.role)[index];
 return s?.opts?.[p.choices[index]]?.[2]||"";
}
function contextualNarratives(p){
 const a=p.axes;const pairs=[
 ["high0-low3",a[0]>=6.8&&a[3]<4.5],
 ["high2-low4",a[2]>=6.8&&a[4]<4.5],
 ["high1-low5",a[1]>=6.8&&a[5]<4.5],
 ["high3-low2",a[3]>=6.8&&a[2]<4.5],
 ["high4-low1",a[4]>=6.8&&a[1]<4.5],
 ["high5-low4",a[5]>=6.8&&a[4]<4.5],
 ["high2-high3",a[2]>=6.8&&a[3]>=6.8],
 ["low0-high2",a[0]<4.5&&a[2]>=6.8]
 ];
 return pairs.filter(x=>x[1]).slice(0,2).map(([key])=>narrativePick(NARRATIVE_DB.CROSS_VARIANTS[key],profileKey(p,`cross-${key}`)));
}
function reportNarratives(p){
 const a=p.axes,top=a.indexOf(Math.max(...a)),low=a.indexOf(Math.min(...a));
 const contextual=contextualNarratives(p);
 const roleTier=bandIndex(p.role==="센티넬"?(a[2]+a[4])/2:(a[3]+a[4])/2);
 const roleBank=NARRATIVE_DB.ROLE_VARIANTS[p.role]?.[["low","mid","high"][roleTier]]||[];
 const roleText=narrativePick(roleBank,profileKey(p,"role"));
 const intro=`${DOMAINS[top].short}이(가) 가장 선명하게 나타나며, ${DOMAINS[low].short}에서는 다른 속도로 반응합니다. ${contextual[0]||"이 두 반응이 만나는 순간에 이 캐릭터의 감각적 특징이 드러납니다."}`;
 const chunks=[
  axisNarrative(p,0),
  axisNarrative(p,1),
  axisNarrative(p,2),
  axisNarrative(p,3),
  axisNarrative(p,4),
  axisNarrative(p,5)
 ];
 return {
  intro,
  reception:`${chunks[0]} ${scenarioClue(p,3)} ${a[0]>6.8&&a[5]>6.8?"자극을 선명하게 받아들이는 만큼 사건 뒤에 남는 감각을 정리할 시간도 필요합니다.":""}`.trim(),
  emission:`${chunks[1]} ${scenarioClue(p,6)} ${a[1]>6.8&&a[4]<4.5?"표현이 먼저 나가는 순간에는 상대가 허용한 범위를 다시 살펴야 합니다.":""}`.trim(),
  alert:`${chunks[2]} ${scenarioClue(p,0)} ${scenarioClue(p,2)}`.trim(),
  buffer:`${chunks[3]} ${scenarioClue(p,1)} ${scenarioClue(p,4)}`.trim(),
  boundary:`${chunks[4]} ${scenarioClue(p,7)} ${a[4]<4.5&&a[3]>6.8?"돕고 싶어지는 순간과 도움을 받아들이는 순간은 서로 다를 수 있습니다.":""}`.trim(),
  after:`${chunks[5]} ${scenarioClue(p,5)}`.trim(),
  role:`${roleText} ${contextual[1]|| (p.role==="가이드"?"가이딩의 시점과 범위를 선택할 때 자신의 가이딩 잔량과 동료의 상태를 함께 살핍니다.":"부하도가 오르는 순간에 어떻게 상황을 알리고 도움을 요청하는지가 동행의 리듬을 결정합니다.")}`.trim()
 };
}
function interaction(src,dst){const a=src.axes,b=dst.axes;const stimulation=trim(Math.round(47+(a[1]-5.5)*5.1+(b[0]-5.5)*4.8-(a[3]-5.5)*2.1+(a[5]-b[5])*1.4),5,95);const buffer=trim(Math.round(47+(a[3]-5.5)*5.6+(a[2]-5.5)*2.6+(a[4]-5.5)*2.1-(b[0]-5.5)*1.9),5,95);return {stimulation,buffer,delta:stimulation-buffer};}
function roleLens(a,b){
 const kind=a.role==="센티넬"&&b.role==="센티넬"?"SS":a.role==="가이드"&&b.role==="가이드"?"GG":"SG";
 const line=narrativePick(NARRATIVE_DB.PAIR_ROLES[kind],[a.id||a.name,b.id||b.name,a.axes.join("."),b.axes.join("."),"role"].join("|"));
 if(kind!=="SG")return line;
 const g=a.role==="가이드"?a:b,s=a.role==="센티넬"?a:b;
 return `${line} ${koParticle(g.name,"은","는")} 가이딩 잔량의 변화를 살피고, ${koParticle(s.name,"은","는")} 부하도 전조와 가이딩 이후의 감각을 구분해 확인하는 편이 좋습니다.`;
}
function pairResult(a,b){
 const av=a.axes,bv=b.axes,ds=av.map((x,i)=>range(x,bv[i]));
 const highest=ds.indexOf(Math.max(...ds)),lowest=ds.indexOf(Math.min(...ds));
 const contrast=Math.max(...ds)>2.2,anchor=contrast?highest:lowest,head=PAIR_AXES[anchor];
 const flags=[mean([av[4],bv[4]])>=5.5,mean([av[2],bv[2]])>=5.5,mean([av[5],bv[5]])>=5.5];
 const postureIndex=(flags[0]?4:0)+(flags[1]?2:0)+(flags[2]?1:0),posture=PAIR_POSTURES[postureIndex];
 const seed=[a.id||a.name,b.id||b.name,a.axes.join("."),b.axes.join("."),a.choices.join(""),b.choices.join("")].join("|");
 const ab=interaction(a,b),ba=interaction(b,a);
 const dir=(p,q,k)=>{
   const gap=p.axes[1]-q.axes[0],protect=p.axes[3],boundary=p.axes[4],after=q.axes[5];
   const msg=gap>1.6?`${koParticle(p.name,"은","는")} 자신의 말과 행동이 빠르게 전달되는 편이고, ${q.name}에게 그 변화가 크게 느껴질 수 있습니다.`:gap< -1.6?`${koParticle(p.name,"은","는")} 표현의 강도를 낮게 유지합니다. ${q.name}에게 필요한 신호가 충분히 전달되는지는 따로 확인해야 합니다.`:`${koParticle(p.name,"은","는")} ${koParticle(q.name,"이","가")} 알아차릴 수 있는 속도로 반응을 전하는 편입니다.`;
   const out=protect>6.8?"위기에는 환경을 바꾸거나 역할을 조정하려는 반응이 빠릅니다.":protect<4.5?"상대가 도움을 요청할 수 있도록 한 걸음 거리를 남겨 둡니다.":"경고와 지원 사이에서 개입할 시점을 찾습니다.";
   const edge=boundary>6.8?"개입 이전에 상대의 동의를 확인할 가능성이 높습니다.":boundary<4.5?"긴급한 순간 먼저 움직일 수 있으므로 상대가 받아들일 범위를 확인하는 것이 중요합니다.":"상황의 위험도에 맞추어 개입 방법을 협의할 수 있습니다.";
   const tail=after>6.8?`${q.name}에게 자극이 오래 남을 수 있으므로 현장 이후의 회복 시간을 존중해야 합니다.`:`${koParticle(q.name,"이","가")} 안정되어 보여도 다음 행동의 속도는 함께 조율하는 편이 좋습니다.`;
   const category=k.delta>18?"stim":k.delta< -18?"buffer":"balance";
   const extra=narrativePick(NARRATIVE_DB.DIRECTION_VARIANTS[category],seed,p.id||p.name,q.id||q.name,category);
   return `${msg} ${out} ${edge} ${tail} ${extra}`;
 };
 const similarity=DOMAINS[lowest].short,divergence=DOMAINS[highest].short;
 const primaryCore=narrativePick([contrast?head.contrastText:head.matchText,...NARRATIVE_DB.PAIR_VARIANTS[anchor][contrast?"contrast":"match"]],seed,"primary",anchor,contrast);
 const similarText=narrativePick([PAIR_AXES[lowest].matchText,...NARRATIVE_DB.PAIR_VARIANTS[lowest].match],seed,"similar",lowest);
 const riskText=contrast?narrativePick([PAIR_AXES[highest].contrastText,...NARRATIVE_DB.PAIR_VARIANTS[highest].contrast],seed,"difference",highest):`두 사람의 여섯 감각 축이 전반적으로 가깝게 나타납니다. 다만 가장 차이가 나는 ${divergence}에서는 서로 다른 선택을 할 여지가 있습니다.`;
 const gapAfter=av[5]-bv[5];
 const after=Math.abs(gapAfter)>2.2?`작전이 끝난 뒤 ${koParticle(gapAfter>0?a.name:b.name,"은","는")} 상대보다 더 오래 감각적 긴장을 붙잡을 가능성이 있습니다. 두 사람이 함께 다음 일정을 정할 때 그 시간차를 인정하는 것이 좋습니다.`:mean([av[5],bv[5]])>=6.8?"두 사람 모두 현장의 여운을 오래 간직하는 편입니다. 동행이 끝난 뒤 곧바로 일상으로 돌아가기보다 잠시 감각을 정리할 시간을 남기는 편이 좋습니다.":"두 사람은 현장을 떠난 뒤 서로의 회복 속도를 비교적 쉽게 맞출 수 있습니다. 다만 같은 장면에서도 남는 자극의 종류는 다를 수 있습니다.";
 return {
  title:`${contrast?head.contrast:head.match} · ${posture[0]}`,
  typeId:anchor*2+(contrast?1:0),postureId:postureIndex,
  primary:`${primaryCore} ${posture[1]}`,
  fromA:dir(a,b,ab),fromB:dir(b,a,ba),fromAToB:ab,fromBToA:ba,
  role:roleLens(a,b),
  support:`가장 닮은 영역은 ${similarity}입니다. ${similarText}`,
  risk:`가장 큰 차이는 ${divergence}에서 나타납니다. ${riskText}`,
  after,common:lowest,difference:highest
 };
}
function trioResult(ps){
 const avg=DOMAINS.map((_,i)=>mean(ps.map(p=>p.axes[i])));
 const spread=DOMAINS.map((_,i)=>Math.max(...ps.map(p=>p.axes[i]))-Math.min(...ps.map(p=>p.axes[i])));
 const common=spread.indexOf(Math.min(...spread)),variable=spread.indexOf(Math.max(...spread));
 const pick=i=>ps.slice().sort((a,b)=>b.axes[i]-a.axes[i])[0];
 const spotter=pick(2),buffer=pick(3),boundary=pick(4);
 const seed=ps.map(p=>[p.id||p.name,p.axes.join("."),p.choices.join("")].join(":")).join("|");
 const commonText=narrativePick(NARRATIVE_DB.GROUP_VARIANTS[common].common,seed,"common",common);
 const differenceText=narrativePick(NARRATIVE_DB.GROUP_VARIANTS[variable].variable,seed,"variable",variable);
 const peaks=ps.map(p=>p.axes.indexOf(Math.max(...p.axes)));
 const near=spread.filter(v=>v<1.2).length;
 const pattern=peaks.every(v=>v===peaks[0])?"sameHigh":near>=4?"similarLow":new Set(peaks).size===3?"allSplit":"oneOut";
 const groupText=narrativePick(NARRATIVE_DB.GROUP_PATTERNS[pattern],seed,"pattern");
 const pairs=[[ps[0],ps[1]],[ps[0],ps[2]],[ps[1],ps[2]]].map(([a,b],i)=>{
  const x=interaction(a,b),y=interaction(b,a);
  const diffs=a.axes.map((v,j)=>Math.abs(v-b.axes[j])),largest=diffs.indexOf(Math.max(...diffs));
  const strong=Math.max(...diffs)>2.2;
  const note=narrativePick([strong?PAIR_AXES[largest].contrastText:PAIR_AXES[largest].matchText,...NARRATIVE_DB.PAIR_VARIANTS[largest][strong?"contrast":"match"]],seed,"group-pair",i,largest);
  return {name:`${a.name} / ${b.name}`,text:`${a.name}→${b.name} 자극 ${x.stimulation}·완충 ${x.buffer}, ${b.name}→${a.name} 자극 ${y.stimulation}·완충 ${y.buffer}. ${note}`};
 });
 return {
  title:`세 겹의 감각 · ${DOMAINS[common].short}`,
  common,variable,
  description:`세 사람이 가장 비슷하게 반응하는 영역은 ${DOMAINS[common].short}입니다. ${commonText}`,
  roles:`${koParticle(spotter.name,"은","는")} 징후 관찰에, ${koParticle(buffer.name,"은","는")} 자극 조절에, ${koParticle(boundary.name,"은","는")} 개입 범위 확인에 상대적으로 가까울 수 있습니다. ${groupText}`,
  risk:`세 사람의 차이가 가장 두드러지는 영역은 ${DOMAINS[variable].short}입니다. ${differenceText} 센티넬의 부하도와 가이드의 가이딩 잔량을 각자 확인하며 협력의 속도를 맞추는 편이 좋습니다.`,
  pairs
 };
}
