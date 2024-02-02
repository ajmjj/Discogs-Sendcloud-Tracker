import { 
    getSingleOrderFromDiscogs,
    getAllDiscogsOrders,
} from "./scripts/discogs.js";

import { 
    addSingleOrderToStorage,
    getSingleOrderFromStorage,
    getAllOrdersFromStorage,
    getAllOrders,
} from "./scripts/storage.js";

import { 
    getSendcloudTracking, 
    updateOrderStatus,
} from "./scripts/sendcloud.js";

import {
    updateOrderTracking,
} from "./scripts/tracking.js";


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
                        order = updateOrderTracking(order, trackingResult); //todo
                        // Add order to storage
                        let added = await addSingleOrderToStorage(order, trackingResult);
                        if (added) {
                            const message = {title: "singleOrderFromStorage", order: order};
                            // console.log("Sending message:", message); //debug
                        port.postMessage(message);
                        }
                        
                    } else {
                        console.log("Error getting tracking result from Sendcloud API");
                    }
                } else { // If order already in storage
                    // If status is not delivered, call sendcloud API 
                    // console.log("Order already in storage:", orderFromStorage); //debug
                    const message = {title: "singleOrderFromStorage", order: orderFromStorage};
                    port.postMessage(message);
                }
            })();
        } 

        if (msg.title === 'getAllOrdersOnPage') {
            console.log("Received message:", msg); //debug
            const orderIds = msg.orderIds;
            (async () => {
                // Get full order list from page
                const allOrders = await getAllOrders(orderIds);

                const message = {title: "allOrdersOnPage", orders: allOrders};
                port.postMessage(message);
                console.log("Sent all orders to content script"); //debug
            })();
        }

        if (msg.title === "syncOrderTracking") {
            console.log("Received message:", msg); //debug
            (async () => {
                const allOrdersFromStorage = await getAllOrdersFromStorage();
                // console.log("All Orders from storage:", allOrdersFromStorage); //debug

                const allDiscogsOrders = await getAllDiscogsOrders(msg.sort);
                // console.log("All Discogs Orders:", allDiscogsOrders); //debug

                for (let order of allDiscogsOrders) {
                    const orderFromStorage = allOrdersFromStorage[order.id];

                    if (!orderFromStorage || orderFromStorage.status !== "Delivered") {
                        console.log("Order not in storage or not delivered, syncing order:", order); //debug
                        const updatedOrder = await updateOrderTracking(order);

                        if (updatedOrder) {await addSingleOrderToStorage(updatedOrder);}

                    } else {
                        console.log("Order already delivered:", order); //debug
                        continue;
                    }
                }
                console.log("All orders synced"); //debug
                const message = {title: "syncedOrders"};
                port.postMessage(message);
            })();
        }
    
    });
});