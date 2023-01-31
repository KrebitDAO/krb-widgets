import { FunctionComponent, createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LitJsSdk from '@lit-protocol/sdk-browser';
import Krebit from '@krebitdao/reputation-passport';
import { Orbis } from '@orbisclub/orbis-sdk';
import { Web3Auth } from '@web3auth/modal';
import { WALLET_ADAPTERS, CHAIN_NAMESPACES } from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { TorusWalletAdapter } from '@web3auth/torus-evm-adapter';
import { TorusWalletConnectorPlugin } from '@web3auth/torus-wallet-connector-plugin';
import {
  config as PassportConfig,
  isProduction as PassportConfigIsProduction
} from '@krebitdao/reputation-passport/dist/config';
import { schemas as PassportSchema } from '@krebitdao/reputation-passport/dist/schemas';

import { getWalletInformation, normalizeSchema } from '../utils';
import { theme } from '../theme';

// types
import { IProfile } from '../utils/normalizeSchema';
import { Passport } from '@krebitdao/reputation-passport/dist/core/Passport';
import { Krebit as Issuer } from '@krebitdao/reputation-passport/dist/core/Krebit';
import { IReviewProps } from '../components/Review';

interface IProps extends IReviewProps {
  children: JSX.Element;
}

export interface IWalletInformation {
  ethProvider: ethers.providers.ExternalProvider;
  address: string;
  wallet: ethers.providers.JsonRpcSigner;
}

export const GeneralContext = createContext(undefined);

export const GeneralProvider: FunctionComponent<IProps> = props => {
  const { children, krebiter, isDarkMode } = props;
  const [profile, setProfile] = useState<IProfile | undefined>();
  const [authenticatedProfile, setAuthenticatedProfile] = useState<
    IProfile | undefined
  >();
  const [openConnectWallet, setOpenConnectWallet] = useState(false);
  const [status, setStatus] = useState('idle');
  const [passport, setPassport] = useState<Passport>();
  const [issuer, setIssuer] = useState<Issuer>();
  const [publicPassport, setPublicPassport] = useState<Passport>();
  const [orbis, setOrbis] = useState<Orbis>();
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [walletInformation, setWalletInformation] = useState<
    IWalletInformation | undefined
  >();

  useEffect(() => {
    const isAuthenticated = async () => {
      setStatus('pending');

      if (!krebiter) {
        throw new Error('No krebiter defined');
      }

      const publicPassport = new Krebit.core.Passport();
      setPublicPassport(publicPassport);

      const orbis = new Orbis();
      setOrbis(orbis);

      const { web3auth, provider } = await initWeb3Auth();
      setWeb3auth(web3auth);

      await publicPassport.read(krebiter);

      const profile = await normalizeSchema.profile({
        orbis,
        passport: publicPassport
      });
      setProfile(profile);

      const currentType = localStorage.getItem('auth-type');

      if (!currentType) {
        setStatus('resolved');
        return;
      }

      let information: IWalletInformation;

      if (currentType === 'metamask' || currentType === 'wallet_connect') {
        information = await getWalletInformation(currentType);
      }

      if (currentType === 'web3auth') {
        information = await getWalletInformation(currentType, provider);
      }

      if (!information) {
        await logout();
        throw new Error('Not wallet defined');
      }

      setWalletInformation(information);

      const passport = new Krebit.core.Passport({
        ...information,
        litSdk: LitJsSdk
      });
      const isPassportConnected = await passport.isConnected();

      const issuer = new Krebit.core.Krebit({
        ...information,
        litSdk: LitJsSdk
      });
      const isIssuerConnected = await issuer.isConnected();

      const isOrbisConnected = await orbis.isConnected();

      if (isPassportConnected && isIssuerConnected && isOrbisConnected) {
        const currentProfile = await normalizeSchema.profile({
          passport,
          orbis
        });

        setPassport(passport);
        setIssuer(issuer);
        setAuthenticatedProfile(currentProfile);
      }

      setStatus('resolved');
    };

    isAuthenticated();
  }, []);

  useEffect(() => {
    if (!window) return;

    const rememberSession = window.localStorage.getItem(
      'krebit-remember-session'
    );

    if (rememberSession !== 'ACTIVE') return;

    const handleTabClose = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      window.localStorage.clear();
    };

    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  const initWeb3Auth = async () => {
    try {
      const web3auth = new Web3Auth({
        clientId: process.env.NEXT_PUBLIC_WEB3_AUTH,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: ethers.utils.hexValue(
            PassportSchema.krbToken[PassportConfig.state.network].domain.chainId
          ),
          rpcTarget: PassportConfig.state.rpcUrl
        },
        uiConfig: {
          theme: isDarkMode ? 'dark' : 'light',
          loginMethodsOrder: ['google', 'facebook', 'twitter', 'discord'],
          appLogo: 'https://krebit.id/imgs/logos/Krebit.svg'
        }
      });

      const openloginAdapter = new OpenloginAdapter({
        adapterSettings: {
          clientId: process.env.NEXT_PUBLIC_WEB3_AUTH,
          network: PassportConfigIsProduction ? 'cyan' : 'testnet',
          uxMode: 'popup',
          whiteLabel: {
            name: 'Krebit.id',
            logoLight: 'https://krebit.id/imgs/logos/Krebit.svg',
            logoDark: 'https://krebit.id/imgs/logos/Krebit.svg',
            defaultLanguage: 'en',
            dark: isDarkMode
          }
        }
      });
      const torusWalletAdapter = new TorusWalletAdapter({
        clientId: process.env.NEXT_PUBLIC_WEB3_AUTH,
        initParams: {
          whiteLabel: {
            theme: {
              isDark: isDarkMode,
              colors: { torusBrand1: theme.colors.cyan }
            },
            logoLight: 'https://krebit.id/imgs/images/wallet.svg',
            logoDark: 'https://krebit.id/imgs/images/wallet.svg',
            defaultLanguage: 'en',
            topupHide: false,
            featuredBillboardHide: false,
            disclaimerHide: true
          }
        }
      });

      web3auth.configureAdapter(openloginAdapter);
      web3auth.configureAdapter(torusWalletAdapter);

      const torusPlugin = new TorusWalletConnectorPlugin({
        torusWalletOpts: {
          buttonPosition: 'bottom-right'
        },
        walletInitOptions: {
          whiteLabel: {
            theme: {
              isDark: isDarkMode,
              colors: { primary: theme.colors.cyan }
            },
            logoLight: 'https://krebit.id/imgs/images/wallet.svg',
            logoDark: 'https://krebit.id/imgs/images/wallet.svg'
          },
          useWalletConnect: true,
          enableLogging: false
        }
      });
      await web3auth.addPlugin(torusPlugin);

      await web3auth.initModal({
        [WALLET_ADAPTERS.OPENLOGIN]: {
          showOnModal: true
        }
      });

      return {
        web3auth,
        provider: torusPlugin?.proxyProvider || web3auth.provider
      };
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenConnectWallet = () => {
    setOpenConnectWallet(prevState => !prevState);
  };

  const handleRememberSession = () => {
    if (!window) return;

    window.localStorage.setItem('krebit-remember-session', 'ACTIVE');
  };

  const connect = async (type: string) => {
    setStatus('pending');

    try {
      let information: IWalletInformation;

      if (type === 'metamask' || type === 'wallet_connect') {
        information = await getWalletInformation(type);
      }

      if (type === 'web3auth') {
        const web3authProvider = await web3auth.connect();
        information = await getWalletInformation(type, web3authProvider);
      }

      if (!information) {
        throw new Error('Not wallet defined');
      }

      setWalletInformation(information);
      localStorage.setItem('auth-type', type);

      const orbis = new Orbis();
      setOrbis(orbis);

      let defaultChainId = '1';
      /** Check if the user trying to connect already has an existing did on Orbis */
      let defaultDID = await Krebit.lib.orbis.getDefaultDID(
        information.address
      );

      if (defaultDID) {
        let _didArr = defaultDID.split(':');
        defaultChainId = _didArr[3];
      }

      const passport = new Krebit.core.Passport({
        ...information,
        litSdk: LitJsSdk
      });
      const passportConnection = await passport.connect(null, defaultChainId);

      const session = window.localStorage.getItem('did-session');
      const currentSession = JSON.parse(session);

      const issuer = new Krebit.core.Krebit({
        ...information,
        litSdk: LitJsSdk
      });
      const issuerConnection = await issuer.connect(currentSession);

      if (passportConnection && issuerConnection) {
        setPassport(passport);
        setIssuer(issuer);

        const orbisConnection = await orbis.connect_v2({
          provider: information.ethProvider,
          lit: true
        });

        if (orbisConnection) {
          const currentProfile = await normalizeSchema.profile({
            passport,
            orbis
          });

          setAuthenticatedProfile(currentProfile);
          setStatus('resolved');
        }

        return information;
      }
    } catch (error) {
      console.error(error);
      setStatus('rejected');
    }
  };

  const logout = async () => {
    if (!window) return;

    const currentAuthType = window.localStorage.getItem('auth-type');

    if (currentAuthType === 'web3auth' && web3auth) {
      await web3auth.logout();
    }

    if (orbis) {
      await orbis.logout();
    }

    window.localStorage.removeItem('auth-type');
    window.localStorage.removeItem('did-session');
    window.localStorage.removeItem('krebit-remember-session');
  };

  return (
    <GeneralContext.Provider
      value={{
        walletModal: {
          handleOpenConnectWallet,
          setOpenConnectWallet,
          openConnectWallet
        },
        auth: {
          connect,
          isAuthenticated: status === 'resolved' && !!passport?.did,
          status,
          did: passport?.did,
          logout,
          handleRememberSession
        },
        walletInformation: {
          ...walletInformation,
          passport,
          issuer,
          publicPassport,
          orbis
        },
        profileInformation: {
          profile,
          authenticatedProfile
        }
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};
