/*
 * Copyright(c) 2017 Microsoft Corporation. All rights reserved.
 *
 * This code is licensed under the MIT License (MIT).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../Common/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>
/**
 * A simple class that defines a HTML pushpin.
 */
var HtmlPushpin = (function () {
    /**********************
    * Constructor
    ***********************/
    /**
     * @constructor
     * @param loc The location of the pushpin.
     * @param htmlContent The HTML to display as the pushpin.
     * @param options The options used to customize how the pushpin is displayed.
     */
    function HtmlPushpin(loc, htmlContent, options) {
        //TODO: Mouse over, out, click, dblcick.
        /**********************
        * Internal Properties
        ***********************/
        /** This is an internal property used by the HtmlPushpinLayer. */
        this._options = {
            visible: true
        };
        //A property for storing data relative to the pushpin.
        this.metadata = null;
        //Create the pushpins DOM element.
        this._element = document.createElement('div');
        this._element.style.position = 'absolute';
        //Set the options.
        options = options || {};
        options.location = loc;
        options.htmlContent = htmlContent;
        this.setOptions(options);
        //Add event listeners
        var self = this;
        this._element.addEventListener('mousedown', function (e) { self._pinMouseDown(e); });
        this._element.addEventListener('mouseup', function (e) { self._pinMouseUp(e); });
    }
    /**
     * Disposes the pushpin and releases its resources.
     */
    HtmlPushpin.prototype.dispose = function () {
        var _this = this;
        //Remove mouse events.
        if (this._element) {
            this._element.removeEventListener('mousedown', function (e) { _this._pinMouseDown(e); });
            this._element.removeEventListener('mouseup', function (e) { _this._pinMouseUp(e); });
        }
        this._layer = null;
        this._options = null;
        this._element = null;
        this._isDragging = null;
        this.onDrag = null;
        this.onDragStart = null;
        this.onDragEnd = null;
        this.metadata = null;
    };
    /**
     * Gets the anchor point of the pushpin.
     * @returns The anchor point of the pushpin.
     */
    HtmlPushpin.prototype.getAnchor = function () {
        return this._options.anchor;
    };
    /**
     * Gets a boolean indicating if the pushpin is draggable or not.
     * @returns A boolean indicating if the pushpin is draggable or not.
     */
    HtmlPushpin.prototype.getDraggable = function () {
        return this._options.draggable;
    };
    /**
     * Gets the Html content of the pushpins.
     * @returns The Html content of the pushpins.
     */
    HtmlPushpin.prototype.getHtmlContent = function () {
        return this._options.htmlContent;
    };
    /**
     * Gets the location of the pushpin.
     * @returns The location of the pushpin.
     */
    HtmlPushpin.prototype.getLocation = function () {
        return this._options.location;
    };
    /**
     * Gets the visibility option of the pushpin.
     * @returns The visibility of the pushpin.
     */
    HtmlPushpin.prototype.getVisible = function () {
        return this._options.visible;
    };
    /**
     * Sets the location of the pushpin.
     * @param loc The location to display the pushpin at.
     */
    HtmlPushpin.prototype.setLocation = function (loc) {
        if (this._layer && loc && loc instanceof Microsoft.Maps.Location) {
            this._options.location = loc;
            this._layer._updatePushpinPosition(this);
        }
    };
    /**
     * Sets the options of the pushpin.
     * @param options The options of the pushpin.
     */
    HtmlPushpin.prototype.setOptions = function (options) {
        var reposition = false;
        if (options.anchor && options.anchor instanceof Microsoft.Maps.Point) {
            this._options.anchor = options.anchor;
            reposition = true;
        }
        if (options.location && options.location instanceof Microsoft.Maps.Location) {
            this._options.location = options.location;
            reposition = true;
        }
        if (typeof options.draggable === 'boolean') {
            this._options.draggable = options.draggable;
        }
        if (typeof options.visible === 'boolean') {
            this._options.visible = options.visible;
        }
        if (options.htmlContent) {
            this._options.htmlContent = options.htmlContent;
            if (this._element) {
                if (typeof options.htmlContent === 'string') {
                    this._element.innerHTML = options.htmlContent;
                }
                else {
                    //Remove any child elements.
                    for (var i = 0, len = this._element.childElementCount; i < len; i++) {
                        this._element.removeChild(this._element.childNodes[i]);
                    }
                    this._element.appendChild(options.htmlContent);
                }
            }
        }
        if (this._layer && reposition) {
            this._layer._updatePushpinPosition(this);
        }
    };
    /**********************
    * Private Functions
    ***********************/
    /**
     * Mouse down event handler.
     * @param e The mouse event.
     */
    HtmlPushpin.prototype._pinMouseDown = function (e) {
        if (this._options.draggable) {
            this._isDragging = true;
            this._layer._dragTarget = this;
            if (this.onDragStart) {
                this.onDragStart(this._getEventInfo('dragstart', e));
            }
        }
        if (this.onMouseDown) {
            this.onMouseDown(this._getEventInfo('mousedown', e));
        }
    };
    /**
     * Mouse up event handler.
     * @param e The mouse event.
     */
    HtmlPushpin.prototype._pinMouseUp = function (e) {
        if (this._isDragging) {
            this._isDragging = false;
            this._layer._dragTarget = null;
            if (this.onDragEnd) {
                this.onDragEnd(this._getEventInfo('dragend', e));
            }
        }
        if (this.onMouseDown) {
            this.onMouseDown(this._getEventInfo('mouseup', e));
        }
    };
    /**
     * Mouse move event handler.
     * @param e The mouse event.
     */
    HtmlPushpin.prototype._pinDragged = function (e) {
        if (this.onDrag) {
            this.onDrag(e);
        }
    };
    /**
     * Converts a mouse event into a Html Pushpin event.
     * @param eventName The name of the event that occured.
     * @param e The original mouse event.
     * @returns An Html Pushpin event.
     */
    HtmlPushpin.prototype._getEventInfo = function (eventName, e) {
        var x = 0;
        var y = 0;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        }
        else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        var point = new Microsoft.Maps.Point(x, y);
        return {
            eventName: eventName,
            layer: this._layer,
            pageX: x,
            pageY: y,
            point: point,
            target: this,
            targetType: 'HtmlPushpin',
            location: this._layer.getMap().tryPixelToLocation(point, Microsoft.Maps.PixelReference.page)
        };
    };
    return HtmlPushpin;
}());
/**
 * A reusable class for overlaying HTML elements as pushpins on the map.
 */
