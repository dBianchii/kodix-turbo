import careExpo_en from "../care-expo/en.json";
import careExpo_pt_BR from "../care-expo/pt-BR.json";
import validators_en from "../validators/en.json";
import validators_pt_BR from "../validators/pt-BR.json";

export const en = { ...careExpo_en, ...validators_en };
export const pt_BR = { ...careExpo_pt_BR, ...validators_pt_BR };
