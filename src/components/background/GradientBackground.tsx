import React, { useEffect, useRef } from "react";
// @ts-ignore
import { Gradient } from "../../../utils/ui/Gradient";
import styles from "./GradientBackground.module.css";

export const GradientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Instantiate Stripe's Gradient WebGL engine
    const gradient = new Gradient();

    // Fire initialization on canvas mount
    gradient.initGradient("#gradient-canvas");

    return () => {
      // Pause animation loop on unmount so you don't burn the user's GPU in the background
      if (gradient && typeof gradient.pause === "function") {
        gradient.pause();
      }
    };
  }, []);

  return (
    <canvas
      id="gradient-canvas"
      ref={canvasRef}
      className={styles.canvas}
      data-transition-in
    />
  );
};
