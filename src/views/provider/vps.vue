<template>
  <div class="container">
    <div style="font-size: 20px; margin-bottom: 18px">Clouder Provider-VPS</div>
    <div v-if="providerConfig.id == undefined" class="empty-list">
      <el-button type="primary">Add Account</el-button>
    </div>
    <template v-else>
      <div style="margin-bottom: 18px">
        <el-button icon="el-icon-setting" @click="editProviderBtnHandler('vps')"
          >Vultr</el-button
        >
      </div>
      <el-tabs type="border-card">
        <el-tab-pane label="Instances">
          <div v-if="vultrInstances.length == 0" class="empty-list">
            <el-button type="primary" @click="showAddInstanceDialog">Add Instance</el-button>
          </div>
          <template v-else>
          <el-button type="primary" size="small" @click="showAddInstanceDialog">Add Instance</el-button>
          <el-table :data="vultrInstances" style="width: 100%">
            <el-table-column prop="id" label="ID" width="300">
            </el-table-column>
            <el-table-column prop="main_ip" label="IP" width="180">
            </el-table-column>
            <el-table-column prop="status" label="Status" width="180">
            </el-table-column>
            <el-table-column
              prop="power_status"
              label="Power Status"
              width="180"
            >
            </el-table-column>

            <el-table-column
              prop="date_created"
              label="Created At"
              width="200"
              :formatter="dateFormatter"
            >
            </el-table-column>

            <el-table-column label="Operation">
              <template slot-scope="scope">
                <el-button
                  @click.native.prevent="showAnsibleRunDialog(scope.$index, scope.row)"
                  size="small"
                >
                  Ansible Playbook
                </el-button>
                <el-button
                  size="small"
                   @click.native.prevent="showSetupCDNDialog(scope.$index,scope.row)"
                >
                  Setup CDN
                </el-button>
                <el-button
                  @click.native.prevent="deleteInstance(scope.$index,scope.row)"
                  type="danger"
                  size="small"
                >
                  Delete
                </el-button>
              </template>
            </el-table-column>

          </el-table>
          </template>
        </el-tab-pane>
        <el-tab-pane label="SSH Keys">
          <div v-if="sshKeys.length == 0" class="empty-list">
            <el-button type="primary" @click="showAddSSHKeydDialog">Add SSH Key</el-button>
          </div>
          <template v-else>
            <el-button type="primary" size="small" @click="showAddSSHKeydDialog">Add SSH Key</el-button>
          <el-table :data="sshKeys" style="width: 100%">
            <el-table-column prop="id" label="ID" width="300">
            </el-table-column>
            <el-table-column prop="name" label="Name" width="180">
            </el-table-column>
            <el-table-column
              prop="date_created"
              label="Created At"
              width="200"
              :formatter="dateFormatter"
            >
            </el-table-column>

            <el-table-column label="Operation">
              <template slot-scope="scope">
               <el-button
                         @click.native.prevent="deleteSSHKey(scope.$index,scope.row)"
                         type="danger"
                         size="small"
               >
                 Delete
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
      title="VPS - Add Account"
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

        <el-form-item>
          <el-button type="primary" @click="submitAccount">Confirm</el-button>
          <el-button @click="dialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

<el-dialog
      title="Add Instance"
      :visible.sync="dialogOfAddInstance"
      destroy-on-close
    >
      <el-form
        ref="instanceForm"
        :model="instanceForm"
        label-width="140px"
      >

        <el-form-item label="OS">
          <el-select v-model="instanceForm.os_id">
            <el-option
              v-for="item in OSs"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Plan">
          <el-select v-model="instanceForm.plan">
            <el-option
              v-for="item in plans"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item> 

        <el-form-item label="Region">
          <el-select v-model="instanceForm.region">
            <el-option
              v-for="item in regions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="RSA Key(SSH)">
          <el-select v-model="instanceForm.rsa_key_id">
            <el-option
              v-for="item in RSAKeys4SSH"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>  

        <el-form-item>
          <el-button type="primary" @click="submitAddInstance">Confirm</el-button>
          <el-button @click="dialogOfAddInstance = false">Cancel</el-button>
        </el-form-item>
      </el-form>
