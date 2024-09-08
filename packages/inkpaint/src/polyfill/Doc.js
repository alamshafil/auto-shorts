import { isBrowser } from "browser-or-node";
import PSCanvas from "./Canvas";

const Doc = {
  createElement(tag) {
    let element;
    switch (tag) {
      case "canvas":
        element = new PSCanvas(1, 1);
        break;

      default:
        element = new PSCanvas(1, 1);
        break;
    }

    return element;
  }
};

export default isBrowser ? window.document : Doc;
