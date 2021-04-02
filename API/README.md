# 회원 API

**본인의 게시물만 수정할 수 있다.**

`1. 로그인 `

URL  : [POST] http://{IP} : {PORT}/member/login

PARAM : KEY = member-email, VALUE= 로그인할 아이디

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-pw, VALUE= 아이디의 비밀번호

서버 내 업데이트: KEY = member-login-lately, VALUE= 사용자 최근로그

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = member-login, VALUE= 사용자 로그인 시간

동작:  동일한 아이디가 있는지 확인 후 그 아이디에 맞는 비밀번호인지 확인한다. 정지여부도 확인한다.

응답: 아이디와 비밀번호가 맞으면 true, 아니면 false를 반환한다.

`1.1이용약관 동의`

**회원가입시 테이블에 같이 들어감 회원가입 페이지로 넘어갈때 넘겨줌**

URL : [GET] http://{IP} : {PORT}/member/chosenAgree

PARAM : KEY = agree, VALUE= 선택약관 동의여부

`2. 회원가입 `

URL  : [POST] http://{IP} : {PORT}/member/join

PARAM : KEY = member-email, VALUE= 등록할 이메일 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-name, VALUE= 이름 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-sex, VALUE= 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-birth, VALUE= 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-company, VALUE= 소속

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-state, VALUE= 거주지

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-pw, VALUE= 비밀번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-phone, VALUE= 핸드폰 
번호

서버 내 업데이트: KEY = member-ban, VALUE= 정지여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = member-log-join, VALUE= 가입 일자

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = member-login-lately, VALUE= 최근로그

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = member-login, VALUE= 로그인 시간

동작:  모두 맞는 형식으로 빈 항목이 없이 들어갔는 지 확인한 후 테이블에 추가한다. 그외 컬럼 항목은 서버에서 처리한다.

응답:  정상적으로 추가되었다면 true, 아니면 false를 반환한다.

`3. 비밀번호 찾기 `

**1. 이메일 검사**

**2. 서버에 키 생성**

**3. db에 넣기**

**4. key 붙여서 이메일로 보내기**

URL  : [POST] http://{IP} : {PORT}/member/findPw

PARAM : KEY = member-email, VALUE= 잃어버린 비밀번호의 이메일 

서버 내 업데이트: KEY = member-email, VALUE= 잃어버린 비밀번호의 이메일 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = pw-key-id, VALUE= 비밀번호 찾기 키 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = pw-key, VALUE= 비밀번호 찾기 키

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = pw-edit, VALUE= 재설정 여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = pw-date, VALUE= 유효기간

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = pw-dispose, VALUE= 폐기 여부

동작: 회원 테이블에 맞는 이메일이 있는지 확인 후 메일 전송 

응답: 전송되었다면 true, 안됐다면 false 반환

`4. 이메일 인증하기 `

**1. 이메일 인증하기 누르면 db에 정보넣고 이메일로 전송**

**2. 이메일에서 인증버튼 누르면 원래 창으로 돌아가서 db에서 이메일 받아온 상태로 돌아감**

URL  : [GET] http://{IP} : {PORT}/member/checkPw

PARAM : KEY = input-email, VALUE= 입력 이메일 

서버 내 업데이트: KEY = email-key-id, VALUE= 이메일 인증 키 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = email-key, VALUE= 이메일 인증 키

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = email-auth-flag, VALUE= 인증 여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = email-date, VALUE= 유효기간

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = email-dispose, VALUE= 폐기 여부

동작: 회원 테이블에 맞는 이메일이 있는지 확인 후 메일 전송 

응답: 전송되었다면 true, 안됐다면 false 반환


`5. 비밀번호 재설정`

URL  : [patch] http://{IP} : {PORT}/member/resetPw

PARAM : KEY = member-pw, VALUE= 재설정할 비밀번호

서버 내 업데이트: KEY = member-pw, VALUE= 재설정할 비밀번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = pw-edit, VALUE= 재설정 여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = pw-date, VALUE= 유효기간

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = pw-dispose, VALUE= 폐기 여부

동작:  형식에 맞는지 확인 후 재설정

응답:  재설정 되었다면 true, 아니라면 false 반환


`6. 개인정보수정 전 비밀번호 확인`

URL  : [POST] http://{IP} : {PORT}/member/checkInfo

PARAM : KEY = member-pw, VALUE=  아이디의 비밀번호

동작:  비밀번호가 맞는지 확인한다.

응답: 맞으면 true, 틀리면 false를 반환


`7. 개인정보수정`

URL  : [patch] http://{IP} : {PORT}/member/revise

PARAM : KEY = member-email, VALUE= 수정할 이메일 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-name, VALUE= 이름 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-sex, VALUE= 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-birth, VALUE= 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-company, VALUE= 소속

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-state, VALUE= 거주지

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-ban, VALUE= 정지여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-pw, VALUE= 비밀번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-phone, VALUE= 핸드폰 
번호

동작:  형식에 맞게 채워졌는지 확인 후 수정.

응답:  정상적으로 추가되었다면 true, 아니면 false를 반환한다.

`8. 회원탈퇴`

URL  : [patch] http://{IP} : {PORT}/member/secede

