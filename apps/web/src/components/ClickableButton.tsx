import React, { useState } from 'react';
import { Button } from './ui/button';

interface ClickableButtonProps {
  initialText?: string;
  clickedText?: string;
  onClickHandler?: () => void;
}

// Export the handleClick function factory for testing
export const createHandleClick = (
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>,
  onClickHandler?: () => void
) => {
  return () => {
    setIsClicked(true);
    if (onClickHandler) {
      onClickHandler();
    }
  };
};

export const ClickableButton: React.FC<ClickableButtonProps> = ({
  initialText = 'Click Me',
  clickedText = 'Clicked',
  onClickHandler,
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = createHandleClick(setIsClicked, onClickHandler);

  return (
    <Button onClick={handleClick} data-testid="clickable-button">
      {isClicked ? clickedText : initialText}
    </Button>
  );
};

export default ClickableButton;
