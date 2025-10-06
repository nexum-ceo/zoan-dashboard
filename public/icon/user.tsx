import { SVGProps } from 'react';

export default function User(props: SVGProps<SVGSVGElement>) {
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
        d="M13.3337 14C13.3337 12.1591 10.9458 10.6667 8.00033 10.6667C5.05481 10.6667 2.66699 12.1591 2.66699 14M8.00033 8.66667C6.15938 8.66667 4.66699 7.17428 4.66699 5.33333C4.66699 3.49238 6.15938 2 8.00033 2C9.84127 2 11.3337 3.49238 11.3337 5.33333C11.3337 7.17428 9.84127 8.66667 8.00033 8.66667Z"
        stroke="#272727"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