PARAM : KEY = member-email, VALUE= 이메일 

서버 내 업데이트: KEY = member-name, VALUE= 이름 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = member-sex, VALUE= 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = member-birth, VALUE= 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = member-company, VALUE= 소속

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;KEY = member-state, VALUE= 거주지

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-ban, VALUE= 정지여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-pw, VALUE= 비밀번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-phone, VALUE= 핸드폰 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-point, VALUE= 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = save-point, VALUE= 누적 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = use-point, VALUE= 사용 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-rank, VALUE= 포인트 순위

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = out-member-email, VALUE= 탈퇴자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = out-member-name, VALUE= 탈퇴자 이름

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = out-sex, VALUE= 탈퇴자 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = out-birth, VALUE= 탈퇴자 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = out-date, VALUE= 탈퇴 일자

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = out_member_id, VALUE= 탈퇴 사용자 번호

동작: 서버에서 이름, 성별, 생년월일, 탈퇴일자를 탈퇴테이블에 넣고 멤버에 있는 탈퇴자의 정보를 지운다.

응답: 성공시 true, 틀리면 false를 반환

`9. 내 아이디어`

URL  : [GET] http://{IP} : {PORT}/member/myIdea

서버 응답: KEY = idea-title, VALUE= 아이디어 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = idea-date, VALUE= 작성일

동작: 회원이 올린 게시물을 찾는다.

응답: 게시물이 있다면 true, 없으면 false를 반환

`10. 관심사업`

URL  : [GET] http://{IP} : {PORT}/member/myInter

서버 응답: KEY = member-email, VALUE= 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = anno-id, VALUE= 공고번호

동작: 회원이 올린 게시물을 찾는다.
응답: 게시물이 있다면 true, 없으면 false를 반환

`11. 관심사업 추가`

URL  : [PUT] http://{IP} : {PORT}/mypage/interadd

param: KEY = member-email, VALUE= 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = anno-id, VALUE= 공고번호

동작: 해당하는 공고번호를 관심사업 테이블에 추가한다.
응답: 게시물이 있다면 true, 없으면 false를 반환

`12. 관심사업 삭제`

URL  : [DELETE] http://{IP} : {PORT}/mypage/interdel

서버 응답: KEY = member-email, VALUE= 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = anno-id, VALUE= 공고번호

동작: 해당하는 로우를 테이블에서 지운다.
응답: 게시물이 있다면 true, 없으면 false를 반환

`13. 로그아웃`

URL  : [GET] http://{IP} : {PORT}/member/logout


동작: 세션을 종료시킨다.

응답: 종료되었다면 true, 안되었다면 false를 반환


# 사용자 포인트 API

`1. 현황`

URL  : [GET] http://{IP} : {PORT}/member/myPoint

서버 응답 : KEY = member-point, VALUE= 현재 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = save-point, VALUE= 누적 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = use-point, VALUE= 사용 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-rank, VALUE= 포인트 순위

동작: 포인트 상황을 가져온다
응답: 가져왔다면 true, 실패했다면 false를 반환

`2. 사용내역`

URL  : [GET] http://{IP} : {PORT}/mypage/usePoint

서버 응답 : KEY = use-date, VALUE= 포인트 사용 날짜

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;KEY = use-contents, VALUE= 사용 내역

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;KEY = point-trade, VALUE= 포인트 교환여부

동작: 사용내역 테이블에서 정보를 가져온다.

응답: 가져왔다면 true, 실패했다면 false를 반환

`3. 적립내역`

URL  : [GET] http://{IP} : {PORT}/mypage/savepoint

서버 응답 : KEY = idea-contents, VALUE= 내역

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-id, VALUE= 아이디어 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = add-point, VALUE= 얻은 포인트

&nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = date-point, VALUE= 적립 날짜

동작:  idea테이블에서 정보를 가져온다.

응답: 가져왔다면 true, 실패했다면 false를 반환

# 아이디어게시판API

**공지사항과 문의 게시판은 그 내용이 담긴 창이 열리고 뒤로 버튼이 생긴다. 이를 제외한 모든 게시물 보기는 클릭 시 창이 밑으로 늘어난다.**

**공고정보게시판을 제외한 다른 모든 게시판의 내용은 본인이 작성한 것만 볼 수 있다.**

**관리자가 관리하는 게시판을 제외한 다른 모든 게시판의 등록은 로그인을 해야 가능하다.**

`1. 참여자 순위와 목록`

URL  : [GET] http://{IP} : {PORT}/board/idea

서버 응답 : KEY = member-name, VALUE= 회원 이름

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-rank, VALUE= 등수

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = save-point, VALUE= 누적 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-contents, VALUE= 내역

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-date, VALUE= 작성일

동작: idea테이블에서 리스트를 가져오고 삭제여부를 확인한다. member테이블에서 등수와 누적 포인트를 가져온다. 게시물 클릭시 본인이 올린 게시물이 아니라면 못 보게 한다.

응답: 가져왔다면 true, 실패했다면 false를 반환

`2. 아이디어 등록하기`

URL  : [POST] http://{IP} : {PORT}/board/idea/upload

