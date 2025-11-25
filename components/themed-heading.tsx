import React from "react";

interface ThemedHeadingProps {
  children: React.ReactNode;
  className?: string;
  barColor?: string;      // Tailwind color for underline bar
  bgColor?: string;       // Background behind text
  textColor?: string;     // Heading text color
}

// Reusable themed heading with underline bar
export default function ThemedHeading({
  children,
  className = "",
  barColor = "bg-neutral-900 dark:bg-neutral-100",   // auto theme
  bgColor = "bg-white dark:bg-black",           // auto theme
  textColor = "text-neutral-900 dark:text-neutral-100", // auto theme
}: ThemedHeadingProps) {
  return (
    <h3
      className={`relative capitalize text-2xl md:text-3xl font-extrabold mb-6 tracking-tight ${textColor} ${className}`}
    >
      <span className={`relative z-10 pr-3 ${bgColor}`}>{children}</span>
      <span className={`absolute left-0 top-1/2 w-full h-[8px] -z-0 ${barColor}`}></span>
    </h3>
  );
}
