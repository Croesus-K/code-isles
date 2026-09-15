import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 相对路径构建：产物可部署在任意子路径（GitHub Pages 项目页、博客目录等）
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
