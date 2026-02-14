import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Fix React removeChild error caused by external scripts modifying the DOM
if (typeof Node !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild;
  // @ts-ignore
  Node.prototype.removeChild = function<T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      console.warn('removeChild: node not a child, skipping');
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  // @ts-ignore
  Node.prototype.insertBefore = function<T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn('insertBefore: reference not a child, appending');
      return originalInsertBefore.call(this, newNode, null) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

createRoot(document.getElementById("root")!).render(<App />);
