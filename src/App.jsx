import { useEffect, useState } from 'react'
import { initTelegram, getTelegramUser } from './lib/telegram'
import { getOrCreateUser, getBalance, getTransactions } from './lib/supabase'
import AddTransaction from './components/AddTransaction'

function App() {
  const [user, setUser] = useState(null)
  const [tgUser, setTgUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [balance, setBalance] = useState({ income: 0, expense: 0, balance: 0 })
  const [transactions, setTransactions] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        initTelegram()
        const telegramUser = getTelegramUser()
        setTgUser(telegramUser)

        if (!telegramUser) {
          setError('Откройте приложение через Telegram')
          setLoading(false)
          return
        }

        const dbUser = await getOrCreateUser(telegramUser)

        if (!dbUser) {
          setError('Ошибка подключения к базе данных')
          setLoading(false)
          return
        }

        setUser(dbUser)
        await loadData(dbUser.id)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('Что-то пошло не так')
        setLoading(false)
      }
    }
    init()
  }, [])

  async function loadData(userId) {
    const [balanceData, transactionsData] = await Promise.all([
      getBalance(userId),
      getTransactions(userId),
    ])
    setBalance(balanceData)
    setTransactions(transactionsData)
  }

  async function handleTransactionAdded() {
    if (user) {
      await loadData(user.id)
    }
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU').format(amount)
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня, ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера, ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

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

  return (
    <div className="min-h-screen pb-32">

      <div className="px-6 pt-8 pb-4">
        <p className="text-gray-400 text-sm">Привет, {user.first_name || 'друг'} 👋</p>
        <h1 className="text-2xl font-bold gold-shimmer">Kopilo</h1>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-dark-card border border-gold/30 rounded-3xl p-6 space-y-4">
          <p className="text-sm text-gray-400">Баланс</p>
          <p className={`text-5xl font-bold ${balance.balance >= 0 ? 'text-gold' : 'text-red-400'}`}>
            {formatMoney(balance.balance)} ₽
          </p>

          <div className="flex gap-3 pt-2">
            <div className="flex-1 bg-green-500/10 border border-green-500/30 rounded-2xl p-3">
              <p className="text-xs text-gray-400">Доходы</p>
              <p className="text-lg font-semibold text-green-400">
                +{formatMoney(balance.income)} ₽
              </p>
            </div>
            <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded-2xl p-3">
              <p className="text-xs text-gray-400">Расходы</p>
              <p className="text-lg font-semibold text-red-400">
                -{formatMoney(balance.expense)} ₽
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-3">
        <h2 className="text-lg font-semibold text-white px-2">История</h2>

        {transactions.length === 0 ? (
          <div className="bg-dark-card border border-gold/10 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-gray-400">Пока нет транзакций</p>
            <p className="text-xs text-gray-600 mt-1">Нажми ➕ чтобы добавить первую</p>
          </div>
        ) : (
          transactions.map((t) => (
            <div
              key={t.id}
              className="bg-dark-card border border-gold/10 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="text-3xl">{t.categories?.icon || '💰'}</div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">
                  {t.categories?.name || 'Без категории'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {t.description || formatDate(t.created_at)}
                </p>
              </div>

              <div className={`font-bold whitespace-nowrap ${
                t.type === 'income' ? 'text-green-400' : 'text-red-400'
              }`}>
                {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)} ₽
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gold text-black text-4xl font-bold shadow-2xl shadow-gold/40 flex items-center justify-center hover:scale-110 transition active:scale-95"
      >
        +
      </button>

      {showAddModal && (
        <AddTransaction
          userId={user.id}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleTransactionAdded}
        />
      )}
    </div>
  )
}

export default App
