<template>
  <div class="container">
    <div class="card" style="margin-top: 10px">

      <div style="float: right;display: flex;flex-direction: column; gap: 5px">
        <button @click="openFileInput">上传图片</button>
        <input hidden="" ref="fileInput" type="file" accept="image/*" @change="handleFileUpload"/>
        <button @click="downloadFile">下载图片</button>
      </div>
      <div class="form">
        <div class="form-item-inline">
          <div class="form-item">
            <label for="watermarkText">水印文本: </label>
            <input type="text" v-model="watermarkText" id="watermarkText" placeholder="Input something...">
          </div>
          <div class="form-item">
            <label for="canvasFontSize">字体大小: </label>
            <input type="number" id="canvasFontSize" min="2" max="1000" v-model.number="canvasFontSize">
          </div>
        </div>

        <div class="form-item">
          <label for="xGap">水平间隔</label>
          <input id="xGap" type="range" :min="xGapRange.min" :max="xGapRange.max" v-model.number="xGap"
                 :step="xGapRange.step"/>
        </div>
        <div class="form-item">
          <label for="yGap">垂直间隔</label>
          <input id="yGap" type="range" :min="yGapRange.min" :max="yGapRange.max" v-model.number="yGap"
                 :step="yGapRange.step"/>
        </div>
        <div class="form-item">
          <label for="rotation">旋转角度:</label>
          <input id="rotation" type="range" min="-90" max="90" v-model.number="rotation"/>
        </div>
        <div class="form-item">
          <label for="colorPicker">水印颜色：</label>
          <color-picker v-model:rgba="rgba"></color-picker>
        </div>
      </div>
      <div v-if="imageUrl" class="image-section">
        <canvas ref="canvas" class="uploaded-image"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive, ref, watch} from 'vue'

const imageUrl = ref('')
const fileInput = ref(null);
const canvas = ref(null);
const xGap = ref(100);
const xGapRange = reactive({
  min: 20,
  max: 200,
  step: 10
})
const yGapRange = reactive({
  min: 20,
  max: 200,
  step: 10
})

const origin_file = ref();

const yGap = ref(50);
const rotation = ref(-28)
const watermarkText = ref('Watermark');
const rgba = ref("rgba(0, 0, 0, 0.5)");
const canvasFontSize = ref(20)


const openFileInput = () => {
  fileInput.value.click()
}

const downloadFile = () => {
  if (canvas.value && origin_file.value) {
    const link = document.createElement('a')
    link.href = canvas.value.toDataURL();
    const fileName = origin_file.value.name;
    const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
    link.download = fileName + "_watermark." + fileExtension
    link.click()
  }
}

const handleFileUpload = event => {
  origin_file.value = event.target.files[0]
  if (origin_file.value) {
    const reader = new FileReader()
    reader.onload = e => {
      imageUrl.value = e.target.result
    }
    reader.readAsDataURL(origin_file.value)
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
    ctx.font = canvasFontSize.value + 'px Arial'
    ctx.fillStyle = color
    const radians = (Math.PI / 180) * rotation // Convert degrees to radians
    for (let x = 0; x < canvas.value.width; x += xGap) {
      for (let y = 0; y < canvas.value.height; y += yGap) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(radians)
        ctx.fillText(text, 20, 0)
        ctx.restore()
      }
    }

  }
}

const resetXYRange = (resetDefaultGap = false) => {
  if (canvas.value) {
    const ctx = canvas.value.getContext('2d')
    const textWidth = ctx.measureText(watermarkText.value).width
    const textHeight = canvasFontSize.value
    xGapRange.min = Math.floor(textWidth)
    xGapRange.max = Math.floor(canvas.value.width)
    xGapRange.step = Math.floor(canvas.value.width / textWidth)
    yGapRange.min = Math.floor(textHeight)
    yGapRange.max = Math.floor(canvas.value.height)
    yGapRange.step = Math.floor(canvas.value.height / textHeight)

    if (resetDefaultGap) {
      xGap.value = xGapRange.min
      yGap.value = yGapRange.min * 2 >= yGapRange.max ? yGapRange.max : yGapRange.min * 2;
    }
  }
}

watch([imageUrl, canvasFontSize], () => {
  if (imageUrl.value && canvasFontSize.value) {
    resetXYRange(true)
    addWatermark(watermarkText.value,
        rgba.value,
        xGap.value,
        yGap.value,
        rotation.value)
  }
})


watch([xGap, yGap, rotation, watermarkText, rgba], () => {
  if (imageUrl.value) {
    resetXYRange()
    addWatermark(watermarkText.value,
        rgba.value,
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
  margin: 10px auto;
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

@media (max-width: 430px) {
  .card {
    background-color: #f2f2f2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    min-width: 100vw;
    max-width: 100vw;
    margin: 0 auto;
    padding: 20px;
  }
}
</style>
