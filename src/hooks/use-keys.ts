import { useMemo } from 'react';
import { nanoid } from 'nanoid';

const useKeys = (amount: number): string[] => useMemo(() => Array(amount).fill(undefined)
  .map(() => nanoid()), [amount]);

export default useKeys;
