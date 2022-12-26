import { ReactElement } from 'react';

import { Wrapper } from './styles';
import { Close } from './close';
import { Button } from '../Button';

interface IProps {
  title: string;
  continueButton: {
    text: string;
    onClick: () => void;
  };
  cancelButton: {
    text: string;
    onClick: () => void;
  };
  text?: string;
  isLoading?: boolean;
  isDarkMode?: boolean;
  component?: () => ReactElement;
}

export const QuestionModal = (props: IProps) => {
  const {
    title,
    continueButton,
    cancelButton,
    text,
    isLoading = false,
    isDarkMode = true,
    component
  } = props;

  return (
    <Wrapper isDarkMode={isDarkMode}>
      <div className="question-modal-container">
        <div className="question-modal-header">
          <p className="question-modal-header-title">{title}</p>
          <div
            className="question-modal-header-close"
            onClick={isLoading ? undefined : cancelButton.onClick}
          >
            <Close />
          </div>
        </div>
        <div className="question-modal-content">
          {text ? (
            <p className="question-modal-content-text">{text}</p>
          ) : (
            component()
          )}
        </div>
        <div className="question-modal-content-buttons">
          <div className="question-modal-content-button">
            <Button
              text={cancelButton.text}
              onClick={isLoading ? undefined : cancelButton.onClick}
              borderBackgroundColor={isDarkMode ? 'bunting' : 'white'}
              styleType="border"
              isDisabled={isLoading}
              isDarkMode={isDarkMode}
            />
          </div>
          <div className="question-modal-content-button">
            <Button
              text={continueButton.text}
              onClick={isLoading ? undefined : continueButton.onClick}
              isDisabled={isLoading}
            />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};
