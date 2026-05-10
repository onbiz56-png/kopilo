import { useEffect, useState } from 'react'

function App() {
  const [tg, setTg] = useState(null)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const telegram = window.Telegram.WebApp
      telegram.ready()
      telegram.expand()
      setTg(telegram)
    }
  }, [])

  const userName = tg?.initDataUnsafe?.user?.first_name || 'друг'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-7xl mb-4">💰</div>

        <h1 className="text-5xl font-bold gold-shimmer">
          Kopilo
        </h1>

        <p className="text-xl text-gray-300">
          Привет, {userName}!
        </p>

        <p className="text-gray-400 leading-relaxed">
          Твоя AI-копилка скоро будет готова. 
          Сейчас идёт настройка приложения ✨
        </p>

        <div className="pt-8 space-y-3">
          <div className="bg-dark-card border border-gold/20 rounded-2xl p-4">
            <p className="text-sm text-gray-400">Версия</p>
            <p className="text-gold font-semibold">0.1.0 — Каркас готов</p>
          </div>

          <div className="bg-dark-card border border-gold/20 rounded-2xl p-4">
            <p className="text-sm text-gray-400">Статус</p>
            <p className="text-green-400 font-semibold">✅ Деплой работает</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 pt-8">
          Made with 💛 by Anya
        </p>
      </div>
    </div>
  )
}

export default App
