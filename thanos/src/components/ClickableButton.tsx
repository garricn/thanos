import React, { useState } from 'react';
import { Button } from './ui/button';

interface ClickableButtonProps {
  initialText?: string;
  clickedText?: string;
}

export const ClickableButton: React.FC<ClickableButtonProps> = ({
  initialText = 'Click Me',
  clickedText = 'Clicked',
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
  };

  return (
    <Button onClick={handleClick} data-testid="clickable-button">
      {isClicked ? clickedText : initialText}
    </Button>
  );
};

export default ClickableButton;
