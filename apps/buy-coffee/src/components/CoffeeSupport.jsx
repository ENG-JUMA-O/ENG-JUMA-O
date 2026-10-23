
import { useState } from 'react'
import {
  CheckCircle2,
  Coffee,
  LoaderCircle,
  Printer,
  ShieldCheck,
} from 'lucide-react'

const COFFEE_AMOUNTS = [50, 100, 200, 500]

function isKenyanPhone(phone) {
  const normalized = phone.replace(/[\s-]/g, '')
  return /^(?:\+254|254|0)7\d{8}$/.test(normalized) ||
    /^(?:\+254|254|0)1\d{8}$/.test(normalized)
}

const money = (value) =>
  Number(value || 0).toLocaleString('en-KE')

const fieldClass =
  'form-field mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200'

export default function CoffeeSupport() {
  const [amount, setAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [status, setStatus] = useState('')
  const [statusType, setStatusType] = useState('info')
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)

  const selectedAmount =
    amount === 'custom' ? Number(customAmount) : amount

  const formattedAmount = Number.isFinite(selectedAmount)
    ? money(selectedAmount)
    : '0'

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('')
    setReceipt(null)

    if (
      !Number.isInteger(selectedAmount) ||
      selectedAmount < 10 ||
      selectedAmount > 150000
    ) {
      setStatus('Enter a whole amount between KES 10 and KES 150,000.')
      setStatusType('error')
      return
    }

    const normalizedPhone = phone.replace(/[\s-]/g, '')

    if (!isKenyanPhone(normalizedPhone)) {
      setStatus(
        'Enter a valid Kenyan M-Pesa phone number, such as 07XXXXXXXX.'
      )
      setStatusType('error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmount,
          phone: normalizedPhone,
          name: anonymous ? 'Anonymous' : name.trim(),
          message: message.trim(),
          anonymous,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.message || 'Could not initiate payment. Please try again.'
        )
      }

      // Display a receipt only after server-side payment confirmation.
      const paymentStatus = String(
        data.paymentStatus || data.status || ''
      ).toLowerCase()

      if (
        ['completed', 'success', 'paid'].includes(paymentStatus)
      ) {
        setReceipt({
          amount: Number(data.amount ?? selectedAmount),
          supporter: anonymous
            ? 'Anonymous'
            : name.trim() || 'Supporter',
          phone: data.phone || normalizedPhone,
          receiptNumber:
            data.receiptNumber ||
            data.mpesaReceiptNumber ||
            data.transactionId ||
            'Receipt pending',
          date:
            data.paidAt ||
            data.completedAt ||
            new Date().toISOString(),
          message: message.trim(),
        })

        setStatus('Payment confirmed. Thank you for supporting my work!')
        setStatusType('success')
      } else {
        setStatus(
          data.message ||
            'M-Pesa payment request sent. Check your phone and enter your M-Pesa PIN. Your receipt will be available after the server verifies payment.'
        )
        setStatusType('info')
      }
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Payment request failed. Please try again.'
      )
      setStatusType('error')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setReceipt(null)
    setStatus('')
    setStatusType('info')
    setAmount(100)
    setCustomAmount('')
    setName('')
    setPhone('')
    setMessage('')
    setAnonymous(false)
  }

  return (
    <div className="coffee-card rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4">
      {receipt ? (
        <div className="receipt-content">
          <div className="no-print flex flex-col items-center text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={25} />
            </div>

            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Payment confirmed
            </p>

            <h2 className="mt-1.5 text-xl font-black tracking-tight text-slate-900">
              Thank you for the coffee!
            </h2>

            <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-500">
              Your support means a lot. Your payment has been verified by
              the server.
            </p>
          </div>

          <div className="receipt-paper mx-auto mt-5 max-w-md rounded-xl border border-dashed border-emerald-200 bg-[#fbfefb] p-4">
            <div className="flex items-center justify-between border-b border-dashed border-emerald-200 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  Support receipt
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Independent developer support
                </p>
              </div>

              <Coffee className="text-emerald-700" size={22} />
            </div>

            <div className="py-4 text-center">
              <p className="text-xs text-slate-500">Amount received</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">
                KES {money(receipt.amount)}
              </p>

              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                <ShieldCheck size={12} />
                Verified
              </span>
            </div>

            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Supporter</dt>
                <dd className="text-right font-semibold text-slate-800">
                  {receipt.supporter}
                </dd>
              </div>

              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">M-Pesa number</dt>
                <dd className="text-right font-semibold text-slate-800">
                  {receipt.phone}
                </dd>
              </div>

              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Receipt / reference</dt>
                <dd className="max-w-[60%] break-all text-right font-semibold text-slate-800">
                  {receipt.receiptNumber}
                </dd>
              </div>

              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Date</dt>
                <dd className="text-right font-semibold text-slate-800">
                  {new Date(receipt.date).toLocaleString('en-KE')}
                </dd>
              </div>

              {receipt.message && (
                <div className="border-t border-slate-100 pt-2.5">
                  <dt className="text-slate-500">Message</dt>
                  <dd className="mt-1 break-words text-slate-800">
                    {receipt.message}
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-4 border-t border-dashed border-emerald-200 pt-3 text-center text-[10px] text-slate-400">
              Thank you for supporting independent development.
            </p>
          </div>

          <div className="no-print mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
            >
              <Printer size={15} />
              Print receipt
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="min-h-9 flex-1 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50"
            >
              Support again
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2 border-b border-emerald-50 pb-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <Coffee size={16} />
            </div>

            <div>
              <h2
                id="coffee-title"
                className="text-sm font-extrabold tracking-tight text-slate-900"
              >
                Choose your coffee
              </h2>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Quick and secure M-Pesa support
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <fieldset>
              <legend className="mb-1.5 text-xs font-bold text-slate-800">
                Choose your support amount
              </legend>

              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {COFFEE_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={amount === value}
                    onClick={() => {
                      setAmount(value)
                      setStatus('')
                    }}
                    className={`amount-option rounded-lg border px-2 py-1.5 text-xs font-semibold transition duration-200 sm:py-2 ${
                      amount === value
                        ? 'selected border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60'
                    }`}
                  >
                    <Coffee size={13} className="mx-auto mb-0.5" />
                    KES {value}
                  </button>
                ))}
              </div>

              <button
                type="button"
                aria-pressed={amount === 'custom'}
                onClick={() => {
                  setAmount('custom')
                  setStatus('')
                }}
                className={`mt-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition ${
                  amount === 'custom'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
              >
                Custom amount
              </button>

              {amount === 'custom' && (
                <label
                  className="mt-2 block text-xs font-semibold text-slate-700"
                  htmlFor="custom-amount"
                >
                  Amount (KES)
                  <input
                    id="custom-amount"
                    type="number"
                    min="10"
                    max="150000"
                    step="1"
                    required
                    value={customAmount}
                    onChange={(event) => {
                      setCustomAmount(event.target.value)
                      setStatus('')
                    }}
                    className={fieldClass}
                    placeholder="Enter amount"
                  />
                </label>
              )}
            </fieldset>

            <div className="grid gap-2 sm:grid-cols-2">
              <label
                className="text-xs font-semibold text-slate-700"
                htmlFor="supporter-name"
              >
                Your name{' '}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>

                <input
                  id="supporter-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={80}
                  disabled={anonymous}
                  className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-400`}
                  placeholder="Your name"
                />
              </label>

              <label
                className="text-xs font-semibold text-slate-700"
                htmlFor="supporter-phone"
              >
                M-Pesa phone number

                <input
                  id="supporter-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value)
                    setStatus('')
                  }}
                  className={fieldClass}
                  placeholder="07XXXXXXXX"
                />
              </label>
            </div>

            <label
              className="block text-xs font-semibold text-slate-700"
              htmlFor="support-message"
            >
              Message{' '}
              <span className="font-normal text-slate-400">
                (optional)
              </span>

              <textarea
                id="support-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={500}
                rows={2}
                className={`${fieldClass} resize-y`}
                placeholder="Leave an encouraging message..."
              />

              <span className="mt-0.5 block text-right text-[10px] font-normal text-slate-400">
                {message.length}/500
              </span>
            </label>

            <div className="rounded-lg border border-emerald-100 bg-[#f5fbf6] p-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-500">
                  Total support
                </span>
                <span className="text-base font-black tracking-tight text-slate-900">
                  KES {formattedAmount}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Coffee size={15} />
                )}
                {loading
                  ? 'Starting M-Pesa request...'
                  : 'Support with M-Pesa'}
              </button>
            </div>

            {status && (
              <p
                role={statusType === 'error' ? 'alert' : 'status'}
                aria-live="polite"
                className={`rounded-lg border p-2.5 text-xs leading-5 ${
                  statusType === 'error'
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : statusType === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-sky-100 bg-sky-50 text-sky-800'
                }`}
              >
                {status}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  )
}
