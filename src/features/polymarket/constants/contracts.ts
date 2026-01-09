// Polygon Mainnet Configuration for Polymarket Trading

export const POLYGON_CHAIN_ID = 137;

// API URLs
export const CLOB_API_URL = "https://clob.polymarket.com";
export const RELAYER_API_URL = "https://relayer-v2.polymarket.com/";

// Edge function for builder signing (relative to Supabase URL)
export const BUILDER_SIGN_ENDPOINT = "/functions/v1/polymarket-builder-sign";

// Token Addresses (Polygon Mainnet)
export const USDC_E_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
export const CTF_CONTRACT_ADDRESS = "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045";

// Exchange Addresses
export const CTF_EXCHANGE_ADDRESS = "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E";
export const NEG_RISK_CTF_EXCHANGE = "0xC5d563A36AE78145C45a50134d48A1215220f80a";
export const NEG_RISK_ADAPTER = "0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296";

// Safe Factory for deriving Safe addresses
export const SAFE_FACTORY_ADDRESS = "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2";

// All spenders that need USDC.e approval
export const USDC_SPENDERS = [
  CTF_CONTRACT_ADDRESS,
  CTF_EXCHANGE_ADDRESS,
  NEG_RISK_CTF_EXCHANGE,
  NEG_RISK_ADAPTER,
] as const;

// All operators that need CTF (ERC-1155) approval
export const CTF_OPERATORS = [
  CTF_EXCHANGE_ADDRESS,
  NEG_RISK_CTF_EXCHANGE,
  NEG_RISK_ADAPTER,
] as const;

// ABI fragments for approval transactions
export const ERC20_APPROVE_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const ERC1155_SET_APPROVAL_ABI = [
  {
    name: "setApprovalForAll",
    type: "function",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "isApprovedForAll",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// Max uint256 for unlimited approval
export const MAX_UINT256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
