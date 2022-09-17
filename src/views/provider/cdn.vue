<template>
  <div class="container">
    <div style="font-size: 20px; margin-bottom: 18px">Clouder Provider-CDN</div>
    <div v-if="providerConfig.id == undefined" class="empty-list">
      <el-button type="primary">Add Account</el-button>
    </div>
    <template v-else>
      <div style="margin-bottom: 18px">
        <el-button icon="el-icon-setting" @click="editProviderBtnHandler('cdn')"
          >Cloudflare</el-button
        >
      </div>
      <el-tabs type="border-card">
        <el-tab-pane label="Zones">
          <div v-if="zones.length == 0" class="empty-list">
            <el-button type="primary" @click="dialogVisibleOfZone=true">Add Zone</el-button>
          </div>
          <template v-else>
          <el-button type="primary" size="small" @click="dialogVisibleOfZone=true">Add Zone</el-button>
          <el-table :data="zones" style="width: 100%">
            <el-table-column prop="id" label="ID" width="300">
            </el-table-column>
            <el-table-column prop="name" label="Zone Name" width="180">
            </el-table-column>

            <el-table-column prop="status" label="Status" width="180">
            </el-table-column>


            <el-table-column prop="ssl_mode" label="SSL Mode" width="180">
                <template slot-scope="scope">
                    <el-button type="primary" plain
                        @click.native.prevent="showUpdateSSLSettingDialog(scope.row)"
                    >{{ scope.row.ssl_mode }}<i class="el-icon-edit el-icon--right"></i></el-button>
                 </template>
            </el-table-column>

            <el-table-column
              prop="created_on"
              label="Created At"
              width="200"
              :formatter="dateFormatter"
            >
            </el-table-column>

            <el-table-column label="Operation">
              <template slot-scope="scope">
               <el-button
                         @click.native.prevent="showDNSRecords(scope.row)"
                         type="primary"
                         size="small"
               >
                 DNS Records
               </el-button>
              <el-button
                         @click.native.prevent="showCertsDiglog(scope.row)"
                         type="primary"
                         size="small"
               >
                 SSL Certificates
               </el-button>
              </template>
            </el-table-column>

          </el-table>
          </template>
        </el-tab-pane>
      </el-tabs>
    </template>

    <!-- dialog -->

    <el-dialog
      title="CDN - Edit Account"
      :visible.sync="dialogVisible"
      destroy-on-close
    >
      <el-form
        ref="form"
        :model="providerConfig"
        :rules="rules"
        label-width="140px"
      >
        <el-form-item label="Cloud Type">
          <el-select v-model="providerConfig.type">
            <el-option
              v-for="item in types"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Cloud Provider">
          <el-select v-model="providerConfig.name">
            <el-option
              v-for="item in providers"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Account" prop="account">
          <el-input v-model="providerConfig.account"></el-input>
        </el-form-item>

        <el-form-item label="API Key" prop="apiKey">
          <el-input v-model="providerConfig.apiKey"></el-input>
        </el-form-item>

        <el-form-item label="CA Key" prop="caKey">
          <el-input v-model="providerConfig.caKey"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitAccount">Confirm</el-button>
          <el-button @click="dialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- add zone dialog -->
    <el-dialog
      title="Add Zone"
      :visible.sync="dialogVisibleOfZone"
      destroy-on-close
    >
      <el-form
        ref="zoneForm"
        :model="zoneForm"
        :rules="zoneRules"
        label-width="140px"
      >
        <el-form-item label="Account" prop="account">
          <el-select v-model="zoneForm.account">
            <el-option
              v-for="item in accounts"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Domain Name" prop="name">
          <el-input v-model="zoneForm.name"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitZone">Confirm</el-button>
          <el-button @click="dialogVisibleOfZone = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- dns records dialog -->
    <el-dialog
      title="DNS Records"
      :visible.sync="dialogVisibleOfRecords"
      destroy-on-close
    >
          <el-button type="primary" size="small" @click="dialogVisibleOfAddRecord=true">Add</el-button>
          <el-table :data="dnsRecords" style="width: 100%">
            <el-table-column prop="type" label="Type" width="120">
            </el-table-column>
            <el-table-column prop="name" label="Name" width="180">
            </el-table-column>

            <el-table-column prop="content" label="Content" width="160">
            </el-table-column>

            <el-table-column
              prop="created_on"
              label="Created At"
              width="180"
              :formatter="dateFormatter"
            >
            </el-table-column>

            <el-table-column label="Operation">
              <template slot-scope="scope">
               <el-button
                         @click.native.prevent="showEditRecordDialog(scope.row)"
                         type="primary"
                         size="small"
               >
                 Edit
               </el-button>
              </template>
            </el-table-column>
          </el-table>
     </el-dialog>
     <!-- add dns records dialog -->
    <el-dialog
      title="Add DNS Record"
      :visible.sync="dialogVisibleOfAddRecord"
      destroy-on-close
    >
      <el-form
        ref="recordForm"
        :model="recordForm"
        :rules="recordRules"
        label-width="140px"
      >
        <el-form-item label="Type" prop="type">
          <el-input v-model="recordForm.type" readonly></el-input>
        </el-form-item>

        <el-form-item label="Name" prop="name">
          <el-input v-model="recordForm.name"></el-input>
        </el-form-item>

        <el-form-item label="Content" prop="content">
          <el-input v-model="recordForm.content"></el-input>
        </el-form-item>

        <el-form-item label="TTL" prop="ttl">
          <el-input v-model="recordForm.ttl" readonly></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitAddDNSRecord">Confirm</el-button>
          <el-button @click="dialogVisibleOfAddRecord = false">Cancel</el-button>
        </el-form-item>
      </el-form>
     </el-dialog>

     <!-- edit dns records dialog -->
    <el-dialog
      title="Edit DNS Record"
      :visible.sync="dialogVisibleOfEditRecord"
      destroy-on-close
    >
      <el-form
        ref="recordEditForm"
        :model="recordForm"
        :rules="recordRules"
        label-width="140px"
      >
        <el-form-item label="Type" prop="type">
          <el-input v-model="recordEditForm.type" readonly></el-input>
        </el-form-item>

        <el-form-item label="Name" prop="name">
          <el-input v-model="recordEditForm.name" readonly></el-input>
        </el-form-item>

        <el-form-item label="Content" prop="content">
          <el-input v-model="recordEditForm.content"></el-input>
        </el-form-item>

        <el-form-item label="TTL" prop="ttl">
          <el-input v-model="recordEditForm.ttl" readonly></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitEditDNSRecord">Confirm</el-button>
          <el-button @click="dialogVisibleOfEditRecord = false">Cancel</el-button>
        </el-form-item>
      </el-form>
     </el-dialog>


    <!-- certs dialog -->
    <el-dialog
      title="Origin Certificates"
      :visible.sync="dialogVisibleOfCerts"
      destroy-on-close
    >
          <el-button type="primary" size="small" @click="dialogVisibleOfAddCert=true">Add</el-button>
          <el-table :data="certs" style="width: 100%">
            <el-table-column prop="host_names" label="Host Names" width="260">
            </el-table-column>

            <el-table-column
              prop="expires_on"
              label="Expires At"
              width="180"
              :formatter="expiresTsFormatter"
            >
            </el-table-column>

            <el-table-column label="Operation">
              <template slot-scope="scope">
               <el-button
                         @click.native.prevent="viewCertContentDialog(scope.$index, scope.row)"
                         type="primary"
                         size="small"
               >
                 Detail
               </el-button>
              </template>
            </el-table-column>
          </el-table>
     </el-dialog>

     <!-- add cert dialog -->
    <el-dialog
      title="Add Cloudflare Certificate"
      :visible.sync="dialogVisibleOfAddCert"
      destroy-on-close
    >
      <el-form
        ref="certForm"
        :model="certForm"
        label-width="140px"
      >

        <el-form-item label="Name" prop="name">
          <el-input v-model="certForm.name" readonly></el-input>
        </el-form-item>

        <el-form-item label="RSAKeys">
          <el-select v-model="certForm.rsa_key_id" @change="selectCSRHandler($event)">
            <el-option
              v-for="item in RSAKeys"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="CSR Content">
              <el-input type="textarea" v-model="certForm.csr_cert" readonly :rows="8"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitAddCFCert">Confirm</el-button>
          <el-button @click="dialogVisibleOfAddCert = false">Cancel</el-button>
        </el-form-item>
      </el-form>
     </el-dialog>

    <el-dialog
      title="Certificate Content"
      :visible.sync="dialogVisibleOfCertContent"
      destroy-on-close
    >
      <div style="margin: 0 20px">
          <el-input :rows="26" type="textarea" v-model="certContent" readonly></el-input>
      </div>
    </el-dialog>

    <el-dialog
      title="Change SSL Setting"
      :visible.sync="dialogVisibleOfUpdateSSLSetting"
      destroy-on-close
    >
           <el-form
            ref="settingForm"
            :model="settingForm"
            label-width="20px"
          >
        <el-form-item>
              <el-radio v-model="settingForm.sslSetting" label="off">Off</el-radio>
        </el-form-item>

        <el-form-item >
              <el-radio v-model="settingForm.sslSetting" label="flexible">Flexible</el-radio>
        </el-form-item>

        <el-form-item>
              <el-radio v-model="settingForm.sslSetting" label="full">Full</el-radio>

        </el-form-item>

        <el-form-item>
              <el-radio v-model="settingForm.sslSetting" label="strict">Full (strict)</el-radio>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="updateSSLSettings">Confirm</el-button>
          <el-button @click="dialogVisibleOfUpdateSSLSetting = false">Cancel</el-button>
        </el-form-item>        
    
          </el-form>
    </el-dialog>


  </div>
