# Basic Pong-style game with Arduino and javascript

The purpose of this app is to explore the basics of sending stuff around between an Arduino and an html page. (I _could_ have spent a lot more time making the gameplay better, but I rather invest that time in exporing something new...)

## What you need

### Hardware

- An arduino
- 1 potentiometer (turning knob)
- 1 physical button
- 1 green led
- 1 red led

### Software

- Node.js (I built this with version 6.10.0)

## Setting things up

You'll only need to do the set up stuff once, after that, you can skip to _Starting the app_

### Arduino hardware setup

- Potentiometer on Ground, 5V and A2
- Button on 11
- Green led on 8
- Red led on 7

### Arduino software setup

- In the Arduino IDE, choose _File_ > _Examples_ > _Firmata_ > _StandardFirmata_
- Upload to your Arduino

### Node setup

- In the terminal, go to the folder _src_
- Do an ``npm install``. This will install the express webserver, socket.io and the Johnny-Five library

## Starting the app

- Start the app with ``node arduino-pong.js``
- Open a browser window at http://localhost:3000
- Start game by clicking on physical button
