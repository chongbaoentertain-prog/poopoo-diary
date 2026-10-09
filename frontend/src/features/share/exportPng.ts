const SCALE = 2; // 导出 2 倍图,手机上更清晰

/** 把 SVG 卡片画成 PNG。卡片里只用系统字体和内联图形,所以可以直接序列化后画到 canvas */
export async function svgToPng(svg: SVGSVGElement): Promise<Blob> {
  const { width, height } = svg.viewBox.baseVal;
  const xml = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = width * SCALE;
  canvas.height = height * SCALE;
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('生成图片失败'))), 'image/png'));
}

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled';

/** 手机上优先调起系统分享面板;不支持(多数电脑浏览器)就下载图片 */
export async function shareOrDownload(png: Blob, name: string): Promise<ShareOutcome> {
  const file = new File([png], `${name}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '噗噗日记' });
      return 'shared';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'cancelled'; // 用户自己关掉了分享面板
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(png);
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(a.href);
  return 'downloaded';
}
