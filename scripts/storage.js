
async function getAllOrdersFromStorage () {
    var getOrders  = new Promise( function(resolve, reject) {
        chrome.storage.sync.get(function(result) {
            resolve(result);
        })
    });
    // Get orders from storage
    var ordersInStorage = await getOrders;
    // Check if orders is undefined
    if (ordersInStorage === undefined || ordersInStorage === null || ordersInStorage.length === 0 ) {
        console.log('No orders in storage');
        return {}; // Return empty object if orders is undefined, null or empty object
    }
    console.log('Orders in storage:', ordersInStorage)
    return ordersInStorage;
}

async function addSingleOrderToStorage (order) {
    chrome.storage.sync.set({[order.orderId]: order}, function() {
    });
    return true; 
}

async function getSingleOrderFromStorage(orderId) {
    var getOrders  = new Promise( function(resolve, reject) {
        chrome.storage.sync.get(orderId, function(result) {
            resolve(result[orderId]);
        })
    });
    // Get orders from storage
    var order = await getOrders;
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
    addSingleOrderToStorage,
    getSingleOrderFromStorage,
    getAllOrdersFromStorage,
    getAllOrders
}