</el-dialog>


    <el-dialog
      title="Setup CDN"
      :visible.sync="dialogOfSetupCDN"
      destroy-on-close
    >
     <el-row type="flex" justify="space-around" v-if="showZone">
      <el-col :span="8">
         <el-card
         v-for="item in cloudflareZones"
         :key="item.id"
         >
          <div>
              <el-button type="text" @click.native.prevent="getZoneCDNRecords(item)">{{item.name}}</el-button>
           </div>
         </el-card>
      </el-col>
     </el-row>

     <el-row type="flex" justify="space-around" v-else>
      <el-col :span="24">
        <el-table
           :data="zoneDNSData"
           highlight-current-row
           @current-change="zoneDNSSelectHandler"
           style="width: 100%">
          <el-table-column
             type="index"
             width="50">
           </el-table-column>
           <el-table-column
             prop="name"
             label="Name"
             >
           </el-table-column>
           <el-table-column
             prop="content"
             label="Current IP"
            >
           </el-table-column>
         </el-table>
      </el-col>
     </el-row>

      <div style="margin-top:20px" v-if="showBtn">
        <el-button type="primary" @click="submitSetupCDN">Confirm</el-button>
        <el-button @click="dialogOfSetupCDN = false">Cancel</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="Add SSH Key"
      :visible.sync="dialogOfAddSSHKey"
      destroy-on-close
    >
      <el-row type="flex" justify="space-around" >
      <el-col :span="24">
        <el-table
           :data="localRSAKeys"
           highlight-current-row
           @current-change="sshKeySelectHandler"
           style="width: 100%">
          <el-table-column
             prop="id"
             label="ID"
             width="50">
           </el-table-column>
           <el-table-column
             prop="name"
             label="Name"
             >
           </el-table-column>

           <el-table-column
             prop="created_at"
             label="Created At"
             :formatter="timestampFormatter"
             >
           </el-table-column>

         </el-table>
      </el-col>
     </el-row>
     <div style="margin-top:20px">
        <el-button type="primary" @click="submitAddSSHKey">Confirm</el-button>
        <el-button @click="dialogOfAddSSHKey = false">Cancel</el-button>
      </div>
    </el-dialog>
    <ansible-run-panel :vultrCloudProvider="providerConfig" :vultrInstance="vultrInstanceOfAnsible" :RSAKeys="localRSAKeys" v-if="dialogOfRunAnsible" v-on:closeAnsibleRunPanel="closeAnsibleRunPanel"></ansible-run-panel>
  </div>
