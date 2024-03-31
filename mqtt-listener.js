const mqtt = require("mqtt"); // Package required for MQTT operations
const pool = require('./db'); //Package required for Database operation

const mqttHost = "broker.emqx.io"; //Broker Server URL
const protocol = "mqtt"; //Protocol
const port = "1883"; //MQTT server default port
var mqttClient;

const sampleTime1 = 15000; //Time interval after which a new data will be inserted to database. Time in milisecond. 10s -> 10000 milis.
const sampleTime2 = 15000;
const sampleTime3 = 15000;
const sampleTime4 = 15000;

var flag1 = flag2 = flag3 = flag4 = 1; //Associated to time interval

function updateData(temperature, humidity, gas, oxygen, roomNo) {
  // Update instantaneous data to a single data row
  const updateQuery = `UPDATE all_room_data SET 
                        temperature = ?,
                        humidity = ?,
                        gas = ?,
                        oxygen = ?,
                        timestamp = CURRENT_TIMESTAMP() 
                      WHERE room_no = ?`;

  // Update min and max values in the avg_all_room_data table
  const avgUpdateQuery = `UPDATE avg_all_room_data SET 
                            t_min = LEAST(COALESCE(t_min, ?), ?),
                            t_max = GREATEST(COALESCE(t_max, ?), ?),
                            h_min = LEAST(COALESCE(h_min, ?), ?),
                            h_max = GREATEST(COALESCE(h_max, ?), ?),
                            g_min = LEAST(COALESCE(g_min, ?), ?),
                            g_max = GREATEST(COALESCE(g_max, ?), ?),
                            o_min = LEAST(COALESCE(o_min, ?), ?),
                            o_max = GREATEST(COALESCE(o_max, ?), ?),
                            last_updated = CURRENT_TIMESTAMP() 
                          WHERE room_no = ?`;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return;
    }
    
    connection.beginTransaction(function(transErr) {
      if (transErr) { throw transErr; }
      
      connection.query(updateQuery, [temperature, humidity, gas, oxygen, roomNo], function(err, updateResults) {
        if (err) { 
          connection.rollback(function() {
            console.error('Error updating instantaneous data:', err);
            connection.release();
          });
          return;
        }

        connection.query(avgUpdateQuery, [
          temperature, temperature,
          temperature, temperature,
          humidity, humidity,
          humidity, humidity,
          gas, gas,
          gas, gas,
          oxygen, oxygen,
          oxygen, oxygen,
          roomNo
        ], function(avgErr, avgUpdateResults) {
          if (avgErr) { 
            connection.rollback(function() {
              console.error('Error updating min/max data:', avgErr);
              connection.release();
            });
            return;
          }
          
          connection.commit(function(commitErr) {
            if (commitErr) {
              connection.rollback(function() {
                console.error('Error committing transaction:', commitErr);
                connection.release();
              });
              return;
            }
            
            console.log('Data updated successfully');
            connection.release();
          });
        });
      });
    });
  });
}

function dataToWirehouse(temperature, humidity, gas, oxygen, roomNo) { //Store all data to individual data row for future use
  const dataToInsert = {
    temperature: temperature,
    humidity: humidity,
    gas: gas,
    oxygen: oxygen,
  };

  const insertQuery = `INSERT INTO ${roomNo} SET ?`;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return;
    }

    connection.query(insertQuery, dataToInsert, (err, result) => {
      connection.release(); // Release the connection back to the pool
      if (err) {
        console.error('Error inserting data into MySQL database:', err);
        return;
      }
      //console.log('Data inserted successfully');
      //console.log('Inserted row ID:', result.insertId);
    });
  });

  // Close the pool when the application exits
  process.on('exit', () => {
    pool.end((err) => {
      if (err) {
        console.error('Error closing MySQL pool:', err);
        return;
      }
      console.log('MySQL pool closed');
    });
  });
}

function jsonToData(jsonMessage) { //This function seperates the json data received from MQTT broker to variables
  try {
    const jsonData = JSON.parse(jsonMessage);
    const { temperature, humidity, gas, oxygen } = jsonData;
    return [temperature, humidity, gas, oxygen];
  } catch (error) {
    console.error('Error parsing JSON data:', error);
  }
}

