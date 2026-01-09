/**
 * Types for Polymarket order signing and submission
 */

export interface OrderDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface OrderTypeField {
  name: string;
  type: string;
}

export interface OrderTypes {
  Order: OrderTypeField[];
}

export interface OrderValue {
  salt: number;
  maker: string;
  signer: string;
  taker: string;
  tokenId: string;
  makerAmount: string;
  takerAmount: string;
  expiration: string;
  nonce: number;
  feeRateBps: string;
  side: number;
  signatureType: number;
}

export interface TypedOrderData {
  domain: OrderDomain;
  types: OrderTypes;
  value: OrderValue;
}

export interface SignedOrderPayload extends TypedOrderData {
  signature: string;
}
