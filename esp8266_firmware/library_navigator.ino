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

// Book to LED mapping (adjust pin numbers as needed)
struct BookLED {
  const char* bookName;
  uint8_t ledPin;
} bookLeds[] = {
  {"Fundamentals of Physics", 0},
  {"Modern Physics", 1},
  {"Organic Chemistry", 2},
  {"Inorganic Chemistry", 3},
  {"Advanced Engineering Mathematics", 4},
  {"Discrete Mathematics", 5}
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
  
  // Get book name from URL parameter
  String bookName = server.arg("name");
  Serial.println("Received request for book: " + bookName);
  
  // Find matching LED
  int ledPin = -1;
  for (const BookLED& book : bookLeds) {
    if (bookName.equals(book.bookName)) {
      ledPin = book.ledPin;
      break;
    }
  }
  
  if (ledPin != -1) {
    // Send response first
    server.send(200, "text/plain", "LED activated for: " + bookName);
    
    // Then handle LED
    Serial.println("Turning ON LED " + String(ledPin));
    mcp.digitalWrite(ledPin, HIGH);
    delay(2000); // Reduced from 5000ms to 2000ms
    Serial.println("Turning OFF LED " + String(ledPin));
    mcp.digitalWrite(ledPin, LOW);
  } else {
    Serial.println("Book not found: " + bookName);
    server.send(404, "text/plain", "Book not found: " + bookName);
  }
} 