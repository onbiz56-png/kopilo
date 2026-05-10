import { useState, useEffect } from 'react'
import { initTelegramApp, getTelegramUser } from './lib/telegram'
import { upsertUser } from './lib/supabase'
import Home from './components/Home'
import Analytics from './components/Analytics'
import Profile from './components/Profile'
import Goals from './components/Goals'
import Budgets from './components/Budgets'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    initApp()
  }, [])

  async function initApp() {
    initTelegramApp()
    const tgUser = getTelegramUser()

    if (tgUser) {
      const dbUser = await upsertUser(tgUser)
      setUser(dbUser)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold text-2xl animate-pulse">💎 Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <p className="text-white">Открой приложение через Telegram</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* КОНТЕНТ */}
      {activeTab === 'home' && <Home userId={user.id} />}
      {activeTab === 'analytics' && <Analytics userId={user.id} />}
      {activeTab === 'goals' && <Goals userId={user.id} />}
      {activeTab === 'budgets' && <Budgets userId={user.id} />}
      {activeTab === 'profile' && <Profile user={user} />}

      {/* НИЖНЕЕ МЕНЮ */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-gold/20 backdrop-blur-lg z-40">
        <div className="flex justify-around items-center py-2 px-2 max-w-md mx-auto">
          <TabButton
            icon="🏠"
            label="Главная"
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          <TabButton
            icon="📊"
            label="Аналитика"
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
          <TabButton
            icon="🎯"
            label="Цели"
            active={activeTab === 'goals'}
            onClick={() => setActiveTab('goals')}
          />
          <TabButton
            icon="💰"
            label="Бюджет"
            active={activeTab === 'budgets'}
            onClick={() => setActiveTab('budgets')}
          />
          <TabButton
            icon="👤"
            label="Профиль"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
        </div>
      </div>
    </div>
  )
}

function TabButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition flex-1 ${
        active ? 'bg-gold/10' : ''
      }`}
    >
      <span className={`text-xl ${active ? 'scale-110' : ''} transition`}>{icon}</span>
      <span className={`text-[10px] font-medium ${active ? 'text-gold' : 'text-gray-500'}`}>
        {label}
      </span>
    </button>
  )
}

export default App
