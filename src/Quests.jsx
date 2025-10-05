import React, { useState, useEffect } from 'react';

const QuestTracker = ({ onNavigateHome }) => {
  const [quests, setQuests] = useState([
    // URGENT - Uni Work (Due Oct 17)
    {
      id: 'ppp-1',
      title: 'PPP Game Prototype - Core Mechanics',
      category: 'urgent',
      xp: 150,
      completed: false,
      deadline: 'Oct 17',
      subtasks: [
        { id: 'ppp-1-1', text: 'Define core game mechanics', completed: false },
        { id: 'ppp-1-2', text: 'Create basic player controls', completed: false },
        { id: 'ppp-1-3', text: 'Implement primary objective', completed: false }
      ]
    },
    {
      id: 'ppp-2',
      title: 'PPP Game Prototype - Polish',
      category: 'urgent',
      xp: 100,
      completed: false,
      deadline: 'Oct 17',
      subtasks: [
        { id: 'ppp-2-1', text: 'Create UI elements', completed: false },
        { id: 'ppp-2-2', text: 'Test gameplay flow', completed: false },
        { id: 'ppp-2-3', text: 'Polish feedback', completed: false }
      ]
    },
    {
      id: 'cps-1',
      title: 'CPS Portfolio Foundation',
      category: 'urgent',
      xp: 120,
      completed: false,
      deadline: 'Oct 17',
      subtasks: [
        { id: 'cps-1-1', text: 'Choose format structure', completed: false },
        { id: 'cps-1-2', text: 'Create navigation', completed: false },
        { id: 'cps-1-3', text: 'Organize work files', completed: false }
      ]
    },
    {
      id: 'cps-2',
      title: 'CPS Portfolio Integration',
      category: 'urgent',
      xp: 130,
      completed: false,
      deadline: 'Oct 17',
      subtasks: [
        { id: 'cps-2-1', text: 'Import Week 1-4 work', completed: false },
        { id: 'cps-2-2', text: 'Import Week 5-8 work', completed: false },
        { id: 'cps-2-3', text: 'Create narrative theme', completed: false }
      ]
    },
    // HIGH PRIORITY - Festival (Due Oct 3-4)
    {
      id: 'cadena-1',
      title: 'Cadena Visual Concept',
      category: 'high',
      xp: 80,
      completed: false,
      deadline: 'Oct 3',
      subtasks: [
        { id: 'cadena-1-1', text: 'Research libraries', completed: false },
        { id: 'cadena-1-2', text: 'Sketch interaction flow', completed: false },
        { id: 'cadena-1-3', text: 'Test camera input', completed: false }
      ]
    },
    {
      id: 'cadena-2',
      title: 'Cadena Implementation',
      category: 'high',
      xp: 120,
      completed: false,
      deadline: 'Oct 3',
      subtasks: [
        { id: 'cadena-2-1', text: 'Code interaction detection', completed: false },
        { id: 'cadena-2-2', text: 'Create visual response', completed: false },
        { id: 'cadena-2-3', text: 'Test setup requirements', completed: false }
      ]
    },
    // MEDIUM - Personal Projects (Due Nov 1)
    {
      id: 'held-1',
      title: 'Held, Briefly - Concept',
      category: 'medium',
      xp: 90,
      completed: false,
      deadline: 'Nov 1',
      subtasks: [
        { id: 'held-1-1', text: 'Develop concept', completed: false },
        { id: 'held-1-2', text: 'Design mockups', completed: false },
        { id: 'held-1-3', text: 'Plan websocket flow', completed: false }
      ]
    },
    {
      id: 'held-2',
      title: 'Held, Briefly - Implementation',
      category: 'medium',
      xp: 150,
      completed: false,
      deadline: 'Nov 1',
      subtasks: [
        { id: 'held-2-1', text: 'Create webpage', completed: false },
        { id: 'held-2-2', text: 'Setup websocket server', completed: false },
        { id: 'held-2-3', text: 'Build Unity system', completed: false }
      ]
    },
    // MAGI EXPO Website (Due Nov 1 & 14)
    {
      id: 'magi-1',
      title: 'MAGI EXPO Landing Page',
      category: 'magi',
      xp: 100,
      completed: false,
      deadline: 'Nov 1',
      subtasks: [
        { id: 'magi-1-1', text: 'Design mockup', completed: false },
        { id: 'magi-1-2', text: 'Code responsive layout', completed: false },
        { id: 'magi-1-3', text: 'Test devices', completed: false }
      ]
    },
    {
      id: 'magi-2',
      title: 'MAGI Data Collection',
      category: 'magi',
      xp: 60,
      completed: false,
      deadline: 'Nov 14',
      subtasks: [
        { id: 'magi-2-1', text: 'Contact comms lead', completed: false },
        { id: 'magi-2-2', text: 'Create collection form', completed: false },
        { id: 'magi-2-3', text: 'Send to students', completed: false }
      ]
    },
    {
      id: 'magi-3',
      title: 'MAGI Profile Database',
      category: 'magi',
      xp: 120,
      completed: false,
      deadline: 'Nov 14',
      subtasks: [
        { id: 'magi-3-1', text: 'Design schema', completed: false },
        { id: 'magi-3-2', text: 'Build templates', completed: false },
        { id: 'magi-3-3', text: 'Implement search', completed: false }
      ]
    }
  ]);

  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);

  const categories = {
    urgent: { 
      name: 'UNIVERSITY PRIORITY', 
      color: '#f87171', 
      borderColor: 'rgba(248, 113, 113, 0.3)', 
      bgColor: 'rgba(248, 113, 113, 0.05)' 
    },
    high: { 
      name: 'CADENA FESTIVAL', 
      color: '#fb923c', 
      borderColor: 'rgba(251, 146, 60, 0.3)', 
      bgColor: 'rgba(251, 146, 60, 0.05)' 
    },
    medium: { 
      name: 'EXHIBITION WORK', 
      color: '#a855f7', 
      borderColor: 'rgba(168, 85, 247, 0.3)', 
      bgColor: 'rgba(168, 85, 247, 0.05)' 
    },
    magi: { 
      name: 'MAGI EXPO WEBSITE', 
      color: '#22d3ee', 
      borderColor: 'rgba(34, 211, 238, 0.3)', 
      bgColor: 'rgba(34, 211, 238, 0.05)' 
    }
  };

  useEffect(() => {
    const completedQuests = quests.filter(quest => quest.completed);
    const xp = completedQuests.reduce((sum, quest) => sum + quest.xp, 0);
    setTotalXP(xp);
    setLevel(Math.floor(xp / 500) + 1);
  }, [quests]);

  const toggleQuest = (questId) => {
    setQuests(prev => prev.map(quest => 
      quest.id === questId ? { ...quest, completed: !quest.completed } : quest
    ));
  };

  const toggleSubtask = (questId, subtaskId) => {
    setQuests(prev => prev.map(quest => {
      if (quest.id === questId) {
        const updatedSubtasks = quest.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        );
        const allSubtasksComplete = updatedSubtasks.every(subtask => subtask.completed);
        return { 
          ...quest, 
          subtasks: updatedSubtasks,
          completed: allSubtasksComplete 
        };
      }
      return quest;
    }));
  };

  const getCompletionRate = () => {
    const completed = quests.filter(q => q.completed).length;
    return Math.round((completed / quests.length) * 100);
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline + ', 2024');
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const groupedQuests = quests.reduce((acc, quest) => {
    if (!acc[quest.category]) acc[quest.category] = [];
    acc[quest.category].push(quest);
    return acc;
  }, {});

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500@display=swap');
        
        .quest-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%);
          color: #22d3ee;
          font-family: 'JetBrains Mono', monospace;
          padding: 2rem;
        }
        
        .quest-wrapper {
          max-width: 80rem;
          margin: 0 auto;
        }
        
        .quest-header {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
        }
        
        .back-button {
          position: absolute;
          top: 0;
          left: 0;
          color: #22d3ee;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.1em;
          transition: color 0.3s ease;
          text-shadow: 0 0 8px rgba(34, 211, 238, 0.6);
          padding: 0.5rem;
        }
        
        .back-button:hover {
          color: #fb923c;
        }
        
        .protocol-title {
          font-size: 3rem;
          font-weight: 100;
          letter-spacing: 0.3em;
          color: #fb923c;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(251, 146, 60, 0.4);
        }
        
        .stats-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          font-size: 0.875rem;
          letter-spacing: 0.1em;
        }
        
        .stats-row {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        
        .stat-item {
          color: #22d3ee;
          text-shadow: 0 0 10px rgba(34, 211, 238, 0.8);
        }
        
        .stat-separator {
          color: #6b7280;
        }
        
        .progress-bars {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          max-width: 600px;
        }
        
        .progress-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .progress-label {
          display: flex;
          justify-content: between;
          align-items: center;
          font-size: 0.75rem;
          color: #9ca3af;
          letter-spacing: 0.05em;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s ease;
          position: relative;
          overflow: hidden;
        }
        
        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
        
        .exp-fill {
          background: linear-gradient(90deg, #fb923c, #f97316, #ea580c);
          box-shadow: 0 0 10px rgba(251, 146, 60, 0.5);
        }
        
        .completion-fill {
          background: linear-gradient(90deg, #22d3ee, #06b6d4, #0891b2);
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }
        
        .progress-text {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .category-card {
          border: 1px solid;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .category-header {
          padding: 1.5rem;
          border-bottom: 1px solid;
          border-bottom-color: inherit;
        }
        
        .category-title {
          font-size: 1rem;
          font-weight: 300;
          letter-spacing: 0.1em;
          margin: 0;
        }
        
        .category-progress {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.5rem;
        }
        
        .quest-list {
          padding: 0;
        }
        
        .quest-item {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }
        
        .quest-item:last-child {
          border-bottom: none;
        }
        
        .quest-item:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        
        .quest-item.completed {
          opacity: 0.4;
        }
        
        .quest-main {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        
        .quest-toggle {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.25rem;
          transition: all 0.3s ease;
          color: inherit;
        }
        
        .quest-toggle:hover {
          transform: scale(1.1);
        }
        
        .quest-content {
          flex: 1;
          display: flex;
          justify-content: between;
          align-items: center;
        }
        
        .quest-title {
          font-size: 0.95rem;
          font-weight: 300;
          letter-spacing: 0.025em;
          color: #d1d5db;
          transition: color 0.3s ease;
          flex: 1;
        }
        
        .quest-title.completed {
          text-decoration: line-through;
          color: #6b7280;
        }
        
        .quest-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.8rem;
        }
        
        .deadline {
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.05em;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.3);
        }
        
        .deadline.critical { color: #f87171; background: rgba(248, 113, 113, 0.1); }
        .deadline.warning { color: #fb923c; background: rgba(251, 146, 60, 0.1); }
        .deadline.normal { color: #22d3ee; background: rgba(34, 211, 238, 0.1); }
        
        .xp-value {
          color: #fb923c;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          text-shadow: 0 0 6px rgba(251, 146, 60, 0.6);
        }
        
        .subtasks {
          margin-left: 2.25rem;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
        
        .quest-item:hover .subtasks {
          opacity: 1;
        }
        
        .subtask-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.375rem 0;
          font-size: 0.85rem;
        }
        
        .subtask-number {
          color: rgba(251, 146, 60, 0.4);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          min-width: 1.5rem;
        }
        
        .subtask-toggle {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s ease;
          color: #6b7280;
        }
        
        .subtask-toggle:hover {
          transform: scale(1.1);
          color: #22d3ee;
        }
        
        .subtask-text {
          color: #9ca3af;
          transition: color 0.3s ease;
        }
        
        .subtask-text.completed {
          text-decoration: line-through;
          color: #6b7280;
        }
        
        .completed-icon {
          color: #22c55e;
          text-shadow: 0 0 8px rgba(34, 197, 94, 0.8);
        }
        
        .subtask-completed-icon {
          color: #22c55e;
          text-shadow: 0 0 4px rgba(34, 197, 94, 0.6);
        }
        
        .pax-notice {
          text-align: center;
          padding: 1.5rem;
          border: 1px solid rgba(250, 204, 21, 0.3);
          border-radius: 8px;
          background: rgba(250, 204, 21, 0.05);
        }
        
        .pax-text {
          color: #facc15;
          font-size: 0.875rem;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.1em;
          text-shadow: 0 0 8px rgba(250, 204, 21, 0.4);
        }
        
        @media (max-width: 768px) {
          .quest-container { padding: 1rem; }
          .categories-grid { 
            grid-template-columns: 1fr; 
            gap: 1rem; 
          }
          .protocol-title { font-size: 2rem; }
          .stats-bar { gap: 1rem; }
          .quest-meta { gap: 0.5rem; }
        }
      `}</style>
      
      <div className="quest-container">
        <div className="quest-wrapper">
          
          {/* Header */}
          <div className="quest-header">
            {onNavigateHome && (
              <button onClick={onNavigateHome} className="back-button">
                ← BACK TO ORBITS
              </button>
            )}
            
            <div className="protocol-title"></div>
            
            <div className="stats-bar">
              <div className="stats-row">
                <div className="stat-item">LEVEL {level}</div>
                <div className="stat-separator">·</div>
                <div className="stat-item">{totalXP} XP</div>
                <div className="stat-separator">·</div>
                <div className="stat-item">{getCompletionRate()}% COMPLETE</div>
              </div>
              
              <div className="progress-bars">
                {/* EXP Bar */}
                <div className="progress-container">
                  <div className="progress-label">
                    <div className="progress-text">
                      <span>EXPERIENCE</span>
                      <span>{totalXP % 500}/{500} XP</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill exp-fill" 
                      style={{ width: `${((totalXP % 500) / 500) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Completion Bar */}
                <div className="progress-container">
                  <div className="progress-label">
                    <div className="progress-text">
                      <span>OVERALL PROGRESS</span>
                      <span>{quests.filter(q => q.completed).length}/{quests.length} OBJECTIVES</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill completion-fill" 
                      style={{ width: `${getCompletionRate()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="categories-grid">
            {Object.entries(groupedQuests).map(([categoryKey, categoryQuests]) => {
              const category = categories[categoryKey];
              const completedQuests = categoryQuests.filter(q => q.completed);
              
              return (
                <div 
                  key={categoryKey} 
                  className="category-card"
                  style={{
                    borderColor: category.borderColor,
                    background: category.bgColor
                  }}
                >
                  <div 
                    className="category-header"
                    style={{
                      borderBottomColor: category.borderColor,
                      color: category.color
                    }}
                  >
                    <h3 className="category-title">{category.name}</h3>
                    <div className="category-progress">
                      {completedQuests.length}/{categoryQuests.length} OBJECTIVES COMPLETE
                    </div>
                  </div>
                  
                  <div className="quest-list">
                    {categoryQuests.map((quest) => {
                      const days = getDaysUntilDeadline(quest.deadline);
                      const deadlineClass = days <= 3 ? 'critical' : days <= 7 ? 'warning' : 'normal';
                      
                      return (
                        <div key={quest.id} className={`quest-item ${quest.completed ? 'completed' : ''}`}>
                          <div className="quest-main">
                            <button 
                              onClick={() => toggleQuest(quest.id)}
                              className="quest-toggle"
                              style={{ color: category.color }}
                            >
                              {quest.completed ? <span className="completed-icon">✓</span> : '○'}
                            </button>
                            
                            <div className="quest-content">
                              <div className={`quest-title ${quest.completed ? 'completed' : ''}`}>
                                {quest.title}
                              </div>
                              
                              <div className="quest-meta">
                                <div className={`deadline ${deadlineClass}`}>
                                  {days > 0 ? `${days}d` : 'DUE'}
                                </div>
                                <div className="xp-value">{quest.xp}</div>
                              </div>
                            </div>
                          </div>

                          {/* Subtasks */}
                          {!quest.completed && (
                            <div className="subtasks">
                              {quest.subtasks.map((subtask, index) => (
                                <div key={subtask.id} className="subtask-item">
                                  <div className="subtask-number">
                                    {String(index + 1).padStart(2, '0')}
                                  </div>
                                  <button
                                    onClick={() => toggleSubtask(quest.id, subtask.id)}
                                    className="subtask-toggle"
                                  >
                                    {subtask.completed ? 
                                      <span className="subtask-completed-icon">✓</span> : '○'
                                    }
                                  </button>
                                  <span className={`subtask-text ${subtask.completed ? 'completed' : ''}`}>
                                    {subtask.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAX Notice */}
          <div className="pax-notice">
            <div className="pax-text">PAX PROTOCOL: OCT 9-12</div>
          </div>

        </div>
      </div>
    </>
  );
};

export default QuestTracker;