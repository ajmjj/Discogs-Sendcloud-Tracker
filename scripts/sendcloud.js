import { privateKey, publicKey } from "../secrets.js";

async function getSendcloudTracking (trackingNumber) {
    const baseUrl = 'https://panel.sendcloud.sc/api/v2/tracking/';
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(publicKey + ':' + privateKey)}`,
        }
    }
    let response = await fetch(baseUrl + trackingNumber, options);
    // console.log(response); //debug
    
    // Success
    if (response.status === 200) {
        console.log('GET Sendcloud Tracking succeeded');
        const data = await response.json();
        // console.log(data); //debug

        return data;
    }
    // Error 401: Unauthorized
    if (response.status == 401) {
        console.log('GET Sendcloud Tracking failed: 401 - Unauthorized');
        return false
    }
    // Error 404: Tracking number not found
    if (response.status == 404) {
        console.log('GET Sendcloud Tracking failed: 404 - Tracking number not found');
        return false
    }
    // Error 429: Too many requests
    if (response.status == 429) {
        console.log('GET Sendcloud Tracking failed: 429 - Too many requests');
        return false
    }
};

function updateOrderTracking (order, trackingResult) {
    order.carrier = order.carrier || trackingResult.carrier_code;
    order.trackingNumber = order.trackingNumber || trackingResult.number;
    order.status = trackingResult.statuses.pop().carrier_message;
    order.expectedDelivery = trackingResult.expected_delivery_date;
    order.carrierTrackingUrl = trackingResult.carrier_tracking_url;
    return order;
}

function updateOrderStatus (order, trackingResult) {
    order.status = trackingResult.statuses.pop().carrier_message;
    order.expectedDelivery = trackingResult.expected_delivery_date;
    return order;
}


export { 
    getSendcloudTracking, 
    updateOrderTracking,
    updateOrderStatus
};