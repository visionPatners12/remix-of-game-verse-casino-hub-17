import { TypedDataDomain, TypedDataField, Signer } from "ethers";
import type { SignedOrderPayload } from "../types/orders";

export type Side = "BUY" | "SELL";

export interface OrderParams {
  tokenId: string;  // clobTokenId: YES ou NO selon le bouton
  price: number;    // ex: 0.016
  size: number;     // en USDC (respecte orderMinSize)
  side: Side;       // POUR=BUY sur YES, CONTRE=BUY sur NO
  expiration: number; // unix timestamp
  chainId?: number;   // 137 pour Polygon
}

export interface SignedOrder {
  order: SignedOrderPayload;
}

/**
 * Build and sign a YES/NO order using the provided signer.
 * @param params - Order parameters
 * @param signer - Ethers signer from Privy wallet
 */
export async function buildAndSignYesNoOrder(
  params: OrderParams,
  signer: Signer
): Promise<SignedOrder> {
  const { tokenId, price, size, side, expiration, chainId = 137 } = params;
  
  const address = await signer.getAddress();

  // EIP-712 domain
  const domain: TypedDataDomain = {
    name: "Polymarket CTF Exchange",
    version: "1",
    chainId,
    verifyingContract: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E" // Contract address sur Polygon
  };

  // EIP-712 types
  const types: Record<string, TypedDataField[]> = {
    Order: [
      { name: "salt", type: "uint256" },
      { name: "maker", type: "address" },
      { name: "signer", type: "address" },
      { name: "taker", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "makerAmount", type: "uint256" },
      { name: "takerAmount", type: "uint256" },
      { name: "expiration", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "feeRateBps", type: "uint256" },
      { name: "side", type: "uint8" },
      { name: "signatureType", type: "uint8" }
    ]
  };

  // Order value
  const value: Record<string, unknown> = {
    salt: Math.floor(Math.random() * 1000000000),
    maker: address,
    signer: address,
    taker: "0x0000000000000000000000000000000000000000", // Anyone can take
    tokenId: tokenId,
    makerAmount: String(Math.floor(size * 1e6)), // USDC has 6 decimals
    takerAmount: String(Math.floor(price * size * 1e6)), // Price * size in USDC
    expiration: String(expiration),
    nonce: Math.floor(Date.now() / 1000), // Simple nonce
    feeRateBps: "0", // 0 basis points fee for now
    side: side === "BUY" ? 0 : 1, // 0 = BUY, 1 = SELL
    signatureType: 0 // EOA signature
  };

  // Sign the EIP-712 typed data
  const signature = await signer.signTypedData(domain, types, value);

  // Build the signed payload
  const signedPayload: SignedOrderPayload = { 
    domain: {
      name: domain.name || '',
      version: domain.version || '',
      chainId: Number(domain.chainId),
      verifyingContract: domain.verifyingContract || '',
    },
    types: {
      Order: types.Order,
    },
    value: {
      salt: value.salt as number,
      maker: value.maker as string,
      signer: value.signer as string,
      taker: value.taker as string,
      tokenId: value.tokenId as string,
      makerAmount: value.makerAmount as string,
      takerAmount: value.takerAmount as string,
      expiration: value.expiration as string,
      nonce: value.nonce as number,
      feeRateBps: value.feeRateBps as string,
      side: value.side as number,
      signatureType: value.signatureType as number,
    },
    signature 
  };

  return { order: signedPayload };
}
