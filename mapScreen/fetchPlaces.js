export const fetchPlaces = async () => {
  const query = `
        [out:json][timeout:25];
        area["wikidata"="Q1422458"]->.universityArea; 
        (
          node(area.universityArea)["building"];
          way(area.universityArea)["building"];
          relation(area.universityArea)["building"];
          node(area.universityArea)["amenity"];
          way(area.universityArea)["amenity"];
          relation(area.universityArea)["amenity"];
          node(area.universityArea)["education"];
          way(area.universityArea)["education"];
          relation(area.universityArea)["education"];
          node(area.universityArea)["leisure"];
          way(area.universityArea)["leisure"];
          relation(area.universityArea)["leisure"];
          node(area.universityArea)["parking"];
          way(area.universityArea)["parking"];
          relation(area.universityArea)["parking"];
          node(area.universityArea)["shop"];
          way(area.universityArea)["shop"];
          relation(area.universityArea)["shop"];
        );
        out body;
        >;
        out skel qt;
      `;

  const response = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
  );
  const data = await response.json();

  const places = data.elements
    .filter(item => item.tags && item.tags.name)
    .map(item => {
      if (item.type === 'node') {
        return {
          name: item.tags.name,
          coordinates: {lat: item.lat, lon: item.lon},
        };
      } else {
        let latSum = 0,
          lonSum = 0,
          count = 0;
        if (item.nodes) {
          item.nodes.forEach(nodeId => {
            const node = data.elements.find(
              e => e.id === nodeId && e.type === 'node',
            );
            if (node) {
              latSum += node.lat;
              lonSum += node.lon;
              count++;
            }
          });
          return {
            name: item.tags.name,
            coordinates: {
              lat: latSum / count,
              lon: lonSum / count,
            },
          };
        } else {
          return {
            name: item.tags.name,
            coordinates: 'Additional data required',
          };
        }
      }
    });

  return places;
};
