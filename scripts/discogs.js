import { discogsToken } from "../secrets.js";

const baseUrl = 'https://api.discogs.com/marketplace';

async function getSingleOrderFromDiscogs (releaseId) {
    const options = {
        method: 'GET',
        headers: {'Authorization': `Discogs token=${discogsToken}`}
    }
    const resource = `/orders/${releaseId}`;
    let response = await fetch(baseUrl + resource, options);
    // console.log(response);
    
    // Success
    if (response.status === 200) {
        console.log('GET Discogs Order succeeded');
        const data = await response.json();
        // console.log(data); //debug
        let order = {
            orderId : data.id,
            carrier : data.tracking.carrier,
            trackingNumber : data.tracking.number,
            status : null,
            expectedDelivery : null,
            carrierTrackingUrl : null,
        }
        return order;
    }
    // Error 401: Invalid Discogs token
    if (response.status == 401) {
        console.log('GET Discogs Order failed: 401 - Invalid Discogs token');
        return false
    }
    // Error 404: Order not found
    if (response.status == 404) {
        console.log('GET Discogs Order failed: 404 - Order not found');
        return false
    }
    // Error 429: Too many requests
    if (response.status == 429) {
        console.log('GET Discogs Order failed: 429 - Too many requests');
        return false
    }
}

export { getSingleOrderFromDiscogs };