import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SCIDAS - ระบบดูแลช่วยเหลือนักเรียนแบบองค์รวม',
    short_name: 'SCIDAS',
    description: 'ระบบสารสนเทศเพื่อการดูแลช่วยเหลือนักเรียนและบริหารจัดการข้อมูลทางการศึกษา',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
