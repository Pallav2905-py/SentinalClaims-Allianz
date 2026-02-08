import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.mp3', '.wav', '.m4a'];

/**
 * Ensure uploads directory exists
 */
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}${ext}`;
}



/**
 * Validate file object from FormData
 */
function validateFileFromFormData(file) {
  const ext = path.extname(file.name).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`File type not allowed: ${ext}. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  return true;
}

/**
 * Parse multipart form data with files (Next.js App Router compatible)
 */
export async function parseFormData(request) {
  await ensureUploadDir();

  try {
    // Use Web API formData() method
    const formData = await request.formData();
    
    // Process uploaded files
    const uploadedFiles = [];
    const fields = {};
    
    for (const [key, value] of formData.entries()) {
      // Check if value is a File object
      if (value instanceof File) {
        // Validate file
        validateFileFromFormData(value);
        
        // Generate unique filename
        const uniqueName = generateUniqueFilename(value.name);
        const filePath = path.join(UPLOAD_DIR, uniqueName);
        
        // Convert File to Buffer and save
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(filePath, buffer);
        
        uploadedFiles.push({
          filename: uniqueName,
          originalName: value.name,
          path: `/uploads/${uniqueName}`,
          size: value.size,
          mimeType: value.type,
        });
      } else {
        // Regular field
        fields[key] = value;
      }
    }
    
    return {
      fields,
      files: uploadedFiles,
    };
  } catch (error) {
    throw new Error('Failed to parse form data: ' + error.message);
  }
}

/**
 * Delete uploaded file
 */
export async function deleteUploadedFile(filename) {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    await unlink(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Delete multiple files
 */
export async function deleteUploadedFiles(filePaths) {
  const results = await Promise.allSettled(
    filePaths.map(async (filePath) => {
      const filename = path.basename(filePath);
      return deleteUploadedFile(filename);
    })
  );
  
  return results.every(result => result.status === 'fulfilled' && result.value);
}

/**
 * Get file info
 */
export function getFileInfo(filename) {
  const filePath = path.join(UPLOAD_DIR, filename);
  
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  } catch (error) {
    return {
      exists: false,
    };
  }
}


