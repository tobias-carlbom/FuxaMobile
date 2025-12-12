import { View, useWindowDimensions } from "react-native";
import { WebView } from "react-native-webview";
import { useEffect, useRef, useState } from "react";

export default function Index() {
  const [webKey, setWebKey] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <WebView key={webKey} source={{ uri: "http://172.31.0.30:1881" }} />
    </View>
  );
}
