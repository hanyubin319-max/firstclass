# AI_CODING_GUIDE.md

## 1. 목적

이 문서는 `firstclass` 저장소의 버거킹 로그인 UI 코드를 기준으로, 이후
다른 로그인 화면을 만들 때 기존 **HTML 구조, CSS 작성 방식, 파일 구조,
네이밍, 학습 수준**을 유지하기 위한 AI 코딩 가이드이다.

핵심 원칙:

> 기존 코드를 먼저 이해하고 유지한다. 필요한 부분만 추가하거나 수정한다.

새 화면이라고 해서 기존 코드를 전부 새 방식으로 바꾸거나 복잡한 기술을
임의로 도입하지 않는다.

------------------------------------------------------------------------

## 2. 현재 프로젝트 구조

``` text
firstclass/
├─ Burgerkiog/
│  ├─ login.html
│  └─ img/
│     ├─ apple_logo_icon.svg
│     ├─ back_icon.svg
│     ├─ cancle_icon.svg
│     ├─ checkbox_active.svg
│     ├─ checkbox_disabled.svg
│     ├─ close_icon.svg
│     ├─ eye_icon.svg
│     ├─ illust_bg.png
│     ├─ kakao_logo_icon.svg
│     ├─ naver_logo_icon.svg
│     └─ samsung_logo_icon.svg
├─ css/
│  └─ default.css
├─ font/
│  ├─ BKBulMatPro-Bold.woff
│  ├─ PretendardVariable.woff2
│  ├─ SDGothicNeoRound-*.woff
│  └─ css/
└─ index.html
```

### 주요 파일 역할

  파일                      역할
  ------------------------- ---------------------------------------
  `Burgerkiog/login.html`   버거킹 로그인 화면 HTML + 화면별 CSS
  `Burgerkiog/img/`         아이콘/이미지
  `css/default.css`         공통 reset, form, 접근성, 기본 스타일
  `font/`                   프로젝트 폰트
  `index.html`              시작 페이지와 로그인 링크

------------------------------------------------------------------------

## 3. HTML 기준

### 기본 구조

``` html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- 필요한 CSS와 폰트 -->
    <title>페이지 제목</title>
</head>
<body>
    <div id="wrap">
        <header>
            ...
        </header>

        <main>
            ...
        </main>
    </div>
</body>
</html>
```

현재 `login.html`의 `#wrap → header → main` 구조를 우선 유지한다.

### 시맨틱 HTML

화면의 모양이 아니라 콘텐츠의 의미를 기준으로 태그를 선택한다.

  태그           사용 기준
  -------------- ------------------------------
  `<header>`     페이지 상단 영역
  `<h1>`         현재 페이지의 대표 제목
  `<main>`       주요 콘텐츠
  `<h2>`         주요 콘텐츠 제목
  `<form>`       사용자 입력/제출
  `<fieldset>`   관련된 폼 입력 그룹
  `<legend>`     fieldset의 그룹 의미
  `<label>`      입력 항목 설명과 연결
  `<input>`      사용자 입력
  `<button>`     기능 실행
  `<a>`          다른 페이지/위치 이동
  `<p>`          일반 문장/안내
  `<ul><li>`     같은 성격의 항목 목록
  `<span>`       문장 일부 또는 접근성 텍스트
  `<div>`        의미가 없는 레이아웃 그룹

### 링크와 버튼

페이지 이동:

``` html
<a href="#">비밀번호 재설정</a>
```

기능 실행:

``` html
<button type="button">비밀번호 보기</button>
```

폼 제출:

``` html
<button type="submit">로그인</button>
```

`<a>`와 `<button>`을 시각적인 모양만 보고 선택하지 않는다.

------------------------------------------------------------------------

## 4. 로그인 폼 구조

현재 버거킹 코드는 다음 구조를 사용한다.

