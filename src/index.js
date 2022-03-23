import React from 'react';
import ReactDOM from 'react-dom';
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import './index.css';
import getRecords from './requests/getRecords.js';

(function () {
  'use strict';
  // Set Custom View's ID in .env
  const customViewID = Number(process.env.VIEW_ID);
  // Increment to confirm script version on Kintone
  const scriptVer = '1.0.1';
  console.log(`\nScript version: ${scriptVer}\n\n`);

  kintone.events.on('app.record.index.show', function (event) {
    if (event.viewId !== customViewID) {
      console.log('View ID from APP: ' + event.viewId)
      console.log('VIEW_ID from env: ' + customViewID)
      console.log('Not on the Custom View');
      return event
    }

    function App() {

      // Three takes some time to load in. We create a "ref" in advance to tell react / browsers that our canvas will show up here.
      const mountRef = useRef(null);
      // The Renderer, which calculates how to display our viewpoint, and the shapes.
      var renderer = new THREE.WebGLRenderer();
      // Add it to the DOM
      mountRef.current.appendChild(renderer.domElement);

      const makeCube = (shape) => {
        //Extract the values
        let length = shape.length;
        let width = shape.width;
        let depth = shape.depth;
        //Choose a random color
        var randomColor = THREE.MathUtils.randInt(0, 0xffffff)
        console.log('cube found... building...');
        //Wireframe of cube
        var cubeGeometry = new THREE.BoxGeometry(Number(length), Number(width), Number(depth));
        //Shiny skin for cubes
        var greyPhongMat = new THREE.MeshPhongMaterial({
          color: randomColor,
          specular: new THREE.Color("rgb(140,70,140)"),
          shininess: 10,
          transparent: 1,
          opacity: 1,
          flatShading: true
        });
        //Combine them
        var cube = new THREE.Mesh(cubeGeometry, greyPhongMat);
        //Position it randomly
        cube.position.x = Math.random() * 70 - 35;
        cube.position.y = Math.random() * 30 - 35;
        cube.position.z = Math.random() * 30 - 15;
        return (cube);
      }

      const makeTorus = (shape) => {
        //Extract the values
        let length = shape.length;
        let width = shape.width;
        let depth = shape.depth;
        //Choose a random color
        var randomColor = THREE.MathUtils.randInt(0, 0xffffff)
        console.log('torus found... building...');
        //Create the wireframe
        const torusGeometry = new THREE.TorusGeometry(Number(length), Number(width), Number(depth), 100);
        //Create a flat color skin of a random color
        const torusMaterial = new THREE.MeshStandardMaterial({
          color: randomColor,
        });
        //Combine them
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        //Position it randomly
        torus.position.x = Math.random() * 70 - 5;
        torus.position.y = Math.random() * 30 - 5;
        torus.position.z = Math.random() * 30 - 15;
        return (torus);
      }
      useEffect(() => {
        // The Scene, our canvas to display our 3D space.
        var scene = new THREE.Scene();

        // A cool space background for our scene
        const spaceBackground = new THREE.TextureLoader().load('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTN8fHxlbnwwfHx8fA%3D%3D&w=1000&q=80');
        scene.background = spaceBackground;

        // The Camera, our viewpoint in the 3D space.
        var camera = new THREE.PerspectiveCamera(
          75, // Camera Field of View (FOV)
          window.innerWidth / window.innerHeight, // aspect — Camera frustum aspect ratio.
          0.1, //near — Camera frustum near plane.
          1000 //far — Camera frustum far plane.
        );

        // Set the viewport size to the width and length of our window.
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Move our camera out a bit.
        camera.position.z = 70;

        // add a global light
        const light = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(light);

        // Magenta-Pink Pointlight
        var L1 = new THREE.PointLight(0xB887ED, 1.5);
        L1.position.z = 45;
        L1.position.y = 20;
        L1.position.x = 20;
        scene.add(L1);
        // Dark Purple Pointlight
        var L2 = new THREE.PointLight(0x436CE8, 1.5);
        L2.position.z = 45;
        L2.position.y = -15;
        L2.position.x = -20;
        scene.add(L2);

        //Records API call
        getRecords().then(
          result => {
            //For each shape record
            result.forEach(shape => {
              //for shapeType Cube, make a cube
              switch (shape.shapeType) {
                case "Cube":
                  scene.add(makeCube(shape));
                  break;
                //For torus, create a torus
                case "Torus":
                  scene.add(makeTorus(shape));
                  break;
                default:
                  break;
              }
            });
          }
        );
        // Animation Loop. Rotate the cube on the X and Y axis by 0.0X per frame.
        var animate = function () {
          requestAnimationFrame(animate);
          //Go through our entire scene
          scene.traverse(function (node) {
            //If you find a "mesh"
            if (node instanceof THREE.Mesh) {
              //Rotate it
              node.rotation.x += Math.random() / 10;
              node.rotation.y += Math.random() / 10;
            }
          });
          renderer.render(scene, camera);
        };
        //If the window size changes, change the canvas size too
        let onWindowResize = function () {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener("resize", onWindowResize, false);
        // Animate gets called by useEffect on page load.
        animate();
        // Free up memory space when we change pages away <- A react best practice for "Single Page Apps"
        return () => mountRef.current.removeChild(renderer.domElement);
      }, []);

      return (
        //Our mounted canvas
        <div ref={mountRef} className="App">
        </div>
      );
    }

    ReactDOM.render(
      // React StrictMode activates additional checks useful for debugging. Ignored in production builds!
      <React.StrictMode >
        <App />
      </React.StrictMode>,
      document.getElementById('root')
    );
    return event;
  });
})();