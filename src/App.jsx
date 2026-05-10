import { useEffect, useState } from 'react'
import { initTelegram, getTelegramUser } from './lib/telegram'
import { getOrCreateUser } from './lib/supabase'

function App() {
  const [user, setUser] = useState(null)
  const [tgUser, setTgUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function init() {
      try {
        // 1. Инициализируем Telegram
        const tg = initTelegram()

        // 2. Получаем данные пользователя из Telegram
        const telegramUser = getTelegramUser()
        setTgUser(telegramUser)

        if (!telegramUser) {
          setError('Откройте приложение через Telegram')
          setLoading(false)
          return
        }

        // 3. Создаём или находим пользователя в БД
        const dbUser = await getOrCreateUser(telegramUser)

        if (!dbUser) {
          setError('Ошибка подключения к базе данных')
          setLoading(false)
          return
        }

        setUser(dbUser)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('Что-то пошло не так')
        setLoading(false)
      }
    }

    init()
  }, [])

  // Загрузка
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">💰</div>
          <p className="text-gold">Загрузка Kopilo...</p>
        </div>
      </div>
    )
  }

  // Ошибка
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400">Упс!</h2>
          <p className="text-gray-400">{error}</p>
          <p className="text-xs text-gray-600 pt-4">
            Если приложение запущено в браузере — это нормально. 
            Откройте его через Telegram-бота.
          </p>
        </div>
      </div>
    )
  }

  // Успех — пользователь в БД
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="text-7xl mb-4">💰</div>

        <h1 className="text-5xl font-bold gold-shimmer">
          Kopilo
        </h1>

        <p className="text-2xl text-white">
          Привет, {user?.first_name || 'друг'}! 👋
        </p>

        <div className="space-y-3 pt-4">
          <div className="bg-dark-card border border-gold/20 rounded-2xl p-4">
            <p className="text-sm text-gray-400">Telegram ID</p>
            <p className="text-gold font-mono">{user?.telegram_id}</p>
          </div>

          <div className="bg-dark-card border border-gold/20 rounded-2xl p-4">
            <p className="text-sm text-gray-400">Username</p>
            <p className="text-gold">@{user?.username || 'не указан'}</p>
          </div>

          <div className="bg-dark-card border border-green-500/30 rounded-2xl p-4">
            <p className="text-sm text-gray-400">Статус</p>
            <p className="text-green-400 font-semibold">
              ✅ Подключено к Supabase
            </p>
          </div>

          <div className="bg-dark-card border border-gold/20 rounded-2xl p-4">
            <p className="text-sm text-gray-400">Версия</p>
            <p className="text-gold font-semibold">0.2.0 — Auth работает</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 pt-8">
          🚀 Скоро здесь появятся транзакции, аналитика и AI-советы
        </p>
      </div>
    </div>
  )
}

export default App
