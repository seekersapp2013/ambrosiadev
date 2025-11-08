import { useState, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface RecordingManagementProps {
    onBack: () => void;
}

export function RecordingManagement({ onBack }: RecordingManagementProps) {
    const [downloadingRecording, setDownloadingRecording] = useState<Id<"bookings"> | null>(null);
    const [checkingStatus, setCheckingStatus] = useState<Set<Id<"bookings">>>(new Set());
    const [debugMode, setDebugMode] = useState(false);
    const [debugData, setDebugData] = useState<any>(null);

    // Get bookings with recordings
    const recordedSessions = useQuery(api.livekit.getMyLiveStreams, {
        status: "ENDED"
    });

    const downloadRecording = useMutation(api.livekit.downloadRecording);
    const getRecordingStatus = useAction(api.livekitActions.getRecordingStatus);
    const debugListAllRecordings = useAction(api.livekitActions.debugListAllRecordings);
    const debugGetRecordingDetails = useAction(api.livekitActions.debugGetRecordingDetails);

    // Check recording status for sessions that are still processing
    useEffect(() => {
        if (!recordedSessions) return;

        const processingRecordings = recordedSessions.filter(session =>
            session.recordingUrl &&
            (session.recordingUrl.startsWith('pending-') || session.recordingUrl.startsWith('processing-'))
        );

        processingRecordings.forEach(async (session) => {
            if (checkingStatus.has(session._id)) return;

            setCheckingStatus(prev => new Set(prev).add(session._id));

            try {
                const status = await getRecordingStatus({ bookingId: session._id });
                if (status.status === 'COMPLETE' && status.downloadUrl) {
                    // Recording is now ready - the mutation will update the database
                    console.log('Recording ready for download:', session._id);
                }
            } catch (error) {
                console.error('Failed to check recording status:', error);
            } finally {
                setCheckingStatus(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(session._id);
                    return newSet;
                });
            }
        });
    }, [recordedSessions, getRecordingStatus, checkingStatus]);

    const handleDownloadRecording = async (bookingId: Id<"bookings">) => {
        setDownloadingRecording(bookingId);

        try {
            const result = await downloadRecording({ bookingId });

            if (result.downloadUrl) {
                // Open the LiveKit download URL in a new tab
                // LiveKit Cloud provides direct download URLs that handle the download automatically
                window.open(result.downloadUrl, '_blank');
            } else {
                alert('Recording download URL not available');
            }
        } catch (error) {
            console.error('Failed to download recording:', error);
            alert('Failed to download recording. Please try again.');
        } finally {
            setDownloadingRecording(null);
        }
    };

    const handleDebugAllRecordings = async () => {
        try {
            const result = await debugListAllRecordings();
            setDebugData({ type: 'all', data: result });
        } catch (error) {
            console.error('Failed to debug recordings:', error);
            setDebugData({ type: 'error', data: error });
        }
    };

    const handleDebugSpecificRecording = async (recordingId: string) => {
        try {
            const result = await debugGetRecordingDetails({ egressId: recordingId });
            setDebugData({ type: 'specific', data: result });
        } catch (error) {
            console.error('Failed to debug specific recording:', error);
            setDebugData({ type: 'error', data: error });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    if (!recordedSessions) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-accent text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={onBack}
                                className="mr-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold">Session Recordings</h1>
                                <p className="text-white/90 mt-1">Manage and upload your recorded sessions</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setDebugMode(!debugMode)}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            <i className="fas fa-bug mr-2"></i>
                            {debugMode ? 'Hide Debug' : 'Debug Mode'}
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Debug Panel */}
                    {debugMode && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Debug Panel</h3>
                            <div className="flex gap-4 mb-4">
                                <button
                                    onClick={handleDebugAllRecordings}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <i className="fas fa-list mr-2"></i>
                                    List All LiveKit Recordings
                                </button>
                            </div>

                            {debugData && (
                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Debug Results:</h4>
                                    <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-auto max-h-96">
                                        {JSON.stringify(debugData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {recordedSessions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-video text-2xl text-gray-400"></i>
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No recordings found</h3>
                            <p className="text-gray-600">
                                Your recorded live sessions will appear here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recordedSessions.map((session) => (
                                <div key={session._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <i className="fas fa-video text-blue-600"></i>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {session.sessionType === 'ONE_ON_ONE' ? '1-on-1 Session' : 'Group Event'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        with {session.isProvider ? session.client?.name : session.provider?.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                                <div>
                                                    <span className="text-gray-500">Date:</span>
                                                    <div className="font-medium">{formatDate(session.sessionDate)}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Time:</span>
                                                    <div className="font-medium">{formatTime(session.sessionTime)}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Duration:</span>
                                                    <div className="font-medium">{session.duration} min</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Status:</span>
                                                    <div className="font-medium">
                                                        {session.recordingUrl &&
                                                            !session.recordingUrl.startsWith('pending-') &&
                                                            !session.recordingUrl.startsWith('processing-') ? (
                                                            <span className="text-green-600">Available for Download</span>
                                                        ) : session.recordingUrl &&
                                                            (session.recordingUrl.startsWith('pending-') ||
                                                                session.recordingUrl.startsWith('processing-')) ? (
                                                            <span className="text-yellow-600">
                                                                {checkingStatus.has(session._id) ? 'Checking Status...' : 'Processing'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-500">No Recording</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {session.recordingUrl &&
                                                !session.recordingUrl.startsWith('pending-') &&
                                                !session.recordingUrl.startsWith('processing-') && (
                                                    <div className="mb-3">
                                                        <button
                                                            onClick={() => handleDownloadRecording(session._id)}
                                                            disabled={downloadingRecording === session._id}
                                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {downloadingRecording === session._id ? (
                                                                <>
                                                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                                                    Opening Download...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-download mr-1"></i>
                                                                    Download Recording
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}

                                            {session.recordingUrl &&
                                                (session.recordingUrl.startsWith('pending-') ||
                                                    session.recordingUrl.startsWith('processing-')) && (
                                                    <div className="mb-3">
                                                        <span className="text-yellow-600 text-sm flex items-center">
                                                            <i className={`${checkingStatus.has(session._id) ? 'fas fa-spinner fa-spin' : 'fas fa-clock'} mr-1`}></i>
                                                            {checkingStatus.has(session._id) ? 'Checking status...' : 'Recording processing...'}
                                                        </span>
                                                    </div>
                                                )}
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                            {session.recordingUrl &&
                                                !session.recordingUrl.startsWith('pending-') &&
                                                !session.recordingUrl.startsWith('processing-') && (
                                                    <button
                                                        onClick={() => handleDownloadRecording(session._id)}
                                                        disabled={downloadingRecording === session._id}
                                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {downloadingRecording === session._id ? (
                                                            <>
                                                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                                                Opening...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-download mr-1"></i>
                                                                Download
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                            {session.recordingUrl &&
                                                (session.recordingUrl.startsWith('pending-') ||
                                                    session.recordingUrl.startsWith('processing-')) && (
                                                    <button
                                                        disabled
                                                        className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm rounded-lg cursor-not-allowed"
                                                    >
                                                        <i className={`${checkingStatus.has(session._id) ? 'fas fa-spinner fa-spin' : 'fas fa-clock'} mr-1`}></i>
                                                        {checkingStatus.has(session._id) ? 'Checking...' : 'Processing...'}
                                                    </button>
                                                )}

                                            {!session.recordingUrl && (
                                                <button
                                                    disabled
                                                    className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg cursor-not-allowed"
                                                >
                                                    <i className="fas fa-times mr-1"></i>
                                                    No Recording
                                                </button>
                                            )}

                                            {/* Debug button for individual recordings */}
                                            {debugMode && session.recordingId && (
                                                <button
                                                    onClick={() => handleDebugSpecificRecording(session.recordingId!)}
                                                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                                >
                                                    <i className="fas fa-search mr-1"></i>
                                                    Debug Recording
                                                </button>
                                            )}

                                            {/* Show current recording URL in debug mode */}
                                            {debugMode && session.recordingUrl && (
                                                <div className="text-xs text-gray-600 break-all">
                                                    <strong>Current URL:</strong> {session.recordingUrl}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
}