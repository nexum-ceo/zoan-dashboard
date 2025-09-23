import { SVGProps } from 'react';

export default function ChevronRightDuo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      {...props}
    >
      <path
        d="M4.66602 1.3335L7.33268 4.00016L4.66602 6.66683M0.666016 1.3335L3.33268 4.00016L0.666016 6.66683"
        stroke="#272727"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
