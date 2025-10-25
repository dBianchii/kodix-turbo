import { isValidPhoneNumber } from "libphonenumber-js";
import z from "zod";

const ALL_EQUAL_DIGITS_REGEX = /^(\d)\1+$/;
export const ZCpfSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ""))
  .refine((cpf) => {
    if (cpf.length !== 11) return false;
    if (ALL_EQUAL_DIGITS_REGEX.test(cpf)) return false;

    const cpfDigits = cpf.split("").map(Number);

    const calcCheckDigit = (length: number) => {
      const sum = cpfDigits
        .slice(0, length)
        .reduce((acc, digit, i) => acc + digit * (length + 1 - i), 0);
      const result = (sum * 10) % 11;
      return result === 10 ? 0 : result;
    };

    const digit1 = calcCheckDigit(9);
    const digit2 = calcCheckDigit(10);

    return digit1 === cpfDigits[9] && digit2 === cpfDigits[10];
  }, "CPF inválido");

export const ZPhoneSchema = z
  .string()
  .refine((phone) => isValidPhoneNumber(phone), "Telefone inválido");
