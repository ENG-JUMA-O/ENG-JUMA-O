
const donations = [
  {
    name: 'John Mwangi',
    amount: 500,
    message: 'Keep building amazing projects!',
  },
  {
    name: 'Sarah Wanjiku',
    amount: 200,
    message: 'I love what you are doing. Keep it up!',
  },
  {
    name: 'David Otieno',
    amount: 1000,
    message: 'Wishing you success!',
  },
  {
    name: 'Anonymous',
    amount: 100,
    message: 'Happy to support your work!',
  },
  {
    name: 'Grace Akinyi',
    amount: 300,
    message: 'Keep creating amazing software.',
  },
];

export default function DonationTicker() {
  // Duplicate entries to create a seamless scrolling loop.
  const scrollingDonations = [...donations, ...donations];

  return (
    <div className="fixed bottom-0 left-0 z-[9000] w-full overflow-hidden border-t border-white/10 bg-[#111713]/95 py-3 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center">

        {/* Ticker label */}
        <div className="z-10 flex shrink-0 items-center gap-2 border-r border-white/10 bg-[#111713] px-4">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          <span className="whitespace-nowrap text-xs font-bold text-white">
            RECENT SUPPORT
          </span>
        </div>

        {/* Scrolling content */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="donation-marquee flex w-max items-center">
            {scrollingDonations.map((donation, index) => (
              <div
                key={`${donation.name}-${index}`}
                className="flex shrink-0 items-center gap-3 px-8"
              >
                <span className="text-lg">☕</span>

                <span className="whitespace-nowrap text-xs font-semibold text-white">
                  {donation.name}
                </span>

                <span className="whitespace-nowrap text-xs font-bold text-green-400">
                  KES {donation.amount.toLocaleString('en-KE')}
                </span>

                <span className="hidden whitespace-nowrap text-xs text-gray-400 sm:inline">
                  "{donation.message}"
                </span>

                <span className="rounded bg-blue-400/10 px-2 py-1 text-[9px] font-bold text-blue-300">
                  DEMO
                </span>

                <span className="ml-3 text-gray-600">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .donation-marquee {
          animation: donation-scroll 45s linear infinite;
        }

        .donation-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes donation-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .donation-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
