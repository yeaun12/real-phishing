'use strict';
// 진짜예요? — C안 디자인 적용본.
// 네트워크 요청, 브라우저 저장소(localStorage·쿠키 등)를 쓰지 않으며 문자 원문을 어디에도 보내지 않습니다.
const $ = id => document.getElementById(id);
const SVG_NS = 'http://www.w3.org/2000/svg';
const ICONS = {
  box: ['M3 7l9-4 9 4v10l-9 4-9-4z', 'M3 7l9 4 9-4', 'M12 11v10'],
  card: ['M3 6h18v12H3z', 'M3 10h18', 'M7 15h4'],
  coin: ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z', 'M7.5 8.5l2 7 2.5-6 2.5 6 2-7', 'M7 11.5h10'],
  car: ['M3 15v-3l3-4h8l4 4h3v3z', 'M3 12h18', 'M5.5 17.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0z', 'M15.5 17.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0z'],
  lock: ['M5 11h14v10H5z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  mail: ['M3 5h18v13H3z', 'M3 6l9 6 9-6', 'M12 17c-1.6-1.1-2.8-2-2.8-3.1a1.4 1.4 0 0 1 2.8-.5a1.4 1.4 0 0 1 2.8.5c0 1.1-1.2 2-2.8 3.1z'],
  help: ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z', 'M9.5 9.5a2.5 2.5 0 0 1 5 .5c0 1.6-2.5 2-2.5 3.5', 'M12 17h.01'],
  chev: ['M9 6l6 6-6 6']
};
const categories = [
  {id:'delivery',name:'택배·배송',icon:'box',keywords:[/택배|배송|배달|운송장|우체국|수취인|미수령|주소지|송장|통관|관세|반송/i],services:['우체국','현재 이용 중인 택배사','해외직구·통관','기타·잘 모르겠음'],steps:['문자 속 배송 조회 링크를 열지 마세요.','내가 실제 주문한 쇼핑몰 주문 내역을 직접 확인하세요.','우체국을 이용했다면 우정사업본부 공식 경로에서 안내를 확인하세요.','배송사 앱이나 직접 저장한 공식 연락처로 조회 결과를 비교하세요.'],official:{label:'우정사업본부 공식 사이트',url:'https://www.koreapost.go.kr/'}},
  {id:'payment',name:'결제·카드',icon:'card',keywords:[/카드|결제|승인|해외승인|대금|출금|소액결제|은행|계좌|청구|미납|금융/i],services:['실제로 사용하는 카드사','실제로 사용하는 은행','통신요금·소액결제','기타·잘 모르겠음'],steps:['문자 속 카드사·은행 전화번호를 사용하지 마세요.','평소 사용하던 카드·은행 앱을 직접 실행하세요.','승인 내역과 금액·시점을 확인하세요.','일치하지 않으면 앱 또는 카드 뒷면 등에서 직접 확인한 공식 고객센터로 문의하세요.']},
  {id:'compensation',name:'보상·대출',icon:'coin',keywords:[/보상|지원금|환급|대출|저금리|개인정보.*유출|피해.*접수|보상금|신용.*등급|특별.*대출/i],services:['보상·지원금 안내','대출·금융상품','개인정보 유출 통지','기타·잘 모르겠음'],steps:['문자에 적힌 신청 링크나 상담 연락처를 사용하지 마세요.','안내한 기관·금융회사명을 별도로 확인하세요.','해당 기관의 평소 사용하던 앱이나 직접 찾은 공식 공지에서 같은 안내가 있는지 확인하세요.','선입금·수수료·인증번호 요구가 있다면 응하지 마세요.']},
  {id:'traffic',name:'교통 과태료',icon:'car',keywords:[/과태료|범칙금|교통위반|속도위반|주정차|교통민원|단속|미납.*과태/i],services:['경찰청 교통민원24','주정차·지자체 고지','기타·잘 모르겠음'],steps:['문자 속 납부 링크를 누르지 마세요.','경찰청 교통민원24에 직접 접속하여 본인 명의 조회가 가능한지 확인하세요.','지자체 고지라면 해당 지자체 공식 서비스에서 확인하세요.','조회된 내역이 없다면 문자 내용을 근거로 납부하지 마세요.'],official:{label:'경찰청 교통민원24',url:'https://www.efine.go.kr/'}},
  {id:'account',name:'계정·보안',icon:'lock',keywords:[/로그인|비밀번호|인증번호|본인인증|계정|보안|정지|해킹|접속|2단계.*인증|아이디/i],services:['내가 사용하는 서비스 계정','포털·이메일 계정','SNS·메신저 계정','기타·잘 모르겠음'],steps:['문자 속 로그인·본인 확인 링크를 사용하지 마세요.','평소 쓰던 앱을 직접 실행하거나 저장된 즐겨찾기에서 접속하세요.','계정 보안 알림·로그인 기록을 확인하세요.','비밀번호를 이미 입력했다면 공식 앱에서 즉시 변경하고 추가 인증을 활성화하세요.']},
  {id:'contact',name:'지인·청첩장',icon:'mail',keywords:[/청첩장|모바일.*청첩장|부고|결혼식|돌잔치|지인|사진.*확인|주소록|카톡|가족|초대장/i],services:['가족·지인 메시지','청첩장·부고 알림','기타·잘 모르겠음'],steps:['문자 속 첨부파일·초대 링크를 바로 열지 마세요.','상대방과 평소 연락하던 다른 방법으로 실제 발신 여부를 확인하세요.','요청이 송금·앱 설치·인증번호 입력으로 이어지는지 살펴보세요.','확인 전에는 개인정보를 보내거나 송금하지 마세요.']},
  {id:'unknown',name:'잘 모르겠어요',icon:'help',keywords:[],services:['상황을 특정하기 어려움','기타·잘 모르겠음'],steps:['문자 속 링크와 전화번호는 사용하지 마세요.','문자가 주장하는 기관이나 서비스를 별도로 확인하세요.','평소 사용하던 앱이나 직접 확인한 공식 창구로 동일한 안내가 있는지 살펴보세요.','확인할 수 없다면 개인정보·금전 제공을 진행하지 마세요.']},
];
const samples = [
  {label:'보상·대출',id:'compensation',message:'[안내] 개인정보 유출 보상 대상자로 확인되었습니다. 오늘까지 신청하세요. https://benefit-check.example/apply'},
  {label:'교통 과태료',id:'traffic',message:'[교통 알림] 미납 과태료가 있습니다. 확인: https://www.fine-notice.example/pay'},
  {label:'택배·배송',id:'delivery',message:'[배송 안내] 배송 주소 오류로 배송이 지연 중입니다. 주소 수정: https://delivery-info.example/update'},
  {label:'지인·청첩장',id:'contact',message:'안녕! 이번에 결혼해. 모바일 청첩장 여기야: https://invitation.example/hello'},
];
const emergencySteps = {
  clicked:['추가 입력이나 다운로드를 하지 마세요.','링크가 열린 것만으로 피해가 확정되는 것은 아니지만, 설치·입력 이력이 있었는지 확인하세요.','관련 서비스의 공식 앱에서 보안 알림과 로그인 이력을 확인하세요.'],
  credential:['공식 서비스 앱에서 즉시 비밀번호를 변경하세요.','같은 비밀번호를 사용한 다른 계정도 바꾸고 추가 인증을 설정하세요.','금융정보·인증정보가 연관됐다면 해당 금융기관 공식 창구에 즉시 알리세요.'],
  installed:['의심스러운 앱 사용을 중단하고 네트워크 연결을 차단하는 방안을 검토하세요.','다른 안전한 기기를 이용해 주요 계정 비밀번호를 변경하세요.','공식 보안·수사 안내를 통해 악성 앱 점검 및 신고를 진행하세요.'],
  paid:['송금·결제한 금융기관에 즉시 공식 고객센터를 통해 사고 사실을 알리세요.','가능한 지급정지 및 피해 신고 절차를 문의하세요.','거래 증빙과 대화 기록은 보존하되, 이 페이지에 개인정보를 입력하지 마세요.']
};
const STEP_NAMES = ['문자 넣기', '상황 확인', '확인하고 기록'];
// 이예은(2026) 「피싱 URL 탐지에서 도메인 중복과 scheme·www 단서의 평가 영향」 v7의 수치 (PhiUSIIL 233,553행 기준)
const PAPER = {
  phishingTotal: 98703, phishingHttps: 47384, phishingWww: 41632,
  httpsPct: 48, wwwPct: 42,          // 47,384/98,703 = 48.0%, 41,632/98,703 = 42.2%
  f1Drop: '12.37~19.25%p'            // scheme·www 제거 후 재학습 시 F1 하락 폭
};

let lastVerdict = null;
let currentStep = 1, result = '미확인', currentCat = 'unknown', currentService = '', emergencyType = 'clicked';
const msg = $('message');
let recordMessage = msg.value;

function clearRecord() {
  setResult('미확인');
  $('user-note').value = '';
  $('memo-status').textContent = '';
  $('save-memo').textContent = '확인 메모 TXT 저장 ↓';
}

function syncRecordMessage() {
  if (recordMessage !== msg.value) {
    clearRecord();
    recordMessage = msg.value;
    lastVerdict = null;
  }
}

function icon(name, cls) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  if (cls) svg.setAttribute('class', cls);
  for (const d of ICONS[name]) { const p = document.createElementNS(SVG_NS, 'path'); p.setAttribute('d', d); svg.append(p); }
  return svg;
}
function badge(cat) {
  const span = document.createElement('span');
  span.className = 'icon-badge tone-' + cat.id;
  span.setAttribute('aria-hidden', 'true');
  span.append(icon(cat.icon));
  return span;
}
function getCat(id) { return categories.find(c => c.id === id) || categories[categories.length - 1]; }
function detectCategories(text) {
  const scores = categories.filter(c => c.id !== 'unknown').map(c => ({id: c.id, score: c.keywords.reduce((n, re) => n + (re.test(text) ? 1 : 0), 0)})).sort((a, b) => b.score - a.score);
  return scores[0] && scores[0].score ? scores[0] : {id: 'unknown', score: 0};
}
function extractURLs(text) {
  const pattern = /(?:https?:\/\/|www\.)[^\s<>"'‘’“”]+|(?:[a-z0-9가-힣-]+\.)+(?:com|net|org|kr|co\.kr|go\.kr|example)(?:\/[^\s<>"'‘’“”]*)?/gi;
  const matches = [...text.matchAll(pattern)].map(m => m[0].replace(/[),.!?。〉》;；]+$/g, ''));
  return [...new Set(matches)].slice(0, 20);
}
function updateCount() { syncRecordMessage(); $('char-count').textContent = msg.value.length.toLocaleString() + ' / 5,000'; }

