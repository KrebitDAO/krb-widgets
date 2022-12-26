import Review from '@krebitdao/review-widget';

const Index = props => {
  const { krebiter, proofUrl, defaultSkills, isDarkMode } = props;

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
          background-color: ${isDarkMode ? '#101828' : 'white'};
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
          isDarkMode={isDarkMode}
        />
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  const { query } = context;

  let { krebiter, proofUrl, defaultSkills, isDarkMode } = query;

  if (!krebiter || !proofUrl || !defaultSkills) {
    return {
      notFound: true
    };
  }

  defaultSkills = defaultSkills.replace(/'/g, '"');
  defaultSkills = JSON.parse(defaultSkills);

  return {
    props: {
      krebiter,
      proofUrl,
      defaultSkills,
      isDarkMode: isDarkMode ? isDarkMode === 'true' : true
    }
  };
}

export default Index;
