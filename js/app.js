/**
 * Pawsitive - 반려견 산책 매칭 웹 애플리케이션
 * 메인 애플리케이션 로직, 라우팅, 네비게이션
 */

// ============================================================
// 데이터 모델 / 클래스 정의
// ============================================================

/**
 * 품종 모델
 * @typedef {Object} Breed
 * @property {string} id
 * @property {string} name
 * @property {'small'|'medium'|'large'} size
 * @property {string} personality
 * @property {'low'|'medium'|'high'} exerciseLevel
 * @property {string[]} cautions
 * @property {string} imageUrl
 */

/**
 * 교육 콘텐츠 모델
 * @typedef {Object} EducationContent
 * @property {string} id
 * @property {string} title
 * @property {'posture'|'leash'|'safety'} category
 * @property {string} body
 * @property {string[]} imageUrls
 */

/**
 * 진행률 정보
 * @typedef {Object} ProgressInfo
 * @property {number} total
 * @property {number} completed
 * @property {number} ratio
 * @property {string[]} completedIds
 */

/**
 * 게시물 모델
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} authorId
 * @property {string} authorName
 * @property {string} text
 * @property {string[]} imageUrls
 * @property {number} likes
 * @property {string[]} likedBy
 * @property {Comment[]} comments
 * @property {string} createdAt
 */

/**
 * 댓글 모델
 * @typedef {Object} Comment
 * @property {string} id
 * @property {string} authorId
 * @property {string} authorName
 * @property {string} text
 * @property {string} createdAt
 */

/**
 * 거래 모델
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} userId
 * @property {'earn'|'spend'} type
 * @property {number} amount
 * @property {string} reason
 * @property {string} createdAt
 * @property {number} balanceAfter
 */

/**
 * 매칭 프로필 모델
 * @typedef {Object} MatchProfile
 * @property {string} userId
 * @property {string} userName
 * @property {string} location
 * @property {'small'|'medium'|'large'} dogSize
 * @property {string} preferredTime
 * @property {number} rating
 */

/**
 * 매칭 요청 모델
 * @typedef {Object} MatchRequest
 * @property {string} id
 * @property {string} fromUserId
 * @property {string} toUserId
 * @property {'pending'|'accepted'|'rejected'} status
 * @property {string} createdAt
 */

/**
 * 산책 일정 모델
 * @typedef {Object} WalkSchedule
 * @property {string} id
 * @property {string} matchRequestId
 * @property {string[]} participants
 * @property {string} scheduledAt
 * @property {'scheduled'|'completed'|'cancelled'} status
 */

/**
 * 리뷰 모델
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} scheduleId
 * @property {string} reviewerId
 * @property {string} targetId
 * @property {number} rating
 * @property {string} text
 * @property {string} createdAt
 */

/**
 * 사용자 모델
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} passwordHash
 * @property {Dog[]} dogs
 * @property {number} pawCoins
 * @property {string} createdAt
 */

/**
 * 반려견 모델
 * @typedef {Object} Dog
 * @property {string} id
 * @property {string} name
 * @property {string} breed
 * @property {number} age
 * @property {'small'|'medium'|'large'} size
 */

/**
 * 인증 토큰 모델
 * @typedef {Object} AuthToken
 * @property {string} token
 * @property {string} userId
 * @property {string} expiresAt
 */

// ============================================================
// 서비스 인터페이스 정의 (JSDoc 기반)
// ============================================================

/**
 * @typedef {Object} BreedService
 * @property {function(): Breed[]} getAll
 * @property {function(string): Breed|null} getById
 * @property {function(string): Breed[]} search
 */

/**
 * @typedef {Object} EducationService
 * @property {function(string): EducationContent[]} getByCategory
 * @property {function(string): EducationContent|null} getById
 * @property {function(string, string): void} markComplete
 * @property {function(string): ProgressInfo} getProgress
 */

/**
 * @typedef {Object} CommunityService
 * @property {function(number): Post[]} getFeed
 * @property {function(Object): Post} createPost
 * @property {function(string, string): Post} toggleLike
 * @property {function(string, Object): Comment} addComment
 */

/**
 * @typedef {Object} WalletService
 * @property {function(string): number} getBalance
 * @property {function(string): Transaction[]} getTransactions
 * @property {function(string, number, string): Transaction} earnCoins
 * @property {function(string, number, string): Transaction|null} spendCoins
 */

/**
 * @typedef {Object} MatchingService
 * @property {function(string): MatchProfile[]} getRecommendations
 * @property {function(string, string): MatchRequest} sendRequest
 * @property {function(string): WalkSchedule} acceptRequest
 * @property {function(string): void} rejectRequest
 * @property {function(string): void} completeWalk
 * @property {function(string, Object): Review} addReview
 */

/**
 * @typedef {Object} AuthService
 * @property {function(Object): User} register
 * @property {function(string, string): AuthToken|null} login
 * @property {function(): User|null} getCurrentUser
 * @property {function(string, Object): User} updateProfile
 * @property {function(string, Object): Dog} registerDog
 */

// ============================================================
// 라우터
// ============================================================

const Router = (() => {
  const routes = {};
  let currentRoute = null;
  let notFoundHandler = null;

  /**
   * 라우트 등록
   * @param {string} path - 해시 경로 (예: '/', '/breeds', '/breeds/:id')
   * @param {function(Object): void} handler - 라우트 핸들러 (params 객체 전달)
   */
  function register(path, handler) {
    routes[path] = handler;
  }

  /**
   * 404 핸들러 등록
   * @param {function(): void} handler
   */
  function setNotFound(handler) {
    notFoundHandler = handler;
  }

  /**
   * 현재 해시에서 경로 추출
   * @returns {string}
   */
  function getPath() {
    const hash = window.location.hash || '#/';
    const fullPath = hash.substring(1) || '/';
    // 쿼리 파라미터 제거
    return fullPath.split('?')[0];
  }

  /**
   * 경로 매칭 (파라미터 포함)
   * @param {string} pattern - 라우트 패턴 (예: '/breeds/:id')
   * @param {string} path - 실제 경로
   * @returns {Object|null} 매칭된 파라미터 또는 null
   */
  function matchRoute(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].substring(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  /**
   * 현재 경로에 맞는 핸들러 실행
   */
  function resolve() {
    const path = getPath();

    // 정확한 매칭 먼저 시도
    if (routes[path]) {
      currentRoute = path;
      routes[path]({});
      updateActiveNav();
      return;
    }

    // 파라미터 매칭 시도
    for (const pattern of Object.keys(routes)) {
      const params = matchRoute(pattern, path);
      if (params !== null) {
        currentRoute = pattern;
        routes[pattern](params);
        updateActiveNav();
        return;
      }
    }

    // 404
    if (notFoundHandler) {
      currentRoute = null;
      notFoundHandler();
    }
  }

  /**
   * 프로그래밍 방식으로 네비게이션
   * @param {string} path
   */
  function navigate(path) {
    window.location.hash = '#' + path;
  }

  /**
   * 네비게이션 바 활성 상태 업데이트
   */
  function updateActiveNav() {
    const path = getPath();
    document.querySelectorAll('.navbar__link').forEach(link => {
      const href = link.getAttribute('data-route');
      if (!href) return;
      const isActive = path === href || (href !== '/' && path.startsWith(href));
      link.classList.toggle('active', isActive);
    });
  }

  /**
   * 라우터 초기화
   */
  function init() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  return {
    register,
    setNotFound,
    navigate,
    resolve,
    init,
    getPath
  };
})();

// ============================================================
// 네비게이션 바 렌더링
// ============================================================

function renderNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const navItems = [
    { route: '/', icon: '🏠', label: '홈' },
    { route: '/breeds', icon: '🐕', label: '품종정보' },
    { route: '/education', icon: '📚', label: '교육' },
    { route: '/community', icon: '💬', label: '커뮤니티' },
    { route: '/wallet', icon: '🪙', label: '지갑' },
    { route: '/matching', icon: '🤝', label: '산책매칭' },
    { route: '/profile', icon: '👤', label: '프로필' }
  ];

  navbar.innerHTML = `
    <div class="navbar__brand" onclick="Router.navigate('/')">
      <span class="paw-icon">🐾</span>
      <span>Pawsitive</span>
    </div>
    <nav class="navbar__links">
      ${navItems.map(item => `
        <button class="navbar__link" data-route="${item.route}" onclick="Router.navigate('${item.route}')">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </button>
      `).join('')}
    </nav>
    <div class="navbar__auth" id="nav-auth"></div>
  `;

  updateNavAuth();
}

/**
 * 네비게이션 바 인증 상태 업데이트
 */
function updateNavAuth() {
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;

  const user = AuthService.getCurrentUser();

  if (user) {
    navAuth.innerHTML = `
      <span style="font-size:0.85rem; font-weight:600; color:var(--color-text);">${user.name}님</span>
      <button class="btn btn-secondary btn-sm" onclick="handleLogout()">로그아웃</button>
    `;
  } else {
    navAuth.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="Router.navigate('/login')">로그인</button>
    `;
  }
}

// ============================================================
// 페이지 렌더러 (플레이스홀더)
// ============================================================

function renderPage(html) {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div class="page-content">${html}</div>`;
  }
  window.scrollTo(0, 0);
}

