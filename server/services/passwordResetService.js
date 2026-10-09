import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { getDbPool, isDbConnected, memoryStore } from '../config/db.js';
import { parsePhoneVariants } from '../routes/auth.js';

// In-memory rate limiting tracker (maps key -> array of timestamps)
const rateLimitTracker = new Map();

// Cached nodemailer transporter
let cachedTransporter = null;

/**
 * Initialize password_resets table in MySQL if connected
 */
export async function initPasswordResetsTable() {
  if (isDbConnected()) {
    try {
      const pool = getDbPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          request_id VARCHAR(64) NOT NULL UNIQUE,
          user_id INT NULL,
          photographer_id VARCHAR(64) NULL,
          identifier VARCHAR(255) NOT NULL,
          target_type ENUM('EMAIL', 'PHONE') NOT NULL DEFAULT 'EMAIL',
          target_destination VARCHAR(255) NOT NULL,
          otp_hash VARCHAR(255) NOT NULL,
          attempts INT DEFAULT 0,
          max_attempts INT DEFAULT 5,
          status ENUM('PENDING', 'VERIFIED', 'COMPLETED', 'EXPIRED', 'FAILED') DEFAULT 'PENDING',
          reset_token VARCHAR(128) NULL UNIQUE,
          token_expires_at DATETIME NULL,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_reset_req (request_id),
          INDEX idx_reset_token (reset_token),
          INDEX idx_reset_identifier (identifier),
          INDEX idx_reset_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('✅ password_resets table ready in MySQL database.');
    } catch (err) {
      console.warn('⚠️ Could not initialize password_resets table in MySQL:', err.message);
    }
  }

  // Ensure memoryStore has passwordResets array
  if (!memoryStore.passwordResets) {
    memoryStore.passwordResets = [];
  }
}

// Auto-run table initialization
initPasswordResetsTable().catch(() => {});

/**
 * Rate limit check helper
 * @param {string} key
 * @param {number} maxRequests
 * @param {number} windowMs
 */
function checkRateLimit(key, maxRequests = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const timestamps = rateLimitTracker.get(key) || [];
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  if (validTimestamps.length >= maxRequests) {
    rateLimitTracker.set(key, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  rateLimitTracker.set(key, validTimestamps);
  return true;
}

/**
 * Get or create real email transporter
 */
async function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      }),
      from: process.env.SMTP_FROM || `"VibeNoww Creator Studio" <${user}>`,
      isConfigured: true,
      providerName: 'Custom SMTP'
    };
  }

  // If Ethereal test email is explicitly enabled or in automated test environment
  if (process.env.ENABLE_ETHEREAL_TEST_EMAIL === 'true' || process.env.TEST_MODE === 'true') {
    if (!cachedTransporter) {
      try {
        const testAccount = await nodemailer.createTestAccount();
        cachedTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        cachedTransporter._etherealUser = testAccount.user;
      } catch (err) {
        console.error('Failed to create Ethereal test account:', err.message);
        return { isConfigured: false, error: err.message };
      }
    }

    return {
      transporter: cachedTransporter,
      from: `"VibeNoww Creator Studio" <support@vibenoww.com>`,
      isConfigured: true,
      providerName: 'Ethereal Test SMTP'
    };
  }

  return {
    isConfigured: false,
    error: 'SMTP credentials missing. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env file.'
  };
}

/**
 * Generate a 6-digit cryptographically secure OTP
 */
function generateSecureOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

/**
 * Hash an OTP using SHA-256 for secure storage
 */
function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
}

/**
 * Step 1 & 2: Request Password Reset OTP
 */
