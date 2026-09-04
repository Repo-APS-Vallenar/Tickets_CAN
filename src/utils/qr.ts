import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

export function buildEquipmentQrPayload(equipmentId: string): string {
  // Encodes structured payload: cesfam-equip:EQ-FAR-PC01
  return `cesfam-equip:${equipmentId}`;
}

export function parseEquipmentQrPayload(payload: string): string | null {
  if (payload.startsWith('cesfam-equip:')) {
    return payload.replace('cesfam-equip:', '').trim();
  }
  return payload.trim();
}
