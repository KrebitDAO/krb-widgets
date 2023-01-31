import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';

interface WalletProps {
  status: string;
  isDarkMode?: boolean;
}

interface WalletButtonProps {
  textColor: string;
  isDarkMode?: boolean;
}

export const Wrapper = styled.div<WalletProps>`
  ${({ theme, isDarkMode }) => css`
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 30;
    width: 100vw;
    height: 100vh;
    background-color: ${theme.colors.white}0D;
    backdrop-filter: saturate(180%) blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;

    .wallet {
      background-color: ${isDarkMode
        ? theme.colors.bunting
        : theme.colors.white};
      width: 90%;
      border-radius: 15px;
      box-shadow: ${theme.shadows.smallest};
      padding: 36px 28px;

      @media (min-width: ${theme.screens.lg}) {
        width: 450px;
      }

      .wallet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 48px;

        .wallet-header-title {
          font-size: ${theme.fonts.lg};
          color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
          margin: 0;

          @media (min-width: ${theme.screens.lg}) {
            font-size: ${theme.fonts.xl};
          }
        }

        .wallet-header-close {
          cursor: pointer;

          & > svg {
            fill: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
            width: 24px;
            height: 24px;
          }
        }
      }

      .wallet-buttons {
        display: grid;
        grid-template-rows: repeat(3, 56px);
        grid-gap: 16px;

        @media (min-width: ${theme.screens.lg}) {
          grid-template-rows: repeat(3, 69px);
        }
      }

      .wallet-remember-session {
        display: flex;
        margin-top: 26px;

        @media (min-width: ${theme.screens.lg}) {
          justify-content: center;
        }
      }

      .wallet-terms {
        margin-top: 10px;
        margin-bottom: 30px;
        display: flex;
        align-items: center;

        .wallet-terms-text {
          margin: 0;
          font-size: ${theme.fonts.base};
          color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};

          .wallet-terms-text-link {
            text-decoration: underline;
            font-size: ${theme.fonts.base};
            color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
          }
        }
      }

      .wallet-read {
        display: block;
        text-decoration: underline;
        color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
        font-size: ${theme.fonts.base};
        text-align: center;
        cursor: pointer;

        @media (min-width: ${theme.screens.lg}) {
          font-size: ${theme.fonts.xl};
        }
      }
    }

    .loading-title {
      font-size: ${theme.fonts.lg};
      color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
      margin: 0;
      margin-bottom: 48px;
      text-align: center;

      @media (min-width: ${theme.screens.lg}) {
        font-size: ${theme.fonts.xl};
      }
    }

    .loading-view {
      display: grid;
      justify-content: center;

      .loading-view-container {
        margin: 0 auto;
        width: 60px;
        height: 60px;
      }

      .loading-view-text {
        font-size: ${theme.fonts.sm};
        color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
        margin: 0;
        margin-top: 20px;

        @media (min-width: ${theme.screens.lg}) {
          font-size: ${theme.fonts.sm};
        }
      }
    }
  `}
`;

export const WalletButton = styled.button<WalletButtonProps>`
  ${({ theme, textColor, isDarkMode }) => css`
    width: 100%;
    height: 100%;
    border-radius: 15px;
    background-color: ${theme.colors.transparent};
    color: ${theme.colors[textColor]};
    border: 1px solid ${theme.colors[textColor]}B3;
    font-size: ${theme.fonts.base};
    display: flex;
    justify-content: center;
    align-items: center;
    grid-gap: 20px;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }

    @media (min-width: ${theme.screens.lg}) {
      font-size: ${theme.fonts.xl};
    }

    & > img,
    & > svg {
      width: 30px;
      height: 24px;
      fill: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
    }
  `}
`;

export const GlobalStyle = props => (
  <Global
    {...props}
    styles={css`
      #w3a-modal {
        z-index: 40;
      }
    `}
  />
);