// 상황 선택(2단계)
function renderCategoryPick() {
  const box = $('category-pick');
  box.replaceChildren();
  for (const c of categories) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile' + (c.id === currentCat ? ' selected' : '');
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(c.id === currentCat));
    b.append(badge(c), document.createTextNode(c.name));
    b.addEventListener('click', () => selectCategory(c.id));
    box.append(b);
  }
}
function renderServices() {
  const box = $('service-pick');
  box.replaceChildren();
  for (const s of getCat(currentCat).services) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (s === currentService ? ' selected' : '');
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(s === currentService));
    b.textContent = s;
    b.addEventListener('click', () => {
      if (currentService !== s) clearRecord();
      currentService = s; renderServices();
    });
    box.append(b);
  }
}
function selectCategory(id) {
  const cat = getCat(id);
  if (currentCat !== cat.id) clearRecord();
  const keepService = currentCat === cat.id && cat.services.includes(currentService);
  currentCat = cat.id;
  if (!keepService) currentService = cat.services[0];
  renderCategoryPick();
  renderServices();
}

function showURLs() {
  const target = $('url-results'), urls = extractURLs(msg.value);
  target.replaceChildren();
  if (!urls.length) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = '입력한 문자에서 주소 형태를 찾지 못했어요. 주소가 없더라도 발신자 신뢰 여부를 확정할 수는 없어요.';
    target.append(p);
    return;
  }
  for (const raw of urls) {
    const box = document.createElement('div'); box.className = 'url-result';
    const label = document.createElement('strong'); label.textContent = '문자에 포함된 주소 (클릭 불가)';
    const code = document.createElement('code'); code.textContent = raw;
    const look = urlLook(raw);
    const tags = document.createElement('div'); tags.className = 'look-tags';
    tags.append(lookTag('https', look.https), lookTag('www', look.www));
    const detail = document.createElement('p'); detail.className = 'hint';
    detail.textContent = look.host
      ? '표시된 호스트: ' + look.host + ' · 실제 운영자 또는 안전성을 보증하지 않아요.'
      : '주소 형식을 해석하기 어려워요. 클릭하지 않고 직접 확인하세요.';
    const paper = document.createElement('p'); paper.className = 'paper-note';
    paper.textContent = paperNote(look);
    box.append(label, code, tags, detail, paper);
    target.append(box);
  }
}

