// Route preview component - Native inline design
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Fuel, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { SwapQuote } from '../types';
import { formatTokenAmount, formatUSD, formatTime, getPriceImpactClass } from '../utils/formatters';

interface RoutePreviewProps {
  quote: SwapQuote;
  isLoading?: boolean;
}

export function RoutePreview({ quote, isLoading }: RoutePreviewProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (isLoading) {
    return (
      <div className="px-4 py-3 bg-muted/20 animate-pulse">
        <div className="h-4 bg-muted/30 rounded w-1/3 mb-2" />
        <div className="h-3 bg-muted/30 rounded w-1/2" />
      </div>
    );
  }

  const toAmountFormatted = formatTokenAmount(quote.toAmount, quote.toToken.decimals);
  const minReceived = formatTokenAmount(quote.toAmountMin, quote.toToken.decimals);
  const priceImpactClass = getPriceImpactClass(quote.priceImpact);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-muted/20"
    >
      {/* Main info - compact horizontal layout */}
      <div className="px-4 py-3">
        {/* You receive */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">You receive</span>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={quote.toToken.logoURI} alt={quote.toToken.symbol} />
              <AvatarFallback className="text-[8px]">{quote.toToken.symbol.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">
              {toAmountFormatted} {quote.toToken.symbol}
            </span>
          </div>
        </div>

        {/* Quick stats - inline */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTime(quote.estimatedTime)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Fuel className="h-3 w-3" />
            <span>{formatUSD(quote.fees.gasUSD)}</span>
          </div>
          {Number(quote.priceImpact) > 1 && (
            <div className={`flex items-center gap-1 ${priceImpactClass}`}>
              <AlertTriangle className="h-3 w-3" />
              <span>{Number(quote.priceImpact).toFixed(2)}%</span>
            </div>
          )}
          
          {/* Route summary */}
          <div className="flex items-center gap-1 ml-auto">
            {quote.route.steps.slice(0, 2).map((step, index) => (
              <React.Fragment key={index}>
                {step.toolLogo && (
                  <img src={step.toolLogo} alt={step.tool} className="h-4 w-4 rounded" />
                )}
                {index < Math.min(quote.route.steps.length, 2) - 1 && (
                  <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
            {quote.route.steps.length > 2 && (
              <span className="text-muted-foreground">+{quote.route.steps.length - 2}</span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger className="w-full px-4 py-2 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground border-t border-border/30 transition-colors">
          {expanded ? (
            <>
              <span>Hide details</span>
              <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              <span>Details</span>
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-3 space-y-2 border-t border-border/30 pt-3">
            {/* Route path */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Route</span>
              <div className="flex items-center flex-wrap gap-1.5">
                {quote.route.steps.map((step, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/50">
                      {step.toolLogo && (
                        <img src={step.toolLogo} alt={step.tool} className="h-3.5 w-3.5 rounded" />
                      )}
                      <span className="text-xs font-medium">{step.tool}</span>
                    </div>
                    {index < quote.route.steps.length - 1 && (
                      <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span className="text-foreground">1 {quote.fromToken.symbol} = {quote.exchangeRate} {quote.toToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min. received</span>
                <span className="text-foreground">{minReceived} {quote.toToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price impact</span>
                <span className={priceImpactClass}>{Number(quote.priceImpact).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network fee</span>
                <span className="text-foreground">{formatUSD(quote.fees.gasUSD)}</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