PARAM : KEY = idea-id, VALUE= 아이디어 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-date, VALUE= 작성일

동작: 형식에 맞게 입력했는지 확인하고 db에 추가한다.

응답: 형식에 맞고 정보를 성공적으로 보냈다면 true, 실패했다면 false를 반환


`3. 아이디어 수정하기`

URL  : [PUT] http://{IP} : {PORT}/board/idea/revise

PARAM : KEY = idea-id, VALUE= 아이디어 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-date, VALUE= 작성일

동작: 로그에 수정일과 수정 전 내용을 업데이트 하고 형식에 맞게 입력했는지 확인하고 db를 업데이트 한다.

응답: 형식에 맞고 정보를 성공적으로 보냈다면 true, 실패했다면 false를 반환

`4. 아이디어 검색`

URL  : [GET] http://{IP} : {PORT}/board/idea/search

PARAM : KEY = idea-title, VALUE= 제목

서버 응답 : KEY = idea-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-date, VALUE= 작성일

동작: 삭제여부를 확인하고 검색 글자가 들어가는 제목들을 보여준다.

응답: 맞는 정보가 있다면 true, 아니라면 false를 반환

`5. 아이디어 보기`

URL  : [GET] http://{IP} : {PORT}/board/idea/아이디어 번호

PARAM : KEY = idea-title, VALUE= 제목

서버 응답 : KEY = idea-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = idea-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-email, VALUE= 작성자 이메일

동작: 게시물을 보여준다.

응답: 게시물이 정상적으로 보여진다면 true, 아니라면 false를 반환


# 공고정보게시판API

`1. 공고정보 목록`

URL  : [GET] http://{IP} : {PORT}/board/anno

서버 응답 : KEY = anno-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-img-num, VALUE= 내용 이미지 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-date, VALUE= 작성일

동작: 공고정보 게시물을 보여준다.

응답: 게시물이 있다면 true, 아니라면 false를 반환

`2. 공고정보 게시물 검색`

URL  : [GET] http://{IP} : {PORT}/board/anno/search

PARAM : KEY = anno-title, VALUE= 제목 

서버 응답 : KEY = anno-img-num, VALUE= 내용 이미지 번호 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-date, VALUE= 작성일


동작: 검색 글자가 들어가는 제목들을 보여준다.

응답: 맞는 정보가 있다면 true, 아니라면 false를 반환

`3. 공고정보 게시물 보기`

URL  : [GET] http://{IP} : {PORT}/board/anno/게시물 번호

PARAM : KEY = anno-title, VALUE= 제목 

서버 응답 : KEY = anno-img-num, VALUE= 내용 이미지 번호 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-link, VALUE= 출처 링크

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-ref, VALUE= 출처 

동작: 게시물을 보여준다.

응답: 게시물이 정상적으로 출력되었다면 true, 아니라면 false를 반환

# 공지사항게시판 API

`1. 공지사항 목록`

URL  : [GET] http://{IP} : {PORT}/board/notice

서버 응답 : KEY = notice-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-date, VALUE= 작성일

동작: 삭제여부를 확인하고 공지사항 게시물을 보여준다.

응답: 게시물이 있다면 true, 아니라면 false를 반환

`2. 공지사항 검색`

URL  : [GET] http://{IP} : {PORT}/board/notice/search

PARAM : KEY = notice-title, VALUE= 제목

서버 응답 : KEY = notice-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = notice-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = notice-date, VALUE= 작성일

동작: 검색 글자가 들어가는 제목들을 보여준다.

응답: 맞는 정보가 있다면 true, 아니라면 false를 반환

`3. 공지사항 보기`

URL  : [GET] http://{IP} : {PORT}/board/notice/공지사항 게시물 번호

PARAM : KEY = notice-title, VALUE= 제목

서버 응답 : KEY = notice-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = notice-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = notice-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = notice-file-path, VALUE= 첨부파일 경로

동작: 게시물을 보여준다.

응답: 게시물을 정상적으로 출력했다면 true, 아니라면 false를 반환

# 문의게시판API

`1. 문의 목록`

URL  : [GET] http://{IP} : {PORT}/board/cs

서버 응답 : KEY = cs-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-secret, VALUE= 비밀글 여부

동작: 삭제여부를 확인하고 문의 게시물을 보여준다.

응답: 게시물이 있다면 true, 아니라면 false를 반환

`2. 문의게시판 검색`

URL  : [GET] http://{IP} : {PORT}/board/cs/search

PARAM : KEY = cs-title, VALUE= 제목

서버 응답 : KEY = cs-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = cs-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = cs-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-secret, VALUE= 비밀글 여부

동작: 검색 글자가 들어가는 제목들을 보여준다.

응답: 맞는 정보가 있다면 true, 아니라면 false를 반환

`3. 문의 등록`

URL  : [POST] http://{IP} : {PORT}/board/cs/upload

PARAM : KEY = cs_id, VALUE= 문의글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = cs-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-secret, VALUE= 비밀글 여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-file-path, VALUE= 첨부파일 경로

동작: 파라미터에 내용이 다 있는지 확인 db에 저장한다.

응답: 등록이 되었다면 true, 아니라면 false를 반환

