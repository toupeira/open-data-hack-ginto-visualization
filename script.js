(async function() {
  const LOCATIONS = {
    'Naturmuseum St. Gallen':              'b840c301-5c17-455b-9768-e67c0e9812f0',
    'Theater St. Gallen':                  '54c949b4-19cd-4e39-89a2-df95a1b49725',
    'The Chedi Andermatt':                 '4192b1be-329f-45e7-93bc-1494656f5655',
    'La Val Hotel & Spa':                  '6b1bf6a5-06de-4817-9f26-0855f38f26ff',
    'Bogentrakt':                          'ecdef361-3994-433d-87c2-b2ceaba36cfe',
    'Jugendherberge Scuol':                '1ed2dce2-8710-4b72-8658-5ac1787adafa',
    'Bahnhof Zweisimmen':                  '6b1c627f-c2f8-4bc7-9e6c-e782962d1ad7',
    'Gare Les Avants':                     'f06b9f7e-8682-420e-a7d2-fee63bddc129',
    'Bahnhof Ins':                         '980c7456-b97f-414f-bf4e-0c507b28bd1f',
    'The Japanese by The Chedi Andermatt': 'f9286e20-ec0f-4386-8e0c-eea1d28536f8',
    'La Bonne Cave Weinbar und Vinothek':  'c2f05729-cf92-4821-af64-c34e24c5b89a',
    'Congress Center Basel':               'f19a2773-858e-4e85-ba17-e04029dd1283',
    'Messe Basel':                         'd783678b-e680-4d1a-8ee4-88b6ca4b0cc6',
    'Bibliothek und Stadtarchiv Zug':      '8dd99fab-df77-41fc-9b04-d1c9a6e7eb3d',
    'Wellness-Therme FORTYSEVEN':          'a7a0ed75-d11b-43c5-82f1-757a751cdc52',
  };

  let id = LOCATIONS['La Val Hotel & Spa'];
  let response = await fetch(`data/${id}.json`);
  let data = await response.json();

  let categories = {};

  function groupClassifications(classifications) {
    for (classification of classifications) {
      let key = classification.criterion.name;
      let category = categories[key] || { label: key, conformances: [] };
      categories[key] = category;

      category.conformances.push(classification.accessibility.conformance);
    }
  }

  groupClassifications(data.areaClassifications);
  groupClassifications(data.pathClassifications);

  for (key in categories) {
    let category = categories[key];
    let sum = category.conformances.reduce((a, b) => a + b, 0);
    category.conformance = sum / category.conformances.length;
  }

  let ctx = document.getElementById('chart').getContext('2d');
  let gradient = ctx.createLinearGradient(0, 0, 800, 0);
  gradient.addColorStop(0, 'red');
  gradient.addColorStop(1, 'green');

  function valueToColor(value) {
    // Ensure the value is within the [0, 100] range
    value = Math.min(100, Math.max(0, value));

    // Convert the value to a hue in the range [0, 120]
    var hue = (value / 100) * 120;
    hue *= (value / 100);

    // Use HSL to set the color (hue, full saturation, 50% lightness)
    var color = 'hsl(' + hue + ', 100%, 50%)';

    return color;
  }

  new Chart(
    document.getElementById('chart'),
    {
      type: 'polarArea',
      data: {
        labels: Object.values(categories).map(row => row.label),
        datasets: [
          {
            label: 'Zugänglichkeit',
            data: Object.values(categories).map(row => row.conformance),
            backgroundColor: Object.values(categories).map(row => valueToColor(row.conformance)),
          }
        ]
      },
      options: {
        scales: {
          r: {
            pointLabels: {
              display: true,
              centerPointLabels: true,
              font: {
                size: 18
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    }
  );
})();
