# NSD 제3차 연구 — 게이트 동행 적합성 연구

GitHub Pages: https://su9ar0319.github.io/nsd-sensory-lab/gate/

기존 2차 감각 간섭 보고서와 **별개의 웹앱**입니다. 현재는 동일한 Pages 저장소의 `/gate/` 하위 경로에서 호스팅하므로 2차 코드 및 기존 저장 데이터를 수정하지 않습니다.

## 기능
- 64문항 = 48개 점수 문항(공통 24 + 직군별 24) + 16개 상황 선택(공통 8 + 직군별 8)
- 전술 12축, 다축 기반 세부 전술 서명
- 1인: 8개 요약 카드 + 10개 심층 분석 + 12축 해설 + 7개 상황 해석
- 2인: 양방향 전술 영향, 시너지 4개·위험 4개, 자원 및 실전 선택 비교
- 3인: 3개 서로 다른 배치, 7단계 게이트 모의 작전, 3쌍의 양방향 영향 및 제3자, 시너지 5개·위험 5개
- 로컬 기록 및 JSON 백업·복원, 응답 원문을 제외한 공유 링크, AI 분석 패키지, 인쇄·PDF
- 모바일 및 PC 대응

## 저장 구조
브라우저 저장 키는 `nsd_gate_v1_own`, `nsd_gate_v1_imported`이며 2차와 독립적입니다.

기존 프로젝트의 Firebase 웹 설정을 **읽기만** 하며, 온라인 데이터를 사용할 때에는 신규 컬렉션을 사용합니다.
- 비공개: `gateUsers/{uid}/records/{recordId}`
- 공개: `gatePublicProfiles/{recordId}`

**주의: Firebase 연결과 공개 프로필은 Firestore 보안 규칙에서 신규 경로를 허용해야 작동합니다.** 별도 권한이 없다면 앱은 로컬 저장 및 JSON·프로필 공유 링크 중심으로 작동합니다. 2차 연구소의 현재 규칙을 지우지 말고 아래 규칙을 *기존 `match /databases/{database}/documents` 내부에 추가*하세요.

```text
match /gateUsers/{ownerId}/records/{recordId} {
  allow read, write: if request.auth != null && request.auth.uid == ownerId;
}
match /gatePublicProfiles/{recordId} {
  allow read: if resource.data.isPublic == true;
  allow create: if request.auth != null
                && request.resource.data.ownerUid == request.auth.uid
                && request.resource.data.isPublic == true;
  allow update: if request.auth != null
                && resource.data.ownerUid == request.auth.uid
                && request.resource.data.ownerUid == request.auth.uid;
  allow delete: if request.auth != null
                && resource.data.ownerUid == request.auth.uid;
}
```

## 세계관과 모델 조건
- 센티넬은 부하도 상승 및 폭주 전조를 관리하고, 가이드는 **가이딩을 직접 수행했을 때에만** 가이딩 잔량이 소모됩니다. 잔량이 0이면 공명 고갈 상태입니다.
- 자동 정신 링크, 무조건적인 가이딩, 둘 사이의 상시 연결을 가정하지 않습니다.
- 3인 결과에 나타나는 위협/부하도/가이딩 잔량의 0~100 지표는 **검사 응답으로 계산하는 가상의 시뮬레이션 단위**이며 실제 게임의 자원 수치나 전투 결과를 예측하지 않습니다.
- 시뮬레이션은 동일한 입력에서 언제나 동일한 결과를 반환합니다.
