export interface KmlElement {
  type: string;
  coordinates: number[][];
  name?: string;
  description?: string;
  length?: number;
}

export interface KmlData {
  elements: KmlElement[];
  counts: { [key: string]: number };
}

const calculateLength = (coordinates: number[][]): number => {
  let totalLength = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const [lon1, lat1] = coordinates[i - 1];
    const [lon2, lat2] = coordinates[i];
    
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    totalLength += distance;
  }
  return totalLength;
};

const parseCoordinates = (coordString: string): number[][] => {
  return coordString.trim().split(/\s+/).map(coord => {
    const [lon, lat] = coord.split(',').map(Number);
    return [lon, lat];
  });
};

const getElementText = (element: Element, tagName: string): string | undefined => {
  const node = element.getElementsByTagName(tagName)[0];
  return node?.textContent || undefined;
};

export const parseKml = (kmlContent: string): Promise<KmlData> => {
  return new Promise((resolve, reject) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(kmlContent, 'text/xml');
      
      const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parseError) {
        throw new Error('Invalid XML format');
      }

      const elements: KmlElement[] = [];
      const counts: { [key: string]: number } = {};

      const placemarks = xmlDoc.getElementsByTagName('Placemark');

      Array.from(placemarks).forEach((placemark) => {
        const name = getElementText(placemark, 'name');
        const description = getElementText(placemark, 'description');

        const point = placemark.getElementsByTagName('Point')[0];
        if (point) {
          const type = 'Point';
          counts[type] = (counts[type] || 0) + 1;

          const coordsStr = getElementText(point, 'coordinates');
          if (coordsStr) {
            const coordinates = parseCoordinates(coordsStr);
            elements.push({ type, name, description, coordinates });
          }
        }

        const lineString = placemark.getElementsByTagName('LineString')[0];
        if (lineString) {
          const type = 'LineString';
          counts[type] = (counts[type] || 0) + 1;

          const coordsStr = getElementText(lineString, 'coordinates');
          if (coordsStr) {
            const coordinates = parseCoordinates(coordsStr);
            const length = calculateLength(coordinates);
            elements.push({ type, name, description, coordinates, length });
          }
        }

        const polygon = placemark.getElementsByTagName('Polygon')[0];
        if (polygon) {
          const type = 'Polygon';
          counts[type] = (counts[type] || 0) + 1;

          const linearRing = polygon.getElementsByTagName('LinearRing')[0];
          if (linearRing) {
            const coordsStr = getElementText(linearRing, 'coordinates');
            if (coordsStr) {
              const coordinates = parseCoordinates(coordsStr);
              elements.push({ type, name, description, coordinates });
            }
          }
        }

        const multiGeometry = placemark.getElementsByTagName('MultiGeometry')[0];
        if (multiGeometry) {
          const lineStrings = multiGeometry.getElementsByTagName('LineString');
          if (lineStrings.length > 0) {
            const type = 'MultiLineString';
            counts[type] = (counts[type] || 0) + 1;

            Array.from(lineStrings).forEach((lineString) => {
              const coordsStr = getElementText(lineString, 'coordinates');
              if (coordsStr) {
                const coordinates = parseCoordinates(coordsStr);
                const length = calculateLength(coordinates);
                elements.push({ type, name, description, coordinates, length });
              }
            });
          }
        }
      });

      resolve({ elements, counts });
    } catch (error) {
      reject(error);
    }
  });
}; 