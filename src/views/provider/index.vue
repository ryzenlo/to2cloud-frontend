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
            <el-button type="primary">Add Instance</el-button>
          </div>
          <template v-else>
          <el-button type="primary" size="small">Add Instance</el-button>
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
                  @click.native.prevent="showInstanceDetail(scope.$index)"
                  size="small"
                >
                  Run Ansible
                </el-button>
                <el-button
                  size="small"
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
            <el-button type="primary">Add SSH Key</el-button>
          </div>
          <template v-else>
            <el-button type="primary" size="small">Add SSH Key</el-button>
          <el-table :data="sshKeys" style="width: 100%">
            <el-table-column prop="id" label="ID" width="300">
            </el-table-column>
            <el-table-column prop="name" label="Name" width="180">
            </el-table-column>
            <el-table-column label="SSH Key" width="100">
               <template slot-scope="scope">
        <el-popover trigger="hover" placement="top">
          <p>{{ scope.row.ssh_key }}</p>
          <div slot="reference">
            <el-tag size="medium">show key</el-tag>
          </div>
        </el-popover>
      </template>
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
  </div>
</template>
<script>
import moment from 'moment'
import {
  getCloudProviders,
  getVultrInstances,
  checkVultrAPI,
  editCloudProvider,
  delVultrInstance,
  getSSHKeys,
} from "@/api/cloud_provider";
export default {
  name: "Provider",
  data() {
    return {
      dialogVisible: false,
      providerConfig: {},
      vultrInstances: [],
      sshKeys:[],
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
              this.vultrInstances = JSON.parse(mockRawData);
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
          });
        });
    },
    deleteSSHKey(index,row) {
        this.$confirm('Are you sure to delete ?', 'Tip', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
            this.$message({
              message: "Under development",
              type: "success",
            });
        });
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