import { SVGProps } from 'react';

export default function UserCheck(props: SVGProps<SVGSVGElement>) {
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
        d="M8.75 11.0833C8.75 9.79465 7.183 8.74998 5.25 8.74998C3.317 8.74998 1.75 9.79465 1.75 11.0833M12.25 5.83331L9.91667 8.16665L8.75 6.99998M5.25 6.99998C3.96134 6.99998 2.91667 5.95531 2.91667 4.66665C2.91667 3.37798 3.96134 2.33331 5.25 2.33331C6.53866 2.33331 7.58333 3.37798 7.58333 4.66665C7.58333 5.95531 6.53866 6.99998 5.25 6.99998Z"
        stroke="#199E78"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
