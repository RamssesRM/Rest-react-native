import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

const storage = createMMKV({ id: 'zustand' });

const zustandStorage: StateStorage = {
  getItem: (name) => {
    const value = storage.getString(name);
    return value === undefined ? null : value;
  },
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.remove(name);
  },
};

export default zustandStorage;
