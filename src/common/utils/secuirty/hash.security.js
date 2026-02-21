import { hashSync, compareSync } from "bcrypt";
import { SALT_ROUNDS } from "../../../../config/config.service.js";

export const hashing = ({ plaintext, salt_rounds = SALT_ROUNDS } = {}) => {
  return hashSync(plaintext, salt_rounds);
};

export const compareHashing = ({ plaintext, cipherText } = {}) => {
  return compareSync(plaintext, cipherText);
};
