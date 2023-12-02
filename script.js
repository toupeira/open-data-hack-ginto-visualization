let LAST_CHART;

function groupClassifications(categories, classifications) {
  for (classification of classifications) {
    let key = classification.criterion.name;
    let category = categories[key] || { label: key, conformances: [] };
    categories[key] = category;

    category.conformances.push(classification.accessibility.conformance);
  }
}

function valueToColor(value) {
  // Ensure the value is within the [0, 100] range
  value = Math.min(100, Math.max(0, value));

  // Convert the value to a hue in the range [0, 120]
  var hue = (value / 100) * 120;
  hue *= (value / 100);

  // Use HSL to set the color (hue, full saturation, 50% lightness)
  var color = 'hsl(' + hue + ', 75%, 50%)';

  return color;
}

async function loadBuilding() {
  // Fetch data from API

  let id = document.getElementById('building-selector').value;
  let response = await fetch(`data/${id}.json`);
  let data = await response.json();

  document.getElementById('building-link').textContent = data.name;
  document.getElementById('building-link').href = `https://www.ginto.guide/entries/${id}`;

  // Group classifications by categories

  let categories = {};

  groupClassifications(categories, data.areaClassifications);
  groupClassifications(categories, data.pathClassifications);

  // Calculate averages
  for (key in categories) {
    let category = categories[key];
    let sum = category.conformances.reduce((a, b) => a + b, 0);
    category.conformance = sum / category.conformances.length;
  }

  // Sort categories by conformance
  categories = Object.values(categories).sort((a, b) => {
    if (a.conformance == b.conformance) {
      return 0;
    } else if (a.conformance < b.conformance) {
      return -1;
    } else {
      return 1;
    }
  });

  // Draw chart

  let ctx = document.getElementById('chart').getContext('2d');
  let gradient = ctx.createLinearGradient(0, 0, 800, 0);
  gradient.addColorStop(0, 'red');
  gradient.addColorStop(1, 'green');

  let labels = categories.map((value) => `${value.label} (${parseInt(value.conformance, 10)}%)`)
  let conformances = categories.map(row => row.conformance);

  let chart = document.getElementById('chart');
  chart.style.display = 'block';

  if (LAST_CHART) {
    LAST_CHART.destroy();
  }

  LAST_CHART = new Chart(chart, {
    type: 'polarArea',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Zugänglichkeit',
          data: conformances,
          backgroundColor: conformances.map(valueToColor),
        }
      ]
    },
    options: {
      aspectRatio: 1.3,
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
          display: false,
          position: 'right',
        }
      }
    }
  });
}

window.onload = () => loadBuilding(document.getElementById('building-selector').value)