export async function requestPasswordResetOtp({ identifier, ip = '127.0.0.1' }) {
  const cleanId = String(identifier || '').trim();
  if (!cleanId) {
    return {
      success: false,
      message: 'Please provide your registered email address or mobile number.'
    };
  }

  // Validate format (either email or 10-digit Indian phone)
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId);
  const digits = cleanId.replace(/[^0-9]/g, '');
  const isPhone = digits.length >= 10;

  if (!isEmail && !isPhone) {
    return {
      success: false,
      message: 'Please enter a valid email address or 10-digit mobile number.'
    };
  }

  // Rate limit by IP (max 10 requests per hour)
  if (!checkRateLimit(`ip_${ip}`, 10, 60 * 60 * 1000)) {
    return {
      success: false,
      rateLimited: true,
      message: 'Too many reset requests from this network. Please try again after 1 hour.'
    };
  }

  // Rate limit by identifier (max 5 requests per hour)
  if (!checkRateLimit(`id_${cleanId.toLowerCase()}`, 5, 60 * 60 * 1000)) {
    return {
      success: false,
      rateLimited: true,
      message: 'Too many reset requests for this account. Please try again after 1 hour.'
    };
  }

  // Find creator account
  const phoneVariants = parsePhoneVariants(cleanId);
  const idLower = cleanId.toLowerCase();
  const clean10 = digits.slice(-10);

  let targetCreator = null;
  let targetUser = null;

  if (isDbConnected()) {
    try {
      const pool = getDbPool();
      // Check photographers table
      const [photogs] = await pool.query(
        `SELECT * FROM photographers 
         WHERE phone IN (${phoneVariants.map(() => '?').join(',')}) 
            OR email = ? 
            OR id = ? 
         LIMIT 1`,
        [...phoneVariants, idLower, cleanId]
      );
      if (photogs.length > 0) {
        targetCreator = photogs[0];
      }

      // Check users table
      const [users] = await pool.query(
        `SELECT * FROM users 
         WHERE phone IN (${phoneVariants.map(() => '?').join(',')}) 
            OR email = ? 
         LIMIT 1`,
        [...phoneVariants, idLower]
      );
      if (users.length > 0) {
        targetUser = users[0];
      }
    } catch (err) {
      console.error('Database query error during forgot-password lookup:', err.message);
    }
  } else {
    // Memory storage check
    targetCreator = memoryStore.photographers.find(p => {
      const pClean = (p.phone || p.mobile || '').replace(/[^0-9]/g, '');
      return (
        (clean10 && pClean.includes(clean10)) ||
        phoneVariants.includes(p.phone) ||
        phoneVariants.includes(p.mobile) ||
        (p.email && p.email.toLowerCase() === idLower) ||
        (p.id && String(p.id).toLowerCase() === idLower)
      );
    });

    targetUser = memoryStore.users.find(u => {
      const uClean = (u.phone || '').replace(/[^0-9]/g, '');
      return (
        (clean10 && uClean.includes(clean10)) ||
        phoneVariants.includes(u.phone) ||
        (u.email && u.email.toLowerCase() === idLower)
      );
    });
  }

  // Account Eligibility Checks:
  // Must be an existing creator or photographer user
  const isEligible = Boolean(
    targetCreator || (targetUser && (targetUser.role === 'PHOTOGRAPHER' || targetUser.role === 'ADMIN'))
  );

  let approvalStatus = 'APPROVED';
  if (targetCreator) {
    approvalStatus = (targetCreator.approval_status || targetCreator.status || 'APPROVED').toUpperCase();
  } else if (targetUser) {
    approvalStatus = (targetUser.status || 'APPROVED').toUpperCase();
  }

  const isBlocked = ['REJECTED', 'DISABLED', 'SUSPENDED', 'PENDING'].includes(approvalStatus);

  // If account is not found or not eligible, return generic message (anti-enumeration)
  if (!isEligible || isBlocked) {
    // Safe server diagnostic log
    console.log(`[PasswordReset] Reset requested for identifier: "${cleanId.slice(0, 3)}***". Eligible: ${isEligible}, Status: ${approvalStatus}. Generic response returned.`);
    return {
      success: true,
      message: 'If an eligible account exists, an OTP will be sent to the registered contact method.',
      cooldownSeconds: 60,
      expiresInSeconds: 300
    };
  }

  // Check resend cooldown for this account
  const now = Date.now();
  const cooldownKey = `cooldown_${cleanId.toLowerCase()}`;
  const lastSent = rateLimitTracker.get(cooldownKey) || 0;
  if (now - lastSent < 60 * 1000) {
    const remainingCooldown = Math.ceil((60 * 1000 - (now - lastSent)) / 1000);
    return {
      success: false,
      cooldown: remainingCooldown,
      message: `Please wait ${remainingCooldown} seconds before requesting a new OTP.`
    };
  }

  // Determine delivery target email
  const destinationEmail = (targetCreator && targetCreator.email) || (targetUser && targetUser.email);
  if (!destinationEmail) {
    return {
      success: false,
      deliveryFailed: true,
      message: 'No registered email address found for this creator account. Please contact support.'
    };
  }

  // Check email delivery configuration
  const emailProvider = await getEmailTransporter();
  if (!emailProvider.isConfigured) {
    console.warn(`[PasswordReset] Email delivery provider not configured: ${emailProvider.error}`);
    return {
      success: false,
      deliveryFailed: true,
      message: 'Email delivery service is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in server environment variables.'
    };
  }

  // Generate cryptographically secure OTP & hash
  const rawOtp = generateSecureOtp();
  const otpHash = hashOtp(rawOtp);
  const requestId = `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Invalidate previous active OTPs for this account
  if (isDbConnected()) {
    try {
      const pool = getDbPool();
      await pool.query(
        `UPDATE password_resets SET status = 'EXPIRED' WHERE identifier = ? AND status = 'PENDING'`,
        [cleanId]
      );

      // Insert new password reset record
      await pool.query(
        `INSERT INTO password_resets (
          request_id, user_id, photographer_id, identifier, target_type,
          target_destination, otp_hash, attempts, max_attempts, status, expires_at
        ) VALUES (?, ?, ?, ?, 'EMAIL', ?, ?, 0, 5, 'PENDING', ?)`,
        [
          requestId,
          targetUser ? targetUser.id : null,
          targetCreator ? targetCreator.id : null,
          cleanId,
          destinationEmail,
          otpHash,
          expiresAt
        ]
      );
    } catch (err) {
      console.error('Error saving password reset record to database:', err.message);
      return {
        success: false,
        message: 'Database error creating reset request. Please try again later.'
      };
    }
  } else {
    // Memory store
    memoryStore.passwordResets = memoryStore.passwordResets || [];
    memoryStore.passwordResets.forEach(r => {
      if (r.identifier === cleanId && r.status === 'PENDING') {
        r.status = 'EXPIRED';
      }
    });

    memoryStore.passwordResets.push({
      id: memoryStore.passwordResets.length + 1,
      request_id: requestId,
      user_id: targetUser ? targetUser.id : null,
      photographer_id: targetCreator ? targetCreator.id : null,
      identifier: cleanId,
      target_type: 'EMAIL',
      target_destination: destinationEmail,
      otp_hash: otpHash,
      attempts: 0,
      max_attempts: 5,
      status: 'PENDING',
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    });
  }

  // Send real email via configured delivery provider
  const creatorName = (targetCreator && targetCreator.name) || (targetUser && targetUser.name) || 'Creator';
  
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background: #121212; border: 1px solid #2a2a2a; border-radius: 12px; color: #ffffff; padding: 36px 28px; box-shadow: 0 12px 40px rgba(0,0,0,0.6);">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #deab3a; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 6px 0;">VIBENOWW</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Creator Studio Security</p>
      </div>

      <div style="background: #1a1a1a; border: 1px solid #2d2d2d; border-radius: 10px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 17px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px;">Password Reset Verification Code</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Hello <strong>${creatorName}</strong>, we received a request to reset your password for the VibeNoww Creator Portal. Use the one-time verification code below to authorize your password reset:
        </p>

        <div style="background: rgba(222, 171, 58, 0.12); border: 2px dashed #deab3a; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-size: 34px; font-weight: 800; color: #f5c862; letter-spacing: 8px; font-family: monospace;">${rawOtp}</span>
        </div>

        <p style="color: #f87171; font-size: 13px; margin-bottom: 6px; font-weight: 600;">
          ⏱️ This OTP expires in exactly 5 minutes.
        </p>
        <p style="color: #94a3b8; font-size: 12.5px; line-height: 1.5; margin: 0;">
          Never share this code with anyone. VibeNoww staff will never ask for your verification code. If you did not request this reset, you can safely ignore this email.
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid #242424; padding-top: 20px; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 4px 0;">VibeNoww Creator Studio • Safe & Secure Creative Network</p>
        <p style="margin: 0;">This is an automated security transmission.</p>
      </div>
    </div>
  `;

  try {
    const info = await emailProvider.transporter.sendMail({
      from: emailProvider.from,
      to: destinationEmail,
      subject: 'VibeNoww Creator Studio — Password Reset OTP',
      text: `Hello ${creatorName},\n\nYour VibeNoww Creator Studio password reset OTP is: ${rawOtp}\n\nThis OTP expires in 5 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: htmlContent
    });

    console.log(`[PasswordReset] OTP successfully dispatched via ${emailProvider.providerName} to ${destinationEmail.slice(0, 3)}***.`);
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[PasswordReset] Ethereal preview URL: ${previewUrl}`);
      }
    }

    // Set cooldown timestamp
    rateLimitTracker.set(cooldownKey, now);

    return {
      success: true,
      message: 'If an eligible account exists, an OTP will be sent to your registered contact method.',
      requestId: requestId,
      cooldownSeconds: 60,
      expiresInSeconds: 300,
      deliveryMethod: 'EMAIL'
    };
  } catch (deliveryError) {
    console.error('[PasswordReset] Failed to deliver OTP email:', deliveryError.message);
    return {
      success: false,
      deliveryFailed: true,
      message: 'Failed to deliver OTP to the registered email address. Please check email delivery configuration.'
    };
  }
}

