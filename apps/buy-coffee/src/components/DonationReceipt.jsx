
import { CheckCircle2, Download, Printer, ShieldCheck } from 'lucide-react'
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
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Africa/Nairobi',
  }) + ' EAT'
}

function safePdfText(value) {
  return String(value ?? '')
    .replace(/[^\x20-\x7E]/g, (character) => {
      const replacements = {
        '–': '-',
        '—': '-',
        '’': "'",
        '“': '"',
        '”': '"',
        '•': '-',
        '✓': ' ',
      }
      return replacements[character] || ''
    })
}

function downloadReceiptPdf(receipt) {
  // Compact receipt matching the supplied A6 sample.
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a6',
    orientation: 'portrait',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10
  const contentWidth = pageWidth - margin * 2
  const green = [22, 139, 87]
  const black = [17, 17, 17]
  const grey = [85, 85, 85]
  const lightGreen = [233, 245, 238]
  const lineColor = [215, 215, 215]

  let y = 11

  // Header: coloured brand, all other text black.
  doc.setTextColor(...green)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('COFFEE SUPPORT', pageWidth / 2, y, { align: 'center' })

  y += 6
  doc.setTextColor(...black)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('PAYMENT RECEIPT  -  VERIFIED', pageWidth / 2, y, {
    align: 'center',
  })

  y += 5
  doc.setFontSize(7.5)
  doc.text(
    'Thank you for supporting independent development.',
    pageWidth / 2,
    y,
    { align: 'center' },
  )

  // Payment status.
  y += 7
  doc.setFillColor(...lightGreen)
  doc.setDrawColor(...green)
  doc.roundedRect(margin, y, contentWidth, 15, 1.5, 1.5, 'FD')

  doc.setTextColor(...black)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('PAYMENT STATUS', margin + 4, y + 5)

  doc.setFontSize(9)
  doc.text('SUCCESSFUL / VERIFIED', margin + 4, y + 11)

  y += 22
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('AMOUNT RECEIVED', pageWidth / 2, y, { align: 'center' })

  y += 7
  doc.setFontSize(16)
  doc.text(`KES ${money(receipt.amount)}`, pageWidth / 2, y, {
    align: 'center',
  })

  // Transaction details.
  y += 7
  doc.setDrawColor(...lineColor)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...black)
  doc.text('TRANSACTION DETAILS', margin, y)

  y += 5

  const rows = [
    ['Supporter', receipt.supporter || 'Coffee Supporter'],
    ['M-Pesa phone', receipt.phone || '07XX XXX XXX'],
    ['Receipt / reference', receipt.receiptNumber || 'Receipt pending'],
    ['Date and time', formatDate(receipt.date)],
  ]

  if (receipt.message) {
    rows.push(['Supporter message', receipt.message])
  }

  const labelWidth = 29
  const valueWidth = contentWidth - labelWidth - 2
  const lineHeight = 3.6

  doc.setFontSize(7.5)

  rows.forEach(([label, value], index) => {
    const labelText = safePdfText(label)
    const valueText = safePdfText(value)
    const valueLines = doc.splitTextToSize(valueText, valueWidth)
    const rowHeight = Math.max(6, valueLines.length * lineHeight + 2)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...black)
    doc.text(labelText, margin, y + 3)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...black)
    doc.text(valueLines, margin + labelWidth, y + 3)

    y += rowHeight

    if (index < rows.length - 1) {
      doc.setDrawColor(230, 230, 230)
      doc.line(margin, y, pageWidth - margin, y)
    }
  })

  // Keep the footer within the A6 page even if the message is long.
  const footerHeight = 22
  if (y > pageHeight - footerHeight - 5) {
    doc.addPage('a6', 'portrait')
    y = 12
  } else {
    y += 4
  }

  doc.setDrawColor(...lineColor)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...black)
  doc.text('Thank you for your support!', pageWidth / 2, y, {
    align: 'center',
  })

  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...black)

  const note =
    'Keep this receipt for your personal records. This receipt reflects the payment status reported by the payment system.'
  const noteLines = doc.splitTextToSize(note, contentWidth)

  doc.text(noteLines, pageWidth / 2, y, { align: 'center' })
  y += noteLines.length * 3 + 3

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6)
  doc.text(
    'COFFEE SUPPORT - PAYMENT RECEIPT',
    pageWidth / 2,
    Math.min(y, pageHeight - 5),
    { align: 'center' },
  )

  const reference = safePdfText(
    receipt.receiptNumber || 'receipt',
  )
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 32)

  doc.save(`coffee-support-receipt-${reference || 'download'}.pdf`)
}

