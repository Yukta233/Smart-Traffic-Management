// File: TrafficBackground.js
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function TrafficBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe9ecf1); // instead of 0xf0f2f5
 // light, formal background

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Soft grey grid
    const gridHelper = new THREE.GridHelper(100, 20, 0xcccccc, 0xeeeeee);
    scene.add(gridHelper);

    // White traffic nodes (intersection points)
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const nodeGeometry = new THREE.SphereGeometry(0.4, 12, 12);
    for (let x = -16; x <= 16; x += 8) {
      for (let z = -16; z <= 16; z += 8) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.set(x, 0.1, z);
        scene.add(node);
      }
    }

    // Smooth vehicle lines
   const lineMaterial = new THREE.LineDashedMaterial({
  color: 0x999999,
  dashSize: 0.6,
  gapSize: 0.6,
});
    const vehicleLines = [];
    for (let i = 0; i < 6; i++) {
      const start = new THREE.Vector3(-20 + i * 8, 0.05, -20);
      const end = new THREE.Vector3(-20 + i * 8, 0.05, 20);
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const line = new THREE.Line(geometry, lineMaterial);
      vehicleLines.push(line);
      scene.add(line);
    }

    // Animate light dots (representing vehicle flow)
    const flowMaterial = new THREE.MeshBasicMaterial({ color: 0x2196f3 });
    const flowGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const flows = [];
    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(flowGeometry, flowMaterial);
      mesh.position.set(-20 + (i % 5) * 8, 0.15, Math.random() * 40 - 20);
      mesh.userData.speed = 0.05 + Math.random() * 0.05;
      scene.add(mesh);
      flows.push(mesh);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      flows.forEach(f => {
        f.position.z += f.userData.speed;
        if (f.position.z > 20) f.position.z = -20;
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      const el = mountRef.current;
      if (el && renderer.domElement && el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        zIndex: -1,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
}

export default TrafficBackground;