import { useState } from 'react'
import './App.css'
import FileUploader from './components/FileUploader'
import KmlDataView from './components/KmlDataView'
import MapView from './components/MapView'
import { KmlData, parseKml } from './utils/KmlParser'

function App() {
  const [kmlData, setKmlData] = useState<KmlData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (content: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const parsedData = await parseKml(content)
      setKmlData(parsedData)
    } catch (err) {
      console.error('Error parsing KML:', err)
      setError('Failed to parse KML file. Please ensure it is a valid KML format.')
      setKmlData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>KML Viewer</h1>
      </header>
      
      <main className="app-content">
        <div className="upload-section">
          <FileUploader onFileUpload={handleFileUpload} />
        </div>
        
        {loading && <div className="loading">Loading KML data...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {kmlData && !loading && (
          <>
            <div className="data-section">
              <KmlDataView kmlData={kmlData} />
            </div>
            
            <div className="map-section">
              <h2>Map View</h2>
              <MapView kmlElements={kmlData.elements} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
