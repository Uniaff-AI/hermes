'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCampaigns,
  postCampaigns,
  putCampaignsId,
  deleteCampaignsId,
  type Campaign,
  type PostCampaignsBody,
} from '@/shared/api/__generated__';
import {
  getCampaignsQueryParams as getCampaignsQueryParamsZod, // Renamed to avoid conflict
  getCampaignsResponseItem as getCampaignsResponseItemZod, // Renamed to avoid conflict
} from '@/shared/api/__generated__/endpoints/campaigns/campaigns.zod';

export const CampaignsWithZodExample = () => {
  const queryClient = useQueryClient();

  // Query for fetching campaigns with Zod validation
  const {
    data: campaigns,
    isLoading,
    error
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await getCampaigns();
      // Zod validation happens automatically in the generated function
      return response.data;
    },
  });

  // Mutation for creating a campaign with Zod validation
  const createCampaignMutation = useMutation({
    mutationFn: async (newCampaign: PostCampaignsBody) => {
      // Zod validation happens automatically
      const response = await postCampaigns(newCampaign);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  // Mutation for updating a campaign
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PostCampaignsBody }) => {
      const response = await putCampaignsId(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  // Mutation for deleting a campaign
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteCampaignsId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  // Example of manual Zod validation
  const validateCampaignData = (data: unknown) => {
    try {
      // Use the generated Zod schema for validation
      const validatedData = getCampaignsResponseItemZod.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Example of validating query parameters
  const validateQueryParams = (params: unknown) => {
    try {
      const validatedParams = getCampaignsQueryParamsZod.parse(params);
      return { success: true, params: validatedParams };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleCreateCampaign = () => {
    const newCampaign: PostCampaignsBody = {
      name: 'New Campaign',
      type: 'position',
      state: 'active',
      cost_type: 'CPC',
      cost_value: 1.5,
    };

    createCampaignMutation.mutate(newCampaign);
  };

  const handleUpdateCampaign = (id: number) => {
    const updatedData: PostCampaignsBody = {
      name: 'Updated Campaign',
      cost_value: 2.0,
    };

    updateCampaignMutation.mutate({ id, data: updatedData });
  };

  const handleDeleteCampaign = (id: number) => {
    deleteCampaignMutation.mutate(id);
  };

  if (isLoading) return <div>Loading campaigns...</div>;
  if (error) return <div>Error loading campaigns: {error.message}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Campaigns with Zod Validation</h2>

      <div className="mb-4">
        <button
          onClick={handleCreateCampaign}
          disabled={createCampaignMutation.isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
        </button>
      </div>

      <div className="grid gap-4">
        {Array.isArray(campaigns) && campaigns.map((campaign: Campaign) => (
          <div key={campaign.id} className="border p-4 rounded">
            <h3 className="font-semibold">{campaign.name}</h3>
            <p>Type: {campaign.type}</p>
            <p>State: {campaign.state}</p>
            <p>Cost: {campaign.cost_value} {campaign.cost_type}</p>

            <div className="mt-2">
              <button
                onClick={() => handleUpdateCampaign(campaign.id!)}
                disabled={updateCampaignMutation.isPending}
                className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
              >
                Update
              </button>
              <button
                onClick={() => handleDeleteCampaign(campaign.id!)}
                disabled={deleteCampaignMutation.isPending}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Example of manual validation */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Manual Zod Validation Example</h3>
        <button
          onClick={() => {
            const result = validateCampaignData({ name: 'Test', type: 'position' });
            console.log('Validation result:', result);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Manual Validation
        </button>
      </div>
    </div>
  );
}; 