import { cn } from './utils';

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const condition = true;
      const result = cn('base-class', condition && 'conditional-class');
      expect(result).toBe('base-class conditional-class');
    });

    it('should handle falsy values', () => {
      const result = cn('base-class', '', null, undefined);
      expect(result).toBe('base-class');
    });

    it('should handle object notation from clsx', () => {
      const result = cn('base-class', {
        'conditional-class': true,
        'not-included': false,
      });
      expect(result).toBe('base-class conditional-class');
    });

    it('should handle array notation from clsx', () => {
      const result = cn('base-class', ['array-class', 'another-class']);
      expect(result).toBe('base-class array-class another-class');
    });

    it('should handle complex combinations', () => {
      const condition1 = true;
      const condition2 = false;
      const result = cn(
        'base-class',
        condition1 && 'condition1-class',
        condition2 && 'condition2-class',
        { 'object-true': true, 'object-false': false },
        ['array-class']
      );
      expect(result).toContain('base-class');
      expect(result).toContain('condition1-class');
      expect(result).not.toContain('condition2-class');
      expect(result).toContain('object-true');
      expect(result).not.toContain('object-false');
      expect(result).toContain('array-class');
    });
  });
});
