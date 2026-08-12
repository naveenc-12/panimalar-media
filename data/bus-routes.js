/*
=========================================================
PANIMALAR MEDIA
BUS ROUTES DATA
=========================================================

Add, edit, or remove bus routes here.

Each route contains:

- id
- busNumber
- route
- origin
- destination
- stops
- morningTime
- eveningTime
- note

The bus page reads this file and automatically
generates the route cards and location filter.

No backend is required.
=========================================================
*/

"use strict";


const busRoutes = [

    {
        id: "bus-01",

        busNumber: "01",

        route: "Tambaram → Panimalar",

        origin: "Tambaram",

        destination: "Panimalar Engineering College",

        stops: [
            "Tambaram",
            "Perungalathur",
            "Vandalur",
            "Kundrathur",
            "Panimalar"
        ],

        morningTime: "7:15 AM",

        eveningTime: "5:10 PM",

        note: "Morning pickup and evening drop available."
    },


    {
        id: "bus-02",

        busNumber: "02",

        route: "Poonamallee → Panimalar",

        origin: "Poonamallee",

        destination: "Panimalar Engineering College",

        stops: [
            "Poonamallee",
            "Kattupakkam",
            "Porur",
            "Mugalivakkam",
            "Panimalar"
        ],

        morningTime: "7:20 AM",

        eveningTime: "5:15 PM",

        note: "Timing may vary depending on traffic."
    },


    {
        id: "bus-03",

        busNumber: "03",

        route: "Avadi → Panimalar",

        origin: "Avadi",

        destination: "Panimalar Engineering College",

        stops: [
            "Avadi",
            "Thiruninravur",
            "Pattabiram",
            "Poonamallee",
            "Panimalar"
        ],

        morningTime: "7:00 AM",

        eveningTime: "5:05 PM",

        note: "Students should arrive at the stop a few minutes early."
    },


    {
        id: "bus-04",

        busNumber: "04",

        route: "Porur → Panimalar",

        origin: "Porur",

        destination: "Panimalar Engineering College",

        stops: [
            "Porur",
            "Mugalivakkam",
            "Moulivakkam",
            "Kundrathur",
            "Panimalar"
        ],

        morningTime: "7:30 AM",

        eveningTime: "5:20 PM",

        note: "Subject to daily traffic conditions."
    },


    {
        id: "bus-05",

        busNumber: "05",

        route: "Kundrathur → Panimalar",

        origin: "Kundrathur",

        destination: "Panimalar Engineering College",

        stops: [
            "Kundrathur",
            "Mangadu",
            "Poonamallee",
            "Nazarethpet",
            "Panimalar"
        ],

        morningTime: "7:25 AM",

        eveningTime: "5:15 PM",

        note: "Regular college-day service."
    },


    {
        id: "bus-06",

        busNumber: "06",

        route: "Chromepet → Panimalar",

        origin: "Chromepet",

        destination: "Panimalar Engineering College",

        stops: [
            "Chromepet",
            "Tambaram",
            "Perungalathur",
            "Vandalur",
            "Panimalar"
        ],

        morningTime: "7:05 AM",

        eveningTime: "5:00 PM",

        note: "Please check the latest college transport notice for changes."
    }

];


/*
=========================================================
DO NOT EDIT BELOW THIS LINE
=========================================================
*/

window.PANIMALAR_BUS_ROUTES = busRoutes;