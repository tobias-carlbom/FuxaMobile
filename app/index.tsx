import { View, useWindowDimensions } from "react-native";
import { WebView } from "react-native-webview";
import { useEffect, useRef, useState } from "react";

export default function Index() {
  const { width, height } = useWindowDimensions();
  const prev = useRef({ width, height });
  const [webKey, setWebKey] = useState(0);

  /*
  useEffect(() => {
    const changed = prev.current.width !== width || prev.current.height !== height;
    if (changed) {
      prev.current = { width, height };
      setTimeout(() => setWebKey((k) => k + 1), 1000);
    }
  }, [width, height]);
  */

  return (
    <View style={{ flex: 1 }}>
      <WebView key={webKey} source={{ uri: "http://172.31.0.30:1881" }} />
    </View>
  );
}
