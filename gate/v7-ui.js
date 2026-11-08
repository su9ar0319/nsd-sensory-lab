'use strict';
var gateV7State={sources:{sensory:[],chroma:[]},sourceStatus:"대기",linkRefs:{sensoryId:"",chromaId:""},clarifiers:[0,0,0,0],search:"",loading:false,initialized:false};
function gateV7E(x){return gateEsc(x)}
function gateV7ValidValue(x){return Number.isInteger(Number(x))&&Number(x)>=1&&Number(x)<=10}
function gateV7BaseCount(){
 return gateState.answers.filter(gateV7ValidValue).length+gateState.choices.filter(n=>Number.isInteger(n)&&n>=0&&n<=3).length;
}
function gateV7Rate(i,value){gateState.answers[i]=value?Number(value):0;gateV7Progress()}
function gateV7SetChoice(i,value){gateState.choices[i]=Number(value);if(gateState.step===4)gateRender();else gateV7Progress()}
function gateV7Name(x){gateState.name=x;gateV7Progress()}
function gateV7Role(role){
 if(role!==gateState.role&&["센티넬","가이드"].includes(role)){
  gateState.role=role;gateState.choices=Array(8).fill(-1);gateV7State.linkRefs={sensoryId:"",chromaId:""};gateState.step=0;gateRender();
 }
}
function gateV7SourceOptions(type){
 const arr=gateV7State.sources[type].filter(p=>p.role===gateState.role&&(p.name.toLowerCase().includes(gateV7State.search.trim().toLowerCase())||p.id===gateV7State.linkRefs[type==="sensory"?"sensoryId":"chromaId"]));
 const key=type==="sensory"?"sensoryId":"chromaId";
 return '<option value="">선택하지 않음</option>'+arr.map(p=>'<option value="'+gateV7E(p.id)+'" '+(gateV7State.linkRefs[key]===p.id?"selected":"")+'>'+gateV7E(p.name)+" · "+gateV7E(p.role)+" · "+gateV7E(p.id.slice(-6))+'</option>').join("");
}
function gateV7FilterSources(q){
 gateV7State.search=q;
 ["sensory","chroma"].forEach(type=>{const el=document.getElementById("gate-v7-source-"+type);if(el)el.innerHTML=gateV7SourceOptions(type)});
}
function gateV7SetSource(type,id){
 const key=type==="sensory"?"sensoryId":"chromaId";
 const match=gateV7State.sources[type].find(p=>p.id===id&&p.isPublic===true&&p.role===gateState.role);
 gateV7State.linkRefs[key]=match?match.id:"";
}
function gateV7QuestionRow(q,i,optional=false){
 const val=optional?gateV7State.clarifiers[i]:gateState.answers[i];
 const realIndex=optional?i:i;
 const opts=Array.from({length:10},(_,j)=>{const v=j+1;return '<option value="'+v+'" '+(val===v?"selected":"")+'>'+v+'점</option>'}).join("");
 return '<label class="gate-v7-question"><span><b>Q'+String(optional?25+i:i+1).padStart(2,"0")+'</b> '+gateV7E(q.text)+'</span><select aria-label="Q'+(i+1)+' 점수" onchange="'+(optional?"gateV7Clarify("+realIndex+",this.value)":"gateV7Rate("+realIndex+",this.value)")+'"><option value="">선택</option>'+opts+'</select></label>';
}
function gateV7SceneRow(scene,i){
 return '<fieldset class="gate-v7-scene"><legend><b>S'+String(i+1).padStart(2,"0")+"</b> "+gateV7E(scene.title)+'</legend><p>'+gateV7E(scene.story)+'</p><div class="gate-v7-options">'+scene.opts.map((o,j)=>'<label><input type="radio" name="gate-v7-scene-'+i+'" value="'+j+'" '+(gateState.choices[i]===j?"checked":"")+' onchange="gateV7SetChoice('+i+','+j+')"><span>'+gateV7E(o.label)+'</span></label>').join("")+'</div></fieldset>';
}
function gateV7SourcePage(){
 const linked=gateV7State.linkRefs,have=gateV7State.sources.sensory.length+gateV7State.sources.chroma.length;
 return '<section class="surface gate-v7-source"><div class="eyebrow">STEP 01 / RESEARCH RECORDS</div><h2>기존 공개 기록 연결하기</h2><p class="muted">공개 등록된 캐릭터 기록을 본인이 직접 선택해 연결합니다. 이름이 같아도 자동으로 동일 인물로 취급하지 않으며, 연결하지 않고도 참여할 수 있습니다.</p>'+
 '<div class="gate-v7-basic"><label>캐릭터 이름<input class="field" maxlength="40" value="'+gateV7E(gateState.name)+'" placeholder="캐릭터 이름" oninput="gateV7Name(this.value)"></label><label>직군<select class="field" onchange="gateV7Role(this.value)"><option value="센티넬" '+(gateState.role==="센티넬"?"selected":"")+'>센티넬</option><option value="가이드" '+(gateState.role==="가이드"?"selected":"")+'>가이드</option></select></label></div>'+
 '<div class="gate-v7-source-controls"><button type="button" class="btn light" onclick="gateV7LoadExternal()" '+(gateV7State.loading?"disabled":"")+'>'+(gateV7State.loading?"공개 목록 연결 중…":"공개 캐릭터 목록 불러오기 / 새로고침")+'</button><small>'+gateV7E(gateV7State.sourceStatus)+' · 감각 '+gateV7State.sources.sensory.length+'명 / 색채 '+gateV7State.sources.chroma.length+'명</small></div>'+
 '<label class="field">공개 캐릭터 이름 검색<input class="field" placeholder="선택 목록에서 이름 검색" value="'+gateV7E(gateV7State.search)+'" oninput="gateV7FilterSources(this.value)"></label>'+
 '<div class="gate-v7-basic"><label>감각 간섭 보고서<select class="field" id="gate-v7-source-sensory" onchange="gateV7SetSource(\'sensory\',this.value)">'+gateV7SourceOptions("sensory")+'</select></label>'+
 '<label>색채·잔향 보고서<select class="field" id="gate-v7-source-chroma" onchange="gateV7SetSource(\'chroma\',this.value)">'+gateV7SourceOptions("chroma")+'</select></label></div>'+
 '<div class="gate-v7-tip">감각 정보는 반응 방식에, 색채 정보는 행동의 동기에 참고합니다. 기존 점수를 전투 능력으로 환산하지 않습니다. 비공개 전환 또는 삭제된 기록은 더 이상 가져오지 않습니다.</div>'+
 '<label class="gate-v7-public"><input type="checkbox" '+(gateState.isPublic?"checked":"")+' onchange="gateState.isPublic=this.checked"><span>게이트 분석 결과도 다른 참여자에게 공개하기</span></label></section>';
}
function gateV7Clarify(i,v){gateV7State.clarifiers[i]=v?Number(v):0;gateV7Progress()}
function gateV7CurrentStepValid(){
 const st=gateState.step;
 if(st===0)return !!gateState.name.trim();
 if(st===1)return gateState.answers.slice(0,8).every(gateV7ValidValue);
 if(st===2)return gateState.answers.slice(8,16).every(gateV7ValidValue);
 if(st===3)return gateState.choices.slice(0,4).every(v=>v>=0&&v<=3);
 if(st===4)return gateState.choices.slice(4,8).every(v=>v>=0&&v<=3);
 return true;
}
function gateV7Survey(){
 const s=gateState.step,questions=s===1?GATE_V7_QUESTIONS.slice(0,8):s===2?GATE_V7_QUESTIONS.slice(8,16):[],sc=gateV7Scenarios(gateState.role);
 const optional=gateV7NeedClarification(gateState.answers,gateState.choices,gateState.role);
 const maxStep=optional?5:4;
 let body=s===0?gateV7SourcePage():s===1||s===2?'<section class="surface"><div class="eyebrow">TACTICAL DISPOSITION / '+(s===1?"01":"02")+'</div><h2>이 캐릭터는 어떻게 행동하는가</h2><p class="muted">1점 = 전혀 그렇지 않다 / 10점 = 매우 그렇다. 점수가 높다고 좋은 유형이라는 뜻은 아닙니다.</p>'+questions.map((q,j)=>gateV7QuestionRow(q,s===1?j:j+8)).join("")+'</section>':s===3||s===4?'<section class="surface"><div class="eyebrow">FIELD DECISION / '+(s===3?"01":"02")+'</div><h2>실제 작전이라면 무엇을 선택할까</h2><p class="muted">각 상황에서 가장 먼저 할 행동을 하나 선택해 주세요. 직군별 상황은 기존 캐릭터 설정을 전제로 해석합니다.</p>'+sc.slice(s===3?0:4,s===3?4:8).map((x,j)=>gateV7SceneRow(x,(s===3?0:4)+j)).join("")+'</section>':'<section class="surface"><div class="eyebrow">OPTIONAL PRECISION / 04</div><h2>결과를 조금 더 정밀하게</h2><p class="muted">일부 점수가 중간에 몰리거나 응답 사이에 차이가 있어 보일 때만 제공되는 보조 질문입니다. 빈칸으로 두고 결과를 저장해도 됩니다.</p>'+GATE_V7_CLARIFIERS.map((q,j)=>gateV7QuestionRow(q,j,true)).join("")+'</section>';
 const progress=gateV7BaseCount(),valid=gateV7CurrentStepValid();
 return '<section class="surface gate-v7-progress"><div class="row between"><div><div class="eyebrow">NSD / GATE RESEARCH · V7</div><h2>게이트 동행 적합성 연구</h2><p class="muted">기본 24문항 · 필요한 경우 최대 4문항 추가 · V6 장문 분석 보고서</p></div><strong>'+progress+'/24 완료</strong></div><div class="gate-v7-track"><i style="width:'+(progress/24*100)+'%"></i></div></section>'+
 body+'<div class="surface gate-v7-actions"><button class="btn light" type="button" '+(s===0?"disabled":"")+' onclick="gateV7Move(-1)">이전</button><span>단계 '+(s+1)+' / '+(maxStep+1)+'</span><button class="btn primary" type="button" '+(!valid?"disabled":"")+' onclick="'+(s===maxStep?"gateV7Save()":"gateV7Move(1)")+'">'+(s===maxStep?"결과 저장하기":s===4&&optional?"정밀 질문으로":"다음")+'</button></div>';
}
function gateV7Progress(){
 const count=gateV7BaseCount(),p=document.querySelector(".gate-v7-progress strong"),bar=document.querySelector(".gate-v7-track i");
 if(p)p.textContent=count+"/24 완료";if(bar)bar.style.width=(count/24*100)+"%";
 const el=document.querySelector(".gate-v7-actions button.btn.primary");if(el)el.disabled=!gateV7CurrentStepValid();
}
function gateV7Move(delta){
 if(delta>0&&!gateV7CurrentStepValid()){gateNotify("현재 단계에 먼저 응답해 주세요.",true);return}
 const optional=gateV7NeedClarification(gateState.answers,gateState.choices,gateState.role);
 gateState.step=Math.max(0,Math.min(optional?5:4,gateState.step+delta));gateRender();window.scrollTo({top:0,behavior:"smooth"});
}
function gateV7New(){
 gateState.editId=null;gateState.name="";gateState.role="센티넬";gateState.isPublic=false;gateState.answers=Array(16).fill(0);gateState.choices=Array(8).fill(-1);gateState.step=0;
 gateV7State.linkRefs={sensoryId:"",chromaId:""};gateV7State.clarifiers=[0,0,0,0];gateState.tab="survey";gateRender();
}
function gateV7Edit(id){
 const p=gateState.own.find(x=>x.id===id);
 if(!p||!Array.isArray(p.answers)||p.answers.length!==16){gateNotify("수정 가능한 원본 설문이 없습니다.",true);return}
 gateState.editId=id;gateState.name=p.name;gateState.role=p.role;gateState.isPublic=!!p.isPublic;
 gateState.answers=p.answers.slice();gateState.choices=p.choices.slice();gateState.step=0;
 gateV7State.clarifiers=(p.clarifiers||[0,0,0,0]).slice();
 gateV7State.linkRefs={sensoryId:p.linkRefs?.sensoryId||"",chromaId:p.linkRefs?.chromaId||""};
 gateState.tab="survey";gateRender();
}
async function gateV7Save(){
 if(!gateV7CurrentStepValid()||gateV7BaseCount()!==24||!gateState.name.trim()){gateNotify("기본 24문항과 이름을 먼저 입력해 주세요.",true);return}
 if(gateState.busy)return;gateState.busy=true;
 try{
  const score=gateV7Score(gateState.answers,gateState.choices,gateState.role,gateV7State.clarifiers);
  const id=gateState.editId||gateId();
  const source=(type,key)=>gateV7State.sources[type].find(p=>p.id===gateV7State.linkRefs[key]&&p.role===gateState.role&&p.isPublic);
  const linkRefs={sensoryId:source("sensory","sensoryId")?.id||"",chromaId:source("chroma","chromaId")?.id||""};
  const p={...score,id,name:gateState.name.trim(),isPublic:!!gateState.isPublic,updatedAt:new Date().toISOString(),linkRefs,localOnly:true};
  gateState.own=gateState.own.filter(x=>x.id!==id).concat(p);gatePersist();gateState.selected=id;gateState.editId=null;
  if(gateState.cloud){
   try{await gateState.cloud.save(p);p.localOnly=false;gatePersist();await gateState.cloud.refresh()}
   catch(err){gateNotify("브라우저 저장 완료 / Firebase 저장 실패: "+err.message,true)}
  }else if(p.isPublic){gateNotify("브라우저에 저장했습니다. 공개 등록은 Firebase 연결 후 가능합니다.",true)}
  gateState.tab="mine";gateRender();window.scrollTo({top:0,behavior:"smooth"});
 }catch(err){gateNotify("분석 저장 오류: "+err.message,true)}finally{gateState.busy=false}
}
function gateV7Nav(){
 const items=[["home","연구 안내"],["survey","24~28문항 검사"],["mine","내 기록"],["public","공개 기록"],["pair","2인 전술 분석"],["trio","3인 작전 시뮬레이션"]];
 const node=document.getElementById("nav");if(node)node.innerHTML=items.map(x=>'<button type="button" class="'+(gateState.tab===x[0]?"active":"")+'" onclick="gateSwitch(\''+x[0]+'\')">'+x[1]+'</button>').join("");
}
function gateV7Choice(p,i){
 const idx=i>=8?4+(i-8)%4:i;
 const scenes=gateV7Scenarios(p.role);
 return scenes[idx]?.opts[p.choices[idx]]?.label||"별도 선택 없음";
}
function gateV7Home(){
 return '<section class="surface"><div class="eyebrow">NSD / GATE OPERATION COMPATIBILITY</div><h2>같은 게이트, 서로 다른 선택.</h2><p>감각과 색채의 공개 기록을 선택적으로 연결하고, 신규 전술 질문 24개에 답해 캐릭터의 판단과 작전 행동을 해석합니다. 필요한 경우에만 최대 4개를 더 확인합니다.</p><div class="row actions"><button class="btn primary" onclick="gateV7New()">새 검사 시작</button><button class="btn light" onclick="gateSwitch(\'public\')">공개 보고서 보기</button></div></section><section class="surface"><h3>두 연구소의 결과는 보조 근거로만 활용합니다.</h3><p>감각은 반응의 특징, 색채는 선택의 동기를 해석하며 전술 능력 점수로 직접 환산하지 않습니다. 기존 공개 기록이 없어도 똑같은 24문항 검사에 참여할 수 있습니다.</p><p class="muted">온라인 기록은 Firebase 연결과 공개 권한이 있어야 작동합니다. 참여자의 원본 설문 답변은 외부 연구소에서 읽지 않습니다.</p></section>';
}
async function gateV7LoadExternal(){
 if(gateV7State.loading)return;gateV7State.loading=true;gateV7State.sourceStatus="Firebase 공개 목록 연결 중";gateRender();
 try{
  const cfg=window.NSD_GATE_FIREBASE_CONFIG||window.NSD_SENSORY_FIREBASE_CONFIG||window.NSD_FIREBASE_CONFIG;
  if(!cfg?.apiKey||!cfg?.projectId)throw Error("Firebase 설정이 없습니다.");
  const ver="12.19.0",[appLib,authLib,fireLib]=await Promise.all([import("https://www.gstatic.com/firebasejs/"+ver+"/firebase-app.js"),import("https://www.gstatic.com/firebasejs/"+ver+"/firebase-auth.js"),import("https://www.gstatic.com/firebasejs/"+ver+"/firebase-firestore.js")]);
  let app=appLib.getApps().find(x=>x.name==="nsd-gate-public-reader-v7");if(!app)app=appLib.initializeApp(cfg,"nsd-gate-public-reader-v7");
  const auth=authLib.getAuth(app);if(!auth.currentUser)await authLib.signInAnonymously(auth);
  const db=fireLib.getFirestore(app),paths={sensory:"sensoryPublicProfiles",chroma:"publicProfiles"};
  const [sense,color]=await Promise.all(["sensory","chroma"].map(type=>fireLib.getDocs(fireLib.query(fireLib.collection(db,paths[type]),fireLib.where("isPublic","==",true)))));
  const norm=snap=>snap.docs.map(d=>({...d.data(),id:d.id})).filter(p=>p.isPublic===true&&["센티넬","가이드"].includes(p.role)&&typeof p.name==="string"&&p.name.length<=40&&Array.isArray(p.axes)&&p.axes.length===6&&p.axes.every(x=>Number.isFinite(x)&&x>=1&&x<=10)&&Array.isArray(p.choices)&&p.choices.length===8);
  gateV7State.sources.sensory=norm(sense);gateV7State.sources.chroma=norm(color);gateV7State.sourceStatus="공개 목록 연결 완료";
 }catch(err){
  gateV7State.sourceStatus="연결 제한: "+err.message;
  gateV7State.sources.sensory=[];gateV7State.sources.chroma=[];
 }finally{gateV7State.loading=false;gateRender()}
}
function gateV7Bootstrap(){
 gateValid=gateV7Valid;gateScoring=gateV7Score;gateScenarios=gateV7Scenarios;gatePublicRecord=gateV7PublicRecord;
 gateCount=gateV7BaseCount;gateSurvey=gateV7Survey;gateProgress=gateV7Progress;gateRate=gateV7Rate;gateSetChoice=gateV7SetChoice;
 gateMove=gateV7Move;gateNew=gateV7New;gateEdit=gateV7Edit;gateSave=gateV7Save;gateChangeName=gateV7Name;gateChangeRole=gateV7Role;
 gateNav=gateV7Nav;gateHome=gateV7Home;gateChoice=gateV7Choice;gateSolo=gateV7Solo;gateRenderSolo=gateV7Reader;
 gateState.own=gateLocal("nsd_gate_v1_own",[]).filter(gateValid);
 gateState.imported=gateLocal("nsd_gate_v1_imported",[]).filter(gateValid);
 gateState.answers=Array(16).fill(0);gateState.choices=Array(8).fill(-1);gateState.step=0;
 gateState.tab="home";gateV7State.initialized=true;gateRender();
 gateV7LoadExternal();
}
gateV7Bootstrap();
