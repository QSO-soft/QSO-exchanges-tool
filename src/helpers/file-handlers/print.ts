import fs, { promises } from 'fs';
import path from 'path';

interface PrintResults<T> {
  data: string;
  fileName: string;
  outputPath: string;
  withAppend?: boolean;
  transformDataCallback?: (data: T) => T;
}
export const printResults = <T>({
  data,
  fileName,
  outputPath,
  withAppend = false,
  transformDataCallback,
}: PrintResults<T>) => {
  const output = path.join(outputPath, fileName);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }

  if (!fs.existsSync(output)) {
    fs.writeFileSync(output, '');
  }

  if (withAppend) {
    const parsedData = JSON.parse(data);

    if (Array.isArray(parsedData)) {
      const existingJson = fs.readFileSync(output, 'utf-8');
      const parsedJsonData = JSON.parse(existingJson);
      const dataToSave = Array.isArray(parsedJsonData) ? parsedJsonData : [parsedJsonData];

      let existingData = dataToSave as T;

      if (transformDataCallback) {
        existingData = transformDataCallback(existingData);
      } else {
        existingData = [...(existingData as []), ...parsedData] as T;
      }

      fs.writeFileSync(output, JSON.stringify(existingData, null, 2));
    } else if (!Array.isArray(parsedData)) {
      const existingJson = fs.readFileSync(output, 'utf-8');
      const parsedJsonData = JSON.parse(existingJson);

      let existingData = parsedJsonData as T;

      if (transformDataCallback) {
        existingData = transformDataCallback(existingData);
      } else {
        existingData = {
          ...existingData,
          ...parsedData,
        };
      }

      fs.writeFileSync(output, JSON.stringify(existingData, null, 2));
    }
  } else {
    fs.writeFileSync(output, data);
  }
};

interface PrintResultsAsync<T> {
  data: T;
  fileName: string;
  outputPath: string;
  withAppend?: boolean;
  transformDataCallback?: (data: T) => T;
}
export const printResultsAsync = async <T>({
  data,
  fileName,
  outputPath,
  withAppend,
  transformDataCallback,
}: PrintResultsAsync<T>) => {
  const output = path.join(outputPath, fileName);

  try {
    if (withAppend && Array.isArray(data)) {
      const existingJson = await promises.readFile(output, 'utf-8');
      const parsedJsonData = JSON.parse(existingJson);
      const dataToSave = Array.isArray(parsedJsonData) ? parsedJsonData : [parsedJsonData];

      let existingData = dataToSave as T;

      if (transformDataCallback) {
        existingData = transformDataCallback(existingData);
      } else {
        existingData = [...(existingData as []), ...data] as T;
      }

      await promises.writeFile(output, JSON.stringify(existingData, null, 2));
    } else if (withAppend && !Array.isArray(data)) {
      const existingJson = await promises.readFile(output, 'utf-8');
      const parsedJsonData = JSON.parse(existingJson);

      let existingData = parsedJsonData as T;

      if (transformDataCallback) {
        existingData = transformDataCallback(existingData);
      } else {
        existingData = {
          ...existingData,
          ...data,
        };
      }

      await promises.writeFile(output, JSON.stringify(existingData, null, 2));
    } else {
      await promises.writeFile(output, JSON.stringify(data, null, 2));
    }
  } catch (err) {
    throw new Error(`Unable to print results to ${output}`);
  }
};
