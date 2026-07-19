// ALL UNITS: metric — г, мл, °C. No imperial.

// ═══════════════════════════════════════════════════════════════
// THEME — dark warm kitchen color palette (14 tokens)
// ═══════════════════════════════════════════════════════════════

const THEME = {
  bg: '#1a1610',
  surface: '#242018',
  card: '#2e2820',
  border: '#3d3428',
  gold: '#c8a96e',
  goldLight: '#e0c48a',
  goldDim: '#8a7040',
  red: '#c05040',
  amber: '#d4904a',
  green: '#6a9e6e',
  blue: '#5a8aaa',
  text: '#f0e8d8',
  textDim: '#9a8a6a',
  textMuted: '#5a4a2a',
};

// ═══════════════════════════════════════════════════════════════
// STYLES — shared CSS-in-JS fragments
// ═══════════════════════════════════════════════════════════════

const STYLES = {
  card: {
    backgroundColor: THEME.card,
    border: `1px solid ${THEME.border}`,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    color: THEME.text,
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    backgroundColor: THEME.surface,
    border: `1px solid ${THEME.border}`,
    color: THEME.textDim,
    marginRight: '6px',
    marginBottom: '4px',
  },
  collapsible: {
    cursor: 'pointer',
    userSelect: 'none',
  },
};

// ═══════════════════════════════════════════════════════════════
// EQUIPMENT — verified specs for 5 user devices
// ═══════════════════════════════════════════════════════════════

const EQUIPMENT = {
  NinjaMAXPRO: {
    name: 'Ninja MAX PRO',
    capacity: '6.2 L',
    maxTemp: 240,
    modes: ['Air Fry', 'Roast', 'Bake', 'Dehydrate', 'Reheat'],
  },
  KenwoodFDP22: {
    name: 'Kenwood FDP22.130GY',
    bowlCapacity: '2.1 L',
    modes: ['Chop', 'Mix', 'Knead', 'Whisk', 'Purée'],
  },
  PanasonicSDYR2550: {
    name: 'Panasonic SD-YR2550',
    modes: ['Basic', 'Whole Wheat', 'Dough', 'Gluten-Free'],
  },
  OZAVO: {
    name: 'OZAVO sandwich maker',
    modes: ['Toast', 'Grill'],
  },
  Cecotec: {
    name: 'Cecotec blender',
    modes: ['Blend', 'Pulse'],
  },
};

// ═══════════════════════════════════════════════════════════════
// React hooks (destructured from global React — zero imports)
// ═══════════════════════════════════════════════════════════════

const { useState } = React;

// ═══════════════════════════════════════════════════════════════
// TabBar component
// ═══════════════════════════════════════════════════════════════

function TabBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'ingredients', label: 'Ингредиенты' },
    { id: 'steps', label: 'Этапы приготовления' },
  ];

  return (
    <div style={{
      display: 'flex',
      borderBottom: `2px solid ${THEME.border}`,
      marginBottom: '20px',
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              padding: '12px 24px',
              fontSize: '1rem',
              fontFamily: 'Georgia, serif',
              fontWeight: isActive ? 'bold' : 'normal',
              color: isActive ? THEME.goldLight : THEME.textDim,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: isActive ? `3px solid ${THEME.gold}` : '3px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// IngredientPanel — placeholder shell for Panel 1
// ═══════════════════════════════════════════════════════════════

function IngredientPanel() {
  return (
    <div style={STYLES.card}>
      <h2 style={{
        fontFamily: 'Georgia, serif',
        color: THEME.goldLight,
        fontSize: '1.25rem',
        marginTop: 0,
        marginBottom: '12px',
      }}>
        Ингредиенты
      </h2>
      <p style={{
        fontFamily: 'Georgia, serif',
        color: THEME.textDim,
        margin: 0,
      }}>
        Панель анализа ингредиентов. Здесь будут отображаться уровни необходимости,
        матрица количества и варианты замен.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ActionStepsPanel — placeholder shell for Panel 2
// ═══════════════════════════════════════════════════════════════

function ActionStepsPanel() {
  return (
    <div style={STYLES.card}>
      <h2 style={{
        fontFamily: 'Georgia, serif',
        color: THEME.goldLight,
        fontSize: '1.25rem',
        marginTop: 0,
        marginBottom: '12px',
      }}>
        Этапы приготовления
      </h2>
      <p style={{
        fontFamily: 'Georgia, serif',
        color: THEME.textDim,
        margin: 0,
      }}>
        Панель этапов приготовления. Здесь будут отображаться шаги с настройками
        оборудования, метками точности и временными оценками.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// App — root component
// ═══════════════════════════════════════════════════════════════

function App() {
  const [activeTab, setActiveTab] = useState('ingredients');

  return (
    <div style={{
      fontFamily: 'Georgia, serif',
      backgroundColor: THEME.bg,
      color: THEME.text,
      minHeight: '100vh',
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'ingredients' ? <IngredientPanel /> : <ActionStepsPanel />}
      </div>
    </div>
  );
}

export default App;
