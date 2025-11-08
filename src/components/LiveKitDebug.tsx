import { useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';

interface LiveKitDebugProps {
    token: string;
    wsUrl: string;
    roomName: string;
}

export function LiveKitDebug({ token, wsUrl, roomName }: LiveKitDebugProps) {
    const [logs, setLogs] = useState<string[]>([]);
    const [room, setRoom] = useState<Room | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
        console.log(`[LiveKitDebug] ${message}`);
    };

    const testConnection = async () => {
        try {
            addLog('Starting connection test...');
            addLog(`WS URL: ${wsUrl}`);
            addLog(`Room: ${roomName}`);
            addLog(`Token length: ${token.length}`);

            const testRoom = new Room({
                adaptiveStream: true,
                dynacast: true,
            });

            testRoom.on(RoomEvent.Connected, () => {
                addLog('✅ Connected successfully!');
                setIsConnected(true);
            });

            testRoom.on(RoomEvent.Disconnected, (reason) => {
                addLog(`❌ Disconnected: ${reason}`);
                setIsConnected(false);
            });

            testRoom.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
                addLog(`📶 Connection quality: ${quality} for ${participant?.identity || 'local'}`);
            });

            testRoom.on(RoomEvent.Reconnecting, () => {
                addLog('🔄 Reconnecting...');
            });

            testRoom.on(RoomEvent.Reconnected, () => {
                addLog('✅ Reconnected!');
            });

            addLog('Attempting to connect...');
            await testRoom.connect(wsUrl, token);
            setRoom(testRoom);
            addLog('Connection initiated successfully');

        } catch (error: any) {
            addLog(`❌ Connection failed: ${error?.message || error}`);
        }
    };

    const disconnect = async () => {
        if (room) {
            addLog('Disconnecting...');
            await room.disconnect();
            setRoom(null);
            setIsConnected(false);
            addLog('Disconnected');
        }
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-bold mb-4">LiveKit Connection Debug</h3>
            
            <div className="space-y-2 mb-4">
                <button
                    onClick={testConnection}
                    disabled={isConnected}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    Test Connection
                </button>
                
                <button
                    onClick={disconnect}
                    disabled={!isConnected}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 ml-2"
                >
                    Disconnect
                </button>
                
                <button
                    onClick={clearLogs}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 ml-2"
                >
                    Clear Logs
                </button>
            </div>

            <div className="mb-2">
                <span className={`px-2 py-1 rounded text-sm ${isConnected ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
            </div>

            <div className="bg-black text-green-400 p-3 rounded font-mono text-sm h-64 overflow-y-auto">
                {logs.length === 0 ? (
                    <div className="text-gray-500">No logs yet. Click "Test Connection" to start.</div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index}>{log}</div>
                    ))
                )}
            </div>
        </div>
    );
}