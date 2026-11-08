'use strict';
const STORAGE={owned:'nsd_sensory_v2_owned',imported:'nsd_sensory_v2_imported'};
// 샘플 캐릭터는 표시하지 않습니다.
const isBuiltInSample=p=>Boolean(p&& (p.sample===true || /^sample[0-3]$/.test(String(p.id||''))));
const state={tab:'help',step:0,answers:Array(40).fill(0),choices:Array(8).fill(-1),name:'',role:'센티넬',isPublic:false,editId:null,owned:[],imported:[],directory:[],choiceA:'',choiceB:'',choiceC:'',selected:'',search:'',publicSearch:'',publicSelected:'',cloud:null,cloudState:'local',busy:false};
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getLocal=(k,fallback)=>{try{const raw=localStorage.getItem(k);return raw?JSON.parse(raw):fallback;}catch(_){return fallback;}};
const setLocal=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(_){alert('브라우저 저장 공간을 사용할 수 없습니다. JSON 내보내기로 백업해 주세요.');}};
const idNew=()=>`p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`;
function toast(message,bad=false){const x=document.createElement('div');x.className='toast';x.textContent=message;if(bad)x.style.background='#feeae9';document.body.appendChild(x);setTimeout(()=>x.remove(),4400);}
const validProfile=p=>p&&p.version===LAB_VERSION&&['센티넬','가이드'].includes(p.role)&&Array.isArray(p.axes)&&p.axes.length===6&&Array.isArray(p.choices)&&p.choices.length===8;
const allProfiles=()=>{const m=new Map();[...state.directory,...state.imported,...state.owned].filter(p=>!isBuiltInSample(p)&&validProfile(p)).forEach(p=>m.set(p.id,p));return [...m.values()].sort((a,b)=>a.name.localeCompare(b.name,'ko'));};
const byId=id=>allProfiles().find(p=>p.id===id);
const counted=()=>state.answers.filter(v=>v>=1&&v<=10).length+state.choices.filter(v=>v>=0&&v<4).length;
function updateNav(){const tabs=[['help','이용 안내'],['survey','48문항 설문'],['library','내 기록'],['public','공개 기록'],['pair','2인 간섭 분석'],['group','3인 연계 분석']];$('nav').innerHTML=tabs.map(([id,label])=>`<button type="button" class="${state.tab===id?'active':''}" onclick="switchTo('${id}')">${label}</button>`).join('');}
function switchTo(tab){state.tab=tab;render();window.scrollTo({top:0,behavior:'smooth'});}
function render(){updateNav();$('main').innerHTML=state.tab==='survey'?surveyView():state.tab==='library'?libraryView():state.tab==='public'?publicLibraryView():state.tab==='pair'?pairView():state.tab==='group'?groupView():helpView();}
function stepTitle(step){return ['공통 성향 1~8','공통 성향 9~16','직군 전용 1~8','직군 전용 9~16','직군 전용 17~24','현장 선택 여덟 장면'][step];}
function surveyView(){const n=counted(),step=state.step,start=step*8,edit=!!state.editId,questions=getQuestions(state.role),scenarios=getScenarios(state.role);return `
<section class="card survey"><div class="row between"><div><div class="kicker">NSD / SENSORY PROFILE</div><h2>개인 감각 반응 조사</h2><p class="sub">센티넬의 부하도, 가이드의 가이딩 잔량, 가이딩 전후의 대응과 현장 감각을 다룹니다. 실제로 경험하지 않은 상황은 캐릭터라면 어떻게 행동할지를 기준으로 답해 주세요.</p></div><div class="progress-number" id="progress">${n}/48</div></div>
<div class="steps">${Array.from({length:6},(_,i)=>`<div class="step ${i<=step?'active':''}"></div>`).join('')}</div>
<div class="columns" style="margin:18px 0"><div><label class="field-label" for="name">캐릭터 이름</label><input class="field" id="name" type="text" maxlength="40" placeholder="캐릭터 이름" value="${esc(state.name)}" oninput="changeName(this.value)"></div><div><label class="field-label" for="role">직군</label><select class="field" id="role" onchange="changeRole(this.value)"><option value="센티넬" ${state.role==='센티넬'?'selected':''}>센티넬</option><option value="가이드" ${state.role==='가이드'?'selected':''}>가이드</option></select></div></div>
<label class="row" style="gap:9px;align-items:flex-start;font-size:13px"><input type="checkbox" style="width:17px;height:17px;margin-top:4px;accent-color:#3e7775" ${state.isPublic?'checked':''} onchange="setVisible(this.checked)"><span>다른 참여자의 <b>1인 결과 열람·2인·3인 분석에 이 캐릭터를 공개</b>합니다.<br><span class="sub">공개 시 다른 참여자가 1인 감각 간섭 결과를 읽고 2인·3인 분석에 사용할 수 있습니다. 40개 점수 문항의 원문 응답은 공개하지 않습니다.</span></span></label>

${edit?'<div class="hint" style="margin-top:14px">저장한 캐릭터를 수정 중입니다. 다시 저장하면 개인 결과와 공개 목록이 갱신됩니다.</div>':''}</section>
<section class="card survey"><div class="kicker">SECTION ${String(step+1).padStart(2,'0')} / 06</div><h2>${stepTitle(step)}</h2><p class="micro">${step<2?'모든 직군 공통':step<5?state.role+' 전용 문항':'공통 4장면 + '+state.role+' 전용 4장면'}</p>${step===5?`<div class="hint">공통 상황 4개와 직군 전용 상황 4개에서 가장 가까운 행동 하나씩 선택해 주세요. 모든 선택은 감각 서명·간섭·회복 해설에 반영됩니다.</div>${scenarios.map((sc,i)=>`<div class="scenario"><div class="row"><span class="kicker">S${String(i+1).padStart(2,'0')}</span><strong>${esc(sc.title)}</strong></div><p>${esc(sc.story)}</p><div class="opts">${sc.opts.map((o,k)=>`<label class="opt"><input type="radio" name="sc${i}" value="${k}" ${state.choices[i]===k?'checked':''} onchange="setChoice(${i},${k})"><span><b>${String.fromCharCode(65+k)}.</b> ${esc(o[0])}</span></label>`).join('')}</div></div>`).join('')}`:
`<div class="hint">1점 = 전혀 그렇지 않다 / 5~6점 = 상황에 따라 다르다 / 10점 = 매우 그렇다. 점수의 높고 낮음은 좋은 능력이나 나쁜 성격을 뜻하지 않습니다.</div>${questions.slice(start,start+8).map((q,j)=>`<div class="q"><div><strong>Q${String(start+j+1).padStart(2,'0')}</strong><span>${esc(q.text)}</span></div><select class="rating" aria-label="${start+j+1}번 점수" onchange="setScore(${start+j},this.value)"><option value="">선택</option>${Array.from({length:10},(_,k)=>`<option value="${k+1}" ${state.answers[start+j]===k+1?'selected':''}>${k+1}점</option>`).join('')}</select></div>`).join('')}`}
<div class="row between form-actions" style="margin-top:23px"><button class="btn ghost" ${step===0?'disabled':''} onclick="moveStep(-1)">← 이전</button><span class="micro">${step+1} / 6</span>${step===5?`<button id="saveBtn" class="btn" ${n!==48||!state.name.trim()||state.busy?'disabled':''} onclick="saveProfile()">${edit?'수정 저장':'감각 보고서 생성'} →</button>`:`<button class="btn" onclick="moveStep(1)">다음 →</button>`}</div>
${step===5&&n!==48?`<p class="micro">미응답 ${48-n}문항이 남아 있습니다. 이전 영역으로 돌아가도 입력값은 유지됩니다.</p>`:''}</section>`;}
function updateProgress(){const p=$('progress');if(p)p.textContent=counted()+'/48';const btn=$('saveBtn');if(btn)btn.disabled=counted()!==48||!state.name.trim()||state.busy;}
function changeName(v){state.name=v;updateProgress();}function changeRole(v){if(state.role!==v){state.role=v;state.answers=state.answers.map((x,i)=>i<16?x:0);state.choices=state.choices.map((x,i)=>i<4?x:-1);state.step=0;render();}}function setVisible(v){state.isPublic=v;}
function setScore(i,v){state.answers[i]=v?Number(v):0;updateProgress();}
function setChoice(i,v){state.choices[i]=Number(v);updateProgress();}
function moveStep(n){state.step=trim(state.step+n,0,5);render();window.scrollTo({top:0,behavior:'smooth'});}
function startNew(){state.step=0;state.answers=Array(40).fill(0);state.choices=Array(8).fill(-1);state.name='';state.role='센티넬';state.isPublic=false;state.editId=null;switchTo('survey');}
function ownProfile(id){return state.owned.find(p=>p.id===id);}
function editOne(id){let p=ownProfile(id);if(!p||!p.answers||!p.choices)return toast('이 브라우저에서는 수정할 수 없는 기록입니다.',true);state.step=0;state.answers=p.answers.slice();state.choices=p.choices.slice();state.name=p.name;state.role=p.role;state.isPublic=p.isPublic;state.editId=p.id;switchTo('survey');}
function safePublic(p){return {id:p.id,name:p.name,role:p.role,axes:p.axes,facets:p.facets,choices:p.choices,isPublic:true,version:LAB_VERSION,updatedAt:p.updatedAt};}
async function saveProfile(){if(state.busy)return;let name=state.name.trim();if(!name||counted()!==48){toast('이름과 48개 응답을 모두 입력해 주세요.',true);return;}
 state.busy=true;updateProgress();try{const derived=scoreAnswers(state.answers,state.choices,state.role);const old=state.owned.find(x=>x.id===state.editId);const p={...derived,id:old?.id||idNew(),name,role:state.role,isPublic:state.isPublic,answers:state.answers.slice(),localOnly:!state.cloud,updatedAt:new Date().toISOString()};if(state.cloud)await state.cloud.save(p);
 state.owned=state.owned.filter(x=>x.id!==p.id);state.owned.push(p);setLocal(STORAGE.owned,state.owned);state.selected=p.id;state.choiceA=p.id;state.editId=null;state.tab='library';if(state.cloud)await refreshCloud();toast('새로운 감각 기록을 저장했습니다.');render();}catch(err){toast('저장 실패: '+err.message,true);}finally{state.busy=false;updateProgress();}}
