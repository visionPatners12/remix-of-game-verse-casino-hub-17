import { DeviceInfo, DevicePlatform } from '../types/sms';

// Generate a unique device ID
function generateDeviceId(): string {
  // Try to get from localStorage first
  let deviceId = localStorage.getItem('device_id');
  if (deviceId) {
    return deviceId;
  }
  
  // Generate new UUID-like ID
  deviceId = 'device_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  localStorage.setItem('device_id', deviceId);
  return deviceId;
}

// Detect device platform
function getDevicePlatform(): DevicePlatform {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('iphone') || userAgent.includes('ipod')) {
    return 'ios';
  } else if (userAgent.includes('ipad')) {
    return 'ipados';
  } else if (userAgent.includes('android')) {
    return 'android';
  } else {
    return 'web';
  }
}

// Get device model from user agent
function getDeviceModel(): string | undefined {
  const userAgent = navigator.userAgent;
  
  // iOS devices
  const iosMatch = userAgent.match(/iPhone(\d+,\d+)|iPad(\d+,\d+)|iPod(\d+,\d+)/);
  if (iosMatch) {
    return iosMatch[0];
  }
  
  // Android devices - extract model from user agent
  const androidMatch = userAgent.match(/Android[^;]*;\s*([^)]+)/);
  if (androidMatch && androidMatch[1]) {
    return androidMatch[1].trim();
  }
  
  // Fallback to platform info
  if ('platform' in navigator) {
    return navigator.platform;
  }
  
  return undefined;
}

// Get OS version
function getOSVersion(): string | undefined {
  const userAgent = navigator.userAgent;
  
  // iOS version
  const iosMatch = userAgent.match(/OS (\d+_\d+(?:_\d+)?)/);
  if (iosMatch) {
    return iosMatch[1].replace(/_/g, '.');
  }
  
  // Android version
  const androidMatch = userAgent.match(/Android (\d+(?:\.\d+)?(?:\.\d+)?)/);
  if (androidMatch) {
    return androidMatch[1];
  }
  
  // Windows version
  const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
  if (windowsMatch) {
    return windowsMatch[1];
  }
  
  // macOS version
  const macMatch = userAgent.match(/Mac OS X (\d+[_\.]\d+(?:[_\.]\d+)?)/);
  if (macMatch) {
    return macMatch[1].replace(/_/g, '.');
  }
  
  return undefined;
}

// Get app version from package.json or environment
function getAppVersion(): string {
  // In a real app, this would come from your build process
  // For now, we'll use a hardcoded version
  return '1.0.0';
}

// Get user's IP address (this will be approximate since we can't get real IP from browser)
async function getUserIP(): Promise<string | undefined> {
  try {
    // Using a free IP detection service
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.ip;
    }
  } catch (error) {
    console.warn('Could not fetch IP address:', error);
  }
  
  return undefined;
}

// Main function to collect all device information
export async function collectDeviceInfo(): Promise<DeviceInfo> {
  const deviceInfo: DeviceInfo = {
    device_id: generateDeviceId(),
    device_platform: getDevicePlatform(),
    device_model: getDeviceModel(),
    os_version: getOSVersion(),
    app_version: getAppVersion(),
    user_agent: navigator.userAgent,
    is_trusted_user: false, // Default to false, can be enhanced with user reputation logic
  };
  
  // Try to get IP address asynchronously
  try {
    deviceInfo.ip = await getUserIP();
  } catch (error) {
    console.warn('Could not get IP address:', error);
  }
  
  return deviceInfo;
}

// Helper function to get device info synchronously (without IP)
export function collectDeviceInfoSync(): Omit<DeviceInfo, 'ip'> {
  return {
    device_id: generateDeviceId(),
    device_platform: getDevicePlatform(),
    device_model: getDeviceModel(),
    os_version: getOSVersion(),
    app_version: getAppVersion(),
    user_agent: navigator.userAgent,
    is_trusted_user: false,
  };
}