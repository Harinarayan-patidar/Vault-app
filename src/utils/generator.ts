export function generatePassword(
  length: number,
  useUpper: boolean,
  useLower: boolean,
  useNumbers: boolean,
  useSymbols: boolean,
  excludeLookAlikes = true
) {
  let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lower = "abcdefghijklmnopqrstuvwxyz";
  let numbers = "0123456789";
  let symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

  if (excludeLookAlikes) {
    // remove O 0 l 1 I etc.
    upper = upper.replace(/[OI]/g, "");
    lower = lower.replace(/[ol]/g, "");
    numbers = numbers.replace(/[01]/g, "");
  }

  let chars = "";
  if (useUpper) chars += upper;
  if (useLower) chars += lower;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;

  if (!chars.length) return "";

  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}
