import React, { useState } from 'react';
import { ArrowLeft, Wallet, ZoomIn, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NFTAttributeCard } from '../components/cards/NFTAttributeCard';
import { useNavigate } from 'react-router-dom';
import { useNFTData } from '../hooks';
import { useUnifiedWallet } from '@/features/wallet/hooks/core';
import { useResponsive } from '@/hooks/useResponsive';
import { ImageViewer } from '@/components/ui/image-viewer';

export default function NFTDetailPage() {
  const navigate = useNavigate();
  const { selectedNFT, isLoading, error, isConnected, walletAddress } = useNFTData();
  const { connectWallet } = useUnifiedWallet();
  const { isMobile } = useResponsive();
  const [isContractInfoExpanded, setIsContractInfoExpanded] = useState(false);

  // If wallet not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm w-full">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted/20 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">
              Connectez votre wallet
            </h1>
            <p className="text-sm text-muted-foreground">
              Vous devez connecter votre wallet pour voir vos NFTs
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Button onClick={connectWallet} className="w-full h-12 rounded-xl">
              Connecter le wallet
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="w-full h-10 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile-first header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="h-10 w-10 p-0 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold truncate">NFT Details</h1>
            <div className="w-10" />
          </div>
        </div>
        
        <div className="p-4">
          {/* Mobile loading skeleton */}
          <div className="space-y-4">
            <div className="w-full aspect-square bg-muted/50 rounded-2xl animate-pulse" />
            <div className="space-y-3">
              <div className="h-8 bg-muted/50 rounded-xl animate-pulse" />
              <div className="h-4 bg-muted/50 rounded-lg animate-pulse w-3/4" />
            </div>
          </div>
          <div className="text-center pt-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="h-10 w-10 p-0 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Erreur</h1>
            <div className="w-10" />
          </div>
        </div>
        
        <div className="p-4 pt-8">
          <div className="text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-destructive text-2xl">⚠</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                Erreur lors du chargement
              </h2>
              <p className="text-sm text-muted-foreground">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No NFTs found
  if (!selectedNFT) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="h-10 w-10 p-0 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Mes NFTs</h1>
            <div className="w-10" />
          </div>
        </div>
        
        <div className="p-4 pt-8">
          <div className="text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-muted-foreground text-2xl">📦</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                Aucun NFT trouvé
              </h2>
              <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
                <p className="mb-1">Wallet connecté:</p>
                <code className="break-all font-mono">{walletAddress}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first sticky header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
            className="h-10 w-10 p-0 rounded-full hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-semibold truncate max-w-[200px]">
            {selectedNFT.name || `NFT #${selectedNFT.token_id}`}
          </h1>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-10 w-10 p-0 rounded-full hover:bg-muted/50 transition-colors"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="pb-6">
        {/* Mobile-optimized image section */}
        <div className="px-4 pt-4 pb-6">
          <div className="relative">
            <ImageViewer
              src={selectedNFT.image_url || '/placeholder.svg'}
              alt={selectedNFT.name || 'NFT'}
              className="w-full rounded-2xl shadow-lg"
              displayMode="cover"
              aspectRatio="square"
              enableFullscreen={true}
            />
          </div>
        </div>

        {/* Content sections */}
        <div className="px-4 space-y-6">
          {/* NFT Info Card */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-5 border border-border/50">
            <h2 className="text-xl font-bold text-foreground mb-2">
              {selectedNFT.name || `NFT #${selectedNFT.token_id}`}
            </h2>
            {selectedNFT.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {selectedNFT.description}
              </p>
            )}
          </div>

          {/* Contract Info - Collapsible on mobile */}
          <div className="bg-muted/30 rounded-2xl overflow-hidden border border-border/30">
            <button 
              onClick={() => setIsContractInfoExpanded(!isContractInfoExpanded)}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <h3 className="font-semibold text-sm">Informations du contrat</h3>
              {isContractInfoExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {isContractInfoExpanded && (
              <div className="px-4 pb-4 space-y-3 text-xs">
                <div className="bg-background/50 p-3 rounded-xl">
                  <span className="font-medium text-muted-foreground block mb-1">Token ID</span>
                  <span className="font-mono text-foreground">{selectedNFT.token_id}</span>
                </div>
                <div className="bg-background/50 p-3 rounded-xl">
                  <span className="font-medium text-muted-foreground block mb-1">Contrat</span>
                  <code className="font-mono text-foreground break-all text-[10px]">
                    {selectedNFT.token_address}
                  </code>
                </div>
                {selectedNFT.metadata_url && (
                  <div className="bg-background/50 p-3 rounded-xl">
                    <span className="font-medium text-muted-foreground block mb-1">Metadata</span>
                    <a 
                      href={selectedNFT.metadata_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono break-all text-[10px]"
                    >
                      {selectedNFT.metadata_url}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attributes Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Attributs</h2>
            {selectedNFT.extra_metadata?.attributes && selectedNFT.extra_metadata.attributes.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {selectedNFT.extra_metadata.attributes.map((attribute, index) => (
                  <NFTAttributeCard 
                    key={index}
                    traitType={attribute.trait_type}
                    value={attribute.value}
                  />
                ))}
              </div>
            ) : (
              // Display any other metadata as key-value pairs if no specific attributes
              <div className="grid grid-cols-2 gap-3">
                {selectedNFT.extra_metadata && Object.entries(selectedNFT.extra_metadata)
                  .filter(([key, value]) => 
                    key !== 'image_url' && 
                    key !== 'image_original_url' && 
                    key !== 'attributes' &&
                    value != null
                  )
                  .map(([key, value], index) => (
                    <NFTAttributeCard 
                      key={index}
                      traitType={key}
                      value={String(value)}
                    />
                  ))
                }
                {(!selectedNFT.extra_metadata || Object.keys(selectedNFT.extra_metadata).filter(key => 
                  key !== 'image_url' && 
                  key !== 'image_original_url' && 
                  key !== 'attributes'
                ).length === 0) && (
                  <div className="col-span-2 text-center py-12 bg-muted/20 rounded-2xl">
                    <div className="text-4xl mb-3">🎨</div>
                    <p className="text-sm text-muted-foreground">
                      Aucun attribut disponible
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}