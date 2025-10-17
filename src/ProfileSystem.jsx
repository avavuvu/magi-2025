/* eslint-disable */
import { useMemo, memo, useState, useEffect } from 'react'
import * as THREE from 'three'
import Papa from 'papaparse'

// ============================================
// DATA LOADING HOOK
// ============================================
export const useAsteroidData = () => {
  const [asteroidData, setAsteroidData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch CSV from public folder
        const response = await fetch('/FormResponses.csv')
        const csvContent = await response.text()
        
        const parsed = Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim()
        })
        
        console.log('✅ Loaded', parsed.data.length, 'student profiles')
        
        // Transform CSV data into minimal asteroid format
        const asteroids = parsed.data.map((row, index) => {
          // Generate orbital positions
          const angle = (Math.PI * 2 * index) / parsed.data.length + Math.random() * 0.8
          const distance = 2 + Math.random() * 2.7
          const height = (Math.random() - 0.5) * 1.5
          
          return {
            id: index,
            position: [
              Math.cos(angle) * distance,
              height,
              Math.sin(angle) * distance
            ],
            // Essential display info
            name: row['Your Name (as you want it on the Expo website)'] || `Participant ${index + 1}`,
            workTitle: row['Title of the Work'] || 'Untitled Work',
            workType: row['Type of work (one form per work)'] || 'Creative Work',
            bio: row['Brief profile of yourself (30-80 words)'] || 'No bio available',
            studentNumber: row['Student number'] || '',
            // For generating profile page links
            profileSlug: row['Student number'] || `student-${index}`
          }
        })
        
        setAsteroidData(asteroids)
        setIsLoading(false)
        
      } catch (err) {
        console.error('❌ Error loading CSV:', err)
        setError(err.message)
        setAsteroidData([]) // Empty array on error
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  return { asteroidData, isLoading, error }
}

// ============================================
// MINIMAL PROFILE CARD
// ============================================
const ProfileCard = memo(({ onClose, position, isFollowingMouse, opacity = 1, asteroidInfo }) => {
  if (!asteroidInfo) return null
  
  // Generate profile page URL - adjust this to match your site structure
  const profileUrl = `/profiles/${asteroidInfo.profileSlug}`
  
  return (
    <div 
      className="profile-card"
      style={{
        position: 'absolute',
        left: position.x - 50,
        top: position.y - 100,
        width: '300px',
        cursor: 'pointer',
        opacity: opacity,
        transition: isFollowingMouse ? 'none' : 'opacity 0.3s ease-out',
        pointerEvents: opacity > 0 ? 'auto' : 'none',
        willChange: isFollowingMouse ? 'transform' : 'auto',
        transform: 'translateZ(0)',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        borderRadius: '8px',
        border: '1px solid rgba(74, 255, 158, 0.5)',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(74, 255, 158, 0.3)',
        fontFamily: 'monospace'
      }}
      onClick={onClose}
    >
      {/* Close button */}
      <button 
        onClick={onClose} 
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          opacity: 0.6,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.6'}
      >
        ×
      </button>

      {/* Student name */}
      <h3 style={{ 
        margin: '0 0 8px 0', 
        color: '#fff', 
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        {asteroidInfo.name}
      </h3>
      
      {/* Work type badge */}
      <div style={{
        display: 'inline-block',
        padding: '4px 10px',
        background: 'rgba(74, 255, 158, 0.2)',
        border: '1px solid rgba(74, 255, 158, 0.4)',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#4aff9e',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '12px'
      }}>
        {asteroidInfo.workType}
      </div>

      {/* Artist Bio */}
      <div style={{ 
        color: '#ddd', 
        fontSize: '13px',
        marginBottom: '16px',
        lineHeight: '1.5'
      }}>
        {asteroidInfo.bio}
      </div>

      {/* Work title */}
      <div style={{ 
        color: '#aaa', 
        fontSize: '12px',
        marginBottom: '16px',
        lineHeight: '1.4',
        fontStyle: 'italic'
      }}>
        <strong style={{ color: '#ccc' }}>Project:</strong> {asteroidInfo.workTitle}
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(to right, rgba(74, 255, 158, 0), rgba(74, 255, 158, 0.5), rgba(74, 255, 158, 0))',
        margin: '16px 0'
      }}></div>

      {/* View full profile link */}
      <a 
        href={profileUrl}
        onClick={(e) => {
          e.stopPropagation()
          // The link will navigate normally
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#4aff9e',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 'bold',
          transition: 'all 0.2s',
          padding: '8px 12px',
          background: 'rgba(74, 255, 158, 0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(74, 255, 158, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(74, 255, 158, 0.2)'
          e.target.style.borderColor = 'rgba(74, 255, 158, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(74, 255, 158, 0.1)'
          e.target.style.borderColor = 'rgba(74, 255, 158, 0.3)'
        }}
      >
        View Full Profile
        <span style={{ fontSize: '16px' }}>→</span>
      </a>
    </div>
  )
})

ProfileCard.displayName = 'ProfileCard'


// ============================================
// MAIN PROFILE SYSTEM
// ============================================
export const ProfileSystem = memo(({ 
  showProfile, 
  planetPosition, 
  profilePosition, 
  profileOpacity, 
  isFollowingMouse,
  onProfileClick,
  camera,
  size,
  asteroidInfo
}) => {
  if (!showProfile) return null

  return (
    <div className="profile-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1000
    }}>

      <ProfileCard 
        onClose={onProfileClick}
        position={profilePosition}
        isFollowingMouse={isFollowingMouse}
        opacity={profileOpacity}
        asteroidInfo={asteroidInfo}
      />
    </div>
  )
})

ProfileSystem.displayName = 'ProfileSystem'