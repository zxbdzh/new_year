# NetworkSynchronizer API Documentation

## Overview

`NetworkSynchronizer` is the core service for managing real-time multiplayer communication in the New Year Fireworks Game. It handles WebSocket connections, message queuing, network latency monitoring, and room management.

**Location:** `src/services/NetworkSynchronizer.ts`

**Dependencies:**
- `socket.io-client` - WebSocket communication
- `NetworkTypes` - Type definitions for network messages

---

## Constructor

```typescript
constructor(serverUrl: string = 'http://localhost:3001')
```

Creates a new NetworkSynchronizer instance.

**Parameters:**
- `serverUrl` (optional) - Server URL for WebSocket connection. Defaults to `http://localhost:3001`

**Example:**
```typescript
const synchronizer = new NetworkSynchronizer('http://localhost:3001');
```

---

## Connection Management

### `connect(): Promise<void>`

Establishes a WebSocket connection to the server.

**Returns:** Promise that resolves when connected

**Throws:** Error if connection fails

**Example:**
```typescript
try {
  await synchronizer.connect();
  console.log('Connected successfully');
} catch (error) {
  console.error('Connection failed:', error);
}
```

### `disconnect(): void`

Disconnects from the server and cleans up resources.

**Example:**
```typescript
synchronizer.disconnect();
```

### `checkServerAvailability(): Promise<boolean>`

Checks if the server is reachable by attempting a connection.

**Returns:** `true` if server is available, `false` otherwise

**Example:**
```typescript
const isAvailable = await synchronizer.checkServerAvailability();
if (!isAvailable) {
  console.log('Server is offline');
}
```

---

## Room Management

### `joinRoom(nickname: string, roomType: RoomType, code?: string): Promise<RoomInfo>`

Joins or creates a room.

**Parameters:**
- `nickname` - Player nickname (1-8 characters, alphanumeric + Chinese)
- `roomType` - Either `'public'` or `'private'`
- `code` (optional) - 4-digit room code for private rooms

**Returns:** Promise resolving to `RoomInfo` object

**Throws:** Error if not connected or join fails

**Example:**
```typescript
// Join public room
const roomInfo = await synchronizer.joinRoom('Player1', 'public');

// Join/create private room
const roomInfo = await synchronizer.joinRoom('Player1', 'private', '1234');
```

### `leaveRoom(): void`

Leaves the current room.

**Example:**
```typescript
synchronizer.leaveRoom();
```

---

## Sending Messages

### `sendFireworkAction(x: number, y: number, fireworkTypeId: string): void`

Broadcasts a firework action to other players in the room.

**Parameters:**
- `x` - X coordinate of firework
- `y` - Y coordinate of firework
- `fireworkTypeId` - Type identifier of the firework

**Example:**
```typescript
synchronizer.sendFireworkAction(100, 200, 'peony');
```

### `sendChatMessage(message: string): void`

Sends a chat message to other players in the room.

**Parameters:**
- `message` - Chat message text

**Example:**
```typescript
synchronizer.sendChatMessage('Happy New Year!');
```

### `sendComboMilestone(comboCount: number): void`

Broadcasts a combo milestone achievement to other players.

**Parameters:**
- `comboCount` - Number of consecutive clicks (e.g., 10, 50, 100, 200)

**Supported Milestones:**
- 10-combo: Perfect Combo (完美连击)
- 50-combo: Super Combo (超级连击)
- 100-combo: Epic Combo (史诗连击)
- 200-combo: Legendary Combo (传说连击)

**Example:**
```typescript
// Player achieved 100-combo
synchronizer.sendComboMilestone(100);

// Player achieved 200-combo (legendary)
synchronizer.sendComboMilestone(200);
```

---

## Event Callbacks

All callback registration methods return an unsubscribe function.

### `onFireworkAction(callback: (action: FireworkAction) => void): () => void`

Registers a callback for when other players launch fireworks.

