/* eslint-disable */
import { useMemo, memo, useState, useEffect } from 'react'
import * as THREE from 'three'
import Papa from 'papaparse'

// ============================================
// HELPER FUNCTION TO SLUGIFY WORK TITLES
// ============================================
const slugify = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')        // Replace multiple hyphens with single
    .trim()
}

// ============================================
// DATA LOADING HOOK WITH DUPLICATE HANDLING
// ============================================
export const useAsteroidData = () => {
  const [asteroidData, setAsteroidData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch CSV from public folder with cache busting
        const timestamp = new Date().getTime()
        const response = await fetch(`/FormResponses.csv?v=${timestamp}`)
        const csvContent = await response.text()
        
        const parsed = Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim()
        })
        
        console.log('✅ Loaded', parsed.data.length, 'student profiles')
        
        // Group works by student name
        const worksByStudent = {}
        
        parsed.data.forEach((row, index) => {
          const studentName = row['Your Name (as you want it on the Expo website)']
          const studentNumber = row['Student number'] || ''
          
          // Skip rows without a student name
          if (!studentName || studentName.trim() === '') {
            console.log('⏭️  Skipping empty row', index)
            return
          }
          
          console.log('Row', index, '- Name:', studentName, '- Number:', studentNumber)
          
          if (!worksByStudent[studentName]) {
            worksByStudent[studentName] = {
              name: studentName,
              bio: row['Brief profile of yourself (30-80 words)'] || 'No bio available',
              studentNumber: studentNumber,
              profileSlug: studentNumber || `student-${index}`,
              email: row['Reachable personal email'] || '',
              portfolio: row['Portfolio URL'] || '',
              favoriteGame: row['Your favourite game/animation you\'ve been vibing with recently.'] || '',
              works: []
            }
          }
          
          const workTitle = row['Title of the Work'] || 'Untitled Work'
          const workType = row['Type of work (one form per work)'] || 'Creative Work'
          const workDescription = row['Brief description of your work (30-80 words)'] || ''
          const videoUrlField = row['Please link to a downloadable video on Google Drive or Sharepoint (animation/playthrough/video essay). A PNG or PDF for poster and physical works.'] || ''
          
          // Generate showcase image filename: studentNumber-slugified-title
          const showcaseImage = studentNumber && workTitle 
            ? `${studentNumber}-${slugify(workTitle)}`
            : null
          
          // Check if this work is flagged as an image sequence
          const isImageSequence = videoUrlField.trim().toLowerCase() === 'images'
          
          let workData = {
            title: workTitle,
            type: workType,
            description: workDescription,
            showcaseImage: showcaseImage,
            videoUrl: isImageSequence ? '' : videoUrlField.trim() // Only add video URL if not an image sequence
          }
          
          // If flagged as "images", detect image sequence files
          if (isImageSequence && showcaseImage) {
            // Determine page count based on student and work
            let pageCount = 10 // Default
            
            // Specific page counts for known works
            if (studentNumber === 's3786759' && workTitle.toLowerCase().includes('archival object')) {
              pageCount = 19 // Caitlin Butt - Archival Object: Detritus
            } else if (studentNumber === 's4160763' && workTitle.toLowerCase().includes('other names')) {
              pageCount = 4 // Rachel Roberts - Other Names for Zombies
            }
            
            // Auto-detect images with pattern: showcaseImage-page-1, showcaseImage-page-2, etc.
            const imageSequence = []
            for (let i = 1; i <= pageCount; i++) {
              imageSequence.push(`${showcaseImage}-page-${i}`)
            }
            
            workData.images = imageSequence
            // Remove showcaseImage since we're using the images array
            delete workData.showcaseImage
            
            console.log(`🖼️  Detected ${pageCount}-page image sequence for ${studentName} - ${workTitle}:`, imageSequence.slice(0, 3), '...')
          }
          
          // Add this work to the student's works array
          worksByStudent[studentName].works.push(workData)
        })
        
        // Transform grouped data into asteroid format
        const asteroids = Object.values(worksByStudent).map((student, index) => {
          // Generate orbital positions
          const angle = (Math.PI * 2 * index) / Object.keys(worksByStudent).length + Math.random() * 0.8
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
            name: student.name,
            bio: student.bio,
            studentNumber: student.studentNumber,
            profileSlug: student.profileSlug,
            email: student.email,
            portfolio: student.portfolio,
            favoriteGame: student.favoriteGame,
            // Multiple works array
            works: student.works,
            // For backwards compatibility - use first work
            workTitle: student.works[0]?.title || 'Untitled Work',
            workType: student.works[0]?.type || 'Creative Work'
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
// MINIMAL PROFILE CARD WITH MULTIPLE WORKS
// ============================================
const ProfileCard = memo(({ onClose, position, isFollowingMouse, opacity = 1, asteroidInfo }) => {
  const [selectedWorkIndex, setSelectedWorkIndex] = useState(0)
  const [isWorksDropdownOpen, setIsWorksDropdownOpen] = useState(false)
  
  if (!asteroidInfo) return null
  
  // Generate profile page URL - adjust this to match your site structure
  const profileUrl = `/profiles/${asteroidInfo.profileSlug}`
  
  const hasMultipleWorks = asteroidInfo.works && asteroidInfo.works.length > 1
  const currentWork = asteroidInfo.works?.[selectedWorkIndex] || {
    title: asteroidInfo.workTitle,
    type: asteroidInfo.workType
  }
  
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
      
      {/* Work type badge and multiple works indicator */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 10px',
          background: 'rgba(74, 255, 158, 0.2)',
          border: '1px solid rgba(74, 255, 158, 0.4)',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#4aff9e',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {currentWork.type}
        </div>
        
        {hasMultipleWorks && (
          <div style={{
            fontSize: '10px',
            color: '#4aff9e',
            opacity: 0.7,
            fontWeight: 'bold'
          }}>
            {asteroidInfo.works.length} works
          </div>
        )}
      </div>

      {/* Multiple Works Dropdown */}
      {hasMultipleWorks && (
        <div 
          style={{ 
            position: 'relative', 
            marginBottom: '12px',
            zIndex: 10
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsWorksDropdownOpen(!isWorksDropdownOpen)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(74, 255, 158, 0.1)',
              border: '1px solid rgba(74, 255, 158, 0.3)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(74, 255, 158, 0.15)'
              e.target.style.borderColor = 'rgba(74, 255, 158, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(74, 255, 158, 0.1)'
              e.target.style.borderColor = 'rgba(74, 255, 158, 0.3)'
            }}
          >
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              color: '#4aff9e'
            }}>
              {currentWork.title}
            </span>
            <span style={{ 
              fontSize: '14px',
              transform: isWorksDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s'
            }}>
              ▼
            </span>
          </button>
          
          {isWorksDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: 'rgba(0, 0, 0, 0.98)',
              border: '1px solid rgba(74, 255, 158, 0.3)',
              borderRadius: '4px',
              maxHeight: '150px',
              overflowY: 'auto',
              zIndex: 100
            }}>
              {asteroidInfo.works.map((work, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedWorkIndex(idx)
                    setIsWorksDropdownOpen(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: idx === selectedWorkIndex 
                      ? 'rgba(74, 255, 158, 0.2)' 
                      : 'transparent',
                    border: 'none',
                    borderBottom: idx < asteroidInfo.works.length - 1 
                      ? '1px solid rgba(74, 255, 158, 0.1)' 
                      : 'none',
                    color: '#fff',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (idx !== selectedWorkIndex) {
                      e.target.style.background = 'rgba(74, 255, 158, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (idx !== selectedWorkIndex) {
                      e.target.style.background = 'transparent'
                    }
                  }}
                >
                  <div style={{ 
                    color: '#4aff9e',
                    fontSize: '10px',
                    marginBottom: '2px',
                    textTransform: 'uppercase',
                    opacity: 0.8
                  }}>
                    {work.type}
                  </div>
                  <div style={{ fontSize: '11px' }}>
                    {work.title}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Artist Bio */}
      <div style={{ 
        color: '#ddd', 
        fontSize: '13px',
        marginBottom: '16px',
        lineHeight: '1.5'
      }}>
        {asteroidInfo.bio}
      </div>

      {/* Current work title (if single work, or not using dropdown) */}
      {!hasMultipleWorks && (
        <div style={{ 
          color: '#aaa', 
          fontSize: '12px',
          marginBottom: '16px',
          lineHeight: '1.4',
          fontStyle: 'italic'
        }}>
          <strong style={{ color: '#ccc' }}>Project:</strong> {currentWork.title}
        </div>
      )}

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