/**
 * HubSpot Tracking Utilities
 * Handles HubSpot tracking cookie (hutk) for proper visitor tracking and form analytics
 */

/**
 * Get HubSpot tracking cookie value from browser
 * The cookie is named 'hubspotutk' and is essential for connecting
 * visitor data with form submissions
 */
export function getHubSpotTrackingCookie(): string | null {
  if (typeof document === 'undefined') {
    return null; // Server-side rendering
  }
  
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'hubspotutk') {
      console.log('Found HubSpot tracking cookie:', value.substring(0, 10) + '...');
      return value;
    }
  }
  
  console.log('No HubSpot tracking cookie found');
  return null;
}

/**
 * Get page context for HubSpot form submission
 */
export function getPageContext() {
  if (typeof window === 'undefined') {
    return {
      pageUri: '',
      pageName: '',
      ipAddress: null
    };
  }
  
  return {
    pageUri: window.location.href,
    pageName: document.title || 'Quote Form',
    ipAddress: null // Will be set server-side
  };
}

/**
 * Format tracking data for HubSpot Forms API
 */
export interface HubSpotTrackingData {
  hutk?: string | null;
  pageUri: string;
  pageName: string;
  ipAddress?: string | null;
}

export function getTrackingData(): HubSpotTrackingData {
  return {
    hutk: getHubSpotTrackingCookie(),
    ...getPageContext()
  };
}

/**
 * Install HubSpot tracking code on the page
 * This should be called once on page load to enable tracking
 */
export function installHubSpotTracking(portalId: string) {
  if (typeof window === 'undefined' || !portalId) {
    return;
  }
  
  // Check if already installed
  if ((window as any)._hsq) {
    console.log('HubSpot tracking already installed');
    return;
  }
  
  console.log('Installing HubSpot tracking for portal:', portalId);
  
  // Create the _hsq array if it doesn't exist
  (window as any)._hsq = (window as any)._hsq || [];
  
  // Create and append the HubSpot tracking script
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.defer = true;
  script.src = `https://js.hs-scripts.com/${portalId}.js`;
  
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);
  
  console.log('HubSpot tracking script added to page');
}