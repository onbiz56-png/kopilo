function Profile({ user, balance, transactionsCount }) {
  function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU').format(amount)
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Шапка */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-white mb-1">Профиль</h1>
        <p className="text-gray-400 text-sm">Твой аккаунт</p>
      </div>

      {/* Аватар + имя */}
      <div className="px-6 mb-6">
        <div className="bg-dark-card border border-gold/30 rounded-3xl p-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gold to-yellow-700 flex items-center justify-center text-5xl mb-4 shadow-xl shadow-gold/30">
            {user?.first_name?.[0]?.toUpperCase() || '👤'}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {user?.first_name || 'Пользователь'}
          </h2>
          {user?.username && (
            <p className="text-gold text-sm mt-1">@{user.username}</p>
          )}
        </div>
      </div>

      {/* Статистика */}
      <div className="px-6 mb-6 space-y-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider px-2">Статистика</p>

        <div className="bg-dark-card border border-gold/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-3xl">💰</div>
          <div className="flex-1">
            <p className="text-gray-400 text-xs">Текущий баланс</p>
            <p className={`text-xl font-bold ${balance?.balance >= 0 ? 'text-gold' : 'text-red-400'}`}>
              {formatMoney(balance?.balance || 0)} ₽
            </p>
          </div>
        </div>

        <div className="bg-dark-card border border-gold/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-3xl">📊</div>
          <div className="flex-1">
            <p className="text-gray-400 text-xs">Всего транзакций</p>
            <p className="text-xl font-bold text-white">{transactionsCount || 0}</p>
          </div>
        </div>

        <div className="bg-dark-card border border-gold/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-3xl">📈</div>
          <div className="flex-1">
            <p className="text-gray-400 text-xs">Доходов всего</p>
            <p className="text-xl font-bold text-green-400">
              +{formatMoney(balance?.income || 0)} ₽
            </p>
          </div>
        </div>

        <div className="bg-dark-card border border-gold/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-3xl">📉</div>
          <div className="flex-1">
            <p className="text-gray-400 text-xs">Расходов всего</p>
            <p className="text-xl font-bold text-red-400">
              -{formatMoney(balance?.expense || 0)} ₽
            </p>
          </div>
        </div>
      </div>

      {/* Настройки */}
      <div className="px-6 mb-6 space-y-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider px-2">Настройки</p>

        <button className="w-full bg-dark-card border border-gold/10 rounded-2xl p-4 flex items-center gap-4 hover:border-gold/30 transition active:scale-98">
          <div className="text-2xl">🔔</div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">Уведомления</p>
            <p className="text-xs text-gray-500">Скоро</p>
          </div>
          <span className="text-gray-600">›</span>
        </button>

        <button className="w-full bg-dark-card border border-gold/10 rounded-2xl p-4 flex items-center gap-4 hover:border-gold/30 transition active:scale-98">
          <div className="text-2xl">🎨</div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">Тема</p>
            <p className="text-xs text-gray-500">Тёмная (по умолчанию)</p>
          </div>
          <span className="text-gray-600">›</span>
        </button>

        <button className="w-full bg-dark-card border border-gold/10 rounded-2xl p-4 flex items-center gap-4 hover:border-gold/30 transition active:scale-98">
          <div className="text-2xl">📤</div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">Экспорт данных</p>
            <p className="text-xs text-gray-500">Скоро в Pro</p>
          </div>
          <span className="text-gray-600">›</span>
        </button>
      </div>

      {/* PRO */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-gold/20 to-yellow-700/10 border border-gold/30 rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-3xl">💎</div>
            <div className="flex-1">
              <p className="text-gold font-bold text-lg">Kopilo Pro</p>
              <p className="text-gray-300 text-sm">Открой все возможности</p>
            </div>
          </div>
          <button className="w-full bg-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition active:scale-95">
            Скоро доступно
          </button>
        </div>
      </div>

      {/* Версия */}
      <div className="px-6 text-center">
        <p className="text-gray-600 text-xs">Kopilo v1.0</p>
        <p className="text-gray-700 text-[10px] mt-1">Сделано с 💛 для тебя</p>
      </div>
    </div>
  )
}

export default Profile
