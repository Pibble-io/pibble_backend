import bitcoin from './index';

export async function withdrawBitcoin(recipient, value) {
  try {
    return await bitcoin.sendToAddress(recipient, value);
  } catch (ex) {
    console.log('BTC Tx Error: ', ex);
    return null;
  }
}