#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Wire.h>
#include <Adafruit_MCP23017.h>

// WiFi credentials
const char* ssid = "Amma";     // Your WiFi name
const char* password = "prasadch";  // Your WiFi password

// Create web server object
ESP8266WebServer server(80);

// Create MCP23017 object
Adafruit_MCP23017 mcp;

// Location to LED mapping
struct LocationLED {
  const char* location;
  uint8_t ledPin;
} locationLeds[] = {
  {"CS101", 0},  // Computer Science section
  {"CS102", 1},
  {"EC101", 2},  // Electronics section
  {"EC102", 3},
  {"ME101", 4},  // Mechanical section
  {"ME102", 5},
  {"CV101", 6},  // Civil section
  {"CV102", 7},
  {"RF101", 8},  // Reference section
  {"RF102", 9}
};

void setup() {
  Serial.begin(115200);
  
  // Initialize I2C and MCP23017
  Wire.begin();
  mcp.begin();
  
  // Set all MCP pins as outputs
  for (int i = 0; i < 16; i++) {
    mcp.pinMode(i, OUTPUT);
    mcp.digitalWrite(i, LOW);
  }
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
  
  // Set up web server routes
  server.on("/book", HTTP_GET, handleBook);
  
  // Handle OPTIONS requests for CORS
  server.on("/book", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204);
  });
  
  // Start server
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}

void handleBook() {
  // Add CORS headers
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Get location code from URL parameter
  String location = server.arg("location");
  Serial.println("Received request for location: " + location);
  
  // Find matching LED
  int ledPin = -1;
  for (const LocationLED& loc : locationLeds) {
    if (location.equals(loc.location)) {
      ledPin = loc.ledPin;
      break;
    }
  }
  
  if (ledPin != -1) {
    // Send response first
    server.send(200, "text/plain", "LED activated for location: " + location);
    
    // Then handle LED
    Serial.println("Turning ON LED " + String(ledPin));
    mcp.digitalWrite(ledPin, HIGH);
    delay(3000); // LED stays on for 3 seconds
    Serial.println("Turning OFF LED " + String(ledPin));
    mcp.digitalWrite(ledPin, LOW);
  } else {
    Serial.println("Location not found: " + location);
    server.send(404, "text/plain", "Location not found: " + location);
  }
} 