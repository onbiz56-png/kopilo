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
}
