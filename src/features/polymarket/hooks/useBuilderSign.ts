// Hook to call the polymarket-builder-sign edge function

import { useCallback } from 'react';
import type { BuilderSignResponse } from '../types/trading';
import { BUILDER_SIGN_ENDPOINT } from '../constants/contracts';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface SignRequestParams {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  body?: unknown;
}

export function useBuilderSign() {
  const getBuilderHeaders = useCallback(async (params: SignRequestParams): Promise<BuilderSignResponse> => {
    logger.info('[BuilderSign] Requesting signature for', params.method, params.path);

    const { data, error } = await supabase.functions.invoke<BuilderSignResponse>(
      'polymarket-builder-sign',
      {
        body: params,
      }
    );

    if (error) {
      logger.error('[BuilderSign] Edge function error:', error);
      throw new Error(`Failed to get builder signature: ${error.message}`);
    }

    if (!data?.POLY_BUILDER_SIGNATURE) {
      logger.error('[BuilderSign] Invalid response:', data);
      throw new Error('Invalid builder sign response');
    }

    logger.info('[BuilderSign] Got signature successfully');
    return data;
  }, []);

  return { getBuilderHeaders };
}
