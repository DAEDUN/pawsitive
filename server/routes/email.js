/**
 * 이메일 인증코드 발송/검증 라우트
 */

const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// 인증코드 임시 저장소 (메모리)
// 실제 서비스에서는 Redis나 DB 사용 권장
const verificationCodes = new Map();

// 6자리 인증코드 생성
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// SMTP 설정 확인
function isEmailConfigured() {
  return process.env.SMTP_USER &&
         process.env.SMTP_PASS &&
         !process.env.SMTP_USER.includes('여기에') &&
         !process.env.SMTP_PASS.includes('여기에');
}

// Nodemailer 트랜스포터 생성
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * POST /api/email/send-code
 * 이메일로 인증코드 발송
 */
router.post('/send-code', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: '올바른 이메일을 입력해주세요.' });
  }

  // SMTP 미설정 시 테스트 모드
  if (!isEmailConfigured()) {
    const code = generateCode();
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5분
    });
    console.log(`📧 [테스트 모드] ${email} 인증코드: ${code}`);
    return res.json({
      success: true,
      testMode: true,
      testCode: code,
      message: 'SMTP 미설정 상태입니다. 테스트 코드가 반환됩니다.'
    });
  }

  // 실제 이메일 발송
  try {
    const code = generateCode();
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Pawsitive 🐾" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🐾 Pawsitive 이메일 인증코드',
      html: `
        <div style="font-family:'Nunito',sans-serif; max-width:480px; margin:0 auto; padding:32px; background:#FFF5F7; border-radius:24px;">
          <div style="text-align:center; margin-bottom:24px;">
            <span style="font-size:3rem;">🐾</span>
            <h1 style="color:#E56B8A; font-size:1.5rem; margin:8px 0;">Pawsitive</h1>
          </div>
          <div style="background:#fff; border-radius:16px; padding:24px; border:2px solid #FFD6E0; text-align:center;">
            <p style="color:#4A3728; font-size:1rem; margin-bottom:16px;">이메일 인증코드입니다</p>
            <div style="background:linear-gradient(135deg,#FFB3C6,#C9A9E9); color:#fff; font-size:2rem; font-weight:900; letter-spacing:8px; padding:16px 24px; border-radius:12px; display:inline-block;">
              ${code}
            </div>
            <p style="color:#8B7B6B; font-size:0.85rem; margin-top:16px;">5분 이내에 입력해주세요~</p>
          </div>
          <p style="text-align:center; color:#BBA99A; font-size:0.8rem; margin-top:16px;">본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
        </div>
      `
    });

    console.log(`📧 ${email}로 인증코드 발송 완료`);
    res.json({ success: true, message: '인증코드가 발송되었습니다.' });

  } catch (error) {
    console.error('📧 이메일 발송 실패:', error.message);
    res.status(500).json({ success: false, error: '이메일 발송에 실패했습니다.' });
  }
});

/**
 * POST /api/email/verify-code
 * 인증코드 검증
 */
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, error: '이메일과 인증코드를 입력해주세요.' });
  }

  const stored = verificationCodes.get(email);

  if (!stored) {
    return res.json({ success: false, error: '인증코드를 먼저 요청해주세요.' });
  }

  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return res.json({ success: false, error: '인증코드가 만료되었습니다. 다시 요청해주세요.' });
  }

  if (stored.code !== code) {
    return res.json({ success: false, error: '인증코드가 일치하지 않습니다.' });
  }

  // 인증 성공 → 코드 삭제
  verificationCodes.delete(email);
  res.json({ success: true, message: '이메일 인증이 완료되었습니다!' });
});

module.exports = router;
