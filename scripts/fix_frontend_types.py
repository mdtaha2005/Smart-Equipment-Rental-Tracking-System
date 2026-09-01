import os

files = {}

# 1. frontend/src/vite-env.d.ts
files['frontend/src/vite-env.d.ts'] = '''/// <reference types="vite/client" />
'''

# 2. frontend/src/main.tsx
files['frontend/src/main.tsx'] = '''import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
'''

for path, content in files.items():
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Vite env types and main.tsx fixed.")