`4. 문의게시판 보기`

URL  : [GET] http://{IP} : {PORT}/board/cs/게시물 번호

PARAM : KEY = cs-title, VALUE= 제목

서버 응답 : KEY = cs-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = cs-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = cs-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-secret, VALUE= 비밀글 여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-file-path, VALUE= 첨부파일 경로

동작: 검색 글자가 들어가는 제목들을 보여준다.

응답: 맞는 정보가 있다면 true, 아니라면 false를 반환


`5. 문의게시판 수정하기`

URL  : [PUT] http://{IP} : {PORT}/board/cs/revise

PARAM : KEY = idea-id, VALUE= 아이디어 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = idea-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = idea-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = idea-date, VALUE= 작성일


동작: 형식에 맞게 입력했는지 확인하고 db를 수정한다.

응답: 형식에 맞고 정보를 성공적으로 보냈다면 true, 실패했다면 false를 반환

# 고객센터API

`1. 등록`

URL  : [POST] http://{IP} : {PORT}/board/contact/upload

PARAM : KEY = contact-id, VALUE= 고객센터 글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = contact-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = contact-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = contact-date, VALUE= 작성일

동작: 로그에 저장하고 파라미터에 내용이 다 있는지 확인 db에 저장한다.

응답: 등록이 되었다면 true, 아니라면 false를 반환


# 관리자API

`1. 로그인 `

URL  : [POST][PUT] http://{IP} : {PORT}/admin/login

PARAM : KEY = admin-email, VALUE= 확인할 아이디

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = admin-pw, VALUE= 아이디의 비밀번호

서버 내 업데이트 : KEY = admin-login-history, VALUE= 사용자 최근로그

동작:  동일한 아이디가 있는지 확인 후 그 아이디에 맞는 비밀번호인지 확인한다.

응답: 아이디와 비밀번호가 맞으면 true, 아니면 false를 반환한다.


`2. 관리자가입`

URL  : [POST] http://{IP} : {PORT}/admin

PARAM : KEY = admin-email, VALUE= 등록할 이메일 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = admin-name, VALUE= 이름 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = admin-sex, VALUE= 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = admin-birth, VALUE= 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = admin-state, VALUE= 거주지

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = admin-pw, VALUE= 비밀번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = admin-phone, VALUE= 핸드폰 번호

서버 내 업데이트 : KEY = admin-log-join, VALUE= 가입 일자

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = admin-login-history, VALUE= 최근로그

동작:  모두 맞는 형식으로 빈 항목이 없이 들어갔는 지 확인한 후 테이블에 추가한다.

응답:  정상적으로 추가되었다면 true, 아니면 false를 반환한다.


`3. 비밀번호 찾기`

URL  : [GET] http://{IP} : {PORT}/admin/forgetpw

PARAM : KEY = admin-email, VALUE= 잃어버린 비밀번호의 이메일 

동작:  관리자 테이블에 맞는 이메일이 있는지 확인 후 비밀번호 재설정으로 이동

응답: 전송되었다면 true, 안됐다면 false 반환


`4. 비밀번호 재설정`

URL  : [PUT] http://{IP} : {PORT}/admin/resetpw

PARAM : KEY = admin-pw, VALUE= 재설정할 비밀번호

동작:  형식에 맞는지 확인 후 재설정

응답:  재설정 되었다면 true, 아니라면 false 반환


`5. 개인정보수정 전 비밀번호 확인`

URL  : [GET] http://{IP} : {PORT}/admin/checkpw

PARAM : KEY = admin-pw, VALUE=  아이디의 비밀번호

동작:  비밀번호가 맞는지 확인한다.

응답: 맞으면 true, 틀리면 false를 반환


`6. 개인정보수정`

URL  : [PUT] http://{IP} : {PORT}/admin/resetprivacy

PARAM : KEY = admin-email, VALUE= 수정할 이메일 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-name, VALUE= 이름

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-sex, VALUE= 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-birth, VALUE= 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-company, VALUE= 소속

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-state, VALUE= 거주지

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-ban, VALUE= 정지여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-pw, VALUE= 비밀번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-phone, VALUE= 핸드폰 
번호

동작:  형식에 맞게 채워졌는지 확인 후 수정.

응답:  정상적으로 추가되었다면 true, 아니면 false를 반환한다.

`7. 사용자 정지`

URL  : [POST] http://{IP} : {PORT}/admin/userban

PARAM : KEY = member-email, VALUE= 정지할 사용자의 이메일 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = member-ban-reason, VALUE= 정지 사유

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = member-ban-date, VALUE= 정지일자

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-email, VALUE= 정지시킨 관리자 이메일

서버 내 업데이트 : KEY = member-ban, VALUE= 사용자 정지여부

동작:  정지여부를 1로 바꾸고 사용자 정지 테이블에 추가한다.

응답:  정상적으로 추가되었다면 true, 아니면 false를 반환한다.

`8. 사용자 정지 내역보기`

URL  : [GET] http://{IP} : {PORT}/admin/userban/log

PARAM : KEY = member-email, VALUE= 정지한 사용자의 이메일 

