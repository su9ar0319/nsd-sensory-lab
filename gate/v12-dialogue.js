'use strict';
/* NSD field dialogue V12 — one spoken turn per selected operative.
   Quotes are authored for the selected gate scenario; B responds to A,
   and C responds to B while bringing their own selected action.
   Deterministic, name-independent. No numeric scoring or Firebase writes.
 */
const GATE_V12_SCENES=[
  {
    "id": "BRIEFING",
    "title": "엇갈린 브리핑",
    "situation": "게이트 진입 직전, 서로 다른 위험 정보가 들어왔을 때",
    "first": [
      "브리핑이 서로 달라. 진입 전에 확인할 단서부터 모으자.",
      "두 보고 중 어느 걸 기준으로 움직일지 먼저 정하자.",
      "위험 정보를 나눠 확인하자. 여기서 시간만 보낼 순 없어.",
      "가장 위험한 경로부터 봉쇄하자. 판단은 그다음이야."
    ],
    "reply": [
      [
        "좋아. 그럼 난 다른 보고의 근거를 확인할게.",
        "확인은 하되, 언제 진입할 수 있는지 기준도 정하자.",
        "좋아, 구역을 나눠서 확인해. 다시 모일 위치도 정하고.",
        "확인하는 동안 가장 위험한 길은 내가 막을게."
      ],
      [
        "그 기준에 넣을 단서는 내가 직접 확인하겠어.",
        "좋아. 기준을 하나로 맞추면 출발 신호도 하나면 되겠네.",
        "그럼 난 나머지 보고를 확인할게. 판단할 자료는 둘 다 필요해.",
        "기준을 정하는 사이 위험 구역부터 막아 두자."
      ],
      [
        "나뉘기 전에 확인할 단서를 구분해 두자.",
        "좋아. 각자 다르게 보고해도 판단 기준은 하나로 맞추자.",
        "그러자. 대신 누가 어느 구역에 있는지는 꼭 공유해.",
        "분산해서 확인해. 위험한 출입로는 내가 지키고 있을게."
      ],
      [
        "봉쇄할 길이 맞는지 내가 다른 단서도 확인할게.",
        "그럼 봉쇄를 시작할 기준과 해제할 기준을 정하자.",
        "다른 길은 우리가 나눠 확인할게. 막은 구역은 넘기지 마.",
        "나도 그쪽 위험을 맡겠어. 다른 통로는 누가 보는지 정하자."
      ]
    ],
    "third": [
      [
        "확인할 자료는 내가 모을게. 너희는 각자 이동 위치부터 알려 줘.",
        "그럼 다른 보고는 내가 확인할게. 들어가기 전 한 번만 합치자.",
        "확인할 구역을 나눌게. 두 사람 모두 같은 단서를 쫓지 마.",
        "그동안 입구는 내가 지킬게. 미확인 통로는 열지 마."
      ],
      [
        "판단 기준에 빠진 단서가 있는지 마지막으로 확인할게.",
        "좋아. 그 기준이면 출발 신호는 내가 전달하겠어.",
        "각자 보고를 받고 나서 기준 하나로 정리할게.",
        "기준은 세웠으니 가장 위험한 통로부터 닫자."
      ],
      [
        "따로 확인한 정보를 내가 모을게. 합류 위치는 바꾸지 마.",
        "분산된 보고는 내가 정리할게. 출발 시점만 맞추자.",
        "그럼 난 아직 확인하지 않은 구역을 맡겠어.",
        "한쪽은 봉쇄하고 한쪽은 정찰해. 난 귀환로를 지킬게."
      ],
      [
        "막힌 길이 제대로 봉쇄됐는지 내가 확인할게.",
        "봉쇄가 끝났으면 출발 조건을 내가 다시 확인하겠어.",
        "나머지 경로는 내가 맡을게. 봉쇄 구역에서 떨어져 있어.",
        "둘이 봉쇄를 맡는 동안 난 후방 통로를 확인할게."
      ]
    ]
  },
  {
    "id": "ENTRY",
    "title": "진입 지점의 미확인 기척",
    "situation": "예상하지 못한 기척이 진입로 안쪽에서 포착됐을 때",
    "first": [
      "계획에 없던 기척이야. 조금 더 살피고 움직이자.",
      "이쪽은 위험해졌어. 진입 경로를 바꾸자.",
      "미확인 기척이 있어. 전원에게 위치부터 알려 줘.",
      "잠깐 정지. 철수할 조건부터 확인하고 들어가."
    ],
    "reply": [
      [
        "내가 반대쪽 신호를 확인할게. 같은 곳만 보진 말자.",
        "확인하는 동안 새 통로를 찾아 볼게. 여긴 오래 못 있어.",
        "기척이 있는 방향은 내가 전원에게 알려 둘게.",
        "좋아. 탐색 범위를 늘리더라도 되돌아올 선은 정해."
      ],
      [
        "우회로도 안전한지 내가 먼저 확인할게.",
        "그러자. 새 동선은 내가 후방까지 전달할게.",
        "경로 변경을 모두에게 알릴게. 먼저 들어가지는 마.",
        "동선이 달라졌으니 철수할 길부터 다시 확인하자."
      ],
      [
        "경고를 들었어. 내가 기척이 나는 범위를 더 확인할게.",
        "경고대로라면 기존 길은 포기하자. 우회할게.",
        "나도 전달할게. 뒤쪽 대원까지 들었는지 확인하자.",
        "경고를 확인했어. 진입은 잠시 중단하는 편이 낫겠어."
      ],
      [
        "멈춘 사이 위험의 위치를 확인해 둘게.",
        "정지한다면 이탈할 우회로도 함께 열어 두자.",
        "정지 신호를 전원에게 보낼게. 선두만 듣고 끝내지 마.",
        "좋아, 전원 정지. 철수 판단을 내릴 위치부터 정하자."
      ]
    ],
    "third": [
      [
        "너희가 살피는 동안 난 다른 방향을 확인할게.",
        "탐색이 끝나면 바로 움직일 수 있게 우회로를 준비할게.",
        "확인한 위치를 내가 모아서 전원에게 알리겠어.",
        "탐색 범위가 넓어졌으니 후퇴할 선도 내가 표시할게."
      ],
      [
        "새 경로가 열린다면 내가 먼저 위험을 확인할게.",
        "그 길로 가자. 후방에 새 경로를 전달했는지 확인해.",
        "동선 변경은 내가 전원에게 다시 알릴게.",
        "우회가 막혔을 때 돌아올 경로도 함께 확보할게."
      ],
      [
        "경고를 들었어. 정확히 어느 쪽인지 내가 확인할게.",
        "확인됐으면 그 방향을 피해 동선을 바꿀게.",
        "마지막 대원까지 경고를 받았는지 내가 확인할게.",
        "경고가 전달됐으면 진입 중단 신호도 맞추자."
      ],
      [
        "정지한 위치의 안전부터 확인할게.",
        "멈춘 동안 이탈할 길을 만들어 놓겠어.",
        "정지 신호는 후방까지 내가 전달할게.",
        "철수할 조건이 충족되면 내가 후방을 이끌게."
      ]
    ]
  },
  {
    "id": "ADVANCE",
    "title": "전진 순서가 겹치는 순간",
    "situation": "두 대원이 동시에 전진하려다 동선이 겹쳤을 때",
    "first": [
      "내가 앞의 위협을 견제할게. 그동안 통로를 지나가.",
      "내가 먼저 길을 열게. 뒤따라올 신호를 기다려.",
      "선두와 후방을 나누자. 둘 다 앞으로 가면 길이 막혀.",
      "진입 전에 남은 여력부터 확인하자. 무리하게 밀면 안 돼."
    ],
    "reply": [
      [
        "견제할 적을 같이 확인할게. 너 혼자 전부 맡지는 마.",
        "좋아. 그 사이 내가 먼저 통로를 확보할게.",
        "그럼 난 뒤를 지킬게. 견제가 끝나면 위치를 알려 줘.",
        "견제가 길어지면 얼마나 버틸 수 있는지 먼저 말해 줘."
      ],
      [
        "길을 여는 동안 난 다른 위험이 없는지 확인할게.",
        "확보 신호가 오면 바로 진입할게. 그전엔 기다리지.",
        "네가 앞을 맡아. 나는 후방을 막고 있을게.",
        "먼저 들어가기 전에 돌아올 여력도 확인하자."
      ],
      [
        "그럼 난 앞쪽 위험부터 견제할게.",
        "내가 선두를 맡을게. 나머지는 신호까지 후방에 있어.",
        "좋아. 선두와 후방을 정했으면 이동 신호도 하나로 맞추자.",
        "배치는 정했어. 이동 가능한 인원부터 확인하자."
      ],
      [
        "자원 확인하는 동안 내가 접근하는 위협을 막을게.",
        "여력이 확인되면 내가 먼저 길을 열겠어.",
        "무리하지 않도록 역할을 나눠 두자. 후방은 내가 맡을게.",
        "좋아. 먼저 남은 힘을 확인하고 진입 순서를 정하자."
      ]
    ],
    "third": [
      [
        "견제 방향을 내가 보완할게. 나머지 둘은 통로에 집중해.",
        "그 사이 통로가 열리는지 내가 확인할게.",
        "위협을 막는 사람은 그대로 두고, 난 뒤를 맡겠어.",
        "견제에 쓸 자원부터 확인할게. 다음 구역 몫도 남겨야 해."
      ],
      [
        "통로 안쪽 위협은 내가 먼저 확인하겠어.",
        "확보 신호가 오면 내가 다음 대원을 안내할게.",
        "선두가 움직이는 동안 난 후방을 유지하겠어.",
        "진입 전에 셋의 여력을 한 번만 더 확인하자."
      ],
      [
        "앞과 뒤가 정해졌으면 난 빈 방향을 견제할게.",
        "그럼 내가 먼저 길을 열게. 후방은 맡아 줘.",
        "두 역할 사이의 합류 신호는 내가 관리할게.",
        "이동 순서를 정했으니 남은 자원도 다시 확인하자."
      ],
      [
        "남은 여력이 부족한 쪽은 내가 엄호할게.",
        "무리하지 않는 범위에서 내가 선두를 맡을게.",
        "교대가 필요하면 내가 후방 자리를 넘겨받을게.",
        "그럼 셋 다 상태를 보고해. 순서는 그다음에 정하자."
      ]
    ]
  },
  {
    "id": "SUPPORT",
    "title": "지원 요청과 거절의 충돌",
    "situation": "위험한 구역에서 동료가 지원을 거절했을 때",
    "first": [
      "싫다면 직접 돕지는 않을게. 대신 위험한 구역은 알려 줘.",
      "직접 지원하지 않을게. 내가 다른 위치를 맡겠어.",
      "위험은 확인됐어. 우선 사실부터 공유할게.",
      "지원할 수 있는 범위는 여기까지야. 다른 방법을 같이 찾자."
    ],
    "reply": [
      [
        "그 의사는 존중하자. 대신 위험은 내가 확인할게.",
        "그럼 난 다른 방향에서 안전을 확보해 둘게.",
        "동의했는지 확인한 다음 위험 정보를 전할게.",
        "거절한 지원은 빼고, 가능한 자원만 다시 계산하자."
      ],
      [
        "위치를 바꾸는 동안 난 남은 위험을 확인할게.",
        "좋아. 그럼 난 반대쪽 구역을 맡겠어.",
        "네가 이동한다는 사실을 전원에게 알릴게.",
        "지원 대신 이동하는 데 필요한 여력부터 확인하자."
      ],
      [
        "네가 본 위험의 근거는 내가 다시 확인할게.",
        "사실을 들었어. 그럼 난 안전한 동선을 찾을게.",
        "알겠어. 추측과 확인된 내용은 나눠서 전할게.",
        "그 정보로 가능한 지원을 다시 계산하자."
      ],
      [
        "그 범위면 내가 확인할 단서는 따로 맡을게.",
        "직접 지원이 부족하다면 난 다른 위치를 확보할게.",
        "지원 한도는 전달하겠어. 누가 결정할지도 확인하자.",
        "그럼 난 남은 자원으로 할 수 있는 대응을 정리할게."
      ]
    ],
    "third": [
      [
        "두 사람의 의사는 확인됐어. 난 남은 위험을 살필게.",
        "지원이 제외된 곳은 내가 다른 위치에서 맡겠어.",
        "거절한 범위까지 확실히 공유하자. 오해가 없게.",
        "직접 지원 없이 가능한 선택을 내가 정리할게."
      ],
      [
        "위치를 바꾸는 동안 난 접근하는 위협을 확인할게.",
        "그럼 빈 후방은 내가 맡겠어. 둘 다 이동하진 마.",
        "바뀐 배치를 내가 전원에게 전달할게.",
        "이동에 필요한 자원을 먼저 확인해 둘게."
      ],
      [
        "설명에 빠진 단서는 내가 확인할게.",
        "위험은 알겠어. 우회할 수 있는 길을 내가 찾을게.",
        "당사자 선택은 확인했어. 경고만 짧게 전달할게.",
        "그 정보를 바탕으로 남은 지원 범위를 계산해 볼게."
      ],
      [
        "지금 가능한 방법을 내가 한 번 더 확인할게.",
        "대체 지원이 필요하면 난 외부 위험을 맡겠어.",
        "자원 한도는 공유할게. 동의한 방식만 진행하자.",
        "그럼 지원은 거기까지. 다음 구역 몫은 남겨 두자."
      ]
    ]
  }
];
function gateV12SafeChoice(p,index){
 const n=p&&Array.isArray(p.choices)?p.choices[index]:null;
 return Number.isInteger(n)&&n>=0&&n<=3?n:0;
}
function gateV12Scenario(ps,group){
 const candidate=[0,1,2,3].map(i=>{
  const chosen=ps.map(p=>gateV8Choice(p,i));
  const axes=chosen.map(c=>c.choice.axis);
  const distinct=new Set(axes).size;
  const danger=chosen.filter(c=>c.choice.axis===10||c.choice.axis===9||c.choice.axis===6).length;
  const spread=Math.max(...axes.map((v,n)=>ps[n].axes[v]))-Math.min(...axes.map((v,n)=>ps[n].axes[v]));
  const score=(distinct-1)*2.2+danger*.5+spread*.15+(i===1?.2:0)+(i===3?.1:0);
  return {index:i,score};
 });
 // In equally ranked scenes, choose the first scenario; never hash names or IDs.
 return candidate.sort((a,b)=>b.score-a.score||a.index-b.index)[0].index;
}
function gateV12Conversation(ps,group){
 if(!Array.isArray(ps)||ps.length<2||ps.length>3||ps.some(p=>!p||!Array.isArray(p.choices)))return null;
 const idx=gateV12Scenario(ps,group);
 const scene=GATE_V12_SCENES[idx],a=gateV12SafeChoice(ps[0],idx),b=gateV12SafeChoice(ps[1],idx);
 const lines=[
  {name:ps[0].name,role:ps[0].role,text:scene.first[a]},
  {name:ps[1].name,role:ps[1].role,text:scene.reply[a][b]}
 ];
 if(ps.length===3){
  const c=gateV12SafeChoice(ps[2],idx);
  lines.push({name:ps[2].name,role:ps[2].role,text:scene.third[b][c]});
 }
 return {id:scene.id,title:scene.title,situation:scene.situation,sceneIndex:idx,lines};
}
function gateV12DialogueHTML(ps,group){
 const r=gateV12Conversation(ps,group);
 if(!r)return "";
 const safe=gateEsc;
 return '<div class="chapter gate-dialogue-heading"><span>'+ (group==="trio"?"07":"06")+' / FIELD RADIO</span><h3>게이트 현장 교신</h3><p>'+safe(r.situation)+'</p></div>'+
 '<section class="gate-radio" aria-label="동행자 간 현장 교신">'+
 '<div class="gate-radio-meta"><span class="gate-radio-led"></span><span>NSD / FIELD RADIO</span><strong>'+safe(r.title)+'</strong></div>'+
 '<div class="gate-radio-lines">'+r.lines.map((line,i)=>
   '<div class="gate-radio-turn"><div class="gate-radio-speaker"><span class="gate-radio-index">'+String(i+1).padStart(2,"0")+'</span><strong>'+safe(line.name)+'</strong><small>'+safe(line.role)+'</small></div><p>'+safe(line.text)+'</p></div>'
 ).join("")+'</div></section>';
}
function gateV12PairBlock(a,b){return gateV12DialogueHTML([a,b],"pair")}
function gateV12TrioBlock(ps){return gateV12DialogueHTML(ps,"trio")}

// A shared pair/trio link may be rendered before the final dialogue script loads.
if(typeof gateRender==="function"&&typeof gateState!=="undefined"&&
   (gateState.tab==="pair"||gateState.tab==="trio"))gateRender();
