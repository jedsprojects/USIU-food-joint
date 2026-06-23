import {
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL,
} from '../config/cloudinary';

interface CloudinaryUploadResponse {
  secure_url: string;
  error?: { message: string };
}

async function postToCloudinary(body: FormData): Promise<string> {
  body.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body });
  const data = (await res.json()) as CloudinaryUploadResponse;

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Cloudinary upload failed (${res.status})`);
  }

  return data.secure_url;
}

export async function uploadImage(file: File | Blob, folder?: string): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  if (folder) body.append('folder', folder);
  return postToCloudinary(body);
}

export async function uploadImageFromUrl(url: string, folder?: string): Promise<string> {
  const body = new FormData();
  body.append('file', url);
  if (folder) body.append('folder', folder);
  return postToCloudinary(body);
}
