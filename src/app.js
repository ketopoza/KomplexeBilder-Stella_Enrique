require('./turkey-anim')
require('./germany-anim')
// require('./russia-anim')

const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../image-targets/turkey.json'),
      require('../image-targets/germany.json'),
      // require('../image-targets/RusiaPrueba.json'),
    ],
  })
}

window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)
