import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase keys not found! Check Vercel environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Функция для получения или создания пользователя
export async function getOrCreateUser(telegramUser) {
  if (!telegramUser?.id) {
    console.error('No Telegram user data')
    return null
  }

  try {
    // Проверяем — есть ли уже такой пользователь
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      return null
    }

    // Если есть — возвращаем
    if (existingUser) {
      console.log('✅ User found:', existingUser)
      return existingUser
    }

    // Если нет — создаём нового
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        telegram_id: telegramUser.id,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name || null,
        last_name: telegramUser.last_name || null,
        language_code: telegramUser.language_code || 'ru',
        is_premium: false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user:', insertError)
      return null
    }

    console.log('✨ New user created:', newUser)
    return newUser
  } catch (err) {
    console.error('Exception in getOrCreateUser:', err)
    return null
  }
  // ============================================
// 📂 КАТЕГОРИИ
// ============================================

// Получить все категории (расходы + доходы)
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

// Добавить транзакцию
export async function addTransaction({ userId, categoryId, amount, type, description }) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        category_id: categoryId,
        amount: amount,
        type: type, // 'expense' или 'income'
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

// Получить все транзакции пользователя (с категориями)
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

// Подсчитать баланс пользователя
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
