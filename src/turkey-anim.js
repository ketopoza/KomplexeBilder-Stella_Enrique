const { createAnimComponent } = require('./shared')

const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.75,
})
const aRingMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.75,
})

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
  { year: '1908_ Young Turk Revolution. ', text: "The Commitee of Union and Progress, forces Sultan Abdul Hamid II \nto restore constitution, ending 30 years autocratic sultanate.\n \nMarks the beginning of the Second Constitutional Era \nand the start of the Ottoman Empire's decline.", y: 0.22, img: 't1908', caption: 'Armenian, Greek Orthodox & Muslim religious leaders, declaring the Revolution. \nWikipedia - Public domain' },
  { year: '1946_ Multi-party transition. ', text: 'After 23 years of single-party CHP rule, the Democratic Party (DP) is founded as opposition.\n1950 brings fair elections with DP victory.', y: 1.22 },
  { year: "1954_ Democratic Party's authoritarian turn.  ", text: "Prime Minister Adnan Menderes restricts opposition gets suppressed and implements restrictive Press Law.\nSilenced critics, intimidated journalists, and purged opponents from state institutions.\nFollowed by a political polarization with the left-wing clashing and economic instability.", y: 1.4 },
  { year: '1962_ 1961 constitution. ', text: 'After 1960 military coup, a new constitution is adopted, bringing bill of rights, \nconstitutional court, a strong parliament and separation of powers.', y: 1.63 },
  { year: '1980_ 12.09 Military coup. ', text: 'Kenan Evren seizes power amid political violence, economic crisis \nand governmental paralysis. \n\nParliament is dissolved and all parties banned, 250.000 arrested, \nwidespread torture and all political activity suspended.', y: 2.09, img: 't1980', caption: 'Turkish troops blocking a main road in Ankara\nKeystone/​Hulton Archive/​Getty Images' },
  { year: "1982_ New military constitution.", text: "Civilian rule restored but constitution limits political freedoms, strengthens executive, \ngrants military sweeping authority. \n1983 elections bring Turgut Özal's ANAP to power. \n1987 referendum allows former politicians back. \nEconomic liberalization and controlled political opening begin.", y: 2.18 },
  { year: '1998_ EU harmonization reforms accelerate. ', text: 'EU harmonization reforms accelerate, forcing out the Islamic-led coalition.\nConstitutional Court bans Welfare Party (RP) for violating secularism; a reform wave follows \nwith military-secular elite asserting control.\nGains EU candidate status, constitutional amendments, abolish death penalty, \nexpands freedom of expression.', y: 2.6 },
  { year: '2005_ AKP/Erdoğan authoriatian cup. ', text: "Following AKP's 2002 electoral victory, EU accession talks begin, \nrepresenting democratization peak.\nHowever Erdoğan simultaneously begins authoritarian drift:\n2007 presidential crisis. \n2010 referendum shifts power to the executive. \n2013 Gezi protests and subsequent crackdown. \n2013-2014 corruption probes suppressed. \npost-2016 cup attemts mass purges (130.000 dismissed, arrests of journalists, acedemics, politicians)", y: 2.77, img: 't2013', caption: '14. Nov. 2013 - Front side of Atatürk Cultural Center covered with banners. \nGezginrocker - Copyrighted free use', photoScale: 1.28 },
]

AFRAME.registerComponent('turkey-anim', createAnimComponent({
  rings,
  textEntries,
  ringMaterial,
  aRingMaterial,
  h1Text: 'Patterns of Democracy',
  imagePath: './assets/',
  overlay: {
    title: 'Patterns of Democracy',
    subtitle: 'Wilke, Stella - Poza Herranz, Enrique',
    intro: 'In the framework of the collaboration between UdK and WZB, Stella and Enrique joined the research team "Waves of Regime Transformation" under the direction of Dr. Vanessa Boese-Schlosser. \nBelow is a visualization based on a tree-ring diagram where each ring summarizes the value of democracy based on the V-Dem dataset (Bibliography).',
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