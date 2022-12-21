import Review from '@krebitdao/review-widget';

const Index = props => {
  const { krebiter, proofUrl, defaultSkills } = props;

  return (
    <>
      <style global jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@300;500&family=Roboto:wght@400;500&display=swap');

        * {
          font-family: 'Roboto', sans-serif;
          font-weight: 400;
          box-sizing: border-box;
          font-weight: 300;
        }

        html,
        body {
          scroll-behavior: smooth;
          margin: 0;
          padding: 0;
          background-color: #101828;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-weight: initial;
          margin: 0;
          padding: 0;
        }

        .container {
          width: 100%;
          height: 100%;
          margin: 0 auto;
        }
      `}</style>
      <div className="container">
        <Review
          krebiter={krebiter}
          proofUrl={proofUrl}
          defaultSkills={defaultSkills}
        />
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  const { query } = context;

  const { krebiter, proofUrl, defaultSkills } = query;

  if (!krebiter || !proofUrl || !defaultSkills || defaultSkills?.length === 0) {
    return {
      notFound: true
    };
  }

  return {
    props: { krebiter, proofUrl, defaultSkills }
  };
}

export default Index;
