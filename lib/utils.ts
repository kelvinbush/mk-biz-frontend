import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatISODate(isoDate: string | number | Date) {
  const date = new Date(isoDate); // Parse the ISO date string

  const options = { year: "numeric", month: "long", day: "numeric" };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const formattedDate = date.toLocaleDateString("en-US", options); // "January 1, 1"

  // Add the appropriate suffix for the day
  const dayWithSuffix = (d: string | number) => {
    const suffix = ["th", "st", "nd", "rd"];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const v = d % 100;
    return d + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  };

  // Extract parts of the formatted date
  const [monthName, yearPart] = formattedDate.split(" ");
  return `${dayWithSuffix(date.getDate())} ${monthName} ${yearPart.slice(
    0,
    4,
  )}`;
}