function connectToBroker() { //This function connects to Broker server and listen for new data on perticular topic
  const clientId = "client" + Math.random().toString(36).substring(7); //Random client generation
  const hostURL = `${protocol}://${mqttHost}:${port}`;
  const options = {
    keepalive: 60,
    clientId: clientId,
    protocolId: "MQTT",
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  };

  mqttClient = mqtt.connect(hostURL, options);

  mqttClient.on("error", (err) => { //Error during connection
    console.log("Error: ", err);
    mqttClient.end();
  });

  mqttClient.on("reconnect", () => { //Reconnect to MQTT broker
    console.log("Reconnecting...");
  });

  mqttClient.on("connect", () => { //Successful connection to broker
    console.log("Client Connected. Client ID:" + clientId);
  });

  mqttClient.on("message", (topic, message, packet) => { //New message on a perticular topic
    console.log(
      "Payload: " + message.toString() + "\nOn topic: " + topic
    );

    if (topic == '/SATL/room1') { //Topic detection
      var room = 'room1';
      [temperature, humidity, gas, oxygen] = jsonToData(message.toString()); //JSON to variable
      updateData(temperature, humidity, gas, oxygen, room); //Update instantaneous data to a single data row
      if(flag1 == 1){
        dataToWirehouse(temperature, humidity, gas, oxygen, room); //Storing all data to database after certain time interval
        flag1 = 0;
      }
    } else if (topic == '/SATL/room2') {
      var room = 'room2';
      [temperature, humidity, gas, oxygen] = jsonToData(message.toString()); //JSON to variable
      updateData(temperature, humidity, gas, oxygen, room); //Update instantaneous data to a single data row
      if(flag2 == 1){
        dataToWirehouse(temperature, humidity, gas, oxygen, room); //Storing all data to database after certain time interval
        flag2 = 0;
      }
    } else if (topic == '/SATL/room3') {
      var room = 'room3';
      [temperature, humidity, gas, oxygen] = jsonToData(message.toString()); //JSON to variable
      updateData(temperature, humidity, gas, oxygen, room); //Update instantaneous data to a single data row
      if(flag3 == 1){
        dataToWirehouse(temperature, humidity, gas, oxygen, room); //Storing all data to database after certain time interval
        flag3 = 0;
      }
    } else if (topic == '/SATL/room4') {
      var room = 'room4';
      [temperature, humidity, gas, oxygen] = jsonToData(message.toString()); //JSON to variable
      updateData(temperature, humidity, gas, oxygen, room); //Update instantaneous data to a single data row
      if(flag4 == 1){
        dataToWirehouse(temperature, humidity, gas, oxygen, room); //Storing all data to database after certain time interval
        flag4 = 0;
      }
    }
  });
}

function subscribeToTopic(topic) { //This function is for subcription to a perticular topic
  console.log(`Subscribing to Topic: ${topic}`);
  mqttClient.subscribe(topic, { qos: 0 });
}

function setFlag1(){ //Associated to time interval 
  flag1 = 1;
}
function setFlag2(){ //Associated to time interval 
  flag2 = 1;
}
function setFlag3(){ //Associated to time interval 
  flag3 = 1;
}
function setFlag4(){ //Associated to time interval 
  flag4 = 1;
}

setInterval(setFlag1, sampleTime1); //Set the flag after the user defined time interval
setInterval(setFlag2, sampleTime2); //Set the flag after the user defined time interval
setInterval(setFlag3, sampleTime3); //Set the flag after the user defined time interval
setInterval(setFlag4, sampleTime4); //Set the flag after the user defined time interval

connectToBroker();
subscribeToTopic("/SATL/room1");
subscribeToTopic("/SATL/room2");
subscribeToTopic("/SATL/room3");
subscribeToTopic("/SATL/room4");


