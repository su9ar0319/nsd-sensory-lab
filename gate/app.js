'use strict';
const gateState={tab:"home",step:0,answers:Array(48).fill(0),choices:Array(16).fill(-1),name:"",role:"센티넬",isPublic:false,editId:null,selected:"",own:[],imported:[],directory:[],pairIds:["",""],trioIds:["","",""],busy:false,cloud:null,cloudState:"local"};
function gateEsc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function gateLocal(k,fallback){try{return JSON.parse(localStorage.getItem(k))||fallback}catch(_){return fallback}}


/** Firestore does not accept arrays nested directly inside arrays.
 * Keep [common, role] pairs in memory; encode each pair as a map on the wire.
 */
function gateFirestoreEncode(p){
 return {...p,facets:(p.facets||[]).map(pair=>Array.isArray(pair)?{first:Number(pair[0]),second:Number(pair[1])}:pair)};
}
function gateFirestoreDecode(p){
 return {...p,facets:(p.facets||[]).map(pair=>Array.isArray(pair)?pair:[Number(pair.first),Number(pair.second)])};
}

function gatePersist(){localStorage.setItem("nsd_gate_v1_own",JSON.stringify(gateState.own));localStorage.setItem("nsd_gate_v1_imported",JSON.stringify(gateState.imported))}

function gateId(){return "g-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,11)}

function gatePublicRecord(p){return {id:p.id,name:p.name,role:p.role,version:p.version,axes:p.axes,facets:p.facets,choices:p.choices,isPublic:!!p.isPublic,updatedAt:p.updatedAt}}

function gateValid(p){return p&&p.version===GATE_VERSION&&typeof p.id==="string"&&/^[\w.-]{4,90}$/.test(p.id)&&typeof p.name==="string"&&p.name.length>0&&p.name.length<=40&&["센티넬","가이드"].includes(p.role)&&Array.isArray(p.axes)&&p.axes.length===12&&p.axes.every(v=>Number.isFinite(v)&&v>=1&&v<=10)&&Array.isArray(p.choices)&&p.choices.length===16&&p.choices.every(v=>Number.isInteger(v)&&v>=0&&v<4)&&Array.isArray(p.facets)&&p.facets.length===12}

function gateProfiles(){const m=new Map();[...gateState.directory,...gateState.imported,...gateState.own].filter(gateValid).forEach(p=>m.set(p.id,p));return [...m.values()].sort((a,b)=>a.name.localeCompare(b.name,"ko"))}

function gateGet(id){return gateProfiles().find(p=>p.id===id)}

function gateNotify(msg,bad=false){const el=document.createElement("div");el.className="toast "+(bad?"bad":"");el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),4200)}

function gateNav(){const items=[["home","연구 안내"],["survey","64문항 검사"],["mine","내 기록"],["public","공개 기록"],["pair","2인 전술 분석"],["trio","3인 작전 시뮬레이션"]];document.getElementById("nav").innerHTML=items.map(([v,k])=>`<button type="button" class="${gateState.tab===v?"active":""}" onclick="gateSwitch('${v}')">${k}</button>`).join("")}

function gateSwitch(tab){gateState.tab=tab;gateRender();window.scrollTo({top:0,behavior:"smooth"})}

function gateRender(){
 gateNav();
 const main=document.getElementById("main");
 main.innerHTML=gateState.tab==="survey"?gateSurvey():gateState.tab==="mine"?gateLibrary():gateState.tab==="public"?gatePublicView():gateState.tab==="pair"?gateRenderPair():gateState.tab==="trio"?gateRenderTrio():gateHome();
}

function gateHome(){
 const count=gateProfiles().length;
 return `<section class="surface intro">
 <div class="eyebrow">NSD / GATE OPERATION COMPATIBILITY LAB</div><div class="intro-grid"><div><h2>같은 게이트, 다른 판단.</h2><p>누가 먼저 움직이고, 누가 위험을 발견하며, 누가 마지막까지 동료를 지킬까요? 캐릭터의 전술 선택을 기반으로 동행의 가능성과 위험을 분석합니다.</p><div class="row"><button class="btn primary" onclick="gateSwitch('survey')">64문항 검사 시작</button><button class="btn light" onclick="gateSwitch('trio')">3인 작전 시뮬레이션</button></div></div><div class="intro-figure"><span>GATE / OPERATION</span><strong>03</strong><small>TACTICAL COMPATIBILITY RECORD</small></div></div>
 <div class="quick-stats"><div><b>64</b><span>설문 문항</span></div><div><b>12</b><span>전술 분석 축</span></div><div><b>7</b><span>3인 작전 단계</span></div><div><b>${count}</b><span>열람 가능 기록</span></div></div></section>
 <section class="surface"><div class="eyebrow">RESEARCH SCOPE</div><h2>세 단계로 깊어지는 작전 기록</h2><div class="feature-grid"><article><span>01 / INDIVIDUAL</span><h3>개인 전술 프로파일</h3><p>주력 전술, 취약한 판단, 자원 관리, 철수 기준, 10개 심층 해설까지 한 사람의 작전 성향을 읽습니다.</p></article><article><span>02 / PAIR</span><h3>양방향 전술 적합성</h3><p>서로 주는 영향은 각기 다릅니다. 정찰·보고·협업의 시너지와 충돌을 방향별로 분석합니다.</p></article><article><span>03 / TRIO</span><h3>7단계 게이트 시뮬레이션</h3><p>서로 다른 세 사람이 역할을 나누어 입장합니다. 앞 단계의 위험과 자원 변화가 다음 단계까지 이어집니다.</p></article></div></section>
 <section class="surface slim"><div class="row between"><div><h3>작전 데이터 보관</h3><p class="muted">${gateState.cloudState==="online"?"온라인 공유 저장소 연결됨":gateState.cloudState==="connecting"?"온라인 공유 저장소 연결 확인 중": "브라우저에 로컬 저장 · 온라인 공개 기록은 연결 상태를 확인해 주세요."}</p></div><button class="btn light" onclick="gateSwitch('mine')">내 기록 확인</button></div><p class="fine">대원마다 서로 다른 판단과 동행 방식을 비교하고, 작전에 필요한 역할과 위험 대응을 연구합니다.</p></section>`;
}

