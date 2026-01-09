import type { SignedOrderPayload } from "../types/orders";

export interface PostOrderParams {
  baseUrl?: string;
  address: string;           // adresse signataire
  ownerApiKey: string;       // l2.key renvoyée par pm-derive
  orderType: "GTC" | "FOK" | "GTD";
  order: SignedOrderPayload; // objet renvoyé par buildAndSignYesNoOrder()
}

export async function postSignedOrder(params: PostOrderParams) {
  const { baseUrl = "/functions/v1", ...body } = params;

  const response = await fetch(`${baseUrl}/pm-post-order`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Failed to post order:', response.status, errorText);
    throw new Error(`Failed to post order: ${errorText}`);
  }

  const result = await response.json();
  
  return result;
}
