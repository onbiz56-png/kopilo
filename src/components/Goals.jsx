import { useState, useEffect } from 'react'
import { getGoals, createGoal, updateGoalAmount, deleteGoal } from '../lib/supabase'

const GOAL_ICONS = ['🎯', '💻', '🏠', '🚗', '✈️', '📱', '💍', '🎓', '💰', '🎁', '🏖', '🎮']

function Goals({ userId }) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddMoney, setShowAddMoney] = useState(null)

  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [addAmount, setAddAmount] = useState('')

  useEffect(() => {
    loadGoals()
  }, [])

  async function loadGoals() {
    setLoading(true)
    const data = await getGoals(userId)
    setGoals(data)
    setLoading(false)
  }

  async function handleCreate() {
    if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
      alert('Заполни название и сумму')
      return
    }

    const result = await createGoal(userId, {
      name: name.trim(),
      icon,
      target_amount: parseFloat(targetAmount),
      deadline: deadline || null,
    })

    if (result) {
      setName('')
      setIcon('🎯')
      setTargetAmount('')
      setDeadline('')
      setShowAddModal(false)
      await loadGoals()
    }
  }

  async function handleAddMoney(goalId, currentAmount) {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      alert('Введи сумму')
      return
    }

    const newAmount = parseFloat(currentAmount) + parseFloat(addAmount)
    await updateGoalAmount(goalId, newAmount)
    setAddAmount('')
    setShowAddMoney(null)
    await loadGoals()
  }

  async function handleDelete(goalId) {
    if (confirm('Удалить эту цель?')) {
      await deleteGoal(goalId)
      await loadGoals()
    }
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU').format(amount)
  }

  function getDaysLeft(deadline) {
    if (!deadline) return null
    const diff = new Date(deadline) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Цели</h1>
          <p className="text-gray-400 text-sm">Копи на мечту 💎</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-12 h-12 rounded-full bg-gold text-black text-2xl font-bold flex items-center justify-center shadow-lg shadow-gold/30 hover:scale-110 transition active:scale-95"
        >
          +
        </button>
      </div>

      <div className="px-6 space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Загрузка...</p>
        ) : goals.length === 0 ? (
          <div className="bg-dark-card border border-gold/10 rounded-2xl p-8 text-center">
            <p className="text-5xl mb-3">🎯</p>
            <p className="text-white font-semibold mb-1">Нет целей</p>
            <p className="text-gray-500 text-sm">Создай первую цель и начни копить!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = Math.min(100, (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100)
            const daysLeft = getDaysLeft(goal.deadline)
            const isComplete = goal.is_completed

            return (
              <div
                key={goal.id}
                className={`bg-dark-card border rounded-3xl p-5 ${
                  isComplete ? 'border-green-500/50' : 'border-gold/20'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-4xl">{goal.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-lg">{goal.name}</h3>
                      {isComplete && <span className="text-2xl">🎉</span>}
                    </div>
                    {daysLeft !== null && !isComplete && (
                      <p className={`text-xs ${daysLeft < 7 ? 'text-red-400' : 'text-gray-500'}`}>
                        {daysLeft > 0 ? `Осталось ${daysLeft} дн.` : 'Срок прошёл'}
                      </p>
                    )}
                    {isComplete && (
                      <p className="text-xs text-green-400 font-semibold">✨ Цель достигнута!</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-gray-600 hover:text-red-400 text-xl"
                  >
                    🗑
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isComplete ? 'text-green-400 font-bold' : 'text-gold font-semibold'}>
                      {formatMoney(goal.current_amount)} ₽
                    </span>
                    <span className="text-gray-400">
                      из {formatMoney(goal.target_amount)} ₽
                    </span>
                  </div>

                  <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete
                          ? 'bg-gradient-to-r from-green-500 to-green-400'
                          : 'bg-gradient-to-r from-gold to-yellow-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{progress.toFixed(1)}%</span>
                    <span className="text-gray-500">
                      Осталось: {formatMoney(Math.max(0, goal.target_amount - goal.current_amount))} ₽
                    </span>
                  </div>
                </div>

                {!isComplete && (
                  <>
                    {showAddMoney === goal.id ? (
                      <div className="mt-4 space-y-2">
                        <input
                          type="number"
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          placeholder="Сколько добавить?"
                          className="w-full bg-black/40 border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddMoney(goal.id, goal.current_amount)}
                            className="flex-1 bg-gold text-black font-bold py-2 rounded-xl active:scale-95"
                          >
                            Добавить
                          </button>
                          <button
                            onClick={() => {
                              setShowAddMoney(null)
                              setAddAmount('')
                            }}
                            className="px-4 bg-black/40 text-gray-400 rounded-xl"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddMoney(goal.id)}
                        className="mt-4 w-full bg-gold/10 border border-gold/30 text-gold font-semibold py-3 rounded-xl hover:bg-gold/20 transition active:scale-98"
                      >
                        💰 Пополнить
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center p-4">
          <div className="bg-dark-card border border-gold/30 rounded-3xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Новая цель</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 text-2xl"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Иконка</p>
              <div className="flex flex-wrap gap-2">
                {GOAL_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition ${
                      icon === emoji
                        ? 'bg-gold/20 border-2 border-gold scale-110'
                        : 'bg-black/40 border border-gold/10'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Название</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="MacBook Pro"
                className="w-full bg-black/40 border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Целевая сумма</p>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="150000"
                className="w-full bg-black/40 border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Дедлайн (необязательно)</p>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-black/40 border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold"
              />
            </div>

            <button
              onClick={handleCreate}
              className="w-full bg-gold text-black font-bold py-4 rounded-xl active:scale-95"
            >
              Создать цель 🎯
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Goals
