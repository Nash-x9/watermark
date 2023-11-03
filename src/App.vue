<template>
  <div class="container">
    <div class="card" style="margin-top: 10px">
      <button @click="openFileInput" style="width: 100%">点击上传</button>
      <input hidden="" ref="fileInput" type="file" accept="image/*" @change="handleFileUpload"/>
    </div>
    <div class="card">
      <div style="float: right">
        <button>下载图片</button>
      </div>
      <div>
        <label for="xGap">水平间隔: {{ xGap }}px</label>
        <input id="xGap" type="range" min="20" max="200" v-model.number="xGap"/>
      </div>
      <div>
        <label for="yGap">垂直间隔: {{ yGap }}px</label>
        <input id="yGap" type="range" min="20" max="200" v-model.number="yGap"/>
      </div>
      <div>
        <label for="rotation">旋转角度: {{ rotation }}°</label>
        <input id="rotation" type="range" min="-90" max="90" v-model.number="rotation"/>
      </div>
      <div v-if="imageUrl" class="image-section">
        <canvas ref="canvas" class="uploaded-image"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'

const imageUrl = ref('')
const fileInput = ref(null);
const canvas = ref(null);
const xGap = ref(100);
const yGap = ref(50);
const rotation = ref(-28)
const watermarkText = ref('Watermark');


const openFileInput = () => {
  fileInput.value.click()
}
const handleFileUpload = event => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = e => {
      imageUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

const addWatermark = (text = 'Watermark', color = 'rgba(0, 0, 0, 0.5)', xGap = 100, yGap = 50, rotation = -30) => {
  const image = new Image()
  image.src = imageUrl.value
  image.onload = () => {
    const ctx = canvas.value.getContext('2d')
    canvas.value.width = image.width
    canvas.value.height = image.height

    ctx.drawImage(image, 0, 0)
    ctx.font = '20px Arial'
    ctx.fillStyle = color
    const radians = (Math.PI / 180) * rotation // Convert degrees to radians
    for (let x = 0; x < canvas.value.width; x += xGap) {
      for (let y = 0; y < canvas.value.height; y += yGap) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(radians)
        ctx.fillText(text, 10, 0)
        ctx.restore()
      }
    }

  }
}

watch([imageUrl, xGap, yGap, rotation], () => {
  if (imageUrl.value) {
    addWatermark(watermarkText.value,
        'rgba(0, 0, 0, 0.5)',
        xGap.value,
        yGap.value,
        rotation.value)
  }
});

</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 100vw;
}

.card {
  background-color: #f2f2f2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 85vw;
  max-width: 85vw;
  margin: 5px auto;
  padding: 20px;
}

.image-section {
  max-width: 100%;
}

.uploaded-image {
  width: 100%;
  max-width: 100%;
  height: auto;
}
</style>
