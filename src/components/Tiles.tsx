import { memo, useCallback, useMemo, useState } from "react";
import { Atlas, AtlasTile, Layer } from "decentraland-ui";
import { toCoords } from "../lib/coords";
import useIsMobile from "../modules/layout";
import { useAuction } from "../modules/auction";
import { useTown } from "../modules/town";
import './Tiles.css'

type Props = {
  tokenId?: string,
  setTokenId: (tokenId: string) => void
}

export const Tiles = memo<Props>(({ tokenId, setTokenId }) => {

  const { auction } = useAuction()
  const { ownedCoords } = useTown()
  const isMobile = useIsMobile()

  const tiles = useMemo(() => {
    const tiles: Record<string, AtlasTile & { tokenId: string }> = {}
    if (auction) {
      const lastId = Number(auction.tokenId)
      for (let id = 0; id <= lastId; id++) {
        const [x, y] = toCoords(id)
        tiles[`${x},${y}`] = {
          x,
          y,
          type: 7,
          owner: '0x',
          tokenId: id.toString()
        }
      }
    }
    return tiles
  }, [auction])

  const isSelected = useCallback((x: number, y: number) => {
    if (tokenId) {
      const [x2, y2] = toCoords(Number(tokenId))
      if (x === x2 && y === y2) {
        return true
      }
    }
    return false
  }, [tokenId])

  const selectedStrokeLayer: Layer = useCallback((x, y) => {
    return isSelected(x, y) ? { color: '#a524b3', scale: 1.4 } : null
  }, [isSelected])

  const selectedFillLayer: Layer = useCallback((x, y) => {
    return isSelected(x, y) ? { color: '#e153f0', scale: 1.2 } : null
  }, [isSelected])

  const [x, y] = useMemo(() => {
    if (tokenId) {
      return toCoords(Number(tokenId))
    }
    return [0, 0]
  }, [tokenId])

  const offset = isMobile ? 0 : 15

  const [hover, setHover] = useState<string>()

  const handleHover = useCallback((x: number, y: number) => {
    const id = `${x},${y}`
    if (tiles[id]) {
      setHover(id)
    } else {
      setHover(void 0)
    }
  }, [tiles])

  const hoverLayer: Layer = useCallback((x, y) => {
    const id = `${x},${y}`
    return id === hover ? { color: ownedCoords.has(id) ? '#e7a0ee' : '#9a95a8', scale: 1 } : null
  }, [hover, ownedCoords])

  const ownerLayer: Layer = useCallback((x, y) => {
    const id = `${x},${y}`
    return ownedCoords.has(id) ? { color: '#e153f0', scale: 1 } : null
  }, [ownedCoords])

  const layers = useMemo(() => {
    return [
      ownerLayer,
      hoverLayer,
      selectedStrokeLayer,
      selectedFillLayer
    ]
  }, [ownerLayer, hoverLayer, selectedStrokeLayer, selectedFillLayer])

  const handleClick = useCallback((x: number, y: number) => {
    const id = `${x},${y}`
    if (tiles[id]) {
      setTokenId(tiles[id].tokenId)
    }
  }, [tiles, setTokenId])

  return (
    <div className={`Tiles ${hover ? 'hover' : ''}`.trim()}>
      <Atlas tiles={tiles} isDraggable={false} x={x + offset} y={y} layers={layers} onHover={handleHover} onClick={handleClick} />
    </div>
  )
})