``` html
<form action="">
    <fieldset>
        <legend class="sr-only">로그인화면</legend>

        <label for="email" class="email">이메일 로그인</label>

        <div class="input_box">
            <input
                type="email"
                id="email"
                name="email"
                placeholder="아이디(이메일)을 입력해 주세요"
            >
        </div>

        <div class="input_box rela">
            <input
                type="password"
                name="password"
                placeholder="비밀번호를 입력해 주세요"
            >

            <button type="button" class="pw_btn">
                <span class="sr-only">비밀번호 보기</span>
            </button>
        </div>

        <div class="login_option">
            <label>
                <input type="checkbox" class="check sr-only" checked>
                <span>자동 로그인</span>
            </label>

            <label>
                <input type="checkbox" class="check sr-only">
                <span>아이디 저장</span>
            </label>
        </div>

        <button type="submit" class="login_btn">로그인</button>
    </fieldset>
</form>
```

새 로그인 UI는 이 구조를 참고하되, 화면의 실제 콘텐츠와 의미에 따라
필요한 부분만 변경한다.

------------------------------------------------------------------------

## 5. 접근성

현재 프로젝트는 `.sr-only`를 사용해 화면에는 보이지 않지만 스크린리더가
읽을 수 있는 텍스트를 제공한다.

``` html
<button type="button" class="close_btn">
    <span class="sr-only">닫기</span>
</button>
```

기능을 가진 아이콘 버튼에는 사용자가 기능을 이해할 수 있는 텍스트를
제공한다.

현재 공통 CSS의 `.sr-only`를 재사용하고 새 화면에서 다시 만들지 않는다.

------------------------------------------------------------------------

## 6. CSS 기준

### CSS 변수

현재 `login.html`은 `:root`에서 반복되는 값을 관리한다.

``` css
:root {
    --font: "Sandoll GothicNeoRound", sans-serif;
    --font-pre: "pretendard variable", sans-serif;
    --font-BKR: "BKR", sans-serif;

    --primary: #512314;
    --focus: #C41A00;
    --baseborder: #D5CDC2;
    --basebg: #FFFCF9;
    --errorColor: #C54734;
    --placeholder: #EBE6E2;
    --text: #766053;
    --bg: #F4EBDC;
    --button: #E9DDCD;
    --inputbg: #fffcf9;
}
```

새 브랜드에서도 반복되는 색상과 폰트는 변수로 관리한다.

단, 버거킹의 색상을 다른 브랜드에 그대로 복사하지 않는다. 실제 새
디자인에서 확인한 값을 사용한다.

### 단위

현재 프로젝트는:

``` css
html {
    font-size: 62.5%;
}
```

를 사용하고 글자 크기를 `rem`으로 작성한다.

새 화면에서도 기존 프로젝트의 단위 체계를 우선 유지한다.

### Flex

현재 로그인 UI는 `flex`를 사용해 정렬한다.

``` css
header {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

요소의 가로/세로 정렬과 간격을 먼저 판단한 뒤 `flex`를 사용한다.

### Position

input 안의 비밀번호 보기 버튼처럼 겹쳐 배치하는 경우:

``` css
.input_box.rela {
    position: relative;
}

