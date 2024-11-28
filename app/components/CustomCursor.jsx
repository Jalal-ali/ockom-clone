// components/CustomCursor.js
import { useEffect } from "react";

const CustomCursor = () => {
  useEffect(() => {
    // Create the cursor element dynamically
    const cursor = document.createElement("div");
    cursor.classList.add("custom-cursor");
    document.body.appendChild(cursor);

    // Update cursor position on mousemove
    const moveCursor = (e) => {
      cursor.style.left = `${e.pageX}px`;
      cursor.style.top = `${e.pageY}px`;
    };

    document.addEventListener("mousemove", moveCursor);

    // Cleanup on component unmount
    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.body.removeChild(cursor);
    };
  }, []);

  return null; // This component does not render anything directly
};

export default CustomCursor;
