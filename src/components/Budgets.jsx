import { useState, useEffect } from 'react'
import { 
  getBudgets, 
  createBudget, 
  deleteBudget, 
  getBudgetSpending,
  getCategories 
} from '../lib/supabase'

function Budgets({ userId }) {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [spending, setSpending] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [budgetsData, categoriesData] = await Promise.all([
      getBudgets(userId),
      getCategories(),
    ])

    setBudgets(budgetsData)
    setCategories(categoriesData.filter(c => c.type === 'expense'))

    const spendingData = {}
    for (const b of budgetsData) {
      spendingData[b.category_id] = await getBudgetSpending(userId, b.category_id)
    }
    setSpending(spendingData)
    setLoading(false)
  }

  async function handleCreate() {
    if (!selectedCategory || !amount || parseFloat(amount) <= 0) {
      alert('Выбери категорию и введи сумму')
      return
    }

    await createBudget(userId, selectedCategory, parseFloat(amount))
    setSelectedCategory(null)
    setAmount('')
    setShowAddModal(false)
    await loadAll()
  }

  async function handleDelete(budgetId) {
    if (confirm('Удалить этот бюджет?')) {
      await deleteBudget(budgetId)
      await loadAll()
    }
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU').format(amount)
  }

  const availableCategories = categories.filter(
    c => !budgets.some(b => b.category_id === c.id)
  )

  return (
    <div className="min-h-screen pb-24">
      {/* Шапка */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Бюджеты</h1>
          <p className="text-gray-400 text-sm">Контролируй расходы 💰</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-12 h-12 rounded-full bg-gold text-black text-2xl font-bold flex items-center justify-center shadow-lg shadow-gold/30 hover:scale-110 transition active:scale-95"
        >
          +
        </button>
      </div>

      {/* Список бюджетов */}
      <div className="px-6 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Загрузка...</p>
        ) : budgets.length === 0 ? (
          <div className="bg-dark-card border border-gold/10 rounded-2xl p-8 text-center">
            <p className="text-5xl mb-3">💰</p>
            <p className="text-white font-semibold mb-1">Нет бюджетов</p>
            <p className="text-gray-500 text-sm">
              Установи лимит на категорию,<br />чтобы не выйти за рамки
            </p>
          </div>
        ) : (
          budgets.map((budget) => {
            const spent = spending[budget.category_id] || 0
            const limit = parseFloat(budget.amount)
            const progress = Math.min(100, (spent / limit) * 100)
            const remaining = limit - spent
            const isOverBudget = spent > limit
            const isWarning = progress >= 80 && !isOverBudget

            return (
              <div
                key={budget.id}
                className={`bg-dark-card border rounded-2xl p-4 ${
                  isOverBudget
                    ? 'border-red-500/50'
                    : isWarning
                    ? 'border-yellow-500/50'
                    : 'border-gold/20'
                }`}
              >
                {/* Заголовок */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{budget.categories?.icon || '💸'}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{budget.categories?.name}</h3>
                    <p className={`text-xs ${
                      isOverBudget ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-gray-500'
                    }`}>
                      {isOverBudget
                        ? '⚠️ Превышен бюджет!'
                        : isWarning
                        ? '⚡ Почти исчерпан'
                        : '✅ В рамках бюджета'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-gray-600 hover:text-red-400 text-xl"
                  >
                    🗑
                  </button>
                </div>

                {/* Прогресс */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={`font-semibold ${
                      isOverBudget ? 'text-red-400' : 'text-white'
                    }`}>
                      {formatMoney(spent)} ₽
                    </span>
                    <span className="text-gray-400">
                      из {formatMoney(limit)} ₽
                    </span>
                  </div>

                  <div className="h-2.5 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget
                          ? 'bg-gradient-to-r from-red-500 to-red-400'
                          : isWarning
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                          : 'bg-gradient-to-r from-gold to-yellow-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{progress.toFixed(0)}%</span>
                    <span className={isOverBudget ? 'text-red-400 font-semibold' : 'text-gray-500'}>
                      {isOverBudget
                        ? `Перерасход: ${formatMoney(Math.abs(remaining))} ₽`
                        : `Осталось: ${formatMoney(remaining)} ₽`}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* МОДАЛКА */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center p-4">
          <div className="bg-dark-card border border-gold/30 rounded-3xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Новый бюджет</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Категория */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Категория расходов</p>
              {availableCategories.length === 0 ? (
                <p className="text-gray-500 text-sm bg-black/40 p-4 rounded-xl text-center">
                  Все категории уже имеют бюджет
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-xl text-left transition ${
                        selectedCategory === cat.id
                          ? 'bg-gold/20 border-2 border-gold'
                          : 'bg-black/40 border border-gold/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <p className="text-white text-sm font-medium">{cat.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Сумма */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Лимит на месяц</p>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                className="w-full bg-black/40 border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={availableCategories.length === 0}
              className="w-full bg-gold text-black font-bold py-4 rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Создать бюджет 💰
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Budgets
