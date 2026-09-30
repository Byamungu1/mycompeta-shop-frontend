import { useEffect } from 'react';
import { TouchableOpacity } from './common/ui';

export default function LoginCallback() {
   useEffect(() => {
      const currentUrl = window.location.href;
      console.log("🌐 Popup matched route! Current URL containing tokens:", currentUrl);

      // 1. Open the matching communication channel pipeline

      // Inside LoginCallback.tsx
      const authChannel = new BroadcastChannel('google_oauth_channel');

      authChannel.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', url: window.location.href });
      authChannel.close();

      // 3. Close the channel reference in this window context
      authChannel.close();
      window.close()
   }, []);

   return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
         <p style={{ fontSize: '1.1rem', color: '#333' }}>Finalizing secure login state, please wait...</p>
      </div>
   );
}
