import { SVGProps } from 'react';

export default function GamePad(props: SVGProps<SVGSVGElement>) {
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
        d="M4.00065 8H6.66732M5.33398 6.66667V9.33333M10.0007 8.66667H10.0073M12.0007 7.33333H12.0073M2.66732 4H13.334C14.0704 4 14.6673 4.59695 14.6673 5.33333V10.6667C14.6673 11.403 14.0704 12 13.334 12H2.66732C1.93094 12 1.33398 11.403 1.33398 10.6667V5.33333C1.33398 4.59695 1.93094 4 2.66732 4Z"
        stroke="#199E78"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
