import b64 from "./b64";
import async from "./async";
import ResourceLoader from "./Loader";
import Resource from "./Resource";

ResourceLoader.base64 = b64;
ResourceLoader.async = async;
ResourceLoader.encodeBinary = b64;
ResourceLoader.Resource = Resource;

export { ResourceLoader, Resource };
