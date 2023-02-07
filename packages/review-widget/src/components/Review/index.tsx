import { ChangeEvent, useContext, useEffect, useState } from 'react';
import Krebit from '@krebitdao/reputation-passport';
import { getAddressFromDid } from '@orbisclub/orbis-sdk/utils';

import { Comment, LoadingWrapper, QuestionModalForm, Wrapper } from './styles';
import { Rating } from '../Rating';
import { Button } from '../Button';
import { QuestionModal } from '../QuestionModal';
import { ConnectWallet } from '../ConnectWallet';
import { Input } from '../Input';
import { Loading } from '../Loading';
import {
  generateUID,
  getCredential,
  normalizeSchema,
  sendNotification,
  sortByDate
} from '../../utils';
import { GeneralContext } from '../../context';

interface IComment {
  picture: string;
  name: string;
  did: string;
  reputation: string;
  streamId: string;
  comment: {
    rating: number;
    description: string;
  };
}

export interface IReviewProps {
  krebiter: string;
  proofUrl: string;
  defaultSkills: string[];
  isDarkMode?: boolean;
}

const reviewValuesInitialState = {
  title: '',
  rating: 2,
  description: ''
};

export const Review = (props: IReviewProps) => {
  const { krebiter, proofUrl, defaultSkills, isDarkMode = true } = props;
  const { walletInformation, profileInformation, auth, walletModal } =
    useContext(GeneralContext);
  const [shouldAddNewComment, setShouldAddNewComment] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [comments, setComments] = useState<IComment[]>([]);
  const [reviewValues, setReviewValues] = useState(reviewValuesInitialState);

  useEffect(() => {
    if (!krebiter) return;
    if (auth.status !== 'resolved') return;
    if (!walletInformation) return;
    if (!walletInformation?.publicPassport?.idx) return;

    const getComments = async () => {
      let credentials = await walletInformation?.publicPassport?.getCredentials(
        undefined,
        'Review'
      );

      console.log('Reviews: ', comments);

      credentials = credentials.sort((a, b) =>
        sortByDate(a.issuanceDate, b.issuanceDate, 'des')
      );

      let data = [];

      if (credentials.length > 0) {
        data = await Promise.all(
          credentials.map(async credential => {
            const values = JSON.parse(credential.credentialSubject.value);

            console.log('credential: ', credential);
            const reputation = await Krebit.lib.graph.erc20BalanceQuery(
              credential?.issuer?.ethereumAddress
            );
            const profile = await normalizeSchema.profile({
              orbis: walletInformation?.orbis,
              did: credential?.issuer?.id,
              reputation: reputation?.value || 0
            });

            return {
              picture: profile.picture,
              name: profile.name,
              did: profile.did,
              reputation: profile.reputation,
              streamId: credential.vcId,
              comment: {
                rating: parseInt(values.rating, 10) || 0,
                description: values.description
              }
            };
          })
        );
      }

      setComments(data);
    };

    getComments();
  }, [krebiter, auth, walletInformation]);

  const handleShouldAddNewComment = () => {
    setShouldAddNewComment(prevValue => !prevValue);
    setReviewValues(reviewValuesInitialState);
  };

  const handleTaskCompleted = () => {
    setTaskCompleted(prevValue => !prevValue);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const { name, value } = event.target;

    setReviewValues(prevValues => ({ ...prevValues, [name]: value }));
  };

  const handleSaveReview = async () => {
    if (!walletInformation) return;

    const { address } = getAddressFromDid(profileInformation.profile.did);

    const claimValue = {
      ...reviewValues,
      rating: reviewValues?.rating ? reviewValues.rating : '2',
      proof: proofUrl || '',
      entity: 'Personal',
      skills: defaultSkills.map(skill => {
        return {
          skillId: skill,
          score: reviewValues?.rating ? reviewValues?.rating * 20 : 100
        };
      })
    };

    try {
      console.log('add: ', walletInformation.address);
      console.log('did: ', walletInformation.issuer.did);

      const expirationDate = new Date();
      const expiresYears = 1;
      expirationDate.setFullYear(expirationDate.getFullYear() + expiresYears);
      console.log('expirationDate: ', expirationDate);

      const claim = {
        id: `review-${generateUID(10)}`,
        did: `did:pkh:eip155:1:${address.toLowerCase()}`,
        ethereumAddress: address.toLowerCase(),
        tags: ['Community'].concat(defaultSkills),
        type: 'Review',
        typeSchema: 'krebit://schemas/recommendation',
        value: claimValue,
        expirationDate: new Date(expirationDate).toISOString(),
        trust: claimValue?.rating
          ? parseInt(claimValue?.rating as string) * 20
          : 100
      };
      console.log('claim: ', claim);

      const issuedCredential = await walletInformation.issuer.issue(claim);
      console.log('issuedCredential: ', issuedCredential);

      let credentialId: string;

      // Step 1-C: Get the verifiable credential, and save it to the passport
      if (issuedCredential) {
        console.log('issued:', await walletInformation.passport.getIssued());

        const issuedCredentialId = await walletInformation.passport.addIssued(
          issuedCredential
        );

        credentialId = issuedCredentialId;
        console.log('issuedCredentialId: ', issuedCredentialId);
      }

      const url = `https://krebit.id/claim/?credential_id=${credentialId}`;

      await sendNotification({
        orbis: walletInformation?.orbis,
        authenticatedDID: profileInformation.authenticatedProfile.did,
        body: {
          subject: `Krebit.id Notification: ${claimValue?.title}`,
          content: `Hi, I just sent you a review, you can claim it here: ${url}`,
          recipients: [address]
        }
      });

      handleShouldAddNewComment();
      handleTaskCompleted();
    } catch (error) {
      console.error(error);
    }
  };

  if (auth.status === 'idle' || auth.status === 'pending') {
    return (
      <LoadingWrapper>
        <Loading isDarkMode={isDarkMode} />
      </LoadingWrapper>
    );
  }

  return (
    <>
      <ConnectWallet
        isDarkMode={isDarkMode}
        isOpen={walletModal.openConnectWallet}
        onClose={walletModal.handleOpenConnectWallet}
      />
      {shouldAddNewComment && (
        <QuestionModal
          title="Add new Review"
          isDarkMode={isDarkMode}
          component={() => (
            <QuestionModalForm isDarkMode={isDarkMode}>
              <Input
                name="title"
                placeholder="Review title"
                value={reviewValues.title}
                onChange={handleChange}
                isDarkMode={isDarkMode}
              />
              <Rating
                name="rating"
                label="Rating: 2.5/5"
                value={reviewValues.rating}
                onChange={handleChange}
                iconColor={isDarkMode ? 'cyan' : 'heliotrope'}
                isDarkMode={isDarkMode}
              />
              <Input
                name="description"
                placeholder="Write your review notes here"
                value={reviewValues.description}
                onChange={handleChange}
                isDarkMode={isDarkMode}
              />
              <div className="skills-box">
                {defaultSkills.map((skill, index) => (
                  <div className="skills-box-item" key={index}>
                    <p className="skills-box-item-text">{skill}</p>
                  </div>
                ))}
              </div>
            </QuestionModalForm>
          )}
          cancelButton={{
            text: 'Close',
            onClick: handleShouldAddNewComment
          }}
          continueButton={{
            text: 'Add',
            onClick: handleSaveReview
          }}
        />
      )}
      {taskCompleted && (
        <QuestionModal
          title="Task completed!"
          text={`Thanks, we have sent the review to ${
            profileInformation.profile.name || ''
          } for claiming`}
          isDarkMode={isDarkMode}
          cancelButton={{
            text: 'Close',
            onClick: handleTaskCompleted
          }}
          continueButton={{
            text: 'Accept',
            onClick: handleTaskCompleted
          }}
        />
      )}
      <Wrapper
        image={profileInformation.profile.picture}
        isDarkMode={isDarkMode}
      >
        <div className="user">
          <div className="user-image"></div>
          <div className="user-content">
            <a
              className="user-name"
              target="_blank"
              href={`https://krebit.id/${profileInformation.profile.did}`}
            >
              {profileInformation.profile.name}{' '}
              <span>{profileInformation.profile.reputation} Krebits</span>
            </a>
            <p className="user-description">
              {profileInformation.profile.description}
            </p>
          </div>
        </div>
        <div className="comment-action">
          {!auth.isAuthenticated ? (
            <Button
              text="Connect"
              onClick={walletModal.handleOpenConnectWallet}
            />
          ) : (
            <Button text="Comment" onClick={handleShouldAddNewComment} />
          )}
        </div>
        <div className="comments">
          {comments.map((comment, index) => (
            <Comment
              image={comment.picture}
              isDarkMode={isDarkMode}
              key={index}
            >
              <div className="comment-header">
                <div className="comment-header-image"></div>
                <div className="comment-header-content">
                  <a
                    className="comment-header-content-name"
                    target="_blank"
                    href={`https://krebit.id/${comment.did}`}
                  >
                    {comment.name} <span>{comment.reputation} Krebits</span>
                  </a>
                  <a
                    className="comment-header-content-stars"
                    target="_blank"
                    href={`https://cerscan.com/mainnet/stream/${comment.streamId.replace(
                      'ceramic://',
                      ''
                    )}`}
                  >
                    <Rating
                      label=""
                      value={comment.comment.rating}
                      readOnly={true}
                      iconColor={isDarkMode ? 'cyan' : 'heliotrope'}
                      isDarkMode={isDarkMode}
                    />
                  </a>
                </div>
              </div>
              <div className="comment-text">{comment.comment.description}</div>
            </Comment>
          ))}
        </div>
      </Wrapper>
    </>
  );
};