// 10번 논문 결과: 겉모양 단서(https·www)는 안전의 근거가 되지 못한다.
function urlLook(raw) {
  const lower = raw.toLowerCase();
  const https = lower.startsWith('https://');
  let host = '';
  try { host = new URL(lower.includes('://') ? raw : 'https://' + raw).hostname; } catch { host = ''; }
  const www = lower.startsWith('www.') || host.startsWith('www.');
  return { https, www, host };
}
function lookTag(name, on) {
  const span = document.createElement('span');
  span.className = 'look-tag' + (on ? ' on' : '');
  span.textContent = name + (on ? ' 있음' : ' 없음');
  return span;
}
function paperNote(look) {
  const parts = [];
  if (look.https) parts.push(`약 ${PAPER.httpsPct}%가 https였고`);
  if (look.www) parts.push(`약 ${PAPER.wwwPct}%가 www.로 시작했어요`);
  if (parts.length) {
    const said = parts.join(', ').replace(/였고$/, '였어요');
    return `논문 자료의 피싱 URL 중 ${said}. 이 표시만으로는 안전하다고 볼 수 없어요.`;
  }
  return `https·www가 없지만, 논문에서는 이런 겉모양 단서에 기댄 판단이 흔들렸어요(제거 시 F1 ${PAPER.f1Drop} 하락). 겉모양과 상관없이 공식 경로로 확인하세요.`;
}