async function removeOne(id){let p=ownProfile(id);if(!p||!confirm(`'${p.name}' 기록을 삭제하시겠습니까?`))return;try{if(state.cloud&&!p.localOnly)await state.cloud.remove(p);state.owned=state.owned.filter(x=>x.id!==id);setLocal(STORAGE.owned,state.owned);if(!state.cloud)state.imported=state.imported.filter(x=>x.id!==id);if(state.selected===id)state.selected='';render();toast('삭제했습니다.');}catch(err){toast('삭제 실패: '+err.message,true);}}
function tag(p){return `<span class="pill">${esc(p.role)}${p.isPublic?' · 공개':''}</span>`;}
function optionsHtml(selected){return '<option value="">캐릭터 선택</option>'+allProfiles().map(p=>`<option value="${esc(p.id)}" ${p.id===selected?'selected':''}>${esc(p.name)} (${esc(p.role)})</option>`).join('');}
function choiceChange(key,v){state[key]=v;render();}
function findChange(v){state.search=v;const list=$('profileList');if(list)list.innerHTML=profileRows();}
// 개인 결과에는 이 사용자(현재 브라우저의 익명 인증 계정)가 소유한 기록만 표시합니다.
// 다른 참여자가 공개한 프로필은 공개 기록과 2인·3인 분석에서 열람할 수 있습니다.
const myProfiles=()=>state.owned.filter(p=>!isBuiltInSample(p)&&validProfile(p)).slice().sort((a,b)=>a.name.localeCompare(b.name,'ko'));
function profileRows(){const q=state.search.trim().toLowerCase();return myProfiles().filter(p=>p.name.toLowerCase().includes(q)).map(p=>`<div class="person"><div><strong>${esc(p.name)}</strong> ${tag(p)}</div><div class="row"><button class="btn soft" onclick="seeOne('${esc(p.id)}')">결과 보기</button><button class="btn ghost" onclick="editOne('${esc(p.id)}')">수정</button><button class="btn warn" onclick="removeOne('${esc(p.id)}')">삭제</button></div></div>`).join('')||('<div class="empty">'+(myProfiles().length?'검색된 내 캐릭터가 없습니다.':'등록된 내 캐릭터가 없습니다. 설문을 완료하면 이곳에 기록됩니다.')+'</div>');}
function seeOne(id){if(!ownProfile(id))return;state.selected=id;render();let el=$('personalResult');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}
function libraryView(){const owned=myProfiles(),p=owned.find(x=>x.id===state.selected)||owned[0];return `<section class="card no-print"><div class="row between"><div><div class="kicker">PERSONAL SENSORY RECORD</div><h2>내 감각 기록</h2><p class="sub">내가 등록한 캐릭터를 확인하고 수정·삭제할 수 있습니다. 다른 참여자의 1인 감각 보고서는 ‘공개 기록’에서 열람해 주세요.</p></div><button class="btn" onclick="startNew()">+ 새 캐릭터</button></div><div class="hint" style="margin-top:12px">공개한 캐릭터는 다른 참여자의 1인 결과 열람과 2인·3인 분석 목록에 함께 표시됩니다. 수정·삭제는 등록자만 할 수 있습니다.</div><div class="row" style="margin-top:13px"><input aria-label="내 캐릭터 검색" class="field" style="max-width:290px" placeholder="내 캐릭터 이름 검색" value="${esc(state.search)}" oninput="findChange(this.value)"><button class="btn ghost" onclick="exportProfiles()">공유용 내보내기</button><button class="btn ghost" onclick="exportEditable()">원본 백업</button><button class="btn ghost" onclick="$('jsonInput').click()">가져오기</button><input id="jsonInput" type="file" accept=".json,application/json" style="display:none" onchange="importProfiles(this.files[0])"></div><div class="personal-list" id="profileList">${profileRows()}</div></section>${p?individualView(p):'<section class="card empty">아직 등록된 내 캐릭터가 없습니다. 48문항 설문을 완료해 첫 기록을 만들어 보세요.</section>'}`;}
// 공개한 캐릭터는 1인 결과 열람 및 2인·3인 분석에 동일하게 노출됩니다.
const publicProfiles=()=>state.directory.filter(p=>p.isPublic===true&&!isBuiltInSample(p)&&validProfile(p)).slice().sort((a,b)=>a.name.localeCompare(b.name,'ko'));
function filteredPublicProfiles(){const q=state.publicSearch.trim().toLowerCase();return publicProfiles().filter(p=>p.name.toLowerCase().includes(q)||p.role.toLowerCase().includes(q));}
function publicSearchChange(v){state.publicSearch=v;const list=$('publicProfileList');if(list)list.innerHTML=publicProfileRows();}
function publicProfileRows(){const rows=filteredPublicProfiles();if(!rows.length)return `<div class="empty">${state.cloudState!=='online'?'Firebase 공유 저장소에 연결된 후 공개된 기록을 열람할 수 있습니다.':publicProfiles().length?'검색 결과가 없습니다.':'아직 공개된 캐릭터 기록이 없습니다.'}</div>`;return rows.map((p,i)=>`<div class="person"><div><strong>${esc(p.name)}</strong> ${tag(p)}</div><div class="row"><button class="btn soft" onclick="seePublic(${i})">1인 결과 보기</button></div></div>`).join('');}
function seePublic(i){const p=filteredPublicProfiles()[i];if(!p)return;state.publicSelected=p.id;render();const el=$('publicResult');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}
function publicLibraryView(){const p=publicProfiles().find(x=>x.id===state.publicSelected);return `<section class="card no-print"><div class="row between"><div><div class="kicker">PUBLIC SENSORY ARCHIVE</div><h2>공개 기록 열람</h2><p class="sub">공개에 동의한 캐릭터의 1인 감각 간섭 결과를 읽을 수 있습니다. 이 화면에서는 누구의 기록도 수정하거나 삭제할 수 없습니다.</p></div><button class="btn ghost" onclick="refreshCloud(true)">목록 새로고침</button></div><div class="hint" style="margin-top:12px">공개된 캐릭터라면 누구나 1인 결과지를 열람하고 2인·3인 분석에 활용할 수 있습니다. 수정·삭제는 등록자만 가능합니다.</div><div class="row" style="margin-top:13px"><input aria-label="공개 캐릭터 검색" class="field" style="max-width:340px" placeholder="캐릭터 이름·직군 검색" value="${esc(state.publicSearch)}" oninput="publicSearchChange(this.value)"></div><div class="personal-list" id="publicProfileList">${publicProfileRows()}</div></section>${p?`<div id="publicResult"><div class="card no-print" style="margin-bottom:14px"><div class="kicker">READ ONLY / PUBLIC RECORD</div><p class="sub" style="margin:6px 0 0">공개된 1인 결과지입니다. 이곳에는 수정·삭제 기능이 없습니다.</p></div>${individualView(p)}</div>`:'<section class="card empty">목록에서 캐릭터를 선택하면 1인 결과지가 표시됩니다.</section>'}`;}
function spectrumCard(p,small=false){const r=signature(p);return `<div class="spectrum ${small?'tiny':''}" style="background:linear-gradient(117deg,${r.bg1},${r.bg2})"><div class="kicker">SENSORY SIGNATURE / ${esc(p.role)}</div><h3>${esc(r.name)}</h3><p>${esc(r.subtitle)}</p><span class="sig-code">ID ${esc(r.code)}</span><div class="wave-line"></div></div>`;}
function statBars(p){return `<div class="metrics">${p.axes.map((v,i)=>`<div class="metric"><b>${esc(DOMAINS[i].short)}</b><div class="track"><i style="width:${Math.round(v*10)}%"></i></div><span>${fixed(v)}</span></div>`).join('')}</div>`;}
function lineSection(i,title,content){return `<div class="section"><h3>${String(i).padStart(2,'0')}. ${title}</h3><p>${content}</p></div>`;}
function soloInsightCards(items){
 return `<div class="solo-depth-grid">${items.map((x,i)=>`<article class="solo-depth-card"><div class="solo-depth-number">${String(i+1).padStart(2,"0")}</div><h4>${esc(x.title)}</h4><p>${esc(x.text)}</p></article>`).join("")}</div>`;
}
function soloSummaryCards(p,t,r){
 const highest=p.axes.indexOf(Math.max(...p.axes));
 const entries=[
  {n:1,title:'이 감각 서명이 나타난 이유',text:t.intro,tag:'감각 서명',signal:DOMAINS[highest].short,axis:null},
  {n:2,title:'자극을 받아들이는 방법',text:t.reception,tag:'감각 수용',axis:0},
  {n:3,title:'타인에게 전해지는 파장',text:t.emission,tag:'자극 발산',axis:1},
  {n:4,title:'부하도와 가이딩 잔량의 전조',text:t.alert,tag:'전조 감지',axis:2},
  {n:5,title:'위기에서의 완충 행동',text:t.buffer,tag:'완충 개입',axis:3},
  {n:6,title:'선의와 간섭 사이의 경계',text:t.boundary,tag:'경계 조율',axis:4},
  {n:7,title:'가이딩 이후에도 남는 감각',text:t.after,tag:'잔향 회복',axis:5},
  {n:8,title:'직군에 따른 현장 해석',text:t.role,tag:'현장 대응',signal:p.role,axis:null}
 ];
 return `<div class="solo-summary-grid">${entries.map(x=>{
   const metric=x.axis!==null?`<div class="solo-summary-score" aria-label="${esc(x.tag)} ${fixed(p.axes[x.axis])}점"><strong>${fixed(p.axes[x.axis])}</strong><span>/ 10</span></div>`:
    `<span class="solo-summary-tag">${esc(x.signal)}</span>`;
   const track=x.axis!==null?`<div class="solo-summary-track" aria-hidden="true"><i style="width:${Math.max(0,Math.min(100,p.axes[x.axis]*10))}%"></i></div>`:'';
   return `<article class="solo-summary-card"><div class="solo-summary-meta"><span>0${x.n} / QUICK READ</span>${metric}</div><h4>${esc(x.title)}</h4><p>${esc(x.text)}</p>${track}</article>`;
 }).join('')}</div>`;
}
function soloChapter(label,title,description){
 return `<div class="solo-chapter"><div class="solo-chapter-overline">${esc(label)}</div><h3>${esc(title)}</h3><p>${esc(description)}</p></div>`;
}
function individualView(p){const r=signature(p),t=reportNarratives(p),depth=individualDepthReport(p),name=esc(p.name),scenarios=getScenarios(p.role);const acts=[0,1,2,3,4,5,6,7].map(i=>`<div class="memory-card"><b>${esc(scenarios[i].title)}</b><p>“${esc(scenarios[i].opts[p.choices[i]][0])}”<br>${esc(scenarios[i].opts[p.choices[i]][2])}</p></div>`).join('');return `<section id="personalResult" class="card result"><div class="report-eyebrow">NSD / INDIVIDUAL SENSORY INTERFERENCE</div><h2>${name}의 감각 간섭 보고서</h2><p class="report-sub">${tag(p)} · 감각 수용과 위기 대응을 살펴보는 개인 기록</p><div class="columns hero-layout"><div>${spectrumCard(p)}</div><div class="sensory-panel"><div class="kicker">READING THE SIGNAL</div><h3>${esc(r.accent)}</h3><p>${esc(r.subtitle)}</p><div class="note-line"><b>강조</b><span>${esc(r.primary)}</span></div><div class="note-line"><b>여백</b><span>${esc(r.low)}</span></div><div class="note-line"><b>직군</b><span>${esc(p.role)}</span></div></div></div>
${soloChapter("PART 01 / SENSORY PROFILE","감각 프로필 한눈에 읽기","01~08번은 각 감각 축과 직군별 기본 반응을 빠르게 확인하는 요약 분석입니다.")}
${soloSummaryCards(p,t,r)}
${soloChapter("PART 02 / DEEP INTERPRETATION","감각 반응 심층 분석","09번부터는 두 감각의 충돌, 실제 선택의 흐름, 위기 상황과 타인의 해석까지 연결해 살펴봅니다.")}
<div class="section solo-depth-section"><h3>09. 서로 다른 감각이 한 사람 안에서 만날 때</h3><p class="sub">6축을 하나씩 읽는 대신, 두 감각이 동시에 작용할 때 생기는 간격과 변화에 주목합니다.</p>${soloInsightCards(depth.crosses)}</div>
<div class="section solo-depth-section"><h3>10. 같은 감각 안에서도 달라지는 반응</h3><p class="sub">각 축의 두 문항군 응답을 비교해 하나의 평균 뒤에 가려진 차이를 살펴봅니다.</p>${soloInsightCards(depth.facets)}</div>
<div class="section solo-depth-section"><h3>11. 네 가지 장면으로 이어 읽는 판단의 흐름</h3><p class="sub">서로 다른 설문 선택을 이어 보면 같은 인물도 위험과 도움, 회복 앞에서 순서를 바꿀 수 있습니다.</p>${soloInsightCards(depth.decisions)}</div>
<div class="section solo-depth-section"><h3>12. ${esc(p.role)}의 현장 자원과 세 번의 갈림길</h3><p class="sub">위기가 시작되는 때, 지원의 범위를 결정하는 때, 모든 일이 끝난 뒤를 구분해 읽습니다.</p>${soloInsightCards(depth.roleArc)}</div>
<div class="section solo-depth-section"><h3>13. 타인에게 잘못 읽히기 쉬운 신호</h3><p class="sub">겉으로 보이는 행동과 실제 감각 부담이 늘 같은 방향으로 움직이지는 않습니다.</p>${soloInsightCards(depth.misreads)}</div>
<div class="section solo-depth-section"><h3>14. 이 인물과 동행할 때 도움이 되는 대화</h3><p class="sub">누군가가 어떤 정보를 물어보고 어떤 선택권을 남겨야 할지 살펴봅니다.</p>${soloInsightCards(depth.cooperation)}</div>
<div class="section solo-depth-section"><h3>15. 다른 선택이 이야기를 바꾸는 순간</h3><p class="sub">점수와 실제 선택에서 출발한 캐릭터 서사의 가능성입니다.</p>${soloInsightCards(depth.stories)}</div>
<div class="section"><h3>16. 여덟 장면에 남은 선택</h3><p class="sub">선택한 행동을 통해 위기에서 드러나는 판단과 대응 방식을 살펴봅니다.</p>${acts}</div>
<div class="section"><h3>17. 여섯 개의 감각 좌표</h3>${statBars(p)}</div>
<div class="row actions"><button class="btn soft" onclick="pairFrom('${esc(p.id)}')">이 캐릭터로 2인 분석 →</button><button class="btn ghost" onclick="copyAIAnalysis('individual','${esc(p.id)}')">AI 분석 패키지 복사</button><button class="btn ghost" onclick="window.print()">인쇄 · PDF 저장</button></div></section>`;}
function pairFrom(id){state.choiceA=id;state.choiceB=allProfiles().find(x=>x.id!==id)?.id||'';switchTo('pair');}
function pairView(){const all=allProfiles();if(!state.choiceA)state.choiceA=all[0]?.id||'';if(!state.choiceB)state.choiceB=all.find(x=>x.id!==state.choiceA)?.id||'';const a=byId(state.choiceA),b=byId(state.choiceB);return `<section class="card no-print"><div class="kicker">SENSORY INTERFERENCE / PAIR</div><h2>2인 감각 간섭 분석</h2><p class="sub">두 캐릭터의 반응을 선택하면 A→B, B→A의 자극과 완충 효과를 각각 해석합니다.</p><div class="columns"><div><label class="field-label">대상자 A</label><select class="field" onchange="choiceChange('choiceA',this.value)">${optionsHtml(state.choiceA)}</select></div><div><label class="field-label">대상자 B</label><select class="field" onchange="choiceChange('choiceB',this.value)">${optionsHtml(state.choiceB)}</select></div></div></section>${a&&b&&a.id!==b.id?pairViewResult(a,b):'<section class="card empty">서로 다른 두 캐릭터를 선택해 주세요.</section>'}`;}
function interferencePanel(a,b,r){return `<div class="impact-grid"><div class="impact-item"><span>${esc(a.name)} → ${esc(b.name)}</span><div class="impact-values"><b>자극 ${r.stimulation}</b><b>완충 ${r.buffer}</b></div><div class="impact-bars"><i style="width:${r.stimulation}%"></i><em style="width:${r.buffer}%"></em></div></div></div>`;}
function sensoryCards(items,type){
 const labeled=text=>esc(text).replace(/\*\*(활성 조건|깨지는 순간|발동 계기|악화 지점|확대 경로)\*\*/g,(_,label)=>`${["깨지는 순간","악화 지점","확대 경로"].includes(label)?'<span class="analysis-break" aria-hidden="true"></span>':''}<strong class="analysis-condition">${label}</strong>`);
 return `<div class="analysis-card-grid">${items.map((p,i)=>`<div class="analysis-card ${type}"><div class="analysis-card-meta">${type==="synergy"?"SYNERGY":"RISK"} / ${String(i+1).padStart(2,"0")}</div><h4>${esc(p.title)}</h4><p>${labeled(p.text)}</p></div>`).join("")}</div>`;
}

