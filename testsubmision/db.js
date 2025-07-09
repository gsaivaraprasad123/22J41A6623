export const setupDB = async () => {
  const store = new Map();

  return {
    get: async (key) => store.get(key),
    set: async (key, value) => store.set(key, value)
  };
};
