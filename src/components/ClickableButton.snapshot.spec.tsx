import { render } from '@testing-library/react';
import ClickableButton from './ClickableButton';

describe('ClickableButton Snapshot', () => {
  it('should match snapshot with default props', () => {
    const { container } = render(<ClickableButton />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with custom initial text', () => {
    const { container } = render(
      <ClickableButton initialText="Custom Button" />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with custom clicked text', () => {
    const { container } = render(
      <ClickableButton clickedText="Custom Clicked" />
    );
    expect(container).toMatchSnapshot();
  });
});
