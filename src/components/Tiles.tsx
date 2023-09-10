import { memo, useCallback, useMemo } from "react";
import { Atlas, AtlasTile, Layer } from "decentraland-ui";
import { toCoords } from "../lib/coords";
import { useAuction } from "../modules/api";
import useIsMobile from "../modules/layout";
import './Tiles.css'

export const Tiles = memo(() => {
  const { data: auction } = useAuction()

  const isMobile = useIsMobile()

  const tiles = useMemo(() => {
    const tiles: Record<string, AtlasTile> = {}
    if (auction) {
      const lastId = Number(auction.tokenId)
      for (let id = 0; id < lastId; id++) {
        const [x, y] = toCoords(id)
        tiles[`${x},${y}`] = {
          x,
          y,
          type: 7,
          owner: '0x'
        }
      }
    }
    return tiles
  }, [auction])

  const isSelected = useCallback((x: number, y: number) => {
    if (auction) {
      const [x2, y2] = toCoords(Number(auction.tokenId))
      if (x === x2 && y === y2) {
        return true
      }
    }
    return false
  }, [auction])

  const selectedStrokeLayer: Layer = useCallback((x, y) => {
    return isSelected(x, y) ? { color: '#a524b3', scale: 1.4 } : null
  }, [isSelected])

  const selectedFillLayer: Layer = useCallback((x, y) => {
    return isSelected(x, y) ? { color: '#e153f0', scale: 1.2 } : null
  }, [isSelected])

  const layers = useMemo(() => {
    return [
      selectedStrokeLayer,
      selectedFillLayer
    ]
  }, [selectedStrokeLayer, selectedFillLayer])

  const [x, y] = useMemo(() => {
    if (auction) {
      return toCoords(Number(auction.tokenId))
    }
    return [0, 0]
  }, [auction])

  const offset = isMobile ? 0 : 15

  return (
    <div className="Tiles">
      <Atlas tiles={tiles} isDraggable={false} x={x + offset} y={y} layers={layers} />
    </div>
  )
})