const STEP_HEADINGS = ['hero-heading', 'step-two-heading', 'step-three-heading'];
// push: 휴대폰·브라우저 뒤로가기로 이전 단계에 돌아올 수 있게 기록을 남깁니다.
function setStep(n, {scroll = true, push = true, focus = true} = {}) {
  if (push && n !== currentStep) history.pushState({step: n}, '');
  currentStep = n;
  ['step-one', 'step-two', 'step-three'].forEach((id, i) => { $(id).hidden = i + 1 !== n; });
  const bars = $('progress-bars').children;
  for (let i = 0; i < bars.length; i++) {
    bars[i].className = 'bar' + (i + 1 === n ? ' active' : i + 1 < n ? ' done' : '');
  }
  $('progress-bars').setAttribute('aria-label', n + '단계 / 3단계');
  $('progress-text').textContent = n + ' / 3 · ' + STEP_NAMES[n - 1];
  if (scroll) $('check').scrollIntoView({behavior: 'smooth', block: 'start'});
  // 화면 읽기 프로그램·키보드 사용자에게 새 단계가 열렸음을 알립니다.
  if (focus) $(STEP_HEADINGS[n - 1]).focus({preventScroll: true});
}

// ---------- 위험 신호 판정 ----------
// 안전하다는 판정은 하지 않습니다. 논문 결과에 따라 https·www는 신호(점수)에 넣지 않고 경고 문구에만 씁니다.
const SHORTENERS = ['bit.ly', 'han.gl', 'me2.do', 'url.kr', 't.ly', 'tinyurl.com', 'goo.gl', 'vo.la', 'buly.kr', 'c11.kr', 'is.gd', 'ow.ly', 'shorturl.at', 'cutt.ly', 'rb.gy'];
const ODD_TLDS = ['xyz', 'top', 'icu', 'click', 'shop', 'live', 'cc', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'buzz', 'rest', 'monster', 'cyou'];
const TEXT_SIGNALS = [
  {re: /오늘\s*(안|까지|중)|즉시|지금\s*바로|긴급|당일|24시간|기한\s*내|(정지|만료|삭제|차단)\s*(예정|됩니다|될)/, label: '서두르게 만드는 표현', why: '시간이 없다고 느끼게 해 확인하지 않고 누르게 만드는 흔한 방식이에요.'},
  {re: /송금|입금|이체|납부|미납|수수료|선입금|계좌|환급금|대출금|결제\s*(대기|요청)/, label: '돈과 관련된 요구', why: '납부·입금·환급을 문자 속 링크로 처리하게 하면 특히 조심해야 해요.'},
  {re: /비밀번호|인증번호|OTP|보안카드|신분증|본인\s*인증|앱\s*설치|\.apk|원격\s*(지원|제어)/i, label: '인증정보·앱 설치 요구', why: '인증번호나 앱 설치를 요구하면 계정·금융 피해로 이어질 수 있어요.'},
  {re: /개인정보.{0,6}유출|유출.{0,6}보상|보상\s*대상/, label: '최근 공식 경보와 같은 유형', why: '금융위원회(2026.10.06)가 주의하라고 안내한 "유출 보상" 유형이에요.'},
  {re: /엄마|아빠|딸|아들|(폰|휴대폰|핸드폰).{0,6}(고장|액정|깨|수리)|번호.{0,4}바뀌|새\s*번호/, label: '가족·지인을 사칭할 때 쓰는 표현', why: '평소 쓰던 연락 방법으로 본인이 맞는지 먼저 확인하세요.'},
];
const PUBLIC_NAMES = /경찰|검찰|법원|국세청|금융감독원|금감원|우체국|우정사업본부|건강보험|국민연금|정부|행정안전부|도로공사|교통민원|지자체|구청|시청/;

