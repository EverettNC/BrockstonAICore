'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setValue(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    setLoading(false);
  }, [key]);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const actualNewValue = typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      try {
        localStorage.setItem(key, JSON.stringify(actualNewValue));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      return actualNewValue;
    });
  }, [key]);

  return { value, setValue: updateValue, loading };
}

export function useStorageDoc<T extends { id?: string }>(
  collectionName: string,
  docId: string,
  defaultValue: T
) {
  const key = `brockston:${collectionName}:${docId}`;
  return useLocalStorage<T>(key, defaultValue);
}

export function useStorageCollection<T>(
  collectionName: string,
  defaultValue: T[] = []
) {
  const key = `brockston:${collectionName}:items`;
  const { value, setValue, loading } = useLocalStorage<T[]>(key, defaultValue);

  const addItem = useCallback((item: T) => {
    setValue((prev) => [...prev, item]);
  }, [setValue]);

  const updateItem = useCallback((index: number, item: T) => {
    setValue((prev) => {
      const newArray = [...prev];
      newArray[index] = item;
      return newArray;
    });
  }, [setValue]);

  const removeItem = useCallback((index: number) => {
    setValue((prev) => prev.filter((_, i) => i !== index));
  }, [setValue]);

  return { data: value, setData: setValue, addItem, updateItem, removeItem, loading };
}
