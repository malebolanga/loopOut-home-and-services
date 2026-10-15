export const canCreateListings = (user) => !user || !user.offeringType || user.offeringType !== 'viewer';

export const canCreateFor = (user, offeringType) =>
  canCreateListings(user) && (!user?.offeringType || user.offeringType === offeringType);

export const getCreationRoute = (user) => {
  if (!canCreateListings(user)) return null;
  if (user?.offeringType === 'food') return '/food/register';
  return user?._id ? `/${user._id}/create-listing` : '/sign-in';
};
