import { api } from './api';

export interface UploadResponse {
  filename: string;
  originalName: string;
  url: string;
  size: number;
}

export const uploadService = {
  async uploadScreenshot(base64Data: string): Promise<UploadResponse> {
    // Convert base64 to blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', blob, 'screenshot.png');
    
    const response = await api.post<UploadResponse>('/upload/screenshot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
}; 