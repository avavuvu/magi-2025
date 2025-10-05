import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { ProfileSystem } from './ProfileSystem'

// Central Sphere Component
function CentralSphere() {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#ffffff" 
        metalness={0.01} 
        roughness={2}
        emissive="#4a9eff"
        emissiveIntensity={0.1}
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


// ASTEROID FIELD COMPONENT - WITH CONNECTION LINES
function AsteroidField({ count = 100, searchTerm = '' }) {
  const asteroidRefs = useRef([])
  const [hoveredAsteroid, setHoveredAsteroid] = useState(null)
  
  // Generate random positions for asteroids (avoiding central orbits)
  const asteroidData = useState(() => {
    const asteroids = []
    for (let i = 0; i < count; i++) {
      // Random position in a ring between orbit 3 and outer edge
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.8
      const distance = 2 + Math.random() * 2.7 // Between 5.5 and 8 units
      const height = (Math.random() - 0.5) * 1.5 // Slight vertical variation
      
      asteroids.push({
        id: i,
        initialX: Math.cos(angle) * distance,
        initialY: height,
        initialZ: Math.sin(angle) * distance,
        rotationSpeed: 0.01 + Math.random() * 0.02,
        floatSpeed: 0.1 + Math.random() * 0.3,
        floatAmplitude: 0.05 + Math.random() * 0.05,
        name: `Student ${i + 1}`,
        course: ['Animation', 'Games Design', 'Interactive Media', 'Digital Art'][Math.floor(Math.random() * 4)],
        size: 0.06 + Math.random() * 0.02
      })
    }
    return asteroids
  })[0]

  // Check if asteroid matches search
  const isMatch = useCallback((asteroid) => {
    if (!searchTerm.trim()) return false
    return asteroid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           asteroid.course.toLowerCase().includes(searchTerm.toLowerCase())
  }, [searchTerm])

  // Check if any search is active
  const hasActiveSearch = searchTerm.trim().length > 0

  // Create connecting lines to asteroids with same course
  const getConnectionLines = useCallback(() => {
    if (!hoveredAsteroid) return []
    
    const connections = []
    const hoveredPos = [hoveredAsteroid.initialX, hoveredAsteroid.initialY, hoveredAsteroid.initialZ]
    
    asteroidData.forEach(asteroid => {
      if (asteroid.id !== hoveredAsteroid.id && asteroid.course === hoveredAsteroid.course) {
        const targetPos = [asteroid.initialX, asteroid.initialY, asteroid.initialZ]
        connections.push({
          start: hoveredPos,
          end: targetPos,
          id: `connection-${hoveredAsteroid.id}-${asteroid.id}`
        })
      }
    })
    
    return connections
  }, [hoveredAsteroid, asteroidData])

  const connectionLines = getConnectionLines()

  useFrame((state) => {
    asteroidRefs.current.forEach((ref, index) => {
      if (ref && asteroidData[index]) {
        const asteroid = asteroidData[index]
        const time = state.clock.elapsedTime
        
        // Gentle floating motion
        ref.position.y = asteroid.initialY + Math.sin(time * asteroid.floatSpeed) * asteroid.floatAmplitude
        
        // Slow rotation
        ref.rotation.x += asteroid.rotationSpeed
        ref.rotation.y += asteroid.rotationSpeed * 0.7
      }
    })
  })

  return (
    <group>
      {/* Connection lines for same course types */}
      {connectionLines.map(connection => (
        <Line
          key={connection.id}
          points={[connection.start, connection.end]}
          color="#4a9eff"
          lineWidth={1}
          transparent
          opacity={0.4}
          dashed={true}
          dashScale={2}
          dashSize={0.05}
          gapSize={0.02}
        />
      ))}

      {asteroidData.map((asteroid, index) => (
        <group key={asteroid.id}>
          {/* Main asteroid sphere */}
          <mesh
            ref={(el) => (asteroidRefs.current[index] = el)}
            position={[asteroid.initialX, asteroid.initialY, asteroid.initialZ]}
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
              console.log(`Clicked on ${asteroid.name} - ${asteroid.course}`)
            }}
          >
            <sphereGeometry args={[asteroid.size * 0.4, 4, 3]} />
            <meshStandardMaterial 
              color="#999999"
              metalness={0.0}
              roughness={1.0}
              emissive={
                hoveredAsteroid?.id === asteroid.id ? "#4a9eff" : 
                hoveredAsteroid?.course === asteroid.course && hoveredAsteroid?.id !== asteroid.id ? "#4a9eff" :
                hasActiveSearch && isMatch(asteroid) ? "#4a9eff" : 
                "#000000"
              }
              emissiveIntensity={
                hoveredAsteroid?.id === asteroid.id ? 0.2 : 
                hoveredAsteroid?.course === asteroid.course && hoveredAsteroid?.id !== asteroid.id ? 0.15 :
                hasActiveSearch && isMatch(asteroid) ? 0.3 : 
                0.0
              }
              opacity={
                hasActiveSearch ? (isMatch(asteroid) ? 0.8 : 0.2) : 0.6
              }
              transparent={true}
            />
          </mesh>
          
          {/* Search result highlight rectangle */}
          {hasActiveSearch && isMatch(asteroid) && (
            <Html
              position={[asteroid.initialX, asteroid.initialY, asteroid.initialZ]}
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
                {/* Corner markers */}
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

              {/* CSS animations */}
              <style jsx>{`
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

          {/* Minimal space-age student profile - only on hover */}
          {hoveredAsteroid?.id === asteroid.id && (
            <Html
              position={[asteroid.initialX + asteroid.size + 0.8, asteroid.initialY + 0.2, asteroid.initialZ]}
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
                boxShadow: '0 8px 32px rgba(74, 158, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                animation: 'fadeIn 0.3s ease-out',
                position: 'relative',
                zIndex: 99999,
                transform: 'translateZ(0)'
              }}>
                {/* Header with connection indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  borderBottom: '1px solid rgba(74, 158, 255, 0.2)',
                  paddingBottom: '6px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#4a9eff',
                    borderRadius: '50%',
                    marginRight: '8px',
                    boxShadow: '0 0 8px rgba(74, 158, 255, 0.5)',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <span style={{
                    color: '#4a9eff',
                    fontSize: '10px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>STUDENT PROFILE</span>
                </div>

                {/* Profile content */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Profile picture placeholder */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(74, 158, 255, 0.2)',
                    borderRadius: '4px',
                    border: '1px solid rgba(74, 158, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#4a9eff'
                  }}>
                    ◊
                  </div>

                  {/* Profile info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      marginBottom: '2px'
                    }}>
                      {asteroid.name}
                    </div>
                    
                    <div style={{
                      fontSize: '9px',
                      color: '#4a9eff',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {asteroid.course}
                    </div>

                    <div style={{
                      fontSize: '10px',
                      color: '#cccccc',
                      lineHeight: '1.3',
                      marginBottom: '6px'
                    }}>
                      Exploring digital frontiers through innovative creative practice and cutting-edge technology.
                    </div>

                    <div style={{
                      fontSize: '9px',
                      color: '#999999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      PROJECT: {asteroid.course === 'Animation' ? 'Motion Synthesis' : 
                               asteroid.course === 'Games Design' ? 'Interactive Worlds' :
                               asteroid.course === 'Interactive Media' ? 'Digital Experiences' : 
                               'Visual Narratives'}
                    </div>
                  </div>
                </div>

                {/* Connection line to asteroid */}
                <div style={{
                  position: 'absolute',
                  left: '-12px',
                  top: '20px',
                  width: '12px',
                  height: '1px',
                  background: 'linear-gradient(to left, rgba(74, 158, 255, 0.5), transparent)',
                }}></div>
              </div>

              {/* CSS animations */}
              <style jsx>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateX(10px); }
                  to { opacity: 1; transform: translateX(0); }
                }
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.5; }
                }
              `}</style>
            </Html>
          )}
        </group>
      ))}
    </group>
  )
}




