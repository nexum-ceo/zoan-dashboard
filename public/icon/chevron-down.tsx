import { SVGProps } from 'react';

export default function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      {...props}
    >
      <path
        d="M11.0837 5.45825L7.00033 9.54159L2.91699 5.45825"
        stroke="#272727"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
