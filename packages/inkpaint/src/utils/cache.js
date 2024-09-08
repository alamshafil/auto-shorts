export const TextureCache = Object.create(null);

export const BaseTextureCache = Object.create(null);

export function addToTextureCache(texture, id) {
  if (!id) return;

  if (texture.textureCacheIds.indexOf(id) === -1)
    texture.textureCacheIds.push(id);

  TextureCache[id] = texture;
}

export function removeFromTextureCache(texture) {
  if (typeof texture === "string") {
    const textureFromCache = TextureCache[texture];

    if (textureFromCache) {
      const index = textureFromCache.textureCacheIds.indexOf(texture);
      if (index > -1) textureFromCache.textureCacheIds.splice(index, 1);

      delete TextureCache[texture];
      return textureFromCache;
    }
  } else if (texture && texture.textureCacheIds) {
    for (let i = 0; i < texture.textureCacheIds.length; ++i) {
      if (TextureCache[texture.textureCacheIds[i]] === texture) {
        delete TextureCache[texture.textureCacheIds[i]];
      }
    }

    texture.textureCacheIds.length = 0;
    return texture;
  }

  return null;
}

export function addToBaseTextureCache(baseTexture, id) {
  if (!id) return;

  if (baseTexture.textureCacheIds.indexOf(id) === -1) {
    baseTexture.textureCacheIds.push(id);
  }

  BaseTextureCache[id] = baseTexture;
}

export function removeFromBaseTextureCache(baseTexture) {
  if (typeof baseTexture === "string") {
    const baseTextureFromCache = BaseTextureCache[baseTexture];

    if (baseTextureFromCache) {
      const index = baseTextureFromCache.textureCacheIds.indexOf(baseTexture);

      if (index > -1) {
        baseTextureFromCache.textureCacheIds.splice(index, 1);
      }

      delete BaseTextureCache[baseTexture];
      return baseTextureFromCache;
    }
  } else if (baseTexture && baseTexture.textureCacheIds) {
    for (let i = 0; i < baseTexture.textureCacheIds.length; ++i) {
      delete BaseTextureCache[baseTexture.textureCacheIds[i]];
    }

    baseTexture.textureCacheIds.length = 0;
    return baseTexture;
  }

  return null;
}

export function destroyAllTextureCache() {
  let key;

  for (key in TextureCache) {
    TextureCache[key].destroy();
  }

  for (key in BaseTextureCache) {
    BaseTextureCache[key].destroy();
  }
}

export function deleteAllTextureCache() {
  let key;

  for (key in TextureCache) {
    delete TextureCache[key];
  }

  for (key in BaseTextureCache) {
    delete BaseTextureCache[key];
  }
}

export function destroyAndCleanAllCache() {
  destroyAllTextureCache();
  deleteAllTextureCache();
}

export function destroyBaseTextureCache(key) {
  if (!BaseTextureCache[key]) return;
  BaseTextureCache[key].destroy();
  delete BaseTextureCache[key];
}

export function destroyTextureCache(key) {
  if (!TextureCache[key]) return;
  TextureCache[key].destroy();
  delete TextureCache[key];
}