// Main Orbital System Component - REMOVED SEARCH BAR FROM HERE
export function OrbitalSystem({ searchTerm = '' }) {
  const { camera, size } = useThree() // Get camera and size from useThree
  const [showProfile, setShowProfile] = useState(false)
  const [profilePosition, setProfilePosition] = useState({ x: 0, y: 0 })
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })
  const [planetPosition, setPlanetPosition] = useState(null)
  const [isFollowingMouse, setIsFollowingMouse] = useState(false)
  const [profileOpacity, setProfileOpacity] = useState(1)
  const [isFading, setIsFading] = useState(false)

  const handleMouseMove = useCallback((e) => {
    if (isFollowingMouse && showProfile) {
      setTargetPosition({
        x: e.clientX,
        y: e.clientY
      })
    }
  }, [isFollowingMouse, showProfile])

  // Smooth animation with useEffect and requestAnimationFrame
  useEffect(() => {
    let animationId

    const animate = () => {
      setProfilePosition(current => {
        const dx = targetPosition.x - current.x
        const dy = targetPosition.y - current.y
        
        // Easing factor for smooth following
        const easingFactor = 0.15
        
        return {
          x: current.x + dx * easingFactor,
          y: current.y + dy * easingFactor
        }
      })
      
      if (isFollowingMouse) {
        animationId = requestAnimationFrame(animate)
      }
    }

    if (isFollowingMouse) {
      animate()
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isFollowingMouse, targetPosition])

  const handlePlanetClick = useCallback(() => {
    if (!showProfile) {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      setShowProfile(true)
      setIsFollowingMouse(true)
      setProfileOpacity(1)
      setIsFading(false)
      setTargetPosition({ x: centerX, y: centerY })
      setProfilePosition({ x: centerX, y: centerY })
    }
  }, [showProfile])

  const handleProfileClick = useCallback(() => {
    if (showProfile && !isFading) {
      setIsFading(true)
      setProfileOpacity(0)
      
      setTimeout(() => {
        setShowProfile(false)
        setIsFollowingMouse(false)
        setIsFading(false)
        setProfileOpacity(1)
      }, 300)
    }
  }, [showProfile, isFading])

  // Add/remove mouse listener
  useEffect(() => {
    if (isFollowingMouse) {
      document.addEventListener('mousemove', handleMouseMove)
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isFollowingMouse, handleMouseMove])

  return (
    <>
      {/* Profile Card Overlay with Connection Lines */}
      {showProfile && (
        <Html fullscreen>
          <ProfileSystem
            showProfile={showProfile}
            planetPosition={planetPosition}
            profilePosition={profilePosition}
            profileOpacity={profileOpacity}
            isFollowingMouse={isFollowingMouse}
            onProfileClick={handleProfileClick}
            camera={camera}
            size={size}
          />
        </Html>
      )}

      {/* Main central sphere */}
      <CentralSphere />
      
      {/* Asteroid field - student profiles */}
      <AsteroidField count={100} searchTerm={searchTerm} />
      
      {/* First orbit - closest (Research - now clickable) */}
      <OrbitingSystem 
        radius={2} 
        speed={0.05} 
        sphereColor="#ffffffff" 
        orbitColor="#000000ff"
        initialAngle={0}
        label="Research"
        description="High frequency orbit"
        onClick={handlePlanetClick}
        onPositionUpdate={setPlanetPosition}
      />
      
      {/* Second orbit - middle */} 
      <OrbitingSystem 
        radius={3.3} 
        speed={0.04} 
        sphereColor="#ffffffff" 
        orbitColor="#000000ff"
        initialAngle={Math.PI * 0.7}
        label="Animation"
        description="Medium orbit zone"
      />
      
      {/* Third orbit - farthest with moon */}
      <OrbitingSystem 
        radius={4.7} 
        speed={0.03} 
        sphereColor="#ffffffff" 
        orbitColor="#000000ff"
        initialAngle={Math.PI * 1.3}
        label="Games & Interaction"
        description="Extended range orbit"
        hasMoon={true}
      />
    </>
  )
}

// SEPARATE SEARCH BAR COMPONENT - TO BE PLACED OUTSIDE THE CANVAS
export function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999, // Increased z-index to ensure it's above everything
      pointerEvents: 'auto'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 255, 255, 1)',
        borderRadius: '0px',
        padding: '8px 20px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(74, 158, 255, 0.1)',
        pointerEvents: 'auto' // Ensure this container accepts pointer events
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
            padding: '4px 0', // Added some padding for better click area
            pointerEvents: 'auto' // Explicitly enable pointer events for input
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
              pointerEvents: 'auto' // Ensure button is clickable
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

