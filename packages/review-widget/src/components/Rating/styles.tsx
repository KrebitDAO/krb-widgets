import { css } from '@emotion/react';
import styled from '@emotion/styled';

interface IProps {
  iconColor?: string;
  isDarkMode?: boolean;
}

export const Wrapper = styled.div<IProps>`
  ${({ theme, iconColor, isDarkMode }) => css`
    .MuiTypography-root {
      color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
      font-size: ${theme.fonts.base};
    }

    .MuiRating-root {
      padding: 0.5rem;
    }

    .Mui-disabled {
      color: ${theme.colors.white}80 !important;
    }

    & .MuiRating-iconEmpty {
      color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
    }

    .MuiRating-iconFilled {
      color: ${theme.colors[iconColor]};
    }
  `}
`;
