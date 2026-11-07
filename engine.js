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
function reportNarratives(p){const a=p.axes,b=a.map(bandIndex),s=p.choices;const picks=getScenarios(p.role);const pick=i=>picks[i].opts[s[i]][2];return {
 intro:`이 기록은 타인과의 상시적인 정신 연결을 전제로 하지 않습니다. ${DOMAINS[a.indexOf(Math.max(...a))].short}이(가) 가장 뚜렷하게 드러났고, ${DOMAINS[a.indexOf(Math.min(...a))].short}에서는 다른 반응 속도를 보였습니다. 두 특징 사이의 간격이 이 캐릭터의 감각적 존재감을 만듭니다.`,
 reception:`${BAND_TEXTS[0][b[0]]} ${pick(3)} 감각을 잘 받아들인다는 사실이 반드시 다른 사람에게 편안한 사람이 된다는 뜻은 아닙니다.`,
 emission:`${BAND_TEXTS[1][b[1]]} ${pick(6)} 먼저 움직이는 것과 상대에게 부담을 주는 것은 동일한 일이 아닙니다.`,
 alert:`${BAND_TEXTS[2][b[2]]} ${pick(0)} ${pick(2)} 징후를 예상하는 능력과 실제로 개입할 권한은 구분되어야 합니다.`,
 buffer:`${BAND_TEXTS[3][b[3]]} ${pick(1)} ${pick(4)} 상대가 필요로 하는 완충 방법은 그날의 부하도와 가이딩 잔량, 현장의 위험에 따라 달라집니다.`,
 boundary:`${BAND_TEXTS[4][b[4]]} ${pick(7)} 도움을 거절한다는 것은 반드시 상대를 거부한다는 의미가 아니며, 받아들인다는 것도 무조건적인 의존을 뜻하지 않습니다.`,
 after:`${BAND_TEXTS[5][b[5]]} ${pick(5)} 감각적 여운은 가이딩의 지속이나 특별한 링크를 뜻하지 않습니다. 긴장과 회복의 속도에 대한 창작적 해석입니다.`,
 role:p.role==='센티넬'?'센티넬의 부하도와 폭주 위험은 실제 게임 규칙을 따르는 별도 요소입니다. 이 보고서의 감각 서명은 부하도 수치나 능력의 우열을 결정하지 않습니다. 가이딩의 도움을 받는 경우에도 그 필요와 반응은 상황에 따라 달라집니다.':'가이드의 가이딩과 가이딩 잔량은 중요한 실무적 제약입니다. 다른 사람의 과부하를 줄이고 싶다는 마음만으로 가이딩을 무제한 수행할 수 있는 것은 아닙니다. 이 보고서의 감각 서명은 가이딩 잔량이나 가이딩 효율을 실제로 계산하지 않습니다.'
};}
function interaction(src,dst){const a=src.axes,b=dst.axes;const stimulation=trim(Math.round(47+(a[1]-5.5)*5.1+(b[0]-5.5)*4.8-(a[3]-5.5)*2.1+(a[5]-b[5])*1.4),5,95);const buffer=trim(Math.round(47+(a[3]-5.5)*5.6+(a[2]-5.5)*2.6+(a[4]-5.5)*2.1-(b[0]-5.5)*1.9),5,95);return {stimulation,buffer,delta:stimulation-buffer};}
function roleLens(a,b){if(a.role==='센티넬'&&b.role==='센티넬')return '두 센티넬은 같은 현장에서도 서로의 말과 행동이 부하도 관리에 다른 부담으로 작용할 수 있습니다. 동행으로 얻는 이점과 각자의 폭주 전조를 별도로 확인하는 것이 중요합니다. 이 검사는 공식 부하도 변화량을 산정하지 않습니다.';
 if(a.role==='가이드'&&b.role==='가이드')return '가이드끼리의 조합은 상대에게 직접 가이딩을 건다는 전제가 아닙니다. 두 사람이 다른 센티넬을 지원할 때 생기는 관찰 순서, 가이딩 자원 배분, 가이딩 잔량 관리의 차이를 읽는 관계입니다.';
 const g=a.role==='가이드'?a:b,s=a.role==='센티넬'?a:b;return `${koParticle(g.name,'은','는')} 가이딩을 수행할 때 자신의 가이딩 잔량과 동의를 함께 살펴야 하며, ${koParticle(s.name,'은','는')} 부하도 변화와 가이딩 이후의 상태를 구분해 확인할 필요가 있습니다. 두 사람에게 고정된 정신적 연결이 존재한다고 가정하지 않습니다.`;
}
function pairResult(a,b){const av=a.axes,bv=b.axes,ds=av.map((x,i)=>range(x,bv[i])),highest=ds.indexOf(Math.max(...ds)),lowest=ds.indexOf(Math.min(...ds)),contrast=Math.max(...ds)>2.2,anchor=contrast?highest:lowest,head=PAIR_AXES[anchor];
 const flags=[mean([av[4],bv[4]])>=5.5,mean([av[2],bv[2]])>=5.5,mean([av[5],bv[5]])>=5.5];const postureIndex=(flags[0]?4:0)+(flags[1]?2:0)+(flags[2]?1:0);const posture=PAIR_POSTURES[postureIndex];
 const ab=interaction(a,b),ba=interaction(b,a);const dir=(p,q,k)=>{const gap=p.axes[1]-q.axes[0],receptive=q.axes[0],protect=p.axes[3],boundary=p.axes[4],after=q.axes[5];const msg=gap>1.6?`${koParticle(p.name,'은','는')} 자신의 말과 행동이 빠르게 전달되는 편이고, ${q.name}에게는 그 변화가 자극으로 크게 느껴질 수 있습니다.`:gap< -1.6?`${koParticle(p.name,'은','는')} 자극의 강도를 낮게 유지하는 편입니다. 다만 ${q.name}에게 필요한 명확한 신호까지 충분히 전달되는지는 따로 살펴야 합니다.`:`${koParticle(p.name,'은','는')} ${q.name}이(가) 알아차릴 수 있는 속도로 반응을 내보내는 편입니다. 대화의 길이보다 타이밍이 중요한 관계입니다.`;
 const out=protect>6.8?'위기에는 환경을 바꾸거나 역할을 조정하려는 반응이 빠릅니다.':protect<4.5?'상대가 도움을 요청할 수 있도록 한 걸음 거리를 남겨 둡니다.':'경고와 지원 사이에서 적절한 시점을 찾으려 합니다.';
 const edge=boundary>6.8?'개입 이전에 상대의 동의를 확인할 가능성이 높습니다.':boundary<4.5?'긴급할수록 먼저 움직일 수 있으므로 상대가 받아들일 범위를 뒤늦게라도 확인하는 편이 좋습니다.':'상황의 위험도에 맞추어 개입 방법을 합의할 수 있습니다.';
 const tail=after>6.8?`${q.name}에게 자극이 오래 남을 수 있으므로 현장을 벗어난 뒤의 회복 시간도 존중해야 합니다.`:`${q.name}이(가) 겉으로 금방 안정되어 보여도 바로 추가적인 부담을 주는 것은 피하는 편이 좋습니다.`;
 return `${msg} ${out} ${edge} ${tail} 이 방향의 가상 자극 지표는 ${k.stimulation}, 완충 지표는 ${k.buffer}입니다. 숫자는 공식 게임 수치가 아닌 상대 비교용 창작 지표입니다.`};
 const similarity=DOMAINS[lowest].short,divergence=DOMAINS[highest].short;
 return {title:`${contrast?head.contrast:head.match} · ${posture[0]}`,typeId:anchor*2+(contrast?1:0),postureId:postureIndex,primary:(contrast?head.contrastText:head.matchText)+' '+posture[1],fromA:dir(a,b,ab),fromB:dir(b,a,ba),fromAToB:ab,fromBToA:ba,role:roleLens(a,b),support:`가장 닮은 영역은 ${similarity}입니다. 이것은 통하는 신호가 있다는 뜻일 수 있지만, 같은 상황에서 같은 실수를 되풀이한다는 뜻일 수도 있습니다.`,risk:`가장 큰 차이는 ${divergence}에서 나타납니다. 자극과 회복의 차이를 의지나 호감의 크기로 해석하기보다는 구체적인 행동을 미리 정해 두는 편이 좋습니다.`,after:`두 사람의 가이딩 여부와 무관하게 현장의 긴장이 오래 남는 쪽은 ${av[5]>=bv[5]?a.name:b.name}일 가능성이 있습니다. 한쪽이 먼저 편안해졌다고 해서 다른 쪽의 감각까지 같은 순간 안정되는 것은 아닙니다.`,common:lowest,difference:highest};
}
function trioResult(ps){const avg=DOMAINS.map((_,i)=>mean(ps.map(p=>p.axes[i]))),spread=DOMAINS.map((_,i)=>Math.max(...ps.map(p=>p.axes[i]))-Math.min(...ps.map(p=>p.axes[i])));const common=spread.indexOf(Math.min(...spread)),variable=spread.indexOf(Math.max(...spread));const pick=i=>ps.slice().sort((a,b)=>b.axes[i]-a.axes[i])[0];const spotter=pick(2),buffer=pick(3),boundary=pick(4);const pairs=[[ps[0],ps[1]],[ps[0],ps[2]],[ps[1],ps[2]]].map(([a,b])=>{const x=interaction(a,b),y=interaction(b,a);return {name:`${a.name} / ${b.name}`,text:`${a.name}→${b.name} 자극 ${x.stimulation}·완충 ${x.buffer}, ${b.name}→${a.name} 자극 ${y.stimulation}·완충 ${y.buffer}. 같은 동행에서도 영향의 방향은 대칭적이지 않습니다.`}});return {title:`세 겹의 감각 · ${DOMAINS[common].short}`,common,variable,description:`세 사람이 가장 비슷하게 반응하는 곳은 ${DOMAINS[common].short}이며, 가장 큰 차이는 ${DOMAINS[variable].short}에서 드러납니다. 세 사람의 감각은 하나로 합쳐지는 것이 아니라 서로 다른 강도의 신호를 순서대로 주고받는 것으로 해석합니다.`,roles:`${spotter.name}은(는) 이상 징후를 먼저 알아차리는 자리에, ${buffer.name}은(는) 자극을 줄이는 행동을 떠올리는 자리에, ${boundary.name}은(는) 개입 전에 범위를 확인하는 자리에 상대적으로 가까울 수 있습니다. 한 사람이 여러 자리를 동시에 맡을 수도 있으며 역할은 고정되지 않습니다.`,risk:`셋의 반응을 모두 맞추려 하기보다 누가 먼저 경고하고 누가 자극을 줄이며 누가 회복 시간을 확보할지 나누는 편이 안정적입니다. 센티넬의 부하도, 가이드의 가이딩 잔량, 가이딩 여부는 별도 현장 조건입니다.`,pairs};}
