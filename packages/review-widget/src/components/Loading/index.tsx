import { CircularProgressWrapper } from './styles';

import CircularProgress from '@mui/material/CircularProgress';

interface IProps {
  isDarkMode?: boolean;
}

export const Loading = (props: IProps) => {
  const { isDarkMode } = props;

  return (
    <CircularProgressWrapper isDarkMode={isDarkMode}>
      <CircularProgress />
    </CircularProgressWrapper>
  );
};
