export const compressImage = (file: File, maxSize: number = 400): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const size = Math.min(width, height);
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error("Could not get canvas context")); return; }
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const formatPhone = (phone: string, isHidden: boolean = false): string => {
  const p = phone.replace(/\D/g, '');
  if (isHidden) {
    if (p.length >= 7) return `${p.slice(0, 4)} ${p.slice(4, 7)} ***`;
    return phone.slice(0, -3) + '***';
  }
  if (p.length >= 10) return `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}`;
  return phone;
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};