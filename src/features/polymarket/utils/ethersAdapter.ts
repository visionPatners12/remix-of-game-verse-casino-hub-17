/**
 * Wrapper to make ethers v6 signer compatible with libraries expecting ethers v5
 * 
 * The @polymarket/clob-client expects signer._signTypedData() which exists in ethers v5
 * In ethers v6, this method was renamed to signTypedData() (without underscore)
 */

import { logger } from '@/utils/logger';

export function wrapSignerForV5Compat(signer: any): any {
  // If already has _signTypedData, return as-is
  if (typeof signer._signTypedData === 'function') {
    logger.info('[EthersAdapter] Signer already has _signTypedData, no wrapping needed');
    return signer;
  }

  logger.info('[EthersAdapter] Wrapping ethers v6 signer for v5 compatibility');

  // Create a proxy that adds _signTypedData
  return new Proxy(signer, {
    get(target, prop, receiver) {
      if (prop === '_signTypedData') {
        // Return a function that calls signTypedData (v6 method)
        return async (domain: any, types: any, value: any) => {
          logger.info('[EthersAdapter] _signTypedData called, delegating to signTypedData');
          return target.signTypedData(domain, types, value);
        };
      }
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    }
  });
}
