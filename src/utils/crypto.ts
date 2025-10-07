import CryptoJS from "crypto-js";

const SECRET_KEY = "client-side-key"; // for demo only

export const encryptData = (text: string) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptData = (cipher: string) => {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
