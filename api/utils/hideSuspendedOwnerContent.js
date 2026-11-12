import User from '../models/user.model.js';

let suspendedOwners = [];
let cacheExpiresAt = 0;
const CACHE_MS = 10_000;

export const getSuspendedOwnerIds = async () => {
  if (cacheExpiresAt > Date.now()) return suspendedOwners;
  const users = await User.find({ accountStatus: 'suspended' }).select('_id').lean();
  suspendedOwners = users.map(({ _id }) => _id);
  cacheExpiresAt = Date.now() + CACHE_MS;
  return suspendedOwners;
};

export const invalidateSuspendedOwnerCache = () => {
  cacheExpiresAt = 0;
};

export const hideSuspendedOwnerContent = (schema, ownerFields = []) => {
  const applyOwnerFilter = async function applyOwnerFilter() {
    const ids = await getSuspendedOwnerIds();
    if (!ids.length) return;
    const existing = this.getQuery();
    const exclusions = ownerFields.map(({ field, storedAsString = false }) => ({
      [field]: { $in: storedAsString ? ids.map(String) : ids },
    }));
    this.setQuery({ $and: [existing, { $nor: exclusions }] });
  };
  schema.pre('find', applyOwnerFilter);
  schema.pre('findOne', applyOwnerFilter);
  if (schema.path('replies')) {
    const removeSuspendedReplies = async (documents) => {
      const ids = await getSuspendedOwnerIds();
      if (!ids.length) return documents;
      const blocked = new Set(ids.map(String));
      for (const document of (Array.isArray(documents) ? documents : [documents])) {
        if (!document?.replies) continue;
        document.replies = document.replies.filter((reply) => {
          const authorId = reply.author || reply.userId;
          return !authorId || !blocked.has(String(authorId));
        });
      }
      return documents;
    };
    schema.post('find', removeSuspendedReplies);
    schema.post('findOne', removeSuspendedReplies);
  }
};
