---
layout: post
title:  "A dummy's introduction on using Kinect with ROS"
date:   2018-08-01 16:17:58 +0200
categories: jekyll update
---

# The background

You've all heard of the Kinect. There used to be an huge hype around it almost ten years ago (damn, how time flies!) as a revolutionary camera designed for the Xbox. And guess what? The designers nailed it. The Kinect is an awesome sensor. Whoever works in robotics knows how important depth information is and, before the Kinect took off, the only way to get it was through crazy expensive Lidars (we're talking thousands of Euros) and not-so-precise stereo cameras. The Microsoft team provided a pretty neat sensor for circa 120 bucks and, now the all the hype is gone, you can easily find kids selling for circa 20 Euros these masterpieces that the old school computer vision community could only dream about for decades.
Long story short (it's already quite long, actually), I got a Kinect for cheap to experiment with RGB-D SLAM. I'll hopefully cover the SLAM topic in my next blog posts. The first problem was getting it to *work*. There is no beginner-friendly material that I am aware of, especially for using the Kinect in a ROS (robotics operating system) environment, and I will try to get this covered here, hoping to be useful to people in my same situation.

# What you will need

This is a story on how I made the Kinect work under ROS, so I suppose you have some sort of knowledge about it. In particular, I will be using ROS Kinetic 16.04. Then, you will need a Kinect 360 (I have not tested a XBox One kinect) and a USB 3.0 port. By reading around, it looks like a 2.0 USB port is not supported for using the libfreenect library.

# Overview of the problem

My objective is to create a node that gets the RGB and depth images of the kinect and publish them over a ROS topic. Very straightforward. 
There are apparently already some catkin packages doing it, such as http://wiki.ros.org/kinect_node . They all looked pretty old and deprecated, and I did not find anything that was supported by ROS 16.04. Except for https://github.com/ros-drivers/openni_camera , which looks just perfect, but when I found it it was already too late: I had developed my own code, which I will present here. Too bad, at least I practiced some programming in the meantime. And this brings us to the main issue:

*Online there is a lot of interesting stuff. The problem is finding it. *

So, the only easy to access and well documented stuff are the libfreenect drivers, which are quite basic, but also interesting for the development on many languages. In particular, there is a C++ wrapper and a catkin package version of the libraries, which is all I needed for what I wanted to do. Let's put them into a ROS node!

If you just needed a package for using the Kinect, now you have the link you needed. If for any reason you prefer using other libraries, such as libfreenect, or you just want to hear some beginner's stories, just keep reading ;)

# Let's go for it!

You can find the code I make reference of  [here](https://github.com/bemilio/kinect_publisher) as a catkin package.
You will also need to download the previously mentioned lifreenect catkin package in the catkin workspace. To start developing my code, I downloaded [this](https://openkinect.org/wiki/C%2B%2BOpenCvExample) example. If you check my code, you will find *a lot* of similarities. In this example, I found some functions for interfacing the libfreenect libraries with opencv. I started from there, cleaned the code up, removed all the unnecessary stuff and added two ROS publishers (one for the RGB images and one for the Depth images). It is great to have the data as opencv objects, since that allows you to make all the magic of computer vision you want. These publishers use cvbridge to transform the opencv's Mat objects to a ROS message. The result can be found in the class defined [here](https://github.com/bemilio/kinect_publisher/blob/master/src/KinectDevice.cpp). And well, the usage of this class is very easy and you can read it in the [node](https://github.com/bemilio/kinect_publisher/blob/master/src/kinect_publisher_node.cpp) code:


```
//Initialize the class
Freenect::Freenect freenect;
kinect_publisher::KinectDevice& device = freenect.createDevice<kinect_publisher::KinectDevice>(0);
device.initializePublication(node);
ros::Rate loop_rate(40);
while(node.ok()){  
	\\Keep publishing the Kinect data
	device.retrieveRGBD(node, rgbMat, depthMat);
	loop_rate.sleep();
}
```

This class will then easily provide a bridge between the Kinect and your ROS environment. Furthermore, you will get the opencv data stored in your *rgbMat* and *depthMat* variables, so that it is easy to do some fancy stuff with them.
All you have to do is download the package and install it normally via:

```
catkin build kinect_publisher
```
and then run it through 
```
roslaunch kinect_publisher kinect_publisher.launch
```
To check everything is fine, fire up *rviz* while the code is running and click on *Add*. You can then show the depth or rgb image as in the picture:

![Rviz selection]({{ site.url }}/assets/images/Selectionshot_2018-08-01_15:52:08.png "Rviz selection")

and the result should be this:

![Rviz visualization]({{ site.url }}/assets/images/kinect_driver_screenshot.png "Rviz visualization")

# Beware of the CMake

The hardest part of this project was to make CMake link the libfreenect libraries correctly, so it is maybe nice to give some help to others who might face the same issues. I am really bad at writing and reading CMakeList files and this is why I am secretly in love with whoever developed the [catkin_simple](https://github.com/catkin/catkin_simple) package. catkin_simple magically lets you solve the dependencies from other catkin packages without editing the CMakeLists file. All you have to do is add a line like:
```
<depend>any_freaking_package</depend>
```
at your *package.xml* file and it will do its magic. Unfortunately, this magic was not strong enough for libfreenect.
By looking online, I eventually found [this](https://github.com/introlab/rtabmap/blob/master/cmake_modules/FindFreenect.cmake) CMake file. "FindFreenect" sounded like a promising name, and my CMake ignorance still allowed me to understand that this file, well, looks for Freenect libraries in different places. So I copy-pasted that code in my CMakeLists file, just before the linking part, and **IT WORKED!**

# Conclusions

So, in this post I put some links to various resources that might help you find stuff related to how to use the Kinect under ROS more easily. My suggestion is to use the OpenNI package (I would have done the same if I found it earlier). Still, if you want something simple and easily editable, or if you prefer *libfreenect* over *OpenNI*, I hope you will find my package useful. I don't think I will develop it any further, though.

# What's next?

I am going to share how the experiments with the SLAM go! Also, I plan to write an introduction to what SLAM is *"for dummies"*. The final plan is to run it on some sort of autonomous quadcopter or wheeled drone, so **keep on reading!**
