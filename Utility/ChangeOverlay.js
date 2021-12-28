/**
 * @brief Swap the overlay element.
 * @param {String} hide The element id to be hidden.
 * @param {String} show The element id to be shown.
 */
function switchOverlay(hide, show){
    $('#' + hide).css("display", "none");
    $('#' + show).css("display", "flex");
}

export { switchOverlay };