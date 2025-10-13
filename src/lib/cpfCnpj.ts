// src/lib/cpfCnpj.ts
// Remove não-dígitos
const d = (v: string) => (v ?? '').replace(/\D+/g, '');

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

  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];

  const calc = (base: string, weights: number[]) => {
    const s = base.split('').reduce((acc, cur, i) => acc + parseInt(cur) * weights[i], 0);
    const r = s % 11;
    return (r < 2) ? '0' : String(11 - r);
  };

  const dv1 = calc(cnpj.slice(0, 12), w1);
  const dv2 = calc(cnpj.slice(0, 12) + dv1, w2);

  return cnpj.slice(-2) === dv1 + dv2;
}
