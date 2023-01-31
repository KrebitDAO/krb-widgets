import { css } from '@emotion/react';
import styled from '@emotion/styled';

interface IProps {
  isDarkMode?: boolean;
}

export const CheckboxWrapper = styled.div<IProps>`
  ${({ theme, isDarkMode }) => css`
    .MuiFormControlLabel-root {
      margin: 0;
    }

    .MuiCheckbox-root,
    .MuiCheckbox-root.Mui-checked {
      color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
    }

    .MuiFormControlLabel-root > .MuiTypography-root {
      color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
    }
  `}
`;