서버 응답 : KEY = member-ban-reason, VALUE= 정지 사유

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = member-email, VALUE= 정지한 사용자의 이메일 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = member-ban-date, VALUE= 정지일자

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-email, VALUE= 정지시킨 관리자 이메일

동작:  모든 정지로그를 목록으로 보여준다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`9. 사용자 정지 내역 검색`

**정지 사유, 이메일을 선택해서 검색하게 한다**

URL  : [GET] http://{IP} : {PORT}/admin/userban/search

PARAM : KEY = member-email, VALUE= 정지한 사용자의 이메일 

서버 응답 : KEY = member-ban-reason, VALUE= 정지 사유

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = member-email, VALUE= 정지한 사용자의 이메일 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = member-ban-date, VALUE= 정지일자

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = admin-email, VALUE= 정지시킨 관리자 이메일

동작:  검색글자가 들어가는 내용을 검색한다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`10. 회원 탈퇴 시키기`

URL  : [POST] http://{IP} : {PORT}/admin/userout

PARAM : KEY = member-email, VALUE= 이메일 

서버 내 업데이트 : KEY = member-name, VALUE= 이름 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = member-sex, VALUE= 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = member-birth, VALUE= 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = member-company, VALUE= 소속

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = member-state, VALUE= 거주지

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = member-ban, VALUE= 정지여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = member-pw, VALUE= 비밀번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = member-phone, VALUE= 핸드폰 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = member-point, VALUE= 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = save-point, VALUE= 누적 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = use-point, VALUE= 사용 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = member-rank, VALUE= 포인트 순위

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-member-email, VALUE= 탈퇴자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-member-name, VALUE= 탈퇴자 이름

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-sex, VALUE= 탈퇴자 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-birth, VALUE= 탈퇴자 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = out-date, VALUE= 탈퇴 일자

동작: 서버에서 이름, 성별, 생년월일, 탈퇴일자를 탈퇴테이블에 넣고 멤버에 있는 탈퇴자의 정보를 지운다.

응답: 성공시 true, 틀리면 false를 반환


`11. 탈퇴 로그보기`

URL  : [GET] http://{IP} : {PORT}/admin/userout/log

서버 응답 : KEY = out-member-email, VALUE= 탈퇴자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = out-member-email, VALUE= 탈퇴자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-member-name, VALUE= 탈퇴자 이름

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-sex, VALUE= 탈퇴자 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-birth, VALUE= 탈퇴자 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-date, VALUE= 탈퇴 일자

동작:  모든 탈퇴로그를 목록으로 보여준다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`12. 탈퇴 로그검색`


URL  : [GET] http://{IP} : {PORT}/admin/userout/logsearch

PARAM : KEY = out-member-email, VALUE= 탈퇴자 이메일

서버 응답 : KEY = out-member-name, VALUE= 탈퇴자 이름

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = out-member-email, VALUE= 탈퇴자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = out-sex, VALUE= 탈퇴자 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = out-birth, VALUE= 탈퇴자 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-date, VALUE= 탈퇴 일자

동작:  검색글자가 들어가는 이름의 탈퇴 회원을 검색한다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

--------------------------

`13. 회원 최근 로그인 로그보기`

URL  : [GET] http://{IP} : {PORT}/admin/user/loglately

PARAM : KEY = member-email, VALUE= 사용자 이메일

서버 응답 :   KEY = member-log-join, VALUE= 가입일자

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;  KEY = member-login-lately, VALUE= 최근 로그인 시간

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;  KEY = member-email, VALUE= 사용자 이메일

동작:  모든 회원의 최근 로그인을 목록으로 보여준다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`14. 회원 최근 로그 검색`

URL  : [GET] http://{IP} : {PORT}/admin/user/logsearch

PARAM : KEY = member-email, VALUE= 사용자 이메일

서버 응답 : KEY = member-email, VALUE= 사용자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = member-log-join, VALUE= 가입일자

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = member-login-lately, VALUE= 최근 로그인 시간

동작:  검색어가 들어간 사용자 이메일의 로그를 찾는다.

응답: 검색어가 들어간 사용자의 이메일을 찾았을 경우 true, 아니면 false를 반환한다.

`15. 모든 회원의 총 로그 보기`

URL  : [GET] http://{IP} : {PORT}/admin/user/logtotal

서버 응답 : KEY = member-email, VALUE= 사용자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;  KEY = member-login, VALUE= 사용자 로그인 시간

동작:  모든 회원의 총 로그를 출력한다.

응답: 출력했을 경우 true, 아니면 false를 반환한다.

`15. 회원의 총 로그 검색`

URL  : [GET] http://{IP} : {PORT}/admin/user/logtotalsearch

PARAM : KEY = member-email, VALUE= 사용자 이메일

서버 응답 : KEY = member-email, VALUE= 사용자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = member-login, VALUE= 사용자 로그인 시간

동작:  모든 회원의 총 로그 중 검색어와 같은 이메일을 출력한다.

응답: 출력했을 경우 true, 아니면 false를 반환한다.

----------------------------------------

`16. 아이디어 게시물에 포인트 주기`

**아이디어 목록이 나오고 들어가면 안에 포인트를 주는 버튼을 만든다.**

