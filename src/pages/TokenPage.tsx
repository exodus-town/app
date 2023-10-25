import { memo } from "react"
import { Topbar } from "../components/Topbar"
import { Inspector } from "../components/Inspector"
import './TokenPage.css'

export const TokenPage = memo(() => {
  return (
    <div className="TokenPage">
      <Topbar />
      <Inspector />
    </div>
  )
})