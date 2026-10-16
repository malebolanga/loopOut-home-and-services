export const canCreateListings = (user) => !user || !user.offeringType || user.offeringType !== 'viewer';

export const canRegisterShop = (user) => Boolean(user && user.offeringType === 'food');

export const isDefaultAvatar = (avatar) => {
  if (!avatar || typeof avatar !== 'string') return true;
  return avatar.includes('blank-profile-picture') || avatar.trim() === '';
};

export const getServiceProviderVerificationStatus = (user) => {
  if (!user) {
    return {
      isCompliant: false,
      hasIdDocument: false,
      hasFaceScan: false,
      hasProfilePicture: false,
      missing: ['ID document or passport', 'Face scan (live selfie)', 'Profile picture'],
      missingCount: 3,
    };
  }

  const hasIdDocument = Boolean(user.idDocumentUrl && user.idDocumentUrl.trim() !== '');
  const hasFaceScan = Boolean(
    (user.liveSelfieUrl && user.liveSelfieUrl.trim() !== '') ||
    (user.faceData?.imageUrl && user.faceData.imageUrl.trim() !== '')
  );
  const hasProfilePicture = Boolean(user.avatar && !isDefaultAvatar(user.avatar));

  const missing = [];
  if (!hasIdDocument) missing.push('ID document or passport');
  if (!hasFaceScan) missing.push('Face scan (live selfie)');
  if (!hasProfilePicture) missing.push('Profile picture');

  return {
    isCompliant: hasIdDocument && hasFaceScan && hasProfilePicture,
    hasIdDocument,
    hasFaceScan,
    hasProfilePicture,
    missing,
    missingCount: missing.length,
  };
};

export const canCreateFor = (user, offeringType) => {
  if (offeringType === 'food') {
    return canRegisterShop(user);
  }
  if (user?.offeringType === 'services') {
    return offeringType === 'services' || offeringType === 'experiences' || offeringType === 'online' || offeringType === 'helper';
  }
  if (user?.offeringType === 'property') {
    return offeringType === 'property' || offeringType === 'stays' || offeringType === 'events';
  }
  if (user?.offeringType === 'goods') {
    return offeringType === 'goods' || offeringType === 'selling' || offeringType === 'events';
  }
  return canCreateListings(user) && (!user?.offeringType || user.offeringType === offeringType);
};

export const getCreationRoute = (user) => {
  if (!canCreateListings(user)) return null;
  if (user?.offeringType === 'food') return '/food/register';
  return user?._id ? `/${user._id}/create-listing` : '/sign-in';
};
