import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function useRequest(fn: () => Promise<any>, options = {}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    setLoading(true);
    toast
      .promise(
        fn(), // This is the promise you are tracking
        {
          pending: 'Loading...',
          success: 'Done',
          error: {
            render({ data }) {
              return `Error: ${data.message}`;
            },
          },
        }
      )
      .then((res) => setData(res))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [fn, options]);

  return { loading, data, error };
}

export default useRequest;
