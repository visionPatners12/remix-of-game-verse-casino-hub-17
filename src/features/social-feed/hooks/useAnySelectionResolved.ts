import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';

const BATCH_CONDITIONS_QUERY = gql`
  query BatchConditionStates($ids: [String!]!) {
    conditions(where: { conditionId_in: $ids }) {
      conditionId
      state
    }
  }
`;

const SUBGRAPH_URL = 'https://thegraph-1.onchainfeed.org/subgraphs/name/azuro-protocol/azuro-data-feed-polygon';

interface ConditionState {
  conditionId: string;
  state: string;
}

interface BatchConditionsResponse {
  conditions: ConditionState[];
}

/**
 * Hook to check if any selection in a list is resolved
 * Makes a single batched GraphQL query for all condition IDs
 */
export function useAnySelectionResolved(conditionIds: string[]) {
  // Filter out invalid IDs
  const validIds = conditionIds.filter(id => id && typeof id === 'string');
  
  const { data, isLoading } = useQuery<BatchConditionsResponse>({
    queryKey: ['batchConditionStates', validIds],
    queryFn: async () => {
      if (validIds.length === 0) {
        return { conditions: [] };
      }
      return request(SUBGRAPH_URL, BATCH_CONDITIONS_QUERY, { ids: validIds });
    },
    enabled: validIds.length > 0,
    staleTime: 60000, // Cache for 1 minute
  });
  
  // Check if at least one condition is Resolved
  const hasAnyResolved = data?.conditions?.some(c => c.state === 'Resolved') ?? false;
  const resolvedCount = data?.conditions?.filter(c => c.state === 'Resolved').length ?? 0;
  
  return {
    hasAnyResolved,
    isLoading,
    resolvedCount,
  };
}
