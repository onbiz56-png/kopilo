import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// 👤 ПОЛЬЗОВАТЕЛИ
// ============================================

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
      console.log('✅ User found:', existingUser)
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

    console.log('✅ User created:', newUser)
    return newUser
  } catch (err) {
    console.error('Exception in getOrCreateUser:', err)
    return null
  }
}

// ============================================
// 📂 КАТЕГОРИИ
// ============================================

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

// ============================================
// 💸 ТРАНЗАКЦИИ
// ============================================

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

    console.log('✅ Transaction added:', data)
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