function gateCount(){return gateState.answers.filter(x=>x>=1&&x<=10).length+gateState.choices.filter(x=>x>=0&&x<4).length}

function gateSurvey(){
 const step=gateState.step,sc=gateScenarios(gateState.role),qs=gateQuestions(gateState.role),n=gateCount(),grading=step<6;
 const start=grading?step*8:(step-6)*8;
 const stepTitle=grading?`전술 성향 ${start+1}~${start+8}`:`상황 판단 ${start+1}~${start+8}`;
 return `<section class="surface survey-head"><div class="row between"><div><div class="eyebrow">OPERATIONAL SURVEY · ${String(step+1).padStart(2,"0")} / 08</div><h2>전술 적합성 조사</h2><p class="muted">실제 본인이 아니라 캐릭터라면 어떻게 대응할지 선택해 주세요. 센티넬과 가이드의 전용 장면은 서로 다릅니다.</p></div><div class="progress-badge" id="progress">${n} / 64</div></div><div class="progress-track"><i style="width:${(n/64)*100}%"></i></div><div class="two-inputs"><label>캐릭터 이름<input id="gateName" type="text" maxlength="40" value="${gateEsc(gateState.name)}" placeholder="캐릭터 이름" oninput="gateChangeName(this.value)"></label><label>직군<select id="gateRole" onchange="gateChangeRole(this.value)"><option value="센티넬" ${gateState.role==="센티넬"?"selected":""}>센티넬</option><option value="가이드" ${gateState.role==="가이드"?"selected":""}>가이드</option></select></label></div><label class="check"><input type="checkbox" ${gateState.isPublic?"checked":""} onchange="gateState.isPublic=this.checked"><span>다른 참여자가 내 캐릭터의 <b>1인·2인·3인 분석 프로필을 열람</b>할 수 있도록 공개 요청 <small>실제 온라인 공개는 서버 저장 연결이 가능한 경우에만 이루어집니다.</small></span></label></section>
 <section class="surface"><div class="eyebrow">${grading?"TACTICAL AXES":"FIELD SCENARIOS"}</div><h2>${stepTitle}</h2><p class="muted">${grading?"1점 = 전혀 그렇지 않다 / 10점 = 매우 그렇다. 높고 낮음이 우열을 의미하지는 않습니다.":"각 장면에서 해당 캐릭터가 가장 먼저 택할 행동 하나를 고르세요."}</p>
 ${grading?qs.slice(start,start+8).map((q,j)=>`<div class="question"><div><span class="q-no">Q${String(start+j+1).padStart(2,"0")}</span><span class="q-axis">${gateEsc(GATE_AXES[q.axis].short)}</span><p>${gateEsc(q.text)}</p></div><select aria-label="문항 ${start+j+1} 점수" onchange="gateRate(${start+j},this.value)"><option value="">점수 선택</option>${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${gateState.answers[start+j]===i+1?"selected":""}>${i+1}점</option>`).join("")}</select></div>`).join(""):
 sc.slice(start,start+8).map((scene,j)=>{const idx=start+j;return `<div class="scenario"><span class="q-no">S${String(idx+1).padStart(2,"0")}</span><h3>${gateEsc(scene.title)}</h3><p>${gateEsc(scene.story)}</p><div class="options">${scene.opts.map((o,k)=>`<label class="option"><input type="radio" name="scene${idx}" value="${k}" ${gateState.choices[idx]===k?"checked":""} onchange="gateSetChoice(${idx},${k})"><span>${String.fromCharCode(65+k)}. ${gateEsc(o.label)}</span></label>`).join("")}</div></div>`}).join("")}
 <div class="row between survey-actions"><button class="btn light" ${step===0?"disabled":""} onclick="gateMove(-1)">이전</button><span class="fine">${step+1} / 8</span><button class="btn primary" id="saveBtn" ${step===7&&(n!==64||!gateState.name.trim())?"disabled":""} onclick="${step===7?"gateSave()":"gateMove(1)"}">${step===7?"결과 저장 및 분석":"다음 단계"}</button></div></section>`;
}

function gateChangeName(v){gateState.name=v;gateProgress()}

function gateChangeRole(v){
 if(gateState.role!==v){gateState.role=v;gateState.answers=gateState.answers.map((x,i)=>i%4<2?x:0);gateState.choices=gateState.choices.map((x,i)=>i<8?x:-1);gateState.step=0;gateRender()}
}

function gateRate(i,v){gateState.answers[i]=v?Number(v):0;gateProgress()}

function gateSetChoice(i,v){gateState.choices[i]=Number(v);gateProgress()}

function gateProgress(){const el=document.getElementById("progress");if(el)el.textContent=gateCount()+" / 64";const el2=document.querySelector(".progress-track i");if(el2)el2.style.width=(gateCount()/64*100)+"%";const btn=document.getElementById("saveBtn");if(btn&&gateState.step===7)btn.disabled=gateCount()!==64||!gateState.name.trim();}

function gateMove(n){gateState.step=gateClamp(gateState.step+n,0,7);gateRender();window.scrollTo({top:0,behavior:"smooth"})}

async function gateSave(){
 if(gateState.busy)return;
 if(gateCount()!==64||!gateState.name.trim()){gateNotify("64개 문항과 캐릭터 이름을 모두 입력해 주세요.",true);return}
 gateState.busy=true;
 try{
  const derived=gateScoring(gateState.answers,gateState.choices,gateState.role);
  const old=gateState.own.find(p=>p.id===gateState.editId);
  const profile={...derived,id:old?.id||gateId(),name:gateState.name.trim(),isPublic:gateState.isPublic,updatedAt:new Date().toISOString(),localOnly:true};
  gateState.own=[...gateState.own.filter(p=>p.id!==profile.id),profile];
  gatePersist();gateState.selected=profile.id;gateState.editId=null;
  if(gateState.cloud){try{await gateState.cloud.save(profile);profile.localOnly=false;gatePersist();await gateCloudRefresh(false)}catch(e){gateNotify("로컬 저장 완료 · 온라인 등록 실패: "+e.message,true)}}
  gateState.tab="mine";gateRender();window.scrollTo({top:0,behavior:"smooth"});gateNotify(profile.isPublic&&!gateState.cloud?"기록은 로컬에 저장됐어요. 온라인 공개는 서버 연결 후 등록할 수 있습니다.":"캐릭터 전술 기록을 저장했습니다!",profile.isPublic&&!gateState.cloud);
 }catch(e){gateNotify("결과 생성 실패: "+e.message,true)}finally{gateState.busy=false;gateProgress()}
}

function gateNew(){
 if(gateCount()>0&&!confirm("기존 미저장 응답을 초기화하고 새 검사를 시작할까요?"))return;
 gateState.editId=null;gateState.name="";gateState.role="센티넬";gateState.isPublic=false;gateState.answers=Array(48).fill(0);gateState.choices=Array(16).fill(-1);gateState.step=0;gateSwitch("survey");
}
function gateEdit(id){
 const p=gateState.own.find(x=>x.id===id);if(!p||!Array.isArray(p.answers)){gateNotify("수정 가능한 원본 설문이 없습니다.",true);return}
 gateState.editId=p.id;gateState.name=p.name;gateState.role=p.role;gateState.isPublic=!!p.isPublic;gateState.answers=p.answers.slice();gateState.choices=p.choices.slice();gateState.step=0;gateSwitch("survey");
}

async function gateRemove(id){
 const p=gateState.own.find(x=>x.id===id);if(!p||!confirm(`${p.name}의 기록을 삭제할까요?`))return;
 try{if(gateState.cloud&&!p.localOnly)await gateState.cloud.remove(p);gateState.own=gateState.own.filter(x=>x.id!==id);gatePersist();if(gateState.selected===id)gateState.selected="";gateRender();gateNotify("기록을 삭제했습니다.")}catch(e){gateNotify("삭제 실패: "+e.message,true)}
}

function gateProfileList(profiles,kind){
 if(!profiles.length)return `<div class="empty">표시할 캐릭터가 아직 없어요.</div>`;
 return `<div class="profile-list">${profiles.map(p=>`<div class="profile-row"><div><b>${gateEsc(p.name)}</b><span>${gateEsc(p.role)} · ${gateEsc(gateSignature(p).name)}</span></div><div class="row"><button class="btn light" onclick="gateChoose('${p.id}','${kind}')">1인 보기</button>${kind==="own"?`<button class="btn small" onclick="gateEdit('${p.id}')">수정</button>${p.localOnly?`<button class="btn small" onclick="gateV7RetrySave('${p.id}')">Firebase 저장 재시도</button>`:""}<button class="btn small danger" onclick="gateRemove('${p.id}')">삭제</button>`:""}</div></div>`).join("")}</div>`;
}

function gateChoose(id,kind){if(kind==="public"){if(!gateState.directory.some(p=>p.id===id&&gateValid(p)))return;gateState.publicSelected=id}else{gateState.selected=id}gateRender();document.getElementById("gatePersonal")?.scrollIntoView({behavior:"smooth",block:"start"})}

function gateLibrary(){
 const selected=gateGet(gateState.selected),own=gateState.own.filter(gateValid),imported=gateState.imported.filter(gateValid);
 return `<section class="surface"><div class="row between"><div><div class="eyebrow">PRIVATE ARCHIVE</div><h2>내 전술 기록</h2><p class="muted">브라우저 저장 기록 ${own.length}개 · 가져온 프로필 ${imported.length}개</p></div><div class="row"><button class="btn light" onclick="gateExport()">JSON 백업</button><label class="btn light file-pick">JSON 가져오기<input type="file" accept=".json,application/json" onchange="gateImport(event)"></label><button class="btn primary" onclick="gateNew()">새 검사</button></div></div>${gateProfileList(own,"own")}${imported.length?`<h3 class="mt">가져온 공유용 프로필</h3>${gateProfileList(imported,"imported")}`:""}</section>${selected?gateRenderSolo(selected):""}`;
}

function gateBar(label,value){
 return `<div class="metric"><div><b>${gateEsc(label)}</b><strong>${gateFixed(value)}</strong></div><div class="bar"><i style="width:${gateClamp(value*10)}%"></i></div></div>`;
}

function gateRenderSolo(p){
 const r=gateSolo(p),s=r.signature;
 return `<section class="surface report" id="gatePersonal"><div class="eyebrow">INDIVIDUAL TACTICAL REPORT</div><h2>${gateEsc(p.name)}의 게이트 작전 프로파일</h2><p class="muted">${gateEsc(p.role)} · 전술 서명 ${gateEsc(s.code)}</p>
 <div class="report-cover"><div><span class="cover-tag">TACTICAL SIGNATURE</span><h3>${gateEsc(s.name)}</h3><p>${gateEsc(s.family)} 계열 · ${gateEsc(s.mode)}</p><small>${gateEsc(GATE_AXES[s.primary].name)} × ${gateEsc(GATE_AXES[s.secondary].name)}</small></div><div class="cover-number">${String(s.primary+1).padStart(2,"0")}</div></div>
 <div class="chapter"><span>PART 01 / QUICK READ</span><h3>전술 프로필 한눈에 읽기</h3><p>각 행동의 기본 성향을 빠르게 살펴보는 요약 분석입니다.</p></div><div class="analysis-grid">${r.quick.map((o,i)=>`<article class="analysis-card"><span class="label">${String(i+1).padStart(2,"0")} / QUICK READ</span><h4>${gateEsc(o.title)}</h4><p>${gateEsc(o.text)}</p></article>`).join("")}</div>
 <div class="chapter"><span>PART 02 / DEEP INTERPRETATION</span><h3>심층 전술 해석</h3><p>강점과 위험, 직군 자원 및 상황 선택의 충돌을 이어 읽습니다.</p></div><div class="analysis-grid">${r.deep.map(o=>`<article class="analysis-card deep"><h4>${gateEsc(o.title)}</h4><p>${gateEsc(o.text)}</p></article>`).join("")}</div>
 <div class="chapter"><span>PART 03 / TWELVE TACTICAL AXES</span><h3>12개 전술 축의 개별 해석</h3><p>같은 축이라도 점수 구간과 성향에 따라 다른 해설이 적용됩니다.</p></div><div class="analysis-grid">${r.axisReadings.map((o,i)=>`<article class="analysis-card deep"><span class="label">AXIS ${String(i+1).padStart(2,"0")} · ${gateFixed(o.score)} / 10</span><h4>${gateEsc(o.title)}</h4><p>${gateEsc(o.text)}</p></article>`).join("")}</div><div class="chapter"><span>PART 04 / FIELD DECISIONS</span><h3>상황 선택에서 드러난 행동</h3><p>실제 설문 장면을 연결해 판단의 차이를 확인합니다.</p></div><div class="analysis-grid">${r.scenarios.map((o,i)=>`<article class="analysis-card"><span class="label">SCENE ${String(i+1).padStart(2,"0")}</span><h4>${gateEsc(o.title)}</h4><div class="choice-quote">${gateEsc(o.choice)}</div><p>${gateEsc(o.text)}</p></article>`).join("")}</div>
 <div class="chapter"><span>TACTICAL AXES / 12</span><h3>열두 개의 전술 좌표</h3></div><div class="metric-grid">${GATE_AXES.map((axis,i)=>gateBar(axis.name,p.axes[i])).join("")}</div>
 <div class="row actions"><button class="btn primary" onclick="gateFromSolo('${p.id}','pair')">2인 동행 분석</button><button class="btn light" onclick="gateFromSolo('${p.id}','trio')">3인 작전 배치</button><button class="btn light" onclick="gateShare('${p.id}')">공유 링크</button><button class="btn light" onclick="gateCopyAI('solo','${p.id}')">AI 분석 패키지 복사</button><button class="btn light" onclick="window.print()">인쇄 · PDF</button></div></section>`;
}

function gateFromSolo(id,mode){gateState.selected=id;if(mode==="pair")gateState.pairIds=[id,gateProfiles().find(p=>p.id!==id)?.id||""];else gateState.trioIds=[id,...gateProfiles().filter(p=>p.id!==id).slice(0,2).map(p=>p.id)];gateSwitch(mode)}

function gateSelect(label,idx,current,method){
 return `<label class="field">${gateEsc(label)}<select onchange="${method}(${idx},this.value)"><option value="">선택</option>${gateProfiles().map(p=>`<option value="${p.id}" ${current===p.id?"selected":""}>${gateEsc(p.name)} / ${gateEsc(p.role)}</option>`).join("")}</select></label>`;
}

function gatePairChange(i,id){gateState.pairIds[i]=id;gateRender()}

function gateTrioChange(i,id){gateState.trioIds[i]=id;gateRender()}

function gateDirectionalView(d){
 return `<article class="direction"><div class="row between"><h4>${gateEsc(d.from)} → ${gateEsc(d.to)}</h4><span class="tag">${gateEsc(d.type)}</span></div><div class="twoval"><div><span>행동 부담 지표</span><b>${d.pressure}</b></div><div><span>지원 지표</span><b>${d.support}</b></div></div>${d.sections.map(o=>`<div class="direction-part"><b>${gateEsc(o.title)}</b><p>${gateEsc(o.text)}</p></div>`).join("")}</article>`;
}

function gateAnalyticCards(cards,type){
 return `<div class="analysis-grid">${cards.map((x,i)=>`<article class="analysis-card ${type}"><span class="label">${type==="positive"?"SYNERGY":"RISK"} / ${String(i+1).padStart(2,"0")}</span><h4>${gateEsc(x.title)}</h4>${type==="positive"?`<div class="analysis-chunk"><b>활성 조건</b><p>${gateEsc(x.condition)}</p></div><div class="analysis-chunk"><b>실제 효과</b><p>${gateEsc(x.action||x.effect)}</p></div><div class="analysis-chunk"><b>깨지는 순간</b><p>${gateEsc(x.break)}</p></div>`:`<div class="analysis-chunk"><b>발동 계기</b><p>${gateEsc(x.trigger)}</p></div><div class="analysis-chunk"><b>확대 경로</b><p>${gateEsc(x.chain)}</p></div><div class="analysis-chunk"><b>대응 방법</b><p>${gateEsc(x.mitigation||x.counter)}</p></div>`}</article>`).join("")}</div>`;
}

function gateRenderPair(){
 const choices=gateProfiles();if(!gateState.pairIds[0]&&choices.length>0)gateState.pairIds[0]=choices[0].id;if(!gateState.pairIds[1]&&choices.length>1)gateState.pairIds[1]=choices.find(p=>p.id!==gateState.pairIds[0])?.id||"";
 const a=gateGet(gateState.pairIds[0]),b=gateGet(gateState.pairIds[1]);
 let result="";if(a&&b&&a.id!==b.id){
  const r=gatePair(a,b);
  result=`<section class="surface report"><div class="eyebrow">DIRECTIONAL COMPATIBILITY REPORT</div><h2>${gateEsc(a.name)} × ${gateEsc(b.name)}</h2><p class="muted">${gateEsc(r.rankLabel)} · 양방향 전술 영향 및 자원 운용</p>
  <div class="chapter"><span>01 / DIRECTIONAL</span><h3>상대에게 요구하는 작전 행동</h3></div><div class="direction-grid">${r.directions.map(gateDirectionalView).join("")}</div>
  <div class="chapter"><span>02 / SYNERGY</span><h3>위험 구역에서 열리는 공동 대응</h3></div>${gateAnalyticCards(r.synergies,"positive")}
  <div class="chapter"><span>03 / RISK</span><h3>작전 실패로 이어지는 위험 연쇄</h3></div>${gateAnalyticCards(r.debuffs,"negative")}
  <div class="chapter"><span>04 / RESOURCE</span><h3>직군과 자원 관리</h3></div><div class="sub-report">${gateEsc(r.resources)}</div>
  <div class="chapter"><span>05 / FIELD SCENES</span><h3>세 가지 게이트 위험 대응</h3></div><div class="analysis-grid">${r.scenes.map((o,i)=>`<article class="analysis-card"><span class="label">CASE ${i+1}</span><h4>${gateEsc(o.title)}</h4><p>${gateEsc(o.text)}</p></article>`).join("")}</div>
  <div class="row actions"><button class="btn primary" onclick="gateCopyAI('pair')">AI 분석 패키지 복사</button><button class="btn light" onclick="gateShareMode('pair')">조합 링크 복사</button><button class="btn light" onclick="window.print()">인쇄 · PDF</button></div></section>`;
 }
 return `<section class="surface"><div class="eyebrow">PAIR TACTICAL ANALYSIS</div><h2>2인 전술 동행 분석</h2><p class="muted">같은 게이트에서도 A→B와 B→A가 먼저 요구하는 행동은 다릅니다. 진입로 확보, 전열 충돌, 자원 압박, 철수 결정을 양방향으로 분석합니다.</p><div class="select-grid">${gateSelect("대원 A",0,gateState.pairIds[0],"gatePairChange")}${gateSelect("대원 B",1,gateState.pairIds[1],"gatePairChange")}</div>${!a||!b?'<p class="empty">두 캐릭터를 선택해 주세요. 기록이 없다면 먼저 게이트 설문을 진행하세요.</p>':a.id===b.id?'<p class="empty">서로 다른 캐릭터 두 명을 선택해 주세요.</p>':""}</section>${result}`;
}

function gateRenderTrio(){
 const profiles=gateProfiles();for(let i=0;i<3;i++){if(!gateState.trioIds[i])gateState.trioIds[i]=profiles.find(p=>!gateState.trioIds.includes(p.id))?.id||""}
 const ps=gateState.trioIds.map(gateGet);
 let result="";
 if(ps.every(Boolean)&&new Set(ps.map(p=>p.id)).size===3){
  const r=gateTrio(ps);
  result=`<section class="surface report"><div class="eyebrow">THREE-OPERATIVE GATE SIMULATION</div><h2>${ps.map(p=>gateEsc(p.name)).join(" × ")}</h2><p class="muted">작전 판정: ${gateEsc(r.outcome)} · 통과 단계 ${r.success}/7 · 최종 위협 지표 ${r.threat}</p>
  <div class="chapter"><span>01 / TEAM ASSIGNMENT</span><h3>초기 세 역할 배치</h3><p>세 사람이 서로 다른 역할을 맡도록 전체 축 점수를 비교합니다.</p></div><div class="role-grid">${r.roles.map((o,i)=>`<article class="role-card"><span class="label">ROLE ${i+1}</span><h4>${gateEsc(o.label)}</h4><b>${gateEsc(o.name)}</b><p>관련 전술 축 ${gateFixed(o.score)}점</p></article>`).join("")}</div>
  <div class="chapter"><span>02 / SIMULATION</span><h3>7단계 게이트 작전 기록</h3><p>이전 단계의 위협과 각 대원의 자원 변화가 다음 단계에 이어집니다.</p></div><div class="simulation">${r.stages.map(s=>`<article class="stage"><div class="stage-top"><span>STEP ${String(s.index).padStart(2,"0")}</span><span>${s.success?"대응 성공":"추가 위험"}${s.critical?" · 자원 경고":""}</span></div><h4>${gateEsc(s.title)}</h4><div class="stage-numbers"><div><small>이전 위협</small><b>${s.beforeThreat}</b></div><div><small>현장 압박</small><b>${s.pressure}</b></div><div><small>다음 위협</small><b>${s.afterThreat}</b></div><div><small>팀 조율</small><b>${s.cohesion}</b></div></div><p>${gateEsc(s.summary)}</p><div class="stage-actions">${s.actions.map(x=>`<div><b>${gateEsc(x.name)}</b><span><strong>이 단계의 선택</strong> ${gateEsc(x.choice)}</span></div>`).join("")}</div><p class="stage-consequence">${gateEsc(s.consequence)}</p><div class="resource-grid">${s.resources.map(x=>`<div><small>${gateEsc(x.name)} / ${gateEsc(x.kind)}</small><div class="resource-bar"><i style="width:${x.after}%"></i></div><span>${x.before} → ${x.after}</span></div>`).join("")}</div></article>`).join("")}</div>
  <div class="chapter"><span>03 / THREE-PAIR INTERFERENCE</span><h3>세 쌍의 동선 충돌과 제3자의 조정</h3></div><div class="pair-strip">${r.pairs.map(x=>`<article class="sub-report"><h4>${gateEsc(x.label)}</h4><p><b>${gateEsc(x.from.from)} → ${gateEsc(x.from.to)}</b>: ${gateEsc(x.from.type)} · 부담 ${x.from.pressure} / 지원 ${x.from.support}</p><p><b>${gateEsc(x.back.from)} → ${gateEsc(x.back.to)}</b>: ${gateEsc(x.back.type)} · 부담 ${x.back.pressure} / 지원 ${x.back.support}</p><p><b>제3자 ${gateEsc(x.third)}:</b> ${gateEsc(x.intervention)}</p></article>`).join("")}</div>
  <div class="chapter"><span>04 / SYNERGY</span><h3>3인 작전의 시너지</h3></div>${gateAnalyticCards(r.synergies,"positive")}
  <div class="chapter"><span>05 / RISK CASCADE</span><h3>3인 작전의 위험 연쇄</h3></div>${gateAnalyticCards(r.debuffs,"negative")}
  <div class="chapter"><span>06 / FINAL ASSESSMENT</span><h3>최종 작전 평가</h3></div><div class="final-assessment"><b>${gateEsc(r.outcome)}</b><p>${gateEsc(r.notice)}</p><div class="resource-grid">${r.finalResources.map(x=>`<div><small>${gateEsc(x.name)} / ${x.role==="센티넬"?"부하도":"가이딩 잔량"}</small><div class="resource-bar"><i style="width:${x.value}%"></i></div><span>${x.value}/100</span></div>`).join("")}</div></div>
  <div class="row actions"><button class="btn primary" onclick="gateCopyAI('trio')">AI 분석 패키지 복사</button><button class="btn light" onclick="gateShareMode('trio')">조합 링크 복사</button><button class="btn light" onclick="window.print()">인쇄 · PDF</button></div></section>`;
 }
 return `<section class="surface"><div class="eyebrow">GATE OPERATION / THREE OPERATIVES</div><h2>3인 작전 시뮬레이션</h2><p class="muted">세 대원에게 초기 역할을 배치하고 진입부터 귀환까지 7단계의 위험·자원 변화를 이어 계산합니다.</p><div class="select-grid">${[0,1,2].map(i=>gateSelect(`대원 ${i+1}`,i,gateState.trioIds[i],"gateTrioChange")).join("")}</div>${!ps.every(Boolean)||new Set(ps.filter(Boolean).map(p=>p.id)).size!==3?'<p class="empty">서로 다른 캐릭터 세 명이 필요합니다. 먼저 기록을 만들거나 공유용 JSON을 가져와 주세요.</p>':""}</section>${result}`;
}

function gatePublicView(){
 const list=gateState.directory.filter(gateValid);
 return `<section class="surface"><div class="row between"><div><div class="eyebrow">PUBLIC OPERATIVE DIRECTORY</div><h2>공개 전술 기록</h2><p class="muted">본인이 공개를 선택한 캐릭터의 프로필을 열람하고 동행 분석에 사용할 수 있습니다.</p></div><button class="btn light" onclick="gateCloudRefresh(true)">공개 목록 새로고침</button></div><p class="fine">연결 상태: ${gateEsc(gateState.cloudState)} · 기존 감각 간섭 연구소와 다른 컬렉션을 사용합니다. 서버 권한 설정에 따라 온라인 공유가 제한될 수 있습니다.</p>${list.length?gateProfileList(list,"public"):'<p class="empty">현재 열람할 수 있는 공개 프로필이 없어요. 공유 링크 또는 JSON으로 다른 캐릭터를 가져올 수도 있습니다.</p>'}</section>${list.find(p=>p.id===gateState.publicSelected)?gateRenderSolo(list.find(p=>p.id===gateState.publicSelected)):""}`;
}

function gateExport(){
 const data={format:"NSD_GATE_V1",at:new Date().toISOString(),profiles:gateState.own};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="nsd-gate-archive.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
}

async function gateImport(e){
 const file=e.target.files?.[0];if(!file)return;
 if(file.size>4*1024*1024){gateNotify("파일이 너무 큽니다.",true);return}
 try{
  const parsed=JSON.parse(await file.text()),items=Array.isArray(parsed)?parsed:parsed.profiles||[parsed];
  if(!Array.isArray(items)||items.length>150)throw Error("올바른 프로필 목록이 아닙니다.");
  const good=items.filter(gateValid);if(!good.length)throw Error("3차 연구소와 호환되는 기록이 없습니다.");
  const privateBackup=parsed?.format==="NSD_GATE_V1";const seen=new Set(gateProfiles().map(p=>p.id));
  const added=good.filter(p=>!seen.has(p.id)).map(p=>privateBackup&&Array.isArray(p.answers)&&p.answers.length===48&&p.answers.every(a=>Number.isInteger(a)&&a>=1&&a<=10)?{...p,localOnly:true,isPublic:false}:{...gatePublicRecord(p),isPublic:false,imported:true});
  gateState.own.push(...added.filter(p=>Array.isArray(p.answers)));gateState.imported.push(...added.filter(p=>!Array.isArray(p.answers)));gatePersist();gateNotify(`${added.length}개 전술 프로필을 가져왔습니다.`);gateState.tab="mine";gateRender();
 }catch(err){gateNotify("가져오기 실패: "+err.message,true)}finally{e.target.value=""}
}

function gateEncodedProfiles(ids){
 const ps=ids.map(gateGet).filter(Boolean).map(gatePublicRecord);const json=JSON.stringify({v:GATE_VERSION,profiles:ps});
 const bytes=new TextEncoder().encode(json);let b="";for(const c of bytes)b+=String.fromCharCode(c);
 return btoa(b).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

function gateDecodeProfile(encoded){
 const b=atob(encoded.replace(/-/g,"+").replace(/_/g,"/"));const bytes=Uint8Array.from(b,c=>c.charCodeAt(0));
 const x=JSON.parse(new TextDecoder().decode(bytes));if(x.v!==GATE_VERSION||!Array.isArray(x.profiles)||x.profiles.length>3)throw Error("공유 정보가 호환되지 않습니다.");
 const profiles=x.profiles.filter(gateValid);if(profiles.length!==x.profiles.length)throw Error("잘못된 프로필 정보입니다.");return profiles;
}

async function gateClipboard(txt,success){
 try{await navigator.clipboard.writeText(txt);gateNotify(success)}catch(_){prompt("이 링크를 복사해 주세요.",txt)}
}

function gateShare(id){
 const query=gateEncodedProfiles([id]),url=location.origin+location.pathname+"#import="+query;
 gateClipboard(url,"캐릭터 공유 링크를 복사했습니다. 원문 설문 답변은 포함되지 않아요.");
}

function gateShareMode(mode){
 const ids=mode==="pair"?gateState.pairIds:gateState.trioIds;
 const query=gateEncodedProfiles(ids),url=location.origin+location.pathname+"#"+mode+"="+query;
 gateClipboard(url,"동행 분석 공유 링크를 복사했습니다!");
}

function gateImportHash(){
 const str=location.hash.slice(1),idx=str.indexOf("=");if(idx<0)return;
 const mode=str.slice(0,idx);if(!["import","pair","trio"].includes(mode))return;
 try{
  const profiles=gateDecodeProfile(str.slice(idx+1)),existing=new Set(gateProfiles().map(p=>p.id)),newProfiles=profiles.filter(p=>!existing.has(p.id)).map(p=>({...p,imported:true}));
  gateState.imported.push(...newProfiles);gatePersist();
  if(mode==="pair"&&profiles.length===2){gateState.pairIds=profiles.map(p=>p.id);gateState.tab="pair"}
  else if(mode==="trio"&&profiles.length===3){gateState.trioIds=profiles.map(p=>p.id);gateState.tab="trio"}
  else if(profiles.length){gateState.selected=profiles[0].id;gateState.tab="mine"}
  history.replaceState(null,"",location.pathname);
 }catch(e){gateNotify("공유 링크를 불러오지 못했습니다: "+e.message,true)}
}

function gateCopyAI(mode,id){
 let content="";
 const intro=`# NSD 게이트 동행 적합성 연구 / AI 분석 패키지\n이 자료는 NSD 캐릭터의 전술 선택과 동행 판단을 심층적으로 분석하기 위한 기록입니다. 센티넬은 각자의 부하도를 관리하고, 가이드는 필요에 따라 동의된 가이딩을 수행하며 가이딩 잔량이 0이 되면 공명 고갈 상태가 됩니다.\n`;
 const profile=p=>`## ${p.name} (${p.role})\n전술 서명: ${gateSignature(p).name}\n12축: ${GATE_AXES.map((d,i)=>`${d.name} ${gateFixed(p.axes[i])}`).join(" / ")}\n상황 선택: ${gateScenarios(p.role).map((s,i)=>`${i+1}. ${s.title}: ${gateChoice(p,i)}`).join(" | ")}\n`;
 if(mode==="solo"){const p=gateGet(id);if(!p)return;const r=gateSolo(p);content=intro+profile(p)+r.deep.map(x=>`\n### ${x.title}\n${x.text}`).join("\n")}
 if(mode==="pair"){const ps=gateState.pairIds.map(gateGet);if(ps.some(x=>!x))return;const r=gatePair(...ps);content=intro+ps.map(profile).join("\n")+r.directions.map(d=>`\n## ${d.from}→${d.to}\n${d.sections.map(s=>s.title+": "+s.text).join("\n")}`).join("\n")+r.synergies.map(x=>`\n시너지 ${x.title} / 활성: ${x.condition} / 실패: ${x.break}`).join("")+r.debuffs.map(x=>`\n위험 ${x.title} / 계기: ${x.trigger} / 대응: ${x.mitigation}`).join("")}
 if(mode==="trio"){const ps=gateState.trioIds.map(gateGet);if(ps.some(x=>!x))return;const r=gateTrio(ps);content=intro+ps.map(profile).join("\n")+`\n## 역할 배치\n${r.roles.map(x=>`${x.label}: ${x.name}`).join("\n")}`+r.stages.map(x=>`\n## ${x.title}\n${x.summary}\n${x.actions.map(a=>a.name+": "+a.choice+" / 직군 상황 대응: "+a.roleChoice).join("\n")}\n${x.consequence}\n위협 ${x.beforeThreat}→${x.afterThreat} · 자원: ${x.resources.map(z=>z.name+" "+z.before+"→"+z.after).join(", ")}`).join("\n")+`\n3인 시너지\n${r.synergies.map(x=>x.title+" / 조건: "+x.condition+" / 효과: "+x.effect+" / 붕괴: "+x.break).join("\n")}\n3인 위험\n${r.debuffs.map(x=>x.title+" / 계기: "+x.trigger+" / 연쇄: "+x.chain+" / 대응: "+x.counter).join("\n")}\n최종 평가 ${r.outcome}\n${r.notice}`}
 gateClipboard(content,"AI 분석 패키지를 복사했습니다.");
}

