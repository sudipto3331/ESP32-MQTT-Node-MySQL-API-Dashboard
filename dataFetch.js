const urlParams = new URLSearchParams(window.location.search);
const roomNumber = urlParams.get('room') || '1'; // Default to Room 1 if no room parameter is provided

// Function to live-update values of temperature, humidity, gas, and oxygen
function updateValues() {
    fetch(`https://trackingdevice.info/SATL/live-data.php?room=room${roomNumber}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('temperature').textContent = data.temperature;
        document.getElementById('humidity').textContent = data.humidity;
        document.getElementById('pressure').textContent = data.gas;
        document.getElementById('altitude').textContent = data.oxygen;
      })
      .catch(error => {
        console.error('Error fetching live data:', error);
      });
}

setInterval(() => {
  updateValues();
}, 90); //Update data at 90 ms rate

// Update room title
document.getElementById('room-title').textContent = `Room ${roomNumber}`;

async function fetchHistoricalData(type) {
  try {
    const response = await fetch(`https://trackingdevice.info/SATL/all-data.php?room=room${roomNumber}&type=${type}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${type} historical data:`, error);
    return null;
  }
}

function createGraph(data, type) {
  const formattedData = formatDataForPlot(data, type);
  const timeValues = getTimeValues(data, 5);

  const existingLayout = document.getElementById(`${type}-history`).layout;
  const existingConfig = document.getElementById(`${type}-history`).config;
  const layout = {
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} History`,
    xaxis: {
      title: 'Time',
      tickmode: 'array',
      tickvals: timeValues,
      ticktext: timeValues.map(time => time.split(' ')[1]),
      automargin: true
    },
    yaxis: {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)}`
    },
    autosize: true
  };
  const config = {
    responsive: true
  };
  Plotly.react(`${type}-history`, [{
    x: formattedData.x,
    y: formattedData.y,
    type: 'scatter',
    mode: 'lines+markers'
  }], { ...existingLayout, title: `${type.charAt(0).toUpperCase() + type.slice(1)} History` }, existingConfig);
}

async function updateGraph(type) {
  const historicalData = await fetchHistoricalData(type);

  if (historicalData) {
    createGraph(historicalData, type);
  } else {
    console.error(`Failed to load ${type} historical data.`);
  }
}

function getTimeValues(data, numPoints) {
  const totalPoints = data.length;
  const step = Math.floor(totalPoints / (numPoints - 1));
  const timeValues = [];
  for (let i = 0; i < numPoints; i++) {
    const index = i * step;
    if (index < totalPoints) {
      timeValues.push(data[index].timestamp);
    }
  }
  return timeValues;
}

function formatDataForPlot(data, type) {
  const xValues = data.map(entry => entry.timestamp);
  const yValues = data.map(entry => parseFloat(entry[type]));
  return { x: xValues, y: yValues };
}

async function main() {
  const types = ['temperature', 'humidity', 'gas', 'oxygen'];

  for (const type of types) {
    await updateGraph(type); // Initial update for each type
    setInterval(() => updateGraph(type), 500); // Update every 500 ms for each type
  }
}

main();

