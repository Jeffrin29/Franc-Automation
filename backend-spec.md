# IoT Dashboard Backend Integration Guide

## Backend Stack

### Flask Backend
- **Framework**: Flask (Python)
- **Database**: SQLite
- **MQTT Client**: Paho-MQTT
- **WebSocket**: Flask-SocketIO

### Why Flask?
- Lightweight and flexible
- Easy to set up and understand
- Large ecosystem of extensions
- Perfect for IoT applications
- Simple integration with SQLite

## Backend Implementation

### Project Structure
```
backend/
├── app/
│   ├── __init__.py          # Flask app initialization
│   ├── routes.py            # API endpoints
│   ├── mqtt_client.py       # MQTT handler
│   ├── database.py          # SQLite operations
│   ├── socket_events.py     # WebSocket events
│   └── models.py            # Data models
├── instance/
│   └── dashboard.db         # SQLite database
├── config.py                # Configuration
└── run.py                   # Application entry
```

### Flask App Setup
```python
# app/__init__.py
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")

from app import routes, socket_events
```

### Database Setup
```python
# app/database.py
import sqlite3
from flask import g

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            'instance/dashboard.db',
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def init_db():
    db = get_db()
    
    # Create tables
    db.execute('''
        CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'offline',
            last_seen TIMESTAMP
        )
    ''')
    
    db.execute('''
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id TEXT NOT NULL,
            temperature REAL,
            humidity REAL,
            pressure REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (device_id) REFERENCES devices(device_id)
        )
    ''')
    
    db.commit()
```

### API Routes
```python
# app/routes.py
from flask import jsonify, request
from app import app
from app.database import get_db

@app.route('/api/devices', methods=['GET'])
def get_devices():
    db = get_db()
    devices = db.execute('''
        SELECT d.*, 
               sd.temperature,
               sd.humidity,
               sd.pressure
        FROM devices d
        LEFT JOIN (
            SELECT * FROM sensor_data
            WHERE id IN (
                SELECT MAX(id)
                FROM sensor_data
                GROUP BY device_id
            )
        ) sd ON d.device_id = sd.device_id
    ''').fetchall()
    
    return jsonify([dict(device) for device in devices])

@app.route('/api/devices', methods=['POST'])
def add_device():
    data = request.json
    db = get_db()
    
    try:
        db.execute(
            'INSERT INTO devices (device_id, name) VALUES (?, ?)',
            (data['device_id'], data['name'])
        )
        db.commit()
        return jsonify({"message": "Device added successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Device ID already exists"}), 400
```

### WebSocket Events
```python
# app/socket_events.py
from app import socketio
from flask_socketio import emit

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

def broadcast_sensor_data(data):
    """Broadcast sensor data to all connected clients"""
    socketio.emit('sensor_data', data)
```

### MQTT Handler
```python
# app/mqtt_client.py
import paho.mqtt.client as mqtt
from app.database import get_db
from app.socket_events import broadcast_sensor_data
import json

class MQTTClient:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        print(f"Connected with result code {rc}")
        client.subscribe("iot/devices/+/data")

    def on_message(self, client, userdata, msg):
        try:
            data = json.loads(msg.payload)
            device_id = msg.topic.split('/')[2]
            
            # Store in database
            db = get_db()
            db.execute('''
                INSERT INTO sensor_data 
                (device_id, temperature, humidity, pressure)
                VALUES (?, ?, ?, ?)
            ''', (device_id, data['temperature'], 
                  data['humidity'], data.get('pressure')))
            db.commit()
            
            # Broadcast to connected clients
            broadcast_sensor_data({
                'device_id': device_id,
                **data
            })
            
        except Exception as e:
            print(f"Error processing message: {e}")
```

## Frontend Integration

### API Service
```typescript
// src/services/api.ts
const API_BASE = 'http://localhost:5000/api';

export const api = {
    async getDevices() {
        const response = await fetch(`${API_BASE}/devices`);
        if (!response.ok) throw new Error('Failed to fetch devices');
        return response.json();
    },

    async addDevice(device: {
        device_id: string;
        name: string;
    }) {
        const response = await fetch(`${API_BASE}/devices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(device),
        });
        if (!response.ok) throw new Error('Failed to add device');
        return response.json();
    }
};
```

### WebSocket Hook
```typescript
// src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [sensorData, setSensorData] = useState<any>(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('sensor_data', (data) => {
            setSensorData(data);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    return { socket, sensorData };
}
```

### Using in Components
```typescript
// src/components/dashboard/DashboardLayout.tsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';

export function DashboardLayout() {
    const [devices, setDevices] = useState([]);
    const { sensorData } = useSocket();

    useEffect(() => {
        // Fetch initial devices
        api.getDevices().then(setDevices);
    }, []);

    useEffect(() => {
        // Update device data when new sensor data arrives
        if (sensorData) {
            setDevices(prev => prev.map(device => 
                device.device_id === sensorData.device_id
                    ? { ...device, ...sensorData }
                    : device
            ));
        }
    }, [sensorData]);

    return (
        <div>
            {devices.map(device => (
                <MetricCard
                    key={device.device_id}
                    title={device.name}
                    value={device.temperature}
                    unit="°C"
                />
            ))}
        </div>
    );
}
```

## Running the System

### 1. Start Flask Backend
```bash
# Install dependencies
pip install flask flask-socketio flask-cors paho-mqtt

# Initialize database
python -c "from app.database import init_db; init_db()"

# Run Flask server
python run.py
```

### 2. Connect Frontend
```bash
# Update API_BASE in src/services/api.ts to match Flask server
const API_BASE = 'http://localhost:5000/api';

# Start Vite dev server
npm run dev
```

## Testing the Integration

### 1. Test MQTT Data Flow
```bash
# Publish test data
mosquitto_pub -t "iot/devices/test_device/data" -m '{
    "temperature": 23.5,
    "humidity": 55,
    "pressure": 1013.25
}'
```

### 2. Monitor WebSocket
```typescript
// In browser console
const socket = io('http://localhost:5000');
socket.on('sensor_data', console.log);
```

### 3. Test API Endpoints
```bash
# Get devices
curl http://localhost:5000/api/devices

# Add device
curl -X POST http://localhost:5000/api/devices \
  -H "Content-Type: application/json" \
  -d '{"device_id": "test_device", "name": "Test Sensor"}'
```

## Error Handling

### Backend Error Handling
```python
# app/routes.py
from flask import jsonify

@app.errorhandler(Exception)
def handle_error(error):
    return jsonify({
        "error": str(error),
        "status": getattr(error, 'code', 500)
    }), getattr(error, 'code', 500)
```

### Frontend Error Handling
```typescript
// src/services/api.ts
async function handleApiError(response: Response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }
    return response;
}
```

This integration guide provides a complete setup for connecting your React TypeScript frontend to a Flask backend with real-time MQTT data processing and WebSocket updates.