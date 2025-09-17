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

const testData = {
  code: '0',
  data: {
    content:
      '{"卦象详解": "赤口卦象在小六壬中属于不吉之卦，五行属金，颜色为白色，方位为西方，临白虎，谋事主四、七、十。这个卦象通常与口舌是非、官非、惊恐、凶险等负面情况相关联。它提醒人们在面对问题时要格外小心，尤其是在涉及法律、争论和沟通方面。", "运势分析": "针对您的出行计划，赤口卦象暗示您可能会遇到一些挑战和困难。这可能包括旅途中的意外、与他人的争执或是旅途中的不顺利。您可能需要特别注意交通安全、行程安排以及与同行者的沟通。", "吉凶指引": "鉴于赤口卦象的不吉含义，建议您在出行前做好充分的准备，包括检查交通工具的状况、规划好行程路线、准备必要的应急物品等。同时，保持冷静和耐心，避免不必要的争执和冲突。如果可能，选择避开西方的行程或活动，以减少不利影响。在出行过程中，保持警觉，注意安全，尽量避免涉及法律和是非的问题。"}',
    date: '2025-09-18 01:39:11',
    id: '44a58b22-7657-4bae-8c9b-ae5843a6036a'
  },
  message: 'success'
}

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