.pw_btn {
    position: absolute;
    right: 20px;
    bottom: 12px;
}
```

`absolute`를 사용할 때는 기준이 되는 부모의 `position: relative` 여부를
확인한다.

------------------------------------------------------------------------

## 7. 공통 CSS

`css/default.css`에는 이미 다음 내용이 들어 있다.

-   `box-sizing`
-   margin/padding 초기화
-   body 기본 설정
-   리스트 초기화
-   링크 초기화
-   이미지 기본 설정
-   form 요소 초기화
-   focus 처리
-   `.sr-only`
-   reduced motion 대응
-   touch 관련 설정

따라서 새 화면에서 같은 reset CSS를 반복해서 작성하지 않는다.

예를 들어 다음을 새 화면마다 다시 작성하지 않는다.

``` css
* {
    margin: 0;
    padding: 0;
}
```

먼저 `default.css`에 이미 있는지 확인한다.

------------------------------------------------------------------------

## 8. 이미지와 폰트 경로

현재 이미지 파일은 `Burgerkiog/img/`에 있다.

예:

``` css
.pw_btn {
    background: url(img/eye_icon.svg) no-repeat center / 26px;
}
```

새 화면을 만들 때:

1.  기존 파일을 먼저 확인한다.
2.  재사용할 수 있는지 판단한다.
3.  실제 파일 경로를 확인한다.
4.  존재하지 않는 파일을 임의로 작성하지 않는다.

폰트도 동일하다.

실제로 저장소에 없는 폰트 이름이나 경로를 만들어내지 않는다.

------------------------------------------------------------------------

## 9. 클래스 네이밍

현재 코드는 역할 중심의 이름을 사용한다.

``` text
.title
.input_box
.login_option
.login_btn
.login_link
.sns_login
.sns_list
.pw_btn
```

새 클래스도 가능한 한 **기능과 콘텐츠 역할**을 설명하도록 만든다.

좋은 예:

``` css
.close_btn
.password_box
.social_login
```

피해야 할 예:

``` css
.red_box
.brown_button
.big_box
```

기존 클래스가 이미 역할에 맞게 존재한다면 불필요하게 이름을 바꾸지
않는다.

------------------------------------------------------------------------

## 10. 새 화면 제작 순서

### STEP 1. 기존 코드 확인

새 코드를 쓰기 전에 다음을 확인한다.

-   기존 HTML
-   기존 CSS
-   `default.css`
-   이미지
-   폰트
-   파일 경로

### STEP 2. Figma 분석

바로 코딩하지 않고 먼저 확인한다.

-   페이지 대표 제목
-   header
-   main 콘텐츠
-   입력 영역
-   버튼
-   링크
-   안내 문구
-   반복 콘텐츠
-   아이콘/이미지
-   콘텐츠 계층

### STEP 3. HTML 의미 결정

예:

``` text
페이지 대표 제목 → h1
주요 콘텐츠 제목 → h2
사용자 입력 → form
입력 그룹 → fieldset
그룹 제목 → legend
입력 설명 → label
입력 → input
기능 실행 → button
페이지 이동 → a
반복 목록 → ul / li
문장 → p
의미 없는 레이아웃 → div
```

### STEP 4. 기존 구조와 비교

기존 `login.html`에서 재사용할 수 있는 구조를 먼저 찾는다.

예:

``` text
header
main
form
fieldset
input
button
링크 영역
SNS 로그인 영역
```

공통 구조는 유지하고 새 화면에 없는 기능은 억지로 추가하지 않는다.

### STEP 5. CSS 추가

우선순위:

1.  기존 CSS 재사용
2.  CSS 변수 활용
3.  기존 flex 방식 활용
4.  기존 rem 단위 활용
5.  필요한 경우 position 활용
6.  정말 필요한 CSS만 추가

### STEP 6. 테스트

다음 항목을 확인한다.

-   이미지가 정상적으로 보이는가?
-   폰트가 정상적으로 적용되는가?
-   경로가 맞는가?
-   버튼 위치가 맞는가?
-   input 크기가 맞는가?
-   모바일 화면에서 깨지지 않는가?
-   키보드 포커스가 확인되는가?

------------------------------------------------------------------------

## 11. Figma 크기 해석

Figma가 예를 들어 `390 × 844`라고 해도 이를 실제 페이지의 고정 크기로
사용하지 않는다.

``` css
width: 390px;
height: 844px;
```

를 화면 전체에 그대로 적용하지 않는다.

Figma의 프레임 크기는 디자인 확인 기준이며 실제 웹에서는 반응형을
고려한다.

현재 프로젝트의:

``` css
#wrap {
    width: 100%;
    max-width: 1024px;
    min-width: 360px;
    min-height: 100dvh;
}
```

같은 방식을 우선 참고한다.

------------------------------------------------------------------------

## 12. 다른 브랜드 UI 제작 원칙

다른 브랜드를 만들 때 **버거킹의 브랜드 디자인을 복사하지 않고 코딩
구조와 작성 방법을 유지한다.**

### 유지

-   `#wrap → header → main` 구조
-   semantic HTML 판단 방식
-   form / fieldset / label / input / button 구조
-   CSS 변수
-   flex
-   rem
-   필요한 경우 position
-   `.sr-only`
-   공통 `default.css`
-   이미지와 폰트 파일 관리 방식
-   단순한 HTML/CSS 중심 구현

