'use strict';
// 방향별 발신/수신 해석과 점수 기반 시너지·역효과 엔진
function linkSeed(a,b){return [a.id||a.name,b.id||b.name,a.role,b.role,a.axes.join(","),b.axes.join(","),a.choices.join(""),b.choices.join("")].join("|");}

function pickNonrepeat(pool,seed,key,ex){
 let x=teamPick(pool,seed,key);if(ex&&ex.includes(x)&&pool.length>1)x=pool[(pool.indexOf(x)+1)%pool.length];return x;
}

function directionLayers(src,dst,avoid){
 const seed=linkSeed(src,dst),v=interaction(src,dst);
 const rx=pickNonrepeat(SYNERGY_DB.rx[bandIndex(src.axes[1])][bandIndex(dst.axes[0])],seed,"rx",avoid?.parts[0]?.paragraph);
 const gap=src.axes[2]-dst.axes[2],det=gap>1.3?"lead":gap< -1.3?"follow":"together";
 const detect=pickNonrepeat(SYNERGY_DB.cues.detect[det],seed,"detect",avoid?.parts[1]?.paragraph);
 const supportType=src.axes[3]>=6.4&&src.axes[4]<5.2&&dst.axes[4]>6.1?"push":src.axes[3]>=6.4&&dst.axes[0]>=5.4?"welcome":src.axes[3]<4.5?"wait":"mixed";
 const supp=pickNonrepeat(SYNERGY_DB.cues.support[supportType],seed,"support",avoid?.parts[2]?.paragraph);
 const effectType=v.delta>10?"debuff":v.delta< -10?"synergy":"mixed";
 const impact=pickNonrepeat(SYNERGY_DB.cues.effect[effectType],seed,"effect",avoid?.parts[4]?.paragraph);
 const all=getScenarios(src.role);
 const roleIndex=4+(Math.round(src.axes[1]*5+dst.axes[0]*7+src.axes[3]*3)%4);
 const commonIndex=(Math.round(src.axes[2]*3+dst.axes[4]*7))%4;
 const sourceScene=all[roleIndex],receiveScene=getScenarios(dst.role)[commonIndex];
 const sourceAct=sourceScene?.opts?.[src.choices[roleIndex]]?.[0]||"상황을 살핀다";
 const receiveAct=receiveScene?.opts?.[dst.choices[commonIndex]]?.[0]||"상황을 살핀다";
 const roleDetail=src.role==="가이드"&&dst.role==="센티넬"?
   `${src.name}은(는) 자신의 가이딩 잔량과 ${dst.name}의 부하도 변화를 함께 확인할 필요가 있습니다. 가이딩을 수행한다면 그 범위와 종료 시점도 당사자와 합의해야 합니다.`:
   src.role==="센티넬"&&dst.role==="가이드"?
   `${src.name}이(가) 부하도 상승을 알리는 순간 ${dst.name}의 가이딩 잔량도 확인해야 합니다. 불편함을 숨기면 지원자가 필요한 시점을 가늠하기 어려워집니다.`:"";
 const ending=v.delta>10?
  `${src.name}→${dst.name}에서는 자극 ${v.stimulation}에 비해 완충 ${v.buffer}이 낮아 부담이 앞서기 쉽습니다. ${impact}`:
  v.delta< -10?`${src.name}→${dst.name}에서는 완충 ${v.buffer}이 자극 ${v.stimulation}보다 높게 나타나 상대가 숨 돌릴 여지가 있습니다. ${impact}`:
  `${src.name}→${dst.name}에서는 자극 ${v.stimulation}과 완충 ${v.buffer}이 비슷해 실제 행동의 시점에 따라 영향이 바뀔 수 있습니다. ${impact}`;
 const detectComparison=gap>1.3?
   `${src.name}의 전조 감지는 ${fixed(src.axes[2])}점으로 ${dst.name}보다 ${fixed(gap)}점 높습니다.`:
   gap< -1.3?`${src.name}의 전조 감지는 ${fixed(src.axes[2])}점으로 ${dst.name}보다 ${fixed(-gap)}점 낮습니다.`:
   `${src.name}의 전조 감지는 ${fixed(src.axes[2])}점으로 상대와 비슷한 수준입니다.`;
 const parts=[
 {label:"01 · 발신자의 행동이 상대에게 닿는 방식",paragraph:`${src.name}의 표현 강도는 ${fixed(src.axes[1])}점이고 ${dst.name}의 감각 수용은 ${fixed(dst.axes[0])}점입니다. ${rx}`},
 {label:"02 · 경고를 발견하는 순서",paragraph:`${detectComparison} ${detect}`},
 {label:"03 · 완충이 도움이 되거나 부담이 되는 순간",paragraph:`${src.name}의 완충 개입은 ${fixed(src.axes[3])}점, 경계 조율은 ${fixed(src.axes[4])}점입니다. ${supp}`},
 {label:"04 · 실제 선택에서 보이는 차이",paragraph:`${src.name}은(는) '${sourceScene.title}'에서 '${sourceAct}'를 선택했고, ${dst.name}은(는) '${receiveScene.title}'에서 '${receiveAct}'를 선택했습니다. ${roleDetail}`.trim()},
 {label:"05 · 이 방향의 시너지와 역효과",paragraph:ending}
 ];
 return {src:src.name,dst:dst.name,stimulation:v.stimulation,buffer:v.buffer,delta:v.delta,kind:effectType,parts,body:parts.map(x=>x.paragraph).join("\n\n")};
}

