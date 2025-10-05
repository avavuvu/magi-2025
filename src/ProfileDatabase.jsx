import { useState } from 'react'

// Sample profile data - replace with your actual data
const profiles = [
  {
    id: 1,
    name: "Alex Chen",
    discipline: "Animation",
    year: "2024",
    project: "Orbital Mechanics",
    bio: "Specializing in procedural animation and interactive storytelling. Currently exploring the intersection of traditional animation techniques with real-time 3D environments.",
    skills: ["Maya", "Houdini", "Unity", "After Effects"],
    contact: "alex.chen@student.edu",
    workDescription: "An experimental short exploring gravitational forces through abstract animation and particle systems."
  },
  {
    id: 2,
    name: "Maya Patel",
    discipline: "Games",
    year: "2024",
    project: "Neural Networks",
    bio: "Game designer focused on emergent gameplay systems and AI-driven narratives. Passionate about creating meaningful player experiences through procedural content generation.",
    skills: ["Unity", "Unreal Engine", "C#", "Python"],
    contact: "maya.patel@student.edu",
    workDescription: "A puzzle game where AI entities learn and adapt to player behavior in real-time."
  },
  {
    id: 3,
    name: "Jordan Kim",
    discipline: "Interactivity",
    year: "2024",
    project: "Data Visualization",
    bio: "Interactive media artist working at the intersection of data visualization and immersive experiences. Exploring new ways to make complex information accessible and engaging.",
    skills: ["TouchDesigner", "Processing", "Arduino", "WebGL"],
    contact: "jordan.kim@student.edu",
    workDescription: "Interactive installation translating climate data into immersive visual landscapes."
  },
  {
    id: 4,
    name: "Sam Rodriguez",
    discipline: "Animation",
    year: "2023",
    project: "Character Studies",
    bio: "Character animator with a focus on emotional storytelling through movement. Combining traditional principles with cutting-edge motion capture technology.",
    skills: ["Maya", "MotionBuilder", "ZBrush", "Substance Painter"],
    contact: "sam.rodriguez@student.edu",
    workDescription: "A series of character animation studies exploring subtle emotional expressions."
  },
  {
    id: 5,
    name: "Taylor Wong",
    discipline: "Games",
    year: "2023",
    project: "Procedural Worlds",
    bio: "Technical artist specializing in procedural world generation and shader development. Creating tools that empower artists to build vast, detailed environments.",
    skills: ["Houdini", "Unity", "HLSL", "Blender"],
    contact: "taylor.wong@student.edu",
    workDescription: "Procedural terrain generation system creating infinite, explorable alien landscapes."
  },
  {
    id: 6,
    name: "River Park",
    discipline: "Interactivity",
    year: "2023",
    project: "Sensory Interfaces",
    bio: "Exploring haptic feedback and multi-sensory interaction design. Creating interfaces that engage touch, sound, and movement to create deeper user connections.",
    skills: ["Arduino", "Max/MSP", "Unity", "Blender"],
    contact: "river.park@student.edu",
    workDescription: "Haptic sculpture that responds to touch with generated soundscapes and visual feedback."
  },
  {
    id: 7,
    name: "Casey Liu",
    discipline: "Animation",
    year: "2023",
    project: "Mixed Reality",
    bio: "Pushing the boundaries of animation in mixed reality environments. Combining physical and digital worlds to create new storytelling possibilities.",
    skills: ["Unreal Engine", "Hololens", "Maya", "Substance"],
    contact: "casey.liu@student.edu",
    workDescription: "Mixed reality experience where animated characters interact with physical environments."
  },
  {
    id: 8,
    name: "Avery Singh",
    discipline: "Games",
    year: "2024",
    project: "Accessibility Tools",
    bio: "Designing inclusive gaming experiences and developing tools that make games accessible to players with diverse abilities and needs.",
    skills: ["Unity", "C#", "UX Design", "Accessibility Testing"],
    contact: "avery.singh@student.edu",
    workDescription: "Suite of accessibility tools enabling customizable control schemes and sensory options."
  },
  {
    id: 9,
    name: "Phoenix Davis",
    discipline: "Interactivity",
    year: "2024",
    project: "AI Collaboration",
    bio: "Investigating creative collaboration between humans and AI systems. Developing interactive systems that augment rather than replace human creativity.",
    skills: ["Python", "TensorFlow", "TouchDesigner", "JavaScript"],
    contact: "phoenix.davis@student.edu",
    workDescription: "Interactive installation where AI learns from human movement to generate collaborative art."
  },
  {
    id: 10,
    name: "Morgan Chen",
    discipline: "Animation",
    year: "2024",
    project: "Fluid Dynamics",
    bio: "Exploring realistic fluid simulation in animation workflows. Creating tools and techniques for more believable water, smoke, and particle effects.",
    skills: ["Houdini", "Maya", "RealFlow", "Nuke"],
    contact: "morgan.chen@student.edu",
    workDescription: "Advanced fluid simulation system for realistic water and atmospheric effects."
  },
  {
    id: 11,
    name: "Quinn Foster",
    discipline: "Games",
    year: "2023",
    project: "Narrative Systems",
    bio: "Developing dynamic storytelling systems that adapt to player choices. Creating branching narratives that feel natural and meaningful.",
    skills: ["Ink", "Unity", "Twine", "C#"],
    contact: "quinn.foster@student.edu",
    workDescription: "Adaptive narrative engine that creates personalized story experiences based on player behavior."
  },
  {
    id: 12,
    name: "Sage Williams",
    discipline: "Interactivity",
    year: "2023",
    project: "Biometric Interfaces",
    bio: "Designing interfaces that respond to biological signals. Exploring how heart rate, breath, and movement can control digital experiences.",
    skills: ["Arduino", "Processing", "Kinect", "Max/MSP"],
    contact: "sage.williams@student.edu",
    workDescription: "Installation that creates visual art based on collective heartbeats and breathing patterns of visitors."
  }
]




