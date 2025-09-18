import { SVGProps } from 'react';

export default function Copy(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      {...props}
    >
      <path
        d="M2 8C1.45 8 1 7.55 1 7V2C1 1.45 1.45 1 2 1H7C7.55 1 8 1.45 8 2M5 4H10C10.5523 4 11 4.44772 11 5V10C11 10.5523 10.5523 11 10 11H5C4.44772 11 4 10.5523 4 10V5C4 4.44772 4.44772 4 5 4Z"
        stroke="#272727"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
