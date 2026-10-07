'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// Helper to extract the cropped image using HTML5 Canvas
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      // Create a fake file from the blob for the uploader
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', 1);
  });
}

export default function ImageCropModal({ imageSrc, onComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      onComplete(croppedFile);
    } catch (e) {
      console.error(e);
      alert('Error cropping image');
    }
    setIsProcessing(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.8)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ width: '90%', maxWidth: '500px', background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-serif)' }}>Crop Image</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
        </div>
        
        <div style={{ position: 'relative', width: '100%', height: '400px', background: '#333' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Force square crop
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Zoom:</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              style={{ flex: 1, accentColor: 'var(--rose)' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={onCancel} className="btn-ghost" disabled={isProcessing}>Cancel</button>
            <button onClick={handleConfirm} className="btn-primary" disabled={isProcessing}>
              {isProcessing ? 'Cropping...' : 'Crop & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
