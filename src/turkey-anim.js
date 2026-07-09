const THREE = require('three')

const lineThickness = 0.008
const lineCylGeo = new THREE.CylinderGeometry(lineThickness, lineThickness, 1, 4, 1)

const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0xffea00, side: THREE.DoubleSide, transparent: true,
  opacity: 0.5,
})
const aRingMaterial = new THREE.MeshBasicMaterial({
  color: 0xEA00FF, side: THREE.DoubleSide, transparent: true,
  opacity: 0.5,
})

const demoLineColor = 0xffea00
const autoLineColor = 0xEA00FF

const rings = [
  { inner: 0.22, outer: 0.27, material: ringMaterial, end: 120 },
  { inner: 1.22, outer: 1.35, material: ringMaterial, end: 160 },
  { inner: 1.44, outer: 1.63, material: aRingMaterial, end: 190 },
  { inner: 1.65, outer: 1.78, material: ringMaterial, end: 220 },
  { inner: 2.11, outer: 2.16, material: aRingMaterial, end: 240 },
  { inner: 2.19, outer: 2.43, material: ringMaterial, end: 260 },
  { inner: 2.61, outer: 2.71, material: ringMaterial, end: 270 },
  { inner: 2.76, outer: 3.08, material: aRingMaterial, end: 280 },
]

const textEntries = [
  { label: '1908_ Young Turk Revolution.', detail: 'The Commitee of Union and Progress, forces Sultan Abdul Hamid II \n to restore constitution, ending 30 years autocratic sultanate.', y: 0.22 },
  { label: '1946_ Multi-party transition + Post IIWW.', detail: 'Abandons the single party rule and The Democratic Party (DP) is founded. ', y: 1.22 },
  { label: "1954_ Democratic Party's authoritarian turn.  ", detail: "Opposition gets suppressed and restrictive Press Law.", y: 1.4 },
  { label: '1962_ 1961 constitution.', detail: 'It brings bill of rights, constitutional court, \n strong parliament and separation of powers', y: 1.63 },
  { label: '1980_ 12.09 Military coup.', detail: 'Kenan Evren seizes power, parliament dissolved, all parties banned,\n 250.000 arrested, widespread torture, all political activity suspended.', y: 2.09 },
  { label: "1982_ Turgut Özal's ANAP gets elected.  ", detail: "The 1987 referendum allows former politicians back.\n Economic liberalization and controlled political opening.", y: 2.18 },
  { label: '1998_ EU harmonization reforms accelerate.', detail: 'Fores out the Islamic-led coalition and gains EU candidate status. \nFolows constitutional amendments, abolish death penalty, \nexpands freedom of expression, strenghthen women rights and reduce military influence.', y: 2.6 },
  { label: '2005_ AKP/Erdoğan authoriatian cup.', detail: '2007 presidential crisis. \n2010 referendum shifts power to the executive. \n2013 Gezi protests and subsequent crackdown. \n2013-2014 corruption probes suppressed. \n2016 cup attemts mass purges (130.000 dismissed, arrests of journalists, acedemics, politicians)', y: 2.77 },
]

function createRingGeometry(inner, outer, length) {
  const sweep = length === 0 ? 0.001 : length
  return new THREE.RingGeometry(inner, outer, 64, 1, Math.PI, sweep)
}

const targetLength = -Math.PI / 2
const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
const getLength = (frame, end) => targetLength * easeInOutQuad(Math.min(frame / end, 1))
const easeInQuad = t => t * t

