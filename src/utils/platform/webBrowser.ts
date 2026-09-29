/** expo-web-browser → window.open (Pure Web Implementation) */

export const maybeCompleteAuthSession = () => { };

export const warmUpAsync = async () => { };

export const coolDownAsync = async () => { };

export const openBrowserAsync = async (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
  return { type: 'opened' };
};

/**
 * On the web the OAuth round-trip cannot deep-link back into a custom scheme,
 * so this opens the provider page in a popup and uses a BroadcastChannel to return tokens.
 */
let activePopup: Window | null = null;

export const openAuthSessionAsync = (url: string, _redirectUrl?: string) =>
  new Promise<{ type: 'success' | 'dismiss' | 'cancel'; url: string | null }>((resolve) => {
    const resolved = url.startsWith('http') ? url : window.location.origin + url;
    const popup = window.open(resolved, 'google-login', 'width=520,height=640');

    activePopup = popup;
    
    if (!popup) return resolve({ type: 'cancel', url: null });

    const authChannel = new BroadcastChannel('google_oauth_channel');
    let done = false;
    let timeout: ReturnType<typeof setTimeout>;

    const finish = (result: { type: 'success' | 'dismiss'; url: string | null }) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      authChannel.close();
      resolve(result);
    };

    authChannel.onmessage = (event) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data.url) {
        try { popup.close(); } catch {}
        finish({ type: 'success', url: event.data.url });
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        try { popup.close(); } catch {}
        finish({ type: 'dismiss', url: null });
      }
    };

    // COOP makes popup.closed unreliable, so use a generous timeout instead
    timeout = setTimeout(() => finish({ type: 'dismiss', url: null }), 5 * 60 * 1000);
  });

export const dismissBrowser = () => {
  try { activePopup?.close(); } catch {}
  activePopup = null;
};

export const dismissAuthSession = dismissBrowser;

export const WebBrowserAuthSessionResult = {};

// FIXED: Aligned default export keys to match all accessible exports perfectly
export default { 
  maybeCompleteAuthSession, 
  warmUpAsync, 
  coolDownAsync, 
  openBrowserAsync, 
  openAuthSessionAsync,
  dismissBrowser,
  dismissAuthSession
};
