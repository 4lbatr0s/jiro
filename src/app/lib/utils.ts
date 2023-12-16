import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
/**
 * Returns a merged list of tailwind class values. Its used to prevent overriding the MaxWidthWrapper classes.
 * For example, px-2 + py-2 = p-2
 * @param inputs tailwind classes
 * @returns a merged list of tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
