const EXPORT_SCALE = 2; // 导出 2 倍图,手机上更清晰

/** 把 SVG 卡片画成 PNG。卡片里只用系统字体和内联图形,所以可以直接序列化后画到 canvas */
export async function renderSvgToPng(svgElement: SVGSVGElement): Promise<Blob> {
  const { width, height } = svgElement.viewBox.baseVal;
  const svgMarkup = new XMLSerializer().serializeToString(svgElement);
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  await image.decode();

  const canvas = document.createElement('canvas');
  canvas.width = width * EXPORT_SCALE;
  canvas.height = height * EXPORT_SCALE;
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('生成图片失败'))), 'image/png');
  });
}

export type ShareImageOutcome = 'shared' | 'downloaded' | 'cancelled';

/** 手机上优先调起系统分享面板;不支持(多数电脑浏览器)就下载图片 */
export async function shareOrDownloadImage(pngBlob: Blob, fileNameWithoutExtension: string): Promise<ShareImageOutcome> {
  const file = new File([pngBlob], `${fileNameWithoutExtension}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '噗噗日记' });
      return 'shared';
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') return 'cancelled'; // 用户自己关掉了分享面板
    }
  }
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(pngBlob);
  downloadLink.download = file.name;
  downloadLink.click();
  URL.revokeObjectURL(downloadLink.href);
  return 'downloaded';
}
