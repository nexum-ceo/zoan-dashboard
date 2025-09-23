import { SVGProps } from 'react';

export default function Install(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      {...props}
    >
      <path
        d="M2.5 8.75H7.5M5 1.25V7.08333M5 7.08333L7.08333 5M5 7.08333L2.91667 5"
        stroke="#272727"
        strokeOpacity="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
