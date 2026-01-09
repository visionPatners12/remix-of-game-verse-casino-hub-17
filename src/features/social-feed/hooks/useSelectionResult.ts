import { useQuery } from '@tanstack/react-query';

const SUBGRAPH_URL = "https://thegraph-1.onchainfeed.org/subgraphs/name/azuro-protocol/azuro-data-feed-polygon";

const CONDITION_RESULT_QUERY = `
  query ConditionResult($id: String!) {
    conditions(where: { conditionId: $id }) {
      conditionId
      state
      wonOutcomeIds
    }
  }
`;

interface ConditionResultResponse {
  conditions: Array<{
    conditionId: string;
    state: string;
    wonOutcomeIds: string[];
  }>;
}

/**
 * Hook to fetch bet result from Azuro subgraph
 * Returns whether a specific outcome won or lost
 */
export function useSelectionResult(conditionId?: string, outcomeId?: string) {
  const enabled = !!(conditionId && outcomeId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['selectionResult', conditionId],
    queryFn: async () => {
      const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: CONDITION_RESULT_QUERY,
          variables: { id: conditionId },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch condition result');
      }

      const result = await response.json();
      return result.data as ConditionResultResponse;
    },
    enabled,
    staleTime: 60000, // Cache for 1 minute
  });

  const condition = data?.conditions?.[0];
  const wonOutcomeIds = condition?.wonOutcomeIds || [];
  
  // Determine if this specific outcome won or lost
  const isWon = enabled && wonOutcomeIds.length > 0 ? wonOutcomeIds.includes(outcomeId!) : null;
  const isLost = enabled && wonOutcomeIds.length > 0 ? !wonOutcomeIds.includes(outcomeId!) : null;
  const isResolved = condition?.state === 'Resolved';

  return {
    isWon,
    isLost,
    isResolved,
    wonOutcomeIds,
    isFetchingResult: isLoading,
    error,
  };
}
