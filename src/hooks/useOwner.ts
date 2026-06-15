import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ownerService from '../api/owner.service';
import { UpdateVehiclePayload } from '../types/vehicle-management';
import { DashboardStats } from '../types/owner';

/**
 * Hook to retrieve owner registered vehicles list.
 */
export const useOwnerVehicles = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['ownerVehicles', params],
    queryFn: () => ownerService.getMyVehicles(params),
  });
};

/**
 * Hook to retrieve bookings requested on owner's vehicles.
 */
export const useOwnerBookings = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['ownerBookings', params],
    queryFn: () => ownerService.getOwnerBookings(params),
  });
};

/**
 * Mutation hook to register a new vehicle with multipart data.
 */
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => ownerService.createVehicle(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

/**
 * Mutation hook to patch existing vehicle details.
 */
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVehiclePayload }) =>
      ownerService.updateVehicle(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ownerVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', data.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

/**
 * Mutation to delete a vehicle listing.
 */
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ownerService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

/**
 * Mutation hook to approve a booking request.
 */
export const useApproveBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ownerService.approveBooking(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ownerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
};

/**
 * Mutation hook to reject a booking request.
 */
export const useRejectBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ownerService.rejectBooking(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ownerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
};

/**
 * Composed React Query hook that aggregates statistics from owner's vehicles and bookings
 * client-side to supply the dashboard statistics panel.
 */
export const useDashboardStats = () => {
  const { data: vehiclesData, isLoading: vehiclesLoading, error: vehiclesError, refetch: refetchVehicles } = useOwnerVehicles({ limit: 100 });
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useOwnerBookings({ limit: 100 });

  const isLoading = vehiclesLoading || bookingsLoading;
  const isError = !!vehiclesError || !!bookingsError;

  const vehicles = vehiclesData?.vehicles || [];
  const bookings = bookingsData?.bookings || [];

  const totalVehicles = vehicles.length;
  // Active vehicles are vehicles with ACTIVE status and are currently marked available
  const activeVehicles = vehicles.filter((v) => v.status === 'ACTIVE' && v.isAvailable).length;

  const totalBookings = bookings.length;
  const pendingRequests = bookings.filter((b) => b.status === 'PENDING').length;

  // Calculate revenue from payments or totalAmount of confirmed/completed bookings
  const revenue = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED' || b.status === 'ACCEPTED')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const stats: DashboardStats = {
    totalVehicles,
    activeVehicles,
    totalBookings,
    pendingRequests,
    revenue,
  };

  const refetch = async () => {
    await Promise.all([refetchVehicles(), refetchBookings()]);
  };

  return {
    isLoading,
    isError,
    data: stats,
    refetch,
  };
};
