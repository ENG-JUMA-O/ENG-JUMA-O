import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Coffee,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import DonationReceipt from './DonationReceipt.jsx'
import { createDonation, getDonation } from '../services/donationApi'

const AMOUNTS = [100, 200, 500]
const MIN_AMOUNT = 1
const MAX_AMOUNT = 150000

const inputClass =
  'mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 disabled:bg-slate-100'

function normalizeKenyanPhone(phone) {
  const value = phone.replace(/[\s()-]/g, '')

  if (!/^(?:\+254|254|0)(?:1|7)\d{8}$/.test(value)) return null
  if (value.startsWith('+254')) return value.slice(1)
  if (value.startsWith('0')) return `254${value.slice(1)}`

  return value
}

const money = (value) => Number(value || 0).toLocaleString('en-KE')

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
  const [donationId, setDonationId] = useState(null)
  const [polling, setPolling] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)

  const timerRef = useRef(null)
  const stoppedRef = useRef(false)
  const receiptContextRef = useRef(null)

  const selectedAmount =
    amount === 'custom' ? Number(customAmount) : amount

  const amountValid =
    Number.isSafeInteger(selectedAmount) &&
    selectedAmount >= MIN_AMOUNT &&
    selectedAmount <= MAX_AMOUNT

  function showStatus(text, type = 'info') {
    setStatus(text)
    setStatusType(type)
  }

  function stopTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function selectAmount(value) {
    setAmount(value)
    setCustomAmount('')
    setStatus('')
  }

  useEffect(() => {
    if (!donationId || !polling) return undefined

    let cancelled = false
    let attempts = 0
    stoppedRef.current = false
    setCheckingPayment(true)

    async function checkStatus() {
      if (cancelled || stoppedRef.current) return

      try {
        const response = await getDonation(donationId)

        if (cancelled || stoppedRef.current) return

        const donation = response.data

        if (!donation) {
          throw new Error('Donation details were not returned.')
        }

        if (donation.status === 'SUCCESS') {
          const context = receiptContextRef.current || {}

          setReceipt({
            amount: Number(donation.amount),
            supporter: donation.isAnonymous
              ? 'Anonymous'
              : donation.customerName || context.name || 'Supporter',
            phone: context.phone || '',
            receiptNumber:
              donation.mpesaReceiptNumber ||
              donation.externalReference ||
              'Receipt pending',
            date:
              donation.paidAt ||
              donation.updatedAt ||
              donation.createdAt ||
              new Date().toISOString(),
            message: donation.message || '',
          })

          showStatus('Payment confirmed. Thank you!', 'success')
          setDonationId(null)
          setPolling(false)
          setCheckingPayment(false)
          stopTimer()
          return
        }

        if (['FAILED', 'CANCELLED'].includes(donation.status)) {
          showStatus(
            donation.status === 'FAILED'
              ? 'Payment failed. You can try again.'
              : 'Payment was cancelled. You can try again.',
            'error',
          )
          setDonationId(null)
          setPolling(false)
          setCheckingPayment(false)
          stopTimer()
          return
        }
      } catch {
        if (cancelled || stoppedRef.current) return
      }

      if (cancelled || stoppedRef.current) return

      attempts += 1

      if (attempts >= 40) {
        showStatus(
          'Payment is still pending. Check your M-Pesa prompt or check again.',
          'info',
        )
        setPolling(false)
        setCheckingPayment(false)
        return
      }

      timerRef.current = setTimeout(checkStatus, 3000)
    }

    checkStatus()

    return () => {
      cancelled = true
      stoppedRef.current = true
      stopTimer()
    }
  }, [donationId, polling])

  function clearStatus() {
    setStatus('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading || donationId) return

    clearStatus()
    setReceipt(null)

    if (!amountValid) {
      showStatus('Enter a whole amount between KES 1 and KES 150,000.', 'error')
      return
    }

    const normalizedPhone = normalizeKenyanPhone(phone)

    if (!normalizedPhone) {
      showStatus(
        'Enter a valid Kenyan phone number, for example 0712345678.',
        'error',
      )
      return
    }

    if (!anonymous && name.trim().length > 80) {
      showStatus('Your name must be 80 characters or fewer.', 'error')
      return
    }

    if (message.trim().length > 500) {
      showStatus('Your message must be 500 characters or fewer.', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await createDonation({
        amount: selectedAmount,
        phone: normalizedPhone,
        customerName: anonymous ? 'Anonymous' : name.trim(),
        message: message.trim(),
        isAnonymous: anonymous,
      })

      const donation = response.data?.donation

      if (!donation?.id) {
        throw new Error('The server did not return a donation ID.')
      }

      receiptContextRef.current = {
        name: anonymous ? 'Anonymous' : name.trim(),
        phone: normalizedPhone,
      }

      setDonationId(donation.id)
      setPolling(true)
      showStatus(
        'M-Pesa request sent. Check your phone and follow the payment prompt.',
        'info',
      )
    } catch (error) {
      showStatus(
        error instanceof Error
          ? error.message
          : 'Unable to start payment. Please try again.',
        'error',
      )
    } finally {
      setLoading(false)
    }
  }

  function checkAgain() {
    if (!donationId || polling || loading) return

    showStatus('Checking your payment status...', 'info')
    setPolling(true)
  }

  function stopChecking() {
    stoppedRef.current = true
    stopTimer()
    setPolling(false)
    setCheckingPayment(false)
    showStatus(
      'Automatic checking stopped. Your payment may still be processing. You can check again below.',
      'info',
    )
  }

  function resetForm() {
    stoppedRef.current = true
    stopTimer()
    setAmount(100)
    setCustomAmount('')
    setName('')
    setPhone('')
    setMessage('')
    setAnonymous(false)
    setStatus('')
    setStatusType('info')
    setLoading(false)
    setReceipt(null)
    setDonationId(null)
    setPolling(false)
    setCheckingPayment(false)
    receiptContextRef.current = null
  }

  return (
    <div className="w-full text-xs">
      {receipt ? (
        <DonationReceipt receipt={receipt} onSupportAgain={resetForm} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <fieldset
            disabled={loading || Boolean(donationId)}
            className="space-y-3"
          >
            <legend className="mb-2 text-xs font-bold text-slate-800">
              Choose an amount
            </legend>

            <div className="grid grid-cols-4 gap-1.5">
              {AMOUNTS.map((value) => {
                const selected = amount === value

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectAmount(value)}
                    className={`rounded-lg border px-1 py-2 text-center transition ${
                      selected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    <Coffee
                      size={14}
                      className={`mx-auto mb-1 ${
                        selected ? 'text-lime-200' : 'text-emerald-600'
                      }`}
                    />
                    <span className="block text-[11px] font-bold">
                      KES {value}
                    </span>
                  </button>
                )
              })}

              <button
                type="button"
                aria-pressed={amount === 'custom'}
                onClick={() => {
                  setAmount('custom')
                  setStatus('')
                }}
                className={`rounded-lg border px-1 py-2 text-center transition ${
                  amount === 'custom'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <Coffee
                  size={14}
                  className={`mx-auto mb-1 ${
                    amount === 'custom' ? 'text-lime-200' : 'text-emerald-600'
                  }`}
                />
                <span className="block text-[11px] font-bold">Custom</span>
              </button>
            </div>

            <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-2">
              <label
                htmlFor="custom-amount"
                className="block text-[11px] font-semibold text-slate-700"
              >
                Amount (KES)
                <input
                  id="custom-amount"
                  type="number"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step="1"
                  required
                  disabled={amount !== 'custom'}
                  value={amount === 'custom' ? customAmount : String(amount)}
                  onChange={(event) => {
                    setCustomAmount(event.target.value)
                    clearStatus()
                  }}
                  placeholder="Enter amount"
                  className={inputClass}
                />
              </label>

              <label className="flex min-h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-2 py-2 text-[11px] text-slate-700 transition hover:border-emerald-300">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(event) => setAnonymous(event.target.checked)}
                  className="h-3.5 w-3.5 shrink-0 accent-emerald-600"
                />
                <span>Make my donation anonymous</span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label
                htmlFor="supporter-name"
                className="block text-[11px] font-semibold text-slate-700"
              >
                Name <span className="font-normal text-slate-400">(optional)</span>
                <input
                  id="supporter-name"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  value={name}
                  disabled={anonymous}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                />
              </label>

              <label
                htmlFor="supporter-phone"
                className="block text-[11px] font-semibold text-slate-700"
              >
                M-Pesa number
                <input
                  id="supporter-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={16}
                  required
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value)
                    clearStatus()
                  }}
                  placeholder="0712345678"
                  className={inputClass}
                />
              </label>
            </div>

            <label
              htmlFor="support-message"
              className="block text-[11px] font-semibold text-slate-700"
            >
              Message <span className="font-normal text-slate-400">(optional)</span>
              <textarea
                id="support-message"
                rows={2}
                maxLength={500}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Send a little encouragement..."
                className={`${inputClass} resize-y`}
              />
              <span className="mt-1 block text-right text-[10px] font-normal text-slate-400">
                {message.length}/500
              </span>
            </label>
          </fieldset>

          <div className="rounded-lg bg-emerald-50 p-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium text-slate-600">
                Total contribution
              </span>
              <span className="text-base font-extrabold text-emerald-800">
                KES {money(selectedAmount)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || Boolean(donationId) || !amountValid}
              className="mt-2.5 flex min-h-9 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading || polling ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Coffee size={14} />
              )}
              {loading
                ? 'Starting payment...'
                : donationId
                  ? 'Payment processing'
                  : 'Support with M-Pesa'}
            </button>
          </div>

          {status && (
            <div
              role={statusType === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              className={`flex items-start gap-2 rounded-md border p-2 text-[11px] leading-4 ${
                statusType === 'error'
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : statusType === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-sky-200 bg-sky-50 text-sky-800'
              }`}
            >
              {statusType === 'error' ? (
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
              ) : statusType === 'success' ? (
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              ) : (
                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
              )}
              <span>{status}</span>
            </div>
          )}

          {donationId && (
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={checkAgain}
                disabled={polling || loading}
                className="flex min-h-8 items-center justify-center gap-2 rounded-md border border-emerald-200 px-3 py-2 text-[11px] font-bold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-50"
              >
                {checkingPayment ? (
                  <LoaderCircle size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                Check payment
              </button>

              {polling && (
                <button
                  type="button"
                  onClick={stopChecking}
                  className="min-h-8 rounded-md border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Stop checking
                </button>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  )
}