</template>
<script>
import moment from 'moment'
import {
  getCloudProviders,
  editCloudProvider,
  checkCloudflareAPI,
  getCloudflareAccounts,
  getCloudflareZones,
  createCloudflareZone,
  getCloudflareDNSRecords,
  createCloudflareDNSRecord,
  updateCloudflareDNSRecord,
  getCloudflareCertificates,
  createCloudflareCertificate,
  getCloudflareSSLSettings,
  updateCloudflareSSLSettings,
} from "@/api/cloud_provider";
import {
  getRSAKeys,
} from "@/api/rsa_keys";
import { resetRouter } from '@/router';

export default {
  name: "Provider",
  data() {
    return {
      dialogVisible: false,
      dialogVisibleOfZone:false,
      dialogVisibleOfRecords:false,
      dialogVisibleOfAddRecord:false,
      dialogVisibleOfEditRecord:false,
      dialogVisibleOfCerts:false,
      dialogVisibleOfAddCert:false,
      dialogVisibleOfCertContent:false,
      dialogVisibleOfUpdateSSLSetting:false,

      providerConfig: {},
      zoneForm:{name:"",account:""},
      recordForm:{type:"A",name:"",content:"127.0.0.1",ttl:"1",zoneId:""},
      recordEditForm:{},
      accounts:[],
      zones:[],
      dnsRecords:[],
      certs:[],
      certForm:{zoneId:"",name:"",rsa_key_id:"", csr_cert:""},
      certContent:"",
      RSAKeys:[],
      //
      settingForm:{sslSetting:"", zoneId:0},
      //
      types: [],
      providers: [],
      rules: {
        account: [
          {
            required: true,
            message: "Please type in your account",
            trigger: "blur",
          },
        ],
        apiKey: [
          {
            required: true,
            message: "Please type in the api key of your account",
            trigger: "blur",
          },
        ],
        caKey: [
          {
            required: true,
            message: "Please type in the origin ca key of your account",
            trigger: "blur",
          },
        ],
      },
      zoneRules:{
        account: [
          {
            required: true,
            message: "Please select an account",
            trigger: 'change'
          },
        ],
        name: [
          {
            required: true,
            message: "Please type in a domain",
            trigger: "blur",
          }
        ]
      },
      recordRules:{},
      cloudConfigs: {
        vps: {
          name: "VPS",
          value: "vps",
          apiSecretVisible: false,
          addBtnVisible: true,
          providers: [{ name: "Vultr", value: "vultr" }],
        },
        cdn: {
          name: "CDN",
          value: "cdn",
          apiSecretVisible: false,
          addBtnVisible: true,
          providers: [{ name: "Cloudflare", value: "cloudflare" }],
        },
        domain: {
          name: "Domain",
          value: "domain",
          apiSecretVisible: true,
          addBtnVisible: true,
          providers: [{ name: "Godaddy", value: "godaddy" }],
        },
      },
    };
  },
  created() {
    getCloudProviders({ name: "cloudflare" }).then((response) => {
      const { data } = response;
      if (!Array.isArray(data) || data.length == 0) {
          return;
      }
      const apiConfig = JSON.parse(data[0].api_config);
      data[0].apiKey = apiConfig["api_key"];
      data[0].caKey = apiConfig["ca_key"];
      
      this.providerConfig = data[0];
      //
      checkCloudflareAPI(this.providerConfig.id)
        .then((response) => {
          //get accounts of cloudflare
          getCloudflareAccounts(this.providerConfig.id).then((response) => {
            const { data } = response;
            if (!Array.isArray(data) || data.length == 0) {
              return;
            }
            this.accounts = data;
          });
          //get zones of cloudflare
          getCloudflareZones(this.providerConfig.id).then((response) => {
            const { data } = response;
            if (!Array.isArray(data) || data.length == 0) {
              return;
            }
            //fetch zone's ssl settings 
            this.zones = this.populateSSLSettingsField(data)
            this.fetchSSLSettings()
          });
        })
        .catch((err) => {
          console.log(err);
          //this.$router.push({ path: "/" });
          return;
        });
    });
  },
  methods: {
    editProviderBtnHandler(cloudType) {
      this.types.splice(0, this.types.length);
      this.types.push(this.cloudConfigs[cloudType]);
      this.providers = this.cloudConfigs[cloudType]["providers"];
      this.dialogVisible = true;
    },
    submitAccount() {
        this.$refs['form'].validate((valid) => {
          if (!valid) {
            return false;
          }
          let putData = {
            name: this.providerConfig.name,
            type: this.providerConfig.type,
            account: this.providerConfig.account,
            cloudflare_config: {
              api_key: this.providerConfig.apiKey,
              ca_key:this.providerConfig.caKey,
              email: this.providerConfig.account,
            },
          };
          editCloudProvider(this.providerConfig.id, putData).then((response) => {
            this.$message({
              message: "Success",
              type: "success",
            });
            this.dialogVisible = false;
          });
        });
    },
    submitZone() {
        this.$refs['zoneForm'].validate((valid) => {
          if (!valid) {
            return false;
          }
          let postData = {
            "name":this.zoneForm.name,
            "account_id":this.zoneForm.account,
          }
          createCloudflareZone(this.providerConfig.id, postData).then((response) => {
            this.$message({
              message: "Success",
              type: "success",
            });
            this.dialogVisibleOfZone = false;
            let newZone = response.data
            newZone.ssl_mode = "unknown"
            this.zones.push(newZone);
            //
            this.reloadZonesUntilActive();
          });
        })
    },
    showDNSRecords(row) {
        this.recordForm.zoneId = row.id;
        this.recordForm.name = row.name;
        this.dialogVisibleOfRecords = true;
        getCloudflareDNSRecords(this.providerConfig.id, this.recordForm.zoneId).then((response) => {
            this.dnsRecords = response.data;
        });
    },
    submitAddDNSRecord() {
         let postData = this.recordForm;
         postData.ttl = parseInt(this.recordForm.ttl);
         createCloudflareDNSRecord(this.providerConfig.id, this.recordForm.zoneId, postData).then((response) => {
            this.$message({
              message: "Success",
              type: "success",
            });
            this.dialogVisibleOfAddRecord = false;
            this.dnsRecords.push(response.data);
         });
    },
    showEditRecordDialog(row) {
       this.recordEditForm = row;
       this.dialogVisibleOfEditRecord = true;
    },
    submitEditDNSRecord() {
         let patchData = {
            content:this.recordEditForm.content
         }
         updateCloudflareDNSRecord(this.providerConfig.id, this.recordEditForm.zone_id, this.recordEditForm.id, patchData).then((response) => {
            this.$message({
              message: "Success",
              type: "success",
            });
            this.dialogVisibleOfEditRecord = false;
            getCloudflareDNSRecords(this.providerConfig.id, this.recordEditForm.zone_id).then((response) => {
                this.dnsRecords = response.data;
            });
         });
    },
    showCertsDiglog(row) {
        this.dialogVisibleOfCerts = true;
        this.certForm.zoneId = row.id;
        this.certForm.name = row.name;
        getCloudflareCertificates(this.providerConfig.id, this.certForm.zoneId).then((response) => {
            this.certs = response.data;
        });
        getRSAKeys({type:1}).then((response) => {
          this.RSAKeys = response.data;
        });
    },
    selectCSRHandler(i) {
       this.RSAKeys.forEach(item => {
           if (item.id == i) {
              this.certForm.csr_cert = item.csr_cert
           }
       })
    },
    submitAddCFCert() {
        if (this.certForm.csr_cert == '') {
            this.$message.error('Please add a rsa pair with CSR at RSAKeys page!');
            return;
        }
        let postData = {
           hostnames:[this.certForm.name, "*." + this.certForm.name],
           requested_validity:365,
           request_type:"origin-rsa",
           csr: this.certForm.csr_cert,
           rsa_key_id: this.certForm.rsa_key_id
        }
        createCloudflareCertificate(this.providerConfig.id, this.certForm.zoneId,postData).then((response) => {
          this.$message({
            message: "Success",
            type: "success",
          });
          this.certs.push(response.data)
          this.dialogVisibleOfAddCert = false;
        });
    },
    viewCertContentDialog(index, row) {
       this.certContent = row.certificate;
       this.dialogVisibleOfCertContent = true;
    },
    dateFormatter(row) {
      let readable = moment(row.created_on).format('YYYY-MM-DD HH:mm:ss');
      return readable;
    },
    expiresTsFormatter(row) {
      let readable = moment.unix(row.expires_on).format('YYYY-MM-DD HH:mm:ss');
      return readable;
    },
    reloadZonesUntilActive() {
          getCloudflareZones(this.providerConfig.id).then((response) => {
            const { data } = response;
            if (!Array.isArray(data) || data.length == 0) {
                return false;
            }
            this.zones = this.populateSSLSettingsField(data)
            this.fetchSSLSettings()
            return true;
          }).then((response) => {
               if (!response) {
                   console.log("no zones yet.")
                   return
               }
               let hasPendingZone = false;
               this.zones.forEach(item => {
                     if (item.status == 'pending') {
                         hasPendingZone = true
                     }
               })
               if (hasPendingZone) {
                  //reload util all vps have main ip 
                  setTimeout(() => {this.reloadZonesUntilActive()}, 5000)
               }
          })
    },
    populateSSLSettingsField(data) {
        return data.map((item) => {
            if (!item.hasOwnProperty('ssl_mode')) {
                 item.ssl_mode = 'unknown';
                 return item
            }
            return item;
        })
    },
    fetchSSLSettings() {
        for (let i = 0; i < this.zones.length; i++) {
            let zone = this.zones[i];
            if (zone.ssl_mode != 'unknown') {
               continue
            }
            //fetch
            getCloudflareSSLSettings(this.providerConfig.id,zone.id).then((response) => {
                  let respData = response.data
                  if (respData.code != 0) {
                      return false;
                  }
                  this.zones[i].ssl_mode = respData.data.value;
            })
        }
    },
    showUpdateSSLSettingDialog(row) {
        this.dialogVisibleOfUpdateSSLSetting = true
        this.settingForm.zoneId = row.id
        this.settingForm.sslSetting = row.ssl_mode
    },
    updateSSLSettings() {
        let postData = {
            value: this.settingForm.sslSetting
        }
        //
        updateCloudflareSSLSettings(this.providerConfig.id, this.settingForm.zoneId, postData).then((response) => {
            //
            let respData = response;
            if (respData.code != 0) {
                  return
            }
            for (let i = 0; i < this.zones.length; i++) {
                  if (this.settingForm.zoneId != this.zones[i].id) {
                       continue
                  }
                  this.zones[i].ssl_mode = this.settingForm.sslSetting
            }
            this.dialogVisibleOfUpdateSSLSetting = false
        })
    },
  },
};
</script>
<style scoped>
.container {
  margin: 30px;
}

.empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 800px;
  height: 400px;
  margin: 50px auto;
  border: 1px solid #dcdfe6;
}
.api-status {
}
</style>