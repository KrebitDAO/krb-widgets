import { ThemeProvider } from '@emotion/react';

import { IReviewProps, Review } from './components/Review';
import { GeneralProvider } from './context';
import { theme } from './theme';

const ReviewComponent = (props: IReviewProps) => {
  return (
    <ThemeProvider theme={theme}>
      <GeneralProvider {...props}>
        <Review {...props} />
      </GeneralProvider>
    </ThemeProvider>
  );
};

export default ReviewComponent;
