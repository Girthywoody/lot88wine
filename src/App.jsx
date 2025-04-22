import WineCheatSheet from './components/WineCheatSheet'

function App() {
  return (
<div className="App min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
{/* Import Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
      
      <WineCheatSheet />
    </div>
  )
}

export default App