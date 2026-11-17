
import React, { useState } from 'react';
import Loader from '../ui/Loader';

const ProjectForm = ({ onReceipt, onMessage }) => {
  const [step, setStep] = useState(1);

  const [amount, setAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const amounts = [100, 200, 500, 1000];

  const selectedAmount = useCustomAmount
    ? Number(customAmount)
    : amount;

  const inputClass =
    'h-9 w-full rounded-md border border-[#343a36] bg-[#10110f] px-2.5 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-blue-400';

  const labelClass = 'text-[11px] font-medium text-gray-300';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      // Simulate STK Push processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const timestamp = Date.now();

      const receipt = {
        receiptNumber: `SIM-NIT-${timestamp}`,
        amount: selectedAmount,
        phone,
        name: anonymous ? null : name,
        anonymous,
        message,
        paymentMethod: 'M-Pesa (Simulation)',
        status: 'SUCCESS',
        date: new Date().toISOString(),
        transactionId: `TEST-${timestamp}`,
      };

      // Open receipt popup
      onReceipt?.(receipt);

      // Keep existing notification functionality
      onMessage?.({
        type: 'success',
        title: 'Payment simulated successfully',
        message: 'Your test receipt is ready.',
      });
    } catch (error) {
      console.error('Simulation failed:', error);

      onMessage?.({
        type: 'error',
        title: 'Simulation failed',
        message: 'Something went wrong while processing the test payment.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-5">
        <Loader
          size={24}
          color="#60a5fa"
          text="Sending simulated STK Push..."
        />

        <p className="text-center text-[10px] text-gray-500">
          Simulating M-Pesa payment. Please wait...
        </p>
      </div>
    );
  }

  return (
    <form
      id="project-form"
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4"
    >
      <div>
        <h2 className="text-base font-semibold text-white">
          Buy me a coffee ☕
        </h2>
        <p className="mt-1 text-[11px] text-gray-500">
          Your support helps me keep building.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#292d29]">
          <div
            className={`h-full rounded-full bg-blue-400 transition-all ${
              step === 1 ? 'w-1/2' : 'w-full'
            }`}
          />
        </div>

        <span className="text-[10px] text-gray-500">
          Step {step} of 2
        </span>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              Choose amount (KES)
            </label>

            <div className="grid grid-cols-4 gap-2">
              {amounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAmount(value);
                    setUseCustomAmount(false);
                  }}
                  className={`rounded-md border px-1 py-2 text-[10px] font-semibold transition ${
                    !useCustomAmount && amount === value
                      ? 'border-blue-400 bg-blue-400/10 text-blue-300'
                      : 'border-[#343a36] bg-[#10110f] text-gray-400 hover:border-blue-400'
                  }`}
                >
                  {value.toLocaleString()}
                </button>
              ))}
            </div>

            <label
              htmlFor="customAmount"
              className="text-[10px] text-gray-400"
            >
              Custom amount
            </label>

            <input
              id="customAmount"
              type="number"
              min="1"
              step="1"
              value={customAmount}
              onFocus={() => setUseCustomAmount(true)}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setUseCustomAmount(true);
              }}
              placeholder="Enter amount in KSh"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className={labelClass}>
              M-Pesa phone number
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX"
              required
              className={inputClass}
            />

            <p className="text-[9px] text-gray-500">
              Simulated payment prompt will be sent to this number.
            </p>
          </div>

          <button
            type="button"
            disabled={
              !Number.isFinite(selectedAmount) ||
              selectedAmount <= 0 ||
              !Number.isInteger(selectedAmount) ||
              !phone.trim()
            }
            onClick={() => setStep(2)}
            className="w-full rounded-md bg-blue-400 px-4 py-2.5 text-xs font-bold text-[#08111e] transition hover:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue →
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-md border border-[#343a36] bg-[#10110f] px-3 py-2">
            <span className="text-[10px] text-gray-400">
              Donation amount
            </span>

            <span className="text-sm font-semibold text-blue-300">
              KSh {selectedAmount.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className={labelClass}>
              Your name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={anonymous}
              required={!anonymous}
              className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-40`}
            />
          </div>

          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="h-3.5 w-3.5 accent-blue-400"
              />

              <span className="text-[11px] text-gray-300">
                Donate anonymously
              </span>
            </label>

            <p className="ml-5 mt-1 text-[9px] text-gray-500">
              Your name will not appear publicly.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className={labelClass}>
              Leave a message (Optional)
            </label>

            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Write something nice..."
              className="w-full resize-y rounded-md border border-[#343a36] bg-[#10110f] px-2.5 py-2 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-blue-400"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-md border border-[#343a36] px-4 py-2.5 text-xs font-medium text-gray-300 transition hover:border-gray-500"
            >
              ← Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-blue-400 px-4 py-2.5 text-xs font-bold text-[#08111e] transition hover:bg-blue-300 disabled:opacity-50"
            >
              Send ☕
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-[9px] text-gray-500">
        Development simulation — no real payment will be made.
      </p>
    </form>
  );
};

export default ProjectForm;
