import request from '@/utils/request'
import NoResponseInterceptRequest from '@/utils/request-no-response-intercept'

export function getCloudProviders(params) {
  return request({
    url: '/cloud_providers',
    method: 'get',
    params
  })
}

export function addCloudProvider(data) {
    return request({
      url: '/cloud_provider',
      method: 'post',
      data
    })
}

export function editCloudProvider(cloudProviderId, data) {
  return request({
    url: '/cloud_provider/' + cloudProviderId,
    method: 'put',
    data
  })
}

export function checkVultrAPI(cloudProviderId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/vultr/check',
    method: 'get',
  })
}

export function getVultrInstances(cloudProviderId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/vultr/instances',
    method: 'get',
  })
}

export function createVultrInstance(cloudProviderId, data) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId + '/vultr/instance',
    method: 'post',
    data
  })
}

export function updateVultrInstance(cloudProviderId, instanceId,data) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId + '/vultr/instance/' + instanceId,
    method: 'patch',
    data
  })
}

export function delVultrInstance(cloudProviderId, instanceId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId + '/vultr/instance/' + instanceId,
    method: 'delete',
  })
}

export function getAnsibleOpsLogs(cloudProviderId, instanceId) {
  return request({
      url: '/cloud_provider/'+ cloudProviderId + '/vultr/instance/' + instanceId + '/ansible/ops/logs',
      method:'get',
  })
}

export function runAnsiblePlaybookOnVultr(cloudProviderId, instanceId, data) {
  return NoResponseInterceptRequest({
    url: '/cloud_provider/'+ cloudProviderId + '/vultr/instance/' + instanceId + '/ansible/ops',
    method: 'post',
    data
  })
}

export function getSSHKeys(cloudProviderId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/vultr/sshkeys',
    method: 'get',
  })
}

export function addSSHKey(cloudProviderId, data) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/vultr/sshkey',
    method: 'post',
    data
  })
}

export function delSSHKey(cloudProviderId, sshKeyId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/vultr/sshkey/' + sshKeyId,
    method: 'delete',
  })
}

export function checkCloudflareAPI(cloudProviderId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/cloudflare/check',
    method: 'get',
  })
}

export function getCloudflareAccounts(cloudProviderId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/cloudflare/accounts',
    method: 'get',
  })
}

export function getCloudflareZones(cloudProviderId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/cloudflare/zones',
    method: 'get',
  })
}

export function createCloudflareZone(cloudProviderId, data) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/cloudflare/zone',
    method: 'post',
    data
  })
}

export function getCloudflareDNSRecords(cloudProviderId, zoneId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/cloudflare/zones/' + zoneId + '/dns_records',
    method: 'get',
  })
}

export function createCloudflareDNSRecord(cloudProviderId, zoneId, data) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/cloudflare/zones/' + zoneId + '/dns_records',
    method: 'post',
    data
  })
}

export function updateCloudflareDNSRecord(cloudProviderId, zoneId,id, data) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/cloudflare/zones/' + zoneId + '/dns_records/' + id,
    method: 'patch',
    data
  })
}

export function getCloudflareCertificates(cloudProviderId, zoneId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/cloudflare/zones/' + zoneId + '/certificates',
    method: 'get',
  })
}

export function createCloudflareCertificate(cloudProviderId, zoneId,data) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/cloudflare/zones/' + zoneId + '/certificates',
    method: 'post',
    data
  })
}

export function getCloudflareSSLSettings(cloudProviderId, zoneId) {
  return NoResponseInterceptRequest({
    url : '/cloud_provider/'+ cloudProviderId +'/cloudflare/zones/' + zoneId + '/settings/ssl',
    method: 'get',
  })
}

export function updateCloudflareSSLSettings(cloudProviderId, zoneId, data) {
  return request({
    url : '/cloud_provider/'+ cloudProviderId +'/cloudflare/zones/' + zoneId + '/settings/ssl',
    method: 'patch',
    data
  })
}

export function getLocalVPS(cloudProviderId, instanceId) {
  return NoResponseInterceptRequest({
    url: '/local_vps/cloud_provider/'+ cloudProviderId + '/vultr/instance/' + instanceId,
    method: 'get',
  })
}

export function checkGodaddyAPI(cloudProviderId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/godaddy/check',
    method: 'get',
  })
}

export function getGodaddyDomains(cloudProviderId) {
  return request({
    url: '/cloud_provider/'+ cloudProviderId +'/godaddy/domains',
    method: 'get',
  })
}

export function editGodaddyDomain(cloudProviderId, domain, data) {
  return NoResponseInterceptRequest({
    url: '/cloud_provider/'+ cloudProviderId +'/godaddy/domains/' + domain,
    method: 'patch',
    data
  })
}