function directionView(d){
 return `<div class="direction-story"><div class="direction-story-heading"><div class="report-eyebrow">DIRECTIONAL IMPACT</div><h4>${esc(d.src)} → ${esc(d.dst)}</h4><span class="direction-state">${d.kind==="synergy"?"완충 우세":d.kind==="debuff"?"자극 우세":"혼합 반응"}</span></div>${d.parts.map(p=>`<div class="direction-part"><b>${esc(p.label)}</b><p>${esc(p.paragraph)}</p></div>`).join("")}</div>`;
}

function pairViewResult(a,b){
 const r=pairDeepResult(a,b);
 const scenarios=r.scenes.map(s=>`<div class="memory-card"><b>${esc(s.title)}</b><p>${esc(s.text)}</p></div>`).join("");
 return `<section class="card result"><div class="report-eyebrow">NSD / DIRECTIONAL INTERFERENCE REPORT</div><h2>${esc(r.title)}</h2>
 <div class="pills"><span class="pill">관계 원형 ${r.typeId+1}/12</span><span class="pill">반응 결 ${r.postureId+1}/8</span><span class="pill">양방향 시너지·역효과 분석</span></div>
 <p class="report-sub">${esc(a.name)} (${esc(a.role)}) × ${esc(b.name)} (${esc(b.role)})</p><div class="comparison-swatches">${spectrumCard(a,true)}${spectrumCard(b,true)}</div>
 <div class="section"><h3>01. 방향별 자극과 완충</h3>${interferencePanel(a,b,r.fromAToB)}${interferencePanel(b,a,r.fromBToA)}<p class="sub">두 방향의 영향은 같지 않을 수 있습니다. 전달하는 사람과 받아들이는 사람이 바뀌면 자극과 완충도 달라집니다.</p></div>
 ${lineSection(2,"두 감각이 처음 마주치는 방식",esc(r.opening))}
 <div class="section"><h3>03. ${esc(a.name)}이(가) ${esc(b.name)}에게 미치는 영향</h3>${directionView(r.directional[0])}</div>
 <div class="section"><h3>04. ${esc(b.name)}이(가) ${esc(a.name)}에게 미치는 영향</h3>${directionView(r.directional[1])}</div>
 <div class="section"><h3>05. 함께할 때 나타나는 시너지</h3><p class="sub">감지와 지원, 감각 수용 방식에서 서로를 보완할 수 있는 조건입니다.</p>${sensoryCards(r.synergies,"synergy")}</div>
 <div class="section"><h3>06. 서로를 힘들게 할 수 있는 역효과</h3><p class="sub">자극이 누적되거나 지원이 어긋나는 상황에서 나타날 수 있는 부담입니다.</p>${sensoryCards(r.debuffs,"debuff")}</div>
 <div class="section"><h3>07. 실제 선택을 연결한 세 가지 동행 장면</h3>${scenarios}</div>
 ${lineSection(8,"경고의 속도가 달라질 때",esc(r.signal))}
 ${lineSection(9,"지원과 동의 사이에서",esc(r.supportTiming)+" "+esc(r.decision))}
 ${lineSection(10,"직군과 자원 관리",esc(r.resource))}
 ${lineSection(11,"임무 이후의 감각과 회복",esc(r.recovery))}
 ${lineSection(12,"관계의 균형이 달라지는 조건",esc(r.turning))}
 <div class="section"><h3>13. 두 사람의 감각 좌표</h3><div class="metrics">${DOMAINS.map((d,i)=>`<div class="metric"><b>${esc(d.short)}</b><div class="track"><i style="width:${mean([a.axes[i],b.axes[i]])*10}%"></i></div><span>${fixed(range(a.axes[i],b.axes[i]))}Δ</span></div>`).join("")}</div></div>
 <div class="row actions"><button class="btn ghost" onclick="window.print()">결과 인쇄 · PDF</button><button class="btn soft" onclick="copyCurrentLink('pair')">페어 조합 링크 복사</button><button class="btn ghost" onclick="copyAIAnalysis('pair')">AI 분석 패키지 복사</button></div></section>`;
}
function groupView(){const all=allProfiles();for(const k of ['choiceA','choiceB','choiceC'])if(!state[k])state[k]=all.find(p=>!['choiceA','choiceB','choiceC'].filter(x=>x!==k).map(x=>state[x]).includes(p.id))?.id||'';const ps=['choiceA','choiceB','choiceC'].map(k=>byId(state[k]));return `<section class="card no-print"><div class="kicker">SENSORY INTERFERENCE / GROUP</div><h2>3인 연계 분석</h2><p class="sub">세 사람이 각자의 감각을 유지하면서 함께 움직일 때 드러나는 신호·완충·회복의 균형을 읽습니다. 관계의 형태는 미리 정하지 않습니다.</p><div class="columns three">${['choiceA','choiceB','choiceC'].map((k,i)=>`<div><label class="field-label">대상자 ${'ABC'[i]}</label><select class="field" onchange="choiceChange('${k}',this.value)">${optionsHtml(state[k])}</select></div>`).join('')}</div></section>${ps.every(Boolean)&&new Set(ps.map(p=>p.id)).size===3?groupViewResult(ps):'<section class="card empty">서로 다른 세 캐릭터를 선택해 주세요.</section>'}`;}
function groupViewResult(ps){
 const r=trioDeepResult(ps);
 const roles=r.assignments.map((a,i)=>`<div class="analysis-role"><div class="analysis-role-index">${"ABC"[i]}</div><div><b>${esc(a.label)} · ${esc(a.name)} (${fixed(a.score)}점)</b><p>${esc(a.reason)}</p></div></div>`).join("");
 const stages=r.scenes.map((s,i)=>`<div class="memory-card stage-card"><b>${esc(s.title)}</b><p>${esc(s.text)}</p></div>`).join("");
 const pairs=r.pairDetails.map(p=>`<div class="tri-pair">
 <h4>${esc(p.name)}</h4><div class="sub">${esc(p.data)}</div>
 <div class="tri-direction"><b>${esc(p.first)} → ${esc(p.second)}</b><p>${esc(p.forward)}</p></div>
 <div class="tri-direction"><b>${esc(p.second)} → ${esc(p.first)}</b><p>${esc(p.backward)}</p></div>
 <div class="tri-third"><b>${esc(p.third.name)}의 제3자 영향 · ${esc(p.third.label)}</b><p>${esc(p.third.text)}</p></div>
 </div>`).join("");
 const chains=r.failureChains.map(x=>`<div class="memory-card"><b>${esc(x.title)}</b><p>${esc(x.text)}</p></div>`).join("");
 const fallback=r.fallback.map(x=>`<div class="memory-card"><b>${esc(x.title)}</b><p>${esc(x.text)}</p></div>`).join("");
 return `<section class="card result"><div class="report-eyebrow">NSD / THREE-WAY INTERFERENCE REPORT</div><h2>${esc(r.title)}</h2>
 <p class="report-sub">${ps.map(p=>esc(p.name)).join(" · ")} / 세 사람의 양방향 감각과 동행 구조</p>
 <div class="comparison-swatches three">${ps.map(p=>spectrumCard(p,true)).join("")}</div>
 ${lineSection(1,"세 사람이 공통으로 받아들이는 감각",esc(r.description))}
 <div class="section"><h3>02. 서로 다른 세 사람의 역할 배치</h3><p class="sub">모든 역할을 한 명에게 몰지 않고, 세 사람의 점수와 현장 선택을 함께 비교한 배치입니다.</p><div class="analysis-roles">${roles}</div></div>
 <div class="section"><h3>03. 세 사람이 만들 수 있는 시너지</h3>${sensoryCards(r.teamSynergies,"synergy")}</div>
 <div class="section"><h3>04. 세 사람이 서로에게 줄 수 있는 부담과 역효과</h3>${sensoryCards(r.teamDebuffs,"debuff")}</div>
 <div class="section"><h3>05. 여섯 단계의 동행 작전 기록</h3><p class="sub">서로 다른 반응이 만나면 같은 상황에서도 다음 행동이 달라질 수 있습니다.</p>${stages}</div>
 <div class="section"><h3>06. 세 쌍, 여섯 방향의 감각 간섭</h3><p class="sub">둘 사이의 영향에 제3자가 더해졌을 때 관계가 완충되거나 자극이 커질 수 있습니다.</p>${pairs}</div>
 <div class="section"><h3>07. 한 관계의 부담이 팀 전체로 번진다면</h3>${chains}</div>
 <div class="section"><h3>08. 한 사람이 이탈하거나 쉬어야 한다면</h3>${fallback}</div>
 ${lineSection(9,"임무 이후 남는 감각과 다음 동행",esc(r.recovery)+" "+esc(r.outlook))}
 <div class="section"><h3>10. 공통점과 감각 좌표</h3><div class="pills"><span class="pill">공통: ${esc(DOMAINS[r.common].short)}</span><span class="pill">차이: ${esc(DOMAINS[r.variable].short)}</span></div><div class="metrics">${DOMAINS.map((d,i)=>`<div class="metric"><b>${esc(d.short)}</b><div class="track"><i style="width:${mean(ps.map(p=>p.axes[i]))*10}%"></i></div><span>${fixed(Math.max(...ps.map(p=>p.axes[i]))-Math.min(...ps.map(p=>p.axes[i])))}Δ</span></div>`).join("")}</div></div>
 <div class="row actions"><button class="btn ghost" onclick="window.print()">그룹 결과 인쇄 · PDF</button><button class="btn soft" onclick="copyCurrentLink('group')">그룹 조합 링크 복사</button><button class="btn ghost" onclick="copyAIAnalysis('group')">AI 분석 패키지 복사</button></div></section>`;
}
function helpView(){return `<section class="card"><div class="kicker">FIELD MANUAL / SENSORY ANALYSIS</div><h2>이용 안내</h2><p>감각 간섭 보고서는 센티넬과 가이드가 현장에서 감각적 자극에 반응하고, 다른 사람의 상태에 개입하며, 이후 회복하는 방식을 살펴봅니다.</p><div class="divider"></div><h3>01. 캐릭터 설문</h3><p>공통 성향 16개·직군 전용 성향 24개(1~10점), 공통 상황 4개·직군 전용 상황 4개에 응답해 주세요. 직군을 바꾸면 전용 질문과 선택지가 바뀌며, 실제로 겪지 않은 장면은 해당 캐릭터의 예상 선택을 기준으로 답해 주세요.</p><h3>02. 개인 감각 보고서</h3><p>감각 수용, 자극 발산, 이상 징후 감지, 완충 개입, 경계 조율, 잔여감각 회복의 여섯 축을 읽습니다. 각 축의 높낮이와 조합에서 캐릭터의 반응 특성을 살펴볼 수 있습니다.</p><h3>03. 공개 기록</h3><p>공개에 동의한 캐릭터는 누구나 1인 결과를 볼 수 있습니다. 수정과 삭제는 등록한 사람만 수행할 수 있습니다. 원문 점수 응답은 공개하지 않습니다.</p><h3>04. 2인 간섭 분석</h3><p>둘을 선택하면 A→B, B→A의 영향이 각각 달라지는 이유를 해석합니다. 조합은 센티넬×센티넬, 센티넬×가이드, 가이드×가이드 모두 지원합니다.</p><h3>05. 3인 연계 분석</h3><p>세 사람에게서 나타나는 공통 감각, 징후 감지·완충·경계의 역할, 각각의 양방향 관계를 다룹니다.</p><h3>가이딩과 감각 간섭에 관하여</h3><p>가이딩은 가이드가 수행하는 별도의 행위로 가이딩 잔량을 소모합니다. 가이딩 잔량이 0이 되면 공명 고갈 상태가 됩니다. 감각 간섭 분석에서는 지원 전후의 반응, 감각적 피로, 회복 속도의 차이를 함께 살펴봅니다.</p><div class="notice">브라우저 기록을 삭제하면 익명 로그인으로 등록한 캐릭터를 수정할 권한을 잃을 수 있습니다. 중요한 기록은 <b>원본 백업</b>을 보관해 주세요.</div><div class="row" style="margin-top:22px"><button class="btn" onclick="switchTo('survey')">검사 시작하기</button><button class="btn ghost" onclick="switchTo('public')">공개 기록 열람</button></div></section>`;}
function exportProfiles(){const rows=state.owned.filter(p=>p.isPublic).map(safePublic);if(rows.length===0){toast('공개에 동의한 캐릭터가 없습니다. 개인용 원본은 별도로 백업할 수 있습니다.',true);return;}const payload={format:'NSD_SENSORY_V2_PUBLIC',createdAt:new Date().toISOString(),profiles:rows};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='NSD_감각간섭보고서_공개기록.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);toast(`${rows.length}개 캐릭터의 공개용 분석 프로필을 내보냈습니다. (원문 응답 제외)`);}
function exportEditable(){if(!state.owned.length){toast('백업할 내 기록이 없습니다.',true);return;}const payload={format:'NSD_SENSORY_V2_PRIVATE',createdAt:new Date().toISOString(),profiles:state.owned.map(p=>({...p,ownerUid:undefined}))};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='NSD_감각간섭보고서_내원본_비공개.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);toast('원본 응답까지 포함한 개인 백업을 저장했습니다. 타인에게 공유하지 마세요.');}
async function importProfiles(file){if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.profiles)||!['NSD_SENSORY_V2_PUBLIC','NSD_SENSORY_V2_PRIVATE'].includes(data.format))throw Error('감각 간섭 보고서에서 내보낸 JSON 파일만 가져올 수 있습니다.');
 const isPrivate=data.format==='NSD_SENSORY_V2_PRIVATE';const valid=data.profiles.filter(p=>p.name&&['센티넬','가이드'].includes(p.role)&&Array.isArray(p.axes)&&p.axes.length===6&&p.axes.every(v=>typeof v==='number'&&v>=1&&v<=10)&&Array.isArray(p.choices)&&p.choices.length===8&&p.choices.every(v=>Number.isInteger(v)&&v>=0&&v<4)&&Array.isArray(p.facets)&&p.facets.length===12&&p.version===LAB_VERSION&&(!isPrivate||(Array.isArray(p.answers)&&p.answers.length===40)));
 for(const p of valid){const id=idNew(),base={...safePublic(p),id,name:String(p.name).slice(0,40),imported:true};if(isPrivate){const record={...base,answers:p.answers.slice(),isPublic:false,imported:false};if(state.cloud)await state.cloud.save(record);state.owned.push(record);}else state.imported.push(base);}
 setLocal(STORAGE.owned,state.owned);setLocal(STORAGE.imported,state.imported);if(state.cloud)await refreshCloud();render();toast(`${valid.length}명 가져오기가 완료되었습니다. ${isPrivate?'개인 원본은 비공개로 복원했습니다.':'공유용 분석 프로필을 추가했습니다.'}`);
 }catch(err){toast('가져오기 실패: '+err.message,true);}}