**Callback Parameters:**
- `action.playerId` - ID of the player who launched the firework
- `action.playerNickname` - Nickname of the player
- `action.x` - X coordinate
- `action.y` - Y coordinate
- `action.fireworkTypeId` - Firework type
- `action.timestamp` - Timestamp of the action

**Example:**
```typescript
const unsubscribe = synchronizer.onFireworkAction((action) => {
  console.log(`${action.playerNickname} launched a firework at (${action.x}, ${action.y})`);
  // Render the firework locally
  fireworksEngine.launchFirework(action.x, action.y, action.fireworkTypeId);
});

// Later: unsubscribe()
```

### `onPlayerJoin(callback: (player: PlayerInfo) => void): () => void`

Registers a callback for when a player joins the room.

**Callback Parameters:**
- `player.id` - Player ID
- `player.nickname` - Player nickname
- `player.fireworkCount` - Number of fireworks launched

**Example:**
```typescript
const unsubscribe = synchronizer.onPlayerJoin((player) => {
  console.log(`${player.nickname} joined the room`);
});
```

### `onPlayerLeave(callback: (playerId: string) => void): () => void`

Registers a callback for when a player leaves the room.

**Callback Parameters:**
- `playerId` - ID of the player who left

**Example:**
```typescript
const unsubscribe = synchronizer.onPlayerLeave((playerId) => {
  console.log(`Player ${playerId} left the room`);
});
```

### `onRoomUpdate(callback: (room: RoomInfo) => void): () => void`

Registers a callback for room information updates.

**Callback Parameters:**
- `room.id` - Room ID
- `room.type` - Room type ('public' or 'private')
- `room.players` - Array of PlayerInfo objects
- `room.maxPlayers` - Maximum number of players

**Example:**
```typescript
const unsubscribe = synchronizer.onRoomUpdate((room) => {
  console.log(`Room has ${room.players.length}/${room.maxPlayers} players`);
});
```

### `onChatMessage(callback: (message) => void): () => void`

Registers a callback for chat messages.

**Callback Parameters:**
- `message.playerId` - Sender's player ID
- `message.playerNickname` - Sender's nickname
- `message.message` - Message text
- `message.timestamp` - Message timestamp

**Example:**
```typescript
const unsubscribe = synchronizer.onChatMessage((msg) => {
  console.log(`${msg.playerNickname}: ${msg.message}`);
});
```

### `onComboMilestone(callback: (data) => void): () => void`

**NEW:** Registers a callback for combo milestone broadcasts from other players.

**Callback Parameters:**
- `data.playerId` - Player ID who achieved the milestone
- `data.playerNickname` - Player nickname
- `data.comboCount` - Combo count achieved (10, 50, 100, 200)
- `data.timestamp` - Timestamp of the achievement

**Supported Milestones:**
- 10-combo: Perfect Combo (完美连击)
- 50-combo: Super Combo (超级连击)
- 100-combo: Epic Combo (史诗连击)
- 200-combo: Legendary Combo (传说连击)

**Example:**
```typescript
const unsubscribe = synchronizer.onComboMilestone((data) => {
  console.log(`${data.playerNickname} achieved ${data.comboCount}x combo!`);
  
  // Show different notifications based on milestone
  if (data.comboCount >= 200) {
    showNotification(`${data.playerNickname} 达成传说连击！`, 'legendary');
  } else if (data.comboCount >= 100) {
    showNotification(`${data.playerNickname} 达成史诗连击！`, 'epic');
  } else if (data.comboCount >= 50) {
    showNotification(`${data.playerNickname} 达成超级连击！`, 'super');
  } else {
    showNotification(`${data.playerNickname} 达成完美连击！`, 'perfect');
  }
});
```

**Use Case:**
This callback allows you to display notifications when other players in the room achieve combo milestones, creating a more engaging multiplayer experience.

### `onLeaderboardUpdate(callback: (leaderboard: PlayerInfo[]) => void): () => void`

Registers a callback for leaderboard updates.

**Callback Parameters:**
- `leaderboard` - Array of top 3 players sorted by firework count

