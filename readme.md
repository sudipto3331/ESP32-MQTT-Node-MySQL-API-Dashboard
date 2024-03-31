
# IoT Based Real-Time Data Monitoring System
## ESP32 -> MQTT Server -> Node.js Server -> MySQL -> API -> Dashboard
<img alt="Project Title" src="https://img.shields.io/badge/Core-ESP32-red">
<img alt="Project Title" src="https://img.shields.io/badge/Core-MQTT-blue">
<img alt="Project Title" src="https://img.shields.io/badge/Core-Node.js-green">
<img alt="Project Title" src="https://img.shields.io/badge/Core-MySQL-yellow">
<img alt="Project Title" src="https://img.shields.io/badge/Core-Dashboard-pink">

## 1. Overall System Diagram
<img width="700" align="center" alt="image" src="https://github.com/sudipto3331/ESP32-MQTT-Node-MySQL-API-Dashboard/assets/37965793/e13c5a5e-9a11-4f98-84ab-69860880086a">

## 2. Dashboard Visualization 
<img width="500" alt="Screenshot 2024-04-01 at 12 04 17 AM" src="https://github.com/sudipto3331/ESP32-MQTT-Node-MySQL-API-Dashboard/assets/37965793/44608948-4f43-4834-913f-0012503951e1">
<img width="500" alt="Screenshot 2024-04-01 at 12 04 53 AM" src="https://github.com/sudipto3331/ESP32-MQTT-Node-MySQL-API-Dashboard/assets/37965793/0881ca10-54d9-491b-80e2-0817732968f2">
<img width="500" alt="Screenshot 2024-04-01 at 12 05 24 AM" src="https://github.com/sudipto3331/ESP32-MQTT-Node-MySQL-API-Dashboard/assets/37965793/28ca43ea-2893-4c2a-a74a-b7416f0d1f76">
<img width="500" alt="Screenshot 2024-04-01 at 12 05 45 AM" src="https://github.com/sudipto3331/ESP32-MQTT-Node-MySQL-API-Dashboard/assets/37965793/19f04770-5c73-4aeb-affd-316cc5fc8c35">
<img width="800" alt="image" src="https://github.com/sudipto3331/ESP32-MQTT-Node-MySQL-API-Dashboard/assets/37965793/81d8338e-7f55-4934-a8bd-f5699f8fde7e">


## 3. Instruction
1. Go to the installation section and install all required libraries.
2. Upload the code to ESP32.
3. Check the data flow using MQTT Explorer.
4. Set up the database with proper tables and credentials (.env file).
5. Run the mqtt-listener.js.
6. Check the console as well as the MySQL database for the data stream.
7. Visit the index.html page and ENJOY..!

## 4. Introduction

The IoT Based Real Time Data Monitoring System is a comprehensive solution designed to collect, process, and display data from sensors placed within a room. Real-time data along with daily, weekly, monthly summarized statistical data are also available for the user to view in the dashboard.

## 5. Used Technology

- ESP32 microcontroller for sensor data acquisition.
- MQTT server for efficient communication between devices.
- Node.js for creating a server to handle MQTT messages.
- MySQL database to store real time and historical data
- PHP for building APIs to interact with the database.
- HTML/CSS/JavaScript for developing the frontend interface.

