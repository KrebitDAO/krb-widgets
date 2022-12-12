import { ChangeEvent, useContext, useState } from 'react';
import Krebit from '@krebitdao/reputation-passport';

import { Comment, QuestionModalForm, Wrapper } from './styles';
import { Rating } from '../Rating';
import { Button } from '../Button';
import { QuestionModal } from '../QuestionModal';
import { Input } from '../Input';
import { generateUID, getCredential } from '../../utils';
import { GeneralContext } from '../../context';

// types
import { ExternalProvider } from '@ethersproject/providers';
import { JsonRpcSigner } from '@ethersproject/providers';

interface IWalletInformation {
  ethProvider: ExternalProvider;
  address: string;
  wallet: JsonRpcSigner;
}

interface IComment {
  picture: string;
  name: string;
  comment: {
    rating: number;
    description: string;
  };
}

export interface IReviewProps {
  identifier: string;
}

const reviewValuesInitialState = {
  title: '',
  rating: 2,
  description: '',
  proof: '',
  skills: ''
};

export const Review = (props: IReviewProps) => {
  const { identifier } = props;
  const { walletInformation, profileInformation, auth } =
    useContext(GeneralContext);
  const [shouldAddNewComment, setShouldAddNewComment] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [comments, setComments] = useState<IComment[]>([]);
  const [reviewValues, setReviewValues] = useState(reviewValuesInitialState);

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

    const skills =
      reviewValues?.skills
        ?.trim()
        .split(',')
        .map(skill => skill.trim()) || [];

    const initialCredential = {
      values: {
        ...reviewValues,
        issueTo: [identifier],
        skills: skills.map(skill => {
          return {
            skillId: skill,
            score: 100
          };
        })
      },
      tags: skills,
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
                label="Rating: 5/10"
                value={reviewValues.rating}
                onChange={handleChange}
              />
              <Input
                name="description"
                placeholder="Write your review notes here"
                value={reviewValues.description}
                onChange={handleChange}
              />
              <Input
                type="url"
                name="proof"
                placeholder="Proof url"
                value={reviewValues.proof}
                onChange={handleChange}
              />
              <Input
                name="skills"
                placeholder="Skills by comma"
                value={reviewValues.skills}
                onChange={handleChange}
              />
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
            <p className="user-name">
              {profileInformation.profile.name}{' '}
              <span>{profileInformation.profile.reputation} Krebits</span>
            </p>
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
                  <p className="comment-header-content-name">{comment.name}</p>
                  <div className="comment-header-content-stars">
                    <Rating
                      label=""
                      value={comment.comment.rating}
                      readOnly={true}
                    />
                  </div>
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