URL  : [PUT] http://{IP} : {PORT}/admin/board/idea/point

PARAM : KEY = add_point, VALUE= 얻은 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = admin-email, VALUE= 사용자 이메일

서버 업데이트 :   KEY = admin_email, VALUE= 관리자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = add_point, VALUE= 얻은 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = date_point, VALUE= 적립 날짜

동작: 사용자의 누적,사용,현재 포인트를 갱신하고(서버에서) 관리자 이메일, 얻은 포인트, 적립날짜를 넣는다. 

응답: 테이블 갱신을 성공했을 경우 true, 아니면 false를 반환한다.

`17. 아이디어 게시물에서 포인트 회수`

**포인트 회수 버튼을 클릭시 누적,현재 포인트를 갱신은 서버에서**

URL  : [PUT] http://{IP} : {PORT}/admin/board/idea/point

PARAM : KEY = idea-id, VALUE= 게시물 번호

&nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KEY = member-email, VALUE= 게시자 이메일
  
서버 업데이트 :  KEY = admin_email, VALUE= 관리자 이메일

&nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = idea-title, VALUE= 사용자 포인트

&nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = idea-contents, VALUE= 누적 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = add_point, VALUE= 얻은 포인트

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = date_point, VALUE= 적립 날짜

동작: 사용자의 누적,사용,현재 포인트를 갱신하고 관리자 이메일, 얻은 포인트, 적립날짜를 넣는다. 

응답: 테이블 갱신을 성공했을 경우 true, 아니면 false를 반환한다.

---------------------------------------

`18. 관리자 탈퇴`

URL  : [POST] http://{IP} : {PORT}/admin/out

서버 업데이트 : KEY = admin-email, VALUE= 이메일 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-name, VALUE= 이름 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = admin-sex, VALUE= 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = admin-birth, VALUE= 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-company, VALUE= 소속

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-state, VALUE= 거주지

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-pw, VALUE= 비밀번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = admin-phone, VALUE= 핸드폰 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-admin-email, VALUE= 탈퇴자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-admin-name, VALUE= 탈퇴자 이름

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-admin-sex, VALUE= 탈퇴자 성별

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out-admin-birth, VALUE= 탈퇴자 생년월일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = out-date, VALUE= 탈퇴 일자

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = out_admin_id, VALUE= 관리자 탈퇴 번호

동작: 서버에서 이름, 성별, 생년월일, 탈퇴일자를 관리자 제외 테이블에 넣고 관리자 테이블에 있는 탈퇴자의 정보를 지운다.

응답: 성공시 true, 틀리면 false를 반환

`19. 사용자의 포인트 내역 보기`

URL  : [GET] http://{IP} : {PORT}/admin/userpoint

PARAM : KEY = member-email, VALUE= 이메일 

동작: 사용자 포인트API 1,2,3번을 따른다

응답: 성공시 true, 틀리면 false를 반환

----------------------------------------

`20. 문의게시판 답변하기`

URL  : [PUT] http://{IP} : {PORT}/board/cs/anser

PARAM : KEY = cs-id, VALUE= 문의글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-email, VALUE= 관리자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-answer, VALUE= 답변

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-answer-date, VALUE= 답변일

동작: 형식에 맞는지 확인 후 업데이트 한다.

응답: 업데이트가 되었다면 true, 아니라면 false를 반환

`20. 문의게시판 수정`

**수정 전 화면이 그대로 나오고 수정하기 누르면 갱신됨, 개인정보수정과 비슷**

URL  : [PUT] http://{IP} : {PORT}/board/cs/anser/revise

PARAM : KEY = cs-id, VALUE= 문의글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = member-email, VALUE= 사용자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = admin-email, VALUE= 관리자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-answer, VALUE= 답변

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-answer-date, VALUE= 답변일

동작: 로그를 업데이트하고 수정사항이 형식에 맞는지 확인 후 업데이트 한다.

응답: 업데이트가 되었다면 true, 아니라면 false를 반환

`21. 문의게시판 로그보기`

URL  : [GET] http://{IP} : {PORT}/admin/board/cs/log

서버 응답 : KEY = cs-id, VALUE= 문의글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KEY = cs-delete, VALUE= 문의글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-edit-date, VALUE= 수정일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-before-contents, VALUE= 수정 전 내용


동작:  모든 문의글의 로그를 목록으로 보여준다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`22. 문의게시판 로그검색`


URL  : [GET] http://{IP} : {PORT}/admin/board/cs/logsearch

서버 응답 : KEY = cs-id, VALUE= 문의글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  KEY = cs-delete, VALUE= 문의글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-edit-date, VALUE= 수정일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = cs-before-contents, VALUE= 수정 전 내용

동작:  검색글자가 들어가는 이름의 탈퇴 회원을 검색한다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`23. 문의게시판 삭제`

URL  : [DELETE] http://{IP} : {PORT}/board/cs

서버 업데이트 : KEY = cs-delete, VALUE= 삭제 여부

동작: 삭제여부를 갱신

응답: 갱신이 되었다면 true, 아니라면 false를 반환

------------------------------------------

`24. 고객센터 답변하기`

