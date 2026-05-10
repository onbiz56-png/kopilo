import { useEffect, useState } from 'react'
import { getCategories, addTransaction } from '../lib/supabase'

function AddTransaction({ userId, onClose, onSuccess }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [description, setDescription] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
      setLoading(false)
    }
    loadCategories()
  }, [])

  const filteredCategories = categories.filter((c) => c.type === type)

  async function handleSave() {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Введите сумму больше 0')
      return
    }
    if (!categoryId) {
      alert('Выберите категорию')
      return
    }

    setSaving(true)

    const result = await addTransaction({
      userId: userId,
      categoryId: categoryId,
      amount: parseFloat(amount),
      type: type,
      description: description.trim(),
    })

    setSaving(false)

    if (result) {
      onSuccess()
      onClose()
    } else {
      alert('Ошибка при сохранении. Попробуйте ещё раз.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-dark-card border-t border-gold/20 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-5">

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gold">
            {type === 'expense' ? '💸 Расход' : '💰 Доход'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex bg-black/40 rounded-2xl p-1">
          <button
            onClick={() => {
              setType('expense')
              setCategoryId(null)
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              type === 'expense'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'text-gray-400'
            }`}
          >
            Расход
          </button>
          <button
            onClick={() => {
              setType('income')
              setCategoryId(null)
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              type === 'income'
                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                : 'text-gray-400'
            }`}
          >
            Доход
          </button>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Сумма</label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-black/40 border border-gold/20 rounded-2xl px-4 py-4 text-2xl text-gold font-bold text-center focus:outline-none focus:border-gold/60"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Категория</label>
          {loading ? (
            <p className="text-center text-gray-500 py-4">Загрузка...</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-3 rounded-2xl border transition flex flex-col items-center gap-1 ${
                    categoryId === cat.id
                      ? 'border-gold bg-gold/10'
                      : 'border-gold/10 bg-black/20'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs text-gray-300">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Комментарий (необязательно)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например: обед в кафе"
            className="w-full bg-black/40 border border-gold/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-gold/60"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gold text-black font-bold py-4 rounded-2xl text-lg hover:scale-[1.02] transition active:scale-95 disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>

      </div>
    </div>
  )
}

export default AddTransaction
