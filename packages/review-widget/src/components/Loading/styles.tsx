import { css } from '@emotion/react';
import styled from '@emotion/styled';

interface IProps {
  isDarkMode?: boolean;
}

export const CircularProgressWrapper = styled.div<IProps>`
  ${({ theme, isDarkMode }) => css`
    width: 100%;
    height: 100%;
    overflow: hidden;

    & > .MuiCircularProgress-root {
      width: 100% !important;
      height: 100% !important;
      color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
    }
  `}
`;
