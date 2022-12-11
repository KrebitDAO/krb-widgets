import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const Wrapper = styled.div`
  ${({ theme }) => css`
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 30;
    width: 100vw;
    height: 100vh;
    background-color: #ffffff0d;
    backdrop-filter: saturate(180%) blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;

    .question-modal-container {
      background-color: #0f1837;
      border-radius: 15px;
      box-shadow: 0px 10px 50px #00000029;
      padding: 36px 28px;
      width: 577px;

      .question-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .question-modal-header-title {
          margin: 0;
          font-size: 20px;
          color: #ffffff;
        }

        .question-modal-header-close {
          cursor: pointer;
          float: right;
          & > svg {
            fill: #ffffff;
            width: 24px;
            height: 24px;
          }
        }
      }

      .question-modal-content {
        margin: 20px 0;

        .question-modal-content-loading {
          margin: 0 auto;
          width: 60px;
          height: 60px;
        }

        .question-modal-content-text {
          margin: 0;
          font-size: 16px;
          color: #ffffffb3;
        }
      }
      .question-modal-content-buttons {
        display: flex;
        grid-gap: 8px;
        justify-content: flex-end;

        .question-modal-content-button {
          width: 146px;
          height: 50px;
        }
      }
    }
  `}
`;
