import Review from '@krebitdao/review-widget';

const Index = () => {
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
          margin: 0 auto;
          margin-top: 40px;
          max-width: 1024px;
        }
      `}</style>
      <div className="container">
        <Review
          krebiter="andresmontoya.eth"
          proofUrl="https://mirror.xyz/andresmontoya.eth"
          defaultSkills={['JavaScript', 'React']}
          isDarkMode={false}
        />
      </div>
    </>
  );
};

export default Index;
