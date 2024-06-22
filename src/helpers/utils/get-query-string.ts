export const getQueryString = (obj: object) => {
  const sortedObj = Object.entries(obj)
    .filter(([_, value]) => {
      return value !== undefined && value !== null;
    })
    .sort();

  const params = new URLSearchParams(sortedObj).toString();

  return params ? '?' + params : '';
};
