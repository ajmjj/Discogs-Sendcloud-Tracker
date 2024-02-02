import { 
    getSendcloudTracking,
    updateSendcloudOrder
} from "./sendcloud.js";

import { updateOrderFromDHLAPI } from "./dhl.js";

const dpdStatusMap = {
    'At customs': 'At customs',
    'Cancellation request': 'Cancelled',
    'Cancelled': 'Cancelled',
    'Cancelled upstream': 'Cancelled',
    'Submitting cancellation request': 'Cancelled',
    'Announced': 'Pre-Transit',
    'Announced: not collected': 'Pre-Transit',
    'Being announced': 'Pre-Transit',
    'Ready to send': 'Pre-Transit',
    'Delivery delayed': 'Delayed',
    'Awaiting customer pickup': 'Delivered',
    'Delivered': 'Delivered',
    'Shipment collected by customer': 'Delivered',
    'At sorting centre': 'In Transit',
    'Being sorted': 'In Transit',
    'Delivery address changed': 'In Transit',
    'Delivery date changed': 'In Transit',
    'Delivery method changed': 'In Transit',
    'Driver en route': 'In Transit',
    'En route to sorting center': 'In Transit',
    'Not sorted': 'In Transit',
    'Parcel en route': 'In Transit',
    'Shipment picked up by driver': 'In Transit',
    'Sorted': 'In Transit',
    'Address invalid': 'Problem',
    'Announcement failed': 'Problem',
    'Delivery attempt failed': 'Problem',
    'Error collecting': 'Problem',
    'Exception': 'Problem',
    'No label': 'Problem',
    'Refused by recipient': 'Problem',
    'Returned to sender': 'Problem',
    'Return payment failed': 'Problem',
    'Unable to deliver': 'Problem',
    'Waiting for the return payment': 'Problem'
};

const dhlStatusMap = {
    'delivered': 'Delivered',
    'transit': 'In Transit',
    'failure': 'Problem',
    'pre-transit': 'Pre-Transit',
    'unknown': 'Unknown',
}
    

function normaliseTracking(carrier, status) {
    switch (carrier.toLowerCase()) {
        case 'dpd':
            return dpdStatusMap[status] || status;
        case 'DHL Germany':
            return dhlStatusMap[status] || status;
        default:
            console.log(`Carrier ${carrier} not implemented yet`);
            return status;
    }
}

// Updates order tracking info 
async function updateOrderTracking (order) {
    switch (order.carrier) {
        case 'dpd':
            return await updateOrderFromSendcloud(order);
        case 'DHL Germany':
            console.log("Get tracking info from DHL Germany API");
            return await updateOrderFromDHLAPI(order);
        case null:
            console.log("No carrier specified, attempting to get tracking info from Sendcloud API");
            return await updateOrderFromSendcloud(order);
        default:
            console.log("Carrier not implemented yet");
    }
}

async function updateOrderFromSendcloud (order) {
    const tracking = order.trackingNumber;
    if (!tracking) {
        return;
    }
    const trackingResult = await getSendcloudTracking(order.trackingNumber);
    if (trackingResult) {
        order = updateSendcloudOrder(order, trackingResult);
        // console.log("Tracking result added to order:", order); //debug
        return order;
    } else {
        // console.log("No tracking result from Sendcloud API for order:", order); //debug
        return order; // Return original order if no tracking result
    }
}


export {
    normaliseTracking,
    updateOrderTracking,
}