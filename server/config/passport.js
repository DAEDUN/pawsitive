/**
 * Passport 소셜 로그인 전략 설정
 * 구글 / 카카오 / 네이버
 */

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const NaverStrategy = require('passport-naver-v2').Strategy;

module.exports = function(passport) {

  // --- 구글 ---
  if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes('여기에')) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback'
    }, (accessToken, refreshToken, profile, done) => {
      const user = {
        provider: 'google',
        providerId: profile.id,
        email: profile.emails?.[0]?.value || '',
        name: profile.displayName || '',
        profileImage: profile.photos?.[0]?.value || ''
      };
      return done(null, user);
    }));
  }

  // --- 카카오 ---
  if (process.env.KAKAO_CLIENT_ID && !process.env.KAKAO_CLIENT_ID.includes('여기에')) {
    passport.use(new KakaoStrategy({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
      callbackURL: '/auth/kakao/callback'
    }, (accessToken, refreshToken, profile, done) => {
      console.log('[카카오 로그인] profile:', JSON.stringify(profile, null, 2));
      const kakaoAccount = profile._json?.kakao_account || {};
      const properties = profile._json?.properties || {};
      const user = {
        provider: 'kakao',
        providerId: profile.id.toString(),
        email: kakaoAccount.email || '',
        name: properties.nickname || profile.displayName || profile.username || '카카오 사용자',
        profileImage: properties.profile_image || kakaoAccount.profile?.profile_image_url || ''
      };
      return done(null, user);
    }));
  }

  // --- 네이버 ---
  if (process.env.NAVER_CLIENT_ID && !process.env.NAVER_CLIENT_ID.includes('여기에')) {
    passport.use(new NaverStrategy({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: '/auth/naver/callback'
    }, (accessToken, refreshToken, profile, done) => {
      const user = {
        provider: 'naver',
        providerId: profile.id,
        email: profile.email || '',
        name: profile.name || profile.nickname || '',
        profileImage: profile.profileImage || ''
      };
      return done(null, user);
    }));
  }
};