function contextualCardVariation(a,b,results){
 const x=a.axes,y=b.axes,seed=linkSeed(a,b);
 const detGap=Math.abs(x[2]-y[2]),supportGap=Math.abs(x[3]-y[3]),boundaryGap=Math.abs(x[4]-y[4]),recoveryGap=Math.abs(x[5]-y[5]),sensingGap=Math.abs(x[0]-y[0]);
 const faster=x[2]>=y[2]?a:b,slower=faster===a?b:a;
 const helper=x[3]>=y[3]?a:b,partner=helper===a?b:a;
 const strict=x[4]>=y[4]?a:b,loose=strict===a?b:a;
 const sensitive=x[0]>=y[0]?a:b,selective=sensitive===a?b:a;
 const lingering=x[5]>=y[5]?a:b,rested=lingering===a?b:a;
 const louder=x[1]*y[0]>=y[1]*x[0]?a:b,listener=louder===a?b:a;
 const guide=[a,b].find(p=>p.role==="가이드")||a;
 const sentinel=[a,b].find(p=>p.role==="센티넬")||{name:"지원 대상"};
 const shared=i=>a.choices?.[i]===b.choices?.[i];
 const packs={
  warning:{
   split:{
    act:[
     `${faster.name}이(가) 작은 이상을 먼저 알아채고 ${slower.name}이(가) 다른 정보로 그 의미를 확인할 수 있을 때입니다.`,
     `${faster.name}의 빠른 경고를 ${slower.name}이(가) 반박이 아닌 별도의 확인 과제로 받아들일 때입니다.`,
     `두 사람의 첫 번째 현장 판단이 다른 만큼 ${faster.name}은(는) 변화를 알리고 ${slower.name}은(는) 아직 확인되지 않은 부분을 맡을 때입니다.`
    ],
    end:[
     `${faster.name}이(가) 이유를 설명하기 전에 행동부터 시작해 ${slower.name}이(가) 경고의 근거를 따라가지 못할 때입니다.`,
     `${slower.name}의 확인 질문을 ${faster.name}이(가) 자신의 판단을 의심하는 행동으로 받아들일 때입니다.`,
     `두 사람이 전조를 알아차린 시점의 차이를 무시하고 반드시 같은 속도로 행동해야 한다고 압박할 때입니다.`,
     `${faster.name}이(가) 먼저 본 정보를 전달하지 않고 판단까지 혼자 결정해 ${slower.name}이(가) 다른 위험을 놓칠 때입니다.`,
     `${slower.name}이(가) 충분히 확인할 때까지 기다리는 사이 ${faster.name}이(가) 경고의 내용을 계속 바꿔 전달할 때입니다.`
    ]
   },
   close:{
    act:[
     `두 사람이 경고를 비슷한 시점에 받더라도 ${a.name}은(는) 위치를, ${b.name}은(는) 변화의 원인을 따로 확인할 때입니다.`,
     `${a.name}과(와) ${b.name}이(가) 같은 이상을 감지한 뒤 서로 다른 단서를 수집해 판단을 보완할 때입니다.`,
     `동시에 낌새를 알아차린 두 사람이 누가 먼저 경고했는지보다 무엇을 추가로 확인할지 정할 때입니다.`
    ],
    end:[
     `${a.name}과(와) ${b.name}이(가) 같은 단서만 반복해서 확인해 다른 위험이 관찰 범위 밖으로 밀릴 때입니다.`,
     `동시에 경고했다는 사실만으로 두 사람의 관찰이 완전히 일치한다고 착각할 때입니다.`,
     `한 사람이 확인한 근거를 다른 사람이 별도로 검증하지 않고 그대로 받아들일 때입니다.`,
     `둘 다 상대가 이미 주변을 살피고 있다고 믿어 실제 관찰 담당이 비어 버릴 때입니다.`,
     `같은 위험에 집중하는 동안 누가 다른 대원의 상태를 확인할지 정하지 않을 때입니다.`
    ]
   }
  },
  support:{
   split:{
    act:[
     `${helper.name}이(가) 구체적인 조정안을 제안하고 ${partner.name}이(가) 허용할 지원의 범위를 선택할 때입니다.`,
     `지원 속도가 다른 두 사람이 ${helper.name}에게 환경 정리를, ${partner.name}에게 상태 확인을 나누어 맡길 때입니다.`,
     `${helper.name}의 적극적인 완충과 ${partner.name}의 신중한 대응을 경쟁시키지 않고 순서로 연결할 때입니다.`
    ],
    end:[
     `${helper.name}이(가) 한 번 성공했던 개입을 ${partner.name}의 새로운 확인 없이 계속 반복할 때입니다.`,
     `${partner.name}이(가) 부탁을 미루는 동안 ${helper.name}이(가) 모든 지원 결정을 대신 내려 버릴 때입니다.`,
     `${helper.name}이(가) 직접 개입에만 집중해 ${partner.name}이(가) 원하는 환경 조정 방식을 놓칠 때입니다.`,
     `${partner.name}의 도움 거절을 ${helper.name}이(가) 위기의 부정으로 받아들여 지원 강도를 무작정 높일 때입니다.`,
     `${helper.name}이(가) 현장을 완충하는 동안 다른 역할을 맡은 ${partner.name}이(가) 필요한 상태 정보를 전달하지 않을 때입니다.`
    ]
   },
   close:{
    act:[
     `두 사람이 모두 돕고 싶어지는 순간 ${a.name}은(는) 주변 환경을, ${b.name}은(는) 당사자의 반응을 확인할 때입니다.`,
     `누구나 지원할 수 있다고 해서 동시에 움직이지 않고 ${a.name}과(와) ${b.name}이(가) 한 가지씩만 맡을 때입니다.`,
     `비슷한 완충 성향을 가진 두 사람이 한 사람은 질문을, 다른 한 사람은 조정을 맡을 때입니다.`
    ],
    end:[
     `두 사람이 같은 사람에게 동시에 개입해 오히려 자극을 늘릴 때입니다.`,
     `${a.name}과(와) ${b.name}이(가) 같은 지원을 반복하면서 누가 실제로 필요한 도움을 확인했는지 불분명해질 때입니다.`,
     `서로 상대가 완충을 담당하겠거니 생각해 정작 현장 조정이 시작되지 않을 때입니다.`,
     `한 사람이 이미 움직이고 있는데도 다른 사람이 같은 행동을 덧붙여 상대의 선택권을 좁힐 때입니다.`,
     `두 사람 모두 성공적인 수습만 신경 쓰느라 자신의 피로를 보고하지 않을 때입니다.`
    ]
   }
  },
  consent:{
   split:{
    act:[
     `${strict.name}이(가) 지원의 허용 범위를 정리하고 ${loose.name}이(가) 급할 때 먼저 실행할 조치를 분명히 밝힐 때입니다.`,
     `개입 전에 묻고 싶은 ${strict.name}의 기준과 즉시 움직이려는 ${loose.name}의 필요를 사전 합의로 연결할 때입니다.`,
     `${loose.name}이(가) 지원을 시작하기 전에 ${strict.name}에게 확인해야 할 질문을 줄여서 전달할 때입니다.`
    ],
    end:[
     `${loose.name}이(가) 위험하다는 이유로 ${strict.name}이(가) 요구한 확인 절차를 모두 무시할 때입니다.`,
     `${strict.name}이(가) 설명을 원하는 순간 ${loose.name}이(가) 이미 당사자의 선택을 대신 끝내 버릴 때입니다.`,
     `두 사람이 한 번 합의한 범위를 모든 게이트와 모든 상황에 무조건 적용할 때입니다.`,
     `${loose.name}이(가) 먼저 개입한 일을 ${strict.name}이(가) 뒤늦게 알아차리고 협력보다 항의가 앞서게 될 때입니다.`,
     `지원의 속도를 맞추려다 어느 대원도 실제 도움의 필요 여부를 다시 묻지 않을 때입니다.`
    ]
   },
   close:{
    act:[
     `${a.name}과(와) ${b.name}이(가) 비슷한 거리 기준을 바탕으로 직접 개입할 일과 물러설 일을 구분할 때입니다.`,
     `두 사람이 모두 확인을 중시하더라도 긴급 상황에는 누가 먼저 질문할지 정해 둘 때입니다.`,
     `익숙한 사이에서도 ${a.name}과(와) ${b.name}이(가) 지원 방식을 상황마다 다시 선택할 때입니다.`
    ],
    end:[
     `평소에 편안했다는 이유로 이번에도 상대가 같은 도움을 원할 것이라 단정할 때입니다.`,
     `두 사람 모두 상대의 의사를 기다리는 동안 실제 지원을 시작하는 사람이 사라질 때입니다.`,
     `${a.name}과(와) ${b.name}이(가) 동의의 표현을 각자 다르게 이해했는데도 다시 확인하지 않을 때입니다.`,
     `허용되는 도움을 정해 두었다는 이유로 당사자의 현재 거절을 듣지 않을 때입니다.`,
     `긴급 상황에 대한 예외를 정하지 않아 서로 질문만 반복하며 대응이 늦어질 때입니다.`
    ]
   }
  },
  recovery:{
   split:{
    act:[
     `${rested.name}이(가) 먼저 안정을 되찾더라도 ${lingering.name}의 남은 감각을 확인한 뒤 다음 행동을 정할 때입니다.`,
     `${rested.name}은(는) 후속 정보를 정리하고 ${lingering.name}은(는) 회복할 시간을 확보하는 식으로 일을 나눌 때입니다.`,
     `두 사람의 복귀 속도가 다른 점을 인정하고 ${lingering.name}이(가) 원할 때 다시 합류할 수 있는 일정을 만들 때입니다.`
    ],
    end:[
     `${rested.name}이(가) 자신의 빠른 회복을 기준으로 ${lingering.name}의 재진입 여부까지 결정할 때입니다.`,
     `${lingering.name}이(가) 아직 현장의 자극을 떠올리는데도 ${rested.name}이(가) 이미 끝난 일이라며 정리를 재촉할 때입니다.`,
     `두 사람에게 똑같은 휴식 시간을 배정하고 서로 다른 피로를 확인하지 않을 때입니다.`,
     `${lingering.name}이(가) 쉬고 싶다는 말을 꺼내기 어렵도록 ${rested.name}이(가) 다음 행동을 이미 확정해 버릴 때입니다.`,
     `먼저 안정된 사람이 다른 대원의 남은 부담을 단순한 기분 문제로 받아들일 때입니다.`
    ]
   },
   close:{
    act:[
     `${a.name}과(와) ${b.name}이(가) 비슷한 시기에 긴장을 내려놓더라도 각자 남은 자극을 한 번씩 확인할 때입니다.`,
     `두 사람이 함께 다음 계획을 세우기 전에 실제로 쉬어야 할 이유가 남았는지 따로 점검할 때입니다.`,
     `${a.name}과(와) ${b.name}이(가) 회복의 속도는 비슷해도 필요한 휴식 방식은 다를 수 있음을 인정할 때입니다.`
    ],
    end:[
     `둘 다 평온해 보인다는 이유로 쌓인 피로까지 모두 사라졌다고 생각할 때입니다.`,
     `${a.name}과(와) ${b.name}이(가) 같은 속도로 복귀하면서도 서로에게 남은 감각을 묻지 않을 때입니다.`,
     `한 번의 빠른 회복 경험을 다음 게이트에서도 그대로 재현할 수 있다고 가정할 때입니다.`,
     `서로 괜찮다고 대답했지만 누구도 구체적으로 남은 자극을 확인하지 않았을 때입니다.`,
     `쉬는 시간은 맞췄지만 각자 원하는 환경이 달라 오히려 피로를 더하는 상황입니다.`
    ]
   }
  },
  coverage:{
   split:{
    act:[
     `${sensitive.name}이(가) 작은 변화를 기록하고 ${selective.name}이(가) 실제 조치가 필요한 정보부터 고를 때입니다.`,
     `자극을 넓게 받아들이는 ${sensitive.name}과(와) 정보의 우선순위를 정하는 ${selective.name}이(가) 관찰 결과를 교환할 때입니다.`,
     `${sensitive.name}은(는) 미세 신호를 맡고 ${selective.name}은(는) 그 신호가 반복되는지 확인해 역할을 겹치지 않을 때입니다.`
    ],
    end:[
     `${selective.name}이(가) 자신에게는 거슬리지 않는다는 이유로 ${sensitive.name}의 관찰을 삭제해 버릴 때입니다.`,
     `${sensitive.name}이(가) 포착한 모든 자극을 같은 위험 수준으로 보고해 ${selective.name}이(가) 우선순위를 정하기 어려워질 때입니다.`,
     `두 사람이 각자 보고 싶은 신호만 고르고 서로의 관찰 범위를 확인하지 않을 때입니다.`,
     `${selective.name}이(가) 중요한 신호를 추리는 동안 ${sensitive.name}이(가) 무시당한다고 느껴 정보 공유를 멈출 때입니다.`,
     `서로 다른 감각 문턱을 보완 관계가 아닌 능력의 우열로 받아들일 때입니다.`
    ]
   },
   close:{
    act:[
     `${a.name}과(와) ${b.name}이(가) 비슷한 자극을 느끼더라도 서로 다른 위치를 살피기로 할 때입니다.`,
     `두 사람이 같은 소리를 들은 뒤 서로 무엇을 놓쳤는지 확인하는 과정까지 이어질 때입니다.`,
     `감각 수용이 닮은 두 사람이 관찰 대상을 분할해 서로의 사각지대를 줄일 때입니다.`
    ],
    end:[
     `두 사람이 같은 자극에 주의를 빼앗겨 다른 환경 변화가 뒤늦게 발견될 때입니다.`,
     `${a.name}과(와) ${b.name}이(가) 서로의 감각이 같을 것이라 믿어 실제 관찰 정보를 교환하지 않을 때입니다.`,
     `같은 종류의 소음만 경계하다가 다른 감각 신호를 누가 맡는지 정하지 않을 때입니다.`,
     `한 사람의 보고가 다른 사람의 기억과 같다는 이유로 검증이 생략될 때입니다.`,
     `관찰할 범위가 분리되지 않아 같은 단서만 중복해서 기록할 때입니다.`
    ]
   }
  },
  sg:{
   split:{
    act:[
     `${sentinel.name}이(가) 부하도 전조를 구체적으로 알리고 ${guide.name}이(가) 현재 감당할 수 있는 가이딩 범위를 스스로 선택할 때입니다.`,
     `${guide.name}의 지원 여력을 먼저 확인하고 ${sentinel.name}이(가) 꼭 필요한 도움을 좁혀 요청할 때입니다.`,
     `가이딩이 필요할지 불분명한 단계에서 ${sentinel.name}의 상태와 ${guide.name}의 잔량을 따로 살핀 뒤 결정할 때입니다.`
    ],
    end:[
     `${guide.name}의 가이딩 잔량이 줄어드는 동안 ${sentinel.name}의 요청이 이전과 같은 강도로 계속될 때입니다.`,
     `${sentinel.name}의 부하도가 안정되었다는 이유로 ${guide.name}의 피로까지 회복되었다고 판단할 때입니다.`,
     `${guide.name}이(가) 지원 가능한 범위를 줄여야 하는 상황인데도 대체 조치를 미리 정하지 않을 때입니다.`,
     `${sentinel.name}이(가) 지원 요청을 숨기고 ${guide.name}이(가) 남은 가이딩 잔량을 충분히 확인하지 못한 채 대응할 때입니다.`,
     `${guide.name}이(가) 거절할 수 없는 분위기에서 연속 가이딩을 요구해 공명 고갈 위험을 키울 때입니다.`
    ]
   },
   close:{
    act:[
     `${sentinel.name}의 지원 요청과 ${guide.name}의 가이딩 여력이 모두 확인된 뒤 도움의 순서를 정할 때입니다.`,
     `두 사람이 필요한 지원의 강도를 맞추고 현장 조정과 가이딩 중 어떤 대응을 먼저 택할지 정할 때입니다.`,
     `${sentinel.name}의 변화와 ${guide.name}의 피로를 동시에 살피되 둘을 하나의 자원처럼 취급하지 않을 때입니다.`
    ],
    end:[
     `첫 가이딩이 잘 끝났다는 이유로 두 번째 요청의 조건을 생략할 때입니다.`,
     `${sentinel.name}이(가) 원하는 지원 방식이 바뀌었는데 ${guide.name}이(가) 이전 선택을 그대로 반복할 때입니다.`,
     `${guide.name}의 잔량 확인보다 현장을 빨리 끝내는 일이 우선되면서 다음 지원을 감당할 여유를 놓칠 때입니다.`,
     `도움을 받은 뒤 두 사람의 상태를 따로 확인하지 않고 곧바로 다음 행동에 들어갈 때입니다.`,
     `상황이 바뀌어도 기존의 지원 강도가 충분하거나 안전할 것이라 가정할 때입니다.`
    ]
   }
  },
  overload:{
   split:{
    act:[
     `${louder.name}이(가) 빠른 지시를 거듭하고 ${listener.name}이(가) 이미 처리 중인 자극에서 벗어나지 못하는 상황입니다.`,
     `${listener.name}에게 여러 감각 신호가 겹친 순간 ${louder.name}이(가) 더 큰 표현으로 주의를 끌려 할 때입니다.`,
     `${louder.name}의 행동 변화가 ${listener.name}에게 필요한 경고보다 추가적인 압박으로 전달되기 시작할 때입니다.`
    ],
    end:[
     `${listener.name}이(가) 잠시 대답하지 못한 것을 ${louder.name}이(가) 무시당한 것으로 받아들여 표현을 더 강하게 할 때입니다.`,
     `${louder.name}이(가) 긴급하지 않은 설명까지 한꺼번에 쏟아내 ${listener.name}이(가) 중요한 신호를 구분하지 못할 때입니다.`,
     `이미 지친 ${listener.name}에게 ${louder.name}이(가) 속도를 맞추라고 요구하며 새로운 행동을 연속 지시할 때입니다.`,
     `말을 짧게 줄일 기회를 놓친 채 ${louder.name}이(가) 같은 경고를 점점 큰 강도로 반복할 때입니다.`,
     `${listener.name}의 감각 부담을 확인할 사람이 없는 상태에서 ${louder.name}이(가) 새로운 자극을 계속 더할 때입니다.`
    ]
   },
   close:{
    act:[
     `두 사람이 평소에는 자극을 주고받는 데 무리가 없지만 위기 중 전달 속도가 갑자기 빨라지는 상황입니다.`,
     `${a.name}과(와) ${b.name}이(가) 서로의 반응을 충분히 확인하지 않고 동시에 설명을 늘려 갈 때입니다.`,
     `현장에 경고가 겹쳐 어느 말부터 행동으로 옮길지 기준이 흐려질 때입니다.`
    ],
    end:[
     `평소 괜찮았던 표현 강도를 위기 상황에서도 그대로 유지해 상대의 피로를 놓칠 때입니다.`,
     `${a.name}과(와) ${b.name}이(가) 동시에 빠르게 반응해 중요한 지시를 서로 다르게 이해할 때입니다.`,
     `한 사람의 경고를 다른 사람이 재차 크게 전달하면서 불필요한 긴장만 누적될 때입니다.`,
     `상대가 못 들었다고 가정해 확인 질문 대신 반복된 지시만 보내는 순간입니다.`,
     `둘 다 상황을 빨리 끝내려다 말의 강도를 조절할 여유를 잃을 때입니다.`
    ]
   }
  },
  boundary:{
   split:{
    act:[
     `${loose.name}이(가) 먼저 개입하고 ${strict.name}이(가) 충분한 설명을 받기 전에 선택권을 잃었다고 느끼는 순간입니다.`,
     `${strict.name}이(가) 확인을 원하지만 ${loose.name}이(가) 행동을 늦출 수 없다고 판단해 의견이 엇갈릴 때입니다.`,
     `동료 보호를 먼저 생각한 ${loose.name}의 개입이 ${strict.name}에게는 허용 범위를 넘어선 행동으로 닿을 때입니다.`
    ],
    end:[
     `${loose.name}이(가) 자신의 선의를 설명하는 데 집중해 ${strict.name}이(가) 불편하다고 말한 범위를 다시 넘을 때입니다.`,
     `${strict.name}의 거절을 ${loose.name}이(가) 위험을 모른다는 뜻으로 받아들여 더 강하게 개입할 때입니다.`,
     `두 사람이 같은 지원에 서로 다른 동의 기준을 적용한다는 점을 확인하지 않은 채 다음 행동을 반복할 때입니다.`,
     `${loose.name}의 빠른 조치를 사후에 설명하는 것으로 모든 동의가 끝났다고 판단할 때입니다.`,
     `${strict.name}이(가) 필요한 도움을 요청하기 어려워질 만큼 ${loose.name}이(가) 행동을 먼저 결정할 때입니다.`
    ]
   },
   close:{
    act:[
     `${a.name}과(와) ${b.name}이(가) 평소 비슷한 경계를 공유하지만 예상 밖의 상황에서 확인을 생략하는 순간입니다.`,
     `서로 편안했던 이전 경험을 근거로 새 상황의 지원 범위도 이미 정해졌다고 생각할 때입니다.`,
     `두 사람이 모두 상대의 의사를 존중하려 하면서도 긴급한 장면에서 서로가 먼저 결정하기를 기다릴 때입니다.`
    ],
    end:[
     `동의가 한 번 확인되었다는 이유로 상황이 바뀐 뒤의 거절을 듣지 않을 때입니다.`,
     `둘 다 상대가 이미 알고 있다고 생각해 개입의 범위를 구체적으로 말하지 않을 때입니다.`,
     `급박한 위기에서 묻고 답할 순서가 정해져 있지 않아 지원이 늦어질 때입니다.`,
     `서로의 경계가 비슷하다는 사실만 믿고 실제 불편함을 다시 확인하지 않을 때입니다.`,
     `한쪽의 침묵을 다른 쪽이 허락으로 해석하는 일이 반복될 때입니다.`
    ]
   }
  },
  delay:{
   split:{
    act:[
     `${faster.name}이(가) 전조를 먼저 알아차렸지만 ${slower.name}에게는 왜 행동해야 하는지 근거가 부족한 순간입니다.`,
     `${slower.name}이(가) 관찰 내용을 확인하는 사이 ${faster.name}이(가) 이미 다음 대응을 시작해 버릴 때입니다.`,
     `두 사람의 경고 시점이 벌어져 ${faster.name}에게는 긴급하고 ${slower.name}에게는 확인이 필요한 상황입니다.`
    ],
    end:[
     `${faster.name}이(가) 결론만 반복하고 ${slower.name}의 확인 질문에는 답하지 않을 때입니다.`,
     `${slower.name}이(가) 근거를 기다리는 동안 ${faster.name}이(가) 위험의 범위가 달라졌다는 사실을 공유하지 않을 때입니다.`,
     `누가 어떤 신호를 먼저 보았는지 전달되지 않아 ${slower.name}이(가) 한 단계 뒤의 행동만 따라가게 될 때입니다.`,
     `${faster.name}이(가) 급하다는 이유로 관찰 사실과 추측을 구분하지 않을 때입니다.`,
     `${slower.name}이(가) 확인을 끝내기도 전에 ${faster.name}이(가) 새로운 지시를 연달아 내릴 때입니다.`
    ]
   },
   close:{
    act:[
     `${a.name}과(와) ${b.name}이(가) 같은 경고를 확인하면서도 누가 행동을 시작할지 정하지 않은 순간입니다.`,
     `서로의 관찰 속도가 비슷해 같은 단서에 집중하느라 다른 정보를 놓치는 상황입니다.`,
     `동시에 이상을 발견한 두 사람이 서로 상대가 보고할 것으로 생각해 첫 경고가 늦어질 때입니다.`
    ],
    end:[
     `같은 이상을 발견했으나 서로 다른 단서를 말하지 않아 판단이 충분하다고 착각할 때입니다.`,
     `${a.name}과(와) ${b.name}이(가) 모두 경고하는 데 집중해 실제 행동을 정하는 사람이 없을 때입니다.`,
     `상대가 이미 보고했을 것이라 생각한 정보가 끝내 공유되지 않을 때입니다.`,
     `첫 경고의 내용을 서로 되풀이하기만 하고 추가 확인이 이루어지지 않을 때입니다.`,
     `위험을 알아차린 사실에 안심해 그 위험이 어느 정도인지 따로 확인하지 않을 때입니다.`
    ]
   }
  },
  burnout:{
   split:{
    act:[
     `${helper.name}이(가) 현장 조정과 동료의 상태 확인을 모두 맡고 ${partner.name}은(는) 후속 역할을 기다리는 상황입니다.`,
     `완충 개입의 적극성이 다른 두 사람이 별도 역할 없이 움직이면서 ${helper.name}에게 일감이 집중될 때입니다.`,
     `${helper.name}의 빠른 도움이 자연스럽게 반복되어 ${partner.name}이(가) 지원 책임을 분담할 기회를 놓칠 때입니다.`
    ],
    end:[
     `${helper.name}이(가) 이미 피로를 느끼는데도 이번에도 자신이 해야 한다고 생각해 교대를 요청하지 않을 때입니다.`,
     `${partner.name}이(가) 지원을 부탁할 때만 움직여 ${helper.name}의 직접 개입과 상황 관찰을 모두 남겨 둘 때입니다.`,
     `수습이 성공했다는 이유로 ${helper.name}의 감각적 부담을 별도로 확인하지 않을 때입니다.`,
     `${helper.name}이(가) 상황을 계속 책임지는 동안 ${partner.name}이(가) 다른 작업을 맡지 않아 다음 위험에 대비하지 못할 때입니다.`,
     `교대 기준이 없어서 ${helper.name}이(가) 부담을 알릴 때까지 역할이 한 사람에게 고정될 때입니다.`
    ]
   },
   close:{
    act:[
     `둘 다 주변을 도우려 하지만 누구에게 어떤 역할이 남았는지 구분하지 않아 부담이 겹칠 때입니다.`,
     `${a.name}과(와) ${b.name}이(가) 똑같은 지원을 반복하고 자신의 상태를 확인할 담당을 비워 둘 때입니다.`,
     `두 사람이 동시에 해결하려다 서로의 판단을 확인하는 일을 미룰 때입니다.`
    ],
    end:[
     `둘 다 상대가 수습을 마무리할 것으로 생각해 중요한 후속 점검이 비어 버릴 때입니다.`,
     `동시에 도움을 주는 데 집중해 두 사람 모두 회복 시간을 충분히 확보하지 못할 때입니다.`,
     `한 사람이 물러나야 할 순간을 정하지 않아 중복된 지원이 계속될 때입니다.`,
     `${a.name}과(와) ${b.name}이(가) 서로의 행동을 보완하지 못하고 같은 일에 시간을 쓸 때입니다.`,
     `누가 먼저 쉬어야 하는지 논의하지 않은 채 둘 다 버티는 선택을 할 때입니다.`
    ]
   }
  },
  restGap:{
   split:{
    act:[
     `${rested.name}이(가) 재진입 계획을 세우는 동안 ${lingering.name}은(는) 아직 현장의 긴장을 정리하지 못한 상황입니다.`,
     `${lingering.name}이(가) 회복에 필요한 조건을 설명하기 전에 ${rested.name}이(가) 임무 종료를 곧바로 다음 행동의 시작으로 받아들일 때입니다.`,
     `서로 다른 회복 속도 때문에 ${rested.name}에게는 짧은 휴식이 충분하고 ${lingering.name}에게는 부족한 상황입니다.`
    ],
    end:[
     `${rested.name}이(가) 자신은 괜찮다며 ${lingering.name}의 피로를 사소한 문제로 판단할 때입니다.`,
     `${lingering.name}이(가) 쉬어야 한다고 말했는데도 ${rested.name}이(가) 다음 일정을 확정해 버릴 때입니다.`,
     `두 사람 모두 같은 시간 동안 쉬었으므로 회복 상태도 같을 것이라고 받아들일 때입니다.`,
     `${rested.name}이(가) 다음 게이트를 준비하는 속도에 ${lingering.name}이(가) 무리하게 맞추려 할 때입니다.`,
     `${lingering.name}이(가) 남은 자극을 설명하기 어려워하자 ${rested.name}이(가) 괜찮아졌다고 오해할 때입니다.`
    ]
   },
   close:{
    act:[
     `두 사람 모두 빠르게 평소 리듬을 찾지만 남은 피로를 따로 점검하지 않는 상황입니다.`,
     `${a.name}과(와) ${b.name}이(가) 비슷한 속도로 회복해도 무엇이 남았는지 확인하지 않고 재진입을 결정할 때입니다.`,
     `쉬는 시간에 대한 합의는 쉽지만 실제 회복 환경까지 같은 것으로 착각하는 순간입니다.`
    ],
    end:[
     `둘 다 회복했다고 말한 뒤 사후 점검 없이 계속해서 다음 임무로 넘어갈 때입니다.`,
     `같은 속도로 안정을 찾았다는 사실만 보고 한 사람의 숨은 감각 피로를 놓칠 때입니다.`,
     `빠른 복귀가 익숙해져 필요할 때 휴식을 더 요청하기 어려워질 때입니다.`,
     `자극은 가라앉았지만 사건 이후 남은 피로를 확인하지 않을 때입니다.`,
     `두 사람 모두 상대에게 부담이 될까 봐 실제로 필요한 휴식을 말하지 않을 때입니다.`
    ]
   }
  },
  guideLimit:{
   split:{
    act:[
     `${guide.name}에게 이전 가이딩 요청이 반복되면서 현재 잔량을 별도로 확인할 시간이 부족한 상황입니다.`,
     `${guide.name}이(가) 주변 요청에 빠르게 대응하지만 남은 가이딩 잔량을 공유하지 않은 상태에서 추가 지원이 시작될 때입니다.`,
     `한 번의 지원이 성공한 뒤 ${guide.name}에게 또 다른 가이딩이 이어져 공명 고갈에 가까워질 수 있는 상황입니다.`
    ],
    end:[
     `${guide.name}이(가) 남은 잔량을 말하기 전에 다음 가이딩의 강도와 순서가 이미 정해질 때입니다.`,
     `${guide.name}의 이전 지원 성공을 이유로 피로 누적을 확인하지 않을 때입니다.`,
     `${sentinel?sentinel.name+"의 부하도 변화":"외부 지원 대상의 상태"}만 살피고 ${guide.name}의 가이딩 잔량 소모는 보고에서 빠질 때입니다.`,
     `${guide.name}이(가) 지원을 줄이거나 교대를 요청할 여지가 없어 공명 고갈 전조를 늦게 알릴 때입니다.`,
     `가이딩을 이어갈 수 없게 된 뒤에야 다른 동료에게 역할을 넘기는 계획을 세울 때입니다.`
    ]
   },
   close:{
    act:[
     `${guide.name}의 지원 여력은 남아 있지만 다음 요청을 위한 자원 배분을 정하지 않은 상황입니다.`,
     `현장에 여유가 있는 순간에도 ${guide.name}의 가이딩 잔량을 확인하지 않고 지원 계획을 고정할 때입니다.`,
     `가이딩이 필요할 수 있다는 판단만으로 ${guide.name}이(가) 언제 지원해야 하는지 이미 결정된 듯 행동할 때입니다.`
    ],
    end:[
     `필요한 지원의 규모가 바뀌었는데도 처음 정한 가이딩 계획을 수정하지 않을 때입니다.`,
     `${guide.name}의 잔량을 확인했더라도 실제로 남길 여유를 정하지 않아 지원이 길어질 때입니다.`,
     `지원 직후에는 괜찮다는 말만 듣고 다음 요청까지의 회복 시간을 무시할 때입니다.`,
     `가이딩의 횟수만 기록하고 ${guide.name}의 주관적인 피로와 실제 잔량 변화를 따로 살피지 않을 때입니다.`,
     `가이딩을 수행하지 않는 대응도 가능한 상황에서 ${guide.name}에게만 요청을 집중할 때입니다.`
    ]
   }
  }
 };
 const keyFor={
  "경고와 검증을 이어 주는 협력":"warning","같은 경고를 다른 근거로 확인하기":"warning",
  "완충 효과를 살리는 실제 지원 순서":"support",
  "동의가 빠르게 전달되는 약속 만들기":"consent",
  "다음 행동을 결정하는 이중 회복 점검":"recovery",
  "서로 보지 못하는 신호를 교환하기":"coverage",
  "가이딩 요청을 실제로 조율하는 순서":"sg",
  "강한 표현이 경고를 넘어 압박이 되는 순간":"overload",
  "도움의 순서가 어긋나 생기는 반발":"boundary",
  "경고가 전달되지 않아 벌어지는 시간차":"delay",
  "한 사람에게 몰리는 수습 책임":"burnout",
  "한 사람의 복귀 선언이 만드는 압박":"restGap",
  "가이딩 잔량을 생각하지 않은 연속 요청":"guideLimit"
 };
 const chosen={
  warning:detGap>1.8||!shared(0)?"split":"close",
  support:supportGap>1.8||boundaryGap>2?"split":"close",
  consent:boundaryGap>1.8||!shared(2)?"split":"close",
  recovery:recoveryGap>1.8?"split":"close",
  coverage:sensingGap>1.8?"split":"close",
  sg:guide.axes[3]>7||guide.axes[5]>6.5?"split":"close",
  overload:Math.max(x[1]*y[0],y[1]*x[0])>46?"split":"close",
  boundary:boundaryGap>1.8?"split":"close",
  delay:detGap>1.8||!shared(0)?"split":"close",
  burnout:supportGap>1.8?"split":"close",
  restGap:recoveryGap>1.8?"split":"close",
  guideLimit:guide.axes[3]>7||guide.axes[5]>6.5?"split":"close"
 };
 const diversify=(card,type)=>{
   const key=keyFor[card.title];if(!key)return card;
   const group=packs[key][chosen[key]];
   const prefix=type==="synergy"?"**활성 조건**":"**발동 계기**";
   const suffix=type==="synergy"?"**깨지는 순간**":(/확대 경로/.test(card.text)?"**확대 경로**":"**악화 지점**");
   const afterLabel=card.text.slice(card.text.indexOf(prefix)+prefix.length).trim();
   const oldEnding=afterLabel.indexOf(suffix);
   if(oldEnding<0)throw Error("카드 결과 형식 오류: "+card.title);
   const prior=afterLabel.slice(0,oldEnding).trim();
   const period=prior.indexOf("다.");
   if(period<0)throw Error("활성 조건 분리 오류: "+card.title);
   const middle=prior.slice(period+2).trim();
   const activation=teamPick(group.act,seed,"entry-"+key+"-"+chosen[key]);
   const breakpoint=teamPick(group.end,seed,"break-"+key+"-"+chosen[key]);
   return {...card,text:`${prefix} ${activation} ${middle?middle+" ":""}${suffix} ${breakpoint}`,variationKey:key+":"+chosen[key]};
 };
 return {synergies:results.synergies.map(c=>diversify(c,"synergy")),debuffs:results.debuffs.map(c=>diversify(c,"debuff"))};
}

