<template>
  <div class='home-page'>
    <van-field
      v-model="typeValue"
      is-link
      readonly
      label="类型"
      placeholder="选择输入值类型"
      @click="showTypePicker = true"
    />
    <template v-if='selectedTypeValues === "1"'>
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
    <template v-if='selectedTypeValues === "2"'>
      <van-field
        v-model="numberListStr"
        label="随机数"
        placeholder="3个或以上的随机数，逗号隔开"
      />
    </template>
    <template v-if='selectedTypeValues === "3"'>
      <van-field
        v-model="hanziListStr"
        label="汉字"
        placeholder="3个或以上的汉字"
      />
    </template>
    <van-button type="primary" block style='margin-top: 8px' @click='submit'>预测</van-button>
    <div class='result-wrap' v-if='!!resultData'>
      <template v-if='selectedTypeValues === "1"'>
        <div>农历：{{lunarStr}}</div>
      </template>
      <div style='margin-top: 8px'>结果：{{resultData.short}}</div>
      <div style='margin-top: 8px'>释义：{{resultData.paraphrase[0]}}</div>
      <div style='margin-top: 8px'>口诀：{{resultData.paraphrase[1]}}</div>
      <div style='margin-top: 8px'>断辞：{{resultData.paraphrase[2]}}</div>
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
      <van-time-picker v-model="selectedTimeValues" title="选择时间" @cancel="showTimePicker = false" @confirm="onConfirmTime"/>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import { explain } from './dict'
import { getLunar } from '../utils/lunarDay'
// import cnchar from 'cnchar';


const columns = [
  { text: '日期取数法', value: '1' },
  { text: '数字取数法', value: '2' },
  { text: '汉字取数法', value: '3' },
];

const typeValue = ref('');
const dateValue = ref('');
const timeValue = ref('');

const showTypePicker = ref(false);
const showDatePicker = ref(false);
const showTimePicker = ref(false);

const selectedTypeValues = ref([]);
const selectedDateValues = ref([]);
const selectedTimeValues = ref([]);
const numberListStr = ref('')
const hanziListStr = ref('')
const lunarStr = ref('')
const resultData = ref(undefined)

const onConfirmType = ({ selectedOptions }) => {
  showTypePicker.value = false;
  selectedTypeValues.value = selectedOptions[0].value
  typeValue.value = selectedOptions[0].text;
  resultData.value = undefined
  lunarStr.value = ''
  // 初始化时间类型值
  if (selectedTypeValues.value === '1') {
    dateValue.value = dayjs(new Date()).format('YYYY-MM-DD')
    const dateList = dateValue.value.split('-')
    selectedDateValues.value = [dateList[0], dateList[1], dateList[2]]
    timeValue.value = dayjs(new Date()).format('HH:mm')
    const timeList = timeValue.value.split(':')
    selectedTimeValues.value = [timeList[0], timeList[1]]
  }
};

const onConfirmDate = ({  selectedValues }) => {
  dateValue.value = selectedValues.join('-')
  selectedDateValues.value = selectedValues
  showDatePicker.value = false
}

const onConfirmTime = ({  selectedValues }) => {
  timeValue.value = selectedValues.join(':')
  selectedTimeValues.value = selectedValues
  showTimePicker.value = false
}

// 传入数字数组进行预测
const calculate = (parameters) => {
  let explainIndex = 0
  parameters.forEach(indexValue => {
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
  resultData.value = explain[explainIndex]
}

// 预测
const submit = () => {
  let parameters = []
  if (selectedTypeValues.value === '1') {
    const dateTime = `${selectedDateValues.value.join('-')} ${selectedTimeValues.value.join(':')}`
    const lunarData = getLunar(dateTime)
    lunarStr.value = lunarData.lunar
    parameters = lunarData.parameters
  }
  if (selectedTypeValues.value === '2') {
    parameters = numberListStr.value.split(',')
  }
  if (selectedTypeValues.value === '3') {
    const list = hanziListStr.value.split('')
    parameters = list.map(str => str.stroke())
  }
  calculate(parameters)
}

</script>

<style scoped lang="less">
.home-page {
  height: 100%;
  .result-wrap {}
}
</style>
