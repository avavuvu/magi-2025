import { useRef, useState, useEffect, useMemo, memo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Line, Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAsteroidData } from './ProfileSystem'

// Preload models
useGLTF.preload('/ResearchModel.glb')
useGLTF.preload('/AnimationsModel.glb')
useGLTF.preload('/GamesModel.glb')
useGLTF.preload('/InteractiveModel.glb')

// Shared materials cache
const sharedMaterials = {
  asteroid: null,
  planet: null
}

// Initialize shared materials once
function getSharedMaterial(type) {
  if (!sharedMaterials[type]) {
    if (type === 'asteroid') {
      sharedMaterials.asteroid = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0.2,
        roughness: 0.5,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 1,
        vertexColors: true,
        precision: 'mediump',
        fog: true
      })
    } else if (type === 'planet') {
      sharedMaterials.planet = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0.01,
        roughness: 2,
        emissive: new THREE.Color('#ffffffff'),
        emissiveIntensity: 0.6,
        precision: 'mediump',
        fog: true
      })
    }
  }
  return sharedMaterials[type]
}

// CRITICAL: Texture optimizer
function optimizeGLBTextures(scene) {
  scene.traverse((child) => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      
      materials.forEach(mat => {
        const textureProps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap']
        
        textureProps.forEach(prop => {
          if (mat[prop]) {
            const texture = mat[prop]
            texture.anisotropy = 1
            texture.minFilter = THREE.LinearMipmapLinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.generateMipmaps = true
            texture.needsUpdate = true
          }
        })
        
        mat.precision = 'mediump'
        mat.fog = true
      })
      
      child.frustumCulled = true
    }
  })
}

// ✅ HIGH PRIORITY FIX #2: Performance Regression Trigger
const PerformanceRegressor = memo(() => {
  const regress = useThree((state) => state.performance.regress)
  const controls = useThree((state) => state.controls)
  
  useEffect(() => {
    if (!controls) return
    
    const handleChange = () => {
      regress()
    }
    
    controls.addEventListener('change', handleChange)
    
    return () => {
      controls.removeEventListener('change', handleChange)
    }
  }, [controls, regress])
  
  return null
})

PerformanceRegressor.displayName = 'PerformanceRegressor'

// GLB Model Component - MEMOIZED with invalidate support
const GLBOrbitingSphere = memo(({ 
  modelPath, 
  radius, 
  speed, 
  initialAngle, 
  label, 
  scale = 1 
}) => {
  const { scene } = useGLTF(modelPath)
  const groupRef = useRef()
  const invalidate = useThree((state) => state.invalidate)
  
  const clonedScene = useMemo(() => {
    const cloned = scene.clone()
    optimizeGLBTextures(cloned)
    
    cloned.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
        }
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach(mat => {
            mat.emissive = new THREE.Color(0x00ff88)
            mat.emissiveIntensity = 0.5
          })
        }
      }
    })
    return cloned
  }, [scene])

  useEffect(() => {
    // Initial position setup
    if (groupRef.current) {
      const angle = initialAngle
      const newX = Math.cos(angle) * radius
      const newZ = Math.sin(angle) * radius
      groupRef.current.position.set(newX, 0, newZ)
      invalidate()
    }
    
    return () => {
      if (clonedScene) {
        clonedScene.traverse((child) => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material]
            materials.forEach(material => {
              Object.keys(material).forEach(key => {
                if (material[key]?.isTexture) {
                  material[key].dispose()
                }
              })
              material.dispose()
            })
          }
        })
      }
    }
  }, [clonedScene, initialAngle, radius, invalidate])
  
  // Animation loop - runs every frame for smooth orbiting
  useFrame((state) => {
    if (!groupRef.current) return
    
    const time = state.clock.elapsedTime
    const angle = time * speed + initialAngle
    
    const newX = Math.cos(angle) * radius
    const newZ = Math.sin(angle) * radius
    
    groupRef.current.position.set(newX, 0, newZ)
    groupRef.current.rotation.y = time * 0.1
    
    invalidate()
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={scale} />
      
      <Line
        points={[[0, 0, 0], [1.2, 0, 0]]}
        color="#ffffff"
        lineWidth={1}
      />
      
      <Html position={[1.2, 0, 0]} distanceFactor={8} center>
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
    </group>
  )
})