URL  : [POST] http://{IP} : {PORT}/board/contact/anser

PARAM : KEY = contact-id, VALUE= 고객센터 문의글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = email, VALUE= 문의자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = contact-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = contact-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = contact-respons, VALUE= 답변 시간

동작: 메일로 보내고, 답변시간을  업데이트 한다.

응답: 성공적으로 메일이 보내지고 답변 시간이 업데이트 되었다면 true, 아니라면 false를 반환

`25. 고객센터 로그보기`

URL  : [GET] http://{IP} : {PORT}/admin/board/contact/log

서버 응답 : KEY = contact-id, VALUE= 고객센터 문의글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = contact_send, VALUE= 보낸시간

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = contact-contents, VALUE= 내용


동작:  모든 문의글의 로그를 목록으로 보여준다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`26. 고객센터 로그검색`


URL  : [GET] http://{IP} : {PORT}/admin/board/contact/logsearch

PARAM : KEY = contact-id, VALUE= 고객센터 문의글 번호

서버 응답 :   KEY = contact_send, VALUE= 보낸시간

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = contact-contents, VALUE= 내용


동작:  검색글자가 들어가는 번호의 글을 검색한다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

----------------------------------------

`27. 아이디어 게시판 삭제하기 `

URL  : [DELETE] http://{IP} : {PORT}/admin/board/idea

PARAM : KEY = idea-id, VALUE= 아이디어 게시물 번호

동작: 삭제여부를 갱신

응답:  갱신이 되었다면 true, 아니면 false를 반환한다.

`28. 아이디어 게시판센터 로그보기`

URL  : [GET] http://{IP} : {PORT}/admin/board/idea/log

서버 응답 : KEY = idea-id, VALUE= 아이디어 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = idea-contents, VALUE= 수정 전 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  KEY = idea-delete, VALUE= 삭제여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  KEY = idea-edit-date, VALUE= 수정일


동작:  모든 글의 로그를 목록으로 보여준다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`29. 아이디어 게시판 로그검색`


URL  : [GET] http://{IP} : {PORT}/admin/board/idea/logsearch

PARAM : KEY = idea-title, VALUE= 아이디어 제목

서버 응답 : KEY = idea-title, VALUE= 아이디어 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;     KEY = idea-contents, VALUE= 수정 전 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = idea-delete, VALUE= 삭제여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   KEY = idea-edit-date, VALUE= 수정일

동작:  검색글자가 들어가는 번호의 글을 검색한다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

--------------------------------------

`30. 공고정보게시판 등록`

URL  : [POST] http://{IP} : {PORT}/board/anno/upload

PARAM : KEY = anno-id, VALUE= 공고 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  KEY = anno-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  KEY = admin-email, VALUE= 관리자 메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-link, VALUE= 출처링크

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-ref, VALUE= 출처

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-img-path, VALUE= 공고 내용 이미지 번호

동작: 로그를 갱신하고 파라미터에 내용이 다 있는지 확인 후 보낸다.

응답: 등록이 되었다면 true, 아니라면 false를 반환

`31. 공고정보게시판 수정`

**수정 전 화면이 그대로 나오고 수정하기 누르면 갱신됨, 개인정보수정과 비슷**

URL  : [PUT] http://{IP} : {PORT}/board/anno/revise

PARAM : KEY = anno-id, VALUE= 공고 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  KEY = anno-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  KEY = admin-email, VALUE= 관리자 메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-link, VALUE= 출처링크

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-img-path, VALUE= 공고 내용 이미지 번호

서버 업데이트 : KEY = anno-delete, VALUE= 삭제여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-edit-date, VALUE= 수정일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-contents, VALUE= 수정 전 내용

동작: 로그를 업데이트하고 수정사항이 형식에 맞는지 확인 후 업데이트 한다.

응답: 업데이트가 되었다면 true, 아니라면 false를 반환

`32. 공고정보게시판 로그보기`

URL  : [GET] http://{IP} : {PORT}/admin/board/anno/log

서버 응답 : KEY = anno-id, VALUE= 문의글 번호

&nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-delete, VALUE= 삭제여부

&nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-edit-date, VALUE= 수정일

&nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-before-contents, VALUE= 수정 전 내용


동작:  모든 문의글의 로그를 목록으로 보여준다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`33. 공고정보게시판 로그검색`


URL  : [GET] http://{IP} : {PORT}/admin/board/anno/logsearch

PARAM : KEY = anno-id, VALUE= 문의글 번호

서버 응답 : KEY = anno-id, VALUE= 문의글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-delete, VALUE= 삭제여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-edit-date, VALUE= 수정일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = anno-before-contents, VALUE= 수정 전 내용

동작:  검색글자가 들어가는 이름의 탈퇴 회원을 검색한다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`34. 공고정보게시판 삭제`

URL  : [DELETE] http://{IP} : {PORT}/board/anno

서버 업데이트 : KEY = anno-delete, VALUE= 삭제여부 

동작: 삭제여부를 갱신

응답: 삭제가 되었다면 true, 아니라면 false를 반환

---------------------------------

`35. 공지사항게시판 등록`

URL  : [POST] http://{IP} : {PORT}/board/notice/upload

