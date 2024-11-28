'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Noise } from 'noisejs';

const Bubble = () => {
  const mountRef = useRef(null); 

  useEffect(() => {
    const noise = new Noise(Math.random());

    // Set up the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x2a2927); // Set background color
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create a new scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Create the sphere 
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64); 
    const material = new THREE.MeshStandardMaterial({
      color: 0xa9a9a9,
      metalness: 0.6, 
      roughness: 0.4,
    });

    const sphere = new THREE.Mesh(sphereGeometry, material);
    scene.add(sphere);

    // Add optimized lighting
    const ambientLight = new THREE.AmbientLight(0x798296, 0.7); 
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Helper variables for update
    const vertex = new THREE.Vector3();
    const positions = sphereGeometry.attributes.position;

    const updateGeometry = () => {
      const time = performance.now() * 0.003;
      const k = 1;

      // Update vertices using Perlin noise
      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i).setLength(k);
        const n = noise.perlin3(vertex.x + time, vertex.y + time, vertex.z + time);
        vertex.setLength(1 + 0.3 * n);
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }

      positions.needsUpdate = true;
      sphereGeometry.computeVertexNormals(); 
    };

    const clock = new THREE.Clock(); 

    // Animation loop
    const animate = () => {
      const delta = clock.getDelta(); 
      sphere.rotation.x += delta * 0.01; 
      sphere.rotation.y += delta * 0.01;

      updateGeometry();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />;
};

export default Bubble;
