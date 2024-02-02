import { dhlApiKey } from "../secrets.js";


async function getDHLTracking (trackingNumber) {
    const DHL_BASE_URL = "https://api-eu.dhl.com/track/shipments?trackingNumber="
    const options = {method: 'GET', headers: {'DHL-API-Key': `${dhlApiKey}`}};
    
    const response = await fetch(DHL_BASE_URL + trackingNumber, options);
    if (response.status === 200) {
        console.log('GET DHL Tracking succeeded');
        const data = await response.json();
        console.log(data); //debug
        return data.shipments[0];
    } else if (response.status === 401) {
        console.log('GET DHL Tracking failed: 401 - Unauthorized');
        return false
    } else if (response.status === 404) {
        console.log('GET DHL Tracking failed: 404 - Order not found');
        return false
    } else if (response.status === 429) {
        console.log('GET DHL Tracking failed: 429 - Too many requests');
        return false
    } else {
        console.log('GET DHL Tracking failed: ' + response.status);
        return false
    }
}

function updateDHLOrder (order, trackingResult) {
    console.log(trackingResult)
    order.carrier = order.carrier || "DHL Germany";
    order.trackingNumber = order.trackingNumber;
    order.status = trackingResult.status.statusCode;
    order.message = trackingResult.status.statusDescription;
    order.expectedDelivery = trackingResult.status.estimatedTimeOfDelivery;
    order.carrierTrackingUrl = trackingResult.serviceUrl;
    return order;
}


async function updateOrderFromDHLAPI (order) {
    const tracking = order.trackingNumber;
    if (!tracking) {
        return;
    }
    const trackingResult = await getDHLTracking(order.trackingNumber);
    if (trackingResult) {
        order = updateDHLOrder(order, trackingResult);
        console.log("DHL Tracking result added to order:", order); //debug
    }
    console.log("No tracking result from DHL API for order:", order); //debug
    return order; // Return original order if no tracking result
}

export {
    updateOrderFromDHLAPI
}