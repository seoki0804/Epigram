# Epigram

명언과 글귀를 올리고, 다른 사람의 글에 좋아요와 댓글을 남기는 서비스입니다.
코드잇 스프린트 프론트엔드 11기 개인 프로젝트로 시작했고, 2026년 11월에 미완성 부분을 마무리했습니다.

## 기능

| 화면 | 주소 | 내용 |
| --- | --- | --- |
| 랜딩 | `/` | 서비스 소개 |
| 피드 | `/epigramlist` | 최신순 목록, 검색(내용·저자·태그), 커서 기반 '더보기'. 로그인 없이 볼 수 있음 |
| 상세 | `/epigrams/[id]` | 본문·저자·출처·태그, 좋아요 켜기/끄기, 댓글 작성·수정·삭제(비공개 선택), 댓글 더보기 |
| 만들기 | `/addepigram` | 내용(500자), 저자(직접 입력·알 수 없음·본인), 출처 제목과 URL, 태그 3개(10자) |
| 수정 | `/epigrams/[id]/edit` | 만들기와 같은 폼. 내가 쓴 글만 |
| 로그인·회원가입 | `/login`, `/signup` | 가입하면 바로 로그인. 로그인이 필요해서 넘어온 경우 원래 화면으로 돌아감 |

## 기술

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS + CSS Modules
- Axios: accessToken 자동 첨부, 만료 시 refreshToken으로 한 번 재발급 후 재요청
- date-fns: 댓글 시간을 '3분 전'처럼 표시

## 실행

```bash
npm install
cp .env.example .env.local   # 필요하면 API 주소 변경
npm run dev                  # http://localhost:3000
```

API는 코드잇이 제공하는 [Epigram API](https://fe-project-epigram-api.vercel.app/docs/)를 씁니다.
주소 끝의 팀 ID(`11-hyeongseok-an`)로 데이터가 분리됩니다.

## 2026-11 마무리 작업

처음 만들 때 API 명세와 맞지 않거나 끝내지 못한 부분을 고쳤습니다.

- **글쓰기가 전혀 되지 않던 원인:** 팀 ID를 한글(`11-안형석`)로 쓰면 가입과 로그인은 되지만, 로그인이 필요한 요청(글쓰기·좋아요·댓글·내 정보)이 서버에서 모두 403으로 거절됩니다. 영문 팀 ID로 같은 요청을 보내면 200이 나오는 것을 확인하고 팀 ID를 바꿨습니다.
- **API 명세에 맞춤:** 목록이 `page/pageSize`가 아닌 `limit/cursor` 방식이고 응답이 `{ list, nextCursor, totalCount }`인 점, 댓글은 `/epigrams/{id}/comments`에서 받는 점, 댓글 작성에 `isPrivate`가 필요한 점, 태그가 `{ id, name }` 객체인 점, 좋아요 수가 `likeCount`인 점
- **로그인:** 로그인 실패가 성공처럼 처리되어 홈으로 넘어가던 문제, 콘솔에 이메일과 비밀번호가 찍히던 문제, 상단 바에 이름이 고정 문자열로 나오던 문제
- **빠진 화면:** 수정 화면(`/epigrams/[id]/edit`)이 없어 '수정하기'가 404로 가던 문제, 상세 화면을 복사해 둔 `/epigrams` 페이지
- **입력:** 한글 입력 중 Enter로 태그가 두 번 들어가던 문제, 중복 태그, URL 형식 검사
- 쓰지 않는 테스트 페이지(`/api-test`)와 빈 페이지(`/faq`, `/privacy`) 삭제