async function gateStartCloud(){
 const config=window.NSD_GATE_FIREBASE_CONFIG||window.NSD_FIREBASE_CONFIG;
 if(!config?.apiKey||!config?.projectId){gateState.cloudState="local";return}
 gateState.cloudState="connecting";gateRender();
 try{
  const ver="12.19.0";
  const [appLib,authLib,fireLib]=await Promise.all([import(`https://www.gstatic.com/firebasejs/${ver}/firebase-app.js`),import(`https://www.gstatic.com/firebasejs/${ver}/firebase-auth.js`),import(`https://www.gstatic.com/firebasejs/${ver}/firebase-firestore.js`)]);
  const app=appLib.initializeApp(config,"nsd-gate-lab"),auth=authLib.getAuth(app),db=fireLib.getFirestore(app);
  const cred=await authLib.signInAnonymously(auth),uid=cred.user.uid;
  const ownRef=id=>fireLib.doc(db,"gateUsers",uid,"records",id),publicRef=id=>fireLib.doc(db,"gatePublicProfiles",id);
  gateState.cloud={
   async save(p){const batch=fireLib.writeBatch(db);batch.set(ownRef(p.id),{...gateFirestoreEncode(p),ownerUid:uid});if(p.isPublic)batch.set(publicRef(p.id),{...gateFirestoreEncode(gatePublicRecord(p)),ownerUid:uid});else if(gateState.directory.some(x=>x.id===p.id))batch.delete(publicRef(p.id));await batch.commit()},
   async remove(p){const batch=fireLib.writeBatch(db);batch.delete(ownRef(p.id));if(p.isPublic)batch.delete(publicRef(p.id));await batch.commit()},
   async refresh(){
    const own=await fireLib.getDocs(fireLib.collection(db,"gateUsers",uid,"records"));
    const shared=await fireLib.getDocs(fireLib.query(fireLib.collection(db,"gatePublicProfiles"),fireLib.where("isPublic","==",true)));
    const fromCloud=own.docs.map(d=>gateFirestoreDecode({...d.data(),id:d.id,localOnly:false})).filter(gateValid);
    const kept=gateState.own.filter(p=>p.localOnly&&!fromCloud.some(x=>x.id===p.id));
    gateState.own=[...fromCloud,...kept];gateState.directory=shared.docs.map(d=>gateFirestoreDecode({...d.data(),id:d.id})).filter(gateValid);
    gatePersist();
   }
  };
  await gateState.cloud.refresh();gateState.cloudState="online";gateRender();gateNotify("온라인 전술 기록 저장소에 연결되었습니다.");
 }catch(err){gateState.cloud=null;gateState.cloudState="error";gateRender();gateNotify("온라인 저장소 연결 제한: 로컬 저장과 공유 링크는 사용 가능합니다.",true)}
}

async function gateCloudRefresh(show){if(!gateState.cloud){if(show)gateNotify("온라인 공개 목록에 연결되지 않았습니다.",true);return}
 try{await gateState.cloud.refresh();gateRender();if(show)gateNotify("공개 기록을 갱신했습니다.")}catch(e){gateNotify("공개 기록 확인 실패: "+e.message,true)}}

function gateInit(){
 gateState.own=gateLocal("nsd_gate_v1_own",[]).filter(gateValid);
 gateState.imported=gateLocal("nsd_gate_v1_imported",[]).filter(gateValid);
 gateImportHash();gateRender();gateStartCloud();
}

// Bootstrap is handled by v7-ui.js after survey and scoring overrides are loaded.
