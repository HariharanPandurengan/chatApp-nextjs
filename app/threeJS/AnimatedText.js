"use client"
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const AnimatedText = () => {
  const mountRef = useRef(null);
  const letterHRef = useRef(null);
  const letterIRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(400, 100);
    mountRef.current.appendChild(renderer.domElement);

    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
      // Create text geometry for 'H'
      const textGeometryH = new TextGeometry('H', {
        font: font,
        size: 1.5,
        depth: 0.3,
      });

      // Create text geometry for 'I'
      const textGeometryI = new TextGeometry('I', {
        font: font,
        size: 1.5,
        depth: 0.3,
      });

      // Create materials
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 }); // Red color
      const letterH = new THREE.Mesh(textGeometryH, textMaterial);
      const letterI = new THREE.Mesh(textGeometryI, textMaterial);

      // Create black border (outline)
      const edges = new THREE.EdgesGeometry(textGeometry);  // Generates edges from the geometry
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });  // Black border
      const lineSegments = new THREE.LineSegments(edges, lineMaterial);
      scene.add(lineSegments);

      // Position letters
      letterH.position.x = -3; // Start 'H' from the left
      letterI.position.x = 3; // Start 'I' from the right

      scene.add(letterH);
      scene.add(letterI);

      camera.position.z = 5;

      // Animation variables
      let animationProgress = 0;

      const animate = () => {
        animationProgress += 0.01; // Increment progress

        // Move and rotate 'H' from the left
        if (animationProgress <= 1) {
          letterH.position.x += 0.05; // Move 'H' right
          letterH.rotation.z += 0.05; // Rotate 'H'
        }

        // Move and rotate 'I' from the right
        if (animationProgress <= 1) {
          letterI.position.x -= 0.05; // Move 'I' left
          letterI.rotation.z -= 0.05; // Rotate 'I'
        }

        // Check if letters have met
        if (animationProgress >= 1) {
          letterH.position.x = 0; // Snap 'H' to the center
          letterI.position.x = 0; // Snap 'I' to the center
          letterH.rotation.z = 0; // Reset rotation
          letterI.rotation.z = 0; // Reset rotation
        }

        renderer.render(scene, camera);

        // Stop the animation after the letters meet
        if (animationProgress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    });

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div ref={mountRef} />
    </div>
  );
};

export default AnimatedText;
