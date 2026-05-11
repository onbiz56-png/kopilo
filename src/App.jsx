import { useState, useEffect } from 'react'
import { initTelegramApp, getTelegramUser } from './lib/telegram'
import { getOrCreateUser } from './lib/supabase'
import Home from './components/Home'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        // Инициализация Telegram WebApp
        initTelegramApp()

        // Получаем юзера из Telegram
        const tgUser = getTelegramUser()

        if (tgUser) {
          // Создаём или получаем пользователя в БД
          const dbUser = await getOrCreateUser(tgUser)
          setUser(dbUser)
        } else {
          console.warn('No Telegram user found')
        }
      } catch (err) {
        console.error('Error initializing app:', err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '20px'
      }}>
        Загрузка... ⏳
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        padding: '20px',
        textAlign: 'center'
      }}>
        ⚠️ Откройте приложение через Telegram бота
      </div>
    )
  }

  return <Home user={user} />
}

export default App