async function copyCurrentLink(mode){const ids=mode==='pair'?[state.choiceA,state.choiceB]:[state.choiceA,state.choiceB,state.choiceC];const link=new URL(window.location.href);link.hash=`${mode}/${ids.join('/')}`;try{await navigator.clipboard.writeText(link.href);toast('조합 링크를 복사했습니다. 상대에게도 등록된 캐릭터만 표시됩니다.');}catch(_){prompt('이 링크를 복사해 주세요.',link.href);}}
function aiScorecardProfile(p, label) {
  const sig = signature(p);
  const rows = [
    `### ${label}: ${p.name} (${p.role})`,
    `감각 서명: ${sig.name} | ${sig.subtitle}`,
    `대표 감각 축: ${sig.primary} | 상대적으로 낮은 감각 축: ${sig.low}`,
    "",
    "6축 점수 (1~10점)",
    ...DOMAINS.map((d, i) => `- ${d.short}: ${fixed(p.axes[i], 2)}점 | 낮은 방향 '${d.lo}' ↔ 높은 방향 '${d.hi}'`),
  ];
  if (Array.isArray(p.facets) && p.facets.length === 12) {
    rows.push("", "세부 점수 (1~10점; 같은 축 질문을 둘로 나눈 문항군 평균)");
    DOMAINS.forEach((d, i) => rows.push(`- ${d.short}: 문항군 1 ${fixed(p.facets[i * 2], 2)}점 / 문항군 2 ${fixed(p.facets[i * 2 + 1], 2)}점`));
  }
  rows.push("", "8개 현장 상황의 선택과 근거");
  getScenarios(p.role).forEach((scene, i) => {
    const choice = Number(p.choices[i]);
    const option = scene.opts?.[choice];
    rows.push(`${i + 1}. ${scene.title}`);
    rows.push(`   상황: ${scene.story}`);
    rows.push(`   선택 ${"ABCD"[choice] || "-"}: ${option?.[0] || "기록 없음"}`);
    if (option?.[2]) rows.push(`   반응 단서: ${option[2]}`);
  });
  return rows.join("\n");
}

