import { 
    getSingleOrderFromDiscogs,
    getAllDiscogsOrders,
} from "./scripts/discogs.js";

import { 
    addOrderToStorage,
    getSingleOrderFromStorage,
    getAllOrdersFromStorage,
} from "./scripts/storage.js";

import { 
    getSendcloudTracking, 
    updateOrderTracking,
    updateOrderStatus,
} from "./scripts/sendcloud.js";


// Listener for single order page
chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "messagingPort");
    port.onMessage.addListener(function(msg) {
        if (msg.title === "singleOrderIdFromDiscogs") {
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
                            const message = {title: "singleOrderFromStorage", order: order};
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
                } else { // If order already in storage
                    // If status is not delivered, call sendcloud API 
                    // console.log("Order already in storage:", orderFromStorage); //debug
                    const message = {title: "singleOrderFromStorage", order: orderFromStorage};
                    // console.log("Sending message:", message); //debug
                    port.postMessage(message);
                }
            })();
        } 
        
        if (msg.title === "allOrderIdsFromDiscogs") {
            console.log("Received message:", msg); //debug
            const orderIds = msg.orderIds;
            (async () => {
                // Get all orders from storage
                const allOrdersFromStorage = await getAllOrdersFromStorage(orderIds);

                // Get active sort from page
                const sort = msg.sort;
                // Get all Discogs Orders on page from API
                const allDiscogsOrders = await getAllDiscogsOrders(sort);

                let finalOrders = [];
                // For each order ID:
                for (let order of allDiscogsOrders) {
                    // Get order from storage by orderId
                    const orderFromStorage = allOrdersFromStorage[order.id];
                    // If order not in storage
                    if (!orderFromStorage) {
                        // Call sendcloud API with tracking number
                        const trackingResult = await getSendcloudTracking(order.trackingNumber);
                        if (trackingResult) {
                            // Add tracking result to order
                            order = updateOrderTracking(order, trackingResult);
                        }
                        // Add order to storage
                        let added = await addOrderToStorage(order, trackingResult);
                        if (added) {
                            finalOrders.push(order);
                        } else {
                            console.log("Error adding order to storage");
                        }
                    } else { // Else if order in storage                        
                        // If status is not delivered, call sendcloud API
                        if (order.status !== "Delivered") {
                            // Call sendcloud API with tracking number
                            const trackingResult = await getSendcloudTracking(order.trackingNumber);
                            console.log("Tracking result from Sendcloud API:", trackingResult); //debug
                            if (trackingResult) {
                                // Add tracking result to order
                                order = updateOrderStatus(order, trackingResult);
                            } else {
                                console.log("Error getting tracking result from Sendcloud API");
                            }
                            // Add order to storage
                            let added = await addOrderToStorage(order, trackingResult);
                            if (added) {
                                finalOrders.push(order);
                            } else {
                                console.log("Error adding order to storage");
                            }
                        }
                    }
                }    
                const message = {title: "allOrdersFromStorage", orders: finalOrders};
                console.log("Sending message:", message); //debug
                port.postMessage(message);
            })();
        }
    });
});