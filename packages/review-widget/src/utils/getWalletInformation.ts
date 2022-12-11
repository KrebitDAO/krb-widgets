import { ethers } from 'ethers';
import Krebit from '@krebitdao/reputation-passport';

export const getWalletInformation = async () => {
  if (!(window as any).ethereum) return;

  const addresses = await (window as any).ethereum.request({
    method: 'eth_requestAccounts'
  });
  const address = addresses[0];
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  await Krebit.lib.ethereum.switchNetwork((window as any).ethereum);
  const wallet = provider.getSigner();

  return {
    ethProvider: provider.provider,
    address,
    wallet
  };
};
