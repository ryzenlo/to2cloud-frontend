import request from '@/utils/request'
import NoResponseInterceptRequest from '@/utils/request-no-response-intercept'

export function getPlaybooks() {
  return request({
    url: '/ansible-playbooks',
    method: 'get',
  })
}

export function getPlaybookContent(filename) {
  return request({
    url: '/ansible-playbook/' + filename,
    method: 'get',
  })
}

export function pingIP(ip) {
  return NoResponseInterceptRequest({
      url: '/ip/' + ip +'/ping',
      method: 'post',
  })
}

export function checkSSHConnection(data) {
  return NoResponseInterceptRequest({
      url: '/ssh/connection/check',
      method: 'post',
      data
  })
}