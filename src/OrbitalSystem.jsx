import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAsteroidData } from './ProfileSystem'

// Preload models
useGLTF.preload('/ResearchModel.glb')
useGLTF.preload('/AnimationsModel.glb')
useGLTF.preload('/GamesModel.glb')
useGLTF.preload('/InteractiveModel.glb')

// GLB Model Component for Orbiting Sphere
function GLBOrbitingSphere({ 
  modelPath, 
  radius, 
  speed, 
  initialAngle, 
  label, 
 // description, 
  hasMoon = false,
  scale = 1 
}) {
  const { scene } = useGLTF(modelPath)
  const modelRef = useRef()
  const [planetPosition, setPlanetPosition] = useState({ x: 0, y: 0, z: 0 })
  
  const clonedScene = useMemo(() => {
    const cloned = scene.clone()
    // Ensure all materials and geometries are marked for reuse
    cloned.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
        }
      }
    })
    return cloned
  }, [scene])

  useEffect(() => {
    const sceneToCleanup = clonedScene
    return () => {
      // Cleanup cloned scene
      if (sceneToCleanup) {
        sceneToCleanup.traverse((child) => {
          if (child.geometry) {
            child.geometry.dispose()
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => {
                if (material.map) material.map.dispose()
                if (material.lightMap) material.lightMap.dispose()
                if (material.bumpMap) material.bumpMap.dispose()
                if (material.normalMap) material.normalMap.dispose()
                if (material.specularMap) material.specularMap.dispose()
                if (material.envMap) material.envMap.dispose()
                material.dispose()
              })
            } else {
              if (child.material.map) child.material.map.dispose()
              if (child.material.lightMap) child.material.lightMap.dispose()
              if (child.material.bumpMap) child.material.bumpMap.dispose()
              if (child.material.normalMap) child.material.normalMap.dispose()
              if (child.material.specularMap) child.material.specularMap.dispose()
              if (child.material.envMap) child.material.envMap.dispose()
              child.material.dispose()
            }
          }
        })
      }
      document.body.style.cursor = 'default'
    }
  }, [clonedScene])
  
  useFrame((state, delta) => {
    if (modelRef.current) {
      const time = state.clock.elapsedTime
      const angle = time * speed + initialAngle
      
      const newX = Math.cos(angle) * radius
      const newZ = Math.sin(angle) * radius
      const newY = 0
      
      modelRef.current.position.set(newX, newY, newZ)
      
      setPlanetPosition({ x: newX, y: newY, z: newZ })
      
      modelRef.current.rotation.y += delta * 0.5
      
      // Apply neon green emissive to all materials in the model
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.emissive = new THREE.Color(0x00ff88)
              mat.emissiveIntensity = 0.5
            })
          } else {
            child.material.emissive = new THREE.Color(0x00ff88)
            child.material.emissiveIntensity = 0.5
          }
        }
      })
    }
  })

  return (
    <group>
      <primitive 
        ref={modelRef} 
        object={clonedScene} 
        scale={scale}
      />
      
      {/* Label line - horizontal from model center */}
      <Line
        points={[
          [planetPosition.x, planetPosition.y, planetPosition.z],
          [planetPosition.x + 1.2, planetPosition.y, planetPosition.z]
        ]}
        color="#ffffff"
        lineWidth={1}
      />
      
      <Html 
        position={[planetPosition.x + 1.2, planetPosition.y, planetPosition.z]} 
        distanceFactor={8}
        center
      >
        <div style={{
          background: 'rgba(233, 53, 158, 0.9)',
          border: '2px solid rgba(233, 53, 158, 1)',
          padding: '6px 12px',
          color: 'white',
          fontSize: '12px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(5px)',
          boxShadow: '0 0 15px rgba(233, 53, 158, 0.5)',
          pointerEvents: 'none'
        }}>
          {label}
        </div>
      </Html>
      
      {hasMoon && <MoonSystem parentPosition={planetPosition} />}
    </group>
  )
}

