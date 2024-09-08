import { Resource } from "../resource";
import Texture from "../textures/Texture";

export default function() {
  return function textureParser(resource, next) {
    if (resource.data && resource.type === Resource.TYPE.IMAGE) {
      resource.texture = Texture.fromLoader(
        resource.data,
        resource.url,
        resource.name
      );
    }
    next();
  };
}