function relationshipCards(a,b,ab,ba){
 const x=a.axes,y=b.axes,seed=linkSeed(a,b),gap=Math.abs(x[2]-y[2]);
 const first=x[2]>=y[2]?a:b,verify=first===a?b:a;
 const buffer=ab.buffer>=ba.buffer?a:b,receiver=buffer===a?b:a;
 const direct=buffer===a?ab:ba;
 const higherBoundary=x[4]>=y[4]?a:b,lowerBoundary=higherBoundary===a?b:a;
 const leadSupport=x[3]>=y[3]?a:b,otherSupport=leadSupport===a?b:a;
 const longer=x[5]>=y[5]?a:b,earlier=longer===a?b:a;
 const biggerExposure=x[1]*y[0]>=y[1]*x[0]?a:b,biggerReceiver=biggerExposure===a?b:a;
 const heavier=ab.delta>=ba.delta?a:b,heavierTarget=heavier===a?b:a;
 const guides=[a,b].filter(p=>p.role==="가이드");
 const scenario=(p,i)=>getScenarios(p.role)[i]?.opts?.[p.choices[i]]?.[0]||"현재 상황을 확인한다";
 const any=(key,options)=>teamPick(options,seed,"card-"+key);
 const synergies=[
  {
   weight:40+Math.max(x[2],y[2])*5+gap*2,
   title:gap>1.5?"경고와 검증을 이어 주는 협력":"같은 경고를 다른 근거로 확인하기",
   text:`**활성 조건** ${first.name}이(가) 발견한 기척을 결론이 아닌 관찰 사실로 전하고, ${verify.name}이(가) 다른 정보로 교차 확인할 때입니다. ${any("warning",[
     `${first.name}은(는) '무엇이 달라졌는가'를 먼저 알리고 ${verify.name}은(는) '그 변화가 반복되는가'를 살필 수 있습니다.`,
     `${verify.name}에게 모든 경고를 따라 하게 하기보다, ${first.name}이(가) 놓친 방향을 맡기는 편이 더 유용합니다.`,
     `첫 경고를 듣는 즉시 둘 다 뛰어들기보다 ${first.name}은(는) 발생 위치를, ${verify.name}은(는) 경고 이전의 상황을 확인하는 방식이 가능합니다.`,
     `경고의 내용과 아직 확인되지 않은 추측을 분리하면 ${verify.name}이(가) ${first.name}의 판단을 부정하지 않고 검증에 참여할 수 있습니다.`
   ])} **깨지는 순간** 서로 같은 단서만 반복 확인하거나, 상대의 첫 경고를 근거 없이 무시할 때입니다.`
  },
  {
   weight:35+direct.buffer*.5,
   title:"완충 효과를 살리는 실제 지원 순서",
   text:`**활성 조건** ${receiver.name}이(가) 필요한 도움의 종류를 먼저 밝히거나 ${buffer.name}이(가) 짧은 선택지를 제안할 때입니다. ${any("support",[
     `${buffer.name}은(는) 바로 가까이 다가가기보다 '자극을 줄일까, 잠시 역할을 바꿀까?'처럼 구체적인 조정 방법을 제시할 수 있습니다.`,
     `${receiver.name}이(가) 지금은 대화보다 환경 정리를 원한다면 ${buffer.name}은(는) 직접적인 개입 대신 주변 소음이나 동선을 조정하는 역할을 택할 수 있습니다.`,
     `지원의 목적을 '상대를 즉시 안정시키기'보다 '상대가 다음 행동을 선택할 여유 만들기'로 잡으면 ${buffer.name}의 개입이 일방적인 통제가 되지 않습니다.`,
     `${buffer.name}은(는) 먼저 당사자의 부담이 무엇인지 확인하고 ${receiver.name}은(는) 받아들일 수 있는 도움의 범위를 답하는 식으로 순서를 나눌 수 있습니다.`
   ])} **깨지는 순간** ${buffer.name}이(가) 편하다고 생각한 방식을 ${receiver.name}의 확인 없이 반복할 때입니다.`
  },
  {
   weight:25+Math.min(x[4],y[4])*6,
   title:"동의가 빠르게 전달되는 약속 만들기",
   text:`**활성 조건** 게이트 진입 전에 두 사람이 '말로 경고하기 / 위치 바꾸기 / 직접 지원하기' 중 어디까지 먼저 해도 좋은지 정할 때입니다. ${any("consent",[
     `${higherBoundary.name}이(가) 질문을 정리하고 ${lowerBoundary.name}이(가) 긴급 상황에서 바로 필요한 행동을 제안하면 확인 절차가 길어지지 않습니다.`,
     `${a.name}과(와) ${b.name}은(는) 직접 도움을 받기 싫은 때 사용할 짧은 거절 신호를 정해 불필요한 실랑이를 줄일 수 있습니다.`,
     `서로의 선택권을 남기면서도 위험이 커지면 어떤 도움부터 허용할지 한두 단계로 합의해 두면 대응이 빠릅니다.`,
     `허용된 지원과 반드시 다시 물어봐야 하는 지원을 구분해 두면 익숙해진 사이에서도 경계를 놓치지 않을 수 있습니다.`
   ])} **깨지는 순간** 평소의 동의를 모든 상황에 대한 영구적인 허락으로 받아들일 때입니다.`
  },
  {
   weight:65-Math.abs(x[5]-y[5])*4,
   title:"다음 행동을 결정하는 이중 회복 점검",
   text:`**활성 조건** 게이트 종료 직후 ${earlier.name}이(가) 먼저 괜찮아졌더라도 ${longer.name}의 상태 확인이 끝날 때까지 재진입 결정을 유보하는 경우입니다. ${any("recovery",[
     `둘 다 '지금 다시 들어갈 수 있는가'와 '조용한 장소가 필요한가'를 따로 답하면 겉으로 보이는 침착함만으로 일정을 정하지 않게 됩니다.`,
     `${longer.name}에게는 감각을 정리할 시간이, ${earlier.name}에게는 다음 단계에 필요한 정보를 모을 시간이 주어질 수 있습니다.`,
     `재진입을 논의할 때 바로 찬반을 묻기보다 각자 남아 있는 자극 하나씩을 확인하면 다른 회복 속도를 실무적으로 반영할 수 있습니다.`,
     `한 사람이 먼저 회복하더라도 그 여유를 다른 사람의 회복을 재촉하는 데 쓰지 않고 후속 정보 정리에 쓸 수 있습니다.`
   ])} **깨지는 순간** 한 사람의 빠른 회복을 두 사람 모두의 복귀 준비로 오인할 때입니다.`
  },
  {
   weight:40+Math.abs(x[0]-y[0])*3+gap*2,
   title:"서로 보지 못하는 신호를 교환하기",
   text:`**활성 조건** ${x[0]>=y[0]?a.name:b.name}이(가) 미세한 변화의 목록을 만들고, ${x[0]>=y[0]?b.name:a.name}이(가) 그중 실제 대응이 필요한 신호를 좁혀 줄 때입니다. ${any("coverage",[
     `둘 다 같은 장면만 관찰하면 장점이 줄어듭니다. 한 사람은 동료의 반응을, 다른 사람은 주변의 환경을 맡는 방식이 더 구체적입니다.`,
     `작은 변화가 많아질 때는 모든 자극을 보고하기보다 평소와 달라진 항목 세 가지를 추려 공유하는 방식이 가능합니다.`,
     `두 사람이 포착한 정보가 다르다면 그 차이를 불일치로 보지 않고 다음에 확인할 단서로 활용할 수 있습니다.`,
     `세부 신호를 모으는 역할과 그것을 행동으로 옮길지 결정하는 역할이 분리되면 정보의 과잉을 줄일 수 있습니다.`
   ])} **깨지는 순간** 한쪽의 감각 문턱만 정상이라고 정해 상대의 관찰을 배제할 때입니다.`
  }
 ];
 if(a.role!==b.role){
  const sentinel=a.role==="센티넬"?a:b,guide=a.role==="가이드"?a:b;
  synergies.push({
   weight:65,title:"가이딩 요청을 실제로 조율하는 순서",
   text:`**활성 조건** ${sentinel.name}이(가) 부하도 전조와 원하는 지원을 알리고 ${guide.name}이(가) 자신의 가이딩 잔량을 고려해 가능한 범위를 제안할 때입니다. ${any("sg",[
     `가이딩을 바로 결정하기 전에 ${sentinel.name}은(는) 현재 어려운 감각을 설명하고, ${guide.name}은(는) 환경 조정만으로 대응할 여지가 있는지 먼저 살필 수 있습니다.`,
     `한 번 지원한 뒤에도 두 사람의 상태를 따로 확인하면 ${guide.name}의 소모를 감춘 채 다음 요청을 이어가는 상황을 줄일 수 있습니다.`,
     `${guide.name}은(는) 지원 가능한 범위를 먼저 알리고 ${sentinel.name}은(는) 그 범위 안에서 어떤 조치가 가장 필요한지 선택할 수 있습니다.`,
     `요청을 거절하거나 미루는 순간에도 ${sentinel.name}의 안전을 위해 다른 대안이나 외부 지원 방법을 함께 찾을 수 있습니다.`
   ])} **깨지는 순간** ${guide.name}의 이전 가이딩 성공을 현재 잔량과 관계없는 무제한 지원으로 생각할 때입니다.`
  });
 }
 const synergiesOrdered=synergies.sort((v,w)=>w.weight-v.weight);
 const debuffs=[
  {
   weight:Math.max(x[1]*y[0],y[1]*x[0]),
   title:"강한 표현이 경고를 넘어 압박이 되는 순간",
   text:`**발동 계기** ${biggerExposure.name}이(가) 빠른 지시를 반복하는 동안 ${biggerReceiver.name}이(가) 이미 여러 자극을 처리하고 있는 상황입니다. ${any("overload",[
     `지시를 더 크게 반복하면 필요한 정보보다 긴장만 늘어날 수 있습니다. ${biggerExposure.name}은(는) 한 번에 한 가지 행동만 전달하는 편이 좋습니다.`,
     `${biggerReceiver.name}이(가) 답이 늦더라도 못 들었다고 단정하지 말고 다른 신호를 처리 중인지 확인하는 편이 좋습니다.`,
     `표현의 강도를 갑자기 높이는 대신 현재 위험, 필요한 행동, 확인할 시간의 순서로 알리면 추가 자극을 줄일 수 있습니다.`,
     `급한 현장에서는 말의 양을 줄이고 ${biggerReceiver.name}이(가) 확인한 내용을 한 번 되짚도록 하는 편이 안정적입니다.`
   ])} **확대 경로** 경고를 이해하지 못했다고 판단해 발신자가 더 강한 표현을 반복하는 경우입니다.`
  },
  {
   weight:35+Math.abs(x[4]-y[4])*9,
   title:"도움의 순서가 어긋나 생기는 반발",
   text:`**발동 계기** ${lowerBoundary.name}이(가) 먼저 해결하려는 행동을 하고 ${higherBoundary.name}이(가) 그 범위를 확인하고 싶어 하는 순간입니다. ${any("boundary",[
     `일단 도움을 준 뒤 설명하면 충분하다고 생각하는 쪽과 먼저 묻는 것을 신뢰로 여기는 쪽은 같은 행동을 다르게 기억할 수 있습니다.`,
     `${higherBoundary.name}이(가) 동의를 확인하는 동안 ${lowerBoundary.name}이(가) 손을 뻗으면 속도 차이가 보호와 간섭의 갈등으로 바뀔 수 있습니다.`,
     `문제는 지원 의도의 부재가 아니라 허용 범위의 차이입니다. 다음에는 선택할 수 있는 두 가지 조치를 먼저 제시하는 편이 좋습니다.`,
     `경계의 합의가 없으면 한 사람은 지나치게 늦었다고 느끼고 다른 사람은 선택권을 잃었다고 느낄 수 있습니다.`
   ])} **악화 지점** 한 번 허용했던 행동을 다음에도 묻지 않고 반복할 때입니다.`
  },
  {
   weight:30+gap*8,
   title:"경고가 전달되지 않아 벌어지는 시간차",
   text:`**발동 계기** ${first.name}이(가) 이상을 감지해 이미 행동하려 하는데 ${verify.name}에게는 관찰 근거가 충분히 전달되지 않은 상황입니다. ${any("delay",[
     `먼저 본 사람이 결론만 외치면 상대는 왜 움직여야 하는지 알지 못합니다. 발견한 변화 하나를 먼저 말해야 합니다.`,
     `상대가 확인 질문을 하는 시간을 반대 의견으로 받아들이면 두 사람의 행동이 갈라질 수 있습니다.`,
     `판단이 느린 쪽이 반드시 무능한 것은 아닙니다. 필요한 근거가 어느 단계에서 빠졌는지 찾아야 합니다.`,
     `한 사람이 이미 다음 행동에 들어갔다면 남은 사람은 추가 신호를 확인할 여유를 잃을 수 있습니다.`
   ])} **확대 경로** 먼저 움직인 사람이 설명을 생략하고, 상대는 멈춰서 더 많은 근거를 요구하는 경우입니다.`
  },
  {
   weight:30+Math.abs(x[3]-y[3])*7,
   title:"한 사람에게 몰리는 수습 책임",
   text:`**발동 계기** ${leadSupport.name}이(가) 문제를 발견한 뒤 환경 조정과 동료 상태 확인까지 계속 맡는 상황입니다. ${any("burnout",[
     `${otherSupport.name}이(가) 상대를 기다리기만 하면 ${leadSupport.name}은(는) 자신의 감각 부담을 점검할 시간을 잃을 수 있습니다.`,
     `한 사람이 지원을 전담하면 위기 이후 그 사람의 피로를 다른 사람이 알아차리지 못할 수 있습니다. 관찰 역할을 분리해야 합니다.`,
     `${leadSupport.name}이(가) 직접 지원하는 동안 ${otherSupport.name}은(는) 주변 정보 수집이나 후속 요청을 맡을 수 있습니다.`,
     `지금 당장의 수습이 잘되더라도 같은 배치를 반복하면 다음 사고에 대응할 여유가 남지 않을 수 있습니다.`
   ])} **악화 지점** 매번 익숙한 사람이 자발적으로 맡는다는 이유로 교대 시점을 정하지 않을 때입니다.`
  },
  {
   weight:30+Math.abs(x[5]-y[5])*7,
   title:"한 사람의 복귀 선언이 만드는 압박",
   text:`**발동 계기** ${earlier.name}이(가) 회복했다고 느껴 다음 행동을 제안하지만 ${longer.name}은(는) 아직 감각을 정리하지 못한 상황입니다. ${any("rest-gap",[
     `먼저 안정된 사람이 일정까지 결정해 버리면 다른 사람은 자신의 피로를 설명하는 일을 새 부담으로 느낄 수 있습니다.`,
     `같은 장소에서 쉬더라도 누구에게는 대화가, 다른 사람에게는 고요함이 필요할 수 있습니다. 휴식 방식을 하나로 정하지 않는 편이 좋습니다.`,
     `겉으로 침착해 보인다고 다음 게이트에 바로 들어갈 수 있는 것은 아닙니다. 당사자가 상태를 말할 수 있는 시간을 남겨야 합니다.`,
     `잠시 쉬었다는 사실보다 실제로 어떤 자극이 남았는지 확인하지 않으면 같은 피로를 반복할 수 있습니다.`
   ])} **악화 지점** 쉬는 시간을 타인의 기준으로 충분하다고 판정할 때입니다.`
  }
 ];
 if(guides.length){
  const leader=guides.slice().sort((u,v)=>v.axes[3]-u.axes[3])[0];
  debuffs.push({
   weight:50+Math.max(x[3],y[3])*3,title:"가이딩 잔량을 생각하지 않은 연속 요청",
   text:`**발동 계기** ${leader.name}에게 이전 지원이 성공했다는 이유로 다음 가이딩 요청도 연이어 집중되는 상황입니다. ${any("guide-limit",[
     `가이딩 이후 ${leader.name}의 잔량을 확인하지 않은 채 같은 강도로 추가 요청하면 공명 고갈 위험을 늦게 알아차릴 수 있습니다.`,
     `가이딩이 필요한 순간과 환경을 정리하는 정도로 버틸 수 있는 순간을 구분하면 자원 소모를 한 사람에게 몰지 않을 수 있습니다.`,
     `지원 대상을 정할 때는 센티넬의 현재 부하도뿐 아니라 가이드가 다음 지원까지 감당할 수 있는 여유도 확인해야 합니다.`,
     `가이드에게 거절할 여지가 없으면 남은 가이딩 잔량을 스스로 지키기 어려워집니다. 다른 대응 방식을 준비해 두는 편이 좋습니다.`
   ])} **악화 지점** ${leader.name}이(가) 지원을 계속할 수 있는지 확인하는 절차 없이 임무를 이어갈 때입니다.`
  });
 }
 debuffs.sort((v,w)=>w.weight-v.weight);
 return contextualCardVariation(a,b,{synergies:synergiesOrdered.slice(0,4),debuffs:debuffs.slice(0,4)});
}

