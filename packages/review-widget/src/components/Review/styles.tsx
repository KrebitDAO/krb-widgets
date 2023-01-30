import { css } from '@emotion/react';
import styled from '@emotion/styled';

interface IProps {
  image?: string;
  isDarkMode?: boolean;
}

export const Wrapper = styled.div<IProps>`
  ${({ theme, image, isDarkMode }) => css`
    background-color: ${isDarkMode ? theme.colors.bunting : theme.colors.white};
    padding: 20px;

    .user {
      display: flex;

      .user-image {
        width: 60px;
        height: 60px;
        border-radius: 9999px;
        border: 2px solid
          ${isDarkMode ? theme.colors.white : theme.colors.bunting};
        background-image: url(${image});
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
      }

      .user-content {
        margin-left: 14px;

        .user-name {
          margin: 0;
          font-size: 16px;
          color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
          text-decoration: none;

          & > span {
            color: ${isDarkMode ? theme.colors.cyan : theme.colors.heliotrope};
          }
        }

        .user-description {
          margin: 0;
          margin-top: 10px;
          font-size: 14px;
          color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
        }
      }
    }

    .comment-action {
      width: 100px;
      height: 30px;
      margin-top: 20px;
    }

    .comments {
      display: grid;
      grid-gap: 10px;
      margin-top: 20px;
    }
  `}
`;

export const Comment = styled.div<IProps>`
  ${({ theme, image, isDarkMode }) => css`
    .comment-header {
      display: flex;

      .comment-header-image {
        width: 60px;
        height: 60px;
        border-radius: 9999px;
        border: 2px solid
          ${isDarkMode ? theme.colors.white : theme.colors.bunting};
        background-image: url(${image});
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
      }

      .comment-header-content {
        margin-left: 14px;

        .comment-header-content-name {
          margin: 0;
          font-size: 16px;
          color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
          text-decoration: none;

          & > span {
            color: ${isDarkMode ? theme.colors.cyan : theme.colors.heliotrope};
          }
        }
      }
    }

    .comment-text {
      margin: 0;
      margin-top: 10px;
      font-size: 14px;
      color: ${isDarkMode ? theme.colors.white : theme.colors.bunting};
    }
  `}
`;

export const QuestionModalForm = styled.div<IProps>`
  ${({ theme, isDarkMode }) => css`
    display: grid;
    grid-gap: 10px;

    .skills-box {
      display: flex;
      flex-wrap: wrap;
      grid-gap: 8px;
      margin-top: 10px;

      .skills-box-item {
        border: 1px solid
          ${isDarkMode ? theme.colors.melrose : theme.colors.heliotrope};
        border-radius: 20px;
        padding: 4px 14px;
        height: 100%;
        width: fit-content;

        .skills-box-item-text {
          margin: 0;
          font-size: 14px;
          color: ${isDarkMode ? theme.colors.melrose : theme.colors.heliotrope};
        }
      }
    }
  `}
`;

export const LoadingWrapper = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    margin-top: 20px;
    width: 50px;
    height: 50px;
  `}
`;
