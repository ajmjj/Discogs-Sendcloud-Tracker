import { getSingleOrderFromDiscogs } from "./scripts/discogs.js";
import { 
    addOrderToStorage,
    getSingleOrderFromStorage
} from "./scripts/storage.js";
import { 
    getSendcloudTracking, 
    updateOrderTracking 
} from "./scripts/sendcloud.js";


// Listener for single order page
chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "singleOrder");
    port.onMessage.addListener(function(msg) {
        if (msg.title === "orderIdFromDiscogs") {
            // console.log("Received message:", msg); //debug
            const orderId = msg.orderId;
            (async () => {
                // Check if order is already in storage
                const orderFromStorage = await getSingleOrderFromStorage(orderId);
                // console.log("Order fetched from storage:", orderFromStorage); //debug

                /*  If order not in storage: get order from Discogs API, 
                    call sendcloud API and add tracking result to storage       */
                if (!orderFromStorage) {
                    // Get order from discogs API
                    let order = await getSingleOrderFromDiscogs(orderId);
                    // console.log("Order fetched from Discogs API:", order); //debug

                    // Call sendcloud API with tracking number
                    const trackingResult = await getSendcloudTracking(order.trackingNumber);
                    // console.log("Tracking result from Sendcloud API:", trackingResult); //debug

                    if (trackingResult) { 
                        // Add tracking result to order
                        order = updateOrderTracking(order, trackingResult);
                        // console.log("Tracking result added to order:", order); //debug
                        // Add order to storage
                        let added = await addOrderToStorage(order, trackingResult);
                        if (added) {
                            const message = {title: "orderFromStorage", order: order};
                            // console.log("Sending message:", message); //debug
                            port.postMessage(message);
                        // } else {
                        //     console.log("Error adding order to storage");
                        //     const message = {title: "failedToAddOrder", order: order};
                        //     console.log("Sending message:", message); //debug
                        }
                        
                    } else {
                        console.log("Error getting tracking result from Sendcloud API");
                    }
                } else {
                    // console.log("Order already in storage:", orderFromStorage); //debug
                    const message = {title: "orderFromStorage", order: orderFromStorage};
                    // console.log("Sending message:", message); //debug
                    port.postMessage(message);
                }
            })();
        }
    });
});


// if (location === 'singleOrder'){

    
//     } else {
//         // If order in storage, check if status is delivered
//         let status = getStatusFromOrder(order);
//         if (status === 'delivered') {
//             // If status is delivered, show tracking status on page
//             showTrackingStatusOnPage(order);
//         } else {
//             // If status is not delivered, call sendcloud API
//             trackingResult = await getSendcloudTracking(orderId);
//             // Add tracking result to storage
//             await addTrackingToStorage(orderId, trackingResult);
//             // Show tracking status on page
//             showTrackingStatusOnPage(order);
//         }
//     }
// } else if (location === 'allOrders') {

// }