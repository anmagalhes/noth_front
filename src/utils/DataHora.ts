// utils/dataHora.ts
import moment from 'moment-timezone';

export const getDataHoraSaoPaulo = () => {
  const agora = moment().tz('America/Sao_Paulo');

  return {
    data: agora.format('DD/MM/YYYY'),
    hora: agora.format('HH:mm'),
    iso: agora.toISOString(), // se precisar ISO também
    raw: agora, // moment object completo se quiser manipular
  };
};