// Central Sphere Component
function CentralSphere() {
  const meshRef = useRef()
  const materialRef = useRef()
  const geometryRef = useRef()
  
  useEffect(() => {
    const material = materialRef.current
    const geometry = geometryRef.current
    return () => {
      if (material) material.dispose()
      if (geometry) geometry.dispose()
    }
  }, [])
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry ref={geometryRef} args={[1, 32, 32]} />
      <meshStandardMaterial 
        ref={materialRef}
        color="#ffffff" 
        metalness={0.01} 
        roughness={2}
        emissive="#00ff88"
        emissiveIntensity={0.6}
      />
      
      <Html distanceFactor={8} position={[0, 0, 0]}>
        <div className="marker-content central-marker">
          ORBITS<br />
          <small>RMIT EXPO 2025</small>
        </div>
      </Html>
    </mesh>
  )
}

// ASTEROID FIELD WITH REAL DATA
function AsteroidField({ asteroidData = [], searchTerm = '' }) {
  const asteroidRefs = useRef([])
  const materialRefs = useRef([])
  const [hoveredAsteroid, setHoveredAsteroid] = useState(null)
  
  // Shared geometry for all asteroids
  const sharedGeometry = useMemo(() => new THREE.SphereGeometry(1, 4, 3), [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      materialRefs.current.forEach(material => {
        if (material) material.dispose()
      })
      if (sharedGeometry) sharedGeometry.dispose()
      materialRefs.current = []
      asteroidRefs.current = []
      document.body.style.cursor = 'default'
    }
  }, [sharedGeometry])

  // Search matching
  const searchMatches = useMemo(() => {
    if (!searchTerm.trim()) return new Set()
    const term = searchTerm.toLowerCase()
    const matches = new Set()
    asteroidData.forEach(asteroid => {
      if (asteroid.name.toLowerCase().includes(term) || 
          asteroid.workType.toLowerCase().includes(term) ||
          asteroid.workTitle.toLowerCase().includes(term)) {
        matches.add(asteroid.id)
      }
    })
    return matches
  }, [searchTerm, asteroidData])

  const hasActiveSearch = searchTerm.trim().length > 0

  // Connection lines for hover
  const connectionLines = useMemo(() => {
    if (!hoveredAsteroid) return []
    
    const connections = []
    const MAX_CONNECTIONS = 20
    const hoveredPos = hoveredAsteroid.position
    
    for (let i = 0; i < asteroidData.length && connections.length < MAX_CONNECTIONS; i++) {
      const asteroid = asteroidData[i]
      if (asteroid.id !== hoveredAsteroid.id && asteroid.workType === hoveredAsteroid.workType) {
        connections.push({
          start: hoveredPos,
          end: asteroid.position,
          id: `connection-${hoveredAsteroid.id}-${asteroid.id}`
        })
      }
    }
    
    return connections
  }, [hoveredAsteroid, asteroidData])

  // Animation
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    
    asteroidRefs.current.forEach((ref, i) => {
      if (ref && asteroidData[i]) {
        const asteroid = asteroidData[i]
        const floatSpeed = 0.1 + (i % 10) * 0.03
        const floatAmplitude = 0.05 + (i % 5) * 0.01
        
        // Set position explicitly, not modifying the original position
        ref.position.set(
          asteroid.position[0],
          asteroid.position[1] + Math.sin(time * floatSpeed) * floatAmplitude,
          asteroid.position[2]
        )
        
        // Reduce rotation frequency
        const rotationSpeed = (0.01 + (i % 10) * 0.002) * delta * 30
        ref.rotation.x += rotationSpeed
        ref.rotation.y += rotationSpeed * 0.7
      }
    })
  })

  if (asteroidData.length === 0) {
    return null
  }

  return (
    <group>
      {/* Connection lines */}
      {connectionLines.map(connection => (
        <Line
          key={connection.id}
          points={[connection.start, connection.end]}
          color="rgb(233, 53, 158)"
          lineWidth={2}
          transparent
          opacity={0.6}
          dashed={true}
          dashScale={2}
          dashSize={0.05}
          gapSize={0.02}
        />
      ))}

      {asteroidData.map((asteroid, index) => {
        const size = 0.1 + (index % 8) * 0.005
        
        return (
          <group key={asteroid.id}>
            <mesh
              ref={(el) => (asteroidRefs.current[index] = el)}
              position={asteroid.position}
              scale={[size * 0.4, size * 0.4, size * 0.4]}
              onPointerOver={(e) => {
                e.stopPropagation()
                setHoveredAsteroid(asteroid)
                document.body.style.cursor = 'pointer'
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                setHoveredAsteroid(null)
                document.body.style.cursor = 'default'
              }}
              onClick={(e) => {
                e.stopPropagation()
                // Click disabled - hover only
              }}
              geometry={sharedGeometry}
            >
              <meshStandardMaterial 
                ref={(el) => (materialRefs.current[index] = el)}
                color="#999999"
                metalness={0.0}
                roughness={1.0}
                emissive={
                  hoveredAsteroid?.id === asteroid.id ? "#4a9eff" : 
                  hoveredAsteroid?.workType === asteroid.workType && hoveredAsteroid?.id !== asteroid.id ? "#4a9eff" :
                  searchMatches.has(asteroid.id) ? "#4a9eff" : 
                  "#000000"
                }
                emissiveIntensity={
                  hoveredAsteroid?.id === asteroid.id ? 0.2 : 
                  hoveredAsteroid?.workType === asteroid.workType && hoveredAsteroid?.id !== asteroid.id ? 0.15 :
                  searchMatches.has(asteroid.id) ? 0.3 : 
                  0.0
                }
                opacity={
                  hasActiveSearch ? (searchMatches.has(asteroid.id) ? 0.8 : 0.2) : 0.6
                }
                transparent={true}
              />
            </mesh>
            
            {/* Search result highlight */}
            {searchMatches.has(asteroid.id) && (
              <Html
                position={asteroid.position}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '60px',
                  height: '60px',
                  border: '1px solid #4a9eff',
                  borderRadius: '4px',
                  background: 'rgba(74, 158, 255, 0.05)',
                  boxShadow: '0 0 15px rgba(74, 158, 255, 0.3)',
                  animation: 'searchPulse 2s infinite ease-in-out',
                  zIndex: 0
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '-2px',
                    width: '8px',
                    height: '8px',
                    border: '2px solid #4a9eff',
                    borderRight: 'none',
                    borderBottom: 'none'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    border: '2px solid #4a9eff',
                    borderLeft: 'none',
                    borderBottom: 'none'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '-2px',
                    width: '8px',
                    height: '8px',
                    border: '2px solid #4a9eff',
                    borderRight: 'none',
                    borderTop: 'none'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    border: '2px solid #4a9eff',
                    borderLeft: 'none',
                    borderTop: 'none'
                  }}></div>
                </div>

                <style>{`
                  @keyframes searchPulse {
                    0%, 100% { 
                      transform: translate(-50%, -50%) scale(1);
                      opacity: 0.8;
                    }
                    50% { 
                      transform: translate(-50%, -50%) scale(1.1);
                      opacity: 1;
                    }
                  }
                `}</style>
              </Html>
            )}
            
            {/* Hover tooltip */}
            {hoveredAsteroid?.id === asteroid.id && (
              <Html
                position={[asteroid.position[0] + size + 0.8, asteroid.position[1] + 0.2, asteroid.position[2]]}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  background: 'rgba(0, 0, 0, 0.95)',
                  border: '1px solid rgba(74, 158, 255, 0.5)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  minWidth: '180px',
                  backdropFilter: 'blur(15px)',
                  boxShadow: '0 8px 32px rgba(74, 158, 255, 0.3)',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '4px'
                  }}>
                    {asteroid.name}
                  </div>
                  
                  <div style={{
                    fontSize: '9px',
                    color: '#4a9eff',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {asteroid.workType}
                  </div>

                  <div style={{
                    fontSize: '10px',
                    color: '#cccccc',
                    lineHeight: '1.3'
                  }}>
                    {asteroid.workTitle}
                  </div>
                </div>

                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(10px); }
                    to { opacity: 1; transform: translateX(0); }
                  }
                `}</style>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}

// Main Orbital System Component
export function OrbitalSystem({ searchTerm = '' }) {
  // Load CSV data
  const { asteroidData, isLoading, error } = useAsteroidData()

  // Show loading state
  if (isLoading) {
    return (
      <Html fullscreen>
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#4a9eff',
          fontFamily: 'monospace',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '10px' }}>Loading student data...</div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(74, 158, 255, 0.3)',
            borderTop: '3px solid #4a9eff',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </Html>
    )
  }

  // Show error state
  if (error) {
    return (
      <Html fullscreen>
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ff6b6b',
          fontFamily: 'monospace',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          <div>❌ Error loading data</div>
          <div style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>{error}</div>
        </div>
      </Html>
    )
  }

  return (
    <>
      <CentralSphere />
      
      <AsteroidField 
        asteroidData={asteroidData} 
        searchTerm={searchTerm}
      />
      
      {/* Research orbit with GLB model */}
      <OrbitRing radius={2} orbitColor="#ffffff" opacity={1.0} />
      <GLBOrbitingSphere
        modelPath="/ResearchModel.glb"
        radius={2}
        speed={0.08}
        initialAngle={0}
        label="Research"
        description="High frequency orbit"
        scale={0.3}
      />
      
      {/* Animation orbit with GLB model */}
      <OrbitRing radius={3.05} orbitColor="#ffffff" opacity={0.75} />
      <GLBOrbitingSphere
        modelPath="/AnimationsModel.glb"
        radius={3.05}
        speed={0.055}
        initialAngle={Math.PI * 0.7}
        label="Animation"
        description="Medium orbit zone"
        scale={0.3}
      />
      
      {/* Games orbit with GLB model */}
      <OrbitRing radius={4.1} orbitColor="#ffffff" opacity={0.5} />
      <GLBOrbitingSphere
        modelPath="/GamesModel.glb"
        radius={4.1}
        speed={0.037}
        initialAngle={Math.PI * 1.3}
        label="Games"
        description="Extended range orbit"
        scale={0.3}
        hasMoon={true}
      />
      
      {/* Interaction orbit with GLB model */}
      <OrbitRing radius={5.15} orbitColor="#ffffff" opacity={0.25} />
      <GLBOrbitingSphere
        modelPath="/InteractiveModel.glb"
        radius={5.15}
        speed={0.023}
        initialAngle={Math.PI * 1.8}
        label="Interaction"
        description="Outer orbit zone"
        scale={0.3}
      />
    </>
  )
}

// Orbit Ring Component (separated for reuse)
function OrbitRing({ radius, orbitColor, opacity = 1.0 }) {
  const createDashedCircle = (radius, segments = 150) => {
    const points = []
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      if (Math.floor(i / 3.1) % 2 === 0) {
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ))
      } else if (i > 0 && Math.floor((i-1) / 3) % 2 === 0) {
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ))
        points.push(null)
      }
    }
    return points.filter(p => p !== null)
  }

  const orbitPoints = useMemo(() => createDashedCircle(radius), [radius])

  return (
    <Line
      points={orbitPoints}
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
}

// Moon System Component
function MoonSystem({ parentPosition, moonRadius = 0.6, moonSpeed = 0.2, moonColor = "#ffffff" }) {
  const moonRef = useRef()
  const orbitLineRef = useRef()
  const materialRef = useRef()
  const geometryRef = useRef()
  
  const moonOrbitPoints = useMemo(() => {
    const createSmallDashedCircle = (radius, segments = 32) => {
      const points = []
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        if (Math.floor(i / 2) % 2 === 0) {
          points.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
          ))
        } else if (i > 0 && Math.floor((i-1) / 2) % 2 === 0) {
          points.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
          ))
          points.push(null)
        }
      }
      return points.filter(p => p !== null)
    }
    return createSmallDashedCircle(moonRadius)
  }, [moonRadius])
  
  useEffect(() => {
    const material = materialRef.current
    const geometry = geometryRef.current
    return () => {
      if (material) material.dispose()
      if (geometry) geometry.dispose()
    }
  }, [])
  
  useFrame((state) => {
    if (moonRef.current && parentPosition) {
      const time = state.clock.elapsedTime
      const moonAngle = time * moonSpeed
      
      moonRef.current.position.x = parentPosition.x + Math.cos(moonAngle) * moonRadius
      moonRef.current.position.z = parentPosition.z + Math.sin(moonAngle) * moonRadius
      moonRef.current.position.y = parentPosition.y
      
      if (orbitLineRef.current) {
        orbitLineRef.current.position.set(parentPosition.x, parentPosition.y, parentPosition.z)
      }
    }
  })

  if (!parentPosition) return null

  return (
    <group>
      <group ref={orbitLineRef}>
        <Line
          points={moonOrbitPoints}
          color="#ffffff"
          lineWidth={1}
          dashed={true}
          dashScale={0.9}
          dashSize={0.1}
          gapSize={0.05}
        />
      </group>
      
      <mesh ref={moonRef}>
        <sphereGeometry ref={geometryRef} args={[0.10, 10, 10]} />
        <meshStandardMaterial 
          ref={materialRef}
          color={moonColor} 
          metalness={0.3} 
          roughness={0.3}
          emissive={moonColor}
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  )
}

// Orbiting System Component
function OrbitingSystem({ radius, speed, sphereColor, orbitColor, initialAngle, label, description, hasMoon = false }) {
  const sphereRef = useRef()
  const materialRef = useRef()
  const [planetPosition, setPlanetPosition] = useState({ x: 0, y: 0, z: 0 })
  
  const createDashedCircle = (radius, segments = 150) => {
    const points = []
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      if (Math.floor(i / 3.1) % 2 === 0) {
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ))
      } else if (i > 0 && Math.floor((i-1) / 3) % 2 === 0) {
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ))
        points.push(null)
      }
    }
    return points.filter(p => p !== null)
  }

  const orbitPoints = useMemo(() => createDashedCircle(radius), [radius])
  
  useEffect(() => {
    return () => {
      if (materialRef.current) {
        materialRef.current.dispose()
      }
      document.body.style.cursor = 'default'
    }
  }, [])
  
  useFrame((state, delta) => {
    if (sphereRef.current) {
      const time = state.clock.elapsedTime
      const angle = time * speed + initialAngle
      
      const newX = Math.cos(angle) * radius
      const newZ = Math.sin(angle) * radius
      const newY = 0
      
      sphereRef.current.position.x = newX
      sphereRef.current.position.z = newZ
      sphereRef.current.position.y = newY
      
      const newPosition = { x: newX, y: newY, z: newZ }
      setPlanetPosition(newPosition)
      
      sphereRef.current.rotation.x += delta * 0.5
      sphereRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group>
      <Line
        points={orbitPoints}
        color={orbitColor}
        lineWidth={1}
        dashed={true}
        dashScale={1}
        dashSize={0.15}
        gapSize={0.1}
      />
      
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          ref={materialRef}
          color={sphereColor} 
          metalness={0.2} 
          roughness={0.3}
          emissive={sphereColor}
          emissiveIntensity={0.1}
        />
        <Html distanceFactor={8} position={[0, 0, 0]}>
          <div className="marker-content">
            {label}<br />
            <small>{description}</small>
          </div>
        </Html>
      </mesh>
      
      {hasMoon && <MoonSystem parentPosition={planetPosition} />}
    </group>
  )
}

// Search Bar Component
export function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      pointerEvents: 'auto'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 255, 255, 1)',
        borderRadius: '0px',
        padding: '8px 20px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(74, 158, 255, 0.1)',
        pointerEvents: 'auto'
      }}>
        <input
          type="text"
          placeholder="Search students, projects, category..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '14px',
            fontFamily: 'monospace',
            width: '400px',
            padding: '4px 0',
            pointerEvents: 'auto'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4a9eff',
              cursor: 'pointer',
              marginLeft: '10px',
              fontSize: '14px',
              padding: '4px',
              pointerEvents: 'auto'
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}