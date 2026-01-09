import { type ThirdWebNFTsResponse } from '../types';

const CHAIN_ID = 137; // Polygon mainnet
const COLLECTION_ADDRESS = "0x402b898335B918d38AdF5A31654C2E59279AD0b2";
const CLIENT_ID = "7664bfb40927b7688babc12152f89138";

// Convert IPFS URLs to HTTP using ThirdWeb CDN
export function ipfsToHttp(url: string | null | undefined): string | null {
  if (typeof url === 'string' && url.startsWith('ipfs://')) {
    return 'https://ipfs.thirdwebcdn.com/ipfs/' + url.replace('ipfs://', '');
  }
  return url || null;
}

// Normalize media URLs - handles IPFS, HTTP, data URLs
export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Already valid HTTP/HTTPS URL - return as-is (don't re-transform!)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // IPFS protocol - convert to ThirdWeb CDN
  if (url.startsWith('ipfs://')) {
    return 'https://ipfs.thirdwebcdn.com/ipfs/' + url.replace('ipfs://', '');
  }
  
  // Data URL (base64)
  if (url.startsWith('data:')) {
    return url;
  }
  
  return null;
}

// Select best available media URL with priority
export function getBestMediaUrl(nft: any): string {
  // Priority: image_url > animation_url > video_url > extra_metadata.image_url > collection.image_url > placeholder
  const candidates = [
    nft.image_url,
    nft.animation_url,
    nft.video_url,
    nft.extra_metadata?.image_url,
    nft.collection?.image_url,
    nft.collection?.featured_image_url,
  ];
  
  for (const url of candidates) {
    const normalized = normalizeMediaUrl(url);
    if (normalized) return normalized;
  }
  
  return '/placeholder.svg';
}

export async function fetchUserNFTs(ownerAddress: string): Promise<ThirdWebNFTsResponse> {
  const baseUrl = `https://${CHAIN_ID}.insight.thirdweb.com/v1`;
  const url = `${baseUrl}/nfts/balance/${ownerAddress}`;
  
  const params = new URLSearchParams({
    metadata: 'true',
    contract_address: COLLECTION_ADDRESS,
    limit: '50'
  });

    try {
    
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'x-client-id': CLIENT_ID,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`ThirdWeb API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Debug log to inspect API response
    console.log('🖼️ NFT API Response sample:', {
      total: result.data?.length,
      firstNFT: result.data?.[0] ? {
        name: result.data[0].name,
        image_url: result.data[0].image_url,
        animation_url: result.data[0].animation_url,
        video_url: result.data[0].video_url,
        extra_metadata_image: result.data[0].extra_metadata?.image_url,
        collection_image: result.data[0].collection?.image_url,
      } : null
    });
    
    // Process the API data structure - normalize all media URLs
    const processedData = result.data?.map((nft: any) => {
      const processed = {
        ...nft,
        // Normalize all media URLs
        image_url: normalizeMediaUrl(nft.image_url),
        video_url: normalizeMediaUrl(nft.video_url),
        animation_url: normalizeMediaUrl(nft.animation_url),
        extra_metadata: {
          ...nft.extra_metadata,
          image_url: normalizeMediaUrl(nft.extra_metadata?.image_url),
        },
        collection: nft.collection ? {
          ...nft.collection,
          image_url: normalizeMediaUrl(nft.collection?.image_url),
          banner_image_url: normalizeMediaUrl(nft.collection?.banner_image_url),
          featured_image_url: normalizeMediaUrl(nft.collection?.featured_image_url),
        } : undefined,
      };
      
      // Debug log for processed NFT
      console.log('✅ Processed NFT:', {
        id: processed.token_id,
        name: processed.name,
        bestUrl: getBestMediaUrl(processed)
      });
      
      return processed;
    }) || [];

    return {
      data: processedData,
      hasNextPage: result.hasNextPage || false,
      nextPageCursor: result.nextPageCursor
    };
  } catch (error) {
    console.error('Error fetching NFTs from ThirdWeb:', error);
    throw error;
  }
}