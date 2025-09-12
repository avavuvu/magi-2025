import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'

// Enhanced Profile Card Component that follows mouse
function ProfileCard({ onClose, position, isFollowingMouse, opacity = 1 }) {
  return (
    <div 
      className="profile-card"
      style={{
        position: 'absolute',
        left: position.x - 150, // Center the card on mouse
        top: position.y - 75,
        cursor: 'pointer',
        opacity: opacity,
        transition: isFollowingMouse ? 'none' : 'opacity 0.3s ease-out',
        pointerEvents: opacity > 0 ? 'auto' : 'none'
      }}
      onClick={onClose}
    >
      <div className="profile-header">
        <h3>Research Division</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      <div className="profile-content">
        <p><strong>Focus:</strong> Advanced Technology Research</p>
        <p><strong>Team:</strong> 15 Researchers</p>
        <p><strong>Current Projects:</strong> AI, VR, Data Science</p>
        <p><strong>Location:</strong> Building 14, Level 3</p>
      </div>
    </div>
  )
}

// Connection Lines Component with proper 3D-to-2D projection
function ConnectionLines({ planetPosition, profilePosition, opacity = 1, camera, size }) {
  if (!planetPosition || !profilePosition || opacity <= 0 || !camera || !size) return null

  // Convert 3D planet position to 2D screen coordinates using proper projection
  const planetVector = new THREE.Vector3(planetPosition.x, planetPosition.y, planetPosition.z)
  const planetScreenPos = planetVector.project(camera)
  
  const planetScreenX = (planetScreenPos.x * 0.5 + 0.5) * size.width
  const planetScreenY = (-planetScreenPos.y * 0.5 + 0.5) * size.height

  // Profile card corners for connection points
  const profileCenterX = profilePosition.x
  const profileCenterY = profilePosition.y

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999,
        opacity: opacity
      }}
    >
      {/* Line to top of profile card */}
      <line
        x1={planetScreenX}
        y1={planetScreenY}
        x2={profileCenterX + 150}
        y2={profileCenterY - 75}
        stroke="white"
        strokeWidth="1"
        opacity={0.6}
      />
      {/* Line to bottom of profile card */}
      <line
        x1={planetScreenX}
        y1={planetScreenY}
        x2={profileCenterX + -150}
        y2={profileCenterY + 194}
        stroke="white"
        strokeWidth="1"
        opacity={0.6}
      />
    </svg>
  )
}

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

// Main Orbital System Component
export function OrbitalSystem() {
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
          <div className="profile-overlay">
            <ConnectionLines 
              planetPosition={planetPosition} 
              profilePosition={profilePosition}
              opacity={profileOpacity}
              camera={camera}
              size={size}
            />
            <ProfileCard 
              onClose={handleProfileClick}
              position={profilePosition}
              isFollowingMouse={isFollowingMouse}
              opacity={profileOpacity}
            />
          </div>
        </Html>
      )}

      {/* Main central sphere */}
      <CentralSphere />
      
      {/* First orbit - closest (Research - now clickable) */}
      <OrbitingSystem 
        radius={2.5} 
        speed={0.07} 
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
        radius={3.8} 
        speed={0.2} 
        sphereColor="#ffffffff" 
        orbitColor="#000000ff"
        initialAngle={Math.PI * 0.7}
        label="Animation"
        description="Medium orbit zone"
      />
      
      {/* Third orbit - farthest with moon */}
      <OrbitingSystem 
        radius={5.2} 
        speed={0.1} 
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

// OPTIMIZED MOON SYSTEM COMPONENT
function MoonSystem({ parentPosition, moonRadius = 0.5, moonSpeed = 0.8, moonColor = "#000000ff" }) {
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
  
  useFrame((state) => {
    if (sphereRef.current) {
      const time = state.clock.elapsedTime
      const angle = time * speed + initialAngle
      
      const newX = Math.cos(angle) * radius
      const newZ = Math.sin(angle) * radius
      const newY = Math.sin(time * 2 + initialAngle) * 0.1
      
      sphereRef.current.position.x = newX
      sphereRef.current.position.z = newZ
      sphereRef.current.position.y = newY
      
      const newPosition = { x: newX, y: newY, z: newZ }
      setPlanetPosition(newPosition)
      
      if (onPositionUpdate) {
        onPositionUpdate(newPosition)
      }
      
      sphereRef.current.rotation.x += 0.001
      sphereRef.current.rotation.y += 0.001
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