GLBOrbitingSphere.displayName = 'GLBOrbitingSphere'

// Central Sphere - MEMOIZED with invalidate
const CentralSphere = memo(() => {
  const meshRef = useRef()
  const invalidate = useThree((state) => state.invalidate)
  
  // Animation loop - runs every frame for smooth rotation
  useFrame((state) => {
    if (!meshRef.current) return
    
    meshRef.current.rotation.y += 0.005
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    
    invalidate()
  })

  return (
    <mesh ref={meshRef} material={getSharedMaterial('planet')}>
      <sphereGeometry args={[1, 32, 32]} />
      
      <Html distanceFactor={8} position={[0, 0, 0]} center>
        <div style={{
          textAlign: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0px'
        }}>
          <img 
            src="/MAGI_Banner.webp" 
            alt="ORBITS MAGI EXPO 2025"
            style={{
              width: '350px',
              height: 'auto',
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
              marginBottom: '10px'
            }}
          />
          <div style={{
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#000000',
           //textShadow: '0 0 4px #000000',
            letterSpacing: '3px',
            textTransform: 'uppercase',
           // background: 'rgba(0, 0, 0, 0.9',
            padding: '6px 16px',
           // border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(5px)'
          }}>
            RMIT EXPO 2025
          </div>
        </div>
      </Html>
    </mesh>
  )
})

CentralSphere.displayName = 'CentralSphere'

