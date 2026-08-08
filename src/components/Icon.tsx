import * as React from 'react';

const paths: Record<string, React.ReactNode> = {
  star: <path d="M12 2.4c.6 3.9 2.2 6.4 5.9 7.3 1.1.3 1.1 1.3 0 1.6-3.7.9-5.3 3.4-5.9 7.3-.1.9-1.2.9-1.4 0-.6-3.9-2.2-6.4-5.9-7.3-1.1-.3-1.1-1.3 0-1.6 3.7-.9 5.3-3.4 5.9-7.3.2-.9 1.3-.9 1.4 0Z" fill="currentColor" />,
  revenue: <><path d="M3 17.5 9 11l3.5 3.5L21 6" /><path d="M15 6h6v6" /></>,
  package: <><path d="M20.5 7.3 12 3 3.5 7.3v9.4L12 21l8.5-4.3V7.3Z" /><path d="M3.7 7.4 12 11.7l8.3-4.3M12 11.7V21" /></>,
  social: <><circle cx="6" cy="12" r="2.6" /><circle cx="17.5" cy="6" r="2.6" /><circle cx="17.5" cy="18" r="2.6" /><path d="m8.3 10.8 6.9-3.6M8.3 13.2l6.9 3.6" /></>,
  bag: <><path d="M4.6 8.4h14.8l-.9 10.2a2.1 2.1 0 0 1-2.1 1.9H7.6a2.1 2.1 0 0 1-2.1-1.9Z" /><path d="M9 10.4V6.9a3 3 0 0 1 6 0v3.5" /></>,
  target: <><circle cx="12" cy="12" r="8.2" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".9" fill="currentColor" /></>,
  bot: <><rect x="3.5" y="7.5" width="17" height="12" rx="3.5" /><path d="M12 3.2v4.3M8.6 13v1.6M15.4 13v1.6" /></>,
  arrow: <><path d="M5 12h13M12.5 6l6 6-6 6" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7" strokeWidth="2.2" />,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="3" /><path d="m4 8 7.1 4.7a1.7 1.7 0 0 0 1.8 0L20 8" /></>,
  phone: <path d="M7 3.5h2.2l1.5 4-2 1.4a11.5 11.5 0 0 0 5.4 5.4l1.4-2 4 1.5V16a4.5 4.5 0 0 1-4.9 4.5A14.6 14.6 0 0 1 3.5 8.4 4.5 4.5 0 0 1 7 3.5Z" />,
  pin: <><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>,
  whatsapp: <path fill="currentColor" stroke="none" d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.3 21.7l5.1-1.3A9.7 9.7 0 1 0 12 2.2Zm0 1.8a7.9 7.9 0 1 1-4.1 14.6l-.4-.2-3 .8.8-2.9-.2-.4A7.9 7.9 0 0 1 12 4Zm4.5 10.2c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.4 6.4 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5s-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 3.9c1.7.7 2.3.7 3.1.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z" />,
  quote: <path fill="currentColor" stroke="none" d="M9.4 5.6c-3.2 1.3-5 3.9-5 7.6 0 3.3 1.8 5.2 4.2 5.2 2 0 3.5-1.4 3.5-3.4 0-1.9-1.3-3.2-3.1-3.2h-.6c.3-1.6 1.4-2.9 3-3.7Zm9.4 0c-3.2 1.3-5 3.9-5 7.6 0 3.3 1.8 5.2 4.2 5.2 2 0 3.5-1.4 3.5-3.4 0-1.9-1.3-3.2-3.1-3.2h-.6c.3-1.6 1.4-2.9 3-3.7Z" />,
  left: <path d="m14 6-6 6 6 6" />,
  right: <path d="m10 6 6 6-6 6" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  build: <><path d="M14.5 3.5a4.5 4.5 0 0 0 5.6 5.9L11 18.6a2.9 2.9 0 0 1-4.1-4.1Z" /><path d="M5 5.5 8 8" /></>,
  rocket: <><path d="M13.5 3.6c3.7-1.3 6.9-.4 6.9-.4s.9 3.2-.4 6.9A13 13 0 0 1 13.9 17l-3.1 1.2-4-4L8 11.1a13 13 0 0 1 5.5-7.5Z" /><path d="M6.8 14.2 4 17l3 3 2.8-2.8" /><circle cx="15" cy="9" r="1.6" /></>,
  clock: <><circle cx="12" cy="12" r="8.4" /><path d="M12 7.4V12l3 1.8" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h2.2a1 1 0 0 1 1 1v3.4a1 1 0 0 1-1 1H5.6A1.6 1.6 0 0 1 4 17.8Zm16 0h-2.2a1 1 0 0 0-1 1v3.4a1 1 0 0 0 1 1h.6a1.6 1.6 0 0 0 1.6-1.6Z" /></>,
  link: <><path d="M14 6h4v4" /><path d="M18 6 11 13" /><path d="M17 14.5V18a1.8 1.8 0 0 1-1.8 1.8H6A1.8 1.8 0 0 1 4.2 18V8.8A1.8 1.8 0 0 1 6 7h3.6" /></>,
  eye: <><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  play: <path fill="currentColor" stroke="none" d="M8.4 5.6a1 1 0 0 1 1.5-.87l8.2 4.9a1 1 0 0 1 0 1.72l-8.2 4.9a1 1 0 0 1-1.5-.87Z" />,
};

export type IconName = keyof typeof paths;

export function Icon({ name, className }: { name: string; className?: string }) {
  const shape = paths[name] ?? paths.star;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shape}
    </svg>
  );
}
