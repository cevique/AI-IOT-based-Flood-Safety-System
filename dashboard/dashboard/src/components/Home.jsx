import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Text3D, Center } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three'; 

function RotatingMesh() {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} scale={2.5}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial 
            color="#4f46e5" 
            wireframe 
            emissive="#4f46e5"
            emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <RotatingMesh />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
        <div className="pointer-events-auto bg-black/30 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 mb-4 animate-pulse">
            Risin' Technologies
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-200 mb-2 font-light tracking-wide">
            Water Intelligence System
            </h2>
            <p className="text-lg text-gray-400 mb-8 italic">
            SineraOS coming soon!
            </p>
            
            <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full text-lg transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] active:scale-95"
            >
            Check Dashboard
            </button>
        </div>
      </div>
      
      {/* Footer/Copyright */}
      <div className="absolute bottom-4 w-full text-center text-gray-600 text-sm z-10">
        &copy; {new Date().getFullYear()} Risin' Technologies. All rights reserved.
      </div>
    </div>
  );
}

export default Home;
