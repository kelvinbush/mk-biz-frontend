import React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  size?: string;
  color?: "primary" | "secondary" | "success" | "error";
  thickness?: number;
  children?: React.ReactNode;
  className?: string;
}

interface CircularProgressLabelProps {
  children: React.ReactNode;
  className?: string;
}

const getColor = (color: CircularProgressProps["color"]) => {
  switch (color) {
    case "primary":
      return "stroke-primary-green";
    case "secondary":
      return "stroke-gray-500";
    case "success":
      return "stroke-green-500";
    case "error":
      return "stroke-red-500";
    default:
      return "stroke-primary-green";
  }
};

export function CircularProgress({
  value,
  size = "48px",
  color = "primary",
  thickness = 4,
  children,
  className,
}: CircularProgressProps) {
  const radius = 45; // SVG coordinate system
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="stroke-gray-200"
          strokeWidth={thickness}
          fill="none"
          cx="50"
          cy="50"
          r={radius}
        />
        {/* Progress circle */}
        <circle
          className={cn(getColor(color), "transition-all duration-300 ease-in-out")}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export function CircularProgressLabel({
  children,
  className,
}: CircularProgressLabelProps) {
  return (
    <div className={cn("text-sm font-medium", className)}>
      {children}
    </div>
  );
}
