import React from 'react';

export const IdoLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
    return (
        <svg
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Top Circle with concentric rings */}
            <circle cx="100" cy="40" r="28" stroke="currentColor" strokeWidth="6" />
            <circle cx="100" cy="40" r="20" stroke="currentColor" strokeWidth="6" />
            <circle cx="100" cy="40" r="12" stroke="currentColor" strokeWidth="6" />

            {/* Left vertical bar */}
            <rect x="30" y="90" width="24" height="110" rx="12" fill="currentColor" />

            {/* Right vertical bar */}
            <rect x="146" y="90" width="24" height="110" rx="12" fill="currentColor" />

            {/* Center oval/circle with spiral lines */}
            <circle cx="100" cy="145" r="55" fill="white" stroke="currentColor" strokeWidth="8" />

            {/* Spiral/circular lines inside */}
            <circle cx="100" cy="145" r="42" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="100" cy="145" r="32" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="100" cy="145" r="22" fill="none" stroke="currentColor" strokeWidth="2.5" />

            {/* Bottom right star */}
            <g transform="translate(165, 190)">
                <path
                    d="M 0 -10 L 3 -3 L 10 -2 L 5 3 L 7 10 L 0 6 L -7 10 L -5 3 L -10 -2 L -3 -3 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
};
