This project is all about sending data from sensors connected to the ESP32 to a remote server DB while considering the MQTT protocol.
Data flow:
Sensors->ESP32->MQTT Server->Live Node.js Server (Topic Listener)->Store to MySQL->User Dashboard