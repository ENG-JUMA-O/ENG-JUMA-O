import { CheckCircle2, Coffee, Download, Printer, ShieldCheck } from 'lucide-react'
import { jsPDF } from 'jspdf'

const money = (value) =>
  Number(value || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

function formatDate(value) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return date.toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function safePdfText(value) {
  return String(value ?? '').replace(/[^\x20-\x7E]/g, (character) => {
    const replacements = { '–': '-', '—': '-', '’': "'", '“': '"', '”': '"' }
    return replacements[character] || ''
  })
}

function downloadReceiptPdf(receipt) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 18
  const contentWidth = pageWidth - margin * 2
  const green = [5, 110, 75]
  const dark = [20, 35, 32]
  const muted = [102, 119, 113]
  const pale = [240, 250, 245]

  // Header band
  doc.setFillColor(...green)
  doc.roundedRect(margin, 16, contentWidth, 36, 4, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('COFFEE SUPPORT', margin + 8, 26)
  doc.setFontSize(20)
  doc.text('Payment receipt', margin + 8, 36)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Thank you for supporting independent development.', margin + 8, 44)

  // Verified status
  doc.setFillColor(...pale)
  doc.roundedRect(margin, 60, contentWidth, 24, 3, 3, 'F')
  doc.setTextColor(...green)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('PAYMENT STATUS', margin + 7, 69)
  doc.setFontSize(13)
  doc.text('SUCCESSFUL / VERIFIED', margin + 7, 77)
  doc.setTextColor(...dark)
  doc.setFontSize(9)
  doc.text('Amount received', pageWidth - margin - 7, 69, { align: 'right' })
  doc.setFontSize(18)
  doc.text(`KES ${money(receipt.amount)}`, pageWidth - margin - 7, 78, { align: 'right' })

  // Details
  let y = 98
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...dark)
  doc.text('Transaction details', margin, y)
  y += 8
  doc.setDrawColor(219, 231, 225)
  doc.line(margin, y, pageWidth - margin, y)
  y += 7

  const rows = [
    ['Supporter', receipt.supporter || 'Supporter'],
    ['M-Pesa phone number', receipt.phone || 'Not provided'],
    ['M-Pesa receipt / reference', receipt.receiptNumber || 'Receipt pending'],
    ['Date and time', formatDate(receipt.date)],
  ]
  if (receipt.message) rows.push(['Supporter message', receipt.message])

  doc.setFontSize(10)
  rows.forEach(([label, value], index) => {
    const valueLines = doc.splitTextToSize(safePdfText(value), contentWidth - 66)
    const rowHeight = Math.max(12, valueLines.length * 5 + 5)
    if (index % 2 === 0) {
      doc.setFillColor(248, 251, 249)
      doc.roundedRect(margin, y - 4, contentWidth, rowHeight, 2, 2, 'F')
    }
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...muted)
    doc.text(safePdfText(label), margin + 5, y + 2)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...dark)
    doc.text(valueLines, margin + 62, y + 2)
    y += rowHeight
  })

  y += 9
  doc.setDrawColor(219, 231, 225)
  doc.line(margin, y, pageWidth - margin, y)
  y += 9
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...green)
  doc.text('Thank you for your support!', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...muted)
  doc.text('Keep this receipt for your personal records.', margin, y)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(135, 148, 142)
  doc.text('This receipt reflects the payment status reported by the payment system.', margin, 280)
  doc.text('Coffee Support', pageWidth - margin, 287, { align: 'right' })

  const reference = safePdfText(receipt.receiptNumber || 'receipt').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 32)
  doc.save(`coffee-support-receipt-${reference || 'download'}.pdf`)
}

export default function DonationReceipt({ receipt, onSupportAgain }) {
  if (!receipt) return null

  return (
    <section className="receipt-content mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-lg shadow-emerald-950/5">
      <div className="no-print relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 px-5 py-7 text-center text-white sm:px-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border-[20px] border-white/10" />
        <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-white/10 shadow-inner">
          <CheckCircle2 size={29} strokeWidth={2.2} />
        </div>
        <p className="relative mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-100">
          Payment confirmed
        </p>
        <h2 className="relative mt-2 text-2xl font-black tracking-tight sm:text-3xl">
          Thank you for the coffee!
        </h2>
        <p className="relative mx-auto mt-2 max-w-sm text-sm leading-6 text-emerald-50/90">
          Your support makes a real difference. Your payment has been confirmed by the server.
        </p>
      </div>

      <div className="receipt-paper p-4 sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-dashed border-emerald-200 pb-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">
              Official support record
            </p>
            <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
              Donation receipt
            </h3>
            <p className="mt-1 text-xs text-slate-500">Independent developer support</p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <Coffee size={25} />
          </div>
        </div>

        <div className="my-5 rounded-2xl bg-emerald-50/80 px-4 py-5 text-center ring-1 ring-inset ring-emerald-100">
          <p className="text-xs font-semibold text-emerald-800/70">Amount received</p>
          <p className="mt-1 text-4xl font-black tracking-tight text-slate-950">
            <span className="mr-1 text-base font-bold text-emerald-800">KES</span>
            {money(receipt.amount)}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[11px] font-bold text-emerald-800 shadow-sm">
            <ShieldCheck size={14} />
            Verified payment
          </span>
        </div>

        <dl className="space-y-0 text-sm">
          <ReceiptRow label="Supporter" value={receipt.supporter || 'Supporter'} />
          <ReceiptRow label="M-Pesa number" value={receipt.phone || 'Not provided'} />
          <ReceiptRow label="Receipt / reference" value={receipt.receiptNumber || 'Receipt pending'} breakAll />
          <ReceiptRow label="Date and time" value={formatDate(receipt.date)} />
          {receipt.message && (
            <div className="border-b border-slate-100 py-3">
              <dt className="mb-1 text-xs font-medium text-slate-500">Your message</dt>
              <dd className="whitespace-pre-wrap break-words text-sm font-medium leading-6 text-slate-800">
                {receipt.message}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-700" />
          <p className="text-[11px] leading-5 text-slate-500">
            Keep this receipt for your records. It confirms the payment details available to this website.
          </p>
        </div>

        <p className="mt-5 text-center text-[10px] font-medium tracking-wide text-slate-400">
          THANK YOU FOR SUPPORTING INDEPENDENT DEVELOPMENT
        </p>
      </div>

      <div className="no-print flex flex-col gap-2 border-t border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:p-5">
        <button
          type="button"
          onClick={() => downloadReceiptPdf(receipt)}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <Download size={17} />
          Download PDF
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <Printer size={17} />
          Print receipt
        </button>
        <button
          type="button"
          onClick={onSupportAgain}
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:flex-1"
        >
          Support again
        </button>
      </div>
    </section>
  )
}

function ReceiptRow({ label, value, breakAll = false }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
      <dt className="shrink-0 text-xs font-medium text-slate-500">{label}</dt>
      <dd
        className={`text-sm font-semibold text-slate-800 sm:max-w-[65%] sm:text-right ${
          breakAll ? 'break-all' : 'break-words'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}