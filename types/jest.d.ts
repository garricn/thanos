import '@testing-library/jest-dom';
import { expect as jestExpect } from '@jest/globals';

declare global {
  const expect: typeof jestExpect;
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeDisabled(): R;
    }
  }

  namespace jest {
    interface Expect {
      anything(): any;
      any(constructor: any): any;
      objectContaining(obj: any): any;
      stringContaining(str: string): any;
    }
  }
}

export {};
