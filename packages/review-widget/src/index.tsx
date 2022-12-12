import { IReviewProps, Review } from './components/Review';

import { GeneralProvider } from './context';

const ReviewComponent = (props: IReviewProps) => {
  return (
    <GeneralProvider {...props}>
      <Review {...props} />
    </GeneralProvider>
  );
};

export default ReviewComponent;
