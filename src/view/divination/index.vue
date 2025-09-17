<template>
  <div class="divination-page">
    <van-field v-model="question" label="问题" placeholder="请描述你的问题或疑惑" />
    <van-button
      type="primary"
      block
      style="margin-top: 4px"
      @click="divination"
      :disabled="!question"
      >求卦</van-button
    >
    <div class="result-wrap" v-if="!!resultData">
      <van-button
        type="primary"
        @click="unscramble"
        v-if="!resultData.unscramble"
        block
        style="margin-top: 4px"
        >解卦</van-button
      >
      <div style="margin-top: 4px">
        <div style="font-size: 50px; text-align: center">{{ resultData['卦象结构'] }}</div>
        <div style="text-align: center">{{ resultData['卦名'] }}卦</div>
      </div>
      <div style="margin-top: 4px">卦象描述：{{ resultData['卦象描述'] }}</div>
      <div style="margin-top: 4px">阴阳属性：{{ resultData['阴阳属性'] }}</div>
      <div style="margin-top: 4px">五行属性：{{ resultData['五行属性'] }}</div>
      <div style="margin-top: 4px">卦辞：{{ resultData['卦辞'] }}</div>
      <div style="margin-top: 4px; display: flex; flex-direction: row">
        <div style="flex-shrink: 0">爻辞：</div>
        <div>
          <div v-for="(item, index) in resultData['爻辞']" :key="index">{{ item }}</div>
        </div>
      </div>
      <div style="margin-top: 4px">象传：{{ resultData['象传'] }}</div>
      <div style="margin-top: 4px">彖传：{{ resultData['彖传'] }}</div>
      <div style="margin-top: 4px">应用：{{ resultData['应用'] }}</div>
      <div style="margin-top: 4px">关联方位：{{ resultData['关联方位'] }}</div>
      <div style="margin-top: 4px">关联季节：{{ resultData['关联季节'] }}</div>
      <div style="margin-top: 4px" v-if="resultData.unscramble">
        <div
          v-for="(item, index) in Object.keys(resultData.unscramble)"
          :key="index"
          style="margin-top: 8px; font-weight: bold"
        >
          {{ item }}：{{ resultData.unscramble[item] }}
        </div>
      </div>
    </div>
    <van-overlay
      :show="showOverlay"
      style="display: flex; justify-content: center; align-items: center; height: 100%"
    >
      <van-loading size="24px" vertical>解卦中...</van-loading>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { hexagrams } from './dict.js'
import post from '../../request/post'
import { showFailToast } from 'vant'

const question = ref('')
const randomNumber = ref(0)
const resultData = ref(null)
const showOverlay = ref(false)

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 起卦
const divination = () => {
  randomNumber.value = getRandomNumber(0, 63)
  resultData.value = hexagrams[randomNumber.value]
}
// 解读：
const unscramble = () => {
  const data = {
    question: question.value,
    short: resultData.value['卦名'] + '卦'
  }
  showOverlay.value = true
  post.gerDivination(data).then(
    (res) => {
      if (res.code === '0') {
        resultData.value.unscramble = JSON.parse(res.data.content)
      } else {
        showFailToast('生成失败，稍后重试！')
      }
      showOverlay.value = false
    },
    () => {
      showOverlay.value = false
      showFailToast('生成失败，稍后重试！')
    }
  )
}
</script>

<style scoped lang="less">
.divination-page {
  height: 100%;
  width: 100vw;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  .result-wrap {
    font-size: 14px;
  }
}
</style>
