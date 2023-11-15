import { useEffect, useState } from "react";

export const INVITE_CODE = "9dC7Hmyh5b";
export const INVITE_LINK = `https://discord.gg/${INVITE_CODE}`;

type Invite = {
  type: number;
  code: string;
  inviter: {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    premium_type: number;
    flags: number;
    banner: string | null;
    accent_color: number;
    global_name: string;
    avatar_decoration_data: null;
    banner_color: `#${string}`;
  };
  expires_at: number | null;
  flags: number;
  guild: {
    id: string;
    name: string;
    splash: string | null;
    banner: string | null;
    description: string | null;
    icon: string;
    features: string[];
    verification_level: number;
    vanity_url_code: string | null;
    nsfw_level: number;
    nsfw: boolean;
    premium_subscription_count: number;
  };
  guild_id: string;
  channel: { id: string; type: number; name: string };
  approximate_member_count: number;
  approximate_presence_count: number;
};

export const useDiscord = () => {
  const [members, setMembers] = useState(0);
  const [online, setOnline] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const url = `https://discord.com/api/v9/invites/${INVITE_CODE}?with_counts=true&with_expiration=true`;
    setIsLoading(true);
    fetch(url)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`Error loading Discord server data`);
        }
        return resp.json();
      })
      .then((invite: Invite) => {
        setMembers(invite.approximate_member_count);
        setOnline(invite.approximate_presence_count);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { members, online, isLoading, error };
};
