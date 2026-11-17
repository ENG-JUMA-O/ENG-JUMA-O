
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const ReceiptModal = ({ receipt, onClose }) => {
  const [qrCode, setQrCode] = useState('');

  const formattedDate = receipt?.date
    ? new Date(receipt.date).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  const formattedTime = receipt?.date
    ? new Date(receipt.date).toLocaleTimeString('en-KE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : new Date().toLocaleTimeString();

  const formattedAmount = Number(receipt?.amount || 0).toLocaleString(
    'en-KE',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  useEffect(() => {
    if (!receipt) return;

    const receiptData = JSON.stringify({
      receiptNumber: receipt.receiptNumber,
      amount: receipt.amount,
      phone: receipt.phone,
      paymentMethod: receipt.paymentMethod,
      status: receipt.status,
      date: receipt.date,
      transactionId: receipt.transactionId,
    });

    QRCode.toDataURL(receiptData, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#eeeeee',
      },
    })
      .then(setQrCode)
      .catch(console.error);
  }, [receipt]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const downloadPDF = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 220],
    });

    const center = 40;
    let y = 18;

    pdf.setFillColor(238, 238, 238);
    pdf.rect(0, 0, 80, 220, 'F');

    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');

    // Business heading
    pdf.setFontSize(10);
    pdf.text('KENYA', center, y, { align: 'center' });
    y += 6;

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DOUGLAS OROKO', center, y, { align: 'center' });
    y += 7;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('BUY ME A COFFEE', center, y, { align: 'center' });
    y += 10;

    pdf.text(
      `${formattedDate}  ${formattedTime}`,
      center,
      y,
      { align: 'center' }
    );

    y += 12;

    // Separator
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineDashPattern([2, 2], 0);
    pdf.line(7, y, 73, y);
    pdf.setLineDashPattern([], 0);
    y += 12;

    // Item
    pdf.setFontSize(10);
    pdf.text('DESCRIPTION', 8, y);
    pdf.text('AMOUNT', 72, y, { align: 'right' });
    y += 8;

    pdf.setFontSize(9);
    pdf.text('Coffee support x 1', 8, y);
    pdf.text(`KES ${formattedAmount}`, 72, y, {
      align: 'right',
    });

    y += 12;

    pdf.setDrawColor(150, 150, 150);
    pdf.setLineDashPattern([2, 2], 0);
    pdf.line(7, y, 73, y);
    pdf.setLineDashPattern([], 0);
    y += 12;

    // Total
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('TOTAL:', 8, y);
    pdf.text(`KES ${formattedAmount}`, 72, y, {
      align: 'right',
    });

    y += 14;

    // Payment details
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    const details = [
      ['Payment:', 'M-PESA'],
      ['Phone:', receipt.phone || 'N/A'],
      ['Response:', receipt.status || 'N/A'],
      ['Receipt:', receipt.receiptNumber || 'N/A'],
      ['Transaction:', receipt.transactionId || 'N/A'],
    ];

    details.forEach(([label, value]) => {
      pdf.text(label, 8, y);
      pdf.text(String(value), 72, y, {
        align: 'right',
        maxWidth: 42,
      });
      y += 8;
    });

    y += 4;

    pdf.setDrawColor(150, 150, 150);
    pdf.setLineDashPattern([2, 2], 0);
    pdf.line(7, y, 73, y);
    pdf.setLineDashPattern([], 0);
    y += 12;

    // Footer message
    pdf.setFontSize(9);
    pdf.text(
      'Thank you for supporting my work!',
      center,
      y,
      { align: 'center' }
    );

    y += 12;

    if (qrCode) {
      pdf.addImage(qrCode, 'PNG', 25, y, 30, 30);
      y += 36;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(180, 30, 30);

    pdf.text('TEST RECEIPT - NOT A REAL PAYMENT', center, y, {
      align: 'center',
    });

    pdf.save(`receipt-${receipt.receiptNumber}.pdf`);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/80 px-3 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative my-auto w-full max-w-[430px]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close receipt"
          className="absolute -right-2 -top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:bg-gray-200"
        >
          ×
        </button>

        {/* Receipt paper */}
        <div
          id="receipt-print-area"
          className="receipt-paper relative overflow-hidden bg-[#ededed] px-7 pb-10 pt-12 text-black shadow-[0_15px_60px_rgba(0,0,0,0.4)] sm:px-10"
        >
          {/* Header */}
          <div className="text-center">
            <p className="text-xs tracking-wide text-black">
              KENYA
            </p>

            <div className="mx-auto mt-5 w-full max-w-[310px] border-[3px] border-black p-1.5">
              <div className="border border-black px-2 py-4">
                <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
                  DOUGLAS OROKO
                </h2>
              </div>
            </div>

            <p className="mt-3 text-sm font-semibold tracking-widest">
              BUY ME A COFFEE
            </p>

            <p className="mt-3 text-sm">
              {formattedDate} &nbsp; {formattedTime}
            </p>
          </div>

          {/* Separator */}
          <div className="my-8 border-t-2 border-dashed border-gray-400" />

          {/* Items */}
          <div className="space-y-5">
            <div className="grid grid-cols-[1fr_auto] gap-3 text-sm font-semibold">
              <span>DESCRIPTION</span>
              <span>AMOUNT</span>
            </div>

            <div className="grid grid-cols-[1fr_auto] items-start gap-3 text-sm">
              <span>Coffee support x 1</span>
              <span className="font-medium">
                KES {formattedAmount}
              </span>
            </div>
          </div>

          {/* Separator */}
          <div className="my-8 border-t-2 border-dashed border-gray-400" />

          {/* Total */}
          <div className="flex items-center justify-between text-base font-black">
            <span>TOTAL:</span>
            <span>KES {formattedAmount}</span>
          </div>

          {/* Payment details */}
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex justify-between gap-3">
              <span>Payment method</span>
              <span className="text-right font-medium">M-PESA</span>
            </div>

            <div className="flex justify-between gap-3">
              <span>Phone number</span>
              <span className="text-right font-medium">
                {receipt.phone}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span>Response</span>
              <span className="text-right font-medium">
                {receipt.status}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span>Receipt No.</span>
              <span className="text-right font-medium">
                {receipt.receiptNumber}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span>Transaction ID</span>
              <span className="max-w-[55%] break-all text-right font-medium">
                {receipt.transactionId}
              </span>
            </div>
          </div>

          {/* Separator */}
          <div className="my-8 border-t-2 border-dashed border-gray-400" />

          {/* Message */}
          <div className="text-center">
            <p className="text-sm leading-relaxed">
              Thank you for your support. Your contribution helps me
              continue building and creating.
            </p>

            {receipt.message && (
              <p className="mt-3 text-xs italic text-gray-700">
                "{receipt.message}"
              </p>
            )}

            {receipt.anonymous === false && receipt.name && (
              <p className="mt-3 text-xs font-semibold">
                Supporter: {receipt.name}
              </p>
            )}
          </div>

          {/* QR code */}
          {qrCode && (
            <div className="mt-6 flex flex-col items-center">
              <img
                src={qrCode}
                alt="Receipt QR code"
                className="h-36 w-36 object-contain"
              />

              <p className="mt-2 text-[10px] text-gray-600">
                SCAN TO VIEW RECEIPT DETAILS
              </p>
            </div>
          )}

          {/* Test warning */}
          <div className="mt-6 border-t border-gray-400 pt-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-red-700">
              Development test receipt
            </p>
            <p className="mt-1 text-[9px] text-gray-600">
              No real M-Pesa payment was made.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={downloadPDF}
            className="flex-1 rounded-lg bg-blue-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            Download PDF
          </button>

          <button
            type="button"
            onClick={printReceipt}
            className="flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"
          >
            Print Receipt
          </button>
        </div>
      </div>

      <style>{`
        .receipt-paper {
          clip-path: polygon(
            0% 1%, 2% 2%, 4% 1%, 6% 2%, 8% 1%,
            10% 2%, 12% 1%, 14% 2%, 16% 1%,
            18% 2%, 20% 1%, 22% 2%, 24% 1%,
            26% 2%, 28% 1%, 30% 2%, 32% 1%,
            34% 2%, 36% 1%, 38% 2%, 40% 1%,
            42% 2%, 44% 1%, 46% 2%, 48% 1%,
            50% 2%, 52% 1%, 54% 2%, 56% 1%,
            58% 2%, 60% 1%, 62% 2%, 64% 1%,
            66% 2%, 68% 1%, 70% 2%, 72% 1%,
            74% 2%, 76% 1%, 78% 2%, 80% 1%,
            82% 2%, 84% 1%, 86% 2%, 88% 1%,
            90% 2%, 92% 1%, 94% 2%, 96% 1%,
            98% 2%, 100% 1%,
            100% 99%,
            98% 100%, 96% 99%, 94% 100%, 92% 99%,
            90% 100%, 88% 99%, 86% 100%, 84% 99%,
            82% 100%, 80% 99%, 78% 100%, 76% 99%,
            74% 100%, 72% 99%, 70% 100%, 68% 99%,
            66% 100%, 64% 99%, 62% 100%, 60% 99%,
            58% 100%, 56% 99%, 54% 100%, 52% 99%,
            50% 100%, 48% 99%, 46% 100%, 44% 99%,
            42% 100%, 40% 99%, 38% 100%, 36% 99%,
            34% 100%, 32% 99%, 30% 100%, 28% 99%,
            26% 100%, 24% 99%, 22% 100%, 20% 99%,
            18% 100%, 16% 99%, 14% 100%, 12% 99%,
            10% 100%, 8% 99%, 6% 100%, 4% 99%,
            2% 100%, 0% 99%
          );
        }

        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body * {
            visibility: hidden !important;
          }

          #receipt-print-area,
          #receipt-print-area * {
            visibility: visible !important;
          }

          #receipt-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            clip-path: none !important;
            padding: 10mm 7mm !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptModal;
