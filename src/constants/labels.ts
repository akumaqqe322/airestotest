export const ORDER_STATUS_LABELS: Record<string, string> = {
  New: 'Новый заказ',
  Bill: 'Счёт',
  Closed: 'Закрыт',
  Banquet: 'Банкет'
} as const;

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  'Живая очередь': 'Живая очередь',
  'Новая': 'Новая',
  'Заявка': 'Заявка',
  'Открыт': 'Открыт',
  'Закрыт': 'Закрыт'
} as const;

export const EVENT_TYPE_LABELS: Record<string, string> = {
  order: 'Заказ',
  reservation: 'Бронирование',
  banquet: 'Банкет',
  queue: 'Живая очередь'
} as const;

export const COMMON_LABELS = {
  search: 'Поиск по имени, столу или номеру...',
  loading: 'Загрузка конфигурации таймлайна...',
  error: 'Произошла ошибка',
  create: 'Создать',
  createWithConflict: 'Создать с конфликтом',
  cancel: 'Отмена',
  save: 'Сохранить изменения',
  delete: 'Удалить',
  name: 'Имя гостя',
  phone: 'Телефон',
  people: 'Гостей',
  table: 'Стол',
  zone: 'Зона',
  status: 'Статус',
  conflictWarning: 'Выбранное время пересекается с существующей бронью!'
} as const;
