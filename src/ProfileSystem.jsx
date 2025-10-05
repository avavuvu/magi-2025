// ProfileSystem.jsx
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
        strokeWidth="1.5"
        opacity={0.6}
      />
      {/* Line to bottom of profile card */}
      <line
        x1={planetScreenX}
        y1={planetScreenY}
        x2={profileCenterX + -150}
        y2={profileCenterY + 194}
        stroke="white"
        strokeWidth="1.5"
        opacity={0.6}
      />
    </svg>
  )
}

// Main Profile System Component
export function ProfileSystem({ 
  showProfile, 
  planetPosition, 
  profilePosition, 
  profileOpacity, 
  isFollowingMouse,
  onProfileClick,
  camera,
  size
}) {
  if (!showProfile) return null

  return (
    <div className="profile-overlay">
      <ConnectionLines 
        planetPosition={planetPosition} 
        profilePosition={profilePosition}
        opacity={profileOpacity}
        camera={camera}
        size={size}
      />
      <ProfileCard 
        onClose={onProfileClick}
        position={profilePosition}
        isFollowingMouse={isFollowingMouse}
        opacity={profileOpacity}
      />
    </div>
  )
}