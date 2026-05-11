import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

/* 
============================
👤 ПОЛЬЗОВАТЕЛИ (USERS)
============================
*/

export async function getOrCreateUser(telegramUser) {
  if (!telegramUser) return null

  try {
    // Ищем пользователя
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .maybeSingle()

    if (findError) {
      console.error('Error finding user:', findError)
      return null
    }

    if (existingUser) {
      console.log('User found:', existingUser)
      return existingUser
    }

    // Создаём нового
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        telegram_id: telegramUser.id,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name || null,
        last_name: telegramUser.last_name || null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return null
    }

    console.log('User created:', newUser)
    return newUser
  } catch (err) {
    console.error('Exception in getOrCreateUser:', err)
    return null
  }
}

// Алиас для совместимости (если где-то вызывается upsertUser)
export const upsertUser = getOrCreateUser

export async function updateUser(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('Exception in updateUser:', err)
    return null
  }
}

/* 
============================
📂 КАТЕГОРИИ (CATEGORIES)
============================
*/

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('type', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Exception in getCategories:', err)
    return []
  }
}

/* 
============================
💸 ТРАНЗАКЦИИ (TRANSACTIONS)
============================
*/

export async function addTransaction({ userId, categoryId, amount, type, description }) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        category_id: categoryId,
        amount: amount,
        type: type,
        description: description || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding transaction:', error)
      return null
    }

    console.log('Transaction added:', data)
    return data
  } catch (err) {
    console.error('Exception in addTransaction:', err)
    return null
  }
}

export async function getTransactions(userId) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color,
          type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Exception in getTransactions:', err)
    return []
  }
}

export async function deleteTransaction(transactionId) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)

    if (error) {
      console.error('Error deleting transaction:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Exception in deleteTransaction:', err)
    return false
  }
}

export async function getBalance(userId) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)

    if (error) {
      console.error('Error calculating balance:', error)
      return { income: 0, expense: 0, balance: 0 }
    }

    let income = 0
    let expense = 0

    data.forEach((t) => {
      if (t.type === 'income') {
        income += parseFloat(t.amount)
      } else {
        expense += parseFloat(t.amount)
      }
    })

    return {
      income: income,
      expense: expense,
      balance: income - expense,
    }
  } catch (err) {
    console.error('Exception in getBalance:', err)
    return { income: 0, expense: 0, balance: 0 }
  }
}

/* 
============================
🎯 ЦЕЛИ (GOALS)
============================
*/

export async function getGoals(userId) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching goals:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Exception in getGoals:', err)
    return []
  }
}

export async function createGoal({ userId, name, targetAmount, icon, deadline }) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        name: name,
        target_amount: targetAmount,
        current_amount: 0,
        icon: icon || '🎯',
        deadline: deadline || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating goal:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('Exception in createGoal:', err)
    return null
  }
}

export async function updateGoalAmount(goalId, newAmount) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .update({ current_amount: newAmount })
      .eq('id', goalId)
      .select()
      .single()

    if (error) {
      console.error('Error updating goal:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('Exception in updateGoalAmount:', err)
    return null
  }
}

export async function deleteGoal(goalId) {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (error) {
      console.error('Error deleting goal:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Exception in deleteGoal:', err)
    return false
  }
}

/* 
============================
💰 БЮДЖЕТЫ (BUDGETS)
============================
*/

export async function getBudgets(userId) {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color,
          type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching budgets:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Exception in getBudgets:', err)
    return []
  }
}

export async function createBudget({ userId, categoryId, amount, period }) {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        category_id: categoryId,
        amount: amount,
        period: period || 'month',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating budget:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('Exception in createBudget:', err)
    return null
  }
}

export async function updateBudget(budgetId, updates) {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', budgetId)
      .select()
      .single()

    if (error) {
      console.error('Error updating budget:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('Exception in updateBudget:', err)
    return null
  }
}

export async function deleteBudget(budgetId) {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)

    if (error) {
      console.error('Error deleting budget:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Exception in deleteBudget:', err)
    return false
  }
}

export async function getBudgetSpending(userId, categoryId, period = 'month') {
  try {
    // Определяем дату начала периода
    const now = new Date()
    let startDate

    if (period === 'week') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1)
    } else {
      startDate = new Date(0)
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .eq('type', 'expense')
      .gte('created_at', startDate.toISOString())

    if (error) {
      console.error('Error fetching budget spending:', error)
      return 0
    }

    let total = 0
    data.forEach((t) => {
      total += parseFloat(t.amount)
    })

    return total
  } catch (err) {
    console.error('Exception in getBudgetSpending:', err)
    return 0
  }
}

/* 
============================
📊 АНАЛИТИКА (ANALYTICS)
============================
*/

export async function getAnalytics(userId, period = 'month') {
  try {
    // Определяем дату начала периода
    const now = new Date()
    let startDate

    if (period === 'week') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1)
    } else {
      startDate = new Date(0) // Всё время
    }

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color,
          type
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching analytics:', error)
      return { transactions: [], byCategory: [], totalIncome: 0, totalExpense: 0 }
    }

    const transactions = data || []
    let totalIncome = 0
    let totalExpense = 0
    const categoryMap = {}

    transactions.forEach((t) => {
      const amount = parseFloat(t.amount)
      if (t.type === 'income') {
        totalIncome += amount
      } else {
        totalExpense += amount
      }

      // Группировка по категориям
      const catId = t.categories?.id || 'other'
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          id: catId,
          name: t.categories?.name || 'Без категории',
          icon: t.categories?.icon || '📦',
          color: t.categories?.color || '#888',
          type: t.type,
          total: 0,
          count: 0,
        }
      }
      categoryMap[catId].total += amount
      categoryMap[catId].count += 1
    })

    const byCategory = Object.values(categoryMap).sort((a, b) => b.total - a.total)

    return {
      transactions,
      byCategory,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    }
  } catch (err) {
    console.error('Exception in getAnalytics:', err)
    return { transactions: [], byCategory: [], totalIncome: 0, totalExpense: 0 }
  }
}
