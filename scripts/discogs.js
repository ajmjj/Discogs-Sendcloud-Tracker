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
            message: null,
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

async function getAllDiscogsOrders (sort) {
    const options = {
        method: 'GET',
        headers: {'Authorization': `Discogs token=${discogsToken}`}
    }

    const resource = `/orders?archived=false&status=Shipped&sort=${sort.sort}&sort_order=${sort.sort_order}`;
    let response = await fetch(baseUrl + resource, options);
    console.log(response); //debug

    // Success
    if (response.status === 200) {
        console.log('GET Discogs Order succeeded');
        const data = await response.json();
        console.log(data); //debug
        let ordersFromDiscogs = [];
        for (const item of data.orders) {
            let order = {
                orderId : item.id,
                carrier : item.tracking.carrier,
                trackingNumber : item.tracking.number,
                status : null,
                expectedDelivery : null,
                carrierTrackingUrl : null,
            }
            ordersFromDiscogs.push(order);
        }
        console.log(ordersFromDiscogs); //debug
        return ordersFromDiscogs;
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

async function getCurrentPageDiscogsOrders (sort, page, perPage) {
    if (perPage > 100) {
        perPage = 100;
        console.log("Pagination max is 100");
    }
    const options = {
        method: 'GET',
        headers: {'Authorization': `Discogs token=${discogsToken}`}
    }

    const resource = `/orders?archived=false&status=Shipped&sort=${sort.sort}&sort_order=${sort.sort_order}&page=${page}&per_page=${perPage}`;
    let response = await fetch(baseUrl + resource, options);
    console.log(response); //debug

    // Success
    if (response.status === 200) {
        console.log('GET Discogs Order succeeded');
        const data = await response.json();
        console.log(data); //debug
        let ordersFromDiscogs = [];
        for (const item of data.orders) {
            let order = {
                orderId : item.id,
                carrier : item.tracking.carrier,
                trackingNumber : item.tracking.number,
                status : null,
                expectedDelivery : null,
                carrierTrackingUrl : null,
            }
            ordersFromDiscogs.push(order);
        }
        console.log(ordersFromDiscogs); //debug
        return ordersFromDiscogs;
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

export { 
    getSingleOrderFromDiscogs,
    getAllDiscogsOrders,
};