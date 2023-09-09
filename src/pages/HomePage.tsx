import { memo, useCallback, useMemo } from "react";
import { Atlas, AtlasTile, Container, Layer } from "decentraland-ui";
import { useAuction } from "../modules/api";
import { toCoords } from "../lib/coords";
import { Navbar } from "../components/Navbar";
import { Auction } from "../components/Auction";
import './HomePage.css'

export const HomePage = memo(() => {

  const { data: auction } = useAuction()

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
    return isSelected(x, y) ? { color: '#ff0044', scale: 1.4 } : null
  }, [isSelected])

  const selectedFillLayer: Layer = useCallback((x, y) => {
    return isSelected(x, y) ? { color: '#ff9990', scale: 1.2 } : null
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

  return <>
    <Navbar />
    <Atlas tiles={tiles} isDraggable={false} x={x + 15} y={y} height={320} layers={layers}></Atlas>
    <div className="HomePage dcl page">
      <Container className="content">
        <Auction></Auction>
      </ Container>
    </div >
  </>
});