PARAM : KEY = notice-id, VALUE= 공고 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  KEY = notice-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  KEY = admin-email, VALUE= 관리자 이메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-file-path, VALUE= 첨부 파일 경로


동작: 로그를 갱신하고 파라미터에 내용이 다 있는지 확인 후 보낸다.

응답: 등록이 되었다면 true, 아니라면 false를 반환

`36. 공지사항게시판 수정`

**수정 전 화면이 그대로 나오고 수정하기 누르면 갱신됨, 개인정보수정과 비슷**

URL  : [PUT] http://{IP} : {PORT}/board/notice/revise

PARAM : KEY = notice-id, VALUE= 공고 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  KEY = notice-title, VALUE= 제목

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-contents, VALUE= 내용

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-date, VALUE= 작성일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  KEY = admin-email, VALUE= 관리자 메일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-file-path, VALUE= 첨부파일 경로

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-edit-date, VALUE= 수정일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-contents, VALUE= 수정 전 내용

동작: 로그를 업데이트하고 수정사항이 형식에 맞는지 확인 후 업데이트 한다.

응답: 업데이트가 되었다면 true, 아니라면 false를 반환

`37. 공지사항게시판 로그보기`

URL  : [GET] http://{IP} : {PORT}/admin/board/notice/log

PARAM : KEY = anno-id, VALUE= 문의글 번호

서버 응답 : KEY = anno-id, VALUE= 문의글 번호

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-delete, VALUE= 삭제여부

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-edit-date, VALUE= 수정일

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-before-contents, VALUE= 수정 전 내용


동작:  모든 글의 로그를 목록으로 보여준다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`38. 공지사항게시판 로그검색`

URL  : [GET] http://{IP} : {PORT}/admin/board/notice/logsearch

PARAM : KEY = notice-title, VALUE= 제목

서버 응답 : KEY = notice-delete, VALUE= 삭제여부

&nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-edit-date, VALUE= 수정일

&nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = notice-before-contents, VALUE= 수정 전 내용

동작:  검색글자가 들어가는 공지사항 게시판을 검색한다.

응답:  목록을 출력했다면 true, 아니면 false를 반환한다.

`39. 공지사항게시판 삭제`

URL  : [DELETE] http://{IP} : {PORT}/board/notice

PARAM : KEY = anno-id, VALUE= 공지사항 번호

서버 업데이트 : KEY = notice-delete, VALUE= 삭제 여부

동작: 삭제여부를 갱신

응답: 갱신이 되었다면 true, 아니라면 false를 반환

---------------------------------
`40. 로그아웃`

URL  : [POST]] http://{IP} : {PORT}/logout


동작: 세션을 종료시킨다.

응답: 종료되었다면 true, 안되었다면 false를 반환

`41.모든 회원 정보보기`

**모든 이름과 이메일이 나오고 클릭시 그 사람의 모든 정보가 나온다**

URL  : [GET] http://{IP} : {PORT}/admin/userimfor

서버 응답 : KEY = member-email, VALUE= 회원의 이메일 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    KEY = member-name, VALUE= 회원의 이름

동작: 모든 이름과 이메일을 출력한다.

응답: 출력에 성공했다면 true, 안되었다면 false를 반환

`42. 자세한 회원 정보보기`

URL  : [GET] http://{IP} : {PORT}/admin/userimfor

PARAM :  KEY = member-email, VALUE= 회원의 이메일 


동작: 선택한 사람의 member테이블안에 있는 모든 정보를 출력한다.

응답: 출력에 성공했다면 true, 안되었다면 false를 반환

`43. 회원 검색`

**이름을 검색한다.**

URL  : [GET] http://{IP} : {PORT}/admin/userimfor/search

PARAM : KEY = member-email, VALUE= 회원의 이메일 

서버 응답 :  KEY = member-name, VALUE= 회원의 이름

동작:  검색어에 맞는 모든 이름과 이메일을 출력한다.클릭시 42번을 따른다.

응답: 출력에 성공했다면 true, 안되었다면 false를 반환

`44. 게시물 보기`

**각각의 게시물 보기는 각각 게시판 보기 API를 따르지만 관리자는 수정과 삭제를 만든다**

URL  : [GET] http://{IP} : {PORT}/admin/board/idea/게시물 번호
URL  : [GET] http://{IP} : {PORT}/admin/board/anno/게시물 번호
URL  : [GET] http://{IP} : {PORT}/admin/board/notice/게시물 번호
URL  : [GET] http://{IP} : {PORT}/admin/board/cs/게시물 번호
URL  : [GET] http://{IP} : {PORT}/admin/board/contact/게시물 번호

`45. 게시물 목록보기`

**각각의 게시물 목록보기는 각각 목록보기 API를 따르고 관리자는 삭제된 게시물도 볼 수 있다.**

URL  : [GET] http://{IP} : {PORT}/admin/board/idea
URL  : [GET] http://{IP} : {PORT}/admin/board/anno
URL  : [GET] http://{IP} : {PORT}/admin/board/notice
URL  : [GET] http://{IP} : {PORT}/admin/board/cs
URL  : [GET] http://{IP} : {PORT}/admin/board/contact



