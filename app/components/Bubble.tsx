'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Noise } from 'noisejs';

const Bubble = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const noise = new Noise(Math.random());
    if (!mountRef.current) return;
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

    // Function to update geometry with Perlin noise and make the shape change slowly
    const updateGeometry = () => {
      const time = performance.now() * 0.0001; // Slower time factor
      const k = 1;

      // Update vertices using Perlin noise with a more dynamic effect
      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i).setLength(k);

        // Apply Perlin noise for shape change
        const n = noise.perlin3(vertex.x + time, vertex.y + time, vertex.z + time);
        
        // Apply dynamic scaling factor to make the bubble change shape slowly
        const scaleFactor = 1 + 0.3 * n + 0.1 * Math.sin(time + vertex.x * 3); // Added sine for continuous variation
        
        // Set vertex position with the new scale factor for deformation
        vertex.setLength(scaleFactor);
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }

      positions.needsUpdate = true;
      sphereGeometry.computeVertexNormals(); 
    };

    const clock = new THREE.Clock(); 

    // Animation loop with slowed down rotation, shape deformation, and volume expansion
    let scaleTime = 0; // Initialize scale time
    const animate = () => {
      const delta = clock.getDelta(); 
      
      // Apply slow rotation
      sphere.rotation.x += delta * 0.3; // Slower rotation
      sphere.rotation.y += delta * 0.3; // Slower rotation

      // Scale the bubble (increase volume over time)
      scaleTime += delta * 0.1; // Control the rate of expansion
      const scaleAmount = 1 + Math.sin(scaleTime) * 0.2; // Make it oscillate
      sphere.scale.set(scaleAmount, scaleAmount, scaleAmount); // Apply uniform scaling

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
