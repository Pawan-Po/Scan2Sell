import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      aria-label="Scan2Sale Logo"
      {...props}
    >
      <rect width="100" height="100" rx="20" fill="hsl(var(--primary))" />
      <path
        d="M30 35 H70 M30 50 H70 M30 65 H55"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="70" cy="65" r="7.5" fill="hsl(var(--primary-foreground))" />
    </svg>
  );
}
