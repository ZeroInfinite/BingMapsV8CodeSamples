﻿/*
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

/// <reference path="../../Common/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>

/**
* This code is based on the leaflet Terminator plugin: https://github.com/joergdietrich/Leaflet.Terminator
*/

interface EquatorialPosition {
    alpha: number;
    delta: number;
}

interface EclipticPosition {
    lambda: number;
    R: number;
}

class SolarTerminator extends Microsoft.Maps.Polygon  {

    /**********************
    * Private Properties
    ***********************/

    private dateTime: Date;

    private radiansToDegrees: number = 180 / Math.PI;
    private degreesToRadians: number = Math.PI / 180;

    private sunEquatorialPosition: EquatorialPosition;

    /**********************
    * Constructor
    ***********************/

    /**
     * @contructor
     */
    constructor(dateTime?: Date, options?: Microsoft.Maps.IPolygonOptions) {        
        super([], options || {
            strokeColor: 'rgba(0,0,0,0)',
            fillColor: 'rgba(0,0,0,0.7)'
        });
        this.setLocations(this.computeTerminatorLocations());
    }

    /**********************
    * Public Functions
    ***********************/

    public getSunLocation(): Microsoft.Maps.Location {
        //Calculate approximate longitude value of sun based on UTC time.
        var lon = 180 - (this.dateTime.getUTCHours() + this.dateTime.getUTCMinutes() / 60 + this.dateTime.getMilliseconds()/3600 )/ 24 * 360;

        return new Microsoft.Maps.Location(this.sunEquatorialPosition.delta, lon);
    }

    public getDateTime(): Date {
        return this.dateTime;
    }

    public setDateTime(dateTime: Date): void {
        this.dateTime = dateTime;
        this.setLocations(this.computeTerminatorLocations());
    }

    /**********************
    * Private Functions
    ***********************/

    private computeTerminatorLocations(): Microsoft.Maps.Location[] {
        this.dateTime = this.dateTime || new Date();

        var julianDay = this.getJulian(this.dateTime);
        var gst = this.getGMST(this.dateTime);
        var latLng = [];
        var ha, lat, lng;

        var sunEclPos = this.getSunEclipticPosition(julianDay);
        var eclObliq = this.getEclipticObliquity(julianDay);
        var sunEqPos = this.getSunEquatorialPosition(sunEclPos.lambda, eclObliq);

        this.sunEquatorialPosition = sunEqPos;

        for (var i = 0; i <= 360; i++) {
            lng = -180 + i;
            ha = this.getHourAngle(lng, sunEqPos, gst);
            lat = this.getLatitude(ha, sunEqPos);
            latLng[i + 1] = new Microsoft.Maps.Location(lat, lng);
        }

        if (sunEqPos.delta < 0) {
            latLng[0] = new Microsoft.Maps.Location(90, -180);
            latLng[latLng.length] = new Microsoft.Maps.Location(90, 180);
        } else {
            latLng[0] = new Microsoft.Maps.Location(-90, -180);
            latLng[latLng.length] = new Microsoft.Maps.Location(-90, 180);
        }
        return latLng;
    }
    
    private getJulian(date: Date): number {
        //Calculate the present UTC Julian Date. Function is valid after the beginning of the UNIX epoch 1970-01-01 and ignores leap seconds.
        return (date.getTime() / 86400000) + 2440587.5;
    }

    private getGMST(date: Date): number {
        //Calculate Greenwich Mean Sidereal Time according to http://aa.usno.navy.mil/faq/docs/GAST.php
        var julianDay = this.getJulian(date);
        var d = julianDay - 2451545.0;

        // Low precision equation is good enough for our purposes.
        return (18.697374558 + 24.06570982441908 * d) % 24;
    }

    private getSunEclipticPosition(julianDay: number): EclipticPosition {
        //Compute the position of the Sun in ecliptic coordinates at julianDay. Following http://en.wikipedia.org/wiki/Position_of_the_Sun

        // Days since start of J2000.0
        var n = julianDay - 2451545.0;

        // mean longitude of the Sun
        var L = (280.460 + 0.9856474 * n) % 360;

        // mean anomaly of the Sun
        var g = (357.528 + 0.9856003 * n) % 360;

        // ecliptic longitude of Sun
        var lambda = L + 1.915 * Math.sin(g * this.degreesToRadians) + 0.02 * Math.sin(2 * g * this.degreesToRadians);

        // distance from Sun in AU
        var R = 1.00014 - 0.01671 * Math.cos(g * this.degreesToRadians) - 0.0014 * Math.cos(2 * g * this.degreesToRadians);

        return <EclipticPosition>{ lambda: lambda, R: R };
    }

    private getEclipticObliquity(julianDay: number): number {
        // Following the short term expression in http://en.wikipedia.org/wiki/Axial_tilt#Obliquity_of_the_ecliptic_.28Earth.27s_axial_tilt.29

        // Julian centuries since J2000.0
        var n = julianDay - 2451545.0;
        
        var T = n / 36525;

        //epsilon
        return 23.43929111 - T * (46.836769 / 3600 - T * (0.0001831 / 3600 + T * (0.00200340 / 3600 - T * (0.576e-6 / 3600 - T * 4.34e-8 / 3600))));
    }

    private getSunEquatorialPosition(sunEclLng: number, eclObliq: number): EquatorialPosition {
        //Compute the Sun's equatorial position from its ecliptic position. Inputs are expected in degrees. Outputs are in degrees as well.
        var alpha = Math.atan(Math.cos(eclObliq * this.degreesToRadians) * Math.tan(sunEclLng * this.degreesToRadians)) * this.radiansToDegrees;
        var delta = Math.asin(Math.sin(eclObliq * this.degreesToRadians) * Math.sin(sunEclLng * this.degreesToRadians)) * this.radiansToDegrees;

        var lQuadrant = Math.floor(sunEclLng / 90) * 90;
        var raQuadrant = Math.floor(alpha / 90) * 90;

        alpha += (lQuadrant - raQuadrant);

        return <EquatorialPosition>{ alpha: alpha, delta: delta };
    }

    private getHourAngle(lng: number, sunPos: EquatorialPosition, gst: number): number {
        //Compute the hour angle of the sun for a longitude on Earth. Return the hour angle in degrees.
        return (gst + lng / 15) * 15 - sunPos.alpha;
    }

    private getLatitude(ha: number, sunPos: EquatorialPosition): number {
        /* For a given hour angle and sun position, compute the latitude of the terminator in degrees. */
        return Math.atan(-Math.cos(ha * this.degreesToRadians) / Math.tan(sunPos.delta * this.degreesToRadians)) * this.radiansToDegrees;
    }
}

//Call the module loaded function.
Microsoft.Maps.moduleLoaded('SolarTerminatorModule');