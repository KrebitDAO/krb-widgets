import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const InputWrapper = styled.div`
  ${({ theme }) => css`
    height: 100%;
    width: 100%;

    & > .MuiFormControl-root {
      height: 100% !important;
      width: 100% !important;
    }

    label {
      color: #ffffffb3;
    }

    label.Mui-focused {
      color: #ffffffb3;
    }

    & .MuiInput-underline:after {
      border-bottom-color: #ffffffb3;
    }

    .MuiInputBase-input {
      color: #ffffffb3;
    }

    .MuiOutlinedInput-root {
      fieldset {
        border-color: #ffffffb3 !important;
      }

      &:hover fieldset {
        border-color: #ffffffb3;
      }

      &.Mui-focused fieldset {
        border-color: #ffffffb3;
      }
    }

    .Mui-disabled {
      color: #ffffffb3 !important;
      -webkit-text-fill-color: #ffffffb3 !important;
    }

    .MuiSvgIcon-root {
      fill: #ffffffb3 !important;
    }

    .Mui-error {
      color: #ffffffb3 !important;
    }
  `}
`;
