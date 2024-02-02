
async function getAllOrdersFromStorage () {
    var getOrders  = new Promise( function(resolve, reject) {
        chrome.storage.sync.get('orders', function(result) {
            resolve(result.orders);
        })
    });
    // Get orders from storage
    var ordersInStorage = await getOrders;
    // Check if orders is undefined
    if (ordersInStorage === undefined || ordersInStorage === null || ordersInStorage.length === 0 ) {
        console.log('No orders in storage');
        return {}; // Return empty object if orders is undefined, null or empty object
    }
    return ordersInStorage;
}

async function addOrderToStorage (order) {
    var orders = await getAllOrdersFromStorage();
    // Add order to storage object
    orders[order.orderId] = order;
    console.log('updated orders:', orders);
    // Save orders to storage
    chrome.storage.sync.set({'orders': orders}, function() {
        console.log('Order added to storage');
    });
    return true; 
}

async function getSingleOrderFromStorage(orderId) {
    // Get orders from storage
    var orders = await getAllOrdersFromStorage();
    var order = orders[orderId];
    return order;
}

async function getAllOrders(orderIds) {
    var orders = await getAllOrdersFromStorage();
    let allOrders = [];
    for (let orderId of orderIds) {
        if (orders[orderId]) {
            allOrders.push(orders[orderId]);
        } else {
            allOrders.push({
                orderId: orderId,
                status: 'Not synced',
                trackingNumber: "No tracking number",
                expectedDelivery: "Not synced",
                trackingUrl: "Not synced",
            })
        }
    }

    return allOrders;
}

export {
    addOrderToStorage,
    getSingleOrderFromStorage,
    getAllOrdersFromStorage,
    getAllOrders
}