import { AvatarFace, AvatarFaceProps } from "decentraland-ui";
import { memo } from "react";
import { useAvatar } from "../modules/avatar";
import './User.css'

type Props = {
  size?: AvatarFaceProps['size']
  address?: string
}
export const User = memo<Props>(({ address, size = 'small' }) => {
  const { avatar, isLoading } = useAvatar(address)
  const avatarName = avatar?.name
  return <div className="User"><AvatarFace size={size} avatar={isLoading ? undefined : avatar} />{avatarName ? <div className="name">{avatarName}</div> : <div className="loading secondary-text">Loading...</div>}</div>
}) 