import Loader from "./loader";
import { Resource } from "../resource";

const shared = new Loader();
shared.destroy = () => {};
const loader = shared || null;

export {
  default as spritesheetParser,
  getResourcePath
} from "./spritesheetParser";
export { default as textureParser } from "./textureParser";
export { shared, loader, Loader, Resource };