function findSignals(text) {
  const signals = [];
  const urls = extractURLs(text);
  const looks = urls.map(urlLook);
  const hosts = looks.map(l => l.host).filter(Boolean);
  if (urls.length) signals.push({label: '누르라고 보낸 링크', why: '문자 속 링크 대신 평소 쓰던 앱이나 직접 찾은 공식 사이트로 확인하세요.'});
  if (hosts.some(h => SHORTENERS.some(s => h === s || h.endsWith('.' + s)))) signals.push({label: '단축 주소', why: '줄인 주소라 실제로 어디로 가는지 알 수 없어요.'});
  if (hosts.some(h => /^\d{1,3}(\.\d{1,3}){3}$/.test(h))) signals.push({label: '숫자로 된 주소', why: '기관 이름 대신 숫자(IP)로 된 주소는 흔하지 않아요.'});
  if (hosts.some(h => ODD_TLDS.includes(h.split('.').pop()))) signals.push({label: '흔치 않은 주소 끝자리', why: '공공기관·금융회사가 잘 쓰지 않는 주소 끝자리예요.'});
  if (hosts.length && PUBLIC_NAMES.test(text) && !hosts.some(h => /\.(go|or)\.kr$/.test(h))) signals.push({label: '공공기관 이름과 다른 주소', why: '공공기관을 말하지만 주소가 공공기관 주소(.go.kr 등)가 아니에요.'});
  for (const s of TEXT_SIGNALS) if (s.re.test(text)) signals.push({label: s.label, why: s.why});
  return {signals, https: looks.some(l => l.https), www: looks.some(l => l.www), hasText: text.trim().length > 0};
}

function renderVerdict() {
  const r = findSignals(msg.value);
  lastVerdict = r;
  const box = $('verdict'), list = $('verdict-list');
  let level, title, tone;
  if (!r.hasText) { level = '문자 없음'; title = '문자 없이 시작했어요. 공식 경로로 확인하세요'; tone = 'none'; }
  else if (r.signals.length >= 3) { level = `위험 신호 ${r.signals.length}개 · 많음`; title = '링크를 누르지 마세요'; tone = 'high'; }
  else if (r.signals.length >= 1) { level = `위험 신호 ${r.signals.length}개 · 있음`; title = '공식 경로로 먼저 확인하세요'; tone = 'mid'; }
  else { level = '위험 신호 · 안 보임'; title = '그래도 공식 경로로 확인하세요'; tone = 'low'; }
  box.className = 'verdict tone-' + tone;
  $('verdict-level').textContent = level;
  $('verdict-title').textContent = title;
  list.replaceChildren();
  for (const s of r.signals) {
    const li = document.createElement('li');
    const b = document.createElement('b'); b.textContent = s.label;
    const span = document.createElement('span'); span.textContent = s.why;
    li.append(b, span); list.append(li);
  }
  list.hidden = r.signals.length === 0;
  const notes = [];
  if (r.https || r.www) notes.push(`${[r.https && 'https', r.www && 'www'].filter(Boolean).join('·')}가 붙어 있지만 안전 표시가 아니에요. 논문 자료에서 피싱 URL의 약 ${PAPER.httpsPct}%가 https, 약 ${PAPER.wwwPct}%가 www.로 시작했어요.`);
  if (r.hasText && r.signals.length === 0) notes.push('신호가 안 보인다고 안전하다는 뜻은 아니에요. 새로운 수법은 이 목록에 없을 수 있어요.');
  $('verdict-note').textContent = notes.join(' ');
  $('verdict-note').hidden = notes.length === 0;
}

