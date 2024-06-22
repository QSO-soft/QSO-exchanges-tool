interface GetTimeoutPromiseArgs {
  timeoutInSeconds: number;
  errorMessage?: string;
}

export const getTimeoutPromise = ({ timeoutInSeconds, errorMessage }: GetTimeoutPromiseArgs) => {
  let timeout: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise((_resolve, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(errorMessage || ''));
    }, timeoutInSeconds * 1000);
  });

  return {
    timeout,
    timeoutPromise,
  };
};

type MakeRequestWithTimeoutArgs<RequestReturnType> = GetTimeoutPromiseArgs & {
  callback: () => Promise<RequestReturnType>;
};

export const callFunctionWithTimeout = async <RequestReturnType>({
  timeoutInSeconds,
  callback,
  errorMessage,
}: MakeRequestWithTimeoutArgs<RequestReturnType>) => {
  const { timeoutPromise, timeout } = getTimeoutPromise({ timeoutInSeconds, errorMessage });

  const result = (await Promise.race([callback(), timeoutPromise])) as RequestReturnType;

  return {
    result,
    timeout,
  };
};
