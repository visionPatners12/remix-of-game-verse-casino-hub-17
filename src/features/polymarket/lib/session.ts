import { BrowserProvider, Eip1193Provider } from "ethers";

export interface ClobSession {
  address: string;
  l2: {
    key: string;
    passphrase: string;
  };
}

/**
 * Initialize CLOB session with the provided Ethereum provider.
 * @param ethereumProvider - The Ethereum provider from Privy wallet (use privyWallet.getEthereumProvider())
 * @param baseUrl - Base URL for edge functions
 */
export async function initClobSession(
  ethereumProvider: Eip1193Provider,
  baseUrl = "/functions/v1"
): Promise<ClobSession> {
  const provider = new BrowserProvider(ethereumProvider);
  const signer = await provider.getSigner();
  const address = (await signer.getAddress()).toLowerCase();

  // Challenge local (signature EIP-712 ClobAuth)
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = 0;
  const message = "This message attests that I control the given wallet";

  const domain = { 
    name: "ClobAuthDomain", 
    version: "1", 
    chainId: 137 
  };
  
  const types = { 
    ClobAuth: [
      { name: "address", type: "address" },
      { name: "timestamp", type: "string" },
      { name: "nonce", type: "uint256" },
      { name: "message", type: "string" },
    ]
  };

  const value = { address, timestamp, nonce, message };

  // Sign EIP-712 typed data
  const signature = await signer.signTypedData(domain, types, value);

  // Derive L2 via Edge Function
  const response = await fetch(`${baseUrl}/pm-derive`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address, timestamp, nonce, signature })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to derive L2 credentials: ${errorText}`);
  }

  const l2 = await response.json();

  return { address, l2 };
}
