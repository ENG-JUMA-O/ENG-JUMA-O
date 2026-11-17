
import React from 'react';
import styled from 'styled-components';

const Loader = ({ size = 24, color = '#FFDD00', text }) => {
  return (
    <StyledWrapper $size={size} $color={color}>
      <div className="loader-container">
        <div className="honeycomb">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} />
          ))}
        </div>

        {text && <span className="loader-text">{text}</span>}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .honeycomb {
    height: ${({ $size }) => $size}px;
    width: ${({ $size }) => $size}px;
    position: relative;
  }

  .honeycomb div {
    position: absolute;
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size / 2}px;
    margin-top: ${({ $size }) => $size / 4}px;
    background: ${({ $color }) => $color};
    animation: honeycomb 2.1s infinite backwards;
  }

  .honeycomb div::before,
  .honeycomb div::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    border-left: ${({ $size }) => $size / 2}px solid transparent;
    border-right: ${({ $size }) => $size / 2}px solid transparent;
  }

  .honeycomb div::after {
    top: -${({ $size }) => $size / 4}px;
    border-bottom: ${({ $size }) => $size / 4}px solid ${({ $color }) => $color};
  }

  .honeycomb div::before {
    bottom: -${({ $size }) => $size / 4}px;
    border-top: ${({ $size }) => $size / 4}px solid ${({ $color }) => $color};
  }

  ${[0, 1, 2, 3, 4, 5, 6].map((index) => {
    const positions = [
      [-28, 0], [-14, 22], [14, 22],
      [28, 0], [14, -22], [-14, -22], [0, 0]
    ];

    return `
      .honeycomb div:nth-child(${index + 1}) {
        animation-delay: ${index * 0.1}s;
        left: ${positions[index][0]}px;
        top: ${positions[index][1]}px;
      }
    `;
  })}

  .loader-text {
    font-size: 14px;
    color: #737373;
    font-weight: 500;
  }

  @keyframes honeycomb {
    0%, 20%, 80%, 100% {
      opacity: 0;
      transform: scale(0);
    }

    30%, 70% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .honeycomb div {
      animation: none;
      opacity: 1;
    }
  }
`;

export default Loader;
