import { SVGProps } from 'react';

export default function EllipsisVertical(props: SVGProps<SVGSVGElement>) {
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
        d="M8.00065 8.66663C8.36884 8.66663 8.66732 8.36815 8.66732 7.99996C8.66732 7.63177 8.36884 7.33329 8.00065 7.33329C7.63246 7.33329 7.33398 7.63177 7.33398 7.99996C7.33398 8.36815 7.63246 8.66663 8.00065 8.66663Z"
        stroke="#272727"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00065 3.99996C8.36884 3.99996 8.66732 3.70148 8.66732 3.33329C8.66732 2.9651 8.36884 2.66663 8.00065 2.66663C7.63246 2.66663 7.33398 2.9651 7.33398 3.33329C7.33398 3.70148 7.63246 3.99996 8.00065 3.99996Z"
        stroke="#272727"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00065 13.3333C8.36884 13.3333 8.66732 13.0348 8.66732 12.6666C8.66732 12.2984 8.36884 12 8.00065 12C7.63246 12 7.33398 12.2984 7.33398 12.6666C7.33398 13.0348 7.63246 13.3333 8.00065 13.3333Z"
        stroke="#272727"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
