/**
 * Utility Functions
 * 
 * Common utility functions used throughout the application.
 * 
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names intelligently using clsx and tailwind-merge
 * 
 * Combines multiple class values and resolves Tailwind CSS conflicts,
 * ensuring that later classes override earlier conflicting ones.
 * 
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged and deduplicated class string
 * 
 * @example
 * cn('px-4 py-2', 'px-6') // Returns 'py-2 px-6'
 * cn('text-red-500', { 'text-blue-500': isActive })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