//function to store hourly data
function storeHourlyData() { //Update hourly data
  // Insert aggregated data into hour_all_data table
  const insertQuery = `INSERT INTO hour_all_data_original (room_no, t_min, t_max, h_min, h_max, g_min, g_max, o_min, o_max, last_updated)
                       SELECT room_no, t_min, t_max, h_min, h_max, g_min, g_max, o_min, o_max, CURRENT_TIMESTAMP()
                       FROM avg_all_room_data`;

  // Reset avg_all_room_data to default values
  const resetQuery = `UPDATE avg_all_room_data 
                    SET t_min = '999', t_max = '0', h_min = '999', h_max = '0', g_min = '999', g_max = '0', o_min = '999', o_max = '0'`;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return;
    }

    connection.beginTransaction(function(transErr) {
      if (transErr) { 
        console.error('Error beginning transaction:', transErr);
        connection.release();
        return;
      }

      // Insert aggregated data
      connection.query(insertQuery, function(insertErr, insertResults) {
        if (insertErr) {
          connection.rollback(function() {
            console.error('Error inserting hourly data:', insertErr);
            connection.release();
          });
          return;
        }

        // Reset avg_all_room_data
        connection.query(resetQuery, function(resetErr, resetResults) {
          if (resetErr) {
            connection.rollback(function() {
              console.error('Error resetting avg_all_room_data:', resetErr);
              connection.release();
            });
            return;
          }

          connection.commit(function(commitErr) {
            if (commitErr) {
              connection.rollback(function() {
                console.error('Error committing transaction:', commitErr);
                connection.release();
              });
              return;
            }

            console.log('Hourly data stored and avg_all_room_data reset successfully');
            connection.release();
          });
        });
      });
    });
  });
}

// Function to store daily data
function storeDailyData() {
  const rooms = ['room1', 'room2', 'room3', 'room4'];

  rooms.forEach(room => {
    const selectQuery = `
      SELECT 
        AVG(CAST(t_min AS DECIMAL(10, 2))) AS avg_t_min,
        AVG(CAST(t_max AS DECIMAL(10, 2))) AS avg_t_max,
        AVG(CAST(h_min AS DECIMAL(10, 2))) AS avg_h_min,
        AVG(CAST(h_max AS DECIMAL(10, 2))) AS avg_h_max,
        AVG(CAST(g_min AS DECIMAL(10, 2))) AS avg_g_min,
        AVG(CAST(g_max AS DECIMAL(10, 2))) AS avg_g_max,
        AVG(CAST(o_min AS DECIMAL(10, 2))) AS avg_o_min,
        AVG(CAST(o_max AS DECIMAL(10, 2))) AS avg_o_max,
        DATE(last_updated) AS date
      FROM hour_all_data_original
      WHERE room_no = ?
      GROUP BY DATE(last_updated)
    `;

    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL connection:', err);
        return;
      }

      connection.query(selectQuery, [room], (error, results) => {
        connection.release();
        if (error) {
          console.error(`Error fetching daily data for ${room}:`, error);
          return;
        }

        if (results.length > 0) {
          const dailyData = results[0];
          const insertQuery = `
            INSERT INTO day_all_data_original (room_no, avg_t_min, avg_t_max, avg_h_min, avg_h_max, avg_g_min, avg_g_max, avg_o_min, avg_o_max, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const insertValues = [
            room,
            dailyData.avg_t_min,
            dailyData.avg_t_max,
            dailyData.avg_h_min,
            dailyData.avg_h_max,
            dailyData.avg_g_min,
            dailyData.avg_g_max,
            dailyData.avg_o_min,
            dailyData.avg_o_max,
            dailyData.date
          ];

          pool.getConnection((insertErr, insertConnection) => {
            if (insertErr) {
              console.error('Error getting MySQL connection:', insertErr);
              return;
            }

            insertConnection.query(insertQuery, insertValues, (insertError, insertResults) => {
              insertConnection.release();
              if (insertError) {
                console.error(`Error inserting daily data for ${room}:`, insertError);
                return;
              }

              console.log(`Daily data for ${room} inserted successfully`);
            });
          });
        } else {
          console.log(`No hourly data found for ${room}`);
        }
      });
    });
  });
}


// Function to store weekly data
function storeWeeklyData() {
  // Implementation to store weekly data
}

// Scheduler function to call appropriate data storage function based on current time
function dataStorageScheduler() {
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const currentDay = currentDate.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6

  // Check current hour to determine if hourly data should be stored
  if (currentHour === 0) {
    storeHourlyData();
  }

  // Check if it's midnight to store daily data
  if (currentHour === 0) {
    storeDailyData();
  }

  // Check if it's Sunday midnight to store weekly data
  if (currentHour === 0 && currentDay === 0) {
    storeWeeklyData();
  }
}

// Call the scheduler every hour
setInterval(dataStorageScheduler, 3600000); // 3600000 milliseconds = 1 hour