// --- 홈 페이지 ---
function renderHomePage() {
  const user = AuthService.getCurrentUser();

  // 히어로 섹션
  let heroHtml = '';
  if (user) {
    heroHtml = `
      <div class="home-hero">
        <h2>${user.name}님, 반가워요! 🐾💕</h2>
        <p>오늘도 우리 아이와 행복한 하루 보내세요~</p>
      </div>
    `;
  } else {
    heroHtml = `
      <div class="home-hero">
        <h2>우리 아이와 함께하는 행복한 매일 🐾💕</h2>
        <p>Pawsitive에서 반려견과의 특별한 시간을 시작하세요~</p>
      </div>
    `;
  }

  // Paw 코인 잔액 요약 (로그인 시)
  let walletSummaryHtml = '';
  if (user) {
    const balance = WalletService.getBalance(user.id);
    walletSummaryHtml = `
      <div class="home-wallet-summary" onclick="Router.navigate('/wallet')" style="cursor:pointer;">
        <div style="display:flex; align-items:center; justify-content:space-between; background:linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color:#fff; border-radius:var(--radius-md); padding:20px 24px; margin-bottom:24px; box-shadow:var(--shadow-md);">
          <div>
            <div style="font-size:0.85rem; opacity:0.9; font-weight:700;">🪙 보유 Paw 코인</div>
            <div style="font-size:1.8rem; font-weight:900; margin-top:4px;">${balance} <span style="font-size:0.9rem; font-weight:700;">PAW</span></div>
          </div>
          <div style="font-size:2.5rem;">🐾</div>
        </div>
      </div>
    `;
  }

  // 최근 커뮤니티 게시물 미리보기 (최대 3개)
  let recentPostsHtml = '';
  const recentPosts = CommunityService.getFeed(1).slice(0, 3);
  if (recentPosts.length > 0) {
    const postsListHtml = recentPosts.map(post => {
      const timeAgo = formatTimeAgo(post.createdAt);
      const truncatedText = post.text.length > 60 ? post.text.substring(0, 60) + '...' : post.text;
      return `
        <div style="display:flex; gap:10px; align-items:flex-start; padding:12px 0; border-bottom:1px solid var(--color-border);">
          <div class="post-card__avatar" style="flex-shrink:0;">${post.authorName.charAt(0)}</div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600; font-size:0.85rem;">${post.authorName}</span>
              <span style="font-size:0.75rem; color:var(--color-text-muted);">${timeAgo}</span>
            </div>
            <div style="font-size:0.85rem; color:var(--color-text); margin-top:4px;">${truncatedText}</div>
            <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:4px;">❤️ ${post.likes} · 💬 ${post.comments.length}</div>
          </div>
        </div>
      `;
    }).join('');

    recentPostsHtml = `
      <div style="margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:1.1rem; font-weight:800;">💬 최근 커뮤니티 소식</h3>
          <button class="btn btn-secondary btn-sm" onclick="Router.navigate('/community')">더보기</button>
        </div>
        <div class="card" style="padding:4px 16px;">
          ${postsListHtml}
        </div>
      </div>
    `;
  }

  // 비로그인 시 회원가입 유도 CTA
  let ctaHtml = '';
  if (!user) {
    ctaHtml = `
      <div style="background:var(--color-bg-card); border:2px dashed var(--color-primary-light); border-radius:var(--radius-md); padding:24px; text-align:center; margin-bottom:24px;">
        <div style="font-size:2rem; margin-bottom:8px;">🐕</div>
        <h3 style="font-size:1rem; font-weight:700; margin-bottom:6px;">지금 가입하고 함께해요! 🐶💗</h3>
        <p style="font-size:0.85rem; color:var(--color-text-light); margin-bottom:16px;">회원가입하면 Paw 코인 적립, 산책 매칭, 커뮤니티 참여가 가능해요~</p>
        <div style="display:flex; gap:8px; justify-content:center;">
          <button class="btn btn-primary" onclick="Router.navigate('/register')">회원가입</button>
          <button class="btn btn-secondary" onclick="Router.navigate('/login')">로그인</button>
        </div>
      </div>
    `;
  }

  // 기능 카드 (기존 유지)
  const featureCardsHtml = `
    <div class="home-features">
      <div class="feature-card" onclick="Router.navigate('/breeds')">
        <div class="feature-icon">🐕</div>
        <h3>품종 정보</h3>
        <p>우리 아이 품종의 특성과 산책 팁</p>
      </div>
      <div class="feature-card" onclick="Router.navigate('/education')">
        <div class="feature-icon">📚</div>
        <h3>산책 교육</h3>
        <p>올바른 산책 자세와 안전 수칙</p>
      </div>
      <div class="feature-card" onclick="Router.navigate('/community')">
        <div class="feature-icon">💬</div>
        <h3>커뮤니티</h3>
        <p>반려인들과 소통하고 공유해요</p>
      </div>
      <div class="feature-card" onclick="Router.navigate('/wallet')">
        <div class="feature-icon">🪙</div>
        <h3>Paw 지갑</h3>
        <p>활동으로 코인을 모으고 사용해요</p>
      </div>
      <div class="feature-card" onclick="Router.navigate('/matching')">
        <div class="feature-icon">🤝</div>
        <h3>산책 매칭</h3>
        <p>가까운 산책 친구를 찾아봐요</p>
      </div>
      <div class="feature-card" onclick="Router.navigate('/profile')">
        <div class="feature-icon">👤</div>
        <h3>내 프로필</h3>
        <p>프로필 관리 및 반려견 등록</p>
      </div>
    </div>
  `;

  renderPage(`
    ${heroHtml}
    ${walletSummaryHtml}
    ${ctaHtml}
    ${recentPostsHtml}
    ${featureCardsHtml}
  `);
}

// --- 품종 목록 페이지 ---
function renderBreedListPage() {
  renderPage(`
    <div class="page-header">
      <h1>🐕 품종 정보</h1>
      <p>우리 아이 품종의 특성과 주의사항을 알아봐요~</p>
    </div>
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input type="text" id="breed-search" placeholder="품종 이름으로 검색..." oninput="handleBreedSearch(this.value)">
    </div>
    <div class="grid-2" id="breed-list">
      ${renderBreedCards(BreedService.getAll())}
    </div>
  `);
}

function renderBreedCards(breeds) {
  if (breeds.length === 0) {
    return `<div class="empty-state" style="grid-column: 1/-1;">
      <div class="empty-icon">🔍</div>
      <p>검색 결과가 없습니다</p>
    </div>`;
  }
  const sizeMap = { small: '소형', medium: '중형', large: '대형' };
  const exerciseMap = { low: '낮음', medium: '보통', high: '높음' };
  return breeds.map(breed => `
    <div class="card" onclick="Router.navigate('/breeds/${breed.id}')" style="cursor:pointer;">
      <div class="card__image" style="background: linear-gradient(135deg, #FFB3C6, #C9A9E9); display:flex; align-items:center; justify-content:center; font-size:3rem;">🐕</div>
      <div class="card__body">
        <div class="card__title">${breed.name}</div>
        <div class="card__subtitle">
          <span class="badge badge-primary">${sizeMap[breed.size]}</span>
          <span class="badge badge-info" style="margin-left:4px;">운동량: ${exerciseMap[breed.exerciseLevel]}</span>
        </div>
        <div class="card__text" style="margin-top:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
          ${breed.personality}
        </div>
      </div>
    </div>
  `).join('');
}

function handleBreedSearch(keyword) {
  const filtered = BreedService.search(keyword);
  const list = document.getElementById('breed-list');
  if (list) list.innerHTML = renderBreedCards(filtered);
}

// --- 품종 상세 페이지 ---
function renderBreedDetailPage(params) {
  const breed = BreedService.getById(params.id);
  if (!breed) {
    renderPage(`
      <div class="not-found">
        <div class="nf-icon">🐾</div>
        <h2>품종을 찾을 수 없습니다</h2>
        <p>요청하신 품종 정보가 존재하지 않습니다.</p>
        <button class="btn btn-primary" onclick="Router.navigate('/breeds')">품종 목록으로</button>
      </div>
    `);
    return;
  }

  const sizeMap = { small: '소형', medium: '중형', large: '대형' };
  const exerciseMap = { low: '낮음 🟢', medium: '보통 🟡', high: '높음 🔴' };

  renderPage(`
    <button class="btn btn-secondary btn-sm" onclick="Router.navigate('/breeds')" style="margin-bottom:16px;">← 목록으로</button>
    <div class="detail-header">
      <div style="width:100%; height:260px; background: linear-gradient(135deg, #FFB3C6, #C9A9E9); border-radius: var(--radius-lg); display:flex; align-items:center; justify-content:center; font-size:5rem; margin-bottom:16px;">🐕</div>
      <h1>${breed.name}</h1>
      <div style="margin-top:8px;">
        <span class="badge badge-primary">${sizeMap[breed.size]}</span>
        <span class="badge badge-info" style="margin-left:4px;">운동량: ${exerciseMap[breed.exerciseLevel]}</span>
      </div>
    </div>
    <div class="detail-section">
      <h3>🐾 성격</h3>
      <p>${breed.personality}</p>
    </div>
    <div class="detail-section">
      <h3>⚠️ 주의사항</h3>
      <ul style="padding-left:20px;">
        ${breed.cautions.map(c => `<li style="margin-bottom:4px;">${c}</li>`).join('')}
      </ul>
    </div>
  `);
}

