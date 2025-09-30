import { SVGProps } from 'react';

export default function PaperClip(props: SVGProps<SVGSVGElement>) {
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
        d="M3.02344 7.64317L7.61963 3.04698C8.98647 1.68014 11.2026 1.68014 12.5694 3.04698C13.9363 4.41381 13.9361 6.63001 12.5693 7.99685L7.26595 13.3001C6.35473 14.2114 4.87759 14.2112 3.96637 13.3C3.05515 12.3888 3.05492 10.9116 3.96615 10.0003L9.26945 4.69704C9.72506 4.24143 10.4641 4.24143 10.9198 4.69704C11.3754 5.15265 11.375 5.89117 10.9194 6.34678L6.32324 10.943"
        stroke="#272727"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
