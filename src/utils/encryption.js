//src/utils/encryption.js
/**
 * github弱掃報告：Password from an access to password is hashed insecurely.
 * 因為只有用前端臨時資料加解密用，未用於密碼保存或驗證，故無需理會
 **/

import CryptoJS from "crypto-js";
const SECRET_KEY = CryptoJS.enc.Utf8.parse("1234567890123456");
const IV = CryptoJS.enc.Utf8.parse("1234567890123456");

export const encrypt = (data) => {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
};
export const decrypt = (ciphertext) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY, {
      iv: IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return null;
  }
};
