import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { SettingsService } from '../settings/settings.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GoogleDriveService {
  private drive: any;

  constructor(private settingsService: SettingsService) {}

  async initialize() {
    try {
      // Get Google Drive credentials from settings
      const credentialsSetting = await this.settingsService.findByKey('google_drive_credentials');
      const folderIdSetting = await this.settingsService.findByKey('google_drive_folder_id');

      if (!credentialsSetting || !folderIdSetting) {
        console.log('Google Drive not configured. Using local storage.');
        return false;
      }

      const credentials = JSON.parse(credentialsSetting.value);
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      this.drive = google.drive({ version: 'v3', auth });
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
      return false;
    }
  }

  async uploadFile(
    quotationNumber: string,
    file: Express.Multer.File,
    fileType: 'po' | 'iv' | 'it',
  ): Promise<string> {
    const isInitialized = await this.initialize();
    
    if (!isInitialized) {
      throw new Error('Google Drive is not configured');
    }

    const folderIdSetting = await this.settingsService.findByKey('google_drive_folder_id');
    const parentFolderId = folderIdSetting.value;

    // Create or get job order folder
    const jobFolderId = await this.getOrCreateFolder(quotationNumber, parentFolderId);

    // Generate filename
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${fileType}_${timestamp}${ext}`;

    // Upload file
    const fileMetadata = {
      name: filename,
      parents: [jobFolderId],
    };

    const media = {
      mimeType: file.mimetype,
      body: require('stream').Readable.from(file.buffer),
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    // Return file info
    return JSON.stringify({
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
    });
  }

  private async getOrCreateFolder(folderName: string, parentId: string): Promise<string> {
    // Search for existing folder
    const response = await this.drive.files.list({
      q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create new folder
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    };

    const folder = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return folder.data.id;
  }

  async getFileUrl(fileInfo: string): Promise<string> {
    try {
      const info = JSON.parse(fileInfo);
      return info.webViewLink || `https://drive.google.com/file/d/${info.fileId}/view`;
    } catch {
      return '';
    }
  }

  async deleteFile(fileInfo: string): Promise<void> {
    const isInitialized = await this.initialize();
    
    if (!isInitialized) {
      return;
    }

    try {
      const info = JSON.parse(fileInfo);
      await this.drive.files.delete({
        fileId: info.fileId,
      });
    } catch (error) {
      console.error('Failed to delete file from Google Drive:', error);
    }
  }
}
