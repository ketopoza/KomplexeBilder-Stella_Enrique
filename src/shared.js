const THREE = require('three')

const lineThickness = 0.008
const lineCylGeo = new THREE.CylinderGeometry(lineThickness, lineThickness, 1, 4, 1)

function mixColorHex(hex, amount) {
  const r = (hex >> 16) & 0xff, g = (hex >> 8) & 0xff, b = hex & 0xff
  return (Math.round(255 + (r - 255) * amount) << 16) | (Math.round(255 + (g - 255) * amount) << 8) | Math.round(255 + (b - 255) * amount)
}

const defaultRingMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.75,
})
const defaultARingMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.75,
})

const demoLineColor = 0xffea00
const autoLineColor = 0xEA00FF

function createRingGeometry(inner, outer, length) {
  const sweep = length === 0 ? 0.001 : length
  return new THREE.RingGeometry(inner, outer, 64, 1, Math.PI, sweep)
}

const targetLength = -Math.PI / 2
const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
const getLength = (frame, end) => targetLength * easeInOutQuad(Math.min(frame / end, 1))

function createAnimComponent(config) {
  const { rings, textEntries, h1Text, overlay, imagePath } = config
  const ringMat = config.ringMaterial || defaultRingMaterial
  const aRingMat = config.aRingMaterial || defaultARingMaterial

  return {
    init() {
      this.frame = 0
      this.playing = true
      this.ringMeshes = []
      this.prevRingLen = []
      this.textGroups = []
      this.frozen = false
      this.navigating = false
      this.zoom = 1

      const group = new THREE.Group()
      this.el.object3D.add(group)
      this.animGroup = group

      this.textContainer = new THREE.Group()
      group.add(this.textContainer)

      this.ringFullColor = rings.map(r => r.material === ringMat ? 0xffea00 : 0xEA00FF)
      rings.forEach(({ inner, outer, material }, i) => {
        const mat = material.clone()
        const geo = createRingGeometry(inner, outer, targetLength)
        const mesh = new THREE.Mesh(geo, mat)
        group.add(mesh)
        this.ringMeshes.push(mesh)
        this.prevRingLen.push(targetLength)
      })

      Promise.all([
        document.fonts.load('bold 80px Newsreader'),
        document.fonts.load('400 50px Newsreader'),
      ]).then(async () => {
        await this.createTextGroups()
        this.enablePinchZoom()
        this.enableBoxInteraction()
      }).catch(async () => {
        await this.createTextGroups()
        this.enablePinchZoom()
        this.enableBoxInteraction()
      })

      const scene = this.el.sceneEl
      scene.addEventListener('targetFound', () => {
        this.frame = 0
        this.ringMeshes.forEach((mesh, i) => {
          mesh.geometry.dispose()
          mesh.geometry = createRingGeometry(0.001, 0.001, 0.001)
          this.prevRingLen[i] = 0
        })
        this.textGroups.forEach((item) => {
          item.group.visible = false
          item.line.visible = false
          item.progress = 0
          item.group.position.copy(item.startPos)
        })
      })

      // h1 and overlay are handled in index.html (static HTML)
    },

    showInfoOverlay() {
      const overlay = document.createElement('div')
      overlay.id = 'info-overlay'
      Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        zIndex: '200', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        fontFamily: '"Newsreader", serif',
      })

      const card = document.createElement('div')
      Object.assign(card.style, {
        background: '#fff', width: '100%', height: '100%',
        padding: '40px 32px', boxSizing: 'border-box',
        overflowY: 'auto', textAlign: 'center', position: 'relative',
      })

      const ovTitle = document.createElement('h2')
      ovTitle.textContent = overlay.title || h1Text
      Object.assign(ovTitle.style, {
        margin: '0 0 16px 0', fontSize: '24px', fontWeight: '400', color: '#000',
      })
      card.appendChild(ovTitle)

      if (overlay.subtitle) {
        const ovSub = document.createElement('h3')
        ovSub.textContent = overlay.subtitle
        Object.assign(ovSub.style, {
          margin: '0 0 24px 0', fontSize: '16px', fontWeight: '400', color: 'rgba(0,0,0,0.7)',
          fontFamily: '"Newsreader", serif', lineHeight: '1.4', textAlign: 'center',
        })
        card.appendChild(ovSub)
      }

      if (overlay.intro) {
        const intro = document.createElement('div')
        Object.assign(intro.style, {
          textAlign: 'left', fontSize: '15px', lineHeight: '1.6', marginBottom: '16px',
        })
        intro.textContent = overlay.intro
        card.appendChild(intro)
      }

      if (overlay.legendHtml) {
        const divider = document.createElement('hr')
        Object.assign(divider.style, {
          border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '14px 0',
        })
        card.appendChild(divider)

        const legend = document.createElement('div')
        Object.assign(legend.style, {
          textAlign: 'left', fontSize: '14px', lineHeight: '1.6', marginBottom: '8px',
          padding: '0px', background: '#ffffff', borderRadius: '0px', color: 'rgba(0,0,0,0.65)',
        })
        legend.innerHTML = overlay.legendHtml
        card.appendChild(legend)
      }

      const startBtn = document.createElement('button')
      Object.assign(startBtn.style, {
        background: '#fff', border: '1px solid #000', borderRadius: '0px',
        padding: '6px 20px', cursor: 'pointer', marginTop: '40px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      })
      if (overlay.startImage) {
        const startImg = new Image()
        startImg.onload = () => {
          startImg.style.width = overlay.startImageWidth || '90px'
          startImg.style.height = 'auto'
          startImg.style.display = 'block'
        }
        startImg.onerror = () => { startBtn.textContent = overlay.startText || 'Start' }
        startImg.src = overlay.startImage
        startImg.alt = overlay.startText || 'Start'
        startBtn.appendChild(startImg)
      } else {
        startBtn.textContent = overlay.startText || 'Start'
      }
      startBtn.addEventListener('click', () => overlay.remove())
      startBtn.addEventListener('touchend', (e) => { e.preventDefault(); overlay.remove() })
      card.appendChild(startBtn)

      overlay.appendChild(card)
      document.body.appendChild(overlay)
    },

    showZoomBtns() {
      const container = document.createElement('div')
      container.id = 'zoom-container'
      Object.assign(container.style, {
        position: 'fixed', right: '20px', bottom: '140px', zIndex: '10',
        display: 'flex', flexDirection: 'column', gap: '8px',
      })

      const zoomIn = document.createElement('div')
      zoomIn.textContent = '+'
      Object.assign(zoomIn.style, {
        width: '44px', height: '44px', background: 'rgba(0,0,0,0.6)', color: '#fff',
        border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0px',
        fontSize: '24px', cursor: 'pointer', fontFamily: 'sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      })
      zoomIn.addEventListener('click', () => {
        this.zoom *= 1.5
        this.textContainer.scale.set(this.zoom, this.zoom, this.zoom)
      })

      const zoomOut = document.createElement('div')
      zoomOut.textContent = '−'
      Object.assign(zoomOut.style, {
        width: '44px', height: '44px', background: 'rgba(0,0,0,0.6)', color: '#fff',
        border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0px',
        fontSize: '24px', cursor: 'pointer', fontFamily: 'sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      })
      zoomOut.addEventListener('click', () => {
        this.zoom /= 1.5
        this.textContainer.scale.set(this.zoom, this.zoom, this.zoom)
      })

      container.appendChild(zoomIn)
      container.appendChild(zoomOut)
      document.body.appendChild(container)
    },

    showRescanBtn() {
      const btn = document.createElement('div')
      btn.id = 'rescan-btn'
      btn.textContent = '↻ Rescan'
      Object.assign(btn.style, {
        position: 'fixed', top: '20px', right: '20px',
        zIndex: '10', padding: '8px 16px', background: 'rgba(0,0,0,0.5)', color: '#fff',
        border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0px',
        fontSize: '14px', cursor: 'pointer', fontFamily: 'sans-serif',
      })
      btn.addEventListener('click', () => location.reload())
      document.body.appendChild(btn)
    },

    showNavBtn() {
      if (this.navigating) return
      if (!document.querySelector('a-camera')) return
      const btn = document.createElement('div')
      btn.id = 'nav-btn'
      btn.textContent = 'Explore 3D'
      Object.assign(btn.style, {
        position: 'fixed', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
        zIndex: '10', padding: '14px 28px', background: 'rgba(0,0,0,0.7)', color: '#fff',
        border: '2px solid rgba(255,255,255,0.3)', borderRadius: '0px',
        fontSize: '18px', cursor: 'pointer', fontFamily: 'sans-serif',
        backdropFilter: 'blur(4px)',
      })
      btn.addEventListener('click', () => this.enableNavigation())
      document.body.appendChild(btn)
    },

    enableNavigation() {
      const btn = document.getElementById('nav-btn')
      if (btn) btn.remove()
      this.frozenPos = null
      this.frozenQuat = null
      this.frozenTargetPos = null
      this.frozenTargetQuat = null
      this.navigating = true

      const renderer = this.el.sceneEl.renderer
      if (!renderer) return

      let isDragging = false
      let prev = { x: 0, y: 0 }

      const onDown = (x, y) => { isDragging = true; prev.x = x; prev.y = y }
      const onMove = (x, y) => {
        if (!isDragging) return
        const dx = (x - prev.x) * 0.03
        const dy = (y - prev.y) * 0.03
        this.textContainer.position.x += dx
        this.textContainer.position.y -= dy
        prev.x = x; prev.y = y
      }
      const onUp = () => { isDragging = false }

      renderer.domElement.addEventListener('mousedown', e => onDown(e.clientX, e.clientY))
      window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY))
      window.addEventListener('mouseup', onUp)

      renderer.domElement.addEventListener('touchstart', e => {
        if (e.touches.length === 1) onDown(e.touches[0].clientX, e.touches[0].clientY)
      }, { passive: true })
      window.addEventListener('touchmove', e => {
        if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY)
      }, { passive: true })
      window.addEventListener('touchend', onUp)

      window.addEventListener('keydown', e => {
        const step = 0.2
        switch (e.key) {
          case 'w': case 'W': case 'ArrowUp':    this.textContainer.position.y += step; break
          case 's': case 'S': case 'ArrowDown':  this.textContainer.position.y -= step; break
          case 'a': case 'A': case 'ArrowLeft':  this.textContainer.position.x -= step; break
          case 'd': case 'D': case 'ArrowRight': this.textContainer.position.x += step; break
        }
      })
    },

    enablePinchZoom() {
      const renderer = this.el.sceneEl.renderer
      if (!renderer) return
      let lastPinchDist = 0
      let activeIndex = -1

      const getGroupAt = (x, y) => {
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        const canvas = renderer.domElement
        mouse.x = (x / canvas.clientWidth) * 2 - 1
        mouse.y = -(y / canvas.clientHeight) * 2 + 1
        raycaster.setFromCamera(mouse, this.el.sceneEl.camera)
        const targets = []
        this.textGroups.forEach((item, idx) => {
          item.group.children.forEach(child => {
            if (child.isMesh) targets.push({ mesh: child, idx })
          })
        })
        const meshes = targets.map(t => t.mesh)
        const intersects = raycaster.intersectObjects(meshes)
        if (intersects.length > 0) {
          const hit = intersects[0].object
          const found = targets.find(t => t.mesh === hit)
          return found ? found.idx : -1
        }
        return -1
      }

      renderer.domElement.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX
          const dy = e.touches[0].clientY - e.touches[1].clientY
          lastPinchDist = Math.sqrt(dx * dx + dy * dy)
          const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
          const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
          activeIndex = getGroupAt(cx, cy)
        }
      })

      renderer.domElement.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && activeIndex >= 0) {
          const dx = e.touches[0].clientX - e.touches[1].clientX
          const dy = e.touches[0].clientY - e.touches[1].clientY
          const dist = Math.sqrt(dx * dx + dy * dy)
          const s = dist / lastPinchDist
          lastPinchDist = dist
          const item = this.textGroups[activeIndex]
          item.group.scale.multiplyScalar(s)
          this.updateLine(item)
        }
      })

      renderer.domElement.addEventListener('touchend', () => { activeIndex = -1 })
    },

    enableBoxInteraction() {
      const renderer = this.el.sceneEl.renderer
      if (!renderer) return
      this.selectedBox = -1

      const pick = (x, y) => {
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        const canvas = renderer.domElement
        mouse.x = (x / canvas.clientWidth) * 2 - 1
        mouse.y = -(y / canvas.clientHeight) * 2 + 1
        raycaster.setFromCamera(mouse, this.el.sceneEl.camera)
        const items = []
        this.textGroups.forEach((item, i) => {
          item.group.children.forEach(c => { if (c.isMesh) items.push({ mesh: c, i }) })
        })
        this.ringMeshes.forEach((mesh, i) => {
          items.push({ mesh, i })
        })
        const hit = raycaster.intersectObjects(items.map(t => t.mesh))
        if (hit.length > 0) {
          const found = items.find(t => t.mesh === hit[0].object)
          return found ? found.i : -1
        }
        return -1
      }

      const select = (i) => {
        this.textGroups.forEach((item, idx) => {
          const isSelected = idx === i
          const highlighted = i >= 0 && isSelected
          item.group.scale.set(1, 1, 1)
          item.group.position.z = item.restZ
          if (item.showDetail !== isSelected) {
            item.showDetail = isSelected
            item.planeMesh.material.map = isSelected ? item.expTex : item.collTex
            item.planeMesh.material.needsUpdate = true
            item.planeMesh.geometry.dispose()
            item.planeMesh.geometry = isSelected ? item.expGeo : item.collGeo
          }
          item.planeMesh.material.transparent = true
          item.planeMesh.material.opacity = 1
          item.planeMesh.material.color.setHex(highlighted ? mixColorHex(item.lineColor, 0.15) : 0xffffff)
          item.line.material.color.setHex(highlighted ? item.lineColor : 0xffffff)
          this.updateLine(item)
        })
        this.ringMeshes.forEach((mesh, j) => {
          mesh.material.color.setHex(0xffffff)
          mesh.material.opacity = 0.75
        })
        this.selectedBox = i
        if (i >= 0) {
          this.textGroups[i].group.scale.set(2, 2, 2)
          this.textGroups[i].group.position.z = 0.5
          this.ringMeshes[i].material.color.setHex(this.ringFullColor[i])
          this.ringMeshes[i].material.opacity = 0.9
        }
      }

      let dragStart = { x: 0, y: 0 }
      let boxStart = { x: 0, y: 0 }

      window.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return
        const x = e.touches[0].clientX
        const y = e.touches[0].clientY
        dragStart.x = x; dragStart.y = y
        const idx = pick(x, y)
        console.log('picked', idx)
        select(idx >= 0 ? idx : -1)
        if (idx >= 0) {
          boxStart.x = this.textGroups[idx].group.position.x
          boxStart.y = this.textGroups[idx].group.position.y
        }
      })

      window.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1 || this.selectedBox < 0) return
        const dx = e.touches[0].clientX - dragStart.x
        const dy = e.touches[0].clientY - dragStart.y
        const sens = 0.006
        const item = this.textGroups[this.selectedBox]
        item.group.position.x = boxStart.x + dx * sens
        item.group.position.y = boxStart.y - dy * sens
        this.updateLine(item)
      })
    },

    async createTextGroups() {
      const group = this.textContainer
      const boxSpacing = -0.20
      const lineSpacing = 0.005

      function measureText(text, fontSize) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        ctx.font = `${fontSize}px Newsreader`
        const metrics = ctx.measureText(text)
        return { width: metrics.width, height: fontSize * 1.2 }
      }

      const scale3D = 0.002
      function to3D(px) { return px * scale3D }
      function getColor(entry) {
        let closest = rings[0]
        let minDist = Math.abs(entry.y - closest.inner)
        for (let i = 1; i < rings.length; i++) {
          const dist = Math.abs(entry.y - rings[i].inner)
          if (dist < minDist) { minDist = dist; closest = rings[i] }
        }
        return closest.material === ringMat ? demoLineColor : autoLineColor
      }
      const planePad = 0.096

      const groupMeta = textEntries.map(entry => {
        const color = getColor(entry)
        const labelParts = entry.year.split('\n')
        const title = labelParts[0]
        const subtitle = labelParts.length > 1 ? labelParts.slice(1).join(' ').trim() : ''
        const { width: titleWidth, height: titleHeight } = measureText(title, 80)
        const subMetrics = subtitle ? measureText(subtitle, 50) : { width: 0, height: 0 }
        const lines = entry.text.split('\n')
        const lineData = lines.map(line => {
          const { width, height } = measureText(line, 50)
          return { width, height, chars: line.length }
        })
        const bodyWidth = lineData.length ? Math.max(...lineData.map(l => l.width)) : 0
        const bodyHeight = lineData.reduce((sum, line) => sum + line.height, 0) + Math.max(0, lineData.length - 1) * lineSpacing * 50

        const subHeight = subMetrics.height
        const titleH3 = to3D(titleHeight)
        const subH3 = to3D(subHeight)
        const bodyH3 = to3D(bodyHeight)

        const imgKey = entry.img || title.split(/[_\s]/)[0]
        const imgExt = imgKey.includes('.') ? '' : '.png'
        const imgSrc = (imagePath || './assets/') + imgKey + imgExt

        return { title, subtitle, titleWidth, titleHeight, subHeight, subMetrics, bodyWidth, bodyHeight, lineData, titleH3, subH3, bodyH3, color, entry, imgSrc }
      })

      const loadImage = src => new Promise(resolve => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
      })
      const images = await Promise.all(groupMeta.map(d => loadImage(d.imgSrc)))

      const groupData = groupMeta.map((d, i) => {
        const img = images[i]
        const margin = 24
        const gap = 20
        const photoMaxW = 520
        let photoDrawW = 0, photoDrawH = 0, capH = 0, capW = 0
        let expCanvasW, expCanvasH
        let planeH, maxW3

        if (img) {
          photoDrawW = Math.min(img.naturalWidth, photoMaxW) * (d.entry.photoScale || 1)
          photoDrawH = (img.naturalHeight / img.naturalWidth) * photoDrawW
          const capText = d.entry.caption || ''
          if (capText) {
            const capLines = capText.split('\n')
            let maxCapW = 0
            for (const line of capLines) {
              const m = measureText(line, 30)
              if (m.width > maxCapW) maxCapW = m.width
            }
            capH = capLines.length * (30 * 1.2) + Math.max(0, capLines.length - 1) * 4
            capW = maxCapW
          }
          const sectionY = margin + d.titleHeight + 10
          const textLines = d.entry.text ? d.entry.text.split('\n').length : 0
          const textH = textLines * (50 * 1.2) + Math.max(0, textLines - 1) * 4
          const sectionH = Math.max(photoDrawH, textH)
          expCanvasH = Math.ceil(sectionY + sectionH + 10 + capH + margin)
          const rightColW = Math.max(d.titleWidth, d.bodyWidth)
          expCanvasW = Math.max(d.titleWidth, margin + photoDrawW + gap + rightColW + margin)
          planeH = to3D(expCanvasH)
          maxW3 = to3D(expCanvasW)
        } else {
          planeH = d.titleH3 + (d.subH3 > 0 ? 0.20 + d.subH3 : 0) + (d.bodyH3 > 0 ? 0.20 + d.bodyH3 : 0) + planePad
          maxW3 = to3D(Math.max(d.titleWidth, d.subMetrics.width, d.bodyWidth)) + planePad
          expCanvasH = Math.ceil(planeH / scale3D)
          expCanvasW = Math.max(d.titleWidth, d.subMetrics.width, d.bodyWidth) + 48
        }

        const collW3 = to3D(d.titleWidth * 1.15) + 0.04
        const collH3 = d.titleH3 + 0.04

        const collCanvasW = Math.ceil(d.titleWidth * 1.15) + 20
        const collCanvasH = Math.ceil(collH3 / scale3D)

        const collCanvas = document.createElement('canvas')
        collCanvas.width = collCanvasW
        collCanvas.height = collCanvasH
        const collCtx = collCanvas.getContext('2d')
        collCtx.fillStyle = '#ffffff'
        collCtx.fillRect(0, 0, collCanvas.width, collCanvas.height)
        collCtx.fillStyle = '#000'
        collCtx.font = `bold 80px Newsreader`
        collCtx.textBaseline = 'top'
        collCtx.fillText(d.title, 2, 12)
        const collTex = new THREE.CanvasTexture(collCanvas)
        collTex.needsUpdate = true

        const expCanvas = document.createElement('canvas')
        expCanvas.width = expCanvasW
        expCanvas.height = expCanvasH
        const expCtx = expCanvas.getContext('2d')
        expCtx.fillStyle = '#ffffff'
        expCtx.fillRect(0, 0, expCanvas.width, expCanvas.height)
        expCtx.fillStyle = '#000'
        expCtx.textBaseline = 'top'

        if (img) {
          const sectionY = margin + d.titleHeight + 10
          expCtx.font = `bold 80px Newsreader`
          expCtx.fillText(d.title, margin, margin)
          expCtx.drawImage(img, margin, sectionY, photoDrawW, photoDrawH)
          const textX = margin + photoDrawW + gap
          expCtx.font = `50px Newsreader`
          d.entry.text.split('\n').forEach((line, li) => {
            expCtx.fillText(line, textX, sectionY + li * (50 * 1.2 + 4))
          })
          const capY = sectionY + photoDrawH + 10
          if (d.entry.caption) {
            expCtx.font = `30px Newsreader`
            expCtx.fillStyle = '#888888'
            d.entry.caption.split('\n').forEach((line, li) => {
              expCtx.fillText(line, margin, capY + li * (30 * 1.2 + 4))
            })
            expCtx.fillStyle = '#000'
          }
        } else {
          expCtx.font = `bold 80px Newsreader`
          expCtx.fillText(d.title, 24, 24)
          let y = 24 + d.titleHeight + 10
          if (d.subtitle) {
            expCtx.font = `50px Newsreader`
            expCtx.fillText(d.subtitle, 24, y)
            y += d.subHeight + 10
          }
          if (d.entry.text) {
            expCtx.font = `50px Newsreader`
            d.entry.text.split('\n').forEach(line => {
              expCtx.fillText(line, 24, y)
              y += 50 * 1.2 + 4
            })
          }
        }
        const expTex = new THREE.CanvasTexture(expCanvas)
        expTex.needsUpdate = true

        return { titleWidth: d.titleWidth, titleHeight: d.titleHeight, subHeight: d.subHeight, bodyWidth: d.bodyWidth, bodyHeight: d.bodyHeight, planeH, maxW3, collW3, collH3, color: d.color, entry: d.entry, collTex, expTex }
      })

      const topY = 3.0
      const bottomY = -1.0

      for (let i = 0; i < groupData.length; i++) {
        const d = groupData[i]
        const t = 1 - i / (groupData.length - 1)
        const gY = topY + (bottomY - topY) * t
        d.posY = gY - d.planeH
      }

      groupData.forEach((d, index) => {
        const tg = new THREE.Group()

        const planeMat = new THREE.MeshBasicMaterial({ map: d.collTex, transparent: true, side: THREE.DoubleSide })
        const collGeo = new THREE.PlaneGeometry(d.collW3, d.collH3)
        collGeo.translate(d.collW3 / 2, -d.collH3 / 2, 0)
        const expGeo = new THREE.PlaneGeometry(d.maxW3, d.planeH)
        expGeo.translate(d.maxW3 / 2, -d.planeH / 2, 0)
        const planeMesh = new THREE.Mesh(collGeo, planeMat)
        planeMesh.position.set(0, 0, 0)
        tg.add(planeMesh)

        const topY = d.posY + d.planeH
        const restZ = -index * 0.01
        const endPos = new THREE.Vector3(0.4, topY, restZ)
        const origPos = new THREE.Vector3(0, d.entry.y, 0)

        tg.position.copy(endPos)
        group.add(tg)

        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const line = new THREE.Mesh(lineCylGeo, lineMat)
        const lineEnd = endPos.clone()
        const mid = new THREE.Vector3().addVectors(origPos, lineEnd).multiplyScalar(0.5)
        const dir = new THREE.Vector3().subVectors(lineEnd, origPos).normalize()
        const dist = origPos.distanceTo(lineEnd)
        line.position.copy(mid)
        line.scale.set(1, dist, 1)
        line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
        line.visible = false
        this.animGroup.add(line)
        tg.visible = false

        this.textGroups.push({
          group: tg, line,
          planeMesh, collTex: d.collTex, expTex: d.expTex,
          collGeo, expGeo,
          showDetail: false,
          ringPos: origPos.clone(),
          startPos: origPos.clone(),
          endPos: endPos.clone(),
          startFrame: rings[index].end,
          progress: 0,
          lineColor: d.color,
          restZ,
        })
      })
    },

    updateLine(item) {
      const topLeft = item.group.position.clone()
      const mid = new THREE.Vector3().addVectors(item.ringPos, topLeft).multiplyScalar(0.5)
      const dir = new THREE.Vector3().subVectors(topLeft, item.ringPos).normalize()
      const dist = item.ringPos.distanceTo(topLeft)
      item.line.position.copy(mid)
      item.line.scale.set(1, dist, 1)
      item.line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    },

    tick() {
      if (!this.playing) return
      this.frame++
      const f = this.frame

      this.ringMeshes.forEach((mesh, i) => {
        const { inner, outer, end } = rings[i]
        const len = getLength(f, end)
        if (Math.abs(len - this.prevRingLen[i]) > 0.007) {
          mesh.geometry.dispose()
          mesh.geometry = createRingGeometry(inner, outer, len)
          this.prevRingLen[i] = len
        }
      })

      this.textGroups.forEach((item) => {
        if (f < item.startFrame) return
        const duration = 60
        const elapsed = f - item.startFrame
        const prev = item.progress
        item.progress = Math.min(elapsed / duration, 1)
        if (prev < 1) {
          const t = 1 - Math.pow(1 - item.progress, 2)
          item.group.visible = true
          item.group.position.lerpVectors(item.startPos, item.endPos, t)
          this.updateLine(item)
          item.line.visible = true
        }
      })
    },
  }
}

module.exports = { createAnimComponent }