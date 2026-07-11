const { createAnimComponent } = require('./shared')

const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.75,
})
const aRingMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.75,
})

const rings = [
  { inner: 0.005, outer: 0.03, material: ringMaterial, end: 120 },
  { inner: 0.30, outer: 0.35, material: aRingMaterial, end: 160 },
  { inner: 0.22, outer: 0.26, material: aRingMaterial, end: 200 },
  { inner: 0.06, outer: 0.10, material: aRingMaterial, end: 240 },
]

const textEntries = [
  {
    year: '1986_Gorbachev\'s Perestroika and Glasnost',
    text: 'Political liberation opens the Soviet system to competitive elections, freedom of speech, and civil society.\nThe 1988 constitutional reforms establish a Congress of People\'s Deputies with semi-competitive elections.\nUniversity student movements and nationalist movements in Baltic republics emerge.\nEconomic stagnation and nationalism challenge central authority.',
    y: 0.015,
    img: 'r1986',
  },
  {
    year: '1992_USSR dissolves',
    text: 'Yeltsin\'s 1993 constitutional crisis concentrates power. Violent clashes between Yeltsin and the Supreme Soviet parliament (October 1993) result in tanks surrounding parliament.\nA new constitution establishes a super-presidential system with weak checks on executive power.\nPutin\'s consolidation from 2000 eliminates independent media, gubernatorial appointments replacing elections, crackdowns on NGOs, annexation of Crimea (2014), and subsequent authoritarian consolidation.',
    y: 0.33,
    img: 'r1992',
  },
  {
    year: '1998_Financial Crisis and Oligarch Power',
    text: 'The Russian financial collapse (August 1998 default) destabilizes Yeltsin\'s government.\nOligarchs gain enormous political influence through media control and finance.\nRegional instability increases; the Second Chechen War begins (1999).',
    y: 0.24,
  },
  {
    year: '2000_Putin\'s Consolidation of Power',
    text: 'Putin assumes presidency. State recaptures control of major media outlets (NTV, TV-Center).\nThe "managed democracy" system emerges: rigged elections, pressure on opposition parties (especially from 2008+), controlled parliaments.\nHuman rights organizations face increasing restrictions.',
    y: 0.08,
  },
]

AFRAME.registerComponent('russia-anim', createAnimComponent({
  rings,
  textEntries,
  ringMaterial,
  aRingMaterial,
  h1Text: 'Waves of Regime Transformation — Russia',
  imagePath: './assets/',
  overlay: {
    title: 'Waves of Regime Transformation — Russia',
    subtitle: 'Data from V-Dem Dataset',
    intro: 'This visualization maps Russia\'s regime transformations between 1986 and 2008 using a tree-ring diagram. Each ring summarizes the level of democracy based on the V-Dem dataset (Bibliography).',
    legendHtml: `
      <span style="display:inline-block;width:12px;height:12px;background:#ffea00;border-radius:50%;margin-right:8px;vertical-align:middle"></span> Toward democracy<br>
      <span style="display:inline-block;width:12px;height:12px;background:#EA00FF;border-radius:50%;margin-right:8px;vertical-align:middle"></span> Toward autocracy<br>
      <span style="font-size:13px;color:rgba(0,0,0,0.5);display:block;margin-top:6px">The thicker the ring, the closer to autocracy — the thinner, the more democratic.</span>
    `,
    startImage: './assets/trunk.png',
    startImageWidth: '90px',
    startText: 'Start',
  },
}))