</template>
<script>
import moment from 'moment'
import {
  getCloudProviders,
  getVultrInstances,
  updateVultrInstance,
  checkVultrAPI,
  editCloudProvider,
  createVultrInstance,
  delVultrInstance,
  getSSHKeys,
  addSSHKey,
  delSSHKey,
  checkCloudflareAPI,
  getCloudflareZones,
  getCloudflareDNSRecords,
  updateCloudflareDNSRecord,
} from "@/api/cloud_provider";
import { getRSAKeys } from "@/api/rsa_keys";
import AnsibleRunPanel from "./ansible-run-diglog.vue"
export default {
  name: "Provider",
  components:{
     AnsibleRunPanel,
  },
  data() {
    return {
      dialogVisible: false,
      dialogOfSetupCDN:false,
      dialogOfAddSSHKey:false,
      dialogOfAddInstance:false,
      dialogOfRunAnsible:false,
      showBtn:false,
      showZone:true,
      providerConfig: {},
      ProviderConfigOfCDN:{},
      vultrInstances: [],
      cloudflareZones:[],
      //
      instanceForm:{rsa_key_id:"",os_id:387,plan:"vc2-1c-1gb",region:"lax",installed_by:"os_id"},
      OSs:[{id:387,name:"ubuntu_20.04"}],
      plans:[{id:"vc2-1c-1gb",name:"Cloud Compute-CPU(1)-Memory(1GB)"}],
      regions:[{id:"lax",name:"Los Angeles"}],
      //
      zoneDNSData:[],
      zoneSelected:null,
      sshKeys:[],
      localRSAKeys:[],
      RSAKeys4SSH:[],
      localRSAKeySelected:null,
      zoneDNSRow:null,
      instanceSelected:null,
      vultrInstanceOfAnsible:null,
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
        apiSecret: [
          {
            required: true,
            message: "Please type in the api secret of your account",
            trigger: "blur",
          },
        ],
      },
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
    getCloudProviders({ name: "vultr" }).then((response) => {
      const { data } = response;
      if (!Array.isArray(data) || data.length == 0) {
        return;
      }
      const apiConfig = JSON.parse(data[0].api_config);
      data[0].apiKey = apiConfig["api_key"];
      this.providerConfig = data[0];
      checkVultrAPI(this.providerConfig.id)
        .then((response) => {
          //get the list of vultr instances
          getVultrInstances(this.providerConfig.id).then((response) => {
            const { data } = response;
            if (!Array.isArray(data) || data.length == 0) {
              this.vultrInstances = this.getMockInstance();
              return;
            }
            this.vultrInstances = data;
          });
          //get the list of vultr instances
          getSSHKeys(this.providerConfig.id).then((response) => {
            const { data } = response;
            if (!Array.isArray(data) || data.length == 0) {
              this.sshKeys = [];
              return;
            }
            this.sshKeys = data;
          });

        })
        .catch((err) => {
          //this.$router.push({ path: "/" });
          return;
        });
    });
    //
    getCloudProviders({ name: "cloudflare" }).then((response) => {
      const { data } = response;
      if (!Array.isArray(data) || data.length == 0) {
          return;
      }      
      this.ProviderConfigOfCDN = data[0];
      //
      checkCloudflareAPI(this.ProviderConfigOfCDN.id)
        .then((response) => {
          //get zones of cloudflare
          getCloudflareZones(this.ProviderConfigOfCDN.id).then((response) => {
            const { data } = response;
            if (!Array.isArray(data) || data.length == 0) {
              return;
            }
            this.cloudflareZones = data;
            for (let i = 0; i < this.cloudflareZones.length; i++) {
                getCloudflareDNSRecords(this.ProviderConfigOfCDN.id, this.cloudflareZones[i].id).then((response) => {
                   this.cloudflareZones[i].dnsRecords = response.data;
                });
            }
          });
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    });
    //
    getRSAKeys({type:0}).then((response) => {
           this.localRSAKeys = response.data
           this.RSAKeys4SSH = this.localRSAKeys.filter(item => item.type == 0)
    })
  },
  methods: {
    editProviderBtnHandler(cloudType) {
      this.types.splice(0, this.types.length);
      this.types.push(this.cloudConfigs[cloudType]);
      this.providers = this.cloudConfigs[cloudType]["providers"];
      this.dialogVisible = true;
    },
    submitAccount() {
      let putData = {
        name: this.providerConfig.name,
        type: this.providerConfig.type,
        account: this.providerConfig.account,
        vultr_config: {
          api_key: this.providerConfig.apiKey,
          ssh_key_id: "",
          ssh_private_key: "",
        },
      };
      editCloudProvider(this.providerConfig.id, putData).then((response) => {
        this.$message({
          message: "Success",
          type: "success",
        });
        this.dialogVisible = false;
      });
    },
    dateFormatter(row) {
      let readable = moment(row.date_created).format('YYYY-MM-DD HH:mm:ss');
      return readable;
    },
    showAddInstanceDialog() {
      this.dialogOfAddInstance = true;
      this.instanceForm.rsa_key_id = "";
    },
    submitAddInstance() {
        if (this.instanceForm.rsa_key_id == "") {
            this.$message({
              message: "Please select a SSH Key",
              type: "warning",
            });
            return;
        }
        let postData = this.instanceForm;
        createVultrInstance(this.providerConfig.id, postData).then((response) => {
            this.$message({
              message: "Success",
              type: "success",
            });
            this.dialogOfAddInstance = false;
            this.vultrInstances.push(response.data);
            //add timer to reload instance list
            this.reloadVPSUtilIPIsReady()
        });
    },
    deleteInstance(index, row) {
        this.$confirm('Are you sure to delete ?', 'Tip', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          delVultrInstance(this.providerConfig.id, row.id).then((response) => {
            this.$message({
              message: "Success",
              type: "success",
            });
            this.vultrInstances = this.vultrInstances.filter( item => item.id !== row.id)
          });
        });
    },
    showAddSSHKeydDialog() {
      this.dialogOfAddSSHKey = true;
      this.localRSAKeySelected = null;
    },
    timestampFormatter(row) {
      let readable = moment.unix(row.created_at).format('YYYY-MM-DD HH:mm:ss');
      return readable;
    },
    sshKeySelectHandler(val) {
      this.localRSAKeySelected = val;
    },
    submitAddSSHKey() {
      if (this.localRSAKeys.length > 1 && this.localRSAKeySelected == null) {
          this.$message('Please select a SHH Key pair');
          return;
      }
      if (this.localRSAKeys.length == 1 && this.localRSAKeySelected == null) {
           this.localRSAKeySelected = this.localRSAKeys[0];
      }
      let postData = {
         rsa_key_id:this.localRSAKeySelected.id
      }
      addSSHKey(this.providerConfig.id, postData).then((response) => {
         this.$message({
          message: "Success",
          type: "success",
         });
         this.dialogOfAddSSHKey = false;
         this.sshKeys.push(response.data);
      });
    },
    deleteSSHKey(index,row) {
        this.$confirm('Are you sure to delete ?', 'Tip', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
           delSSHKey(this.providerConfig.id, row.id).then((response) => {
            this.sshKeys = this.sshKeys.filter(item => item.id !== row.id)
            this.$message({
              message: "Success",
              type: "success",
            });
           })
        });
    },
    showSetupCDNDialog(index,row) {
       this.dialogOfSetupCDN = true;
       this.showBtn = false;
       this.showZone = true;
       this.instanceSelected = row;
       this.zoneSelected = null;
       this.zoneDNSRow = null;
    },
    getZoneCDNRecords(row) {
       this.showBtn = true;
       this.showZone = false;
       this.zoneSelected = row;
       this.zoneDNSData = row.dnsRecords;
    },
    zoneDNSSelectHandler(val) {
       this.zoneDNSRow = val;
    },
    submitSetupCDN() {
      if (this.zoneDNSData.length > 1 && this.zoneDNSRow == null) {
          this.$message('Please select a DNS record');
          return;
      }
      if (this.zoneDNSData.length == 1 && this.zoneDNSRow == null) {
           this.zoneDNSRow = this.zoneDNSData[0];
      }
      let patchData = {
          content:this.instanceSelected.main_ip,
          proxied:true,
      }
      updateCloudflareDNSRecord(this.ProviderConfigOfCDN.id, this.zoneSelected.id, this.zoneDNSRow.id, patchData).then((response) => {
         this.$message({
           message: "Success",
           type: "success",
         });
         this.dialogOfSetupCDN = false;
         this.updateLocalZoneDNSRecords(this.zoneSelected);
         let patchData = {
            label:this.zoneSelected.name,
            cdn_info:{
              cloud_provider_id:this.ProviderConfigOfCDN.id,
              zone_id:this.zoneSelected.id,
              dns_record_id:this.zoneDNSRow.id,
              domain:this.zoneSelected.name
            }
         }
         updateVultrInstance(this.providerConfig.id, this.instanceSelected.id, patchData);
      });
    },
    updateLocalZoneDNSRecords(zone) {
        for (let i = 0; i < this.cloudflareZones.length; i++) {
            if (this.cloudflareZones[i].id != zone.id) {
                continue;
            }
            getCloudflareDNSRecords(this.ProviderConfigOfCDN.id, this.cloudflareZones[i].id).then((response) => {
                this.cloudflareZones[i].dnsRecords = response.data;
            });
        }
    },
    showAnsibleRunDialog(index,row){
       this.dialogOfRunAnsible = true;
       this.vultrInstanceOfAnsible = row;
    },
    closeAnsibleRunPanel() {
       this.dialogOfRunAnsible = false;
    },
    reloadVPSUtilIPIsReady() {
          getVultrInstances(this.providerConfig.id).then((response) => {
            const { data } = response;
            if (!Array.isArray(data) || data.length == 0) {
              return false;
            }
            this.vultrInstances = data;
            return true
          }).then((response) => {
               if (!response) {
                   console.log("no vps yet.")
                   return
               }
               let hasUnAssignIPVps = false;
               this.vultrInstances.forEach(item => {
                     if (item.main_ip == '0.0.0.0') {
                         hasUnAssignIPVps = true
                     }
               })
               if (hasUnAssignIPVps) {
                  //reload util all vps have main ip 
                  setTimeout(() => {this.reloadVPSUtilIPIsReady()}, 5000)
               }
          });
    },
    getMockInstance() {
                    const mockRawData = `[
    {
      "id": "cb676a46-66fd-4dfb-b839-443f2e6c0b60",
      "os": "CentOS SELinux 8 x64",
      "ram": 2048,
      "disk": 55,
      "main_ip": "192.0.2.123",
      "vcpu_count": 1,
      "region": "atl",
      "plan": "vc2-6c-16gb",
      "date_created": "2020-10-10T01:56:20+00:00",
      "status": "active",
      "allowed_bandwidth": 2000,
      "netmask_v4": "255.255.252.0",
      "gateway_v4": "192.0.2.1",
      "power_status": "running",
      "server_status": "ok",
      "v6_network": "2001:0db8:1112:18fb::",
      "v6_main_ip": "2001:0db8:1112:18fb:0200:00ff:fe00:0000",
      "v6_network_size": 64,
      "label": "Example Instance",
      "internal_ip": "",
      "kvm": "https://my.vultr.com/subs/vps/novnc/api.php?data=00example11223344",
      "hostname": "my_hostname",
      "os_id": 215,
      "app_id": 0,
      "image_id": "",
      "firewall_group_id": "",
      "features": [
        "ddos_protection",
        "ipv6",
        "auto_backups"
      ],
      "tags": [
        "a tag",
        "another"
      ]
    }
  ]
`;

              return  JSON.parse(mockRawData);
    }
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