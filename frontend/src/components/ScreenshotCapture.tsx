import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Typography,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Crop as CropIcon, 
  Save as SaveIcon,
  ScreenShare as ScreenShareIcon,
  PhotoCamera as PhotoCameraIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface ScreenshotCaptureProps {
  open: boolean;
  onClose: () => void;
  onSave: (screenshot: string, title: string) => void;
  pageUrl: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const steps = ['Choose Method', 'Capture', 'Crop & Edit', 'Add Title'];

export const ScreenshotCapture: React.FC<ScreenshotCaptureProps> = ({
  open,
  onClose,
  onSave,
  pageUrl,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [screenshot, setScreenshot] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [screenshotTitle, setScreenshotTitle] = useState('');
  const [error, setError] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMethod, setCaptureMethod] = useState<'screen' | 'tab' | null>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async (): Promise<string> => {
    if (!croppedAreaPixels || !screenshot) {
      throw new Error('No crop area or screenshot available');
    }

    const image = new Image();
    image.src = screenshot;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas context not available');
        }

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        resolve(canvas.toDataURL('image/png'));
      };
    });
  }, [croppedAreaPixels, screenshot]);

  const captureScreen = async () => {
    try {
      setIsCapturing(true);
      setError('');

      // Check if screen capture is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen capture is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.');
      }

      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      // Create video element to capture the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
      };

      // Wait a moment for the video to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create canvas to capture the frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0);

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to data URL
      const screenshotData = canvas.toDataURL('image/png');
      setScreenshot(screenshotData);
      setActiveStep(2);
      setIsCapturing(false);
    } catch (err) {
      console.error('Error capturing screenshot:', err);
      setError(err instanceof Error ? err.message : 'Failed to capture screenshot. Please try again.');
      setIsCapturing(false);
    }
  };

  const handleCropSave = useCallback(async () => {
    try {
      const croppedScreenshot = await getCroppedImg();
      setScreenshot(croppedScreenshot);
      setActiveStep(3);
    } catch (err) {
      console.error('Error cropping screenshot:', err);
      setError('Failed to crop screenshot. Please try again.');
    }
  }, [getCroppedImg]);

  const handleFinalSave = () => {
    if (!screenshotTitle.trim()) {
      setError('Please enter a title for the screenshot');
      return;
    }

    onSave(screenshot, screenshotTitle.trim());
    handleClose();
  };

  const handleClose = () => {
    setActiveStep(0);
    setScreenshot('');
    setScreenshotTitle('');
    setError('');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCaptureMethod(null);
    setIsCapturing(false);
    onClose();
  };

  const handleMethodSelect = (method: 'screen' | 'tab') => {
    setCaptureMethod(method);
    setActiveStep(1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Capture Method
            </Typography>
            <Typography variant="body1" paragraph>
              Select how you want to capture the screenshot:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 3 },
                    border: captureMethod === 'screen' ? '2px solid #1976d2' : '1px solid #e0e0e0'
                  }}
                  onClick={() => handleMethodSelect('screen')}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <ScreenShareIcon sx={{ mr: 1, fontSize: 40 }} color="primary" />
                      <Box>
                        <Typography variant="h6">Capture Screen</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Capture your entire screen or a specific window
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Chip label="Recommended" color="primary" size="small" />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        • Works with any website<br/>
                        • No browser restrictions<br/>
                        • High quality capture
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 3 },
                    border: captureMethod === 'tab' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    opacity: 0.6
                  }}
                  onClick={() => handleMethodSelect('tab')}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PhotoCameraIcon sx={{ mr: 1, fontSize: 40 }} color="action" />
                      <Box>
                        <Typography variant="h6">Capture Tab</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Capture the current browser tab
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Chip label="Limited Support" color="warning" size="small" />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        • Requires Chrome extension<br/>
                        • Limited browser support<br/>
                        • May not work with all sites
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Capture Screenshot
            </Typography>
            
            <Box>
              <Typography variant="body1" paragraph>
                Click the button below to capture your screen. You'll be prompted to select which screen or window to capture.
              </Typography>
              
              <Card sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Instructions:
                </Typography>
                <Typography variant="body2" component="div">
                  1. Click "Capture Screen" below<br/>
                  2. Select the screen/window you want to capture<br/>
                  3. The screenshot will be captured automatically<br/>
                  4. You can then crop and edit the image
                </Typography>
              </Card>

              <Button
                variant="contained"
                onClick={captureScreen}
                disabled={isCapturing}
                startIcon={isCapturing ? <RefreshIcon /> : <ScreenShareIcon />}
                size="large"
              >
                {isCapturing ? 'Capturing...' : 'Capture Screen'}
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Crop & Edit Screenshot
            </Typography>
            
            {screenshot ? (
              <Box>
                <Typography variant="body1" paragraph>
                  Adjust the crop area to focus on the relevant part of the screenshot. You can zoom in for precise selection of small elements.
                </Typography>
                
                <Card sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cropping Tips:
                  </Typography>
                  <Typography variant="body2" component="div">
                    • Drag the corners to resize the crop area<br/>
                    • Use the zoom slider to get closer for precise selection<br/>
                    • Click and drag inside the crop area to move it<br/>
                    • The grid helps align with page elements
                  </Typography>
                </Card>

                <Box sx={{ position: 'relative', height: '400px', mb: 2 }}>
                  <Cropper
                    image={screenshot}
                    crop={crop}
                    zoom={zoom}
                    aspect={undefined}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    showGrid={true}
                    cropSize={{ width: 200, height: 200 }}
                    minZoom={0.5}
                    maxZoom={3}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Zoom: {Math.round(zoom * 100)}%
                  </Typography>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={() => setActiveStep(1)}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCropSave}
                    startIcon={<CropIcon />}
                  >
                    Crop & Continue
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" paragraph>
                  No screenshot available. Please go back and capture a screenshot first.
                </Typography>
                <Button variant="outlined" onClick={() => setActiveStep(1)}>
                  Back
                </Button>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Title
            </Typography>
            <Typography variant="body1" paragraph>
              Give your screenshot a descriptive title.
            </Typography>
            
            <TextField
              fullWidth
              label="Screenshot Title"
              value={screenshotTitle}
              onChange={(e) => setScreenshotTitle(e.target.value)}
              placeholder="e.g., Homepage Navigation Issue"
              sx={{ mb: 2 }}
            />
            
            {screenshot && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview:
                </Typography>
                <img
                  src={screenshot}
                  alt="Screenshot preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => setActiveStep(2)}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleFinalSave}
                startIcon={<SaveIcon />}
              >
                Save Screenshot
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Live Screenshot Capture</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}; 