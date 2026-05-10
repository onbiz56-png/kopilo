import { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  getTransactionsByPeriod,
  calculateSummary,
  getCategoryBreakdown,
  getDailyBreakdown,
  compareWithPreviousPeriod,
} from '../lib/analytics'

function Analytics({ userId }) {
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ income: 0, expense: 0, saved: 0, count: 0 })
  const [categories, setCategories] = useState([])
  const [daily, setDaily] = useState([])
  const [comparison, setComparison] = useState(null)

  useEffect(() => {
    if (userId) loadAnalytics()
  }, [userId, period])

  async function loadAnalytics() {
    setLoading(true)
    try {
      const transactions = await getTransactionsByPeriod(userId, period)
      setSummary(calculateSummary(transactions))
      setCategories(getCategoryBreakdown(transactions))

      const daysCount = period === 'week' ? 7 : period === 'month' ? 30 : 12
      setDaily(getDailyBreakdown(transactions, daysCount))

      const comp = await compareWithPreviousPeriod(userId, period)
      setComparison(comp)
    } catch (err) {
      console.error('Error loading analytics:', err)
    }
    setLoading(false)
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₽'
  }

  const COLORS = ['#D4AF37', '#F4D03F', '#B8860B', '#DAA520', '#FFD700', '#CD853F', '#DEB887']

  return (
    <div className="min-h-screen bg-dark pb-24">
      {/* Шапка */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-white mb-1">Аналитика</h1>
        <p className="text-gray-400 text-sm">Твоя финансовая картина</p>
      </div>

      {/* Переключатель периода */}
      <div className="px-6 mb-6">
        <div className="bg-dark-card border border-gold/10 rounded-2xl p-1 flex gap-1">
          {[
            { id: 'week', label: 'Неделя' },
            { id: 'month', label: 'Месяц' },
            { id: 'year', label: 'Год' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                period === p.id
                  ? 'bg-gold text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="px-6">
          <div className="bg-dark-card border border-gold/10 rounded-2xl p-8 text-center">
            <p className="text-gray-400">Загрузка...</p>
          </div>
        </div>
      ) : summary.count === 0 ? (
        // Пустое состояние
        <div className="px-6">
          <div className="bg-dark-card border border-gold/10 rounded-2xl p-10 text-center">
            <p className="text-5xl mb-3">📊</p>
            <p className="text-white font-semibold mb-1">Нет данных за период</p>
            <p className="text-gray-500 text-sm">Добавь транзакции чтобы увидеть аналитику</p>
          </div>
        </div>
      ) : (
        <div className="px-6 space-y-4">
          {/* 1️⃣ СВОДКА */}
          <div className="bg-dark-card border border-gold/10 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Сводка</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">💰 Доход</span>
                <span className="text-green-400 font-bold">{formatMoney(summary.income)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">💸 Расход</span>
                <span className="text-red-400 font-bold">{formatMoney(summary.expense)}</span>
              </div>
              <div className="h-px bg-gold/10"></div>
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">📈 Накоплено</span>
                <span className={`font-bold text-lg ${summary.saved >= 0 ? 'text-gold' : 'text-red-400'}`}>
                  {formatMoney(summary.saved)}
                </span>
              </div>
            </div>
          </div>

          {/* 2️⃣ DONUT — РАСХОДЫ ПО КАТЕГОРИЯМ */}
          {categories.length > 0 && (
            <div className="bg-dark-card border border-gold/10 rounded-2xl p-5">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                Расходы по категориям
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '12px',
                      }}
                      formatter={(value) => formatMoney(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 3️⃣ ТОП-5 КАТЕГОРИЙ */}
          {categories.length > 0 && (
            <div className="bg-dark-card border border-gold/10 rounded-2xl p-5">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                Топ категорий
              </p>
              <div className="space-y-3">
                {categories.slice(0, 5).map((cat, idx) => {
                  const percent = Math.round((cat.value / summary.expense) * 100)
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-white text-sm">
                          {cat.icon} {cat.name}
                        </span>
                        <span className="text-gold font-semibold text-sm">
                          {formatMoney(cat.value)}
                        </span>
                      </div>
                      <div className="h-2 bg-gold/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold to-yellow-500 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 4️⃣ BAR CHART — РАСХОДЫ ПО ДНЯМ */}
          {daily.length > 0 && (
            <div className="bg-dark-card border border-gold/10 rounded-2xl p-5">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                Расходы по дням
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily}>
                    <XAxis
                      dataKey="date"
                      stroke="#888"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis stroke="#888" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '12px',
                      }}
                      formatter={(value) => formatMoney(value)}
                    />
                    <Bar dataKey="expense" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 5️⃣ СРАВНЕНИЕ С ПРОШЛЫМ ПЕРИОДОМ */}
          {comparison && comparison.previous > 0 && (
            <div className="bg-dark-card border border-gold/10 rounded-2xl p-5">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                Сравнение
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold mb-1">
                    {comparison.isLess ? '🎉 Молодец!' : '⚠️ Внимание'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {comparison.isLess
                      ? `На ${Math.abs(comparison.percent)}% меньше расходов`
                      : `На ${comparison.percent}% больше расходов`}
                  </p>
                </div>
                <div className={`text-3xl font-bold ${comparison.isLess ? 'text-green-400' : 'text-red-400'}`}>
                  {comparison.isLess ? '↓' : '↑'}
                  {Math.abs(comparison.percent)}%
                </div>
              </div>
            </div>
          )}

          {/* 6️⃣ PRO PREMIUM ПЛАШКА */}
          <div className="bg-gradient-to-br from-gold/20 to-yellow-700/10 border border-gold/30 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">💎</div>
              <div className="flex-1">
                <p className="text-gold font-bold text-lg">Kopilo Pro</p>
                <p className="text-gray-300 text-sm">Расширенная аналитика</p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4 text-sm text-gray-300">
              <li>🤖 AI-инсайты и советы</li>
              <li>📈 Прогноз расходов</li>
              <li>📄 Экспорт в PDF / Excel</li>
              <li>🎯 Цели и бюджеты</li>
            </ul>
            <button className="w-full bg-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition active:scale-95">
              Скоро доступно
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
