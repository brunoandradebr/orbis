import React from 'react'

import { TileLayer, Marker, Popup, useMap } from 'react-leaflet'

export const Map = ({
  name,
  lat,
  long,
}: {
  name: string
  lat: number
  long: number
}) => {
  const map = useMap()

  React.useEffect(() => {
    map.setZoom(1)

    setTimeout(() => {
      map.setZoom(5.5)
      setTimeout(() => {
        map.setView([lat, long])
      }, 500)
    }, 500)
  }, [lat, long, map])

  return (
    <>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker position={[lat, long]}>
        <Popup>{name}</Popup>
      </Marker>
    </>
  )
}
