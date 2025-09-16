import { SVGProps } from 'react';

export default function AgentAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_2_4309)">
        <rect width="24" height="24" rx="12" fill="white" />
        <circle cx="12" cy="12" r="12" fill="url(#paint0_linear_2_4309)" />
        <g style={{ mixBlendMode: 'overlay' }} filter="url(#filter0_f_2_4309)">
          <path
            d="M-6.59961 16.2039C-6.29961 16.8039 1.50039 8.70394 4.80039 16.2039C7.44039 22.2039 21.9004 23.304 28.8004 23.104"
            stroke="#FFB237"
            strokeWidth="12"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_f_2_4309"
          x="-35.9668"
          y="-17.0007"
          width="88.9414"
          height="70.1262"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="12"
            result="effect1_foregroundBlur_2_4309"
          />
        </filter>
        <linearGradient
          id="paint0_linear_2_4309"
          x1="1.03062e-08"
          y1="3.74015"
          x2="24"
          y2="20.2598"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D76B28" />
          <stop offset="1" stopColor="#EF3D40" />
        </linearGradient>
        <clipPath id="clip0_2_4309">
          <rect width="24" height="24" rx="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
