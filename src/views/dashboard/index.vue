<template>
  <div class="dashboard-container">
    <el-row style="margin: 20px 0">
      <el-col><span>Cloud Services</span></el-col>
    </el-row>
    <el-row type="flex" justify="space-around">
      <el-col :span="4"
        >
        <a @click.prevent="jump2detail('vps')">
        <el-card class="cloud-card"
          ><div class="cloud-type">VPS</div>
          <div class="cloud-count">
            <el-button
              v-if="cloudConfigs.vps.addBtnVisible"
              class="cloud-add-btn"
              type="primary"
              icon="el-icon-circle-plus-outline"
              size="mini"
              @click.stop="addAccount('vps')"
              >Add</el-button
            >
            <div v-else ><span >Vultr</span><i class="el-icon-info el-icon--right" style="color:white"></i></div>
          </div></el-card
        >
        </a>
        </el-col
      >
      <el-col :span="4"
        >
        <a @click.prevent="jump2detail('cdn')">
        <el-card class="cloud-card"
          ><div class="cloud-type">CDN</div>
          <div class="cloud-count">
            <el-button
              v-if="cloudConfigs.cdn.addBtnVisible"
              class="cloud-add-btn"
              type="primary"
              icon="el-icon-circle-plus-outline"
              @click.stop="addAccount('cdn')"
              size="mini"
              >Add</el-button
            >
            <div v-else ><span >Cloudflare</span><i class="el-icon-info el-icon--right" style="color:white"></i></div>
          </div></el-card
        >
        </a>
        </el-col
      >
      <el-col :span="4"
        >
        <a @click.prevent="jump2detail('domain')">
        <el-card class="cloud-card" 
          ><div class="cloud-type">Domain</div>
          <div class="cloud-count">
            <el-button
              v-if="cloudConfigs.domain.addBtnVisible"
              class="cloud-add-btn"
              type="primary"
              icon="el-icon-circle-plus-outline"
              @click.stop="addAccount('domain')"
              size="mini"
              >Add</el-button
            >
            <div v-else ><span >Godaddy</span><i class="el-icon-info el-icon--right" style="color:white"></i></div>
          </div></el-card
        >
        </a>
        </el-col
      >
    </el-row>

    <!-- dialog -->

    <el-dialog
      title="VPS - Add Account"
      :visible.sync="dialogVisible"
      destroy-on-close
    >
      <el-form ref="form" :model="account" :rules="rules" label-width="140px">
        <el-form-item label="Cloud Type">
          <el-select v-model="account.type">
            <el-option
              v-for="item in types"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Cloud Provider">
          <el-select v-model="account.name">
            <el-option
              v-for="item in providers"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Account" prop="account">
          <el-input v-model="account.account"></el-input>
        </el-form-item>

        <el-form-item label="API Key" prop="apiKey">
          <el-input v-model="account.apiKey"></el-input>
        </el-form-item>

        <el-form-item
          label="API Secret"
          prop="apiSecret"
          v-if="apiSecretVisible"
        >
          <el-input v-model="account.apiSecret"></el-input>
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
import { mapGetters } from "vuex";
import _ from "lodash";
import { getCloudProviders, addCloudProvider } from "@/api/cloud_provider";
export default {
  name: "Dashboard",
  data() {
    return {
      dialogVisible: false,
      apiSecretVisible: false,
      account: {
        name: "",
        type: "",
        account: "",
        apiKey: "",
        apiSecret: "",
      },
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
      accountData: { vps: [], cdn: [], domain: [] },
      actionLogData: [],
    };
  },
  created() {
    this.fetchCloudProviders();
  },
  methods: {
    fetchCloudProviders() {
      getCloudProviders({})
        .then((response) => {
          const { code, data } = response;
          if (code != 0) {
            return;
          }
          this.accountData["vps"].splice(0, this.accountData["vps"].length);
          this.accountData["cdn"].splice(0, this.accountData["cdn"].length);
          this.accountData["domain"].splice(
            0,
            this.accountData["domain"].length
          );

          if (Array.isArray(data) && data.length > 0) {
            data.forEach((item) => {
              if (!_.includes(["vps", "cdn", "domain"], item.type)) {
                return;
              }

              this.accountData[item.type].push(item);
            });
          }

          ["vps", "cdn", "domain"].forEach((item) => {
            if (this.accountData[item].length != 0) {
              this.cloudConfigs[item].addBtnVisible = false;
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },
    addAccount(cloudType) {
      this.resetForm();
      this.types.splice(0, this.types.length);
      this.types.push(this.cloudConfigs[cloudType]);
      this.providers = this.cloudConfigs[cloudType]["providers"];
      this.account.type = this.cloudConfigs[cloudType]["value"];
      this.account.name = this.providers[0]["value"];
      this.apiSecretVisible = this.cloudConfigs[cloudType]["apiSecretVisible"];
      this.dialogVisible = true;
    },
    resetForm() {
      this.account = {
        name: "",
        type: "",
        account: "",
        apiKey: "",
        apiSecret: "",
      };
    },
    submitAccount() {
      this.$refs["form"].validate((valid) => {
        if (!valid) {
          return false;
        }
        // this.loading = true;
        let postData = {
          name: this.account.name,
          type: this.account.type,
          account: this.account.account,
        };
        if (this.account.name == "vultr") {
          postData.vultr_config = {
            api_key: this.account.apiKey,
            ssh_key_id: "",
            ssh_private_key: "",
          };
        } else if (this.account.name == "cloudflare") {
          postData.cloudflare_config = {
            api_key: this.account.apiKey,
            email: this.account.account
          };
        } else if (this.account.name == "godaddy") {
           postData.godaddy_config = {
            api_key: this.account.apiKey,
            api_secret: this.account.apiSecret
          };
        }
        addCloudProvider(postData)
          .then((responseBody) => {
            this.$message({
              message: "Success",
              type: "success"
            });
            this.dialogVisible = false;
            this.fetchCloudProviders();
          })
          .catch((error) => {
          });
        return true;
      });
    },
    jump2detail(providerType){
        let providerPath = '/provider/' +  providerType
        console.log(providerPath)
        this.$router.push({ path: providerPath })
    }
  },
  computed: {
    ...mapGetters(["name"]),
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.cloud-card {
  height: 120px;
  background: linear-gradient(180deg, #59f3fd 0%, #24b1ba 100%);
}
.cloud-type {
  padding: 20px 20px 10 20px;
  text-align: center;
  font-size: 40px;
  margin-bottom: 10px;
  color: white;
}

.cloud-count {
  text-align: center;
  font-size: 14px;
}
.cloud-count span {
  color: white;
}
.cloud-add-btn {
  background-color: #59ccfd;
  color: white;
}
</style>
