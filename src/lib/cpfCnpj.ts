// Remove não dígitos
const d = (v: string) => v.replace(/\D+/g, '');

export function isValidCPF(value: string): boolean {
  const cpf = d(value);
  if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(cpf[10]);
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = d(value);
  if (!cnpj || cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (base: string, pos: number) => {
    let sum = 0;
    let weight = pos;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * weight--;
      if (weight < 2) weight = 9;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const dv1 = calc(cnpj.slice(0, 12), 5);
  const dv2 = calc(cnpj.slice(0, 13), 6);
  return dv1 === parseInt(cnpj[12]) && dv2 === parseInt(cnpj[13]);
}
