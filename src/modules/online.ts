import { useMemo } from "react";
import { useJSON } from "./json";

export const useOnline = () => {
  const { data, error, isLoading } = useJSON("/api/online");
  const users = useMemo(() => {
    if (data) {
      return data.users;
    }
    return 0;
  }, [data]);

  return { users, error, isLoading };
};
