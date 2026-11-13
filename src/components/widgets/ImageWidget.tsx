import React, { useEffect, useRef, useState } from "react";
import { Box, Text } from "ink";
import { useWidgetContext } from "../FoundationWidget.js";
import terminalImage from "terminal-image";

interface ImageWidgetParams {
  path: string;
  width?: number;
  height?: number;
  preserveAspectRatio?: boolean;
  preferNativeRender?: boolean;
}

/**
 * ImageWidget: loads an image file and renders it to the terminal
 * using terminal-image's ANSI escape sequences.
 */
const ImageWidget = () => {
  const { config, layout } = useWidgetContext();

  const params = (config.params as unknown as ImageWidgetParams) || {};
  const imagePath = params.path;

  // Use layout dimensions minus border overhead for the image
  const targetWidth = params.width ?? (layout.width - 2);
  const targetHeight = params.height ?? (layout.height - 2);
  const preserveAspectRatio = params.preserveAspectRatio ?? true;

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setError(null);
    setImage(null);

    if (!imagePath) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const rendered = await terminalImage.file(imagePath, {
          width: targetWidth,
          height: targetHeight,
          preserveAspectRatio,
          preferNativeRender: params.preferNativeRender ?? false,
        });
        if (mounted.current) {
          setImage(rendered);
          setLoading(false);
        }
      } catch (e) {
        if (mounted.current) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, [imagePath, targetWidth, targetHeight, preserveAspectRatio, params.preferNativeRender]);

  if (!imagePath) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">No image path configured</Text>
        <Text color="gray">Set params.path to an image file</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box>
        <Text color="cyan">Loading image...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Image error</Text>
        <Text color="gray">{error}</Text>
      </Box>
    );
  }

  if (!image) {
    return (
      <Box>
        <Text color="red">Failed to load image</Text>
      </Box>
    );
  }

  // image is a string of ANSI escape sequences; render as-is
  return <Box><Text>{image}</Text></Box>;
};

export default ImageWidget;
