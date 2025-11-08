import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface EventManagementProps {
    onBack: () => void;
    onCreateEvent: () => void;
}

export function EventManagement({ onBack, onCreateEvent }: EventManagementProps) {
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Get provider's events
    const myEvents = useQuery(api.events.getProviderEvents, {});

    // Mutations
    const cancelEvent = useMutation(api.events.cancelEvent);
    const deleteEvent = useMutation(api.events.deleteEvent);

    const filteredEvents = myEvents?.filter(event =>
        statusFilter === 'all' || event.status.toLowerCase() === statusFilter
    ) || [];

    const handleCancelEvent = async (eventId: Id<"events">) => {
        try {
            await cancelEvent({
                eventId,
                reason: "Cancelled by provider"
            });
        } catch (error) {
            console.error('Error cancelling event:', error);
            alert('Failed to cancel event. Please try again.');
        }
    };

    const handleDeleteEvent = async (eventId: Id<"events">) => {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        try {
            const result = await deleteEvent({ eventId });
            console.log(`Event deleted successfully. ${result.deletedBookings} related bookings were also removed.`);
        } catch (error) {
            console.error('Error deleting event:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete event. Please try again.');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
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

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Header */}
            <div className="mb-8 lg:mb-12">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">My Events</h1>
                        <p className="text-lg text-gray-600 mt-2">Manage your group sessions</p>
                    </div>
                    <button
                        onClick={onCreateEvent}
                        className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors shadow-sm"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Create Event
                    </button>
                </div>
            </div>

            {/* Filter */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-filter mr-1"></i>
                            Filter by Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                        >
                            <option value="all">All Events</option>
                            <option value="active">Active</option>
                            <option value="full">Full</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">{filteredEvents.length}</span> events found
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                    {filteredEvents.map((event) => (
                        <div key={event._id} className="bg-white p-6 lg:p-8 rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1 mr-2">
                                    {event.title}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${event.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                    event.status === 'FULL' ? 'bg-blue-100 text-blue-800' :
                                        event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {event.status}
                                </span>
                            </div>

                            <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                                {event.description}
                            </p>

                            <div className="space-y-3 text-sm mb-6">
                                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <i className="fas fa-calendar mr-3 w-4 text-accent"></i>
                                    <span className="font-medium">{formatDate(event.sessionDate)}</span>
                                </div>
                                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <i className="fas fa-clock mr-3 w-4 text-accent"></i>
                                    <span className="font-medium">{formatTime(event.sessionTime)} ({event.duration} min)</span>
                                </div>
                                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <i className="fas fa-users mr-3 w-4 text-accent"></i>
                                    <span className="font-medium">{event.currentParticipants}/{event.maxParticipants} participants</span>
                                </div>
                                <div className="flex items-center text-accent font-bold bg-accent/5 p-3 rounded-lg">
                                    <i className="fas fa-dollar-sign mr-3 w-4"></i>
                                    <span>${event.pricePerPerson}/person</span>
                                </div>
                            </div>

                            {/* Tags */}
                            {event.tags && event.tags.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-1">
                                        {event.tags.slice(0, 3).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {event.tags.length > 3 && (
                                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                +{event.tags.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Bookings</span>
                                    <span>{event.currentParticipants}/{event.maxParticipants}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-accent h-2 rounded-full"
                                        style={{
                                            width: `${(event.currentParticipants / event.maxParticipants) * 100}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between pt-4 border-t">
                                <div className="flex space-x-3">
                                    <button
                                        className="text-accent hover:text-accent/80 text-sm font-medium"
                                        onClick={() => {
                                            // TODO: Implement edit functionality
                                            console.log('Edit event:', event._id);
                                        }}
                                    >
                                        <i className="fas fa-edit mr-1"></i>
                                        Edit
                                    </button>

                                    <button
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        onClick={() => handleDeleteEvent(event._id)}
                                        title="Permanently delete this event"
                                    >
                                        <i className="fas fa-trash mr-1"></i>
                                        Delete
                                    </button>
                                </div>

                                {event.status === 'ACTIVE' && (
                                    <button
                                        className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                                        onClick={() => handleCancelEvent(event._id)}
                                        title="Cancel event but keep it in history"
                                    >
                                        <i className="fas fa-times mr-1"></i>
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {/* Revenue Info */}
                            <div className="mt-4 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Potential Revenue:</span>
                                    <span className="font-medium text-gray-800">
                                        ${(event.currentParticipants * event.pricePerPerson).toFixed(2)} / ${(event.maxParticipants * event.pricePerPerson).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No events found</h3>
                    <p className="text-gray-600 mb-6">
                        {statusFilter === 'all'
                            ? "You haven't created any events yet. Start by creating your first group session!"
                            : `No events with status "${statusFilter}"`
                        }
                    </p>
                    {statusFilter === 'all' && (
                        <button
                            onClick={onCreateEvent}
                            className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90"
                        >
                            Create Your First Event
                        </button>
                    )}
                </div>
            )}

            {/* Summary Stats */}
            {filteredEvents.length > 0 && (
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm text-center hover:shadow-md transition-shadow">
                        <div className="text-3xl font-bold text-gray-800 mb-2">{myEvents?.length || 0}</div>
                        <div className="text-sm font-medium text-gray-600">Total Events</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm text-center hover:shadow-md transition-shadow">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {myEvents?.filter(e => e.status === 'ACTIVE').length || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Active Events</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm text-center hover:shadow-md transition-shadow">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {myEvents?.reduce((sum, e) => sum + e.currentParticipants, 0) || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Total Participants</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm text-center hover:shadow-md transition-shadow">
                        <div className="text-3xl font-bold text-accent mb-2">
                            ${myEvents?.reduce((sum, e) => sum + (e.currentParticipants * e.pricePerPerson), 0).toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                    </div>
                </div>
            )}
        </div>
    );
}