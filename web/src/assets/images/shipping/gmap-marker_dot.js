var _templateType  = "div"; // reference to the element type used by the template
var _templateHTML  = // reference to the inner DOM template used for the dot element
"<svg class='gmap__mrkr__svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 31.2 31.2' style='enable-background: new 0 0 31.2 31.2;' xml:space='preserve'>" +

    "<g class='gmap__mrkr__pin'>" +
        "<circle class='gmap__mrkr__pin__dot' cx='15.6' cy='15.6' r='15.6' style='enable-background: new;'/>" +
    "</g>" +

"</svg>";

var _query = { // reference to different queries used to select DOM elements
    main: ".gmap__mrkr", // query for selecting the main outer main DOM element
    dot:  ".gmap__mrkr__pin__dot" // query for selecting the inner dot DOM element
};
