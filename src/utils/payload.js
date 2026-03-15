import { toTitleCase } from './naming';

export function unwrapApiPayload(payload) {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      return payload.data;
    }
  }
  return payload;
}

export function inferRootTitleFromPayload(payload) {
  const unwrapped = unwrapApiPayload(payload);
  const keys = Object.keys(unwrapped || {});
  if (keys.length === 1) {
    return toTitleCase(keys[0]);
  }
  return 'Generated Form';
}