function pairDeepResult(a,b){
 const base=pairResult(a,b),seed=linkSeed(a,b),fw=directionLayers(a,b),bw=directionLayers(b,a,fw);
 const c=relationshipCards(a,b,base.fromAToB,base.fromBToA),diff=Math.abs(a.axes[2]-b.axes[2]);
 const same=diff<1.6&&Math.abs(a.axes[0]-b.axes[0])<1.6;
 const opening=`${a.name}의 표현 강도 ${fixed(a.axes[1])}점과 ${b.name}의 감각 수용 ${fixed(b.axes[0])}점, 그리고 반대 방향의 조합은 서로 다른 관계를 만듭니다. ${teamPick(TEAM_DB.PAIR.opening[same?"same":"different"],seed,"opening")} ${fw.kind!==bw.kind?"한쪽에서는 완충이, 다른 쪽에서는 자극이 앞설 수 있어 서로의 편안함이 자동으로 일치하지는 않습니다.":"같은 방향의 영향이 나오더라도 실제 전달 방식과 선택한 대응은 두 사람마다 다르게 나타납니다."}`;
 const sigKey=diff>1.5?"split":Math.min(a.axes[2],b.axes[2])>=6.8?"fast":"slow";
 const signal=`${teamPick(TEAM_DB.PAIR.signal[sigKey],seed,"signal")} ${a.name}의 전조 감지 ${fixed(a.axes[2])}점과 ${b.name}의 ${fixed(b.axes[2])}점을 비교하면, 감지와 후속 행동을 어떻게 나눌지가 중요한 협력 조건입니다.`;
 const supKey=Math.abs(a.axes[3]-b.axes[3])>1.6?"split":Math.min(a.axes[3],b.axes[3])>6.8?"both":"quiet";
 const supportTiming=`${teamPick(TEAM_DB.PAIR.support[supKey],seed,"support")} ${a.name}과(와) ${b.name}이(가) 어떤 순간에 도움을 제안하는지에 따라 상대가 받는 부담이 달라질 수 있습니다.`;
 const misKey=Math.abs(a.axes[4]-b.axes[4])>1.6?"boundary":Math.abs(a.axes[1]-b.axes[1])>1.6?"expression":"timing";
 const misreading=`${teamPick(TEAM_DB.PAIR.misread[misKey],seed,"misread")} 두 사람이 같은 행동을 서로 다른 뜻으로 해석하는 순간에는 먼저 무엇이 필요했는지 구체적으로 확인하는 편이 좋습니다.`;
 const roleKey=a.role==="센티넬"&&b.role==="센티넬"?"SS":a.role==="가이드"&&b.role==="가이드"?"GG":"SG";
 const resource=`${teamPick(TEAM_DB.PAIR.role[roleKey],seed,"role")} ${base.role}`;
 const restGap=Math.abs(a.axes[5]-b.axes[5]);
 const recovery=`${teamPick(TEAM_DB.PAIR.after[restGap>1.8?"split":Math.min(a.axes[5],b.axes[5])>=6.8?"slow":"fast"],seed,"rest")} 두 사람의 잔향 회복 차이는 ${fixed(restGap)}점입니다.`;
 const pick=(p,i)=>getScenarios(p.role)[i]?.opts[p.choices[i]]?.[0]||"상황을 살핀다";
 const scenes=[
 {title:"첫 번째 경고를 들었을 때",text:`${a.name}은(는) '${pick(a,0)}', ${b.name}은(는) '${pick(b,0)}'를 선택했습니다. 이 선택들은 위험을 발견했을 때 무엇을 먼저 지키는지 보여 줍니다. 누가 경고를 전달하고 누가 별도의 신호를 확인할지 나누면 충돌을 줄일 수 있습니다.`},
 {title:"동료에게 도움이 필요할 때",text:`${a.name}의 대응은 '${pick(a,1)}'이고 ${b.name}의 대응은 '${pick(b,1)}'입니다. 지원을 빨리 시작하는 사람은 장면을 바꾸려 하고, 신중하게 확인하는 사람은 상대가 감당할 범위를 살핍니다. 두 판단의 순서를 맞추면 도움이 간섭으로 변하는 순간을 줄일 수 있습니다.`},
 {title:"게이트를 떠난 뒤",text:`${a.name}은(는) '${pick(a,5)}'를 선택했고 ${b.name}은(는) '${pick(b,5)}'를 선택했습니다. 두 사람은 각 직군의 장면에서 회복을 다르게 다룹니다. 어느 쪽이 먼저 안정되었는지보다 언제 다음 행동을 시작할 준비가 되는지 확인하는 편이 좋습니다.`}
 ];
 const decision=`경계 조율 점수는 ${a.name} ${fixed(a.axes[4])}점, ${b.name} ${fixed(b.axes[4])}점입니다. ${Math.abs(a.axes[4]-b.axes[4])>2.2?"두 사람 중 한쪽이 먼저 움직이려 하고 다른 쪽이 사전 동의를 원할 수 있습니다.":"기본적인 기준이 비슷해도 위기에서는 설명을 생략할 수 있습니다."} 실제 개입 이전에 상대가 선택할 수 있는 범위를 간단히 확인하는 편이 좋습니다.`;
 const gap=base.fromAToB.delta-base.fromBToA.delta;
 const turning=`${Math.abs(gap)>13?`${base.fromAToB.delta>base.fromBToA.delta?a.name:b.name}에게서 상대 방향으로 전달되는 자극과 완충의 차이가 더 크게 나타납니다.`:"두 방향의 자극·완충 차이는 비교적 가까운 편입니다."} ${teamPick(TEAM_DB.PAIR.outlook[Math.abs(gap)>20?"asymmetric":same?"near":"far"],seed,"outlook")} 두 방향에서 자극과 완충이 뒤바뀌는 장면을 살펴보면 관계의 균형을 더 명확히 읽을 수 있습니다.`;
 return {...base,opening,fromA:fw.body,fromB:bw.body,directional:[fw,bw],synergies:c.synergies,debuffs:c.debuffs,
 signal,supportTiming,misreading,resource,recovery,decision,turning,scenes,outlook:turning,
 primary:`${opening} ${base.primary}`,support:c.synergies[2].text,risk:c.debuffs[2].text};
}
