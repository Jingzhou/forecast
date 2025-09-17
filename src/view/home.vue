<template>
  <div class="home-page">
    <div class="content-wrap">
      <router-view />
    </div>
    <van-tabbar v-model="active">
      <van-tabbar-item to="/xiaoliuren" name="xiaoliuren">小六壬</van-tabbar-item>
      <van-tabbar-item to="/divination" name="divination">卜卦</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
const active = ref('')
const route = useRoute()
watch(
  () => route,
  (nv) => {
    active.value = nv.name
  },
  { deep: true, immediate: true }
)
</script>

<style scoped lang="less">
.home-page {
  height: 100vh;
  width: 100vw;
  .content-wrap {
    height: calc(100vh - 50px);
  }
}
</style>
