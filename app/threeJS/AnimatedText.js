"use client"
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const AnimatedText = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(400, 100);
    mountRef.current.appendChild(renderer.domElement);

    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
      const textGeometry = new TextGeometry('HI', {
        font: font,
        size: 1.5,
        depth: 0.3,
      });

      // Text material (red color)
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      scene.add(textMesh);

      // Create black border (outline)
      const edges = new THREE.EdgesGeometry(textGeometry);  // Generates edges from the geometry
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });  // Black border
      const lineSegments = new THREE.LineSegments(edges, lineMaterial);
      scene.add(lineSegments);

      camera.position.z = 5;

      const animate = () => {
        requestAnimationFrame(animate);
        textMesh.rotation.x += 0.01;
        textMesh.rotation.y += 0.01;
        lineSegments.rotation.x += 0.01;
        lineSegments.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    });

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
