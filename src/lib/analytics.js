import { supabase } from './supabase'

// ============================================
// 📊 АНАЛИТИКА: ПОЛУЧЕНИЕ ТРАНЗАКЦИЙ ЗА ПЕРИОД
// ============================================

export async function getTransactionsByPeriod(userId, period = 'month') {
  try {
    const now = new Date()
    let startDate = new Date()

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (id, name, icon, color, type)
      `)
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching period transactions:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Exception in getTransactionsByPeriod:', err)
    return []
  }
}

// ============================================
// 💰 СВОДКА ЗА ПЕРИОД
// ============================================

export function calculateSummary(transactions) {
  let income = 0
  let expense = 0

  transactions.forEach((t) => {
    const amount = parseFloat(t.amount)
    if (t.type === 'income') {
      income += amount
    } else {
      expense += amount
    }
  })

  return {
    income,
    expense,
    saved: income - expense,
    count: transactions.length,
  }
}

// ============================================
// 🍩 РАСХОДЫ ПО КАТЕГОРИЯМ (для Donut Chart)
// ============================================

export function getCategoryBreakdown(transactions) {
  const categoryMap = {}

  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const catName = t.categories?.name || 'Без категории'
      const catIcon = t.categories?.icon || '💸'
      const catColor = t.categories?.color || '#D4AF37'

      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          name: catName,
          icon: catIcon,
          color: catColor,
          value: 0,
        }
      }
      categoryMap[catName].value += parseFloat(t.amount)
    })

  return Object.values(categoryMap).sort((a, b) => b.value - a.value)
}

// ============================================
// 📊 РАСХОДЫ ПО ДНЯМ (для Bar Chart)
// ============================================

export function getDailyBreakdown(transactions, days = 7) {
  const dailyMap = {}
  const now = new Date()

  // Создаём пустые дни
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    const key = date.toISOString().split('T')[0]
    const label = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
    dailyMap[key] = { date: label, expense: 0, income: 0 }
  }

  // Заполняем данными
  transactions.forEach((t) => {
    const key = t.created_at.split('T')[0]
    if (dailyMap[key]) {
      if (t.type === 'expense') {
        dailyMap[key].expense += parseFloat(t.amount)
      } else {
        dailyMap[key].income += parseFloat(t.amount)
      }
    }
  })

  return Object.values(dailyMap)
}

// ============================================
// 🔄 СРАВНЕНИЕ С ПРОШЛЫМ ПЕРИОДОМ
// ============================================

export async function compareWithPreviousPeriod(userId, period = 'month') {
  try {
    const now = new Date()
    let currentStart = new Date()
    let previousStart = new Date()
    let previousEnd = new Date()

    if (period === 'week') {
      currentStart.setDate(now.getDate() - 7)
      previousStart.setDate(now.getDate() - 14)
      previousEnd.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      currentStart.setMonth(now.getMonth() - 1)
      previousStart.setMonth(now.getMonth() - 2)
      previousEnd.setMonth(now.getMonth() - 1)
    } else if (period === 'year') {
      currentStart.setFullYear(now.getFullYear() - 1)
      previousStart.setFullYear(now.getFullYear() - 2)
      previousEnd.setFullYear(now.getFullYear() - 1)
    }

    // Текущий период
    const { data: current } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('created_at', currentStart.toISOString())

    // Прошлый период
    const { data: previous } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', previousEnd.toISOString())

    const currentExpense = (current || [])
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const previousExpense = (previous || [])
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const diff = currentExpense - previousExpense
    const percent =
      previousExpense > 0
        ? Math.round((diff / previousExpense) * 100)
        : 0

    return {
      current: currentExpense,
      previous: previousExpense,
      diff,
      percent,
      isLess: diff < 0,
    }
  } catch (err) {
    console.error('Exception in compareWithPreviousPeriod:', err)
    return { current: 0, previous: 0, diff: 0, percent: 0, isLess: false }
  }
}