**Example:**
```typescript
const unsubscribe = synchronizer.onLeaderboardUpdate((leaderboard) => {
  leaderboard.forEach((player, index) => {
    console.log(`#${index + 1}: ${player.nickname} - ${player.fireworkCount} fireworks`);
  });
});
```

### `onConnectionStateChange(callback: (state: ConnectionState) => void): () => void`

Registers a callback for connection state changes.

**Callback Parameters:**
- `state` - One of: `'disconnected'`, `'connecting'`, `'connected'`, `'reconnecting'`, `'failed'`

**Example:**
```typescript
const unsubscribe = synchronizer.onConnectionStateChange((state) => {
  console.log(`Connection state: ${state}`);
  if (state === 'failed') {
    showErrorMessage('Connection failed. Please check your network.');
  }
});
```

### `onLatencyUpdate(callback: (latency: LatencyInfo) => void): () => void`

Registers a callback for network latency updates.

**Callback Parameters:**
- `latency.current` - Current latency in milliseconds
- `latency.average` - Average latency
- `latency.min` - Minimum latency
- `latency.max` - Maximum latency

**Example:**
```typescript
const unsubscribe = synchronizer.onLatencyUpdate((latency) => {
  console.log(`Latency: ${latency.current}ms (avg: ${latency.average}ms)`);
  if (latency.current > 1000) {
    showWarning('High network latency detected');
  }
});
```

### `onError(callback: (error: string) => void): () => void`

Registers a callback for error notifications.

**Callback Parameters:**
- `error` - Error message string

**Example:**
```typescript
const unsubscribe = synchronizer.onError((error) => {
  console.error('Network error:', error);
  showErrorToast(error);
});
```

---

## Getters

### `getRoomInfo(): RoomInfo | null`

Returns the current room information or `null` if not in a room.

**Example:**
```typescript
const roomInfo = synchronizer.getRoomInfo();
if (roomInfo) {
  console.log(`In room ${roomInfo.id} with ${roomInfo.players.length} players`);
}
```

### `getLeaderboard(): PlayerInfo[]`

Returns the top 3 players sorted by firework count.

**Example:**
```typescript
const leaderboard = synchronizer.getLeaderboard();
leaderboard.forEach((player, index) => {
  console.log(`#${index + 1}: ${player.nickname}`);
});
```

### `getConnectionState(): ConnectionState`

Returns the current connection state.

**Example:**
```typescript
const state = synchronizer.getConnectionState();
if (state === 'connected') {
  console.log('Ready to play!');
}
```

### `getLatencyInfo(): LatencyInfo`

Returns current network latency information.

**Example:**
```typescript
const latency = synchronizer.getLatencyInfo();
console.log(`Current: ${latency.current}ms, Average: ${latency.average}ms`);
```

### `getLocalPlayerId(): string | null`

Returns the local player's ID or `null` if not connected.

**Example:**
```typescript
const playerId = synchronizer.getLocalPlayerId();
console.log(`My player ID: ${playerId}`);
```

---

## Configuration

The NetworkSynchronizer uses the following default configuration:

```typescript
{
  serverUrl: 'http://localhost:3001',
  maxReconnectAttempts: 3,
  reconnectInterval: 5000,      // 5 seconds
  pingInterval: 25000,           // 25 seconds
  maxQueueSize: 100              // Max queued messages
}
```

---

## Message Queue

When disconnected, messages are automatically queued and sent when reconnected. The queue has a maximum size of 100 messages. When the queue is full, the oldest messages are discarded.

**Queued Message Types:**
- Firework actions
- Chat messages

**Not Queued:**
- Combo milestones (real-time only)

---

## Automatic Reconnection

The NetworkSynchronizer automatically attempts to reconnect when the connection is lost:

1. Detects disconnection
2. Attempts reconnection up to 3 times
3. Waits 5 seconds between attempts
4. Processes queued messages after successful reconnection
5. Notifies error callbacks if all attempts fail

---

## Complete Usage Example

```typescript
import { NetworkSynchronizer } from '@/services/NetworkSynchronizer';
import { FireworksEngine } from '@/engines/FireworksEngine';

