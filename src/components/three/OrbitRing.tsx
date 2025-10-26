import { Line } from "@react-three/drei"
import { memo, useMemo } from "react"
import { Vector3 } from "three"

interface OrbitRingProps {
    radius: number,
    orbitColor: string,
    opacity: number
}

const OrbitRing = memo(({ radius, orbitColor, opacity = 1.0 }: OrbitRingProps) => {
  const points = useMemo(() => {
    const pts = []
    const segments = 150
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      if (Math.floor(i / 3.1) % 2 === 0) {
        pts.push(new Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ))
      }
    }
    return pts
  }, [radius])

  return (
    <Line
      points={points}
      color={orbitColor}
      lineWidth={1}
      dashed={true}
      dashScale={1}
      dashSize={0.15}
      gapSize={0.1}
      transparent={true}
      opacity={opacity}
    />
  )
})

export default OrbitRing