// --- 교육 콘텐츠 페이지 ---
function renderEducationPage() {
  const user = AuthService.getCurrentUser();
  const progress = user ? EducationService.getProgress(user.id) : { total: EDUCATION_DATA.length, completed: 0, ratio: 0, completedIds: [] };
  const pct = Math.round(progress.ratio * 100);

  renderPage(`
    <div class="page-header">
      <h1>📚 산책 교육</h1>
      <p>올바른 산책 방법을 함께 배워봐요~ 🐾</p>
    </div>
    <div class="progress-section" style="margin-bottom:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-weight:600; font-size:0.9rem;">학습 진행률</span>
        <span style="font-size:0.85rem; color:var(--color-text-light);">${progress.completed} / ${progress.total} 완료 (${pct}%)</span>
      </div>
      <div style="width:100%; height:12px; background:var(--color-border, #F5E6EA); border-radius:6px; overflow:hidden;">
        <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, var(--color-primary-light), var(--color-primary)); border-radius:6px; transition:width 0.3s;"></div>
      </div>
    </div>
    <div class="tabs">
      <button class="tab active" onclick="filterEducation('all', this)">전체</button>
      <button class="tab" onclick="filterEducation('posture', this)">🧍 자세</button>
      <button class="tab" onclick="filterEducation('leash', this)">🦮 리드줄</button>
      <button class="tab" onclick="filterEducation('safety', this)">🛡️ 안전</button>
    </div>
    <div class="grid-2" id="education-list">
      ${renderEducationCards(EducationService.getByCategory('all'), progress.completedIds)}
    </div>
  `);
}

