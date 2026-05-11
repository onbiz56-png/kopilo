import { useState, useEffect } from 'react'
import { getTransactions, getBalance } from '../lib/supabase'
import AddTransaction from './AddTransaction'

export default function Home({ userId }) {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0 })
  const [monthStats, setMonthStats] = useState({ income: 0, expense: 0 })
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (userId) loadData()
  }, [userId])

  async function loadData() {
    setLoading(true)

    // Загружаем баланс
    const balanceData = await getBalance(userId)
    setStats(balanceData)

    // Загружаем транзакции
    const txData = await getTransactions(userId)
    setTransactions(txData)

    // Считаем статистику за текущий месяц
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    let monthIncome = 0
    let monthExpense = 0

    txData.forEach((t) => {
      const tDate = new Date(t.created_at)
      if (tDate >= startOfMonth) {
        if (t.type === 'income') {
          monthIncome += parseFloat(t.amount)
        } else {
          monthExpense += parseFloat(t.amount)
        }
      }
    })

    setMonthStats({ income: monthIncome, expense: monthExpense })
    setLoading(false)
  }

  function formatAmount(amount) {
    return new Intl.NumberFormat('ru-RU').format(Math.abs(amount))
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Сегодня'
    if (date.toDateString() === yesterday.toDateString()) return 'Вчера'

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold text-xl animate-pulse">💎 Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      {/* ЗАГОЛОВОК */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          Привет! 👋
        </h1>
        <p className="text-gray-400 text-sm">Твои финансы под контролем</p>
      </div>

      {/* КАРТОЧКА БАЛАНСА */}
      <div className="bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 rounded-3xl p-6 mb-4 backdrop-blur-lg">
        <p className="text-gray-400 text-sm mb-2">💰 Общий баланс</p>
        <p className={`text-4xl font-bold mb-1 ${
          stats.balance >= 0 ? 'text-gold' : 'text-red-400'
        }`}>
          {stats.balance >= 0 ? '' : '-'}{formatAmount(stats.balance)} ₽
        </p>
        <p className="text-xs text-gray-500">
          {stats.balance >= 0 ? '✨ Отличная работа!' : '⚠️ Контролируй расходы'}
        </p>
      </div>

      {/* СТАТИСТИКА МЕСЯЦА */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-dark-card border border-green-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📈</span>
            <span className="text-xs text-gray-400">Доходы</span>
          </div>
          <p className="text-lg font-bold text-green-400">
            +{formatAmount(monthStats.income)} ₽
          </p>
          <p className="text-[10px] text-gray-500 mt-1">в этом месяце</p>
        </div>

        <div className="bg-dark-card border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📉</span>
            <span className="text-xs text-gray-400">Расходы</span>
          </div>
          <p className="text-lg font-bold text-red-400">
            -{formatAmount(monthStats.expense)} ₽
          </p>
          <p className="text-[10px] text-gray-500 mt-1">в этом месяце</p>
        </div>
      </div>

      {/* КНОПКА ДОБАВИТЬ */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full bg-gradient-to-r from-gold to-yellow-500 text-dark-bg font-bold py-4 rounded-2xl mb-6 shadow-lg shadow-gold/20 active:scale-95 transition"
      >
        ➕ Добавить транзакцию
      </button>

      {/* ПОСЛЕДНИЕ ТРАНЗАКЦИИ */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">Последние операции</h2>
          {transactions.length > 0 && (
            <span className="text-xs text-gray-500">
              {transactions.length} всего
            </span>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="bg-dark-card border border-gold/10 rounded-2xl p-8 text-center">
            <p className="text-5xl mb-3">📝</p>
            <p className="text-white font-medium mb-1">Пока пусто</p>
            <p className="text-gray-500 text-sm">
              Добавь первую транзакцию!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="bg-dark-card border border-gold/10 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: t.categories?.color
                        ? `${t.categories.color}20`
                        : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    {t.categories?.icon || (t.type === 'income' ? '💰' : '💸')}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {t.categories?.name || 'Без категории'}
                    </p>
                    {t.description && (
                      <p className="text-[11px] text-gray-500 truncate max-w-[150px]">
                        {t.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDate(t.created_at)}
                    </p>
                  </div>
                </div>
                <p className={`font-bold text-sm ${
                  t.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)} ₽
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* МОДАЛКА ДОБАВЛЕНИЯ */}
      {showAddModal && (
        <AddTransaction
          userId={userId}
          onClose={() => setShowAddModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}
