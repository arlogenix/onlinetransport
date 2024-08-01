export interface PricingItem {
    pricing_id: number;
    amount: string;
    currency: string;
    duration: string;
    ticket_type: string;
}

export interface Departure {
    schedule_id: number;
    amount: number;
    currency: string;
    departureTime: string;
    noStops: number;
    provider: string;
    pricing: PricingItem[];
}

export interface ScheduleResponse {
    header: string;
    answer: string;
    buttons: any[];
    data: {
        card: {
            card: string;
            payment_method: string;
            payment_url: string;
        };
        departure: Departure[];
        return?: Departure[]; // Make return optional
        header: {
            depart_date: string;
            depart_trip_count: number;
            depart_trip_id: string;
            destination_station: string;
            is_returning: string;
            passenger_info: any;
            pickup_station: string;
            return_date: string;
            return_trip_count: number;
            return_trip_id: string | null;
        };
    };
    footer: string;
}

export function isScheduleResponse(data: any, hasReturn: boolean): data is ScheduleResponse {
    const isValid = data && typeof data === 'object' &&
        'header' in data && typeof data.header === 'string' &&
        'answer' in data && typeof data.answer === 'string' &&
        'buttons' in data && Array.isArray(data.buttons) &&
        'data' in data && typeof data.data === 'object' &&
        'card' in data.data && typeof data.data.card === 'object' &&
        'card' in data.data.card && typeof data.data.card.card === 'string' &&
        'payment_method' in data.data.card && typeof data.data.card.payment_method === 'string' &&
        'payment_url' in data.data.card && typeof data.data.card.payment_url === 'string' &&
        'departure' in data.data && Array.isArray(data.data.departure) &&
        (!hasReturn || ('return' in data.data && Array.isArray(data.data.return))) && // Only check return if hasReturn is true
        'header' in data.data && typeof data.data.header === 'object' &&
        'depart_date' in data.data.header && typeof data.data.header.depart_date === 'string' &&
        'depart_trip_count' in data.data.header && typeof data.data.header.depart_trip_count === 'number' &&
        'depart_trip_id' in data.data.header && typeof data.data.header.depart_trip_id === 'string' &&
        'destination_station' in data.data.header && typeof data.data.header.destination_station === 'string' &&
        'is_returning' in data.data.header && typeof data.data.header.is_returning === 'string' &&
        'passenger_info' in data.data.header && typeof data.data.header.passenger_info === 'object' &&
        'pickup_station' in data.data.header && typeof data.data.header.pickup_station === 'string' &&
        'return_date' in data.data.header && typeof data.data.header.return_date === 'string' &&
        'return_trip_count' in data.data.header && typeof data.data.header.return_trip_count === 'number' &&
        ('return_trip_id' in data.data.header && (typeof data.data.header.return_trip_id === 'string' || data.data.header.return_trip_id === null)) &&
        'footer' in data && typeof data.footer === 'string';

    if (!isValid) {
        console.error("Invalid askResponse structure", JSON.stringify(data, null, 2));
        console.error({
            hasHeader: 'header' in data && typeof data.header === 'string',
            hasAnswer: 'answer' in data && typeof data.answer === 'string',
            hasButtons: 'buttons' in data && Array.isArray(data.buttons),
            hasData: 'data' in data && typeof data.data === 'object',
            hasCard: 'card' in data.data && typeof data.data.card === 'object',
            hasCardCard: 'card' in data.data.card && typeof data.data.card.card === 'string',
            hasPaymentMethod: 'payment_method' in data.data.card && typeof data.data.card.payment_method === 'string',
            hasPaymentUrl: 'payment_url' in data.data.card && typeof data.data.card.payment_url === 'string',
            hasDeparture: 'departure' in data.data && Array.isArray(data.data.departure),
            hasReturn: !hasReturn || ('return' in data.data && Array.isArray(data.data.return)),
            hasHeaderInData: 'header' in data.data && typeof data.data.header === 'object',
            hasDepartDate: 'depart_date' in data.data.header && typeof data.data.header.depart_date === 'string',
            hasDepartTripCount: 'depart_trip_count' in data.data.header && typeof data.data.header.depart_trip_count === 'number',
            hasDepartTripId: 'depart_trip_id' in data.data.header && typeof data.data.header.depart_trip_id === 'string',
            hasDestinationStation: 'destination_station' in data.data.header && typeof data.data.header.destination_station === 'string',
            hasIsReturning: 'is_returning' in data.data.header && typeof data.data.header.is_returning === 'string',
            hasPassengerInfo: 'passenger_info' in data.data.header && typeof data.data.header.passenger_info === 'object',
            hasPickupStation: 'pickup_station' in data.data.header && typeof data.data.header.pickup_station === 'string',
            hasReturnDate: 'return_date' in data.data.header && typeof data.data.header.return_date === 'string',
            hasReturnTripCount: 'return_trip_count' in data.data.header && typeof data.data.header.return_trip_count === 'number',
            hasReturnTripId: 'return_trip_id' in data.data.header && (typeof data.data.header.return_trip_id === 'string' || data.data.header.return_trip_id === null),
            hasFooter: 'footer' in data && typeof data.footer === 'string'
        });
    }

    return isValid;
}

// Helper function to transform schedule data
export function transformScheduleData(schedules: any[]): Departure[] {
    return schedules.flatMap(schedule => {
        if (schedule.schedule) {
            return schedule.schedule.flatMap((scheduleItem: any) => {
                if (scheduleItem.body) {
                    return scheduleItem.body.map((bodyItem: any) => ({
                        schedule_id: bodyItem.schedule_id,
                        amount: bodyItem.amount,
                        currency: bodyItem.currency,
                        departureTime: bodyItem.departureTime,
                        noStops: bodyItem.noStops,
                        provider: bodyItem.provider,
                        pricing: bodyItem.pricing.map((pricingItem: any) => ({
                            pricing_id: pricingItem.pricing_id,
                            amount: pricingItem.amount,
                            currency: pricingItem.currency,
                            duration: pricingItem.duration,
                            ticket_type: pricingItem.ticket_type
                        }))
                    }));
                } else {
                    console.error("Missing body data in schedule item", scheduleItem);
                    return [];
                }
            });
        } else {
            console.error("Missing schedule data in schedule", schedule);
            return [];
        }
    });
}
