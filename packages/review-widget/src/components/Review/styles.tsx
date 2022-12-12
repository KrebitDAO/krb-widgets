import { css } from '@emotion/react';
import styled from '@emotion/styled';

interface IProps {
  image: string;
}

export const Wrapper = styled.div<IProps>`
  ${({ theme, image }) => css`
    background-color: #0f1837;
    padding: 20px;

    .user {
      display: flex;

      .user-image {
        width: 60px;
        height: 60px;
        border-radius: 9999px;
        border: 2px solid #ffffff;
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
          color: #ffffff;

          & > span {
            color: cyan;
          }
        }

        .user-description {
          margin: 0;
          margin-top: 10px;
          font-size: 14px;
          color: #ffffff;
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
  ${({ theme, image }) => css`
    .comment-header {
      display: flex;

      .comment-header-image {
        width: 60px;
        height: 60px;
        border-radius: 9999px;
        border: 2px solid #ffffff;
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
          color: #ffffff;
        }
      }
    }

    .comment-text {
      margin: 0;
      margin-top: 10px;
      font-size: 14px;
      color: #ffffff;
    }
  `}
`;

export const QuestionModalForm = styled.div`
  display: grid;
  grid-gap: 10px;

  .skills-box {
    display: flex;
    flex-wrap: wrap;
    grid-gap: 8px;
    margin-top: 10px;

    .skills-box-item {
      border: 1px solid #bdb4fe;
      border-radius: 20px;
      padding: 4px 14px;
      height: 100%;
      width: fit-content;

      .skills-box-item-text {
        margin: 0;
        font-size: 14px;
        color: #bdb4fe;
      }
    }
  }
`;
