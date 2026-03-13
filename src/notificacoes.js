import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const pedirPermissao = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const agendarLembrete = async (titulo, corpo, hora, minuto) => {
  const permissao = await pedirPermissao();
  if (!permissao) return false;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: corpo,
      sound: true,
    },
    trigger: {
      hour: hora,
      minute: minuto,
      repeats: true,
    },
  });

  // Salvar lembretes
  const raw = await SecureStore.getItemAsync('lembretes');
  const lembretes = raw ? JSON.parse(raw) : [];
  lembretes.push({ id, titulo, corpo, hora, minuto });
  await SecureStore.setItemAsync('lembretes', JSON.stringify(lembretes));
  return id;
};

export const cancelarLembrete = async (id) => {
  await Notifications.cancelScheduledNotificationAsync(id);
  const raw = await SecureStore.getItemAsync('lembretes');
  const lembretes = raw ? JSON.parse(raw) : [];
  const novos = lembretes.filter(l => l.id !== id);
  await SecureStore.setItemAsync('lembretes', JSON.stringify(novos));
};

export const getLembretes = async () => {
  const raw = await SecureStore.getItemAsync('lembretes');
  return raw ? JSON.parse(raw) : [];
};

export const cancelarTodos = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await SecureStore.deleteItemAsync('lembretes');
};