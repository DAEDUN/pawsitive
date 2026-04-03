/**
 * 소셜 로그인 라우트
 * 구글 / 카카오 / 네이버
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();

// 로그인 성공 후 프론트엔드로 리다이렉트하는 공통 핸들러 (개별 콜백에서 직접 처리)

// --- 구글 ---
router.get('/google',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.includes('여기에')) {
      return res.status(503).json({ error: '구글 로그인이 아직 설정되지 않았습니다.' });
    }
    req.session.socialAction = req.query.action || 'login';
    next();
  },
  (req, res, next) => {
    const opts = { scope: ['profile', 'email'] };
    if (req.session.socialAction === 'register') {
      opts.prompt = 'consent';
    }
    passport.authenticate('google', opts)(req, res, next);
  }
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/#/login?error=google' }),
  (req, res) => {
    const user = req.user;
    const action = req.session.socialAction || 'login';
    req.session.socialAction = null;
    const userData = encodeURIComponent(JSON.stringify({
      provider: user.provider,
      providerId: user.providerId,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      action: action
    }));
    res.redirect(`/#/auth-callback?user=${userData}`);
  }
);

// --- 카카오 ---
router.get('/kakao',
  (req, res, next) => {
    if (!process.env.KAKAO_CLIENT_ID || process.env.KAKAO_CLIENT_ID.includes('여기에')) {
      return res.status(503).json({ error: '카카오 로그인이 아직 설정되지 않았습니다.' });
    }
    // action 파라미터 저장 (login / register)
    req.session.socialAction = req.query.action || 'login';
    next();
  },
  (req, res, next) => {
    const opts = { scope: ['profile_nickname', 'profile_image'] };
    if (req.session.socialAction === 'register') {
      opts.prompt = 'login consent';
    } else {
      opts.prompt = 'login';
    }
    passport.authenticate('kakao', opts)(req, res, next);
  }
);

router.get('/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/#/login?error=kakao' }),
  (req, res) => {
    const user = req.user;
    const action = req.session.socialAction || 'login';
    req.session.socialAction = null;
    const userData = encodeURIComponent(JSON.stringify({
      provider: user.provider,
      providerId: user.providerId,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      action: action
    }));
    res.redirect(`/#/auth-callback?user=${userData}`);
  }
);

// --- 네이버 ---
router.get('/naver',
  (req, res, next) => {
    if (!process.env.NAVER_CLIENT_ID || process.env.NAVER_CLIENT_ID.includes('여기에')) {
      return res.status(503).json({ error: '네이버 로그인이 아직 설정되지 않았습니다.' });
    }
    req.session.socialAction = req.query.action || 'login';
    next();
  },
  passport.authenticate('naver')
);

router.get('/naver/callback',
  passport.authenticate('naver', { failureRedirect: '/#/login?error=naver' }),
  (req, res) => {
    const user = req.user;
    const action = req.session.socialAction || 'login';
    req.session.socialAction = null;
    const userData = encodeURIComponent(JSON.stringify({
      provider: user.provider,
      providerId: user.providerId,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      action: action
    }));
    res.redirect(`/#/auth-callback?user=${userData}`);
  }
);

// --- 현재 로그인 상태 확인 ---
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// --- 카카오 연결 끊기 (탈퇴 시) ---
router.post('/kakao/unlink', async (req, res) => {
  const { kakaoId } = req.body;
  if (!kakaoId || !process.env.KAKAO_ADMIN_KEY) {
    return res.json({ success: false });
  }

  try {
    const response = await fetch('https://kapi.kakao.com/v1/user/unlink', {
      method: 'POST',
      headers: {
        'Authorization': `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `target_id_type=user_id&target_id=${kakaoId}`
    });
    const data = await response.json();
    console.log('[카카오 연결 끊기]', data);
    res.json({ success: true });
  } catch (e) {
    console.error('[카카오 연결 끊기 실패]', e.message);
    res.json({ success: false });
  }
});

// --- 로그아웃 ---
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/#/');
    });
  });
});

module.exports = router;
