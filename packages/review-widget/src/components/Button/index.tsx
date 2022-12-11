import { FunctionComponent, MouseEventHandler, ReactNode } from 'react';

import { Wrapper } from './styles';

interface Props {
  onClick: MouseEventHandler<HTMLButtonElement>;
  text?: string;
  icon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  styleType?: 'background' | 'border' | 'border-rounded';
  isDisabled?: boolean;
}

export const Button: FunctionComponent<Props> = props => {
  const {
    onClick,
    text,
    icon,
    type = 'button',
    styleType = 'background',
    isDisabled = false
  } = props;

  return (
    <Wrapper
      type={type}
      styleType={styleType}
      onClick={onClick}
      disabled={isDisabled}
      hasIcon={!!icon}
    >
      {icon ? icon : text}
    </Wrapper>
  );
};
