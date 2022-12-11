import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const Wrapper = styled.div`
  ${({ theme }) => css`
    .MuiTypography-root {
      color: #ffffff;
      font-size: 14px;
    }

    .MuiRating-root {
      padding: 0.5rem;
    }

    .Mui-disabled {
      color: #ffffff80 !important;
    }

    & .MuiRating-iconEmpty {
      color: #ffffff;
    }

    .MuiRating-iconFilled {
      color: cyan;
    }
  `}
`;
