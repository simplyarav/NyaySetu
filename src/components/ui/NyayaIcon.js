export default function NyayaIcon({ className, size = 120, strokeColor = "currentColor", strokeWidth = 1.2, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={strokeColor} 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      {/* Head */}
      <circle cx="12" cy="4" r="2" />
      {/* Robed Body */}
      <path d="M10 6 L6 22 H18 L14 6 Z" />
      {/* Left Arm & Scales */}
      <path d="M10 8 L6 10" />
      <path d="M4 10 H8" />
      <path d="M4 10 L3 14 H5 Z" />
      <path d="M8 10 L7 14 H9 Z" />
      {/* Right Arm & Sword */}
      <path d="M14 8 L18 11" />
      <path d="M17 11 H19" />
      <path d="M18 10 V18" />
    </svg>
  );
}