function buildAIScorecard(mode, id) {
  let members;
  if (mode === "individual") {
    const p = byId(id);
    members = p ? [p] : [];
  } else if (mode === "pair") {
    members = [byId(state.choiceA), byId(state.choiceB)];
  } else if (mode === "group") {
    members = [byId(state.choiceA), byId(state.choiceB), byId(state.choiceC)];
  } else {
    return "";
  }
  if (members.some(p => !p) || new Set(members.map(p => p.id)).size !== members.length || members.length !== ({individual:1,pair:2,group:3}[mode])) return "";
  const titles = {individual:"1인 감각 서명 분석",pair:"2인 감각 간섭 분석",group:"3인 연계 분석"};
  const intro = [
    `# NSD 감각 간섭 보고서 — ${titles[mode]}용 AI 분석 패키지`,
    "아래 자료는 캐릭터 설문으로 계산한 점수표와 해석 기준입니다. 자료만으로 세부 성향을 추론해 주세요.",
    "",
    "## 1. NSD 세계관과 검사 배경",
    "- 센티넬은 감각 자극과 부하도 상승, 폭주 전조에 대응합니다.",
    "- 가이드는 가이딩을 수행하며 '가이딩 잔량'을 소모합니다. 가이딩 잔량이 0이 되면 '공명 고갈' 상태가 됩니다.",
    "- 가이딩은 모든 두 사람 사이에서 자동으로 일어나는 연결이 아닙니다. 센티넬·가이드 사이에 상시 정신 링크나 이를 끊는 행위가 있다고 가정하지 마세요.",
    "- 감각 간섭은 동행하는 인물들이 주고받는 자극, 완충, 경계, 회복 방식에 대한 분석 표현입니다. 센티넬끼리 또는 가이드끼리도 서로의 반응을 비교할 수 있습니다.",
    "",
    "## 2. 설문 구성과 점수 해석",
    "- 캐릭터마다 공통 10점 척도 16문항 + 직군 전용 10점 척도 24문항 + 공통 상황 4개 + 직군 전용 상황 4개, 총 48문항에 응답합니다.",
    "- 센티넬/가이드는 전용 질문의 내용이 다르지만, 6축은 같은 기준으로 환산하여 비교합니다.",
    "- 6축 점수는 해당 축의 척도 응답(역채점 반영) 평균에 상황 선택의 소규모 보정을 더한 1~10점 값입니다.",
    "- 세부 점수 12개는 각 축의 질문을 두 문항군으로 나눈 평균입니다. 별개의 독립적인 능력 점수가 아닙니다.",
    "- 점수가 높다고 반드시 좋은 능력이나 성격을 뜻하지 않습니다. 높음/낮음은 그 축의 두 반응 방향을 나타냅니다.",
    "- 아래 상황 선택은 실제 응답자가 선택한 행동입니다. 상황의 맥락과 선택 이유의 단서를 우선 참고하세요.",
    "- 이 패키지에는 원본 40문항의 개별 점수는 포함하지 않습니다. 제시되지 않은 개별 응답이나 성격을 확정하지 마세요.",
    "",
    "6개 감각 축의 정의",
    ...DOMAINS.map((d, i) => `${i + 1}. ${d.short}: ${d.desc} | 낮은 방향: ${d.lo} / 높은 방향: ${d.hi}`),
    "",
    "## 3. 캐릭터별 기록",
    ...members.map((p, i) => aiScorecardProfile(p, String.fromCharCode(65 + i))),
    ""
  ];
  if (mode === "individual") {
    const d=individualDepthReport(members[0]);
    intro.push("## 4. 개인 심화 해석", 
      ...[["감각 축의 교차",d.crosses],["문항군별 반응 차이",d.facets],["상황 선택의 연쇄",d.decisions],["직군별 위기 대응",d.roleArc],["오해하기 쉬운 신호",d.misreads],["동행 시 의사소통",d.cooperation],["서사 갈림길",d.stories]]
        .flatMap(([title,items])=>["### "+title,...items.map(x=>"- "+x.title+": "+x.text)]),
      "");
  }
  if (mode === "pair") {
    const [a,b] = members, r=pairDeepResult(a,b);
    intro.push(
      "## 4. 두 사람의 방향별 계산 결과",
      `관계 유형: ${r.title} (관계 원형 ${r.typeId+1}/12, 반응 결 ${r.postureId+1}/8)`,
      `가장 비슷한 감각 축: ${DOMAINS[r.common].short}`,
      `가장 다른 감각 축: ${DOMAINS[r.difference].short}`,
      `${a.name} → ${b.name}: 자극 ${r.fromAToB.stimulation}, 완충 ${r.fromAToB.buffer}, 차이 ${r.fromAToB.delta>=0?"+":""}${r.fromAToB.delta}`,
      `${b.name} → ${a.name}: 자극 ${r.fromBToA.stimulation}, 완충 ${r.fromBToA.buffer}, 차이 ${r.fromBToA.delta>=0?"+":""}${r.fromBToA.delta}`,
      "두 방향은 별도 계산합니다. 자극은 한 사람이 상대에게 전하는 표현·감각 반응이 상대의 수용성과 만날 때의 강도, 완충은 위기 대응과 징후 파악·경계 조율이 상대에게 제공하는 조절 여지입니다.",
      "자극·완충 수치는 각 인물의 6축 점수에 기반한 비교 지표(5~95 범위)이며 실제 게임 부하도 증감값이 아닙니다.", "두 사람의 주요 협력·갈등 해석:",`- 첫 반응: ${r.opening}`,`- 위험 신호 공유: ${r.signal}`,`- 지원 방식: ${r.supportTiming}`,`- 오해와 경계: ${r.misreading} ${r.decision}`,`- 회복: ${r.recovery}`, "방향별 상세 해석:",...r.directional.flatMap(x=>[`### ${x.src} → ${x.dst}`, ...x.parts.map(p=>`- ${p.label}: ${p.paragraph}`)]), "시너지 후보:",...r.synergies.map(x=>`- ${x.title}: ${x.text}`), "역효과 후보:",...r.debuffs.map(x=>`- ${x.title}: ${x.text}`), "상황별 장면:",...r.scenes.map(x=>`- ${x.title}: ${x.text}`),
      ""
    );
  }
  if (mode === "group") {
    const t=trioDeepResult(members);
    const pairs=[[members[0],members[1]],[members[0],members[2]],[members[1],members[2]]];
    intro.push("## 4. 세 사람의 비교 결과",
      `세 사람이 가장 비슷한 감각 축: ${DOMAINS[t.common].short}`,
      `세 사람의 차이가 가장 큰 감각 축: ${DOMAINS[t.variable].short}`,
      "아래 세 쌍은 서로 다른 방향으로 자극·완충을 계산합니다.",
      ...pairs.flatMap(([a,b])=>{
        const ab=interaction(a,b), ba=interaction(b,a), r=pairResult(a,b);
        return [`- ${a.name} ↔ ${b.name} | 관계 유형: ${r.title}`,
          `  ${a.name} → ${b.name}: 자극 ${ab.stimulation}, 완충 ${ab.buffer}, 차이 ${ab.delta>=0?"+":""}${ab.delta}`,
          `  ${b.name} → ${a.name}: 자극 ${ba.stimulation}, 완충 ${ba.buffer}, 차이 ${ba.delta>=0?"+":""}${ba.delta}`];
      }),
      "자극·완충은 각 인물의 6축에서 산출한 비교 지표(5~95 범위)입니다. 셋이 함께할 때의 효과를 단순 합산하지 마세요.",
      "세 사람의 역할 배치 제안 (감지·완충·경계 조율 담당은 각각 다른 인물):", ...t.assignments.map(x=>`- ${x.label}: ${x.name} (${fixed(x.score,2)}점) | ${x.action}`), "세 사람이 함께 움직이는 과정:",...t.scenes.map(x=>`- ${x.title}: ${x.text}`), "한 대원이 쉬어야 하는 상황:",...t.fallback.map(x=>`- ${x.title}: ${x.text}`), "이 역할 분담은 세 사람의 상대적인 특징을 기반으로 만든 협력 시안입니다.", "팀 전체의 시너지:",...t.teamSynergies.map(x=>`- ${x.title}: ${x.text}`), "팀 전체의 역효과:",...t.teamDebuffs.map(x=>`- ${x.title}: ${x.text}`), "세 관계의 여섯 방향과 제3자의 영향:",...t.pairDetails.flatMap(x=>[`- ${x.name}: ${x.data}`,`  ${x.first} → ${x.second}: ${x.forward}`,`  ${x.second} → ${x.first}: ${x.backward}`,`  ${x.third.name}의 개입: ${x.third.text}`]), "관계의 부담이 확산되는 상황:",...t.failureChains.map(x=>`- ${x.title}: ${x.text}`),
      "");
  }
  const prompts = [
    "## 5. AI에게 요청하는 분석",
    "결과물을 자연스러운 한국어 존댓말 보고서로 작성해 주세요. 항목별로 수치와 상황 선택을 근거로 제시하되, 결과 문장에 반복적인 면책·제작자 설명을 넣지 마세요.",
    "설정에 없는 정신적 링크, 능력, 공식 부하도 수치 변화, 사건, 인물 관계(연애·혈연 등)를 멋대로 만들어 확정하지 마세요. 불확실한 부분은 가능성으로 표현해 주세요.",
    "성향을 좋음/나쁨으로 단순 순위화하지 말고, 강점과 약점이 상황에 따라 어떻게 뒤바뀌는지 자세히 풀어 주세요."
  ];
  if (mode === "individual") prompts.push("특히 감각 수용·표현·위기 반응·지원 수용/제공·회복을 연결하여 개인의 행동 패턴과 예상되는 갈등·성장 지점을 분석해 주세요.");
  if (mode === "pair") prompts.push("특히 A→B와 B→A를 분리하여 자극과 완충의 비대칭성, 오해하기 쉬운 순간, 효과적인 협력과 충돌 상황, 관계의 변화를 구체적으로 설명해 주세요.");
  if (mode === "group") prompts.push("특히 세 쌍의 방향별 차이와 세 사람 전체의 역할 분담, 한 사람이 빠졌을 때 변화할 수 있는 역학, 함께 위기를 맞을 때의 강점과 취약점을 분석해 주세요.");
  return [...intro,...prompts].join("\n");
}