function renderEducationCards(items, completedIds) {
  if (items.length === 0) {
    return `<div class="empty-state" style="grid-column:1/-1;">
      <div class="empty-icon">📭</div>
      <p>콘텐츠가 없습니다</p>
    </div>`;
  }
  completedIds = completedIds || [];
  const catMap = { posture: '🧍 자세', leash: '🦮 리드줄', safety: '🛡️ 안전' };
  return items.map(item => {
    const isCompleted = completedIds.includes(item.id);
    return `
    <div class="card" onclick="Router.navigate('/education/${item.id}')" style="cursor:pointer;${isCompleted ? ' border-left:3px solid var(--color-primary, #FF8FAB);' : ''}">
      <div class="card__body">
        <div class="card__subtitle">
          <span class="badge badge-primary">${catMap[item.category]}</span>
          ${isCompleted ? '<span class="badge" style="background:#d1fae5; color:#065f46; margin-left:4px;">✅ 완료</span>' : ''}
        </div>
        <div class="card__title" style="margin-top:8px;">${item.title}</div>
        <div class="card__text" style="margin-top:6px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
          ${item.body.substring(0, 80)}...
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function filterEducation(category, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const filtered = EducationService.getByCategory(category);
  const user = AuthService.getCurrentUser();
  const progress = user ? EducationService.getProgress(user.id) : { completedIds: [] };
  const list = document.getElementById('education-list');
  if (list) list.innerHTML = renderEducationCards(filtered, progress.completedIds);
}

// --- 교육 상세 페이지 ---
function renderEducationDetailPage(params) {
  const content = EducationService.getById(params.id);
  if (!content) {
    renderPage(`
      <div class="not-found">
        <div class="nf-icon">📭</div>
        <h2>콘텐츠를 찾을 수 없습니다</h2>
        <p>요청하신 교육 콘텐츠가 존재하지 않습니다.</p>
        <button class="btn btn-primary" onclick="Router.navigate('/education')">교육 목록으로</button>
      </div>
    `);
    return;
  }

  const catMap = { posture: '🧍 자세', leash: '🦮 리드줄', safety: '🛡️ 안전' };
  const user = AuthService.getCurrentUser();
  const progress = user ? EducationService.getProgress(user.id) : { completedIds: [] };
  const isCompleted = progress.completedIds.includes(content.id);

  let completeButtonHtml = '';
  if (user) {
    if (isCompleted) {
      completeButtonHtml = `
        <div style="margin-top:24px; padding:16px; background:#d1fae5; border-radius:var(--radius-md, 8px); text-align:center;">
          <span style="font-size:1.2rem;">✅</span>
          <span style="font-weight:600; color:#065f46; margin-left:8px;">이미 완료한 콘텐츠입니다</span>
        </div>`;
    } else {
      completeButtonHtml = `
        <div style="margin-top:24px; text-align:center;">
          <button class="btn btn-primary" id="complete-btn" onclick="handleCompleteEducation('${content.id}')" style="padding:12px 32px; font-size:1rem;">
            ✅ 완료
          </button>
        </div>`;
    }
  } else {
    completeButtonHtml = `
      <div style="margin-top:24px; padding:16px; background:var(--color-bg-secondary, #f9fafb); border-radius:var(--radius-md, 8px); text-align:center;">
        <p style="color:var(--color-text-light); margin:0;">학습 완료를 기록하려면 <a href="#/login" style="color:var(--color-primary, #FF8FAB); font-weight:700;">로그인</a>하세요.</p>
      </div>`;
  }

  renderPage(`
    <button class="btn btn-secondary btn-sm" onclick="Router.navigate('/education')" style="margin-bottom:16px;">← 목록으로</button>
    <div class="detail-header">
      <span class="badge badge-primary">${catMap[content.category]}</span>
      <h1 style="margin-top:8px;">${content.title}</h1>
    </div>
    <div class="detail-section">
      <div style="white-space:pre-line; line-height:1.8; font-size:0.95rem;">${content.body}</div>
    </div>
    ${completeButtonHtml}
  `);
}

/**
 * 교육 콘텐츠 완료 핸들러
 * @param {string} contentId - 콘텐츠 ID
 */
function handleCompleteEducation(contentId) {
  const user = AuthService.getCurrentUser();
  if (!user) {
    Router.navigate('/login');
    return;
  }

  EducationService.markComplete(user.id, contentId);

  // WalletService가 존재하면 5 Paw 코인 적립
  if (typeof WalletService !== 'undefined' && WalletService.earnCoins) {
    WalletService.earnCoins(user.id, 5, '교육 콘텐츠 완료');
  }

  // 상세 페이지 다시 렌더링하여 완료 상태 반영
  renderEducationDetailPage({ id: contentId });
}

// --- 커뮤니티 페이지 ---
function renderCommunityPage() {
  const user = AuthService.getCurrentUser();
  const posts = CommunityService.getFeed(1);

  let createFormHtml = '';
  if (user) {
    createFormHtml = `
      <div class="card" style="padding:16px; margin-bottom:20px;">
        <div style="display:flex; gap:10px; align-items:flex-start;">
          <div class="post-card__avatar">${user.name.charAt(0)}</div>
          <div style="flex:1;">
            <textarea id="new-post-text" class="form-input" placeholder="산책 이야기를 공유해보세요..." style="min-height:60px;"></textarea>
            <div id="post-create-error" style="margin-top:4px;"></div>
            <div style="text-align:right; margin-top:8px;">
              <button class="btn btn-primary btn-sm" onclick="handleCreatePost()">게시하기</button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    createFormHtml = `
      <div class="alert alert-error" style="margin-bottom:20px; text-align:center;">
        로그인이 필요합니다. <a href="#/login" style="font-weight:600;">로그인하기</a>
      </div>
    `;
  }

  renderPage(`
    <div class="page-header">
      <h1>💬 커뮤니티</h1>
      <p>반려인들과 우리 아이 이야기를 나눠봐요~ 🐶</p>
    </div>
    ${createFormHtml}
    <div id="community-feed">
      ${renderPostCards(posts, user)}
    </div>
  `);
}

/**
 * 게시물 카드 목록 렌더링
 * @param {Post[]} posts
 * @param {User|null} user
 * @returns {string}
 */
function renderPostCards(posts, user) {
  if (posts.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">💬</div>
        <p>아직 게시물이 없습니다. 첫 번째 게시물을 작성해보세요!</p>
      </div>
    `;
  }

  return posts.map(post => {
    const isLiked = user && post.likedBy.includes(user.id);
    const heartIcon = isLiked ? '❤️' : '🤍';
    const likedClass = isLiked ? ' liked' : '';
    const timeAgo = formatTimeAgo(post.createdAt);

    const commentsHtml = post.comments.length > 0
      ? `<div class="comment-list">
          ${post.comments.map(c => `
            <div class="comment-item">
              <div class="comment-item__avatar">${c.authorName.charAt(0)}</div>
              <div class="comment-item__content">
                <span class="comment-item__author">${c.authorName}</span>
                <div class="comment-item__text">${c.text}</div>
              </div>
            </div>
          `).join('')}
        </div>`
      : '';

    const commentFormHtml = user
      ? `<div class="comment-form">
          <input type="text" id="comment-input-${post.id}" placeholder="댓글을 입력하세요..." onkeydown="if(event.key==='Enter')handleAddComment('${post.id}')">
          <button onclick="handleAddComment('${post.id}')">게시</button>
        </div>`
      : '';

    return `
      <div class="post-card">
        <div class="post-card__header">
          <div class="post-card__avatar">${post.authorName.charAt(0)}</div>
          <div>
            <div class="post-card__author">${post.authorName}</div>
            <div class="post-card__time">${timeAgo}</div>
          </div>
        </div>
        <div class="post-card__body">${post.text}</div>
        <div class="post-card__actions">
          <button class="post-action-btn${likedClass}" onclick="handleToggleLike('${post.id}')">
            ${heartIcon} <span>${post.likes}</span>
          </button>
          <button class="post-action-btn">
            💬 <span>${post.comments.length}</span>
          </button>
        </div>
        ${commentsHtml}
        ${commentFormHtml}
      </div>
    `;
  }).join('');
}

/**
 * 시간 경과 포맷팅
 * @param {string} dateStr - ISO 날짜 문자열
 * @returns {string}
 */
function formatTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR');
}

/**
 * 게시물 작성 핸들러
 */
function handleCreatePost() {
  const user = AuthService.getCurrentUser();
  if (!user) {
    Router.navigate('/login');
    return;
  }

  const textEl = document.getElementById('new-post-text');
  const text = textEl ? textEl.value : '';
  const errEl = document.getElementById('post-create-error');

  try {
    CommunityService.createPost({
      authorId: user.id,
      authorName: user.name,
      text: text
    });
    renderCommunityPage();
  } catch (e) {
    if (errEl) errEl.innerHTML = `<div class="alert alert-error">${e.message}</div>`;
  }
}

/**
 * 좋아요 토글 핸들러
 * @param {string} postId
 */
function handleToggleLike(postId) {
  const user = AuthService.getCurrentUser();
  if (!user) {
    Router.navigate('/login');
    return;
  }

  try {
    CommunityService.toggleLike(postId, user.id);
    renderCommunityPage();
  } catch (e) {
    console.error('[Pawsitive] 좋아요 오류:', e.message);
  }
}

/**
 * 댓글 추가 핸들러
 * @param {string} postId
 */
function handleAddComment(postId) {
  const user = AuthService.getCurrentUser();
  if (!user) {
    Router.navigate('/login');
    return;
  }

  const inputEl = document.getElementById('comment-input-' + postId);
  const text = inputEl ? inputEl.value : '';

  try {
    CommunityService.addComment(postId, {
      authorId: user.id,
      authorName: user.name,
      text: text
    });
    renderCommunityPage();
  } catch (e) {
    console.error('[Pawsitive] 댓글 오류:', e.message);
  }
}

// --- 지갑 페이지 ---
function renderWalletPage() {
  const user = AuthService.getCurrentUser();

  if (!user) {
    renderPage(`
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-logo">🪙</div>
          <h2>로그인이 필요합니다</h2>
          <p style="text-align:center; color:var(--color-text-light); margin-bottom:20px;">Paw 지갑을 이용하려면 먼저 로그인하세요.</p>
          <button class="btn btn-primary" style="width:100%;" onclick="Router.navigate('/login')">로그인하기</button>
          <div class="auth-footer">
            계정이 없으신가요? <a href="#/register">회원가입</a>
          </div>
        </div>
      </div>
    `);
    return;
  }

  const balance = WalletService.getBalance(user.id);
  const transactions = WalletService.getTransactions(user.id);

  let transactionListHtml = '';
  if (transactions.length === 0) {
    transactionListHtml = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>거래 내역이 없습니다</p>
      </div>
    `;
  } else {
    transactionListHtml = `
      <div class="card">
        ${transactions.map(tx => {
          const isEarn = tx.type === 'earn';
          const sign = isEarn ? '+' : '-';
          const amountClass = isEarn ? 'earn' : 'spend';
          const date = new Date(tx.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric'
          });
          return `
            <div class="transaction-item">
              <div class="tx-info">
                <div class="tx-reason">${tx.reason}</div>
                <div class="tx-date">${date}</div>
              </div>
              <div class="tx-amount ${amountClass}">${sign}${tx.amount} PAW</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderPage(`
    <div class="page-header">
      <h1>🪙 Paw 지갑</h1>
      <p>활동으로 코인을 모으고 사용해봐요~ 💕</p>
    </div>
    <div class="wallet-balance">
      <div class="balance-label">보유 Paw 코인</div>
      <div class="balance-amount">${balance}</div>
      <div class="balance-unit">🐾 PAW</div>
    </div>
    <div class="page-header" style="margin-top:8px;">
      <h1 style="font-size:1.1rem;">📋 거래 내역</h1>
    </div>
    ${transactionListHtml}
  `);
}

// --- 매칭 페이지 ---
function renderMatchingPage() {
  const user = AuthService.getCurrentUser();

  if (!user) {
    renderPage(`
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-logo">🤝</div>
          <h2>로그인이 필요합니다</h2>
          <p style="text-align:center; color:var(--color-text-light); margin-bottom:20px;">산책 매칭을 이용하려면 먼저 로그인하세요.</p>
          <button class="btn btn-primary" style="width:100%;" onclick="Router.navigate('/login')">로그인하기</button>
          <div class="auth-footer">
            계정이 없으신가요? <a href="#/register">회원가입</a>
          </div>
        </div>
      </div>
    `);
    return;
  }

  const myProfile = MatchingService.getMyProfile(user.id);

  // 역할 미등록 → 역할 선택 화면
  if (!myProfile) {
    renderMatchingRoleSelect();
    return;
  }

  // 역할 등록 완료 → 매칭 대시보드
  renderMatchingDashboard(user, myProfile);
}

/**
 * 역할 선택 화면
 */
function renderMatchingRoleSelect() {
  renderPage(`
    <div class="page-header">
      <h1>🤝 산책 매칭</h1>
      <p>어떤 역할로 참여하고 싶으세요? 🐾</p>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
      <div class="card" style="padding:32px 20px; text-align:center; cursor:pointer; border:2px solid var(--color-border);" onclick="showMatchingRegisterForm('walker')" id="role-walker">
        <div style="font-size:3rem; margin-bottom:12px;">🚶‍♂️</div>
        <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:6px;">산책 도우미</h3>
        <p style="font-size:0.82rem; color:var(--color-text-light); font-weight:600;">다른 분의 반려견을<br>산책시켜 드려요</p>
      </div>
      <div class="card" style="padding:32px 20px; text-align:center; cursor:pointer; border:2px solid var(--color-border);" onclick="showMatchingRegisterForm('requester')" id="role-requester">
        <div style="font-size:3rem; margin-bottom:12px;">🐕</div>
        <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:6px;">산책 요청자</h3>
        <p style="font-size:0.82rem; color:var(--color-text-light); font-weight:600;">우리 아이 산책을<br>부탁하고 싶어요</p>
      </div>
    </div>

    <div id="matching-register-form"></div>
  `);
}

/**
 * 역할 등록 폼 표시
 */
function showMatchingRegisterForm(role) {
  const roleName = role === 'walker' ? '산책 도우미 🚶‍♂️' : '산책 요청자 🐕';
  const container = document.getElementById('matching-register-form');
  if (!container) return;

  // 선택된 카드 하이라이트
  const walkerCard = document.getElementById('role-walker');
  const requesterCard = document.getElementById('role-requester');
  if (walkerCard) walkerCard.style.borderColor = role === 'walker' ? 'var(--color-primary)' : 'var(--color-border)';
  if (requesterCard) requesterCard.style.borderColor = role === 'requester' ? 'var(--color-primary)' : 'var(--color-border)';

  container.innerHTML = `
    <div class="card" style="padding:24px;">
      <h3 style="margin-bottom:16px; font-weight:800;">${roleName} 등록</h3>
      <div id="matching-register-error"></div>
      <div class="form-group">
        <label for="match-location">활동 지역</label>
        <input type="text" id="match-location" class="form-input" placeholder="예: 서울 강남구">
      </div>
      <div class="form-group">
        <label for="match-time">선호 시간대</label>
        <select id="match-time" class="form-select">
          <option value="">선택해주세요</option>
          <option value="오전 (7-9시)">오전 (7-9시)</option>
          <option value="오전 (9-11시)">오전 (9-11시)</option>
          <option value="오후 (2-4시)">오후 (2-4시)</option>
          <option value="오후 (5-7시)">오후 (5-7시)</option>
          <option value="저녁 (7-9시)">저녁 (7-9시)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="match-message">소개 메시지</label>
        <textarea id="match-message" class="form-input" placeholder="간단한 자기소개를 적어주세요~"></textarea>
      </div>
      <button class="btn btn-primary" style="width:100%;" onclick="handleRegisterMatchProfile('${role}')">등록하기 🐾</button>
    </div>
  `;
}

/**
 * 매칭 프로필 등록 핸들러
 */
function handleRegisterMatchProfile(role) {
  const user = AuthService.getCurrentUser();
  if (!user) { Router.navigate('/login'); return; }

  const location = document.getElementById('match-location')?.value;
  const preferredTime = document.getElementById('match-time')?.value;
  const message = document.getElementById('match-message')?.value;
  const errEl = document.getElementById('matching-register-error');

  if (!location || !location.trim()) {
    if (errEl) errEl.innerHTML = '<div class="alert alert-error">활동 지역을 입력해주세요.</div>';
    return;
  }
  if (!preferredTime) {
    if (errEl) errEl.innerHTML = '<div class="alert alert-error">선호 시간대를 선택해주세요.</div>';
    return;
  }

  MatchingService.registerProfile(user.id, {
    role,
    location: location.trim(),
    preferredTime,
    message: message ? message.trim() : ''
  });

  renderMatchingPage();
}

/**
 * 매칭 대시보드 (역할 등록 완료 후)
 */
function renderMatchingDashboard(user, myProfile) {
  const recommendations = MatchingService.getRecommendations(user.id);
  const receivedRequests = MatchingService.getReceivedRequests(user.id);
  const scheduledWalks = MatchingService.getScheduledWalks(user.id);
  const completedWalks = MatchingService.getCompletedWalks(user.id);

  const sizeMap = { small: '소형견', medium: '중형견', large: '대형견' };
  const roleLabel = myProfile.role === 'walker' ? '🚶‍♂️ 산책 도우미' : '🐕 산책 요청자';
  const oppositeLabel = myProfile.role === 'walker' ? '산책 요청자' : '산책 도우미';

  // 내 프로필 카드
  const myProfileHtml = `
    <div class="card" style="padding:20px; margin-bottom:24px; border-color:var(--color-primary-pale);">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="match-card__avatar">${user.name.charAt(0)}</div>
          <div>
            <div style="font-weight:800; font-size:1rem;">${user.name}</div>
            <div style="font-size:0.82rem; color:var(--color-text-light); font-weight:600;">
              <span class="badge badge-primary">${roleLabel}</span>
              <span style="margin-left:6px;">📍 ${myProfile.location} · ⏰ ${myProfile.preferredTime}</span>
            </div>
            ${myProfile.message ? `<div style="font-size:0.82rem; color:var(--color-text-light); margin-top:4px;">"${myProfile.message}"</div>` : ''}
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="handleRemoveMatchProfile()">등록 해제</button>
      </div>
    </div>
  `;

  // 추천 프로필
  const recommendationsHtml = recommendations.length > 0
    ? recommendations.map(p => {
      const pRoleLabel = p.role === 'walker' ? '🚶‍♂️ 도우미' : '🐕 요청자';
      return `
      <div class="match-card" style="margin-bottom:12px;">
        <div class="match-card__avatar">${p.userName.charAt(0)}</div>
        <div class="match-card__info">
          <div class="match-card__name">${p.userName} <span class="badge badge-primary" style="font-size:0.7rem; margin-left:4px;">${pRoleLabel}</span></div>
          <div class="match-card__details">📍 ${p.location} · ⏰ ${p.preferredTime}</div>
          ${p.message ? `<div style="font-size:0.8rem; color:var(--color-text-light); margin-top:2px;">"${p.message}"</div>` : ''}
          <div class="match-card__rating">⭐ ${p.rating.toFixed(1)}</div>
        </div>
        <div class="match-card__actions">
          <button class="btn btn-primary btn-sm" onclick="handleSendMatchRequest('${p.userId}')">요청 보내기</button>
        </div>
      </div>
    `;}).join('')
    : `<div class="empty-state"><div class="empty-icon">🔍</div><p>아직 등록된 ${oppositeLabel}가 없어요~</p></div>`;

  // 받은 요청
  const receivedHtml = receivedRequests.length > 0
    ? receivedRequests.map(r => {
      const fromName = MatchingService.getUserName(r.fromUserId);
      return `
        <div class="match-card" style="margin-bottom:12px;">
          <div class="match-card__avatar">${fromName.charAt(0)}</div>
          <div class="match-card__info">
            <div class="match-card__name">${fromName}</div>
            <div class="match-card__details">산책 매칭 요청을 보냈어요</div>
          </div>
          <div class="match-card__actions">
            <button class="btn btn-primary btn-sm" onclick="handleAcceptRequest('${r.id}')">수락</button>
            <button class="btn btn-danger btn-sm" onclick="handleRejectRequest('${r.id}')">거절</button>
          </div>
        </div>
      `;
    }).join('')
    : `<div class="empty-state"><div class="empty-icon">📭</div><p>받은 요청이 없어요</p></div>`;

  // 예정된 산책
  const scheduledHtml = scheduledWalks.length > 0
    ? scheduledWalks.map(s => {
      const partnerId = s.participants.find(id => id !== user.id) || s.participants[0];
      const partnerName = MatchingService.getUserName(partnerId);
      const date = new Date(s.scheduledAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
      return `
        <div class="match-card" style="margin-bottom:12px;">
          <div class="match-card__avatar">${partnerName.charAt(0)}</div>
          <div class="match-card__info">
            <div class="match-card__name">${partnerName}</div>
            <div class="match-card__details">📅 ${date}</div>
            <div class="match-card__rating"><span class="badge badge-info">예정됨</span></div>
          </div>
          <div class="match-card__actions">
            <button class="btn btn-primary btn-sm" onclick="handleCompleteWalk('${s.id}')">산책 완료</button>
          </div>
        </div>
      `;
    }).join('')
    : `<div class="empty-state"><div class="empty-icon">🚶</div><p>예정된 산책이 없어요</p></div>`;

  // 완료된 산책
  const completedHtml = completedWalks.length > 0
    ? completedWalks.map(s => {
      const partnerId = s.participants.find(id => id !== user.id) || s.participants[0];
      const partnerName = MatchingService.getUserName(partnerId);
      const existingReviews = MatchingService.getReviewsForSchedule(s.id);
      const alreadyReviewed = existingReviews.some(r => r.reviewerId === user.id);
      const reviewBtn = alreadyReviewed
        ? `<span class="badge badge-success">리뷰 완료</span>`
        : `<button class="btn btn-secondary btn-sm" onclick="handleShowReviewForm('${s.id}', '${partnerId}')">리뷰 작성</button>`;
      return `
        <div class="match-card" style="margin-bottom:12px;">
          <div class="match-card__avatar">${partnerName.charAt(0)}</div>
          <div class="match-card__info">
            <div class="match-card__name">${partnerName}</div>
            <div class="match-card__rating"><span class="badge badge-success">완료됨</span></div>
          </div>
          <div class="match-card__actions">
            ${reviewBtn}
          </div>
        </div>
      `;
    }).join('')
    : `<div class="empty-state"><div class="empty-icon">✅</div><p>완료된 산책이 없어요</p></div>`;

  renderPage(`
    <div class="page-header">
      <h1>🤝 산책 매칭</h1>
      <p>가까운 산책 친구를 찾아봐요~ 🐾</p>
    </div>

    <div id="matching-alert"></div>

    ${myProfileHtml}

    <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:12px;">🐕 ${oppositeLabel} 목록</h3>
    <div id="matching-recommendations" style="margin-bottom:24px;">
      ${recommendationsHtml}
    </div>

    <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:12px;">📩 받은 요청</h3>
    <div id="matching-received" style="margin-bottom:24px;">
      ${receivedHtml}
    </div>

    <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:12px;">🚶 예정된 산책</h3>
    <div id="matching-scheduled" style="margin-bottom:24px;">
      ${scheduledHtml}
    </div>

    <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:12px;">✅ 완료된 산책</h3>
    <div id="matching-completed" style="margin-bottom:24px;">
      ${completedHtml}
    </div>

    <div id="review-form-container"></div>
  `);
}

/**
 * 매칭 프로필 등록 해제 핸들러
 */
function handleRemoveMatchProfile() {
  const user = AuthService.getCurrentUser();
  if (!user) return;

  const confirmed = confirm('매칭 등록을 해제하시겠어요?');
  if (!confirmed) return;

  MatchingService.removeProfile(user.id);
  renderMatchingPage();
}

/**
 * 매칭 요청 보내기 핸들러
 * @param {string} toUserId
 */
function handleSendMatchRequest(toUserId) {
  const user = AuthService.getCurrentUser();
  if (!user) { Router.navigate('/login'); return; }

  MatchingService.sendRequest(user.id, toUserId);
  const alertEl = document.getElementById('matching-alert');
  if (alertEl) {
    alertEl.innerHTML = '<div class="alert alert-success">매칭 요청을 보냈습니다! 🎉</div>';
    setTimeout(() => { alertEl.innerHTML = ''; }, 3000);
  }
}

/**
 * 매칭 요청 수락 핸들러
 * @param {string} requestId
 */
function handleAcceptRequest(requestId) {
  MatchingService.acceptRequest(requestId);
  renderMatchingPage();
}

/**
 * 매칭 요청 거절 핸들러
 * @param {string} requestId
 */
function handleRejectRequest(requestId) {
  MatchingService.rejectRequest(requestId);
  renderMatchingPage();
}

/**
 * 산책 완료 핸들러
 * @param {string} scheduleId
 */
function handleCompleteWalk(scheduleId) {
  MatchingService.completeWalk(scheduleId);
  renderMatchingPage();
  const alertEl = document.getElementById('matching-alert');
  if (alertEl) {
    alertEl.innerHTML = '<div class="alert alert-success">산책이 완료되었습니다! 🐾 10 Paw 코인이 적립되었습니다.</div>';
    setTimeout(() => { alertEl.innerHTML = ''; }, 4000);
  }
}

/**
 * 리뷰 작성 폼 표시
 * @param {string} scheduleId
 * @param {string} targetId
 */
function handleShowReviewForm(scheduleId, targetId) {
  const container = document.getElementById('review-form-container');
  if (!container) return;

  const targetName = MatchingService.getUserName(targetId);

  container.innerHTML = `
    <div class="card" style="padding:24px; margin-top:16px;">
      <h3 style="margin-bottom:16px;">📝 ${targetName}님에 대한 리뷰</h3>
      <div class="form-group">
        <label>평점</label>
        <div class="star-rating" id="review-stars">
          ${[1,2,3,4,5].map(n => `<span class="star" data-value="${n}" onclick="handleSelectStar(${n})">★</span>`).join('')}
        </div>
        <input type="hidden" id="review-rating" value="0">
      </div>
      <div class="form-group">
        <label for="review-text">후기</label>
        <textarea id="review-text" class="form-input" placeholder="산책 후기를 작성해주세요..."></textarea>
      </div>
      <div id="review-error"></div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-primary" onclick="handleSubmitReview('${scheduleId}', '${targetId}')">리뷰 등록</button>
        <button class="btn btn-secondary" onclick="document.getElementById('review-form-container').innerHTML=''">취소</button>
      </div>
    </div>
  `;
}

/**
 * 별점 선택 핸들러
 * @param {number} value
 */
function handleSelectStar(value) {
  const ratingInput = document.getElementById('review-rating');
  if (ratingInput) ratingInput.value = value;

  document.querySelectorAll('#review-stars .star').forEach(star => {
    const starVal = parseInt(star.getAttribute('data-value'));
    star.classList.toggle('filled', starVal <= value);
  });
}

/**
 * 리뷰 제출 핸들러
 * @param {string} scheduleId
 * @param {string} targetId
 */
function handleSubmitReview(scheduleId, targetId) {
  const user = AuthService.getCurrentUser();
  if (!user) { Router.navigate('/login'); return; }

  const rating = parseInt(document.getElementById('review-rating')?.value || '0');
  const text = document.getElementById('review-text')?.value || '';
  const errEl = document.getElementById('review-error');

  if (rating < 1 || rating > 5) {
    if (errEl) errEl.innerHTML = '<div class="alert alert-error">평점을 선택해주세요.</div>';
    return;
  }
  if (!text.trim()) {
    if (errEl) errEl.innerHTML = '<div class="alert alert-error">후기를 작성해주세요.</div>';
    return;
  }

  MatchingService.addReview(scheduleId, {
    reviewerId: user.id,
    targetId: targetId,
    rating: rating,
    text: text.trim()
  });

  renderMatchingPage();
  const alertEl = document.getElementById('matching-alert');
  if (alertEl) {
    alertEl.innerHTML = '<div class="alert alert-success">리뷰가 등록되었습니다! 감사합니다 🐾</div>';
    setTimeout(() => { alertEl.innerHTML = ''; }, 3000);
  }
}

// --- 프로필 페이지 (플레이스홀더) ---
function renderProfilePage() {
  const user = AuthService.getCurrentUser();
  if (!user) {
    renderPage(`
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-logo">👤</div>
          <h2>로그인이 필요합니다</h2>
          <p style="text-align:center; color:var(--color-text-light); margin-bottom:20px;">프로필을 보려면 먼저 로그인하세요.</p>
          <button class="btn btn-primary" style="width:100%;" onclick="Router.navigate('/login')">로그인하기</button>
          <div class="auth-footer">
            계정이 없으신가요? <a href="#/register">회원가입</a>
          </div>
        </div>
      </div>
    `);
    return;
  }

  const sizeMap = { small: '소형', medium: '중형', large: '대형' };

  renderPage(`
    <div class="page-header">
      <h1>👤 내 프로필</h1>
    </div>
    <div class="card" style="padding:24px; margin-bottom:16px;">
      <h3 style="margin-bottom:12px;">${user.name}</h3>
      <p style="color:var(--color-text-light); font-size:0.9rem;">📧 ${user.email}</p>
      <p style="color:var(--color-text-light); font-size:0.9rem; margin-top:4px;">🪙 ${user.pawCoins || 0} PAW</p>
      <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:8px;">가입일: ${new Date(user.createdAt).toLocaleDateString('ko-KR')}</p>
      <button class="btn btn-danger btn-sm" style="margin-top:16px;" onclick="handleLogout()">로그아웃</button>
      <button class="btn btn-sm" style="margin-top:8px; background:none; color:var(--color-text-muted); text-decoration:underline; font-size:0.8rem;" onclick="handleDeleteAccount()">회원탈퇴</button>
    </div>

    <div class="card" style="padding:24px; margin-bottom:16px;">
      <h3 style="margin-bottom:12px;">🐕 내 반려견</h3>
      ${user.dogs && user.dogs.length > 0
        ? user.dogs.map(d => `
          <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--color-border);">
            <div style="width:40px; height:40px; border-radius:50%; background:var(--color-primary-light); display:flex; align-items:center; justify-content:center; font-size:1.2rem;">🐕</div>
            <div>
              <div style="font-weight:600;">${d.name}</div>
              <div style="font-size:0.8rem; color:var(--color-text-light);">${d.breed} · ${d.age}살 · ${sizeMap[d.size] || d.size}</div>
            </div>
          </div>
        `).join('')
        : '<p style="color:var(--color-text-muted);">등록된 반려견이 없습니다.</p>'
      }
    </div>

    <div class="card" style="padding:24px;">
      <h3 style="margin-bottom:16px;">🐾 반려견 등록</h3>
      <div id="dog-register-error"></div>
      <div class="form-group">
        <label for="dog-name">이름</label>
        <input type="text" id="dog-name" class="form-input" placeholder="반려견 이름을 입력하세요">
      </div>
      <div class="form-group">
        <label for="dog-breed">품종</label>
        <select id="dog-breed" class="form-select">
          <option value="">품종을 선택하세요</option>
          ${typeof BREEDS_DATA !== 'undefined' ? BREEDS_DATA.map(b => `<option value="${b.name}">${b.name}</option>`).join('') : ''}
        </select>
      </div>
      <div class="form-group">
        <label for="dog-age">나이 (살)</label>
        <input type="number" id="dog-age" class="form-input" placeholder="나이를 입력하세요" min="0" max="30">
      </div>
      <div class="form-group">
        <label for="dog-size">크기</label>
        <select id="dog-size" class="form-select">
          <option value="">크기를 선택하세요</option>
          <option value="small">소형</option>
          <option value="medium">중형</option>
          <option value="large">대형</option>
        </select>
      </div>
      <button class="btn btn-primary" style="width:100%;" onclick="handleRegisterDog()">반려견 등록</button>
    </div>
  `);
}

/**
 * 반려견 등록 핸들러
 */
function handleRegisterDog() {
  const user = AuthService.getCurrentUser();
  if (!user) {
    Router.navigate('/login');
    return;
  }

  const name = document.getElementById('dog-name')?.value;
  const breed = document.getElementById('dog-breed')?.value;
  const age = document.getElementById('dog-age')?.value;
  const size = document.getElementById('dog-size')?.value;

  if (!name || !breed || !age || !size) {
    const errEl = document.getElementById('dog-register-error');
    if (errEl) errEl.innerHTML = '<div class="alert alert-error">모든 필드를 입력하세요.</div>';
    return;
  }

  const result = AuthService.registerDog(user.id, { name, breed, age: Number(age), size });
  if (result.success) {
    renderProfilePage();
  } else {
    const errEl = document.getElementById('dog-register-error');
    if (errEl) errEl.innerHTML = `<div class="alert alert-error">${result.error}</div>`;
  }
}

// --- 로그인 페이지 ---
function renderLoginPage() {
  renderPage(`
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">🐾</div>
        <h2>로그인</h2>
        <div id="login-error"></div>

        <!-- 소셜 로그인 버튼들 -->
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
          <button onclick="window.location.href='/auth/google?action=login'" style="width:100%; padding:12px 16px; border-radius:var(--radius-full); font-weight:700; font-size:0.9rem; display:flex; align-items:center; justify-content:center; gap:10px; background:#fff; border:2px solid #E5E7EB; color:#374151; cursor:pointer; transition:all 0.2s;">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width:20px; height:20px;"> 구글로 로그인
          </button>
          <button onclick="window.location.href='/auth/kakao?action=login'" style="width:100%; padding:12px 16px; border-radius:var(--radius-full); font-weight:700; font-size:0.9rem; display:flex; align-items:center; justify-content:center; gap:10px; background:#FEE500; border:none; color:#3C1E1E; cursor:pointer; transition:all 0.2s;">
            💬 카카오로 로그인
          </button>
          <button onclick="window.location.href='/auth/naver?action=login'" style="width:100%; padding:12px 16px; border-radius:var(--radius-full); font-weight:700; font-size:0.9rem; display:flex; align-items:center; justify-content:center; gap:10px; background:#03C75A; border:none; color:#fff; cursor:pointer; transition:all 0.2s;">
            <span style="font-weight:900; font-size:1rem;">N</span> 네이버로 로그인
          </button>
        </div>

        <!-- 구분선 -->
        <div style="display:flex; align-items:center; gap:12px; margin:20px 0;">
          <div style="flex:1; height:1px; background:var(--color-border);"></div>
          <span style="font-size:0.8rem; color:var(--color-text-muted); font-weight:600;">또는 이메일로 로그인</span>
          <div style="flex:1; height:1px; background:var(--color-border);"></div>
        </div>

        <!-- 이메일 로그인 -->
        <div class="form-group">
          <label for="login-email">이메일</label>
          <input type="email" id="login-email" class="form-input" placeholder="이메일을 입력하세요">
        </div>
        <div class="form-group">
          <label for="login-password">비밀번호</label>
          <input type="password" id="login-password" class="form-input" placeholder="비밀번호를 입력하세요">
        </div>
        <button class="btn btn-primary" style="width:100%;" onclick="handleLogin()">로그인</button>
        <div class="auth-footer">
          계정이 없으신가요? <a href="#/register">회원가입</a>
        </div>
      </div>
    </div>
  `);
}

// --- 회원가입 페이지 ---
function renderRegisterPage() {
  renderPage(`
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">🐾</div>
        <h2>회원가입</h2>
        <div id="register-error"></div>

        <!-- 소셜 가입 버튼들 -->
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
          <button onclick="window.location.href='/auth/google?action=register'" style="width:100%; padding:12px 16px; border-radius:var(--radius-full); font-weight:700; font-size:0.9rem; display:flex; align-items:center; justify-content:center; gap:10px; background:#fff; border:2px solid #E5E7EB; color:#374151; cursor:pointer; transition:all 0.2s;">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width:20px; height:20px;"> 구글로 가입하기
          </button>
          <button onclick="window.location.href='/auth/kakao?action=register'" style="width:100%; padding:12px 16px; border-radius:var(--radius-full); font-weight:700; font-size:0.9rem; display:flex; align-items:center; justify-content:center; gap:10px; background:#FEE500; border:none; color:#3C1E1E; cursor:pointer; transition:all 0.2s;">
            💬 카카오로 가입하기
          </button>
          <button onclick="window.location.href='/auth/naver?action=register'" style="width:100%; padding:12px 16px; border-radius:var(--radius-full); font-weight:700; font-size:0.9rem; display:flex; align-items:center; justify-content:center; gap:10px; background:#03C75A; border:none; color:#fff; cursor:pointer; transition:all 0.2s;">
            <span style="font-weight:900; font-size:1rem;">N</span> 네이버로 가입하기
          </button>
        </div>

        <!-- 구분선 -->
        <div style="display:flex; align-items:center; gap:12px; margin:20px 0;">
          <div style="flex:1; height:1px; background:var(--color-border);"></div>
          <span style="font-size:0.8rem; color:var(--color-text-muted); font-weight:600;">또는 이메일로 가입</span>
          <div style="flex:1; height:1px; background:var(--color-border);"></div>
        </div>

        <!-- 이메일 가입 (인증코드 방식) -->
        <div class="form-group">
          <label for="reg-name">이름</label>
          <input type="text" id="reg-name" class="form-input" placeholder="이름을 입력하세요">
        </div>
        <div class="form-group">
          <label for="reg-email">이메일</label>
          <div style="display:flex; gap:8px;">
            <input type="email" id="reg-email" class="form-input" placeholder="이메일을 입력하세요" style="flex:1;">
            <button class="btn btn-secondary btn-sm" id="send-code-btn" onclick="handleSendVerificationCode()" style="white-space:nowrap;">인증코드 발송</button>
          </div>
        </div>
        <div class="form-group" id="verify-code-group" style="display:none;">
          <label for="reg-code">인증코드</label>
          <div style="display:flex; gap:8px;">
            <input type="text" id="reg-code" class="form-input" placeholder="6자리 인증코드 입력" maxlength="6" style="flex:1; letter-spacing:4px; font-weight:700; text-align:center;">
            <button class="btn btn-primary btn-sm" onclick="handleVerifyCode()" style="white-space:nowrap;">확인</button>
          </div>
          <div id="verify-code-message" style="margin-top:6px;"></div>
        </div>
        <div class="form-group">
          <label for="reg-password">비밀번호</label>
          <input type="password" id="reg-password" class="form-input" placeholder="비밀번호를 입력하세요">
        </div>
        <input type="hidden" id="reg-email-verified" value="false">
        <button class="btn btn-primary" style="width:100%;" onclick="handleRegister()">가입하기</button>
        <div class="auth-footer">
          이미 계정이 있으신가요? <a href="#/login">로그인</a>
        </div>
      </div>
    </div>
  `);
}

// --- 로그인/회원가입 핸들러 ---

/**
 * 이메일 인증코드 발송
 */
async function handleSendVerificationCode() {
  const email = document.getElementById('reg-email')?.value;
  const errEl = document.getElementById('register-error');
  const btn = document.getElementById('send-code-btn');

  if (!email || !email.includes('@')) {
    if (errEl) errEl.innerHTML = '<div class="alert alert-error">올바른 이메일을 입력해주세요.</div>';
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = '발송 중...'; }

  try {
    const res = await fetch('/api/email/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (data.success) {
      // 인증코드 입력 필드 표시
      const codeGroup = document.getElementById('verify-code-group');
      if (codeGroup) codeGroup.style.display = 'block';

      const msgEl = document.getElementById('verify-code-message');
      if (data.testMode) {
        // SMTP 미설정 → 테스트 모드: 코드를 화면에 표시
        if (msgEl) msgEl.innerHTML = `<div class="alert alert-success">테스트 모드: 인증코드는 <strong>${data.testCode}</strong> 입니다</div>`;
      } else {
        if (msgEl) msgEl.innerHTML = '<div class="alert alert-success">인증코드가 이메일로 발송되었어요! 📧</div>';
      }

      if (btn) { btn.textContent = '재발송'; btn.disabled = false; }
    } else {
      if (errEl) errEl.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
      if (btn) { btn.textContent = '인증코드 발송'; btn.disabled = false; }
    }
  } catch (e) {
    if (errEl) errEl.innerHTML = '<div class="alert alert-error">서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.</div>';
    if (btn) { btn.textContent = '인증코드 발송'; btn.disabled = false; }
  }
}

/**
 * 인증코드 검증
 */
async function handleVerifyCode() {
  const email = document.getElementById('reg-email')?.value;
  const code = document.getElementById('reg-code')?.value;
  const msgEl = document.getElementById('verify-code-message');

  if (!code || code.length !== 6) {
    if (msgEl) msgEl.innerHTML = '<div class="alert alert-error">6자리 인증코드를 입력해주세요.</div>';
    return;
  }

  try {
    const res = await fetch('/api/email/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();

    if (data.success) {
      if (msgEl) msgEl.innerHTML = '<div class="alert alert-success">이메일 인증 완료! ✅</div>';
      const verifiedInput = document.getElementById('reg-email-verified');
      if (verifiedInput) verifiedInput.value = 'true';
      // 이메일 필드 비활성화
      const emailInput = document.getElementById('reg-email');
      if (emailInput) emailInput.readOnly = true;
    } else {
      if (msgEl) msgEl.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
    }
  } catch (e) {
    if (msgEl) msgEl.innerHTML = '<div class="alert alert-error">서버 연결에 실패했습니다.</div>';
  }
}

/**
 * 소셜 로그인 콜백 처리
 */
function handleSocialAuthCallback() {
  const hash = window.location.hash;
  if (!hash.includes('/auth-callback')) return;

  try {
    const queryStr = hash.split('?')[1];
    if (!queryStr) return;
    const params = new URLSearchParams(queryStr);
    const userParam = params.get('user');
    if (!userParam) return;
    const userData = JSON.parse(decodeURIComponent(userParam));

    if (userData && userData.provider) {
      const existingUsers = StorageService.get('users', []);
      const socialKey = userData.provider + '_' + userData.providerId;
      let user = existingUsers.find(u => u.socialKey === socialKey);
      const action = userData.action || StorageService.get('socialAction', 'login');
      StorageService.remove('socialAction');

      if (action === 'login') {
        // 로그인 모드: 가입된 계정만 로그인 허용
        if (!user) {
          alert('가입된 계정이 없어요. 회원가입을 먼저 해주세요! 🐾');
          // 서버 세션 끊기
          fetch('/auth/logout', { credentials: 'include' });
          Router.navigate('/register');
          return;
        }
      } else {
        // 회원가입 모드: 이미 가입된 계정이면 안내
        if (user) {
          alert('이미 가입된 계정이에요! 로그인 페이지로 이동할게요 🐾');
          fetch('/auth/logout', { credentials: 'include' });
          Router.navigate('/login');
          return;
        }
        // 신규 가입
        user = {
          id: StorageService.generateId(),
          email: userData.email || socialKey + '@social',
          name: userData.name || '소셜 사용자',
          passwordHash: '',
          socialKey: socialKey,
          provider: userData.provider,
          profileImage: userData.profileImage || '',
          dogs: [],
          pawCoins: 0,
          createdAt: StorageService.now()
        };
        existingUsers.push(user);
        StorageService.set('users', existingUsers);
      }

      // 로그인 처리
      const safeUser = { ...user };
      delete safeUser.passwordHash;
      StorageService.set('currentUser', safeUser);
      StorageService.set('authToken', {
        token: StorageService.generateId(),
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      updateNavAuth();
      Router.navigate('/');
    }
  } catch (e) {
    console.error('[Pawsitive] 소셜 로그인 콜백 처리 오류:', e);
    Router.navigate('/login');
  }
}

function handleLogin() {
  const email = document.getElementById('login-email')?.value;
  const password = document.getElementById('login-password')?.value;
  if (!email || !password) {
    const errEl = document.getElementById('login-error');
    if (errEl) errEl.innerHTML = '<div class="alert alert-error">이메일과 비밀번호를 입력하세요.</div>';
    return;
  }

  const result = AuthService.login(email, password);
  if (result.success) {
    updateNavAuth();
    Router.navigate('/');
  } else {
    const errEl = document.getElementById('login-error');
    if (errEl) errEl.innerHTML = `<div class="alert alert-error">${result.error}</div>`;
  }
}

function handleRegister() {
  const name = document.getElementById('reg-name')?.value;
  const email = document.getElementById('reg-email')?.value;
  const password = document.getElementById('reg-password')?.value;
  const emailVerified = document.getElementById('reg-email-verified')?.value;

  if (!name || !email || !password) {
    const errEl = document.getElementById('register-error');
    if (errEl) errEl.innerHTML = '<div class="alert alert-error">모든 필드를 입력하세요.</div>';
    return;
  }

  if (emailVerified !== 'true') {
    const errEl = document.getElementById('register-error');
    if (errEl) errEl.innerHTML = '<div class="alert alert-error">이메일 인증을 완료해주세요.</div>';
    return;
  }

  const result = AuthService.register({ name, email, password });
  if (result.success) {
    updateNavAuth();
    Router.navigate('/');
  } else {
    const errEl = document.getElementById('register-error');
    if (errEl) errEl.innerHTML = `<div class="alert alert-error">${result.error}</div>`;
  }
}

/**
 * 로그아웃 핸들러
 */
function handleLogout() {
  AuthService.logout();
  window.location.replace('/auth/logout');
}

/**
 * 회원탈퇴 핸들러
 */
function handleDeleteAccount() {
  const user = AuthService.getCurrentUser();
  if (!user) return;

  const pawCoins = user.pawCoins || 0;

  // 탈퇴 확인 모달 표시
  const overlay = document.createElement('div');
  overlay.id = 'delete-modal-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:24px;padding:32px;max-width:400px;width:90%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
      <div style="font-size:3rem;margin-bottom:12px;">😢</div>
      <h3 style="font-size:1.2rem;font-weight:900;margin-bottom:16px;color:#4A3728;">정말 탈퇴하시겠어요?</h3>
      <div style="background:#FFF0F0;border:2px solid #FFD4D4;border-radius:12px;padding:16px;margin-bottom:16px;text-align:left;">
        <p style="font-size:0.85rem;color:#D32F2F;font-weight:700;margin-bottom:8px;">⚠️ 탈퇴 시 아래 내용이 모두 삭제됩니다:</p>
        <ul style="font-size:0.82rem;color:#4A3728;padding-left:18px;line-height:1.8;">
          <li>보유 중인 <strong>${pawCoins} PAW 코인</strong></li>
          <li>등록된 반려견 정보</li>
          <li>커뮤니티 활동 내역</li>
          <li>산책 매칭 기록</li>
        </ul>
        <p style="font-size:0.8rem;color:#D32F2F;margin-top:8px;font-weight:600;">삭제된 데이터는 복구할 수 없습니다.</p>
      </div>
      <label style="display:flex;align-items:center;gap:8px;margin-bottom:20px;cursor:pointer;justify-content:center;">
        <input type="checkbox" id="delete-agree-check" style="width:18px;height:18px;cursor:pointer;">
        <span style="font-size:0.85rem;font-weight:700;color:#4A3728;">위 내용을 확인했으며 탈퇴에 동의합니다</span>
      </label>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button class="btn btn-secondary" onclick="document.getElementById('delete-modal-overlay').remove()">취소</button>
        <button class="btn btn-danger" id="delete-confirm-btn" onclick="executeDeleteAccount()" disabled style="opacity:0.5;">탈퇴하기</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // 체크박스 이벤트
  document.getElementById('delete-agree-check').addEventListener('change', function() {
    const btn = document.getElementById('delete-confirm-btn');
    btn.disabled = !this.checked;
    btn.style.opacity = this.checked ? '1' : '0.5';
  });
}

/**
 * 실제 탈퇴 실행
 */
async function executeDeleteAccount() {
  const user = AuthService.getCurrentUser();
  if (!user) return;

  // 모달 제거
  const overlay = document.getElementById('delete-modal-overlay');
  if (overlay) overlay.remove();

  // 카카오 사용자면 카카오 연결 끊기
  if (user.provider === 'kakao' && user.socialKey) {
    const kakaoId = user.socialKey.replace('kakao_', '');
    try {
      await fetch('/auth/kakao/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kakaoId })
      });
    } catch (e) {
      console.error('카카오 연결 끊기 실패:', e);
    }
  }

  // 사용자 데이터 삭제
  const users = StorageService.get('users', []);
  const filtered = users.filter(u => u.id !== user.id);
  StorageService.set('users', filtered);

  // 매칭 프로필 삭제
  if (typeof MatchingService !== 'undefined' && MatchingService.removeProfile) {
    MatchingService.removeProfile(user.id);
  }

  // 로컬 완전 로그아웃
  StorageService.remove('authToken');
  StorageService.remove('currentUser');

  // 서버 세션 완전 끊기
  window.location.replace('/auth/logout');
}

// --- 404 페이지 ---
function renderNotFoundPage() {
  renderPage(`
    <div class="not-found">
      <div class="nf-icon">🐾</div>
      <h2>페이지를 찾을 수 없습니다</h2>
      <p>요청하신 페이지가 존재하지 않습니다.</p>
      <button class="btn btn-primary" onclick="Router.navigate('/')">홈으로 돌아가기</button>
    </div>
  `);
}

// ============================================================
// 라우트 등록 및 앱 초기화
// ============================================================

function initApp() {
  // 네비게이션 바 렌더링
  renderNavbar();

  // 라우트 등록
  Router.register('/', renderHomePage);
  Router.register('/breeds', renderBreedListPage);
  Router.register('/breeds/:id', renderBreedDetailPage);
  Router.register('/education', renderEducationPage);
  Router.register('/education/:id', renderEducationDetailPage);
  Router.register('/community', renderCommunityPage);
  Router.register('/wallet', renderWalletPage);
  Router.register('/matching', renderMatchingPage);
  Router.register('/profile', renderProfilePage);
  Router.register('/login', renderLoginPage);
  Router.register('/register', renderRegisterPage);
  Router.register('/auth-callback', handleSocialAuthCallback);

  // 404 핸들러
  Router.setNotFound(renderNotFoundPage);

  // 라우터 시작
  Router.init();

  console.log('[Pawsitive] 앱이 초기화되었습니다. 🐾');
}

// DOM 로드 후 앱 초기화
document.addEventListener('DOMContentLoaded', initApp);
