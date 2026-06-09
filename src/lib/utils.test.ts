import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge tailwind classes properly', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn('p-4', isTrue && 'm-4', isFalse && 'opacity-0')).toBe('p-4 m-4');
  });

  it('should handle arrays and objects', () => {
    expect(cn(['flex', 'items-center'], { 'justify-center': true })).toBe('flex items-center justify-center');
  });
});
