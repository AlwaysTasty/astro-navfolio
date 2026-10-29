---
title: 'Distributed CV & Embedded Control'
description: 'Multi-threaded, zero-copy UDP pipeline that offloads YOLOv8 / TensorRT inference from an ESP32 and drives it in real time.'
date: '2026-01-01'
showHeroImage: false
tags:
  - Computer Vision
  - TensorRT
  - ESP32
comments: false
sidebar:
  enable: false
  toc: false
  relatedPosts: false
---

A microcontroller is too small to run object detection, so this system splits the work: a GPU machine runs the vision model, and an ESP32 acts on the results.

## Highlights

- YOLOv8 inference accelerated with TensorRT
- Multi-threaded, zero-copy UDP pipeline between the inference host and the ESP32
- Under 10 ms latency at 60+ FPS end to end

## Stack

Python, PyTorch, TensorRT, OpenCV, network sockets, ESP32 firmware.
