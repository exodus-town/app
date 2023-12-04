import { useMemo } from "react";
import { useJSON } from "./json";

export const useOnline = () => {
  const { data, error, isLoading } = useJSON(
    "https://places.decentraland.org/api/worlds?names=exodustown.dcl.eth&offset=0&limit=1"
  );
  const users = useMemo(() => {
    if (data) {
      console.log(data);
      return data.data[0]?.user_count || 0;
    }
    return 0;
  }, [data]);

  return { users, error, isLoading };
};
