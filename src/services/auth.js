import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken'; // Şifre sıfırlama token'ı için eklendi
import { User } from '../db/models/User.js';
import { Session } from '../db/models/Session.js';
import { sendEmail } from './email.js'; // E-posta servisi için eklendi

export const registerUser = async (payload) => {
  const userExists = await User.findOne({ email: payload.email });
  if (userExists) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  const user = await User.create({
    ...payload,
    password: encryptedPassword,
  });

  // Şifreyi sunucu yanıtından çıkarmak için
  const userObj = user.toObject();
  delete userObj.password;

  return userObj;
};

export const loginUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const isPasswordEqual = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  // Kullanıcının varsa eski oturumunu temizliyoruz
  await Session.deleteOne({ userId: user._id });

  // Token'ları oluştur
  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  // Süreleri ayarla (Access: 15 dk, Refresh: 30 gün)
  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return session;
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  // Güvenlik için eski oturumu siliyoruz
  await Session.deleteOne({ _id: sessionId, refreshToken });

  // Yeni token'ları oluştur
  const newAccessToken = crypto.randomBytes(30).toString('base64');
  const newRefreshToken = crypto.randomBytes(30).toString('base64');

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Yeni oturumu kaydet
  const newSession = await Session.create({
    userId: session.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return newSession;
};

export const logoutUser = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};

// =========================================================
// ŞİFRE SIFIRLAMA İŞLEMLERİ
// =========================================================

export const sendResetEmail = async (email) => {
  // 1. Kullanıcıyı bul
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, "User not found!");
  }

  // 2. Sadece şifre sıfırlama için 15 dakikalık geçici bir token üret
  const resetToken = jwt.sign(
    { email: user.email, sub: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // 3. E-postanın içine koyacağımız linki oluştur
  const appDomain = process.env.APP_DOMAIN || 'http://localhost:3000';
  const resetLink = `${appDomain}/reset-password?token=${resetToken}`;

  // 4. E-postayı gönder
  const html = `
    <h1>Şifre Sıfırlama Talebi</h1>
    <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
    <a href="${resetLink}">Şifremi Sıfırla</a>
    <p>Bu bağlantının süresi 15 dakika içinde dolacaktır.</p>
  `;

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html: html,
  });
};

export const resetPassword = async (token, password) => {
  let decoded;

  // 1. Token geçerli mi ve süresi dolmuş mu kontrol et
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, "Token is invalid or expired.");
  }

  // 2. Token içindeki mail adresine ait kullanıcıyı bul
  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    throw createHttpError(404, "User not found!");
  }

  // 3. Yeni şifreyi güvenli bir şekilde şifrele (hash)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Veritabanında kullanıcının şifresini güncelle
  await User.findByIdAndUpdate(user._id, { password: hashedPassword });
};