### 변경

-   브랜드 색상
-   브랜드 폰트
-   로고
-   아이콘
-   문구
-   입력 항목
-   버튼 문구
-   SNS 로그인 종류
-   브랜드 고유 UI

------------------------------------------------------------------------

## 13. AI가 코드를 수정하는 방식

AI는 기존 코드를 확인한 뒤 다음 순서로 답한다.

### 1. 잘 작성된 부분

기존 구조에서 유지해야 할 부분을 먼저 설명한다.

### 2. 다시 생각해야 할 부분

문제가 있거나 개선할 수 있는 부분을 구체적으로 설명한다.

### 3. 수정 이유

왜 바꿔야 하는지 HTML/CSS 원리로 설명한다.

### 4. 필요한 코드만 제시

전체 파일을 무조건 새로 작성하지 않고 수정 위치와 필요한 코드 중심으로
제시한다.

------------------------------------------------------------------------

## 14. 금지 사항

### 기존 코드를 전부 새로 작성하지 않는다.

새 화면이라는 이유로 프로젝트의 작성 방식을 완전히 바꾸지 않는다.

### 복잡한 라이브러리를 임의로 추가하지 않는다.

현재 프로젝트에서 사용하지 않는 프레임워크나 라이브러리를 필요 이상으로
도입하지 않는다.

기본 HTML/CSS/JavaScript로 해결할 수 있다면 기본 기술을 우선한다.

### 의미 없는 div를 남발하지 않는다.

박스처럼 보인다는 이유만으로 `<div>`를 사용하지 않는다.

먼저 콘텐츠의 의미를 판단한다.

### 존재하지 않는 파일을 가정하지 않는다.

``` css
background-image: url(img/new_icon.svg);
```

처럼 실제로 존재하지 않는 파일을 임의로 참조하지 않는다.

### Figma 픽셀을 그대로 웹 고정값으로 만들지 않는다.

디자인 프레임의 크기와 실제 웹페이지의 크기를 구분한다.

------------------------------------------------------------------------

## 15. 새 화면 코드 작성 전 체크리스트

-   [ ] 기존 HTML을 확인했는가?
-   [ ] 기존 CSS를 확인했는가?
-   [ ] `default.css`를 확인했는가?
-   [ ] 이미지 파일이 실제로 존재하는가?
-   [ ] 이미지 경로가 맞는가?
-   [ ] 폰트 파일이 실제로 존재하는가?
-   [ ] 기존 클래스를 재사용할 수 있는가?
-   [ ] 새 `<div>`가 정말 필요한가?
-   [ ] `<a>`와 `<button>`을 구분했는가?
-   [ ] `<form>`이 필요한 화면인가?
-   [ ] `fieldset`이 필요한 그룹인가?
-   [ ] 제목 계층이 자연스러운가?
-   [ ] 반복 콘텐츠가 목록인지 확인했는가?
-   [ ] 아이콘 버튼에 접근성 텍스트가 있는가?
-   [ ] Figma 프레임 크기를 고정 크기로 잘못 사용하지 않았는가?
-   [ ] 모바일과 다른 화면 크기를 고려했는가?
-   [ ] 기존 프로젝트의 작성 방식과 지나치게 달라지지 않았는가?

------------------------------------------------------------------------

## 16. 최종 원칙

이 프로젝트에서 AI는 사용자의 코드를 대신 완성하는 것보다 **기존 코드를
이해하고 확장하도록 돕는 역할**을 한다.

새 화면은 다음 흐름으로 제작한다.

``` text
기존 코드 확인
    ↓
Figma 화면 분석
    ↓
콘텐츠 의미 파악
    ↓
HTML 구조 결정
    ↓
기존 CSS 방식 확인
    ↓
필요한 CSS만 추가
    ↓
경로 / 접근성 / 반응형 확인
    ↓
브라우저 테스트
    ↓
오류 원인 분석
    ↓
최소 수정
```

> **새로운 코드를 많이 만드는 것보다 현재 프로젝트의 코드 스타일을
> 이해한 상태에서 필요한 코드만 추가하는 것을 우선한다.**
