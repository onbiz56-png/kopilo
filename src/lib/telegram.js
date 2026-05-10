// Получаем объект Telegram Web App
export function getTelegram() {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp || null
}

// Инициализация — вызываем один раз при загрузке
export function initTelegram() {
  const tg = getTelegram()
  if (!tg) {
    console.warn('⚠️ Telegram Web App not detected. Running in browser mode.')
    return null
  }

  tg.ready()
  tg.expand()

  // Тёмная тема приложения
  tg.setHeaderColor('#0A0A0A')
  tg.setBackgroundColor('#0A0A0A')

  console.log('✅ Telegram Web App initialized')
  console.log('User:', tg.initDataUnsafe?.user)

  return tg
}

// Получить данные пользователя
export function getTelegramUser() {
  const tg = getTelegram()
  return tg?.initDataUnsafe?.user || null
}

// Тактильный отклик (вибрация)
export function hapticFeedback(type = 'light') {
  const tg = getTelegram()
  if (!tg?.HapticFeedback) return

  if (type === 'light' || type === 'medium' || type === 'heavy') {
    tg.HapticFeedback.impactOccurred(type)
  } else if (type === 'success' || type === 'warning' || type === 'error') {
    tg.HapticFeedback.notificationOccurred(type)
  }
}

// Закрыть приложение
export function closeApp() {
  const tg = getTelegram()
  tg?.close()
}
