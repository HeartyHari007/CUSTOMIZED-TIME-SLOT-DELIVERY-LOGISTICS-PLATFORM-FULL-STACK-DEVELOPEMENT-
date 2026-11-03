export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2.5 4.5 7v8.2c0 7.2 4.8 12.4 11.5 14.8 6.7-2.4 11.5-7.6 11.5-14.8V7z" fill="#0a1322" stroke="#22d3ee" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="16" cy="15.5" r="5.6" fill="none" stroke="#22d3ee" strokeWidth="1.8" />
      <path d="M16 12.4v3.4l2.4 1.5" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
