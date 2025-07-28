'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCampaigns,
  postCampaigns,
  putCampaignsId,
  deleteCampaignsId,
  type Campaign,
  type PostCampaignsBody,
  type CampaignRequest
} from '@/shared/api/__generated__';

export const CampaignsExample = () => {
  const queryClient = useQueryClient();

  // Query for fetching campaigns
  const {
    data: campaigns,
    isLoading,
    error
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await getCampaigns();
      return response.data;
    },
  });

  // Mutation for creating a campaign
  const createCampaignMutation = useMutation({
    mutationFn: async (newCampaign: PostCampaignsBody) => {
      const response = await postCampaigns(newCampaign);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch campaigns after creation
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  // Mutation for updating a campaign
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CampaignRequest }) => {
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

  const handleCreateCampaign = () => {
    const newCampaign: PostCampaignsBody = {
      name: 'New Test Campaign',
      alias: 'new-test-campaign',
    };
    createCampaignMutation.mutate(newCampaign);
  };

  const handleUpdateCampaign = (id: number) => {
    const updateData: CampaignRequest = {
      name: 'Updated Campaign Name',
    };
    updateCampaignMutation.mutate({ id, data: updateData });
  };

  const handleDeleteCampaign = (id: number) => {
    deleteCampaignMutation.mutate(id);
  };

  if (isLoading) return <div>Loading campaigns...</div>;
  if (error) return <div>Error loading campaigns: {error.message}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Campaigns Example</h2>

      <button
        onClick={handleCreateCampaign}
        disabled={createCampaignMutation.isPending}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
      </button>

      <div className="space-y-4">
        {Array.isArray(campaigns) && campaigns.map((campaign: Campaign) => (
          <div key={campaign.id} className="border p-4 rounded">
            <h3 className="font-semibold">{campaign.name}</h3>
            <p className="text-gray-600">ID: {campaign.id}</p>
            <p className="text-gray-600">Alias: {campaign.alias}</p>
            <p className="text-gray-600">State: {campaign.state}</p>

            <div className="mt-2 space-x-2">
              <button
                onClick={() => campaign.id && handleUpdateCampaign(campaign.id)}
                disabled={updateCampaignMutation.isPending}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                Update
              </button>
              <button
                onClick={() => campaign.id && handleDeleteCampaign(campaign.id)}
                disabled={deleteCampaignMutation.isPending}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 