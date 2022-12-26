import { css } from '@emotion/react';
import styled from '@emotion/styled';

interface IProps {
  isDarkMode?: boolean;
}

export const InputWrapper = styled.div<IProps>`
  ${({ theme, isDarkMode }) => css`
    height: 100%;
    width: 100%;

    & > .MuiFormControl-root {
      height: 100% !important;
      width: 100% !important;
    }

    label {
      color: ${isDarkMode ? theme.colors.white : theme.colors.bunting}B3;
    }

    label.Mui-focused {
      color: ${isDarkMode ? theme.colors.white : theme.colors.bunting}B3;
    }

    & .MuiInput-underline:after {
      border-bottom-color: ${isDarkMode
        ? theme.colors.white
        : theme.colors.bunting}B3;
    }

    .MuiInputBase-input {
      color: ${isDarkMode ? theme.colors.white : theme.colors.bunting}B3;
    }

    .MuiOutlinedInput-root {
      fieldset {
        border-color: ${isDarkMode
          ? theme.colors.white
          : theme.colors.bunting}B3 !important;
      }

      &:hover fieldset {
        border-color: ${isDarkMode
          ? theme.colors.white
          : theme.colors.bunting}B3;
      }

      &.Mui-focused fieldset {
        border-color: ${isDarkMode
          ? theme.colors.white
          : theme.colors.bunting}B3;
      }
    }

    .Mui-disabled {
      color: ${isDarkMode
        ? theme.colors.white
        : theme.colors.bunting}B3 !important;
      -webkit-text-fill-color: ${isDarkMode
        ? theme.colors.white
        : theme.colors.bunting}B3 !important;
    }

    .MuiSvgIcon-root {
      fill: ${isDarkMode
        ? theme.colors.white
        : theme.colors.bunting}B3 !important;
    }

    .Mui-error {
      color: ${isDarkMode
        ? theme.colors.white
        : theme.colors.bunting}B3 !important;
    }
  `}
`;
