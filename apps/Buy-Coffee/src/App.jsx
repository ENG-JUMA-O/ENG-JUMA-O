import { useState } from 'react';
import Contact from './pages/Contact';
import SystemMessage from './components/ui/SystemMessage';
import ReceiptModal from './components/ui/ReceiptModal';
import DonationTicker from './components/ui/DonationTicker';

function App() {
  const [message, setMessage] = useState(null);
  const [receipt, setReceipt] = useState(null);

  return (
    <>
      <Contact
        onMessage={setMessage}
        onReceipt={setReceipt}
      />

      <DonationTicker />

      {message && (
        <div className="fixed top-5 right-5 z-[9999] w-[calc(100%-2.5rem)] max-w-md">
          <SystemMessage
            type={message.type}
            title={message.title}
            message={message.message}
            onClose={() => setMessage(null)}
          />
        </div>
      )}

      {receipt && (
        <ReceiptModal
          receipt={receipt}
          onClose={() => setReceipt(null)}
        />
      )}
    </>
  );
}

export default App;