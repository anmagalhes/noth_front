// src/utils/notificacoes.ts

export const enviarNotificacao = (titulo: string, mensagem: string) => {
  if (!('Notification' in window)) {
    console.warn('Notificações não são suportadas neste navegador.');
    return;
  }

  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(titulo, { body: mensagem });
      } else {
        console.warn('Permissão para notificações negada');
      }
    });
  } else if (Notification.permission === 'granted') {
    new Notification(titulo, { body: mensagem });
  } else {
    console.warn('Permissão para notificações negada');
  }
};
