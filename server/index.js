/**
 * Pawsitive 백엔드 서버
 * 소셜 로그인 (구글/카카오/네이버) + 이메일 인증
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 미들웨어 ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'pawsitive-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 개발환경에서는 false
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Passport 직렬화 ---
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// --- Passport 전략 설정 ---
require('./config/passport')(passport);

// --- 라우트 ---
app.use('/auth', authRoutes);
app.use('/api/email', emailRoutes);

// --- 정적 파일 (프론트엔드) ---
app.use(express.static(path.join(__dirname, '..')));

// 모든 경로를 index.html로 (SPA)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// --- 서버 시작 ---
app.listen(PORT, () => {
  console.log(`🐾 Pawsitive 서버가 http://localhost:${PORT} 에서 실행 중!`);
  console.log('');
  console.log('📋 설정 상태:');
  console.log(`   구글 로그인: ${process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes('여기에') ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`   카카오 로그인: ${process.env.KAKAO_CLIENT_ID && !process.env.KAKAO_CLIENT_ID.includes('여기에') ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`   네이버 로그인: ${process.env.NAVER_CLIENT_ID && !process.env.NAVER_CLIENT_ID.includes('여기에') ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`   이메일 인증: ${process.env.SMTP_USER && !process.env.SMTP_USER.includes('여기에') ? '✅ 설정됨' : '❌ 미설정'}`);
});
