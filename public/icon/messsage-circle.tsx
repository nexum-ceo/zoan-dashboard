import { SVGProps } from 'react';

export default function MesssageCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <path
        d="M5.26671 13.3333C6.53909 13.986 8.00276 14.1628 9.39397 13.8318C10.7852 13.5009 12.0124 12.6839 12.8545 11.5281C13.6967 10.3723 14.0983 8.9538 13.9871 7.5281C13.8759 6.1024 13.2591 4.7633 12.2479 3.75212C11.2367 2.74093 9.89763 2.12416 8.47193 2.01293C7.04623 1.90171 5.62769 2.30335 4.47192 3.14549C3.31615 3.98762 2.49917 5.21486 2.16819 6.60607C1.83721 7.99727 2.014 9.46094 2.66671 10.7333L1.33337 14.6667L5.26671 13.3333Z"
        stroke="#272727"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
