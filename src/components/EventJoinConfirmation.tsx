import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { GatedContentPaywall } from './GatedContentPaywall';

interface EventJoinConfirmationProps {
    event: any; // Event with provider info from getEventById
    onConfirm: (bookingId: Id<"bookings">) => void;
    onCancel: () => void;
}

export function EventJoinConfirmation({ event, onConfirm, onCancel }: EventJoinConfirmationProps) {
    const [showPaywall, setShowPaywall] = useState(false);

    // Get provider avatar
    const avatarUrl = useQuery(
        api.files.getFileUrl,
        event.provider?.profile?.avatar ? { storageId: event.provider.profile.avatar } : "skip"
    );

    // Mutations
    const createEventBooking = useMutation(api.bookings.createEventBooking);

    const handlePaymentSuccess = async () => {
        try {
            const bookingId = await createEventBooking({
                eventId: event._id,
                paymentTxHash: "automated_payment"
            });

            onConfirm(bookingId);
        } catch (err) {
            console.error('Error creating event booking:', err);
            alert('Failed to join event. Please try again.');
        }
    };

    const handleProceedToPayment = () => {
        setShowPaywall(true);
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
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-accent text-white p-6">
                    <h1 className="text-2xl font-bold mb-2">Join Event</h1>
                    <p className="text-white/90">Review event details and complete payment</p>
                </div>

                <div className="p-6">
                    {/* Event Information */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h2>
                        <p className="text-gray-600 mb-4">{event.description}</p>

                        {/* Event Tags */}
                        {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {event.tags.map((tag: string, index: number) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Provider Information */}
                    <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <img
                            src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
                            alt={event.provider?.profile?.name || event.provider?.profile?.username}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                {event.provider?.profile?.name || event.provider?.profile?.username}
                            </h3>
                            <p className="text-gray-600">{event.provider?.subscription?.jobTitle}</p>
                            <p className="text-sm text-gray-500">{event.provider?.subscription?.specialization}</p>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Date</span>
                                <span className="font-medium">{formatDate(event.sessionDate)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Time</span>
                                <span className="font-medium">{formatTime(event.sessionTime)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Duration</span>
                                <span className="font-medium">{event.duration} minutes</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Available Spots</span>
                                <span className="font-medium">{event.availableSpots} remaining</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Max Participants</span>
                                <span className="font-medium">{event.maxParticipants} people</span>
                            </div>
                            <div className="flex justify-between items-center py-3 bg-accent/10 px-4 rounded-lg">
                                <span className="font-semibold text-gray-800">Price Per Person</span>
                                <span className="text-xl font-bold text-accent">${event.pricePerPerson}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    {showPaywall ? (
                        <GatedContentPaywall
                            contentType="booking"
                            title={event.title}
                            price={event.pricePerPerson}
                            token="USD"
                            sellerAddress={event.provider?.profile?.walletAddress}
                            onUnlock={handlePaymentSuccess}
                            onFundWallet={() => {
                                // Handle fund wallet navigation if needed
                                console.log('Fund wallet requested');
                            }}
                        />
                    ) : (
                        <>
                            {/* Event Benefits */}
                            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-800 mb-2">What You'll Get</h4>
                                <ul className="text-sm text-green-700 space-y-1">
                                    <li>• Access to the live event session</li>
                                    <li>• Opportunity to interact with the expert and other participants</li>
                                    <li>• Event materials and resources (if provided)</li>
                                    <li>• Automatic confirmation and event details</li>
                                    <li>• Ability to cancel up to 24 hours before the event</li>
                                </ul>
                            </div>

                            {/* Warning if event is filling up */}
                            {event.availableSpots <= 3 && event.availableSpots > 0 && (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center">
                                        <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                                        <span className="text-yellow-800 font-medium">
                                            Only {event.availableSpots} spot{event.availableSpots === 1 ? '' : 's'} remaining!
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleProceedToPayment}
                                    className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                                    disabled={event.availableSpots <= 0}
                                >
                                    {event.availableSpots <= 0 ? 'Event Full' : 'Proceed to Payment'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}