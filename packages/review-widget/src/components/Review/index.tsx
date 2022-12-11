import { ChangeEvent, useEffect, useState } from 'react';
import Krebit from '@krebitdao/reputation-passport';
import { Orbis } from '@orbisclub/orbis-sdk';
import LitJsSdk from '@lit-protocol/sdk-browser';

import { Comment, QuestionModalForm, Wrapper } from './styles';
import { Rating } from '../Rating';
import { Button } from '../Button';
import { QuestionModal } from '../QuestionModal';
import { Input } from '../Input';
import {
  generateUID,
  getCredential,
  getWalletInformation,
  normalizeSchema
} from '../../utils';

// types
import { IProfile } from '../../utils/normalizeSchema';
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

interface IProps {
  identifier: string;
}

const reviewValuesInitialState = {
  title: '',
  rating: 2,
  description: '',
  proof: '',
  skills: ''
};

export const Review = (props: IProps) => {
  const { identifier } = props;
  const [profile, setProfile] = useState<IProfile>();
  const [walletInformation, setWalletInformation] =
    useState<IWalletInformation>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shouldAddNewComment, setShouldAddNewComment] = useState(false);
  const [comments, setComments] = useState<IComment[]>([]);
  const [reviewValues, setReviewValues] = useState(reviewValuesInitialState);

  useEffect(() => {
    if (!identifier) {
      throw new Error('No identifier defined');
    }

    const getProfile = async () => {
      const publicPassport = new Krebit.core.Passport({
        network: 'polygon'
      });
      const orbis = new Orbis();

      const information = await getWalletInformation();
      await publicPassport.read(identifier);

      const profile = await normalizeSchema.profile({
        orbis,
        passport: publicPassport
      });

      const isAuthenticated = await publicPassport.isConnected();

      if (isAuthenticated) {
        setIsAuthenticated(true);
      }

      setWalletInformation(information);
      setProfile(profile);
    };

    getProfile();
  }, [identifier]);

  const connect = async () => {
    if (!walletInformation) return;

    let defaultChainId = '1';

    /** Check if the user trying to connect already has an existing did on Orbis */
    let defaultDID = await Krebit.lib.orbis.getDefaultDID(
      walletInformation.address
    );

    if (defaultDID) {
      let _didArr = defaultDID.split(':');
      defaultChainId = _didArr[3];
    }

    const passport = new Krebit.core.Passport({
      ...walletInformation,
      litSdk: LitJsSdk
    });
    await passport.connect(null, defaultChainId);
    setIsAuthenticated(true);
  };

  const handleShouldAddNewComment = () => {
    setShouldAddNewComment(prevValue => !prevValue);
    setReviewValues(reviewValuesInitialState);
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
      const issuer = new Krebit.core.Krebit({
        ...walletInformation,
        litSdk: LitJsSdk
      });
      const passport = new Krebit.core.Passport({
        ...walletInformation,
        litSdk: LitJsSdk
      });

      const session = window.localStorage.getItem('did-session');
      const currentSession = JSON.parse(session);

      await issuer.connect(currentSession);
      await passport.connect(currentSession);

      // Step 1-A:  Get credential from Master Issuer based on claim:
      // Issue self-signed credential to become an Issuer
      console.log('add: ', walletInformation.address);
      console.log('did: ', issuer.did);

      let typeSchemaUrl = await issuer.getTypeSchema('Issuer');

      if (!typeSchemaUrl) {
        const issuerSchema = Krebit.schemas.claims.issuer;
        typeSchemaUrl = await issuer.setTypeSchema('Issuer', issuerSchema);
      }

      const expirationDate = new Date();
      const expiresYears = 1;
      expirationDate.setFullYear(expirationDate.getFullYear() + expiresYears);
      console.log('expirationDate: ', expirationDate);

      const claim = {
        id: `issuer-${generateUID(10)}`,
        did: issuer.did,
        ethereumAddress: walletInformation.address,
        type: 'Issuer',
        typeSchema: 'krebit://schemas/issuer',
        tags: ['Community', `${initialCredential.credentialType}Issuer`],
        value: initialCredential,
        expirationDate: new Date(expirationDate).toISOString()
      };
      console.log('claim: ', claim);

      const delegatedCredential = await issuer.issue(claim);
      console.log('delegatedCredential: ', delegatedCredential);

      // Save delegatedCredential
      if (delegatedCredential) {
        const delegatedCredentialId = await passport.addIssued(
          delegatedCredential
        );
        console.log('delegatedCredentialId: ', delegatedCredentialId);

        // Step 1-B: Send self-signed credential to the Issuer for verification
        const issuedCredential = await getCredential({
          verifyUrl: 'https://node1.krebit.id/issuer',
          claimedCredentialId: delegatedCredentialId
        });

        console.log('issuedCredential: ', issuedCredential);

        // Step 1-C: Get the verifiable credential, and save it to the passport
        if (issuedCredential) {
          const addedCredentialId = await passport.addCredential(
            issuedCredential
          );

          console.log('addedCredentialId: ', addedCredentialId);
        }
      }

      const newComment = {
        picture: profile.picture,
        name: profile.name,
        comment: {
          rating: reviewValues.rating,
          description: reviewValues.description
        }
      };

      setComments(prevValues => [newComment, ...prevValues]);
      handleShouldAddNewComment();
    } catch (error) {
      console.error(error);
    }
  };

  if (!profile) return;

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
      <Wrapper image={profile.picture}>
        <div className="user">
          <div className="user-image"></div>
          <div className="user-content">
            <p className="user-name">
              {profile.name} <span>{profile.reputation} Krebits</span>
            </p>
            <p className="user-description">{profile.description}</p>
          </div>
        </div>
        <div className="comment-action">
          {!isAuthenticated ? (
            <Button text="Connect" onClick={connect} />
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
