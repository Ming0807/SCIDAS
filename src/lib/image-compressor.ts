/**
 * Client-side image compression for mobile field operations (Home Visits & Evidence).
 * Automatically scales images down to a maximum bounding box and converts to JPEG,
 * reducing a 5-10MB mobile camera photo to ~150-300KB before uploading to Supabase Storage.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.8
): Promise<File> {
  // Pass non-image files through untouched
  if (!file.type.startsWith("image/")) {
    return file
  }

  // Already lightweight? Pass through
  if (file.size <= 250 * 1024) {
    return file
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    return file
  }

  return new Promise((resolve) => {
    try {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        let { width, height } = img

        if (width <= 0 || height <= 0) {
          resolve(file)
          return
        }

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file)
              return
            }

            const cleanName = file.name.replace(/\.[^.]+$/, ".jpg")
            const compressedFile = new File([blob], cleanName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          },
          "image/jpeg",
          quality
        )
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        resolve(file)
      }

      img.src = objectUrl
    } catch {
      resolve(file)
    }
  })
}
