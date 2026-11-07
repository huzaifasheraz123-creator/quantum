const mongoose = require('mongoose');
const RevokedToken = require('../models/RevokedToken');

const revokedTokens = new Map();

const isTokenRevoked = async (jti) => {
  if (!jti) return false;

  const expiresAt = revokedTokens.get(jti);
  if (expiresAt && expiresAt <= Date.now()) {
    revokedTokens.delete(jti);
  }
  if (expiresAt && expiresAt > Date.now()) return true;

  if (mongoose.connection.readyState === 1) {
    return Boolean(await RevokedToken.exists({ jti, expiresAt: { $gt: new Date() } }));
  }

  return false;
};

const revokeToken = async (jti, expiresAt) => {
  if (!jti || expiresAt <= Date.now()) return;

  if (mongoose.connection.readyState === 1) {
    await RevokedToken.updateOne(
      { jti },
      { $setOnInsert: { jti, expiresAt: new Date(expiresAt) } },
      { upsert: true }
    );
  }

  revokedTokens.set(jti, expiresAt);
};

module.exports = { isTokenRevoked, revokeToken };