// ASTEROID FIELD - MAXIMUM OPTIMIZATION
const AsteroidField = memo(({ asteroidData = [], searchTerm = '' }) => {
  const meshRef = useRef()
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const hoveredAsteroid = hoveredIndex !== null ? asteroidData[hoveredIndex] : null
  const invalidate = useThree((state) => state.invalidate)
  
  // Shared geometry
  const sharedGeometry = useMemo(() => new THREE.SphereGeometry(1, 4, 3), [])
  
  // CRITICAL: Reuse objects outside the render loop to avoid GC pressure
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])
  
  // Initialize instance matrices once
  useEffect(() => {
    if (!meshRef.current || asteroidData.length === 0) return
    
    const color = new THREE.Color(0xffffff)
    
    asteroidData.forEach((asteroid, i) => {
      const scale = 0.04 + (i % 8) * 0.002
      tempObject.position.fromArray(asteroid.position)
      tempObject.scale.set(scale, scale, scale)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
      
      meshRef.current.setColorAt(i, color)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.instanceColor.needsUpdate = true
    
    if (meshRef.current.geometry) {
      meshRef.current.geometry.computeBoundingSphere()
      meshRef.current.geometry.computeBoundingBox()
    }
    
    meshRef.current.computeBoundingSphere()
    invalidate()
    
  }, [asteroidData, tempObject, invalidate])

  // Search matches - memoized
  const searchMatches = useMemo(() => {
    if (!searchTerm.trim()) return new Set()
    const term = searchTerm.toLowerCase()
    const matches = new Set()
    asteroidData.forEach((asteroid, i) => {
      if (asteroid.name.toLowerCase().includes(term) || 
          asteroid.workType.toLowerCase().includes(term) ||
          asteroid.workTitle.toLowerCase().includes(term)) {
        matches.add(i)
      }
    })
    return matches
  }, [searchTerm, asteroidData])

  const hasActiveSearch = searchTerm.trim().length > 0

  // Update colors only when hover or search changes
  useEffect(() => {
    if (!meshRef.current) return
    
    for (let i = 0; i < asteroidData.length; i++) {
      const asteroid = asteroidData[i]
      const isHovered = hoveredIndex === i
      const isConnected = hoveredAsteroid && hoveredAsteroid.workType === asteroid.workType && hoveredIndex !== i
      const isMatch = searchMatches.has(i)
      
      let intensity
      if (isHovered) {
        intensity = 2.0
      } else if (isConnected) {
        intensity = 1.5
      } else if (isMatch) {
        intensity = 1.8
      } else {
        intensity = hasActiveSearch ? 0.4 : 1.0
      }
      
      tempColor.setHex(0xffffff).multiplyScalar(intensity)
      meshRef.current.setColorAt(i, tempColor)
    }
    
    meshRef.current.instanceColor.needsUpdate = true
    invalidate()
  }, [hoveredIndex, hoveredAsteroid, searchMatches, hasActiveSearch, asteroidData, tempColor, invalidate])

  // ✅ HIGH PRIORITY FIX #3: Throttle to every 3rd frame
  useFrame((state) => {
    if (!meshRef.current) return
    
    // Only update every 3rd frame for better performance
    if (state.frame % 3 !== 0) return
    
    const time = state.clock.elapsedTime
    
    for (let i = 0; i < asteroidData.length; i++) {
      const asteroid = asteroidData[i]
      const floatSpeed = 0.1 + (i % 10) * 0.03
      const floatAmplitude = 0.05 + (i % 5) * 0.01
      const scale = 0.04 + (i % 8) * 0.002
      
      tempObject.position.set(
        asteroid.position[0],
        asteroid.position[1] + Math.sin(time * floatSpeed) * floatAmplitude,
        asteroid.position[2]
      )
      tempObject.scale.set(scale, scale, scale)
      tempObject.rotation.x = time * 0.05 * (1 + i % 10 * 0.05)
      tempObject.rotation.y = time * 0.03 * (1 + i % 10 * 0.05)
      tempObject.updateMatrix()
      
      meshRef.current.setMatrixAt(i, tempObject.matrix)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
    invalidate()
  })

  // Cleanup
  useEffect(() => {
    return () => {
      if (sharedGeometry) sharedGeometry.dispose()
      document.body.style.cursor = 'default'
    }
  }, [sharedGeometry])

  if (asteroidData.length === 0) return null

  return (
    <group key={`asteroid-field-${asteroidData.length}`}>
      <instancedMesh
        ref={meshRef}
        args={[sharedGeometry, getSharedMaterial('asteroid'), asteroidData.length]}
        frustumCulled={false}
        onPointerMove={(e) => {
          e.stopPropagation()
          const id = e.instanceId
          if (id !== undefined && id >= 0 && id < asteroidData.length) {
            setHoveredIndex(id)
            document.body.style.cursor = 'pointer'
            invalidate()
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHoveredIndex(null)
          document.body.style.cursor = 'default'
          invalidate()
        }}
        onClick={(e) => {
          e.stopPropagation()
          const id = e.instanceId
          if (id !== undefined && id >= 0 && id < asteroidData.length) {
            console.log('Clicked asteroid:', asteroidData[id])
            invalidate()
          }
        }}
      />

      {hoveredAsteroid && (
        <Html
          position={[
            hoveredAsteroid.position[0] + 0.5,
            hoveredAsteroid.position[1],
            hoveredAsteroid.position[2]
          ]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            background: 'rgba(0, 0, 0, 0.95)',
            border: '1px solid rgba(255, 255, 255, 1)',
            padding: '12px',
            color: 'white',
            fontSize: '11px',
            fontFamily: 'monospace',
            width: '240px',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 8px 32px rgba(233, 53, 158, .1)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            {/* Profile Picture - fixed size, only loads on hover */}
            <div style={{
              width: '60px',
              height: '60px',
              flexShrink: 0,
              position: 'relative'
            }}>
              <img 
                src={hoveredAsteroid.studentNumber 
                  ? `/profiles/${hoveredAsteroid.studentNumber}.webp`
                  : '/profiles/placeholder.webp'
                }
                alt={hoveredAsteroid.name}
                loading="lazy"
                onError={(e) => {
                  // Fallback to placeholder if image doesn't exist
                  e.target.src = '/profiles/placeholder.webp'
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '4px',
                  objectFit: 'cover',
                  border: '1px solid rgba(233, 53, 158, 0.5)',
                  display: 'block'
                }}
              />
            </div>
            
            <div style={{ 
              flex: 1,
              minWidth: 0,
              overflow: 'hidden'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {hoveredAsteroid.name}
              </div>
              
              <div style={{
                fontSize: '9px',
                color: 'rgba(233, 53, 158, 1)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {hoveredAsteroid.workType}
              </div>

              <div style={{
                fontSize: '10px',
                color: '#cccccc',
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 6,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {hoveredAsteroid.bio || 'No bio available'}
              </div>
            </div>
          </div>
        </Html>
      )}
      
      {hasActiveSearch && asteroidData.map((asteroid, i) => {
        if (!searchMatches.has(i)) return null
        
        return (
          <Html
            key={`search-${asteroid.id}`}
            position={asteroid.position}
            style={{
              pointerEvents: 'none',
              userSelect: 'none'
            }}
            center
            distanceFactor={10}
          >
            <div style={{
              width: '60px',
              height: '60px',
              border: '1px solid #e9359e',
              borderRadius: '4px',
              background: 'rgba(233, 53, 158, 0.05)',
              boxShadow: '0 0 15px rgba(233, 53, 158, 0.3)',
              animation: 'searchPulse 2s infinite ease-in-out',
              position: 'relative',
              pointerEvents: 'none'
            }}>
              <div style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                width: '8px',
                height: '8px',
                border: '2px solid #e9359e',
                borderRight: 'none',
                borderBottom: 'none',
                pointerEvents: 'none'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                border: '2px solid #e9359e',
                borderLeft: 'none',
                borderBottom: 'none',
                pointerEvents: 'none'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                left: '-2px',
                width: '8px',
                height: '8px',
                border: '2px solid #e9359e',
                borderRight: 'none',
                borderTop: 'none',
                pointerEvents: 'none'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                border: '2px solid #e9359e',
                borderLeft: 'none',
                borderTop: 'none',
                pointerEvents: 'none'
              }}></div>
            </div>

            <style>{`
              @keyframes searchPulse {
                0%, 100% { 
                  transform: scale(1);
                  opacity: 0.8;
                }
                50% { 
                  transform: scale(1.1);
                  opacity: 1;
                }
              }
            `}</style>
          </Html>
        )
      })}
    </group>
  )
})

AsteroidField.displayName = 'AsteroidField'

// Main Orbital System
export function OrbitalSystem({ searchTerm = '' }) {
  const { asteroidData, isLoading, error } = useAsteroidData()

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
      {/* ✅ HIGH PRIORITY FIX #2: Add Performance Regressor */}
      <PerformanceRegressor />
      
      <CentralSphere />
      
      <AsteroidField 
        asteroidData={asteroidData} 
        searchTerm={searchTerm}
      />
      
      <OrbitRing radius={2} orbitColor="#ffffff" opacity={1.0} />
      <GLBOrbitingSphere
        modelPath="/ResearchModel.glb"
        radius={2}
        speed={0.04}
        initialAngle={0}
        label="Research"
        scale={0.3}
      />
      
      <OrbitRing radius={3.05} orbitColor="#ffffff" opacity={0.75} />
      <GLBOrbitingSphere
        modelPath="/AnimationsModel.glb"
        radius={3.05}
        speed={0.03}
        initialAngle={Math.PI * 0.7}
        label="Animation"
        scale={0.3}
      />
      
      <OrbitRing radius={4.1} orbitColor="#ffffff" opacity={0.5} />
      <GLBOrbitingSphere
        modelPath="/GamesModel.glb"
        radius={4.1}
        speed={0.02}
        initialAngle={Math.PI * 1.3}
        label="Games"
        scale={0.3}
      />
      
      <OrbitRing radius={5.15} orbitColor="#ffffff" opacity={0.25} />
      <GLBOrbitingSphere
        modelPath="/InteractiveModel.glb"
        radius={5.15}
        speed={0.015}
        initialAngle={Math.PI * 1.8}
        label="Interaction"
        scale={0.3}
      />
    </>
  )
}

// Orbit Ring - MEMOIZED
const OrbitRing = memo(({ radius, orbitColor, opacity = 1.0 }) => {
  const points = useMemo(() => {
    const pts = []
    const segments = 150
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      if (Math.floor(i / 3.1) % 2 === 0) {
        pts.push(new THREE.Vector3(
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

OrbitRing.displayName = 'OrbitRing'

// Search Bar - MEMOIZED
export const SearchBar = memo(({ searchTerm, onSearchChange }) => {
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
})

SearchBar.displayName = 'SearchBar'