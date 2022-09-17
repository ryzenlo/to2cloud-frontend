import request from '@/utils/request'

export function getRSAKeys(params) {
  return request({
    url: '/rsa_keys',
    method: 'get',
    params
  })
}

export function createRSAKey(data) {
    return request({
      url: '/rsa_key',
      method: 'post',
      data
    })
}

export function delRSAKey(keyId) {
  return request({
    url: '/rsa_key/' + keyId,
    method: 'delete',
  })
}