---
title: 'ESP32 PC Telemetry Display'
description: 'A touchscreen desk display for live PC statistics, built from an ESP32-S2 board with a custom-matched screen, wireless module and 3D-printed case, plus a Python background service.'
date: '2025-07-01'
showHeroImage: false
tags:
  - ESP32
  - Embedded
  - C++
  - Python
comments: false
sidebar:
  enable: false
  toc: false
  relatedPosts: false
---

A secondary display that shows live PC statistics and connects over one USB cable. It needs no video output, so it takes nothing from the GPU and does not disturb multi-monitor setups. Built from March to July 2025.

## What it does

- Shows CPU and GPU load and temperature, RAM use, network speeds and the currently playing track.
- Has a swipeable touch interface with dashboard, clock and media screens.
- Gauges glide smoothly to new values instead of jumping.

## How it works

- **PC side:** a headless Python service, compiled to a background executable that starts with Windows, reads system and GPU sensors and the Windows media session. It sends a short delimited text packet over USB serial every 0.5 seconds.
- **Display side:** firmware in C++ on an ESP32-S2 reads those packets without blocking the interface, and draws the screens with the LVGL graphics library.

## Hardware

The ESP32-S2 board is a mass-produced all-in-one module. I chose and matched the other parts to it: a 4.3 inch 480×272 IPS touchscreen, a wireless module and a 3D-printed case and stand. That meant checking data sheets, dimensions and electrical specifications against each other, then having the connections soldered.

## The hard part: bringing up undocumented hardware

The screen's documentation did not match the board, so I wrote Arduino code that tried pin and address combinations until the display and touch controller responded. That gave the real wiring: the touch chip on I²C address 0x14 using GPIO 18 and 16.

Two further problems came up:

- **Shared reset line:** the display and touch controller share one reset pin, and the standard libraries fought over it and crashed the board. I skipped the library's touch start-up, wrote the wake-up sequence for the touch chip myself and told the libraries to leave the pin alone.
- **Inverted colours:** the panel came up with inverted colours, so I sent the controller a raw inversion command before the graphics library started.

I also pushed the display bus to its 80 MHz limit and sized the drawing buffer to fit the chip's limited memory.

## Stack

ESP32-S2, C++ (Arduino framework, PlatformIO), LVGL and SquareLine Studio, SPI and I²C, Python (psutil, NVML, asyncio, PyInstaller).
