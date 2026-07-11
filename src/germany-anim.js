const { createAnimComponent } = require('./shared')

const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.75,
})
const aRingMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.75,
})

const rings = [
  { inner: 0.30, outer: 0.43, material: ringMaterial, end: 120 },
  { inner: 0.37, outer: 0.55, material: aRingMaterial, end: 160 },
  { inner: 0.55, outer: 0.68, material: aRingMaterial, end: 200 },
  { inner: 0.72, outer: 0.80, material: aRingMaterial, end: 240 },
]

const textEntries = [
  {
    year: '1918_ Weimar Republic founded',
    text: "After WWI and the November Revolution, \nthe monarchy collapses and the Weimar Constitution\n establishes Germany's first parliamentary democracy \nwith universal suffrage and constitutional rights.\nA period characterised by political instability, \neconomic crisis, and cultural flowering.",
    y: 0.30,
    img: 'g1918.jpg',
    caption: "Proclamation of Weimar Republic by Philipp Scheidemann - Wikipedia Commons",
  },
  {
    year: '1923_ Autoritarian drift',
    text: 'After the failed Beer Hall Putsch \ and the crisis of the Weimar Republic, authoritarian tendencies grow.\nFrom 1923 to 1939, democratic institutions are weakened by emergency rule, \nnationalist radicalization, and the rise of centralized power.',
    y: 0.37,
    img: 'g1923.jpg',
    caption: "Hitler-Putsch, München, Marienplatz - Wikipedia Commons",
  },
  {
    year: '1933_ The III Reich',
    text: "After Adolf Hitler's appointment as Chancellor in 1933, \ndemcoratic institutions are dismantled and political oposition eliminated.\nThe Nazi regime centralizes power into a totalitarian dictatorship, \nleading Germany into aggressive expansion, World War II, and the Holocaust.",
    y: 0.55,
  },
  {
    year: '1945_ Germany under Allied occupation',
    text: "After the defeat in WWII, Germany no longer exists as a unified state \nunder the peace settlement.The victorious powers divide the country \ninto occupation zones, which dismantle the Nazi regime \nand lay the foundations for a new political order.",
    y: 0.72,
  },
]

AFRAME.registerComponent('germany-anim', createAnimComponent({
  rings,
  textEntries,
  ringMaterial,
  aRingMaterial,
  h1Text: 'Waves of Regime Transformation — Germany',
  imagePath: './assets/',
  overlay: {
    title: 'Waves of Regime Transformation — Germany',
    subtitle: 'Data from V-Dem Dataset',
    intro: 'This visualization maps Germany\'s regime transformations from the Weimar Republic to reunification using a tree-ring diagram.',
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
