<template>
  <div class="container">
    <div style="font-size: 20px; margin-bottom: 18px">Clouder Provider-Domain</div>
    <div v-if="providerConfig.id == undefined" class="empty-list">
      <el-button type="primary">Add Account</el-button>
    </div>
    <template v-else>
      <div style="margin-bottom: 18px">
        <el-button icon="el-icon-setting" @click="editProviderBtnHandler('domain')"
          >Godaddy</el-button
        >

        <el-table :data="domains" style="width: 100%">
            
            <el-table-column prop="domainId" label="ID" width="120">
            </el-table-column>

            <el-table-column prop="domain" label="Domain" width="180">
            </el-table-column>

            <el-table-column prop="status" label="Status" width="180">
            </el-table-column>

            <el-table-column
              prop="expires"
              label="Expires"
              width="180"
              :formatter="dateFormatter"
            >
            </el-table-column>

            <el-table-column
              prop="createdAt"
              label="Created At"
              width="200"
              :formatter="dateFormatter"
            >
            </el-table-column>

            <el-table-column label="Operation">
              <template slot-scope="scope">
                <el-button
                  @click.native.prevent="showEditDomainDialog(scope.row)"
                  size="small"
                >
                  Transfer
                </el-button>
              </template>
            </el-table-column>

        </el-table> 

  
    </div>

    </template>

    <!-- dialog -->
    <el-dialog
      title="Domain - Edit Account"
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

        <el-form-item label="API Secret" prop="apiSecret">
          <el-input v-model="providerConfig.apiSecret"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitAccount">Confirm</el-button>
          <el-button @click="dialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- add zone dialog -->
    <el-dialog
      title="Edit Domain"
      :visible.sync="dialogVisibleEditDialog"
      destroy-on-close
    >
      <el-form
        ref="domainForm"
        :model="domainForm"
        label-width="140px"
      >
        <el-form-item label="Domain" prop="domain">
          <el-input v-model="domainForm.domain" readonly></el-input>
        </el-form-item>

        <el-form-item label="Name Server 1" prop="nameServer0">
          <el-input v-model="domainForm.nameServer0"></el-input>
        </el-form-item>

        <el-form-item label="Name Server 2" prop="nameServer1">
          <el-input v-model="domainForm.nameServer1"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitEditDomain">Confirm</el-button>
          <el-button @click="dialogVisibleEditDialog = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>
<script>
import moment from 'moment';
import {
  getCloudProviders,
  getGodaddyDomains,
  checkGodaddyAPI,
  editCloudProvider,
  editGodaddyDomain
} from "@/api/cloud_provider";

export default {
  name: "Provider",
  data() {
    return {
      dialogVisible: false,
      dialogVisibleEditDialog:false,

      providerConfig: {},
      domains:[],
      domainForm:{},
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
    getCloudProviders({ name: "godaddy" }).then((response) => {
      const { data } = response;
      if (!Array.isArray(data) || data.length == 0) {
          return;
      }
      data[0].apiKey = '';
      data[0].apiSecret = '';
      if (data[0].api_config != "") {
          const apiConfig = JSON.parse(data[0].api_config);
          data[0].apiKey = apiConfig["api_key"];
          data[0].apiSecret = apiConfig["api_secret"];
      }
      
      this.providerConfig = data[0];
      //get domain list
      checkGodaddyAPI(this.providerConfig.id)
        .then((response) => {
          //get domain list
          getGodaddyDomains(this.providerConfig.id).then((response) => {
            const { data } = response;
            if (!Array.isArray(data) || data.length == 0) {
              return;
            }
            this.domains = data;
          });
        })
        .catch((err) => {
          console.log(err)
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
    dateFormatter(row, column, cellValue, index) {
      let readable = moment(cellValue).format('YYYY-MM-DD HH:mm:ss');
      return readable;
    },
    showEditDomainDialog(row) {
      this.domainForm = row;
      this.domainForm.nameServer0 = "hugh.ns.cloudflare.com";
      this.domainForm.nameServer1 = "nina.ns.cloudflare.com";
      if (row.nameServers !== undefined && Array.isArray(this.domainForm) && this.domainForm.length > 0) {
          if (this.domainForm.length == 1) {
              this.domainForm.nameServer0 = this.domainForm.nameServers[0];
          }
          if (this.domainForm.length == 2) {
              this.domainForm.nameServer1 = this.domainForm.nameServers[1];
          }
      }
      this.dialogVisibleEditDialog = true;
    },
    submitEditDomain() {
        //
        let nameServers = [];
        if (this.domainForm.nameServer0 != '') {
             nameServers.push(this.domainForm.nameServer0)
        }
        if (this.domainForm.nameServer1 != '') {
             nameServers.push(this.domainForm.nameServer1)
        }
        if (nameServers.length == 0) {
             this.$message({
               message: "Please type in at least one name server.",
               type: "error",
             });
             return;
        }
        let patchData = {
          nameServers: nameServers,
        };
        editGodaddyDomain(this.providerConfig.id, this.domainForm.domain, patchData).then((response) => {
          this.$message({
            message: "Success",
            type: "success",
          });
          this.dialogVisibleEditDialog = false;
        });
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
            godaddy_config: {
              api_key: this.providerConfig.apiKey,
              api_secret:this.providerConfig.apiSecret,
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