function toStepTwo(forced = null) {
  syncRecordMessage();
  const match = detectCategories(msg.value);
  selectCategory(forced || match.id);
  const info = $('classification-info');
  info.replaceChildren();
  info.append(document.createTextNode(forced ? '직접 선택한 상황이에요. 아래에서 바꿀 수 있어요.' : match.score ? '문자 단어에 근거한 후보를 골랐어요. 다르면 직접 바꿔 주세요.' : '뚜렷한 단어가 없어 기본 항목으로 시작해요. 실제 상황을 직접 골라 주세요.'));
  const small = document.createElement('small');
  small.textContent = '단어로 찾은 후보예요. 실제 발신자나 사기 여부를 판정한 결과는 아니에요.';
  info.append(small);
  showURLs();
  renderVerdict();
  setStep(2);
}

function buildGuide() {
  const cat = getCat(currentCat), target = $('guide-content');
  target.replaceChildren();
  const panel = document.createElement('div'); panel.className = 'guide-box';
  const h = document.createElement('h3'); h.append(badge(cat), document.createTextNode('내가 직접 확인할 순서 · ' + cat.name));
  const ol = document.createElement('ol');
  cat.steps.forEach(x => { const li = document.createElement('li'); li.textContent = x; ol.append(li); });
  const svc = document.createElement('p'); svc.className = 'guide-annotation';
  const b = document.createElement('b'); b.textContent = currentService;
  svc.append(document.createTextNode('선택한 실제 서비스·상황: '), b);
  panel.append(h, ol, svc);
  if (cat.official) {
    // 공식 링크는 위 categories의 고정 허용목록에서만 만듭니다. 문자 속 주소는 절대 링크로 만들지 않습니다.
    const a = document.createElement('a'); a.className = 'link-button';
    a.href = cat.official.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.textContent = cat.official.label + ' ↗';
    panel.append(a);
  } else {
    const p = document.createElement('p'); p.className = 'guide-annotation';
    p.textContent = '문자에 나온 링크·번호가 아닌, 평소 이용하던 앱 또는 직접 확인한 공식 경로를 사용하세요.';
    panel.append(p);
  }
  const note = document.createElement('p'); note.className = 'guide-annotation';
  note.textContent = '문자 속 주소는 공식 링크 목록에 추가하지 않았어요. 링크 이동은 직접 누를 때만 이루어져요.';
  panel.append(note);
  target.append(panel);
}

function setResult(value) {
  result = value;
  document.querySelectorAll('[data-result]').forEach(btn => {
    const on = btn.dataset.result === value;
    btn.classList.toggle('selected', on);
    btn.setAttribute('aria-checked', String(on));
  });
}

function renderEmergency() {
  document.querySelectorAll('[data-em]').forEach(btn => {
    const on = btn.dataset.em === emergencyType;
    btn.classList.toggle('selected', on);
    btn.setAttribute('aria-checked', String(on));
  });
  const box = $('emergency-instructions');
  box.replaceChildren();
  const title = document.createElement('strong'); title.textContent = '지금 할 일';
  const ul = document.createElement('ul');
  for (const line of emergencySteps[emergencyType] || emergencySteps.clicked) { const li = document.createElement('li'); li.textContent = line; ul.append(li); }
  box.append(title, ul);
}

function reset() {
  msg.value = ''; $('user-note').value = ''; updateCount();
  setResult('미확인');
  selectCategory('unknown');
  $('memo-status').textContent = '';
  history.replaceState({step: 1}, '');
  setStep(1, {push: false});
}

function memoText() {
  const cat = getCat(currentCat);
  const cleanNote = $('user-note').value.trim();
  return ['진짜예요? · 확인 메모', '작성 일시: ' + new Date().toLocaleString('ko-KR'), '확인 상황: ' + cat.name, '직접 선택한 서비스: ' + currentService, '확인 순서:', ...cat.steps.map((s, i) => `${i + 1}. ${s}`), '문자에서 찾은 위험 신호: ' + (lastVerdict && lastVerdict.hasText ? (lastVerdict.signals.length ? lastVerdict.signals.map(x => x.label).join(', ') : '안 보임(안전하다는 뜻은 아님)') : '문자 없이 시작'), '확인 결과: ' + result, '추가 메모: ' + (cleanNote || '(없음)'), '', '※ 문자 원문, 의심 링크, 발신 번호는 이 메모에 자동 포함하지 않습니다.', '※ 메모 칸에 사용자가 직접 입력한 내용은 포함됩니다.'].join('\n');
}

