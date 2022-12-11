// Code reference: https://codepen.io/christianjbolus/pen/yLzPvwO
import { css } from '@emotion/react';
import styled from '@emotion/styled';

interface IProps {
  styleType: string;
  hasIcon: boolean;
}

export const Wrapper = styled.button<IProps>`
  ${({ styleType, hasIcon }) => css`
    border: none;
    outline: none;
    width: 100%;
    height: 100%;
    border-radius: 29px;
    font-size: 14px;
    cursor: pointer;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    ${hasIcon &&
    css`
      display: flex;
      justify-content: center;
      align-items: center;

      & > svg {
        width: 24px;
        height: 24px;
        fill: #00fffe;

        & > g > path {
          fill: #00fffe;
        }
      }
    `}

    ${styleType === 'background' &&
    css`
      background: linear-gradient(to right, #b673fb, cyan);
      color: #101033;
    `}

    ${styleType === 'border' || styleType == 'border-rounded'
      ? css`
          background: linear-gradient(to left, #b673fb, cyan);
          color: cyan;
          position: relative;
          z-index: 1;

          &::before {
            content: '';
            position: absolute;
            left: 1px;
            right: 1px;
            top: 1px;
            bottom: 1px;
            border-radius: ${styleType == 'border-rounded' ? '9999px' : '29px'};
            background-color: #0f1837;
            z-index: -1;
          }
        `
      : null}
  `}
`;
