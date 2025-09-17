import axios from 'axios'

const Axios = axios.create({
  timeout: 120000,
  baseURL: 'http://localhost:8802'
})

Axios.interceptors.request.use((config) => {
  return config
})

Axios.interceptors.response.use(
  (response) => {
    if (response.data.code !== '0') {
      return Promise.reject(response.data)
    }
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const $http = Axios

// 对axios的实例重新封装成一个plugin ,方便 Vue.use(xxxx)
export default {
  install(Vue) {
    Object.defineProperty(Vue.prototype, '$http', { value: Axios })
  }
}
