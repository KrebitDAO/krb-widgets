import { ChangeEvent, useContext, useEffect, useState } from 'react';
import Krebit from '@krebitdao/reputation-passport';
import { getAddressFromDid } from '@orbisclub/orbis-sdk/utils';

import { Comment, QuestionModalForm, Wrapper } from './styles';
import { Rating } from '../Rating';
import { Button } from '../Button';
import { QuestionModal } from '../QuestionModal';
import { Input } from '../Input';
import { generateUID, getCredential, normalizeSchema } from '../../utils';
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
}

const reviewValuesInitialState = {
  title: '',
  rating: 2,
  description: ''
};

export const Review = (props: IReviewProps) => {
  const { krebiter, proofUrl, defaultSkills } = props;
  const { walletInformation, profileInformation, auth } =
    useContext(GeneralContext);
  const [shouldAddNewComment, setShouldAddNewComment] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [comments, setComments] = useState<IComment[]>([]);
  const [reviewValues, setReviewValues] = useState(reviewValuesInitialState);

  useEffect(() => {
    if (!krebiter) return;
    if (auth.status !== 'resolved') return;
    if (!walletInformation) return;

    const getComments = async () => {
      const comments = await walletInformation?.publicPassport?.getCredentials(
        undefined,
        'Review'
      );

      let data = [];

      if (comments.length > 0) {
        data = await Promise.all(
          comments.map(async comment => {
            const values = JSON.parse(comment.credentialSubject.value);

            const credential = await walletInformation.passport.getCredential(
              comment.id
            );

            const reputation = await Krebit.lib.graph.erc20BalanceQuery(
              credential.issuer.ethereumAddress
            );
            const profile = await normalizeSchema.profile({
              orbis: walletInformation.orbis,
              did: values.entity,
              reputation
            });

            return {
              picture: profile.picture,
              name: profile.name,
              did: profile.did,
              reputation: profile.reputation,
              streamId: comment.id,
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

    const initialCredential = {
      values: {
        ...reviewValues,
        proof: proofUrl || '',
        entity: profileInformation.authenticatedProfile.did,
        issueTo: [address],
        skills: defaultSkills.map(skill => {
          return {
            skillId: skill,
            score: 100
          };
        })
      },
      tags: defaultSkills,
      verificationUrl: `https://node1.krebit.id/delegated`,
      did: 'did:pkh:eip155:137:0x5AFd488fe9843E51db54B2262F247572926aea5F',
      ethereumAddress: '0x5AFd488fe9843E51db54B2262F247572926aea5F',
      credentialType: 'Review',
      credentialSchema: 'krebit://schemas/recommendation',
      credentialSubjectListUrl: '',
      imageUrl: ''
    };

    try {
      // Step 1-A:  Get credential from Master Issuer based on claim:
      // Issue self-signed credential to become an Issuer
      console.log('add: ', walletInformation.address);
      console.log('did: ', walletInformation.issuer.did);

      let typeSchemaUrl = await walletInformation.issuer.getTypeSchema(
        'Issuer'
      );

      if (!typeSchemaUrl) {
        const issuerSchema = Krebit.schemas.claims.issuer;
        typeSchemaUrl = await walletInformation.issuer.setTypeSchema(
          'Issuer',
          issuerSchema
        );
      }

      const expirationDate = new Date();
      const expiresYears = 1;
      expirationDate.setFullYear(expirationDate.getFullYear() + expiresYears);
      console.log('expirationDate: ', expirationDate);

      const claim = {
        id: `issuer-${generateUID(10)}`,
        did: walletInformation.issuer.did,
        ethereumAddress: walletInformation.address,
        type: 'Issuer',
        typeSchema: 'krebit://schemas/issuer',
        tags: ['Community', `${initialCredential.credentialType}Issuer`],
        value: initialCredential,
        expirationDate: new Date(expirationDate).toISOString()
      };
      console.log('claim: ', claim);

      const delegatedCredential = await walletInformation.issuer.issue(claim);
      console.log('delegatedCredential: ', delegatedCredential);

      let credentialId: string;

      // Save delegatedCredential
      if (delegatedCredential) {
        const delegatedCredentialId =
          await walletInformation.passport.addIssued(delegatedCredential);
        console.log('delegatedCredentialId: ', delegatedCredentialId);

        // Step 1-B: Send self-signed credential to the Issuer for verification
        const issuedCredential = await getCredential({
          verifyUrl: 'https://node1.krebit.id/issuer',
          claimedCredentialId: delegatedCredentialId
        });

        console.log('issuedCredential: ', issuedCredential);

        // Step 1-C: Get the verifiable credential, and save it to the passport
        if (issuedCredential) {
          const addedCredentialId =
            await walletInformation.passport.addCredential(issuedCredential);

          credentialId = addedCredentialId;
          console.log('addedCredentialId: ', addedCredentialId);
        }
      }

      const currentConversations =
        await walletInformation.orbis.getConversations({
          did: profileInformation.authenticatedProfile.did
        });

      const conversationsWithMe = currentConversations?.data?.filter(
        conversation =>
          conversation?.recipients.includes(
            profileInformation.authenticatedProfile.did
          )
      );
      const conversationWithJustMe = conversationsWithMe?.find(
        conversation => conversation?.recipients?.length === 2
      );

      let conversationId: string;

      if (!credentialId) return;

      if (conversationWithJustMe) {
        conversationId = conversationWithJustMe.stream_id;
      } else {
        const response = await walletInformation.orbis.createConversation({
          recipients: [profileInformation.profile.did]
        });

        conversationId = response.doc;
      }

      const url = `https://krebit.id/claim/?credential_id=${credentialId}`;

      await walletInformation.orbis.sendMessage({
        conversation_id: conversationId,
        body: `hey dude, I just sent you a review, pretty cool work you making hah! ${url}`
      });

      handleShouldAddNewComment();
      handleTaskCompleted();
    } catch (error) {
      console.error(error);
    }
  };

  if (!profileInformation.profile) return;

  return (
    <>
      {shouldAddNewComment && (
        <QuestionModal
          title="Add new Review"
          component={() => (
            <QuestionModalForm>
              <Input
                name="title"
                placeholder="Review title"
                value={reviewValues.title}
                onChange={handleChange}
              />
              <Rating
                name="rating"
                label="Rating: 2.5/5"
                value={reviewValues.rating}
                onChange={handleChange}
              />
              <Input
                name="description"
                placeholder="Write your review notes here"
                value={reviewValues.description}
                onChange={handleChange}
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
      <Wrapper image={profileInformation.profile.picture}>
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
            <Button text="Connect" onClick={auth.connect} />
          ) : (
            <Button text="Comment" onClick={handleShouldAddNewComment} />
          )}
        </div>
        <div className="comments">
          {comments.map((comment, index) => (
            <Comment image={comment.picture} key={index}>
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
