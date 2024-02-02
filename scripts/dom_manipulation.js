
// const matchTrackingColor = (status) => {
//     if (status.toLowerCase().includes('delivered')) {
//         return {light: '#e5ffe8', dark: '#004d09'};
//     } else {
//         return {light: '#f2d09d', dark: '#b77818'};
//     }
// }

// // Check if the user is on the orders page or a single order page
// const checkLocation = () => {
//     let location = window.location.href;
//     if (location.includes("/sell/orders")) {
//         return 'allOrders';
//     } else if (location.includes("/sell/order/")) {
//         return 'singleOrder';
//     } else{
//         return false;
//     }
// }

// // const truckIcon = '<i class="icon icon-truck"></i>';
// const truckIcon = '<i class="icon icon-truck" role="img" aria-hidden="true"></i>';

// const getPillElement = (document) => {
//     const parentDiv = document.querySelector('div.order-header-actions');
//     return parentDiv.querySelector('.order-status-label');
// }

// const setPillColor = (document, color) => {
//     const pill = getPillElement(document);
//     pill.style.backgroundColor = color.light;
//     pill.style.borderColor = color.dark;
// }

// const setPillMessage = (document, status) => {
//     const pill = getPillElement(document);
//     pill.innerHTML = `${truckIcon} ${status}`;
// }
// const setPillToolTip = (document, date) => {
//     const pill = getPillElement(document);
//     pill.title = date;
// }
// const setPillLink = (document, url) => {
//     const pill = getPillElement(document)
//     pill.href = url;
// }

// export {
//     matchTrackingColor,
//     checkLocation,
//     setPillColor,
//     setPillMessage,
//     setPillToolTip,
//     setPillLink,
// }