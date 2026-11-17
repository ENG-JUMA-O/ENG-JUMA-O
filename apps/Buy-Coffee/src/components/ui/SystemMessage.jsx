import React from 'react';
import styled from 'styled-components';

const SystemMessage = ({
  type = 'success',
  title,
  message,
  onClose,
}) => {
  const icons = {
    success: (
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    ),
    error: (
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    ),
    warning: (
      <path d="M12 2 1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z" />
    ),
    info: (
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    ),
  };

  const defaults = {
    success: {
      title: 'Transaction successful',
      message: 'Your payment has been processed successfully.',
    },
    error: {
      title: 'Transaction failed',
      message: 'Something went wrong. Please try again.',
    },
    warning: {
      title: 'Warning',
      message: 'Please check the information and try again.',
    },
    info: {
      title: 'Information',
      message: 'Here is something you should know.',
    },
  };

  const current = defaults[type] || defaults.info;

  return (
    <StyledWrapper $type={type}>
      <div className="card" role={type === 'error' ? 'alert' : 'status'}>
        <svg className="wave" viewBox="0 0 1440 320">
          <path d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L0,320Z" />
        </svg>

        <div className="icon-container">
          <svg viewBox="0 0 24 24" className="icon">
            {icons[type] || icons.info}
          </svg>
        </div>

        <div className="message-text-container">
          <p className="message-text">{title || current.title}</p>
          <p className="sub-text">{message || current.message}</p>
        </div>

        {onClose && (
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Dismiss notification"
          >
            <svg viewBox="0 0 24 24" className="cross-icon">
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;

  .card {
    --accent: #2563eb;
    --soft: #dbeafe;

    ${({ $type }) => {
      const colors = {
        success: ['#2563eb', '#dbeafe'],
        error: ['#dc2626', '#fee2e2'],
        warning: ['#d97706', '#fef3c7'],
        info: ['#0284c7', '#e0f2fe'],
      };

      const [accent, soft] = colors[$type] || colors.info;

      return `
        --accent: ${accent};
        --soft: ${soft};
      `;
    }}

    min-height: 80px;
    width: 100%;
    box-sizing: border-box;
    padding: 12px 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.07);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .wave {
    position: absolute;
    transform: rotate(90deg);
    left: -31px;
    top: 32px;
    width: 80px;
    fill: var(--soft);
    opacity: 0.8;
  }

  .icon-container {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--soft);
    border-radius: 50%;
    z-index: 1;
  }

  .icon {
    width: 19px;
    height: 19px;
    fill: var(--accent);
  }

  .message-text-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-grow: 1;
    min-width: 0;
    z-index: 1;
  }

  .message-text,
  .sub-text {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .message-text {
    color: #1e293b;
    font-size: 14px;
    font-weight: 700;
  }

  .sub-text {
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
  }

  .close-button {
    border: none;
    background: transparent;
    padding: 5px;
    display: flex;
    cursor: pointer;
    color: #94a3b8;
    border-radius: 6px;
    flex-shrink: 0;
    z-index: 1;
  }

  .close-button:hover {
    background: #f1f5f9;
    color: #334155;
  }

  .cross-icon {
    width: 17px;
    height: 17px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }
`;

export default SystemMessage;
