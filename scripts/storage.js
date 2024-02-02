
async function getAllOrdersFromStorage () {
    var getOrders  = new Promise( function(resolve, reject) {
        chrome.storage.sync.get('orders', function(result) {
            // console.log('orders from storage:', result.orders); //debug
            // Get orders from result
            resolve(result.orders);
        })
    });
    // Get orders from storage
    var orders = await getOrders;
    // Check if orders is undefined
    if (!orders) {
        console.log('No orders in storage');
        return {}; // Return empty object if orders is undefined or empty object if orders is undefined or null or undefined or null or undefined or null or undefined or null or undefined or null or undefined or null or undefined or null or undefined or null or undefined or null or undefined or null or undefined or null or undefined or null or undefined
    }
    return orders;
}

async function addOrderToStorage (order) {
    // Get orders from storage
    var orders = await getAllOrdersFromStorage();
    // Add order to storage object
    orders[order.orderId] = order;
    console.log('updated orders:', orders);
    // Save orders to storage
    chrome.storage.sync.set({orders: orders}, function() {
        console.log('Order added to storage');
    });
    return true; // Return true if order is added to storage
}

async function getSingleOrderFromStorage(orderId) {
    // Get orders from storage
    var orders = await getAllOrdersFromStorage();
    // Get order from orders object
    var order = orders[orderId];
    // console.log('Order from storage:', order);
    return order;
}

export {
    addOrderToStorage,
    getSingleOrderFromStorage,
};