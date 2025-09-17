import { SVGProps } from 'react';

export default function BotMessageSquare(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <g clip-path="url(#clip0_2_4287)">
        <path
          d="M8.00065 3.99992V1.33325H5.33398M1.33398 7.99992H2.66732M6.00065 7.33325V8.66659M10.0007 7.33325V8.66659M13.334 7.99992H14.6673M5.33398 11.9999L2.66732 14.6666V5.33325C2.66732 4.97963 2.80779 4.64049 3.05784 4.39044C3.30789 4.14039 3.64703 3.99992 4.00065 3.99992H12.0007C12.3543 3.99992 12.6934 4.14039 12.9435 4.39044C13.1935 4.64049 13.334 4.97963 13.334 5.33325V10.6666C13.334 11.0202 13.1935 11.3593 12.9435 11.6094C12.6934 11.8594 12.3543 11.9999 12.0007 11.9999H5.33398Z"
          stroke="#272727"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2_4287">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
