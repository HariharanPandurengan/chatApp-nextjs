"use client"
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

const AnimatedText = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // Enable transparency
    renderer.setSize(400, 100); // Adjust the size to fit the container
    renderer.setPixelRatio(window.devicePixelRatio); // High-resolution displays
    mountRef.current.appendChild(renderer.domElement);

    // Load font for the text
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
      const textGeometry = new THREE.TextGeometry('HI', {
        font: font,
        size: 1.5, // Adjust the size of the text
        height: 0.3, // Depth of the text
      });

      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      scene.add(textMesh);

      camera.position.z = 5;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        textMesh.rotation.x += 0.01;
        textMesh.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    });

    // Cleanup on unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div ref={mountRef} />
    </div>
  );
};

export default AnimatedText;

