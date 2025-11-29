import { ClinicData, INITIAL_DATA } from '../types';

const STORAGE_KEY = 'dental_flow_db';

// This simulates the Google Drive Sync. 
// In a real production app, you would replace localStorage calls with GAPI (Google API) calls.

export const storageService = {
  loadData: (): ClinicData => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    }
    return INITIAL_DATA;
  },

  saveData: (data: ClinicData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Hook for Google Drive Sync would go here
      // e.g., googleDriveService.updateFile('dental_db.json', JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save data", error);
    }
  },

  exportBackup: (data: ClinicData) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `dental_clinic_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  },

  importBackup: async (file: File): Promise<ClinicData | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          // Basic validation to check if it looks like our data
          if (json.patients && Array.isArray(json.patients) && json.settings) {
            resolve(json);
          } else {
            alert("Invalid backup file format.");
            resolve(null);
          }
        } catch (error) {
          console.error("Error parsing backup file", error);
          alert("Error reading file.");
          resolve(null);
        }
      };
      reader.readAsText(file);
    });
  },

  clearSession: () => {
    // Keep data, just clear session flags if any
    // To hard reset: localStorage.removeItem(STORAGE_KEY);
  }
};