// Initialize
const synchronizer = new NetworkSynchronizer('http://localhost:3001');
const fireworksEngine = new FireworksEngine(canvas);

// Connect to server
await synchronizer.connect();

// Join a room
const roomInfo = await synchronizer.joinRoom('Player1', 'public');
console.log(`Joined room with ${roomInfo.players.length} players`);

// Register callbacks
const unsubscribeFirework = synchronizer.onFireworkAction((action) => {
  // Render other players' fireworks
  fireworksEngine.launchFirework(action.x, action.y, action.fireworkTypeId);
});

const unsubscribeCombo = synchronizer.onComboMilestone((data) => {
  // Show combo notification
  showNotification(`${data.playerNickname} 达成${data.comboCount}连击！`);
});

const unsubscribeLeaderboard = synchronizer.onLeaderboardUpdate((leaderboard) => {
  // Update leaderboard UI
  updateLeaderboardDisplay(leaderboard);
});

// Send firework action
canvas.addEventListener('click', (e) => {
  const x = e.clientX;
  const y = e.clientY;
  
  // Launch locally
  fireworksEngine.launchFirework(x, y);
  
  // Broadcast to others
  synchronizer.sendFireworkAction(x, y, 'peony');
});

// Send combo milestone
if (comboCount === 100) {
  synchronizer.sendComboMilestone(100);
}

// Send legendary combo milestone
if (comboCount === 200) {
  synchronizer.sendComboMilestone(200);
}

// Cleanup
unsubscribeFirework();
unsubscribeCombo();
unsubscribeLeaderboard();
synchronizer.leaveRoom();
synchronizer.disconnect();
```

---

## Type Definitions

### `RoomInfo`

```typescript
interface RoomInfo {
  id: string;
  type: 'public' | 'private';
  players: PlayerInfo[];
  maxPlayers: number;
}
```

### `PlayerInfo`

```typescript
interface PlayerInfo {
  id: string;
  nickname: string;
  fireworkCount: number;
}
```

### `FireworkAction`

```typescript
interface FireworkAction {
  playerId: string;
  playerNickname: string;
  x: number;
  y: number;
  fireworkTypeId: string;
  timestamp: number;
}
```

### `ConnectionState`

```typescript
type ConnectionState = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'reconnecting' 
  | 'failed';
```

### `LatencyInfo`

```typescript
interface LatencyInfo {
  current: number;  // Current latency in ms
  average: number;  // Average latency in ms
  min: number;      // Minimum latency in ms
  max: number;      // Maximum latency in ms
}
```

---

## Best Practices

1. **Always check connection state** before sending messages
2. **Unsubscribe from callbacks** when component unmounts to prevent memory leaks
3. **Handle errors gracefully** using the `onError` callback
4. **Monitor latency** to provide feedback to users about connection quality
5. **Use combo milestones sparingly** - only broadcast significant achievements (10, 50, 100, 200)
   - 10-combo: Perfect Combo (完美连击)
   - 50-combo: Super Combo (超级连击)
   - 100-combo: Epic Combo (史诗连击)
   - 200-combo: Legendary Combo (传说连击)
6. **Clean up on exit** - always call `leaveRoom()` and `disconnect()` when leaving multiplayer mode

---

## Changelog

### v1.2.0 (2025-02-15)
- **Enhanced:** Added 200-combo milestone support (Legendary Combo / 传说连击)
- **Updated:** Combo milestone documentation with all four tiers (10, 50, 100, 200)
- **Improved:** Visual effects for legendary combo milestone in multiplayer mode

### v1.1.0 (2025-02-15)
- **Added:** `onComboMilestone()` callback for receiving combo milestone broadcasts
- **Added:** `sendComboMilestone()` method for broadcasting combo achievements
- **Feature:** Players can now see when others achieve combo milestones in real-time

### v1.0.0
- Initial release with core multiplayer functionality
