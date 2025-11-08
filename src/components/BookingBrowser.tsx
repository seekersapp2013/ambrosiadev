import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';



interface BookingBrowserProps {
    onBack?: () => void;
}

export function BookingBrowser({ onBack }: BookingBrowserProps) {

    const [filters, setFilters] = useState({
        specialization: '',
        jobTitle: '',
        minPrice: '',
        maxPrice: '',
        searchTerm: ''
    });

    // Get providers for 1-on-1 sessions
    const providers = useQuery(api.bookingSubscribers.getProvidersWithPagination, {
        specialization: filters.specialization || undefined,
        jobTitle: filters.jobTitle || undefined,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        searchTerm: filters.searchTerm || undefined,
        limit: 20
    });

    // Get public events for group sessions
    const events = useQuery(api.events.getPublicEvents, {
        limit: 20,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined
    });

    // Debug logging
    console.log('Events query result:', events);
    console.log('Current filters:', filters);

    // Get filter options
    const specializations = useQuery(api.bookingSubscribers.getSpecializations);
    const jobTitles = useQuery(api.bookingSubscribers.getJobTitles);

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Header */}
            <div className="mb-8 lg:mb-12">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Back
                    </button>
                )}
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Find Expert Sessions</h1>
                    <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">Book 1-on-1 sessions or join group events with industry experts</p>
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="flex justify-center mb-8 lg:mb-12">
                <div className="bg-white p-2 rounded-xl shadow-sm border">
                    <button
                        onClick={() => {
                            const providersSection = document.getElementById('providers-section');
                            providersSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-accent hover:bg-accent/5"
                    >
                        <i className="fas fa-user-tie mr-2"></i>
                        <span className="hidden sm:inline">Browse 1-on-1 Sessions</span>
                        <span className="sm:hidden">1-on-1</span>
                    </button>
                    <button
                        onClick={() => {
                            const eventsSection = document.getElementById('events-section');
                            eventsSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-accent hover:bg-accent/5"
                    >
                        <i className="fas fa-users mr-2"></i>
                        <span className="hidden sm:inline">Browse Group Events</span>
                        <span className="sm:hidden">Groups</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 lg:p-8 rounded-xl border shadow-sm mb-8 lg:mb-12">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Filter & Search</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-search mr-1"></i>
                            Search
                        </label>
                        <input
                            type="text"
                            value={filters.searchTerm}
                            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                            placeholder="Search experts..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-star mr-1"></i>
                            Specialization
                        </label>
                        <select
                            value={filters.specialization}
                            onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                        >
                            <option value="">All Specializations</option>
                            {specializations?.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-briefcase mr-1"></i>
                            Job Title
                        </label>
                        <select
                            value={filters.jobTitle}
                            onChange={(e) => setFilters(prev => ({ ...prev, jobTitle: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                        >
                            <option value="">All Job Titles</option>
                            {jobTitles?.map(title => (
                                <option key={title} value={title}>{title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-dollar-sign mr-1"></i>
                            Min Price ($)
                        </label>
                        <input
                            type="number"
                            value={filters.minPrice}
                            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-dollar-sign mr-1"></i>
                            Max Price ($)
                        </label>
                        <input
                            type="number"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                            placeholder="1000"
                        />
                    </div>
                </div>
            </div>

            {/* Providers Section */}
            <div id="providers-section" className="mb-16 lg:mb-24">
                <ProvidersGrid providers={providers?.providers || []} />
            </div>

            {/* Section Divider */}
            <div className="flex items-center justify-center mb-16 lg:mb-24">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <div className="px-6">
                    <div className="bg-white px-6 py-3 rounded-full border shadow-sm">
                        <span className="text-gray-600 font-medium">
                            <i className="fas fa-arrow-down mr-2"></i>
                            Also Available: Group Events
                        </span>
                    </div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Events Section */}
            <div id="events-section">
                <EventsGrid events={events?.events || []} />
            </div>
        </div>
    );
}

// Providers Grid Component
function ProvidersGrid({ providers }: { providers: any[] }) {
    const [selectedProvider, setSelectedProvider] = useState<Id<"users"> | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    const handleBookProvider = (providerId: Id<"users">) => {
        setSelectedProvider(providerId);
        setShowBookingModal(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
                    Available Experts
                    <span className="ml-2 text-lg font-normal text-gray-500">({providers.length})</span>
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <i className="fas fa-info-circle"></i>
                    <span>Click to view details or book sessions</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {providers.map((item) => {
                    const provider = item.subscriber;
                    const profile = item.profile;

                    return (
                        <div key={provider._id} className="bg-white p-8 rounded-xl border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-h-[400px] flex flex-col">
                            <div className="flex items-start space-x-4 mb-6">
                                <img
                                    src="https://randomuser.me/api/portraits/women/44.jpg"
                                    alt={profile?.name || profile?.username}
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 text-lg truncate">
                                        {profile?.name || profile?.username || 'Expert'}
                                    </h3>
                                    <p className="text-sm text-gray-600 font-medium">{provider.jobTitle}</p>
                                    <p className="text-sm text-accent font-medium">{provider.specialization}</p>
                                </div>
                            </div>

                            <div className="flex-1">
                                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                                    {provider.aboutUser}
                                </p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                                        <span className="text-gray-600 font-medium">1-on-1 Session:</span>
                                        <span className="font-bold text-gray-800">
                                            ${(provider as any).oneOnOnePrice || provider.sessionPrice}/hr
                                        </span>
                                    </div>
                                    {(provider as any).groupSessionPrice && (
                                        <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                                            <span className="text-gray-600 font-medium">Group Session:</span>
                                            <span className="font-bold text-gray-800">
                                                ${(provider as any).groupSessionPrice}/person/hr
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex space-x-3 mb-4 mt-auto">
                                <button
                                    onClick={() => handleBookProvider(provider._id as Id<"users">)}
                                    className="flex-1 bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent/90 transition-colors shadow-sm"
                                >
                                    <i className="fas fa-calendar-plus mr-2"></i>
                                    Book 1-on-1
                                </button>
                                <button className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                    <i className="fas fa-eye"></i>
                                </button>
                            </div>

                            {/* Social Links */}
                            {(provider.xLink || provider.linkedInLink) && (
                                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                    {provider.xLink && (
                                        <a
                                            href={provider.xLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-lg"
                                        >
                                            <i className="fab fa-x-twitter text-lg"></i>
                                        </a>
                                    )}
                                    {provider.linkedInLink && (
                                        <a
                                            href={provider.linkedInLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-gray-50 rounded-lg"
                                        >
                                            <i className="fab fa-linkedin text-lg"></i>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {providers.length === 0 && (
                <div className="text-center py-16 lg:py-24">
                    <i className="fas fa-search text-6xl text-gray-300 mb-6"></i>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No experts found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Try adjusting your search criteria or browse all available experts</p>
                </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && selectedProvider && (
                <BookingModal
                    providerId={selectedProvider}
                    provider={providers.find(p => p.subscriber._id === selectedProvider)}
                    onClose={() => {
                        setShowBookingModal(false);
                        setSelectedProvider(null);
                    }}
                />
            )}
        </div>
    );
}

// Events Grid Component
function EventsGrid({ events }: { events: any[] }) {
    console.log('EventsGrid received events:', events);
    const [bookingEvent, setBookingEvent] = useState<Id<"events"> | null>(null);
    const createEventBooking = useMutation(api.bookings.createEventBooking);

    const handleJoinEvent = async (eventId: Id<"events">) => {
        try {
            setBookingEvent(eventId);
            await createEventBooking({ eventId });
            alert('Successfully registered for the event! Check your bookings for confirmation details.');
        } catch (error: any) {
            alert(`Failed to register for event: ${error.message}`);
        } finally {
            setBookingEvent(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
                    Upcoming Group Events
                    <span className="ml-2 text-lg font-normal text-gray-500">({events.length})</span>
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <i className="fas fa-info-circle"></i>
                    <span>Join group sessions with multiple participants</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {events.map((event) => (
                    <div key={event._id} className="bg-white p-8 rounded-xl border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-h-[450px] flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1 mr-2">{event.title}</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${event.availableSpots > 5 ? 'bg-green-100 text-green-800' :
                                event.availableSpots > 0 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {event.availableSpots > 0 ? `${event.availableSpots} spots left` : 'Full'}
                            </span>
                        </div>

                        <div className="flex-1">
                            <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                                {event.description}
                            </p>

                            {/* Event Details */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <i className="fas fa-calendar mr-3 w-4 text-accent"></i>
                                    <span className="text-sm font-medium">{event.sessionDate} at {event.sessionTime}</span>
                                </div>
                                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <i className="fas fa-clock mr-3 w-4 text-accent"></i>
                                    <span className="text-sm font-medium">{event.duration} minutes</span>
                                </div>
                                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <i className="fas fa-users mr-3 w-4 text-accent"></i>
                                    <span className="text-sm font-medium">{event.currentParticipants}/{event.maxParticipants} participants</span>
                                </div>
                                <div className="flex items-center text-accent font-bold bg-accent/5 p-3 rounded-lg">
                                    <i className="fas fa-dollar-sign mr-3 w-4"></i>
                                    <span className="text-sm">${event.pricePerPerson}/person</span>
                                </div>
                            </div>

                            {/* Host Info */}
                            <div className="flex items-center space-x-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                                <img
                                    src="https://randomuser.me/api/portraits/women/44.jpg"
                                    alt={event.provider?.profile?.name}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">
                                        {event.provider?.profile?.name || event.provider?.profile?.username || 'Expert'}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                        {event.provider?.subscription?.jobTitle}
                                    </p>
                                </div>
                            </div>

                            {/* Tags */}
                            {event.tags && event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {event.tags.slice(0, 3).map((tag: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {event.tags.length > 3 && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                            +{event.tags.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3 mt-auto">
                            <button
                                onClick={() => handleJoinEvent(event._id)}
                                disabled={event.availableSpots === 0 || bookingEvent === event._id}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all shadow-sm ${event.availableSpots === 0
                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                    : bookingEvent === event._id
                                        ? 'bg-accent/70 text-white cursor-not-allowed'
                                        : 'bg-accent text-white hover:bg-accent/90 hover:shadow-md'
                                    }`}
                            >
                                <i className={`mr-2 ${event.availableSpots === 0 ? 'fas fa-ban' : bookingEvent === event._id ? 'fas fa-spinner fa-spin' : 'fas fa-user-plus'}`}></i>
                                {event.availableSpots === 0 ? 'Full' : bookingEvent === event._id ? 'Joining...' : 'Join Event'}
                            </button>
                            <button className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                <i className="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {events.length === 0 && (
                <div className="text-center py-16 lg:py-24">
                    <i className="fas fa-calendar-times text-6xl text-gray-300 mb-6"></i>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No upcoming events</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Check back later for new group sessions or try adjusting your filters</p>
                </div>
            )}
        </div>
    );
}

// Booking Modal Component
function BookingModal({ providerId, provider, onClose }: {
    providerId: Id<"users">;
    provider: any;
    onClose: () => void;
}) {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [duration, setDuration] = useState(60);
    const [isBooking, setIsBooking] = useState(false);

    const createBooking = useMutation(api.bookings.createBooking);

    // Get next 7 days for date selection
    const getNextSevenDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 1; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                })
            });
        }
        return days;
    };

    // Generate time slots (9 AM to 5 PM)
    const getTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 17; hour++) {
            slots.push({
                value: `${hour.toString().padStart(2, '0')}:00`,
                label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
            });
        }
        return slots;
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime) {
            alert('Please select both date and time');
            return;
        }

        try {
            setIsBooking(true);
            await createBooking({
                providerId,
                sessionDate: selectedDate,
                sessionTime: selectedTime,
                duration
            });
            alert('Booking request submitted successfully! You will receive a confirmation shortly.');
            onClose();
        } catch (error: any) {
            alert(`Failed to create booking: ${error.message}`);
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Book 1-on-1 Session</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    {/* Provider Info */}
                    <div className="flex items-center space-x-3 mb-6 p-4 bg-gray-50 rounded-lg">
                        <img
                            src="https://randomuser.me/api/portraits/women/44.jpg"
                            alt={provider?.profile?.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <h4 className="font-semibold text-gray-800">
                                {provider?.profile?.name || provider?.profile?.username || 'Expert'}
                            </h4>
                            <p className="text-sm text-gray-600">{provider?.subscriber?.jobTitle}</p>
                            <p className="text-sm font-medium text-accent">
                                ${provider?.subscriber?.oneOnOnePrice || provider?.subscriber?.sessionPrice}/hr
                            </p>
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Date
                        </label>
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                            <option value="">Choose a date</option>
                            {getNextSevenDays().map(day => (
                                <option key={day.value} value={day.value}>{day.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Time Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Time
                        </label>
                        <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                            <option value="">Choose a time</option>
                            {getTimeSlots().map(slot => (
                                <option key={slot.value} value={slot.value}>{slot.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Duration Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration
                        </label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={90}>1.5 hours</option>
                            <option value={120}>2 hours</option>
                        </select>
                    </div>

                    {/* Total Cost */}
                    {selectedDate && selectedTime && (
                        <div className="mb-6 p-4 bg-accent/5 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Total Cost:</span>
                                <span className="text-xl font-bold text-accent">
                                    ${((duration / 60) * (provider?.subscriber?.oneOnOnePrice || provider?.subscriber?.sessionPrice)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBooking}
                            disabled={!selectedDate || !selectedTime || isBooking}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${!selectedDate || !selectedTime || isBooking
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-accent text-white hover:bg-accent/90'
                                }`}
                        >
                            {isBooking ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Booking...
                                </>
                            ) : (
                                'Book Session'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}