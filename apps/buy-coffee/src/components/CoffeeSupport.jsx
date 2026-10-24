import { useEffect, useRef, useState } from 'react'

import {

  CheckCircle2,

  Coffee,

  LoaderCircle,

  ShieldCheck,

  AlertCircle,

  RefreshCw,

} from 'lucide-react'

import DonationReceipt from './DonationReceipt';

import {

  createDonation,

  getDonation,

} from '../services/donationApi'

const COFFEE_AMOUNTS = [50, 100, 200, 500]

const MIN_AMOUNT = 1

const MAX_AMOUNT = 150000

function normalizeKenyanPhone(phone) {

  const normalized = phone.replace(/[\s()-]/g, '')

  if (!/^(?:\+?254|0)[17]\d{8}$/.test(normalized)) {

    return null

  }

  if (normalized.startsWith('+254')) {

    return normalized.slice(1)

  }

  if (normalized.startsWith('0')) {

    return `254${normalized.slice(1)}`

  }

  return normalized

}

const money = (value) =>

  Number(value || 0).toLocaleString('en-KE')

const fieldClass =

  'form-field mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200'

export default function CoffeeSupport() {

  const [amount, setAmount] = useState(50)

  const [customAmount, setCustomAmount] = useState('')

  const [name, setName] = useState('')

  const [phone, setPhone] = useState('')

  const [message, setMessage] = useState('')

  const [anonymous, setAnonymous] = useState(false)

  const [status, setStatus] = useState('')

  const [statusType, setStatusType] = useState('info')

  const [loading, setLoading] = useState(false)

  const [receipt, setReceipt] = useState(null)

  const [pendingDonationId, setPendingDonationId] = useState(null)

  const [lastDonationId, setLastDonationId] = useState(null)

  const [checkingPayment, setCheckingPayment] = useState(false)

  const receiptContextRef = useRef(null)

  const pollTimerRef = useRef(null)

  const selectedAmount =

    amount === 'custom' ? Number(customAmount) : amount

  const formattedAmount =

    Number.isFinite(selectedAmount) && customAmount !== ''

      ? money(selectedAmount)

      : amount === 'custom'

        ? '0'

        : money(selectedAmount)

  function showStatus(text, type = 'info') {

    setStatus(text)

    setStatusType(type)

  }

  function stopPolling() {

    if (pollTimerRef.current) {

      clearTimeout(pollTimerRef.current)

      pollTimerRef.current = null

    }

  }

  async function pollDonation(

    donationId,

    attempt = 0,

    isStopped = () => false

  ) {

    if (!donationId || isStopped()) return

    try {

      const response = await getDonation(donationId)

      if (isStopped()) return

      const donation = response.data

      if (!donation) {

        throw new Error('The server did not return donation details.')

      }

      if (donation.status === 'SUCCESS') {

        stopPolling()

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

        showStatus(

          'Payment confirmed. Thank you for supporting my work!',

          'success'

        )

        setPendingDonationId(null)

        setCheckingPayment(false)

        return

      }

      if (['FAILED', 'CANCELLED'].includes(donation.status)) {

        stopPolling()

        showStatus(

          donation.status === 'FAILED'

            ? 'Payment failed. You can start a new donation and try again.'

            : 'Payment was cancelled. You can try again when ready.',

          'error'

        )

        setPendingDonationId(null)

        setCheckingPayment(false)

        return

      }

    } catch {

      if (isStopped()) return

      // Retry temporary network errors without creating another payment.

    }

    if (isStopped()) return

    if (attempt >= 39) {

      stopPolling()

      showStatus(

        'Payment is still pending or could not be confirmed. Check your M-Pesa prompt, then use the status-check option below.',

        'info'

      )

      setPendingDonationId(null)

      setCheckingPayment(false)

      return

    }

    pollTimerRef.current = setTimeout(() => {

      pollDonation(donationId, attempt + 1, isStopped)

    }, 3000)

  }

  useEffect(() => {

    if (!pendingDonationId) return

    let stopped = false

    setCheckingPayment(true)

    pollDonation(pendingDonationId, 0, () => stopped)

    return () => {

      stopped = true

      stopPolling()

    }

    // Each new pending donation starts a new polling session.

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [pendingDonationId])

  async function handleSubmit(event) {

    event.preventDefault()

    if (loading || pendingDonationId) return

    setStatus('')

    setReceipt(null)

    // Validate custom and preset amounts on the frontend.

    if (

      !Number.isSafeInteger(selectedAmount) ||

      selectedAmount < MIN_AMOUNT ||

      selectedAmount > MAX_AMOUNT

    ) {

      showStatus(

        'Enter a whole donation amount between KES 1 and KES 150,000.',

        'error'

      )

      return

    }

    const normalizedPhone = normalizeKenyanPhone(phone)

    if (!normalizedPhone) {

      showStatus(

        'Enter a valid Kenyan M-Pesa number, such as 0712345678 or 254712345678.',

        'error'

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

        throw new Error(

          'The server did not return a donation ID. Check your backend response.'

        )

      }

      receiptContextRef.current = {

        name: anonymous ? 'Anonymous' : name.trim(),

        phone: normalizedPhone,

      }

      setLastDonationId(donation.id)

      setPendingDonationId(donation.id)

      showStatus(

        'M-Pesa request sent. Check your phone and enter your PIN. Waiting for payment confirmation...',

        'info'

      )

    } catch (error) {

      showStatus(

        error instanceof Error

          ? error.message

          : 'Payment request failed. Please try again.',

        'error'

      )

    } finally {

      setLoading(false)

    }

  }

  function checkPaymentAgain() {

    if (!lastDonationId || pendingDonationId || loading) return

    setPendingDonationId(lastDonationId)

    showStatus('Checking payment status...', 'info')

  }

  function resetForm() {

    stopPolling()

    setPendingDonationId(null)

    setLastDonationId(null)

    setCheckingPayment(false)

    setReceipt(null)

    setStatus('')

    setStatusType('info')

    setAmount(50)

    setCustomAmount('')

    setName('')

    setPhone('')

    setMessage('')

    setAnonymous(false)

    receiptContextRef.current = null

  }

  return (

    <div className="coffee-card rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4">

      {receipt ? (
        <DonationReceipt receipt={receipt} onSupportAgain={resetForm} />
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
            <fieldset disabled={loading || Boolean(pendingDonationId)}>
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
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                    step="1"
                    required
                    value={customAmount}
                    onChange={(event) => {
                      setCustomAmount(event.target.value)
                      setStatus('')
                    }}
                    className={fieldClass}
                    placeholder="Enter amount (1–150,000)"
                    aria-describedby="custom-amount-help"
                  />
                  <span
                    id="custom-amount-help"
                    className="mt-1 block text-[10px] font-normal text-slate-500"
                  >
                    Minimum KSh 1 · Maximum KSh 150,000
                  </span>
                </label>
              )}
            </fieldset>

            <div className="grid gap-2 sm:grid-cols-2">
              <label
                className="text-xs font-semibold text-slate-700"
                htmlFor="supporter-name"
              >
                Your name{' '}
                <span className="font-normal text-slate-400">(optional)</span>
                <input
                  id="supporter-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={80}
                  disabled={anonymous || loading || Boolean(pendingDonationId)}
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
                  maxLength={16}
                  disabled={loading || Boolean(pendingDonationId)}
                  className={fieldClass}
                  placeholder="07XXXXXXXX"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={anonymous}
                disabled={loading || Boolean(pendingDonationId)}
                onChange={(event) => setAnonymous(event.target.checked)}
                className="h-3.5 w-3.5 accent-emerald-700"
              />
              Make my donation anonymous
            </label>

            <label
              className="block text-xs font-semibold text-slate-700"
              htmlFor="support-message"
            >
              Message{' '}
              <span className="font-normal text-slate-400">(optional)</span>
              <textarea
                id="support-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={500}
                rows={2}
                disabled={loading || Boolean(pendingDonationId)}
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
                disabled={loading || Boolean(pendingDonationId)}
                className="mt-2 flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading || pendingDonationId ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Coffee size={15} />
                )}
                {loading
                  ? 'Starting M-Pesa request...'
                  : pendingDonationId
                    ? 'Waiting for payment...'
                    : 'Support with M-Pesa'}
              </button>
            </div>

            {status && (
              <div
                role={statusType === 'error' ? 'alert' : 'status'}
                aria-live="polite"
                className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs leading-5 ${
                  statusType === 'error'
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : statusType === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-sky-100 bg-sky-50 text-sky-800'
                }`}
              >
                {statusType === 'error' ? (
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                ) : statusType === 'success' ? (
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                ) : (
                  <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                )}
                <span>{status}</span>
              </div>
            )}

            {lastDonationId && !pendingDonationId && !receipt && (
              <button
                type="button"
                onClick={checkPaymentAgain}
                disabled={loading || checkingPayment}
                className="flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-60"
              >
                {checkingPayment ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} />
                )}
                Check payment status again
              </button>
            )}

            {pendingDonationId && (
              <button
                type="button"
                onClick={() => {
                  stopPolling()
                  setPendingDonationId(null)
                  setCheckingPayment(false)
                  showStatus(
                    'Automatic checking stopped. Your payment may still be processing. You can check the status again shortly.',
                    'info'
                  )
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Stop automatic checking
              </button>
            )}

            <p className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck size={13} />
              Your M-Pesa PIN is entered only on your phone.
            </p>
          </form>
        </>
      )}

    </div>

  )

}