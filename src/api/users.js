import request from '../utils/request'
export function handleUser(data) {
  return this.request.get('users', {
    params: data
  })
}
