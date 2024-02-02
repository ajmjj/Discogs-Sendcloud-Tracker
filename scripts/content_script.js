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
    if (status.toLowerCase().includes('delivered')) {
        return {light: '#e5ffe8', dark: '#004d09'};
    } else {
        return {light: '#f2d09d', dark: '#b77818'};
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

// const truckIcon = '<i class="icon icon-truck"></i>';
const truckIcon = '<i class="icon icon-truck" role="img" aria-hidden="true"></i>';
const checkIcon = '<i class="icon icon-check" role="img" aria-hidden="true"></i>';

const getPillElement = (document) => {
    const parentDiv = document.querySelector('div.order-header-actions');
    return parentDiv.querySelector('.order-status-label');
}

const setPillColor = (document, color) => {
    const pill = getPillElement(document);
    pill.style.backgroundColor = color.light;
    pill.style.borderColor = color.dark;
}

const setPillMessage = (document, status, date) => {
    const pill = getPillElement(document);
    if (!status.toLowerCase().includes('delivered')) {
        pill.innerHTML = `${truckIcon} ${status}  |  Expected: ${date}`;
        pill.style.color = 'black';
    } else {
        pill.innerHTML = `${checkIcon} ${status}`;
    }
    
}
const setPillToolTip = (document, date) => {
    const pill = getPillElement(document);
    pill.title = `Expected Delivery: ${date}`;
}
const setPillLink = (document, url) => {
    const pill = getPillElement(document)
    pill.href = url;
}

document.body.onload = async function () {
    let location = checkLocation();
    
    if (location === 'singleOrder'){
        // Connect to the background script
        port = chrome.runtime.connect({name: 'singleOrder'});

        // Get the order ID from the URL
        const orderId = getSingleOrderId();
        // console.log(orderId) //debug
        
        // Send 'singleOrder' with order ID to the background script
        port.postMessage({title: 'orderIdFromDiscogs', orderId: orderId});

        // Listen for a message from the background script
        port.onMessage.addListener(function(message) {
            // console.log(message); //debug
            if (message.title === 'orderFromStorage') {
                const order = message.order;

                const statusColor = matchTrackingColor(order.status);

                // Set pill color to status color
                setPillColor(document, statusColor);

                // Set Pill Message to status
                setPillMessage(document, order.status, order.expectedDelivery);

                // Set Pill hover text to expected delivery date
                setPillToolTip(document, order.expectedDelivery);

                // Set Pill link to tracking URL
                setPillLink(document, order.trackingUrl);
            }
        })

    
    // } else if (location === 'allOrders') {
    //     // Connect to the background script
    //     port = chrome.runtime.connect({name: 'orders'});
        
    //     // Send 'allOrders' to the background script
    //     port.postMessage({type: 'allOrders'});
    }
}