/**
 * Step 3: Verify OTP
 */
export async function verifyPasswordResetOtp({ identifier, requestId, otp }) {
  const cleanId = String(identifier || '').trim();
  const cleanReqId = String(requestId || '').trim();
  const cleanOtp = String(otp || '').trim();

  if (!cleanOtp) {
    return {
      success: false,
      message: 'Please enter the 6-digit OTP received.'
    };
  }

  let resetRecord = null;

  if (isDbConnected()) {
    try {
      const pool = getDbPool();
      let query = '';
      let params = [];

      if (cleanReqId) {
        query = 'SELECT * FROM password_resets WHERE request_id = ? LIMIT 1';
        params = [cleanReqId];
      } else if (cleanId) {
        query = 'SELECT * FROM password_resets WHERE identifier = ? AND status = "PENDING" ORDER BY id DESC LIMIT 1';
        params = [cleanId];
      }

      if (query) {
        const [rows] = await pool.query(query, params);
        if (rows.length > 0) resetRecord = rows[0];
      }
    } catch (err) {
      console.error('Database error fetching reset record:', err.message);
    }
  } else {
    // Memory store lookup
    const list = memoryStore.passwordResets || [];
    if (cleanReqId) {
      resetRecord = list.find(r => r.request_id === cleanReqId);
    } else if (cleanId) {
      resetRecord = [...list].reverse().find(r => r.identifier === cleanId && r.status === 'PENDING');
    }
  }

  if (!resetRecord) {
    return {
      success: false,
      message: 'Invalid or expired OTP session. Please request a new verification code.'
    };
  }

  if (resetRecord.status !== 'PENDING') {
    if (resetRecord.status === 'VERIFIED') {
      return {
        success: false,
        message: 'This OTP has already been verified. Please proceed to reset your password.'
      };
    }
    if (resetRecord.status === 'COMPLETED') {
      return {
        success: false,
        message: 'This OTP session has already been used to reset a password.'
      };
    }
    return {
      success: false,
      message: 'This OTP session is no longer active. Please request a new verification code.'
    };
  }

  // Check expiration
  const expiresTime = new Date(resetRecord.expires_at).getTime();
  if (Date.now() > expiresTime) {
    // Mark as expired
    if (isDbConnected()) {
      try {
        const pool = getDbPool();
        await pool.query('UPDATE password_resets SET status = "EXPIRED" WHERE id = ?', [resetRecord.id]);
      } catch {}
    } else {
      resetRecord.status = 'EXPIRED';
    }

    return {
      success: false,
      expired: true,
      message: 'This OTP has expired (5-minute limit). Please request a new code.'
    };
  }

  // Check attempt limit
  if (resetRecord.attempts >= resetRecord.max_attempts) {
    if (isDbConnected()) {
      try {
        const pool = getDbPool();
        await pool.query('UPDATE password_resets SET status = "FAILED" WHERE id = ?', [resetRecord.id]);
      } catch {}
    } else {
      resetRecord.status = 'FAILED';
    }

    return {
      success: false,
      maxAttemptsExceeded: true,
      message: 'Maximum verification attempts exceeded. Please request a new OTP.'
    };
  }

  // Increment attempt count
  const newAttempts = resetRecord.attempts + 1;
  if (isDbConnected()) {
    try {
      const pool = getDbPool();
      await pool.query('UPDATE password_resets SET attempts = ? WHERE id = ?', [newAttempts, resetRecord.id]);
    } catch {}
  } else {
    resetRecord.attempts = newAttempts;
  }

  // Compare OTP hash using constant-time comparison
  const candidateHash = hashOtp(cleanOtp);
  let isMatch = false;

  try {
    const bufA = Buffer.from(candidateHash, 'hex');
    const bufB = Buffer.from(resetRecord.otp_hash, 'hex');
    if (bufA.length === bufB.length) {
      isMatch = crypto.timingSafeEqual(bufA, bufB);
    }
  } catch {
    isMatch = (candidateHash === resetRecord.otp_hash);
  }

  if (!isMatch) {
    const remainingAttempts = Math.max(0, resetRecord.max_attempts - newAttempts);
    return {
      success: false,
      incorrectOtp: true,
      remainingAttempts,
      message: remainingAttempts > 0
        ? `Incorrect OTP. You have ${remainingAttempts} attempt(s) remaining.`
        : 'Maximum verification attempts reached. Please request a new OTP.'
    };
  }

  // OTP is verified! Generate single-use reset authorization token (15 min expiry)
  const resetToken = `rst_${crypto.randomBytes(32).toString('hex')}`;
  const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  if (isDbConnected()) {
    try {
      const pool = getDbPool();
      await pool.query(
        `UPDATE password_resets 
         SET status = 'VERIFIED', reset_token = ?, token_expires_at = ? 
         WHERE id = ?`,
        [resetToken, tokenExpiresAt, resetRecord.id]
      );
    } catch (err) {
      console.error('Error updating reset record with reset_token:', err.message);
      return {
        success: false,
        message: 'Database error finalizing verification.'
      };
    }
  } else {
    resetRecord.status = 'VERIFIED';
    resetRecord.reset_token = resetToken;
    resetRecord.token_expires_at = tokenExpiresAt.toISOString();
  }

  return {
    success: true,
    message: 'OTP verified successfully.',
    resetToken: resetToken,
    expiresInSeconds: 15 * 60
  };
}

