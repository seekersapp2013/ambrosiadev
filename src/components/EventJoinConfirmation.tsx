import { useState } from 'react';
import { Id } from '../../convex/_generated/dataModel';
import { EventPaymentFlow } from './EventPaymentFlow';

interface EventJoinConfirmationProps {
    event: any; // Event with provider info from getEventById
    onConfirm: (bookingId: Id<"bookings">) => void;
    onCancel: () => void;
}

export function EventJoinConfirmation({ event, onConfirm, onCancel }: EventJoinConfirmationProps) {
    return (
        <EventPaymentFlow
            event={event}
            onSuccess={onConfirm}
            onCancel={onCancel}
        />
    );
}