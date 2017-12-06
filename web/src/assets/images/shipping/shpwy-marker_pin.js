var _templateType  = "div"; // reference to the element type used by the template
var _templateHTML  = // reference to the inner DOM template used for the pin element
"<img class='shpwy__mrkr__image' src='https://via.placeholder.com/800x450.jpg/ffffff/808890' alt=''>" +

"<svg class='shpwy__mrkr__svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 123.9 186.9' style='enable-background: new 0 0 123.9 186.9;' xml:space='preserve'>" +

    "<g class='shpwy__mrkr__pin'>" +

        "<circle class='shpwy__mrkr__pin__pulse shpwy__mrkr__pin__pulse--outer shpwy__animation__mrkr-pulse shpwy__animation__mrkr-pulse--outer' cx='61.9' cy='125' r='61.9'/>" +
        "<circle class='shpwy__mrkr__pin__pulse shpwy__mrkr__pin__pulse--inner shpwy__animation__mrkr-pulse shpwy__animation__mrkr-pulse--inner' cx='61.9' cy='125' r='36.5'/>" +
        "<circle class='shpwy__mrkr__pin__dot shpwy__animation__mrkr-fade shpwy__animation__mrkr-fade--in' cx='61.9' cy='125' r='15.6'/>" +

        "<g>" +
            "<circle class='shpwy__mrkr__pin__circle' cx='61.9' cy='41.8' r='41.8'/>" +
            "<path class='shpwy__mrkr__pin__path' d='M101.8,41.6c0,27.9-39.8,84.4-39.8,84.4S22.1,69.6,22.1,41.6c0-22,17.8-39.8,39.8-39.8S101.8,19.6,101.8,41.6z'/>" +
        "</g>" +
    "</g>" +

"</svg>"

var _query = { // reference to different queries used to select DOM elements
    main:   ".shpwy__mrkr", // query for selecting the main outer main DOM element
    dot:    ".shpwy__mrkr__pin__dot", // query for selecting the inner dot DOM element
    image:  ".shpwy__mrkr__image",    // query for selecting the inner image DOM element
    opulse: ".shpwy__mrkr__pin__pulse--outer", // query for selecting the outer pulse DOM element
    ipulse: ".shpwy__mrkr__pin__pulse--inner"  // query for selecting the inner pulse DOM element
};
