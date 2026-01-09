import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createThirdwebClient, getContract } from "https://esm.sh/thirdweb@5";
import { mintTo } from "https://esm.sh/thirdweb@5/extensions/erc721";
import { privateKeyToAccount } from "https://esm.sh/thirdweb@5/wallets";
import { sendAndConfirmTransaction } from "https://esm.sh/thirdweb@5/transaction";
import { polygon } from "https://esm.sh/thirdweb@5/chains";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('NFT minting request received');
    
    const { to, name, description, attributes }: {
      to: string;
      name?: string;
      description?: string;
      attributes?: Array<{trait_type: string; value: string | number}>;
    } = await req.json();
    console.log('Request body:', { to, name, description, attributes });

    // Validate required fields
    if (!to) {
      console.error('Missing wallet address');
      return new Response(
        JSON.stringify({ success: false, error: 'Wallet address is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get environment variables
    const thirdwebSecretKey = Deno.env.get('THIRDWEB_SECRET_KEY');
    const adminPrivateKey = Deno.env.get('THIRDWEB_ADMIN_PRIVATE_KEY');
    const contractAddress = Deno.env.get('NFT_CONTRACT_ADDRESS');

    if (!thirdwebSecretKey || !adminPrivateKey) {
      console.error('Missing Thirdweb configuration');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!contractAddress) {
      console.error('Missing NFT contract address');
      return new Response(
        JSON.stringify({ success: false, error: 'NFT contract not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Creating Thirdweb client');
    
    // Create Thirdweb client
    const client = createThirdwebClient({
      secretKey: thirdwebSecretKey,
    });

    // Create admin account from private key
    const adminAccount = privateKeyToAccount({
      client,
      privateKey: adminPrivateKey,
    });

    const contract = getContract({
      client,
      chain: polygon,
      address: contractAddress,
    });

    console.log('Preparing NFT metadata');

    // Prepare NFT metadata
    const nftMetadata = {
      name: name || "Betting Slip NFT",
      description: description || "A unique betting slip commemorating your predictions",
      attributes: attributes || [],
    };

    console.log('Minting NFT with metadata:', nftMetadata);

    // Prepare the mint transaction
    const mintTransaction = mintTo({
      contract,
      to,
      nft: nftMetadata,
    });

    // Send and confirm the transaction
    const receipt = await sendAndConfirmTransaction({
      transaction: mintTransaction,
      account: adminAccount,
    });

    console.log('NFT minted successfully:', receipt);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          metadata: nftMetadata,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: unknown) {
    console.error('Error minting NFT:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mint NFT',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});