var HtmlPushpinLayer = (function (_super) {
    __extends(HtmlPushpinLayer, _super);
    /**********************
    * Constructor
    ***********************/
    /**
    * @constructor
    */
    function HtmlPushpinLayer(pushpins) {
        _super.call(this, { beneathLabels: false });
        /** Store the pushpins. */
        this._pushpins = null;
        /** A variable to store the viewchange event handler id. */
        this.viewChangeEventHandler = null;
        /** A variable to store a reference to the container for the HTML pushpins. */
        this.container = null;
        this._pushpins = pushpins || [];
    }
    /**********************
    * Overridden functions
    ***********************/
    /**
    * Layer added to map. Setup rendering container.
    */
    HtmlPushpinLayer.prototype.onAdd = function () {
        //Create a div that will hold the pushpins.
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.left = '0px';
        this.container.style.top = '0px';
        this.setHtmlElement(this.container);
    };
    /**
     * Layer loaded, add map events for updating position of data.
     */
    HtmlPushpinLayer.prototype.onLoad = function () {
        var _this = this;
        var self = this;
        //Reset pushpins as overlay is now loaded.
        self._renderPushpins();
        //Update the position of the pushpin when the view changes. Hide the layer if map changed to streetside.
        this.viewChangeEventHandler = Microsoft.Maps.Events.addHandler(self.getMap(), 'viewchange', function () {
            if (self.getMap().getMapTypeId() === Microsoft.Maps.MapTypeId.streetside) {
                self.container.style.display = 'none';
            }
            else {
                self.container.style.display = '';
                self._updatePositions();
            }
        });
        document.body.addEventListener('mousemove', function (e) { _this._updateDragPushpin(e); });
        document.body.addEventListener('mouseup', function (e) { if (_this._dragTarget) {
            _this._dragTarget._pinMouseUp(e);
        } });
    };
    /**
     * Layer removed from map. Release resources.
     */
    HtmlPushpinLayer.prototype.onRemove = function () {
        var _this = this;
        this.setHtmlElement(null);
        this._dragTarget = null;
        //Remove the event handler that is attached to the map.
        Microsoft.Maps.Events.removeHandler(this.viewChangeEventHandler);
        document.body.removeEventListener('mousemove', function (e) { _this._updateDragPushpin(e); });
        document.body.removeEventListener('mouseup', function (e) { if (_this._dragTarget) {
            _this._dragTarget._pinMouseUp(e);
        } });
    };
    /**********************
    * Public Functions
    ***********************/
    /**
    * Adds a HTML pushpin or array of HTML pushpins to add to the layer.
    * @param pushpin A HTML pushpin or array of HTML pushpins to add to the layer.
    */
    HtmlPushpinLayer.prototype.add = function (pushpin) {
        if (pushpin) {
            if (pushpin instanceof HtmlPushpin) {
                this._pushpins.push(pushpin);
                pushpin._layer = this;
                this.container.appendChild(pushpin._element);
            }
            else if (pushpin instanceof Array) {
                //Add the pushpins to the container.
                for (var i = 0, len = pushpin.length; i < len; i++) {
                    pushpin[i]._layer = this;
                    this.container.appendChild(pushpin[i]._element);
                }
            }
            this._updatePositions();
        }
    };
    /**
     * Removes all pushpins in the layer.
     */
    HtmlPushpinLayer.prototype.clear = function () {
        //Clear any pushpins already in the layer.
        if (this._pushpins) {
            for (var i = 0, len = this._pushpins.length; i < len; i++) {
                this._pushpins[i].dispose();
            }
        }
        this._pushpins = [];
        if (this.container) {
            this.container.innerHTML = '';
        }
    };
    /**
     * Retrieves a bounding box that contains all the HTML Pushpin locations.
     * @returns A bounding box that contains all the HTML Pushpin locations.
     */
    HtmlPushpinLayer.prototype.getBounds = function () {
        var locs = [];
        for (var i = 0, len = this._pushpins.length; i < len; i++) {
            locs.push(this._pushpins[i].getLocation());
        }
        if (locs.length > 0) {
            return Microsoft.Maps.LocationRect.fromLocations(locs);
        }
        return null;
    };
    /**
     * Retrieves all HTML pushpins in the layer.
     * @returns All HTML pushpins in the layer.
     */
    HtmlPushpinLayer.prototype.getPushpins = function () {
        return this._pushpins;
    };
    /**
    * Sets the pushpins to be overlaid on top of the map. This will remove any pushpins already in the layer.
    * @param pushpins The HTML pushpins to overlay on the map.
    */
    HtmlPushpinLayer.prototype.setPushpins = function (pushpins) {
        this.clear();
        if (pushpins) {
            this._pushpins = pushpins;
            this._renderPushpins();
        }
    };
    /**********************
    * Private Functions
    ***********************/
    /**
    * Renders the pushpins on the layer.
    */
    HtmlPushpinLayer.prototype._renderPushpins = function () {
        //Add the pushpins to the container.
        for (var i = 0, len = this._pushpins.length; i < len; i++) {
            this._pushpins[i]._layer = this;
            this.container.appendChild(this._pushpins[i]._element);
        }
        this._updatePositions();
    };
    /**
    * Updates the position of a HTML pushpin element on the map.
    */
    HtmlPushpinLayer.prototype._updatePushpinPosition = function (pin) {
        var map = this.getMap();
        if (map) {
            //Calculate the pixel location of the pushpin.
            var topLeft = map.tryLocationToPixel(pin.getLocation(), Microsoft.Maps.PixelReference.control);
            //Offset position to account for anchor.
            var anchor = pin.getAnchor();
            topLeft.x -= anchor.x;
            topLeft.y -= anchor.y;
            //Update the position of the pushpin element.
            pin._element.style.left = topLeft.x + 'px';
            pin._element.style.top = topLeft.y + 'px';
        }
    };
    HtmlPushpinLayer.prototype._updateDragPushpin = function (e) {
        if (this._dragTarget) {
            var map = this.getMap();
            if (map) {
                var x = 0;
                var y = 0;
                if (e.pageX || e.pageY) {
                    x = e.pageX;
                    y = e.pageY;
                }
                else {
                    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
                var point = new Microsoft.Maps.Point(x, y);
                var loc = map.tryPixelToLocation(point, Microsoft.Maps.PixelReference.page);
                this._dragTarget.setLocation(loc);
                this._dragTarget._pinDragged({
                    eventName: 'drag',
                    layer: this,
                    location: loc,
                    pageX: e.pageX,
                    pageY: e.pageY,
                    point: point,
                    target: this._dragTarget,
                    targetType: 'HtmlPushpin'
                });
                e.preventDefault();
            }
        }
    };
    /**
     * Updates the positions of all HTML pushpins in the layer.
     */
    HtmlPushpinLayer.prototype._updatePositions = function () {
        if (this._pushpins) {
            for (var i = 0, len = this._pushpins.length; i < len; i++) {
                this._updatePushpinPosition(this._pushpins[i]);
            }
        }
    };
    return HtmlPushpinLayer;
}(Microsoft.Maps.CustomOverlay));
//Call the module loaded function.
Microsoft.Maps.moduleLoaded('HtmlPushpinLayerModule');
//# sourceMappingURL=HtmlPushpinLayerModule.js.map