async function copyAIAnalysis(mode, id) {
  const text=buildAIScorecard(mode,id);
  if(!text) {toast("분석할 캐릭터를 먼저 선택해 주세요.",true);return;}
  try {
    if(!navigator.clipboard?.writeText) throw Error("clipboard unavailable");
    await navigator.clipboard.writeText(text);
    toast("AI 분석 패키지 복사 완료! AI 채팅에 붙여넣어 보세요.");
  } catch (_) {
    try {
      const ta=document.createElement("textarea");
      ta.value=text;ta.style.cssText="position:fixed;left:-9999px;top:0;";
      document.body.appendChild(ta);ta.focus();ta.select();
      const ok=document.execCommand("copy");
      ta.remove();
      if(!ok) throw Error("copy failed");
      toast("AI 분석 패키지 복사 완료! AI 채팅에 붙여넣어 보세요.");
    } catch (_) {
      prompt("아래 AI 분석용 점수표를 전체 복사해 주세요.",text);
    }
  }
}

function handleUrlHash(){const parts=location.hash.slice(1).split('/');if(parts[0]==='pair'&&parts.length===3){state.choiceA=parts[1];state.choiceB=parts[2];state.tab='pair';}else if(parts[0]==='group'&&parts.length===4){state.choiceA=parts[1];state.choiceB=parts[2];state.choiceC=parts[3];state.tab='group';}}
// Optional Firebase: activation requires firebase-config.js and cloud initialization.
async function initializeFirebase(){const cfg=window.NSD_SENSORY_FIREBASE_CONFIG || window.NSD_FIREBASE_CONFIG;if(!cfg?.apiKey||!cfg?.projectId)return;state.cloudState='connecting';try{
 const ver='12.19.0';const [appLib,authLib,fireLib]=await Promise.all([import(`https://www.gstatic.com/firebasejs/${ver}/firebase-app.js`),import(`https://www.gstatic.com/firebasejs/${ver}/firebase-auth.js`),import(`https://www.gstatic.com/firebasejs/${ver}/firebase-firestore.js`)]);
 const app=appLib.initializeApp(cfg),auth=authLib.getAuth(app),db=fireLib.getFirestore(app);const cred=await authLib.signInAnonymously(auth),uid=cred.user.uid;
 const ownRef=id=>fireLib.doc(db,'sensoryUsers',uid,'records',id),pubRef=id=>fireLib.doc(db,'sensoryPublicProfiles',id);
 state.cloud={
  async save(p){const batch=fireLib.writeBatch(db);batch.set(ownRef(p.id),{...p,ownerUid:uid});if(p.isPublic)batch.set(pubRef(p.id),{...safePublic(p),ownerUid:uid});else if(state.owned.find(x=>x.id===p.id)?.isPublic)batch.delete(pubRef(p.id));await batch.commit();},
  async remove(p){const batch=fireLib.writeBatch(db);batch.delete(ownRef(p.id));if(p.isPublic)batch.delete(pubRef(p.id));await batch.commit();},
  async refresh(){const own=await fireLib.getDocs(fireLib.collection(db,'sensoryUsers',uid,'records'));const shared=await fireLib.getDocs(fireLib.query(fireLib.collection(db,'sensoryPublicProfiles'),fireLib.where('isPublic','==',true)));const fromServer=own.docs.map(x=>({...x.data(),id:x.id,localOnly:false})).filter(validProfile);const offlineOnly=state.owned.filter(p=>p.localOnly&&!fromServer.some(s=>s.id===p.id));state.owned=[...fromServer,...offlineOnly];state.directory=shared.docs.map(x=>({...x.data(),id:x.id})).filter(p=>validProfile(p)&&!isBuiltInSample(p));setLocal(STORAGE.owned,state.owned);}
 };state.cloudState='online';await state.cloud.refresh();render();toast('감각 간섭 데이터베이스 연결 완료!');
 }catch(err){state.cloud=null;state.cloudState='error';render();toast('Firebase 연결 실패: '+err.message,true);}}
async function refreshCloud(show=false){if(!state.cloud){if(show)toast('공유 목록이 아직 연결되지 않았습니다.',true);return;}try{await state.cloud.refresh();render();if(show)toast('공개 목록 새로고침 완료!');}catch(err){toast(err.message,true);}}
function init(){state.owned=getLocal(STORAGE.owned,[]).filter(p=>validProfile(p)&&p.facets&&!isBuiltInSample(p));state.imported=getLocal(STORAGE.imported,[]).filter(p=>validProfile(p)&&!isBuiltInSample(p));handleUrlHash();render();initializeFirebase();}
init();