// OPTIMIZED MOON SYSTEM COMPONENT
function MoonSystem({ parentPosition, moonRadius = 0.6, moonSpeed = 0.2, moonColor = "#000000ff" }) {
  const moonRef = useRef()
  const orbitLineRef = useRef()
  
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

  const moonOrbitPoints = createSmallDashedCircle(moonRadius)
  
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
          color="#000000ff"
          lineWidth={1}
          dashed={true}
          dashScale={0.9}
          dashSize={0.1}
          gapSize={0.05}
        />
      </group>
      
      <mesh ref={moonRef}>
        <sphereGeometry args={[0.10, 10, 10]} />
        <meshStandardMaterial 
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

// ORBITING SYSTEM COMPONENT
function OrbitingSystem({ radius, speed, sphereColor, orbitColor, initialAngle, label, description, hasMoon = false, onClick, onPositionUpdate }) {
  const sphereRef = useRef()
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

  const orbitPoints = createDashedCircle(radius)
  
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
    
    if (onPositionUpdate) {
      onPositionUpdate(newPosition)
    }
    
    // Smoother rotation using delta time
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
      
      <mesh 
        ref={sphereRef}
        onClick={onClick}
        onPointerOver={(e) => {
          if (onClick) {
            e.object.material.emissiveIntensity = 0.3
            document.body.style.cursor = 'pointer'
          }
        }}
        onPointerOut={(e) => {
          if (onClick) {
            e.object.material.emissiveIntensity = 0.1
            document.body.style.cursor = 'default'
          }
        }}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
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