function saveMemo() {
  const content = memoText();
  const blob = new Blob(['﻿', content], {type: 'text/plain;charset=utf-8'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '진짜예요_확인메모.txt';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 30000);
  $('save-memo').textContent = '저장했어요 ✓ 다시 저장하기';
}

async function copyMemo() {
  const status = $('memo-status');
  try {
    await navigator.clipboard.writeText(memoText());
    status.textContent = '메모를 복사했어요. 메모장이나 채팅에 붙여 넣으면 돼요.';
  } catch {
    status.textContent = '이 브라우저에서는 복사하지 못했어요. TXT 저장을 이용해 주세요.';
  }
}

function setTextSize(big) {
  document.documentElement.classList.toggle('text-lg', big);
  const b = $('text-size');
  b.setAttribute('aria-pressed', String(big));
  b.setAttribute('aria-label', big ? '글자 원래 크기로' : '글자 크게 보기');
}

function init() {
  // 1단계 상황 타일
  const quick = $('category-quick');
  for (const c of categories) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tile';
    b.append(badge(c), document.createTextNode(c.name));
    b.addEventListener('click', () => toStepTwo(c.id));
    quick.append(b);
  }
  // 예시 문자
  const sampleGrid = $('sample-grid');
  for (const example of samples) {
    const b = document.createElement('button');
    b.className = 'sample-card'; b.type = 'button';
    const text = document.createElement('span'); text.className = 'sample-text';
    const title = document.createElement('b'); title.textContent = example.label;
    const sub = document.createElement('span'); sub.textContent = '가상 문자로 체험';
    text.append(title, sub);
    b.append(badge(getCat(example.id)), text, icon('chev', 'chev'));
    b.addEventListener('click', () => { msg.value = example.message; updateCount(); toStepTwo(example.id); });
    sampleGrid.append(b);
  }
  selectCategory('unknown');
  history.replaceState({step: 1}, '');
  setStep(1, {scroll: false, push: false, focus: false});

  msg.addEventListener('input', updateCount);
  $('paste-message').addEventListener('click', async () => {
    try { const t = await navigator.clipboard.readText(); msg.value = (t || '').slice(0, 5000); updateCount(); }
    catch { msg.focus(); }
  });
  $('clear-message').addEventListener('click', () => { msg.value = ''; updateCount(); msg.focus(); });
  $('analyze').addEventListener('click', () => toStepTwo());
  $('back-one').addEventListener('click', () => setStep(1));
  $('back-two').addEventListener('click', () => setStep(2));
  $('show-guide').addEventListener('click', () => { buildGuide(); $('save-memo').textContent = '확인 메모 TXT 저장 ↓'; $('memo-status').textContent = ''; setStep(3); });
  $('copy-memo').addEventListener('click', copyMemo);
  $('text-size').addEventListener('click', () => setTextSize(!document.documentElement.classList.contains('text-lg')));
  // 뒤로가기·앞으로가기: 기록된 단계로 이동 (주소창의 #이동 기록은 무시)
  window.addEventListener('popstate', event => {
    const dlg = $('emergency-dialog');
    if (dlg.open) dlg.close();
    const step = event.state && event.state.step;
    if (!step) return;
    if (step === 3) buildGuide();
    setStep(step, {push: false});
  });
  document.querySelectorAll('[data-result]').forEach(b => b.addEventListener('click', () => setResult(b.dataset.result)));
  $('save-memo').addEventListener('click', saveMemo);
  $('reset-top').addEventListener('click', reset);
  $('reset-bottom').addEventListener('click', reset);

  const dialog = $('emergency-dialog');
  $('open-help').addEventListener('click', () => { renderEmergency(); dialog.showModal(); });
  $('close-dialog').addEventListener('click', () => dialog.close());
  document.querySelectorAll('[data-em]').forEach(b => b.addEventListener('click', () => { emergencyType = b.dataset.em; renderEmergency(); }));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  // 하단 탭 현재 위치 표시
  document.querySelectorAll('.tabbar a, .side-nav a').forEach(a => a.addEventListener('click', () => {
    const group = a.closest('nav');
    group.querySelectorAll('a').forEach(x => {
      const on = x === a;
      x.classList.toggle(group.classList.contains('tabbar') ? 'tab-current' : 'nav-current', on);
      if (on) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current');
    });
  }));
}
document.addEventListener('DOMContentLoaded', init);
