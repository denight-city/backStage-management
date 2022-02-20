import axios from 'axios'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
axios.interceptors.request.use(function (config) {
  nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
}, (err) => {
  console.log(err)
  return Promise.reject(err)
})
axios.interceptors.response.use((res) => {
  nprogress.done()
  return res
}, err => {
  console.log(err)
  return Promise.reject(err)
})
export default axios