AFRAME.registerComponent('turkey-anim', {
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

    this.ringOpacity = rings.map(r => r.material.opacity)
    rings.forEach(({ inner, outer, material }, i) => {
      const mat = material.clone()
      const geo = createRingGeometry(inner, outer, targetLength)
      const mesh = new THREE.Mesh(geo, mat)
      group.add(mesh)
      this.ringMeshes.push(mesh)
      this.prevRingLen.push(targetLength)
    })

    Promise.all([
      document.fonts.load('bold 80px Titillium Web'),
      document.fonts.load('400 50px Titillium Web'),
    ]).then(() => {
      this.createTextGroups()
      this.enablePinchZoom()
      this.enableBoxInteraction()
    }).catch(() => {
      this.createTextGroups()
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
  },

  // freezeAR() {
  //   this.frozen = true
  //   const targetEl = document.querySelector('xrextras-named-image-target')
  //   if (targetEl) {
  //     this.frozenTargetPos = targetEl.object3D.position.clone()
  //     this.frozenTargetQuat = targetEl.object3D.quaternion.clone()
  //   }
  //   const video = document.querySelector('video')
  //   if (video) video.pause()
  //   const scene = this.el.sceneEl
  //   if (this.animGroup && this.animGroup.parent && targetEl) {
  //     const wrapper = new THREE.Group()
  //     scene.object3D.add(wrapper)
  //     const worldPos = new THREE.Vector3()
  //     const worldQuat = new THREE.Quaternion()
  //     targetEl.object3D.getWorldPosition(worldPos)
  //     targetEl.object3D.getWorldQuaternion(worldQuat)
  //     wrapper.position.copy(worldPos)
  //     wrapper.quaternion.copy(worldQuat)
  //     wrapper.attach(this.animGroup)
  //   }
  //   setTimeout(() => this.showNavBtn(), 2000)
  //   setTimeout(() => this.showRescanBtn(), 500)
  //   setTimeout(() => this.showZoomBtns(), 500)
  // },

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
      border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px',
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
      border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px',
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
      border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px',
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
      border: '2px solid rgba(255,255,255,0.3)', borderRadius: '12px',
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
    const camera = this.el.sceneEl.camera

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
      this.textGroups.forEach((item) => {
        item.group.scale.set(1, 1, 1)
        item.group.position.z = 0
        item.group.children.forEach(c => {
          if (c.isMesh) { c.material.transparent = true; c.material.opacity = 1 }
        })
      })
      this.ringMeshes.forEach((mesh, j) => {
        mesh.material.opacity = this.ringOpacity[j]
      })
      this.selectedBox = i
      if (i >= 0) {
        this.textGroups[i].group.scale.set(2, 2, 2)
        this.textGroups[i].group.position.z = 0.5
        this.textGroups.forEach((item, idx) => {
          if (idx !== i) {
            item.group.children.forEach(c => {
              if (c.isMesh) c.material.opacity = 0.75
            })
          }
        })
        this.ringMeshes[i].material.opacity = rings[i].material === ringMaterial ? 1 : 0.8
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

  createTextGroups() {
    const group = this.textContainer
    const boxSpacing = -0.20
    const lineSpacing = 0.005

    function measureText(text, fontSize) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      ctx.font = `${fontSize}px Titillium Web`
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
      return closest.material === ringMaterial ? demoLineColor : autoLineColor
    }
    const planePad = 0.096

    const groupData = textEntries.map(entry => {
      const color = getColor(entry)
      const { width: labelWidth, height: labelHeight } = measureText(entry.label, 80)
      const lines = entry.detail.split('\n')
      const lineData = lines.map(line => {
        const { width, height } = measureText(line, 50)
        return { width, height, chars: line.length }
      })
      const bodyWidth = lineData.length ? Math.max(...lineData.map(l => l.width)) : 0
      const bodyHeight = lineData.reduce((sum, line) => sum + line.height, 0) + Math.max(0, lineData.length - 1) * lineSpacing * 50

      const labelH3 = to3D(labelHeight)
      const bodyH3 = to3D(bodyHeight)
      const planeH = labelH3 + Math.abs(boxSpacing) + bodyH3 + planePad
      const maxW3 = to3D(Math.max(labelWidth, bodyWidth)) + planePad

      return { labelWidth, labelHeight, bodyWidth, bodyHeight, planeH, maxW3, color, entry }
    })

    const gap = 0.35
    const topAnchor = 3.8
    let currentTop = topAnchor

    for (let i = groupData.length - 1; i >= 0; i--) {
      const d = groupData[i]
      d.posY = currentTop - d.planeH
      currentTop = d.posY - gap
    }

    function mixColor(hex, amount) {
      const r = (hex >> 16) & 0xff, g = (hex >> 8) & 0xff, b = hex & 0xff
      return `rgb(${Math.round(255 + (r - 255) * amount)},${Math.round(255 + (g - 255) * amount)},${Math.round(255 + (b - 255) * amount)})`
    }
    function mixColorHex(hex, amount) {
      const r = (hex >> 16) & 0xff, g = (hex >> 8) & 0xff, b = hex & 0xff
      return (Math.round(255 + (r - 255) * amount) << 16) | (Math.round(255 + (g - 255) * amount) << 8) | Math.round(255 + (b - 255) * amount)
    }
    function createTextCanvas(entry, labelWidth, labelHeight, bodyWidth, bodyHeight, color) {
      const fontFamily = '"Titillium Web", sans-serif'
      const pad = 24
      const canvasW = Math.max(labelWidth, bodyWidth) + pad * 2
      const canvasH = bodyHeight > 0
        ? labelHeight + Math.abs(boxSpacing * 50) + bodyHeight + pad * 2
        : labelHeight + pad * 2
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(canvasW)
      canvas.height = Math.ceil(canvasH)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = mixColor(color, 0.15)
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#000'
      ctx.font = `bold 80px ${fontFamily}`
      ctx.textBaseline = 'top'
      ctx.fillText(entry.label, pad, pad)

      if (entry.detail) {
        const lines = entry.detail.split('\n')
        ctx.font = `50px ${fontFamily}`
        let y = pad + labelHeight + Math.abs(boxSpacing * 50) * 0.2
        lines.forEach(line => {
          ctx.fillText(line, pad, y)
          y += 50 * 1.2 + lineSpacing * 50
        })
      }

      return canvas
    }

    groupData.forEach((d, index) => {
      const entry = textEntries[index]
      const tg = new THREE.Group()

      const canvas = createTextCanvas(entry, d.labelWidth, d.labelHeight, d.bodyWidth, d.bodyHeight, d.color)
      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true

      const planeGeo = new THREE.PlaneGeometry(d.maxW3, d.planeH)
      planeGeo.translate(d.maxW3 / 2, d.planeH / 2, 0)
      const planeMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      })
      const planeMesh = new THREE.Mesh(planeGeo, planeMat)
      planeMesh.position.set(0, 0, 0)
      tg.add(planeMesh)

      const endPos = new THREE.Vector3(0.4, d.posY, 0)
      const origPos = new THREE.Vector3(0, entry.y, 0)
      const lineEnd = new THREE.Vector3(0.4, d.posY + d.planeH, 0)

      tg.position.copy(endPos)
      group.add(tg)

      const lineMat = new THREE.MeshBasicMaterial({ color: mixColorHex(d.color, 0.15) })
      const line = new THREE.Mesh(lineCylGeo, lineMat)
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
        ringPos: origPos.clone(),
        startPos: origPos.clone(),
        endPos: endPos.clone(),
        planeH: d.planeH,
        planeW: d.maxW3,
        startFrame: rings[index].end,
        progress: 0,
      })
    })
  },

  updateLine(item) {
    const topLeft = new THREE.Vector3(
      item.group.position.x,
      item.group.position.y + item.planeH * item.group.scale.y,
      item.group.position.z
    )
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
})
