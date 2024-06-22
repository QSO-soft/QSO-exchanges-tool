import { promises } from 'fs';

export const readFromFileAsync = async <T>(inputPath: string): Promise<T> => {
  try {
    const result = await promises.readFile(inputPath, 'utf-8');

    return JSON.parse(result);
  } catch (err) {
    throw new Error(`Unable to read data from ${inputPath}`);
  }
};
