import { useState } from 'react';
import { KmlData, KmlElement } from '../utils/KmlParser';

interface KmlDataViewProps {
  kmlData: KmlData | null;
}

const KmlDataView = ({ kmlData }: KmlDataViewProps) => {
  const [view, setView] = useState<'summary' | 'detailed'>('summary');
  
  if (!kmlData) {
    return <div className="kml-data-view">No KML data loaded</div>;
  }
  
  const { elements, counts } = kmlData;
  
  const renderSummary = () => {
    return (
      <div className="summary-view">
        <h3>KML Element Summary</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Element Type</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(counts).map(([type, count]) => (
              <tr key={type}>
                <td>{type}</td>
                <td>{count}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td><strong>Total</strong></td>
              <td><strong>{elements.length}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderDetailed = () => {
    const lineElements = elements.filter(
      (element): element is KmlElement & { length: number } => 
        typeof element.length === 'number'
    );
    
    return (
      <div className="detailed-view">
        <h3>KML Element Details</h3>
        <table className="detailed-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Length (km)</th>
            </tr>
          </thead>
          <tbody>
            {lineElements.map((element, index) => (
              <tr key={index}>
                <td>{element.name || 'Unnamed'}</td>
                <td>{element.type}</td>
                <td>{element.length.toFixed(2)}</td>
              </tr>
            ))}
            {lineElements.length > 0 && (
              <tr className="total-row">
                <td colSpan={2}><strong>Total Length</strong></td>
                <td>
                  <strong>
                    {lineElements
                      .reduce((sum, element) => sum + element.length, 0)
                      .toFixed(2)}
                  </strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="kml-data-view">
      <div className="view-controls">
        <button 
          className={view === 'summary' ? 'active' : ''} 
          onClick={() => setView('summary')}
        >
          Summary
        </button>
        <button 
          className={view === 'detailed' ? 'active' : ''} 
          onClick={() => setView('detailed')}
        >
          Detailed
        </button>
      </div>
      
      <div className="view-content">
        {view === 'summary' ? renderSummary() : renderDetailed()}
      </div>
    </div>
  );
};

export default KmlDataView; 