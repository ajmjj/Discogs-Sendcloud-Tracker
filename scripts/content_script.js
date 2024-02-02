// Can't import from content script
// import { 
//     matchTrackingColor,
//     checkLocation,
//     setPillColor,
//     setPillMessage,
//     setPillToolTip,
//     setPillLink
// } from "../scripts/dom_manipulation.js";

const getSingleOrderId = () => {
    let location = window.location.href;
    return location.split('/').pop();
}

const matchTrackingColor = (status) => {
    if (status && status.toLowerCase().includes('delivered')) {
        return {light: '#e5ffe8', dark: '#004d09'};
    } else if (status) {
        return {light: '#f2d09d', dark: '#b77818'};
    } else {
        return {light: '#e5ffe8', dark: '#004d09'};
    }
}
const matchStatusIcon = (status) => {
    const truckIcon = '<i class="icon icon-truck" role="img" aria-hidden="true"></i>';
    const checkIcon = '<i class="icon icon-check" role="img" aria-hidden="true"></i>';
    if (status && status.toLowerCase().includes('delivered')) {
        return checkIcon;
    } else {
        return truckIcon;
    }
}
// Check if the user is on the orders page or a single order page
const checkLocation = () => {
    let location = window.location.href;
    if (location.includes("/sell/orders")) {
        return 'allOrders';
    } else if (location.includes("/sell/order/")) {
        return 'singleOrder';
    } else{
        return false;
    }
}

// Get order IDs from /orders/ page
const getOrderIdsFromPage = (document) => {
    const ordersTableBody = document.querySelector('.marketplace-table > tbody');

    let orderIds = [];
    for (let row of ordersTableBody.rows) {
        let status = row.querySelector('.order_status_cell').innerText;
        // If Discogs status isn't Shipped, skip
        if (status.toLowerCase().includes('shipped')) {
            let orderId = row.id.replace('order', '');
            orderIds.push(orderId);
        }
    }
    return orderIds;
}
// Pill manipulation
const getPillElement = (document) => {
    const parentDiv = document.querySelector('div.order-header-actions');
    return parentDiv.querySelector('.order-status-label');
}
const setPillColor = (pill, order) => {
    const color = matchTrackingColor(order.status);
    pill.style.backgroundColor = color.light;
    pill.style.borderColor = color.dark;
}
const setPillIconAndMessage = (pill, order) => {
    const status = order.status;
    const date = order.expectedDelivery;
    const icon = matchStatusIcon(status);

    if (!status.toLowerCase().includes('delivered')) {
        pill.innerHTML = `${icon} ${status}  |  Expected: ${date}`;
        pill.style.color = 'black';
    } else {
        pill.innerHTML = `${icon} ${status}`;
    }
}

const setPillToolTip = (pill, order) => {
    const date = order.expectedDelivery;
    pill.title = `Expected Delivery: ${date}`;
}
// const setPillLink = (pill, order) => {
//     const url = order.carrierTrackingUrl;
//     pill.href = url;
// }
const updatePillContent = (pill, order) => {
    setPillColor(pill, order);
    setPillIconAndMessage(pill, order);
    setPillToolTip(pill, order);
    // setPillLink(pill, order);
}
const getCellElement = (document, orderId) => {
    return document.getElementById(`order${orderId}`).querySelector('.order_status_cell');
}
const updateCellContent = (cell, order) => {
    const statusColor = matchTrackingColor(order.status);
    const statusIcon = matchStatusIcon(order.status);
    if (!statusColor || !statusIcon) {
        console.log('Error getting status color or icon');
        return;
    }

    cell.innerHTML = `
        <span class="order_status_icon tiny_icon shipped" title="Expected Delivery: 2024-02-01">
            ${statusIcon}
        </span>
            ${order.status}\n
            `;
    pill = cell.querySelector('.order_status_icon');
    setPillColor(pill, statusColor);
    setPillToolTip(pill, order.expectedDelivery);
    // setPillLink(pill, order.url);
}
// All orders page info getters
const getSortOrder = (sorted) => {
    switch (sorted.title.split(' ').pop()){
        case 'ascending':
            return 'asc';
        case 'descending':
            return 'asc';
        default:
            return 'Error getting sort order from page';
    }
}
const getSort = (document) => {
    const sorted = document.querySelector('a[title^=sorted]');
    if (!sorted) {
        return {sort: 'id', sort_order: 'desc'};
    }
    console.log(sorted); //debug
    switch (sorted.querySelector('span').innerText) {
        case 'Order #':
            return {sort: 'id', sort_order: getSortOrder(sorted)};
        case 'Buyer':
            return {sort: 'buyer', sort_order: getSortOrder(sorted)};
        case 'Date':
            return {sort: 'created', sort_order: getSortOrder(sorted)};
        case 'Status':
            return {sort: 'status', sort_order: getSortOrder(sorted)};
        case 'Last Activity':
            return {sort: 'last_activity', sort_order: getSortOrder(sorted)};
        default:
            return false;
    }
}
// const getPageNumber = (document) => {
//     var pageNumbers = document.querySelector('.pagination_page_links');
//     return pageNumbers.querySelector('strong').innerText;
// }
// const getShowCount = (document) => {
//     return document.querySelector('#limit_top > option[selected]').value;
// }

// Main function

document.body.onload = async function () {
    renderSyncButton(document);
    let location = checkLocation();
    // Connect to the background script
    port = chrome.runtime.connect({name: 'messagingPort'});
    
    if (location === 'singleOrder'){

        // Get the order ID from the URL
        const orderId = getSingleOrderId();
        // console.log(orderId) //debug
        
        // Send 'singleOrder' with order ID to the background script
        port.postMessage({title: 'singleOrderIdFromDiscogs', orderId: orderId});

        // Listen for a message from the background script
        port.onMessage.addListener(function(message) {
            // console.log(message); //debug
            if (message.title === 'singleOrderFromStorage') {
                const order = message.order;
                
                const pill = getPillElement(document);
                updatePillContent(pill, order);
            }
        })

    } else if (location === 'allOrders') {
        port.postMessage({title:'getAllOrdersOnPage', orderIds: orderIds})
        // console.log("Sent orderIds to background script"); //debug

        // Listen for a message from the background script
        port.onMessage.addListener(function(message) {
            if (message.title === 'allOrdersOnPage') {
                const orders = message.orders;

                for (const order of orders) {
                    const cell = getCellElement(document, order.orderId);
                    updateCellContent(cell, order);
                }
            }
        })
    }

    if 
}