/**
 * Step 4: Execute Password Reset
 */
export async function executePasswordReset({ resetToken, newPassword, confirmPassword }) {
  const cleanToken = String(resetToken || '').trim();
  const pass = String(newPassword || '').trim();
  const confirm = String(confirmPassword || '').trim();

  if (!cleanToken) {
    return {
      success: false,
      message: 'Missing reset authorization token. Please restart the password reset process.'
    };
  }

  if (!pass || !confirm) {
    return {
      success: false,
      message: 'Both password and confirmation fields are required.'
    };
  }

  if (pass !== confirm) {
    return {
      success: false,
      mismatch: true,
      message: 'Passwords do not match. Please ensure both fields are identical.'
    };
  }

  // Password strength validation: min 8 characters, at least 1 letter, at least 1 number
  if (pass.length < 8) {
    return {
      success: false,
      weakPassword: true,
      message: 'Password must be at least 8 characters long.'
    };
  }

  const hasLetter = /[a-zA-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  if (!hasLetter || !hasNumber) {
    return {
      success: false,
      weakPassword: true,
      message: 'Password must contain at least one letter and one number.'
    };
  }

  // Look up reset record by token
  let resetRecord = null;

  if (isDbConnected()) {
    try {
      const pool = getDbPool();
      const [rows] = await pool.query(
        'SELECT * FROM password_resets WHERE reset_token = ? LIMIT 1',
        [cleanToken]
      );
      if (rows.length > 0) resetRecord = rows[0];
    } catch (err) {
      console.error('Database error fetching reset token:', err.message);
    }
  } else {
    const list = memoryStore.passwordResets || [];
    resetRecord = list.find(r => r.reset_token === cleanToken);
  }

  if (!resetRecord) {
    return {
      success: false,
      message: 'Invalid or unrecognized reset authorization. Please restart the reset process.'
    };
  }

  if (resetRecord.status !== 'VERIFIED') {
    if (resetRecord.status === 'COMPLETED') {
      return {
        success: false,
        message: 'This reset authorization has already been used. Please log in with your updated password.'
      };
    }
    return {
      success: false,
      message: 'This reset authorization is not in a valid state. Please restart the reset process.'
    };
  }

  // Check token expiry
  const tokenExpiresTime = new Date(resetRecord.token_expires_at).getTime();
  if (Date.now() > tokenExpiresTime) {
    if (isDbConnected()) {
      try {
        const pool = getDbPool();
        await pool.query('UPDATE password_resets SET status = "EXPIRED" WHERE id = ?', [resetRecord.id]);
      } catch {}
    } else {
      resetRecord.status = 'EXPIRED';
    }

    return {
      success: false,
      expired: true,
      message: 'Your reset authorization has expired. Please restart the forgot password process.'
    };
  }

  // Hash new password using bcrypt
  const newPasswordHash = await bcrypt.hash(pass, 10);

  const userId = resetRecord.user_id;
  const photogId = resetRecord.photographer_id;
  const identifier = resetRecord.identifier;
  const phoneVariants = parsePhoneVariants(identifier);
  const idLower = identifier.toLowerCase();

  if (isDbConnected()) {
    try {
      const pool = getDbPool();

      // 1. Update users table
      if (userId) {
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);
      } else {
        await pool.query(
          `UPDATE users SET password_hash = ? 
           WHERE email = ? OR phone IN (${phoneVariants.map(() => '?').join(',')})`,
          [newPasswordHash, idLower, ...phoneVariants]
        );
      }

      // 2. Update photographers table (update password_hash, clear plaintext password)
      if (photogId) {
        await pool.query(
          `UPDATE photographers SET password_hash = ?, password = NULL WHERE id = ? OR user_id = ?`,
          [newPasswordHash, photogId, userId || 0]
        );
      } else {
        await pool.query(
          `UPDATE photographers SET password_hash = ?, password = NULL 
           WHERE email = ? OR phone IN (${phoneVariants.map(() => '?').join(',')})`,
          [newPasswordHash, idLower, ...phoneVariants]
        );
      }

      // 3. Invalidate reset token and mark record COMPLETED (single-use)
      await pool.query(
        `UPDATE password_resets SET status = 'COMPLETED', reset_token = NULL WHERE id = ?`,
        [resetRecord.id]
      );

      console.log(`[PasswordReset] Password reset completed successfully in database for account: ${identifier}`);
    } catch (err) {
      console.error('Error applying password reset in database:', err.message);
      return {
        success: false,
        message: 'Database error updating password. Please try again later.'
      };
    }
  }

  // Also update memoryStore to ensure instant sync across both storage backends
  if (memoryStore.users) {
    const user = memoryStore.users.find(u => 
      (userId && u.id === userId) ||
      (u.email && u.email.toLowerCase() === idLower) ||
      phoneVariants.includes(u.phone)
    );
    if (user) {
      user.password_hash = newPasswordHash;
      user.password = pass;
    }
  }

  if (memoryStore.photographers) {
    const photog = memoryStore.photographers.find(p => 
      (photogId && p.id === photogId) ||
      (p.email && p.email.toLowerCase() === idLower) ||
      phoneVariants.includes(p.phone) ||
      phoneVariants.includes(p.mobile)
    );
    if (photog) {
      photog.password_hash = newPasswordHash;
      photog.password = pass;
    }
  }

  resetRecord.status = 'COMPLETED';
  resetRecord.reset_token = null;

  return {
    success: true,
    message: 'Password reset successfully. You can now log in with your new password.',
    identifier: identifier
  };
}