export default function DonationReceipt({ receipt, onSupportAgain }) {
  if (!receipt) return null

  return (
    <section className="receipt-content mx-auto w-full max-w-sm overflow-hidden border border-gray-200 bg-white text-black shadow-sm">
      <div className="no-print border-b border-gray-200 px-5 py-5 text-center">
        <CheckCircle2
          size={30}
          className="mx-auto text-emerald-700"
        />

        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-black">
          Payment confirmed
        </p>

        <h2 className="mt-1 text-xl font-bold text-black">
          Thank you for the coffee!
        </h2>

        <p className="mt-1 text-xs text-black">
          Your payment has been confirmed by the server.
        </p>
      </div>

      <div className="receipt-paper p-5">
        <div className="border-b border-gray-300 pb-3 text-center">
          <h3 className="text-lg font-bold tracking-wide text-emerald-700">
            COFFEE SUPPORT
          </h3>

          <p className="mt-1 text-xs font-semibold text-black">
            PAYMENT RECEIPT - VERIFIED
          </p>

          <p className="mt-1 text-[11px] text-black">
            Thank you for supporting independent development.
          </p>
        </div>

        <div className="my-4 border border-emerald-700 bg-emerald-50 p-3">
          <p className="text-xs font-bold text-black">
            PAYMENT STATUS
          </p>

          <p className="mt-1 text-sm font-bold text-black">
            SUCCESSFUL / VERIFIED
          </p>
        </div>

        <div className="py-2 text-center">
          <p className="text-xs font-bold text-black">
            AMOUNT RECEIVED
          </p>

          <p className="mt-1 text-2xl font-bold text-black">
            KES {money(receipt.amount)}
          </p>
        </div>

        <div className="mt-3 border-t border-gray-300 pt-3">
          <h4 className="mb-2 text-sm font-bold uppercase text-black">
            Transaction details
          </h4>

          <dl className="text-xs">
            <ReceiptRow
              label="Supporter"
              value={receipt.supporter || 'Coffee Supporter'}
            />

            <ReceiptRow
              label="M-Pesa phone"
              value={receipt.phone || '07XX XXX XXX'}
            />

            <ReceiptRow
              label="Receipt / reference"
              value={receipt.receiptNumber || 'Receipt pending'}
              breakAll
            />

            <ReceiptRow
              label="Date and time"
              value={formatDate(receipt.date)}
            />

            {receipt.message && (
              <ReceiptRow
                label="Supporter message"
                value={receipt.message}
              />
            )}
          </dl>
        </div>

        <div className="mt-4 border-t border-gray-300 pt-3 text-center">
          <p className="text-xs font-bold text-black">
            Thank you for your support!
          </p>

          <p className="mt-2 text-[10px] leading-4 text-black">
            Keep this receipt for your personal records. It reflects
            the payment status reported by the payment system.
          </p>

          <p className="mt-3 text-[9px] font-bold tracking-wide text-black">
            COFFEE SUPPORT - PAYMENT RECEIPT
          </p>
        </div>
      </div>

      <div className="no-print flex flex-col gap-2 border-t border-gray-200 bg-white p-4 sm:flex-row">
        <button
          type="button"
          onClick={() => downloadReceiptPdf(receipt)}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded border border-emerald-700 bg-emerald-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <Download size={16} />
          Download PDF
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-black transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <Printer size={16} />
          Print receipt
        </button>

        <button
          type="button"
          onClick={onSupportAgain}
          className="min-h-10 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-black transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
        >
          Support again
        </button>
      </div>
    </section>
  )
}

function ReceiptRow({ label, value, breakAll = false }) {
  return (
    <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-2 border-b border-gray-200 py-2">
      <dt className="font-bold text-black">
        {label}
      </dt>

      <dd
        className={`text-right text-black ${
          breakAll ? 'break-all' : 'break-words'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