## 6. Installation
### Arduino IDE Library
1. [ArduinoJson.h](https://github.com/bblanchon/ArduinoJson.git)
`https://github.com/bblanchon/ArduinoJson.git`
2. [WiFi.h](https://www.arduino.cc/reference/en/libraries/wifi/)
`https://www.arduino.cc/reference/en/libraries/wifi`
3. [PubSubClient.h](https://github.com/knolleary/pubsubclient.git)
`https://github.com/knolleary/pubsubclient.git`
4. [Wire.h](https://www.arduino.cc/reference/en/language/functions/communication/wire)
`https://www.arduino.cc/reference/en/language/functions/communication/wire`
### MQTT Explorer
MQTT Explorer is utilized in this project to visualize the data from the MQTT Server.
[Download](https://mqtt-explorer.com/)
### Server Side
In this project, I'm using a remote server for deployment. The server runs on Cloud Linux. If you are using Linux or another operating system for your server, feel free to modify the following command.
1. Node.js installation
```bash
yum install -y gcc-c++ make
```
```bash
curl -sL https://rpm.nodesource.com/setup_14.x | sudo -E bash -
```
```bash
yum install nodejs
```
```bash
ln -s /usr/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
```
```bash
cp /usr/bin/node /usr/local/bin/node
```
```bash
nano /etc/cagefs/conf.d/node.cfg
```
Add the following lines and save it:
```
[node]
comment=Node
paths=/usr/local/bin/node
```
```bash
nano /etc/cagefs/conf.d/npm.cfg
```
Add the following lines and save it:
```
[npm]
comment=NPM
paths=/usr/local/bin/npm
```
```bash
cagefsctl --force-update
```
[Full Guideline](https://gist.github.com/mcnamee/3fc5b348b37e6657dbc2b99ed7bdb9e0)

2. MQTT installation via Node
```bash
npm install mqtt
```
3. MySQL installation via Node
```bash
npm install mysql
```
4. Composer ( Optional )
```bashell
php composer-setup.php --install-dir=bin --filename=composer
```
[Full Guide](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-macos)

5. Express ( Optional ) : Those who want's to run the API via express
```bash
npm install express
```
6. File System Module for HTTPS ( Optional ) : Those who want's to run the API via express
```bash
npm install fs
```
7. MySQL database running on server

## 7. Project Workflow

### 7.1 Data Generation, Collection, and Transmission

The ESP32 microcontroller is employed to collect data from sensors installed in the room. Currently no sensor is physically connected with the ESP32. Random functions are utilized to generate data which are considered equivalent to real sensor data. Four parameters are considered for four individual rooms in this application: [room1:room4] temperature, humidity, gas, and oxygen. This data are then transmitted to an MQTT server using the MQTT protocol, ensuring reliable and lightweight communication.

```arduino
    int temperature1 = random(25, 50);
    int humidity1 = random(75, 100);
    int gas1 = random(40, 80);
    int oxygen1 = random(85, 100);

    int temperature2 = random(25, 50);
    int humidity2 = random(75, 100);
    int gas2 = random(40, 80);
    int oxygen2 = random(85, 100);
   ```

### 7.2 MQTT Server

The transmitted data to the MQTT server are received based on particular topics. MQTT Explorer is utilized to visualize the transmitted random data. Four individual topics are selected for individual rooms. The data for individual rooms is sent to the MQTT server after a certain time interval which is defined by 'sensorReadDelay1' and 'sensorReadDelay2'. 
```arduino
int sensorReadDelay1 = 1000;
int sensorReadDelay2 = 3000;
```
The MQTT server topics used in this project are given as follows:
```arduino
const char* publishTopic1 = "/SATL/room1";
const char* publishTopic2 = "/SATL/room2";
const char* publishTopic3 = "/SATL/room3";
const char* publishTopic4 = "/SATL/room4";
```
Broker Server URL for this project: 
```arduino
const char* mqtt_server = "broker.emqx.io";
```
You may use different open source mqtt-broker from [this](https://mntolia.com/10-free-public-private-mqtt-brokers-for-testing-prototyping/) list.

### 7.3 MQTT Explorer
You can connect to the MQTT Broker server from MQTT Explorer and visualize the data sent from ESP32 by subscribing to the particular topic that you provided earlier.
PICTURE

### 7.4 Server-Side Development

A Node.js server is established to listen to incoming messages from the MQTT server. Upon receiving data, the server parses it and stores it in a database, facilitating efficient data management and retrieval for further processing. The instantaneous data are stored in a particular table from which the data is served to the dashboard via APIs. The current random data for four individual rooms are also stored in a separate data table with an interval of 15 seconds to visualize the data in a graphical format. The average hourly data, daily data, and weekly data are stored in separate data tables for historical analysis. 
```
You need to run the mqtt-listener.js for start the datastream. 
```
```js
node mqtt-listener.js
```

### 7.5 Database Management

The MySQL database is utilized for data storage in this application. There are several data tables designed to store data received from the MQTT server. Two tables are designated as instantaneous data update tables where incoming data is frequently updated from the MQTT server. Minimum, maximum, and average data are stored for every hour in a separate table. Additionally, based on the time interval, the daily average data is also stored in another table for historical analysis.

The database tables are provided as follow:
TABLE PICTURE

### 7.6 API Creation : PHP

PHP is used to develop APIs that interface with the database. These APIs serve as endpoints for the frontend to access and retrieve data stored in the database, enabling seamless integration between the frontend and backend components. Below are the APIs and the sample output data format.

#### API 1
Endpoint:
```
https://trackingdevice.info/SATL/live-data.php?room=room1
```
Response: 
```json
{"temperature":"29","humidity":"75","gas":"51","oxygen":"92"}
```
#### API 2
Endpoint:
```
https://trackingdevice.info/SATL/all-data.php?room=room1&type=gas
```
Response: 
```json
[{"id":"1","gas":"76","timestamp":"2024-03-28 15:03:47"},
{"id":"2","gas":"62","timestamp":"2024-03-28 15:04:01"},
{"id":"3","gas":"61","timestamp":"2024-03-28 15:04:16"},
{"id":"4","gas":"58","timestamp":"2024-03-28 15:04:31"},
{"id":"5","gas":"60","timestamp":"2024-03-28 15:04:46"},
{"id":"6","gas":"55","timestamp":"2024-03-28 15:05:01"},
{"id":"7","gas":"49","timestamp":"2024-03-28 15:05:16"},
{"id":"8","gas":"55","timestamp":"2024-03-28 15:05:31"},
{"id":"9","gas":"51","timestamp":"2024-03-28 15:05:46"}]
```
#### API 3
Endpoint:
```
https://trackingdevice.info/SATL/hour-data.php?room_no=room1&timestamp=2024-03-28
```
Response: 
```json
[{"id":1,"room_no":"room1","t_min":"27","t_max":"30","h_min":"75","h_max":"80","g_min":"40","g_max":"42","o_min":"85","o_max":"92","last_updated":"2024-03-28 08:00:00"},
{"id":5,"room_no":"room1","t_min":"27","t_max":"35","h_min":"77","h_max":"85","g_min":"47","g_max":"79","o_min":"86","o_max":"96","last_updated":"2024-03-28 09:00:00"},
{"id":17,"room_no":"room1","t_min":"38","t_max":"30","h_min":"88","h_max":"97","g_min":"78","g_max":"42","o_min":"91","o_max":"99","last_updated":"2024-03-28 10:00:00"},
{"id":21,"room_no":"room1","t_min":"33","t_max":"35","h_min":"78","h_max":"86","g_min":"76","g_max":"47","o_min":"87","o_max":"87","last_updated":"2024-03-28 11:00:00"},
{"id":25,"room_no":"room1","t_min":"27","t_max":"37","h_min":"78","h_max":"82","g_min":"41","g_max":"49","o_min":"87","o_max":"85","last_updated":"2024-03-28 12:00:00"},
{"id":29,"room_no":"room1","t_min":"38","t_max":"30","h_min":"88","h_max":"75","g_min":"57","g_max":"46","o_min":"92","o_max":"85","last_updated":"2024-03-28 13:00:00"},
{"id":41,"room_no":"room1","t_min":"25","t_max":"26","h_min":"79","h_max":"96","g_min":"65","g_max":"67","o_min":"93","o_max":"95","last_updated":"2024-03-28 14:00:00"},
{"id":45,"room_no":"room1","t_min":"27","t_max":"48","h_min":"84","h_max":"78","g_min":"60","g_max":"45","o_min":"87","o_max":"93","last_updated":"2024-03-28 15:00:00"},
{"id":49,"room_no":"room1","t_min":"25","t_max":"31","h_min":"79","h_max":"80","g_min":"60","g_max":"74","o_min":"97","o_max":"92","last_updated":"2024-03-28 16:00:00"},
{"id":53,"room_no":"room1","t_min":"26","t_max":"26","h_min":"75","h_max":"97","g_min":"56","g_max":"55","o_min":"96","o_max":"93","last_updated":"2024-03-28 17:00:00"}]
```

#### API 4
Endpoint:
```
https://trackingdevice.info/SATL/daily-data.php?room_no=room1&timestamp=2024-03-28
```
Response: 
```json
[
  {
    "id": 12,
    "room_no": "room1",
    "avg_t_min": "30",
    "avg_t_max": "26",
    "avg_h_min": "92",
    "avg_h_max": "80",
    "avg_g_min": "41",
    "avg_g_max": "59",
    "avg_o_min": "90",
    "avg_o_max": "91",
    "last_updated": "2024-03-28 12:30:00"
  }
]
```
### 7.7 API Creation : Express (Optional)

If you want to run the API from your server, you could just run the api.js via Node. It is recommended to use <b>HTTPS</b> for APIs. The code has been set up flexibly so that you may use SSL. To use HTTPS, you need to set the <i>useHTTPS</i> variable to true.
```js
const  useHTTPS  =  true;
```
Also you need to upload SSL server certificate to the <b>server.crt</b> file and server key to the <b>server.hey</b> file. You can generate the HTTPS certificate from you cPanel or [this](https://www.sslforfree.com/) cite. 
<b>server.crt</b>
```vbnet
-----BEGIN CERTIFICATE-----
INSERT CERTIFICATE
-----END CERTIFICATE-----
```
<b>server.key</b>
```vbnet
-----BEGIN RSA PRIVATE KEY-----
INSERT PRIVATE KEY
-----END RSA PRIVATE KEY-----
```
### 7.8 Frontend Development

The frontend interface is crafted using HTML, CSS, and JavaScript, offering users an intuitive platform to visualize and interact with the monitored data. Through dynamic rendering and real-time updates, users can conveniently monitor room conditions and trends. The frontend dynamically updates to display the latest sensor readings through AJAX requests to the PHP APIs. The real-time data is updated every 90 milliseconds, while the graph data is updated every 500 miliseconds. You could change these parameters from <b>dataFetch.js</b> file.

## 8. Conclusion
The IoT Based Real Time Monitoring System successfully integrates various technologies to provide users with a comprehensive solution for monitoring room conditions. By leveraging ESP32, MQTT, Node.js, PHP, and HTML/CSS/JavaScript, the system ensures efficient data collection, processing, and visualization, enhancing the user experience and enabling informed decision-making.

## 9. Quick Tips and Debug
1. Ensure that all required packages and libraries are installed.
2. To use the Express API, ensure that the port being used is not blocked by the server's firewall. Open the specified port for API communication. In this case, it's <b>4115</b>.
3. You may enter your database credentials directly to the db.js file or you can use environment variable that I have used in this scenarios.
4. You can run the API and listener at the same time by running start.js file. 
5. Will be updated...!