// Color mapping for disciplines
const getDisciplineColor = (discipline) => {
  switch (discipline) {
    case 'Animation': return '#ffffffff'
    case 'Games': return '#ffffffff'
    case 'Interactivity': return '#ffffffff'
    default: return '#ffffff'
  }
}

function ProfileListItem({ profile, isSelected, onClick }) {
  const disciplineColor = getDisciplineColor(profile.discipline)
  
  return (
    <div 
      className="profile-list-item"
      style={{
        background: isSelected 
          ? `linear-gradient(135deg, rgba(${disciplineColor === '#00ff88' ? '0, 255, 136' : disciplineColor === '#ff3366' ? '255, 51, 102' : '51, 102, 255'}, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)`
          : 'rgba(255, 255, 255, 0.01)',
        border: `1px solid ${isSelected ? disciplineColor + '40' : 'rgba(255, 255, 255, 0.08)'}`,
       // borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
        padding: '20px 24px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        boxShadow: isSelected 
          ? `0 8px 32px rgba(${disciplineColor === '#00ff88' ? '0, 255, 136' : disciplineColor === '#ff3366' ? '255, 51, 102' : '51, 102, 255'}, 0.1)`
          : '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
          e.currentTarget.style.borderColor = disciplineColor + '30'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = `0 8px 24px rgba(${disciplineColor === '#00ff88' ? '0, 255, 136' : disciplineColor === '#ff3366' ? '255, 51, 102' : '51, 102, 255'}, 0.06)`
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      {/* Holographic edge glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: `linear-gradient(90deg, transparent 0%, ${disciplineColor} 50%, transparent 100%)`,
        opacity: isSelected ? 0.8 : 0.3
      }} />
      
      {/* Avatar with orbital ring */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${disciplineColor}20, transparent, ${disciplineColor}20)`,
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 15, 35, 0.9)',
            border: `1px solid ${disciplineColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: disciplineColor,
            fontWeight: '200',
            letterSpacing: '1px',
            fontFamily: 'monospace'
          }}>
            {profile.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
        
        {/* Orbital indicator */}
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            left: '-5px',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: `1px solid ${disciplineColor}30`,
            animation: 'orbit 8s linear infinite'
          }}>
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '50%',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: disciplineColor,
              boxShadow: `0 0 8px ${disciplineColor}`,
              transform: 'translateX(-50%)'
            }} />
          </div>
        )}
      </div>
      
      {/* Profile Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          color: 'white',
          margin: '0 0 6px 0',
          fontSize: '18px',
          fontWeight: '200',
          letterSpacing: '1.5px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontFamily: 'monospace'
        }}>
          {profile.name.toUpperCase()}
        </h3>
        
        <p style={{
          color: disciplineColor,
          margin: '0 0 4px 0',
          fontSize: '14px',
          fontWeight: '300',
          letterSpacing: '0.8px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textShadow: `0 0 10px ${disciplineColor}40`
        }}>
          {profile.project}
        </p>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.4)',
          margin: 0,
          fontSize: '11px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontFamily: 'monospace'
        }}>
          {profile.discipline} ◦ {profile.year}
        </p>
      </div>

      {/* Quantum connection indicator */}
      <div style={{
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        color: disciplineColor,
        flexShrink: 0,
        transition: 'all 0.4s ease',
        opacity: isSelected ? 1 : 0.3
      }}>
        {isSelected ? '◉' : '○'}
      </div>
      
      <style jsx>{`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function ProfileDetails({ profile }) {
  if (!profile) return null;
  
  const disciplineColor = getDisciplineColor(profile.discipline)

  return (
    <div style={{
      flex: '0 0 450px',
      background: 'rgba(255, 255, 255, 0.01)',
      border: `1px solid ${disciplineColor}30`,
      borderRadius: '16px',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
      opacity: profile ? 1 : 0,
      transform: profile ? 'translateX(0)' : 'translateX(20px)',
      transition: 'all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
      height: 'fit-content',
      maxHeight: '70vh',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: `${disciplineColor}40 transparent`,
      backdropFilter: 'blur(20px)',
      boxShadow: `0 16px 64px rgba(${disciplineColor === '#00ff88' ? '0, 255, 136' : disciplineColor === '#ff3366' ? '255, 51, 102' : '51, 102, 255'}, 0.08)`,
      position: 'relative'
    }}>
      {/* Neural network background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 20% 20%, ${disciplineColor}03 0%, transparent 50%), 
                     radial-gradient(circle at 80% 80%, ${disciplineColor}03 0%, transparent 50%)`,
        borderRadius: '16px',
        pointerEvents: 'none'
      }} />
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${disciplineColor}40, transparent, ${disciplineColor}40)`,
          padding: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 15, 35, 0.9)',
            border: `2px solid ${disciplineColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: disciplineColor,
            fontWeight: '200',
            letterSpacing: '1px',
            fontFamily: 'monospace',
            boxShadow: `inset 0 0 20px ${disciplineColor}20, 0 0 20px ${disciplineColor}20`
          }}>
            {profile.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
        <div>
          <h3 style={{
            color: 'white',
            margin: 0,
            fontSize: '28px',
            fontWeight: '100',
            letterSpacing: '2px',
            fontFamily: 'monospace',
            textTransform: 'uppercase'
          }}>
            {profile.name}
          </h3>
          <p style={{
            color: disciplineColor,
            margin: '8px 0 0 0',
            fontSize: '16px',
            letterSpacing: '1px',
            textShadow: `0 0 10px ${disciplineColor}40`,
            fontFamily: 'monospace'
          }}>
            {profile.discipline.toUpperCase()} ◦ {profile.year}
          </p>
        </div>
      </div>

      {/* Project */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h4 style={{
          color: disciplineColor,
          margin: '0 0 12px 0',
          fontSize: '12px',
          fontWeight: '300',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          opacity: 0.8
        }}>
          ◉ Current Project
        </h4>
        <p style={{
          color: 'white',
          margin: '0',
          fontSize: '20px',
          fontWeight: '200',
          letterSpacing: '1px',
          fontFamily: 'monospace'
        }}>
          {profile.project}
        </p>
      </div>

      {/* Featured Work */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h4 style={{
          color: disciplineColor,
          margin: '0 0 15px 0',
          fontSize: '12px',
          fontWeight: '300',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          opacity: 0.8
        }}>
          ◉ Featured Work
        </h4>
        
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          background: `linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(${disciplineColor === '#00ff88' ? '0, 255, 136' : disciplineColor === '#ff3366' ? '255, 51, 102' : '51, 102, 255'}, 0.1) 100%)`,
          border: `1px solid ${disciplineColor}30`,
          borderRadius: '12px',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Scanning line effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${disciplineColor}, transparent)`,
            animation: 'scan 3s ease-in-out infinite'
          }} />
          
          <span style={{
            color: disciplineColor,
            fontSize: '11px',
            letterSpacing: '2px',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            opacity: 0.6
          }}>
            ◦ Neural Link Preview ◦
          </span>
        </div>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          margin: '0',
          fontSize: '13px',
          lineHeight: '1.6',
          letterSpacing: '0.5px',
          fontStyle: 'italic'
        }}>
          {profile.workDescription}
        </p>
      </div>

      {/* About */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h4 style={{
          color: disciplineColor,
          margin: '0 0 12px 0',
          fontSize: '12px',
          fontWeight: '300',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          opacity: 0.8
        }}>
          ◉ Bio.data
        </h4>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          margin: '0',
          fontSize: '14px',
          lineHeight: '1.7',
          letterSpacing: '0.3px'
        }}>
          {profile.bio}
        </p>
      </div>

      {/* Skills */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h4 style={{
          color: disciplineColor,
          margin: '0 0 15px 0',
          fontSize: '12px',
          fontWeight: '300',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          opacity: 0.8
        }}>
          ◉ Skill.matrix
        </h4>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {profile.skills.map((skill, index) => (
            <span
              key={index}
              style={{
                background: `linear-gradient(135deg, ${disciplineColor}15, rgba(255, 255, 255, 0.05))`,
                color: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 16px',
                fontSize: '11px',
                border: `1px solid ${disciplineColor}40`,
                borderRadius: '20px',
                letterSpacing: '1px',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                backdropFilter: 'blur(10px)',
                boxShadow: `0 4px 16px ${disciplineColor}10`
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h4 style={{
          color: disciplineColor,
          margin: '0 0 12px 0',
          fontSize: '12px',
          fontWeight: '300',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          opacity: 0.8
        }}>
          ◉ Neural.link
        </h4>
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          margin: 0,
          fontSize: '14px',
          fontFamily: 'monospace',
          letterSpacing: '0.5px'
        }}>
          {profile.contact}
        </p>
      </div>
      
      <style jsx>{`
        @keyframes scan {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}

export default function ProfileDatabase({ onNavigateHome }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProfile, setSelectedProfile] = useState(null)

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.project.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectProfile = (profile) => {
    setSelectedProfile(profile)
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a23 0%, #16213e 50%, #1a1a2e 100%)',
      position: 'relative',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* UI Overlay matching the landing page */}
      <div className="ui-overlay">
        {/* Top navigation bar */}
        <div className="top-nav">
          <div className="nav-section">
            <img 
              src="/MAGI_Logo.png" 
              alt="MAGI Logo" 
              onClick={onNavigateHome}
              style={{
                height: '60px',
                width: 'auto',
                cursor: 'pointer',
                filter: 'brightness(1.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.filter = 'brightness(1.5) drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                e.target.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.target.style.filter = 'brightness(1.2)'
                e.target.style.transform = 'scale(1)'
              }}
            />
          </div>
         
          <div className="nav-section center">
            <div className="search-container">
              <input
                type="text"
                placeholder="profile search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{
                  width: '400px',
                  padding: '12px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                //  borderRadius: '25px',
                  color: 'white',
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontFamily: 'monospace'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  e.target.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
         
          <div className="nav-section right">
            <button 
              className="ui-button"
              onClick={onNavigateHome}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
            //    borderRadius: '25px',
                color: 'white',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                fontFamily: 'monospace'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                e.target.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.target.style.boxShadow = 'none'
              }}
            >
              ← Exit
            </button>
          </div>
        </div>
        
        {/* Bottom info bar */}
        <div className="bottom-nav" style={{ pointerEvents: 'auto' }}>
          <div className="info-section">
            <span className="info-text" style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>
              Masters of Animation, Games & Interacivity ◦ Profile Database
            </span>
          </div>
          <div className="info-section right">
            <span style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '12px',
              letterSpacing: '1px',
              fontFamily: 'monospace'
            }}>
              {filteredProfiles.length} Student Profiles
            </span>
          </div>
        </div>
      </div>

      {/* Main content area - List + Details */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        gap: '40px',
        alignItems: 'flex-start',
        maxHeight: '70vh',
        width: '90vw',
        maxWidth: '1400px'
      }}>
        {/* Scrollable Profile List */}
        <div style={{
          flex: '1',
          maxWidth: '600px',
          height: '70vh',
          overflowY: 'auto',
          paddingRight: '15px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 255, 136, 0.3) transparent'
        }}>
          {filteredProfiles.map(profile => (
            <ProfileListItem
              key={profile.id}
              profile={profile}
              isSelected={selectedProfile?.id === profile.id}
              onClick={() => selectProfile(profile)}
            />
          ))}
          
          {filteredProfiles.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '16px',
              padding: '60px 40px',
              fontFamily: 'monospace',
              letterSpacing: '1px'
            }}>
              ◦ No matches ◦
            </div>
          )}
        </div>

        {/* Profile Details Panel */}
        {selectedProfile && (
          <ProfileDetails profile={selectedProfile} />
        )}
      </div>

      {/* Initial message when no profile is selected */}
      {!selectedProfile && filteredProfiles.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '8%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.3)',
          fontSize: '14px',
          fontFamily: 'monospace',
          letterSpacing: '1px',
          maxWidth: '300px',
          lineHeight: '1.6'
        }}>
          ◦ Profile Database ◦<br/>
          Select a profile to start<br/>
          
        </div>
      )}
    </div>
  )
}