<template>
  <div class="xiaoliuren-page">
    <van-field
      v-model="typeValue"
      is-link
      readonly
      label="类型"
      placeholder="选择输入值类型"
      @click="showTypePicker = true"
    />
    <template v-if="selectedTypeValues === '1'">
      <van-field
        v-model="dateValue"
        is-link
        readonly
        label="日期"
        placeholder="选择日期"
        @click="showDatePicker = true"
      />
      <van-field
        v-model="timeValue"
        is-link
        readonly
        label="时间"
        placeholder="选择时间"
        @click="showTimePicker = true"
      />
    </template>
    <template v-if="selectedTypeValues === '2'">
      <van-field v-model="numberListStr" label="随机数" placeholder="3个或以上的随机数，逗号隔开" />
    </template>
    <template v-if="selectedTypeValues === '3'">
      <van-field v-model="hanziListStr" label="汉字" placeholder="3个或以上的汉字" />
    </template>
    <van-field v-model="question" label="问题" placeholder="请输入你想要预测的事情" />
    <van-button
      type="primary"
      block
      style="margin-top: 8px"
      @click="submit"
      :disabled="buttonDisabled"
      >预测</van-button
    >
    <div class="result-wrap" v-if="!!resultData">
      <template v-if="selectedTypeValues === '1'">
        <div>农历：{{ lunarStr }}</div>
      </template>
      <div style="margin-top: 4px">结果：{{ resultData.short }}</div>
      <div style="margin-top: 4px">释义：{{ resultData.paraphrase[0] }}</div>
      <div style="margin-top: 4px">口诀：{{ resultData.paraphrase[1] }}</div>
      <div style="margin-top: 4px">断辞：{{ resultData.paraphrase[2] }}</div>
      <van-button
        type="primary"
        block
        style="margin-top: 4px"
        @click="unscramble"
        v-if="!resultData.unscramble"
        >解读</van-button
      >
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
    <!--  选择窗口  -->
    <van-popup v-model:show="showTypePicker" round position="bottom">
      <van-picker
        :columns="columns"
        title="选择输入值类型"
        @cancel="showTypePicker = false"
        @confirm="onConfirmType"
      />
    </van-popup>
    <van-popup v-model:show="showDatePicker" round position="bottom">
      <van-date-picker
        v-model="selectedDateValues"
        title="选择日期"
        @cancel="showDatePicker = false"
        @confirm="onConfirmDate"
      />
    </van-popup>
    <van-popup v-model:show="showTimePicker" round position="bottom">
      <van-time-picker
        v-model="selectedTimeValues"
        title="选择时间"
        @cancel="showTimePicker = false"
        @confirm="onConfirmTime"
      />
    </van-popup>
    <van-overlay
      :show="showOverlay"
      style="display: flex; justify-content: center; align-items: center; height: 100%"
    >
      <van-loading size="24px" vertical>解读中...</van-loading>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { explain } from './dict'
import { getLunar } from '../../utils/lunarDay'
import cnchar from 'cnchar'
import post from '../../request/post'
import { showFailToast } from 'vant'

const columns = [
  { text: '日期取数法', value: '1' },
  { text: '数字取数法', value: '2' },
  { text: '汉字取数法', value: '3' }
]

const typeValue = ref('')
const dateValue = ref('')
const timeValue = ref('')

const showTypePicker = ref(false)
const showDatePicker = ref(false)
const showTimePicker = ref(false)

const selectedTypeValues = ref([])
const selectedDateValues = ref([])
const selectedTimeValues = ref([])
const numberListStr = ref('')
const hanziListStr = ref('')
const lunarStr = ref('')
const resultData = ref(undefined)
const question = ref('')
const showOverlay = ref(false)

const buttonDisabled = computed(() => {
  if (selectedTypeValues.value === '1') {
    return !(selectedDateValues.value.length && selectedTimeValues.value.length && question.value)
  }
  if (selectedTypeValues.value === '2') {
    return !(numberListStr.value.length && question.value)
  }
  if (selectedTypeValues.value === '3') {
    return !(hanziListStr.value.length && question.value)
  }
  return true
})

const onConfirmType = ({ selectedOptions }) => {
  showTypePicker.value = false
  selectedTypeValues.value = selectedOptions[0].value
  typeValue.value = selectedOptions[0].text
  resultData.value = undefined
  lunarStr.value = ''
  question.value = ''
  // 初始化时间类型值
  if (selectedTypeValues.value === '1') {
    dateValue.value = dayjs(new Date()).format('YYYY-MM-DD')
    const dateList = dateValue.value.split('-')
    selectedDateValues.value = [dateList[0], dateList[1], dateList[2]]
    timeValue.value = dayjs(new Date()).format('HH:mm')
    const timeList = timeValue.value.split(':')
    selectedTimeValues.value = [timeList[0], timeList[1]]
  }
}

const onConfirmDate = ({ selectedValues }) => {
  dateValue.value = selectedValues.join('-')
  selectedDateValues.value = selectedValues
  showDatePicker.value = false
}

const onConfirmTime = ({ selectedValues }) => {
  timeValue.value = selectedValues.join(':')
  selectedTimeValues.value = selectedValues
  showTimePicker.value = false
}

const unscramble = () => {
  const data = {
    question: question.value,
    short: resultData.value.short,
    paraphrase: resultData.value.paraphrase
  }
  showOverlay.value = true
  post.gerForecast(data).then(
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

// 传入数字数组进行预测
const calculate = (parameters) => {
  let explainIndex = 0
  parameters.forEach((indexValue) => {
    let j = 0
    explainIndex = explainIndex - 1
    while (j < indexValue) {
      explainIndex = explainIndex + 1
      if (explainIndex > 5) {
        explainIndex = 0
      }
      j++
    }
  })
  resultData.value = JSON.parse(JSON.stringify(explain[explainIndex]))
}

// 预测
const submit = () => {
  resultData.value = undefined
  let parameters = []
  if (selectedTypeValues.value === '1') {
    const dateTime = `${selectedDateValues.value.join('-')} ${selectedTimeValues.value.join(':')}`
    const lunarData = getLunar(dateTime)
    lunarStr.value = lunarData.lunar
    parameters = lunarData.parameters
  }
  if (selectedTypeValues.value === '2') {
    parameters = numberListStr.value.split(/[，,；;]+/)
  }
  if (selectedTypeValues.value === '3') {
    const list = hanziListStr.value.split('')
    parameters = list.map((str) => str.stroke())
  }
  calculate(parameters)
}
</script>

<style scoped lang="less">
.xiaoliuren-page {
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
